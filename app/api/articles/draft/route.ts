/**
 * Cron — 매일 1편 길고양이 기사 초안 생성 → GitHub PR.
 *
 * 호출 경로:
 * - Vercel Cron `0 0 * * *` (매일 09:00 KST)
 * - Authorization: `Bearer ${CRON_SECRET}` 필수
 *
 * 외부 의존:
 * - ANTHROPIC_API_KEY    (초안 생성)
 * - GITHUB_TOKEN         (repo scope, contents/pull_requests write)
 * - GITHUB_REPO          (예: "dlwjdghkszkf-png/purrpik-store")
 * - GITHUB_DEFAULT_BRANCH (기본 "main")
 * - CRON_SECRET
 *
 * 환경 변수가 없으면 503 + 가이드 응답.
 * env 채우기 전까지는 사용자가 수동 발행.
 */
import { NextResponse } from "next/server";

import { ARTICLE_CATEGORIES, type ArticleCategorySlug } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 요일별 카테고리 rotation — 한 주에 5개 카테고리 순환 + 주말 휴재.
const CATEGORY_ROTATION: Record<number, ArticleCategorySlug> = {
  1: "adoption-guide", // 월
  2: "street-care", // 화
  3: "global-care", // 수
  4: "nutrition", // 목
  5: "health", // 금
};

type EnvCheck = {
  ok: boolean;
  missing: string[];
};

function checkEnv(): EnvCheck {
  const required = [
    "ANTHROPIC_API_KEY",
    "GITHUB_TOKEN",
    "GITHUB_REPO",
    "CRON_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]);
  return { ok: missing.length === 0, missing };
}

function buildPrompt(category: ArticleCategorySlug, dateStr: string): string {
  const cat = ARTICLE_CATEGORIES[category];
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

async function callClaude(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 8000,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Anthropic API ${res.status}: ${await res.text()}`);
  }
  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content.find((c) => c.type === "text")?.text ?? "";
}

function parseDraft(raw: string): {
  title: string;
  excerpt: string;
  tags: string[];
  sources: Array<{ title: string; url: string; publisher?: string }>;
  faq: Array<{ question: string; answer: string }>;
  body: string;
} {
  // JSON 블록 추출.
  const m = raw.match(/```json\s*([\s\S]+?)\s*```/) ?? raw.match(/\{[\s\S]+\}/);
  if (!m) throw new Error("초안 JSON 파싱 실패");
  const jsonStr = m[1] ?? m[0];
  return JSON.parse(jsonStr);
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function buildMdx(
  category: ArticleCategorySlug,
  dateStr: string,
  draft: ReturnType<typeof parseDraft>,
): string {
  const tags = draft.tags.map((t) => `  - ${t}`).join("\n");
  const sources = draft.sources
    .map(
      (s) =>
        `  - title: "${s.title.replace(/"/g, '\\"')}"\n    url: ${s.url}\n    publisher: ${s.publisher ?? ""}`,
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

async function githubCreatePr(
  filePath: string,
  fileContent: string,
  title: string,
  body: string,
  baseBranch: string,
): Promise<{ pr_url: string }> {
  const repo = process.env.GITHUB_REPO!;
  const token = process.env.GITHUB_TOKEN!;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // 1. base SHA.
  const baseRes = await fetch(
    `https://api.github.com/repos/${repo}/git/refs/heads/${baseBranch}`,
    { headers },
  );
  if (!baseRes.ok) throw new Error(`base ref ${await baseRes.text()}`);
  const baseSha = ((await baseRes.json()) as { object: { sha: string } }).object
    .sha;

  // 2. 새 branch.
  const branchName = `article/${filePath.split("/").pop()?.replace(".mdx", "")}-${Date.now()}`;
  const createRefRes = await fetch(
    `https://api.github.com/repos/${repo}/git/refs`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ref: `refs/heads/${branchName}`,
        sha: baseSha,
      }),
    },
  );
  if (!createRefRes.ok)
    throw new Error(`create ref ${await createRefRes.text()}`);

  // 3. 파일 commit.
  const contentB64 = Buffer.from(fileContent, "utf8").toString("base64");
  const putRes = await fetch(
    `https://api.github.com/repos/${repo}/contents/${filePath}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        message: `feat(articles): 초안 — ${title}`,
        content: contentB64,
        branch: branchName,
      }),
    },
  );
  if (!putRes.ok) throw new Error(`put file ${await putRes.text()}`);

  // 4. PR 생성.
  const prRes = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: `[매거진] ${title}`,
      head: branchName,
      base: baseBranch,
      body,
      draft: false,
    }),
  });
  if (!prRes.ok) throw new Error(`pr ${await prRes.text()}`);
  const pr = (await prRes.json()) as { html_url: string };
  return { pr_url: pr.html_url };
}

export async function GET(req: Request) {
  const env = checkEnv();
  if (!env.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "cron_env_missing",
        missing: env.missing,
        note: "Vercel env에 위 키를 모두 추가하면 자동 발행이 활성화됩니다.",
      },
      { status: 503 },
    );
  }

  // Auth.
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    const dow = today.getDay();
    const category = CATEGORY_ROTATION[dow];
    if (!category) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "weekend",
      });
    }
    const dateStr = today.toISOString().slice(0, 10);

    const raw = await callClaude(buildPrompt(category, dateStr));
    const draft = parseDraft(raw);

    const slug = slugify(draft.title);
    const filePath = `content/articles/${category}/${dateStr}-${slug}.mdx`;
    const mdx = buildMdx(category, dateStr, draft);

    const { pr_url } = await githubCreatePr(
      filePath,
      mdx,
      draft.title,
      `자동 생성 초안. 발행 전 편집부 검수 필요.\n\n- 카테고리: ${ARTICLE_CATEGORIES[category].label}\n- 생성: ${dateStr}\n- 출처 ${draft.sources.length}건\n\n검수 후 \`published_at\`만 확인 후 머지.`,
      process.env.GITHUB_DEFAULT_BRANCH ?? "main",
    );

    return NextResponse.json({
      ok: true,
      category,
      title: draft.title,
      slug,
      pr_url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
