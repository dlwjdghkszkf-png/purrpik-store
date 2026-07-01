#!/usr/bin/env node
/**
 * 매거진 기사 $0 자동 생성기 (Claude CLI OAuth — API 비용 0).
 *
 * Vercel cron + ANTHROPIC_API_KEY 대체. 로컬 launchd가 매일 실행:
 *   1. 요일별 카테고리 선택 (월~금, 주말 휴재)
 *   2. `claude -p` (OAuth, $0)로 기사 초안 JSON 생성
 *   3. git worktree에 MDX 작성 → 브랜치 커밋/푸시 (작업트리 안 건드림)
 *   4. `gh pr create`로 PR 오픈 (PAT 불필요, gh 인증 사용)
 *   → 폰 GitHub 앱에서 Preview 확인 후 Merge → Vercel 자동 발행
 *
 * 수동 실행: node scripts/generate-article.mjs          (오늘 요일 카테고리)
 *           node scripts/generate-article.mjs health   (카테고리 강제)
 *           node scripts/generate-article.mjs --force   (주말에도 생성)
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = "sonnet";

const CATEGORIES = {
  "adoption-guide": {
    label: "입양 가이드",
    description: "길고양이를 가족으로 맞이할 때 알아야 할 모든 것 — 검역, 적응, 건강검진, 동거동물 합사.",
  },
  "street-care": {
    label: "길고양이 케어",
    description: "TNR, 겨울 보온, 급식소 운영, 길고양이 학대 신고 절차까지 — 현장 케어 실무 가이드.",
  },
  "global-care": {
    label: "해외 사례",
    description: "터키, 일본, 독일의 길고양이 정책과 시민 케어 문화 — 한국 적용 가능한 모범 사례 분석.",
  },
  nutrition: {
    label: "영양·간식",
    description: "고양이 영양학 기초 — 타우린, 수분 섭취, 간식 vs 주식 구분, 위험 식품 리스트.",
  },
  health: {
    label: "건강·질병",
    description: "고양이가 흔히 겪는 질환 — 요로결석, 신부전, 구내염, 백신 스케줄, 응급처치 가이드.",
  },
};

// 요일 로테이션 (1=월 … 5=금). 주말(0,6) 휴재.
const ROTATION = {
  1: "adoption-guide",
  2: "street-care",
  3: "global-care",
  4: "nutrition",
  5: "health",
};

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

function todayStr() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function buildPrompt(category, dateStr) {
  const cat = CATEGORIES[category];
  return `당신은 한국 길고양이 케어 브랜드 "푸르픽 PURRPIK"의 콘텐츠 에디터입니다.
오늘은 ${dateStr}이고, "${cat.label}" 카테고리에 발행할 새 기사 초안을 작성합니다.

# 카테고리 설명
${cat.description}

# 작성 규칙
1. 분량: 1,800~2,500자 (한국어 기준)
2. 톤: 차분하고 정확. 감정 과잉 금지. "동정이 아니라 케어".
3. 모든 의학·법률적 주장은 출처를 명시 (농림축산식품부, 한국동물병원협회, AAFP, RSPCA 등 권위 있는 기관).
4. 효능 효과 단정 표현(치료, 완치, 99% 효과 등) 금지 — 식약처 가이드라인 준수.
5. 검증되지 않은 민간요법 금지.
6. 5~7개 H2 섹션, 각 섹션은 200~400자.
7. 최소 1개 표(Markdown table) 포함.
8. 마지막에 FAQ 3개 (Q&A 형식).
9. 마지막에 "참고 자료" 섹션 (모든 출처를 링크와 함께 명시).
10. 본문에 푸르픽 제품 또는 카테고리 페이지(/cat, /care-guide, /articles 등) 자연스럽게 1~2회 언급.
11. 각 H2 섹션 첫 문장은 자립형 답변 블록: 결론/정의를 먼저 40~60자 안에, 이어서 근거·수치. (LLM 인용 최적화)

# 출력 형식 (반드시 이 형식으로만 출력)
\`\`\`json
{
  "title": "한국어 기사 제목 (50자 이내)",
  "excerpt": "기사 요약 (120자 이내)",
  "tags": ["태그1", "태그2", "태그3", "태그4", "태그5"],
  "sources": [
    { "title": "출처 제목", "url": "https://...", "publisher": "발행처" }
  ],
  "faq": [
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ],
  "body": "# 본문 (Markdown, H1 제외 — H2부터)"
}
\`\`\`

JSON만 출력. 다른 텍스트 금지.`;
}

function callClaude(prompt) {
  // claude CLI OAuth = $0. stdin으로 프롬프트 전달, print 모드.
  const out = execFileSync("claude", ["-p", "--model", MODEL], {
    input: prompt,
    cwd: REPO,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: 5 * 60 * 1000,
  });
  return out;
}

function parseDraft(raw) {
  const m = raw.match(/```json\s*([\s\S]+?)\s*```/) ?? raw.match(/\{[\s\S]+\}/);
  if (!m) throw new Error("초안 JSON 파싱 실패");
  const jsonStr = m[1] ?? m[0];
  const d = JSON.parse(jsonStr);
  for (const k of ["title", "excerpt", "tags", "sources", "faq", "body"]) {
    if (!d[k]) throw new Error(`초안에 ${k} 누락`);
  }
  return d;
}

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function buildMdx(category, dateStr, draft) {
  const tags = draft.tags.map((t) => `  - ${t}`).join("\n");
  const sources = draft.sources
    .map(
      (s) =>
        `  - title: ${JSON.stringify(s.title)}\n    url: ${s.url}\n    publisher: ${s.publisher ?? ""}`,
    )
    .join("\n");
  const faq = draft.faq
    .map(
      (q) =>
        `  - question: ${JSON.stringify(q.question)}\n    answer: ${JSON.stringify(q.answer)}`,
    )
    .join("\n");
  return `---
title: ${JSON.stringify(draft.title)}
excerpt: ${JSON.stringify(draft.excerpt)}
category: ${category}
tags:
${tags}
author: purrpik-editor
published_at: "${dateStr}"
sources:
${sources}
faq:
${faq}
---

${draft.body}
`;
}

function git(args, cwd = REPO) {
  return execFileSync("git", args, { cwd, encoding: "utf8" }).trim();
}

function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");
  const catArg = args.find((a) => !a.startsWith("--"));

  const dow = new Date().getDay();
  const category = catArg ?? ROTATION[dow];
  if (!category) {
    log(`주말(요일 ${dow}) 휴재. 종료.`);
    return;
  }
  if (!CATEGORIES[category]) {
    log(`알 수 없는 카테고리: ${category}`);
    process.exit(1);
  }
  const dateStr = todayStr();

  // 중복 가드: 오늘 날짜로 이미 그 카테고리 글이 있으면 skip (launchd 재실행 대비).
  const catDir = path.join(REPO, "content", "articles", category);
  if (existsSync(catDir) && readdirSync(catDir).some((f) => f.startsWith(dateStr))) {
    log(`오늘(${dateStr}) ${category} 기사 이미 존재. skip.`);
    return;
  }

  log(`생성 시작: ${dateStr} / ${category} (${CATEGORIES[category].label})`);
  const raw = callClaude(buildPrompt(category, dateStr));
  const draft = parseDraft(raw);
  const slug = slugify(draft.title);
  const mdx = buildMdx(category, dateStr, draft);
  log(`초안 완성: "${draft.title}" (${mdx.length}자)`);

  // worktree에서 커밋/푸시 (사용자 작업트리 무간섭).
  git(["fetch", "origin", "main"]);
  const branch = `article/${dateStr}-${category}`;
  const wt = mkdtempSync(path.join(tmpdir(), "purrpik-article-"));
  try {
    git(["worktree", "add", "-B", branch, wt, "origin/main"]);
    const relPath = path.join("content", "articles", category, `${dateStr}-${slug}.mdx`);
    const absPath = path.join(wt, relPath);
    mkdirSync(path.dirname(absPath), { recursive: true });
    writeFileSync(absPath, mdx, "utf8");
    git(["add", relPath], wt);
    git(["commit", "-m", `feat(articles): ${draft.title}`], wt);
    git(["push", "-u", "origin", branch, "--force-with-lease"], wt);

    const prBody = `자동 생성 매거진 초안 (Claude CLI OAuth, $0).\n\n**${CATEGORIES[category].label}** · ${dateStr}\n\n${draft.excerpt}\n\n---\nPreview 배포에서 렌더 확인 후 Merge하면 발행됩니다.`;
    const prUrl = execFileSync(
      "gh",
      ["pr", "create", "--title", `[매거진] ${draft.title}`, "--body", prBody, "--base", "main", "--head", branch],
      { cwd: wt, encoding: "utf8" },
    ).trim();
    log(`PR 생성 완료: ${prUrl}`);
  } finally {
    try {
      git(["worktree", "remove", "--force", wt]);
    } catch {
      rmSync(wt, { recursive: true, force: true });
    }
  }
}

main();
