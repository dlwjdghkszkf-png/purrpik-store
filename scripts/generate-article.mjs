#!/usr/bin/env node
/**
 * 매거진 기사 $0 자동 생성기 v2 — demand-driven + 3층 검증 + GEO + codex 이미지.
 *
 * 파이프라인:
 *   1. 코퍼스 backlog(빈도순 실제 질문)에서 다음 미작성 주제 선택
 *   2. raw JSON에서 그 주제 근거(snippet+url) 추출 = 1차 근거
 *   3. claude CLI(OAuth $0)로 GEO 최적화 오리지널 기사 생성 (팩트만, 복붙 금지)
 *   4. claude 2차 검증 패스 (출처/주장 점검 → PR에 검증 리포트 첨부)
 *   5. codex image_gen($0)으로 주제 맞춤 hero 이미지 → public/articles/
 *   6. git worktree 브랜치 → gh PR (감수 필요 주제는 [감수필요] 라벨)
 *
 * 비용 0 (claude/codex 둘 다 OAuth). API 키·PAT 불필요.
 *
 * 수동: node scripts/generate-article.mjs            (backlog 다음 주제)
 *       node scripts/generate-article.mjs --dry       (생성만, PR/이미지 없이 stdout)
 *       node scripts/generate-article.mjs --no-image  (이미지 생략)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CORPUS_DIR = "/Users/ljh/Documents/자동화 프로그램/공통 인프라/data/cat_faq";
const CLAUDE = process.env.CLAUDE_BIN || "claude";
const CODEX = process.env.CODEX_BIN || "codex";
const MODEL = "sonnet";

// backlog 카테고리 → purrpik 카테고리.
const CATEGORY_MAP = {
  입양_적응: "adoption-guide",
  건강: "health",
  사료: "nutrition",
  영양: "nutrition",
  용품_환경: "street-care",
  행동: "street-care",
  기타: "street-care",
};

const CATEGORIES = {
  "adoption-guide": "입양 가이드",
  "street-care": "길고양이 케어",
  "global-care": "해외 사례",
  nutrition: "영양·간식",
  health: "건강·질병",
};

function log(m) { console.log(`[${new Date().toISOString()}] ${m}`); }
function todayStr() {
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

// ── 1. backlog 파싱 (🟢 바로제작 + 🟡 감수필요, 빈도순) ──────────────
function parseBacklog() {
  const md = readFileSync(path.join(CORPUS_DIR, "backlog_latest.md"), "utf8");
  const rows = [];
  let vetSection = false;
  for (const line of md.split("\n")) {
    // 🟡 섹션 헤딩에서만 전환 (헤더의 "수의사 감수" 안내 문구 오인 방지).
    if (line.startsWith("##") && line.includes("감수")) vetSection = true;
    const m = line.match(/^\|\s*(\d+)\s*\|\s*(.+?)\s*\|\s*(\d+)\s*\|(.+)$/);
    if (!m) continue;
    const question = m[2].trim();
    if (question === "표준 질문" || !question) continue;
    const freq = parseInt(m[3], 10);
    const rest = m[4].split("|").map((s) => s.trim());
    // 🟢: 소스 | 카테고리 | 포맷 | 앵글   🟡: 카테고리 | 포맷 | 감수포인트
    const catRaw = vetSection ? rest[0] : rest[1];
    rows.push({
      question,
      freq,
      category: CATEGORY_MAP[catRaw] || "street-care",
      needsVet: vetSection,
    });
  }
  return rows.sort((a, b) => b.freq - a.freq);
}

// 이미 작성된 질문(frontmatter source_backlog) 수집.
function writtenQuestions() {
  const done = new Set();
  const root = path.join(REPO, "content", "articles");
  if (!existsSync(root)) return done;
  for (const cat of readdirSync(root)) {
    const dir = path.join(root, cat);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".mdx")) continue;
      const m = readFileSync(path.join(dir, f), "utf8").match(/source_backlog:\s*(.+)/);
      if (m) done.add(m[1].replace(/^["']|["']$/g, "").trim());
    }
  }
  return done;
}

// ── 2. raw JSON에서 주제 근거 추출 ────────────────────────────────
function gatherEvidence(question) {
  const files = readdirSync(CORPUS_DIR).filter((f) => f.startsWith("raw_") && f.endsWith(".json"));
  const items = [];
  for (const f of files) {
    try { items.push(...JSON.parse(readFileSync(path.join(CORPUS_DIR, f), "utf8"))); } catch {}
  }
  // 질문 토큰(2자+)으로 스코어링.
  const tokens = question.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter((t) => t.length >= 2);
  const scored = items.map((it) => {
    const hay = `${it.title || ""} ${it.snippet || ""} ${it.seed_keyword || ""}`;
    const score = tokens.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
    return { it, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 15);
  return scored.map((x) => x.it);
}

// ── 출처 도메인 게이트 (결정적) ───────────────────────────────────
// LLM 지시("블로그 금지")만으론 근거 스니펫의 블로그 URL이 sources로 새어듦.
// → 코드에서 화이트리스트 도메인만 통과시키고 나머지는 제거(폴백 주입).
const SOURCE_ALLOW = [
  /(^|\.)go\.kr$/i,        // 정부·지자체
  /(^|\.)or\.kr$/i,        // 협회·공공기관 (kaha.or.kr 등)
  /(^|\.)ac\.kr$/i,        // 대학
  /(^|\.)catvets\.com$/i,  // AAFP
  /(^|\.)icatcare\.org$/i, // International Cat Care
  /(^|\.)wsava\.org$/i,
  /(^|\.)avma\.org$/i,
  /(^|\.)aspca\.org$/i,
  /(^|\.)rspca\.org\.uk$/i,
  /(^|\.)merckvetmanual\.com$/i,
  /(^|\.)fabcats\.org$/i,
  /(^|\.)cornell\.edu$/i,
];
// 명시 차단(이중 안전): 블로그·카페·지식인·위키·SNS·커뮤니티 UGC.
const SOURCE_BLOCK =
  /(blog\.|cafe\.|kin\.naver|tistory|brunch|velog|medium\.com|wordpress|blogspot|youtu|instagram|facebook|threads\.net|twitter|x\.com|namu\.wiki|wikipedia|dcinside|fmkorea|clien|ppomppu|daum\.net\/board|band\.us)/i;

function hostOf(url) {
  try { return new URL(url).host.toLowerCase(); } catch { return ""; }
}
function isOfficialSource(url) {
  const h = hostOf(url);
  if (!h) return false;
  if (SOURCE_BLOCK.test(url)) return false;
  return SOURCE_ALLOW.some((re) => re.test(h));
}

// 전부 걸러져 0건이 되면 카테고리별 공식 출처를 주입 (기사에 출처 0개 방지).
const FALLBACK_SOURCES = {
  "adoption-guide": [
    { title: "동물보호관리시스템 — 유실·유기동물 안내", url: "https://www.animal.go.kr", publisher: "농림축산검역본부" },
    { title: "동물보호법", url: "https://www.law.go.kr", publisher: "국가법령정보센터" },
  ],
  "street-care": [
    { title: "길고양이 중성화(TNR) 사업 안내", url: "https://www.animal.go.kr", publisher: "농림축산검역본부" },
    { title: "동물보호법", url: "https://www.law.go.kr", publisher: "국가법령정보센터" },
  ],
  "global-care": [
    { title: "International Cat Care — Community Cats", url: "https://icatcare.org", publisher: "International Cat Care" },
  ],
  health: [
    { title: "한국동물병원협회", url: "https://www.kaha.or.kr", publisher: "한국동물병원협회" },
    { title: "AAFP Feline Practice Guidelines", url: "https://catvets.com/guidelines/practice-guidelines", publisher: "American Association of Feline Practitioners" },
  ],
  nutrition: [
    { title: "한국동물병원협회 — 반려동물 영양", url: "https://www.kaha.or.kr", publisher: "한국동물병원협회" },
    { title: "WSAVA Global Nutrition Guidelines", url: "https://wsava.org/global-guidelines/global-nutrition-guidelines/", publisher: "WSAVA" },
  ],
};

function sanitizeSources(sources, category) {
  const kept = [], dropped = [];
  for (const s of sources || []) {
    if (s?.url && isOfficialSource(s.url)) kept.push(s);
    else dropped.push(s?.url || JSON.stringify(s));
  }
  let injected = false;
  if (kept.length === 0) {
    kept.push(...(FALLBACK_SOURCES[category] || FALLBACK_SOURCES["street-care"]));
    injected = true;
  }
  return { sources: kept, dropped, injected };
}

// ── 3. 생성 프롬프트 (GEO + 근거 + 저작권 안전) ────────────────────
function buildPrompt(topic, evidence) {
  const catLabel = CATEGORIES[topic.category];
  const ev = evidence.map((e, i) => `[${i + 1}] (${e.source}) ${e.title}\n    ${(e.snippet || "").slice(0, 200)}\n    ${e.url}`).join("\n");
  const vetNote = topic.needsVet
    ? `\n# ⚠️ 의료 주의\n이 주제는 진단·치료성 내용이라 수의사 감수 대상입니다. 단정적 진단·처방 금지. "수의사 상담 권장"을 명시하고, 응급/위험 신호 위주로 안내. 본문 맨 앞에 "이 글은 일반 정보이며 진료를 대체하지 않습니다" 안내를 넣으세요.`
    : "";
  return `당신은 한국 길고양이 케어 브랜드 "푸르픽 PURRPIK"의 콘텐츠 에디터입니다.
아래 "핵심 질문"에 답하는 매거진 기사를 작성합니다. 이 질문은 실제 커뮤니티에서 ${topic.freq}회 나온 고빈도 질문입니다.

# 핵심 질문
${topic.question}

# 카테고리
${catLabel}
${vetNote}

# 참고 근거 (실제 커뮤니티/지식인 수집 — 사실 파악용, 절대 문장 복붙 금지)
${ev || "(근거 부족 — 일반적 정론 + 권위 기관 자료로 작성)"}

# 저작권·정확성 규칙 (필수)
1. 위 근거는 "무슨 질문·사실이 오가는지" 파악용. 문장을 그대로 옮기지 말고 100% 새로 씁니다 (팩트는 저작권 없음, 표현은 보호됨).
2. 출처(sources) 도메인 화이트리스트 — **아래에 해당하는 URL만 sources에 넣습니다**:
   - 정부·지자체: **.go.kr** (animal.go.kr 동물보호관리시스템, law.go.kr 국가법령정보센터, mafra.go.kr 농림축산식품부, qia.go.kr 검역본부 등)
   - 협회·학회: **.or.kr** (kaha.or.kr 한국동물병원협회 등), 국제: catvets.com(AAFP), icatcare.org, wsava.org, avma.org, aspca.org, rspca.org.uk, merckvetmanual.com
   - 대학: **.ac.kr**
   🚫 **절대 금지 도메인** (하나라도 sources에 넣으면 규칙 위반·기사 폐기): blog.naver.com, cafe.naver.com, kin.naver.com(지식인), tistory, brunch, velog, youtube, instagram, 나무위키/위키백과, 디시·펨코·클리앙 등 모든 개인블로그·카페·SNS·커뮤니티. (위 "참고 근거"는 질문 파악용일 뿐 출처가 아님 — 절대 sources로 옮기지 마세요.)
   - 확실한 공식 출처를 못 찾으면 sources에 animal.go.kr, law.go.kr, kaha.or.kr 같은 대표 공식기관만 최소로 넣습니다. 지어내기 금지.
2b. 지역·기관별 편차가 있는 사실(지자체 지원, 신고 절차, 소방 대응 등)은 "일부/다수 지자체" "지역에 따라 다름" 단서를 반드시 붙이고 전국 일괄 단정 금지.
3. 실재하지 않는 출처·URL·수치를 지어내지 마세요. 확실치 않으면 "일반적으로" 수준으로만.
4. 효능·효과 단정(치료/완치/99%) 금지 — 식약처 가이드.

# GEO 최적화 규칙 (필수 — 이 기사의 목적은 LLM/AI 검색 인용)
1. 각 H2 섹션 첫 문장 = 자립형 답변 블록: 결론/정의를 먼저 40~60자 안에, 이어 근거·수치.
2. 질문형 H2 헤딩 사용 (사람들이 실제 검색하는 형태).
3. 최소 1개 비교표(Markdown table).
4. 구체 수치·단계·기준을 명시 (추상적 서술 금지).
5. FAQ 3개 — 각 답변은 독립적으로 인용 가능하게 완결.
6. 본문에 푸르픽 관련 페이지(/cat, /care-guide, /articles) 1~2회 자연스럽게.

# 분량·구조
- 1,800~2,600자, H2 5~7개(각 200~400자), 마지막 "참고 자료" 섹션.

# 출력 (이 JSON만, 다른 텍스트 금지)
\`\`\`json
{
  "title": "제목 (질문에 답하는 형태, 50자 이내)",
  "excerpt": "요약 (120자 이내)",
  "tags": ["태그","태그","태그","태그","태그"],
  "sources": [{ "title": "출처명", "url": "https://...", "publisher": "발행처" }],
  "faq": [{ "question": "...", "answer": "..." }],
  "image_prompt": "hero 이미지용 영문 묘사 (photorealistic, 16:9, 텍스트 없음, 한국 가정/실외 맥락, 기사 주제 반영)",
  "body": "# 본문 (H2부터, Markdown)"
}
\`\`\``;
}

function claudeRun(prompt) {
  return execFileSync(CLAUDE, ["-p", "--model", MODEL], {
    input: prompt, cwd: REPO, encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024, timeout: 6 * 60 * 1000,
  });
}

function parseDraft(raw) {
  const m = raw.match(/```json\s*([\s\S]+?)\s*```/) ?? raw.match(/\{[\s\S]+\}/);
  if (!m) throw new Error("초안 JSON 파싱 실패");
  const d = JSON.parse(m[1] ?? m[0]);
  for (const k of ["title", "excerpt", "tags", "sources", "faq", "body"]) {
    if (!d[k]) throw new Error(`초안 ${k} 누락`);
  }
  return d;
}

// ── 4. 2차 검증 패스 (출처/주장 점검 → 리포트) ─────────────────────
function verifyDraft(topic, draft) {
  const prompt = `당신은 팩트체커입니다. 아래 길고양이 기사 초안의 정확성을 점검하세요.

# 질문
${topic.question}

# 인용된 출처
${draft.sources.map((s) => `- ${s.title} | ${s.publisher} | ${s.url}`).join("\n")}

# 본문 발췌
${draft.body.slice(0, 2500)}

# 점검 항목
1. **출처 도메인**: sources에 .go.kr / .or.kr / .ac.kr / 국제 수의학회(catvets.com·icatcare.org·wsava.org·avma.org) 외 도메인(블로그·카페·지식인·유튜브·위키·SNS)이 하나라도 있으면 → **무조건 verdict="fail"**.
2. 출처 URL/발행처가 실재할 법한가? 지어낸 티가 나는가?
3. 의학·법률 주장 중 사실과 다르거나 과장된 게 있는가?
4. 효능효과 단정(치료/완치 등) 표현이 있는가?
5. 수의사 감수가 필요한 진단성 내용인가?

# 출력 (JSON만)
\`\`\`json
{ "verdict": "pass | caution | fail", "issues": ["문제점..."], "notes": "종합 의견 2~3줄" }
\`\`\``;
  try {
    const raw = claudeRun(prompt);
    const m = raw.match(/```json\s*([\s\S]+?)\s*```/) ?? raw.match(/\{[\s\S]+\}/);
    return JSON.parse(m[1] ?? m[0]);
  } catch (e) {
    return { verdict: "caution", issues: [`검증 패스 실패: ${e.message}`], notes: "수동 검토 필요" };
  }
}

function slugify(title) {
  return title.toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 60);
}

// ── 5. codex 이미지 생성 ($0) ─────────────────────────────────────
function genImage(imagePrompt, outPath) {
  const dir = path.dirname(outPath), name = path.basename(outPath);
  mkdirSync(dir, { recursive: true });
  const instr = `Use your image_gen.imagegen tool to create this image: "${imagePrompt}". Photorealistic, 16:9 aspect ratio, no text/watermark. Save the returned image bytes as "${name}" in the current working directory (${dir}). Confirm file size when done.`;
  execFileSync(CODEX, ["exec", "--skip-git-repo-check", "-s", "workspace-write", instr], {
    cwd: dir, encoding: "utf8", maxBuffer: 20 * 1024 * 1024, timeout: 5 * 60 * 1000,
  });
  if (!existsSync(outPath) || statSync(outPath).size < 10000) throw new Error("이미지 생성 실패/너무 작음");
}

function buildMdx(topic, dateStr, draft, heroPath) {
  const tags = draft.tags.map((t) => `  - ${t}`).join("\n");
  const sources = draft.sources.map((s) => `  - title: ${JSON.stringify(s.title)}\n    url: ${s.url}\n    publisher: ${s.publisher ?? ""}`).join("\n");
  const faq = draft.faq.map((q) => `  - question: ${JSON.stringify(q.question)}\n    answer: ${JSON.stringify(q.answer)}`).join("\n");
  const hero = heroPath ? `hero_image: ${heroPath}\n` : "";
  return `---
title: ${JSON.stringify(draft.title)}
excerpt: ${JSON.stringify(draft.excerpt)}
category: ${topic.category}
tags:
${tags}
author: purrpik-editor
published_at: "${dateStr}"
${hero}source_backlog: ${JSON.stringify(topic.question)}
sources:
${sources}
faq:
${faq}
---

${draft.body}
`;
}

function git(args, cwd = REPO) { return execFileSync("git", args, { cwd, encoding: "utf8" }).trim(); }

function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const noImage = args.includes("--no-image");

  const backlog = parseBacklog();
  const done = writtenQuestions();
  const topic = backlog.find((t) => !done.has(t.question));
  if (!topic) { log("backlog 소진 — 새 질문 수집 필요. 종료."); return; }

  const dateStr = todayStr();
  log(`주제: "${topic.question}" (빈도 ${topic.freq}, ${topic.category}${topic.needsVet ? ", 감수필요" : ""})`);

  const evidence = gatherEvidence(topic.question);
  log(`근거 ${evidence.length}건 수집`);

  const draft = parseDraft(claudeRun(buildPrompt(topic, evidence)));
  const slug = slugify(draft.title);
  log(`초안: "${draft.title}"`);

  // 출처 도메인 게이트 (결정적): 비공식 URL 제거, 0건이면 공식 폴백 주입.
  const cleanSrc = sanitizeSources(draft.sources, topic.category);
  draft.sources = cleanSrc.sources;
  if (cleanSrc.dropped.length) log(`⚠️ 비공식 출처 ${cleanSrc.dropped.length}건 제거: ${cleanSrc.dropped.join(", ")}`);
  if (cleanSrc.injected) log("ℹ️ 공식 출처 0건 → 카테고리 폴백 주입");

  const check = verifyDraft(topic, draft);
  log(`검증: ${check.verdict}${check.issues?.length ? " — " + check.issues.join("; ") : ""}`);

  if (dry) {
    console.log("\n===== MDX =====\n" + buildMdx(topic, dateStr, draft, null));
    console.log("\n===== 검증 =====\n" + JSON.stringify(check, null, 2));
    console.log("\n===== image_prompt =====\n" + draft.image_prompt);
    return;
  }

  // worktree
  git(["fetch", "origin", "main"]);
  const branch = `article/${dateStr}-${topic.category}`;
  const wt = mkdtempSync(path.join(tmpdir(), "purrpik-article-"));
  try {
    git(["worktree", "add", "-B", branch, wt, "origin/main"]);

    let heroRel = null;
    if (!noImage && draft.image_prompt) {
      try {
        const imgName = `${dateStr}-${slug}.png`;
        genImage(draft.image_prompt, path.join(wt, "public", "articles", imgName));
        heroRel = `/articles/${imgName}`;
        git(["add", `public/articles/${imgName}`], wt);
        log(`이미지 생성 완료: ${heroRel}`);
      } catch (e) { log(`⚠️ 이미지 생략 (${e.message})`); }
    }

    const rel = path.join("content", "articles", topic.category, `${dateStr}-${slug}.mdx`);
    const abs = path.join(wt, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, buildMdx(topic, dateStr, draft, heroRel), "utf8");
    git(["add", rel], wt);
    git(["commit", "-m", `feat(articles): ${draft.title}`], wt);
    git(["push", "-u", "origin", branch, "--force-with-lease"], wt);

    const label = topic.needsVet ? "[매거진][감수필요] " : "[매거진] ";
    const vetBanner = topic.needsVet ? "\n\n> ⚠️ **수의사 감수 필요** — 진단/치료성 내용. 수의사 확인 후 머지하세요.\n" : "";
    const srcNote = cleanSrc.dropped.length
      ? `\n\n🔒 비공식 출처 ${cleanSrc.dropped.length}건 자동 제거${cleanSrc.injected ? " → 공식 폴백 주입" : ""} (공식 도메인만 게시).`
      : "";
    const body = `실제 고빈도 질문(${topic.freq}회) 기반 자동 생성 (Claude+codex OAuth, $0).${vetBanner}${srcNote}

**검증 결과: ${check.verdict}**
${(check.issues || []).map((i) => `- ${i}`).join("\n") || "- 특이사항 없음"}

${check.notes || ""}

---
Preview 배포에서 렌더 확인 후 Merge → 발행.`;
    const prUrl = execFileSync("gh", ["pr", "create", "--title", `${label}${draft.title}`, "--body", body, "--base", "main", "--head", branch], { cwd: wt, encoding: "utf8" }).trim();
    log(`PR: ${prUrl}`);
  } finally {
    try { git(["worktree", "remove", "--force", wt]); } catch { rmSync(wt, { recursive: true, force: true }); }
  }
}

main();
