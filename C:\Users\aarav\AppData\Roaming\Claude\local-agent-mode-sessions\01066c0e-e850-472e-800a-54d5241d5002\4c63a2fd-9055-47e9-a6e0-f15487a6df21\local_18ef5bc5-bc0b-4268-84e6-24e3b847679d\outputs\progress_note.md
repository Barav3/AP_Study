# Progress Note — What I extracted vs. what was blocked

## What worked

- Fetched the homepage, the AP CSA practice-questions hub, the AP CSA FRQ archive hub, and the AP CSA exam-format and vocabulary pages. These are real Shopify-rendered HTML pages and their navigation, structure, marketing copy, and link inventory all came through cleanly.
- Identified the platform (Shopify, store ID 77884031191) and confirmed it from `meta-shopify-checkout-api-token` and the "Powered by Shopify" footer.
- Mapped the site's full information architecture: course hubs → unit study guides → practice tools, plus the products store and the FRQ archive's year/type cross-index.
- Cataloged 30 individual FRQs (years 2018–2025) with title, year, question type, and direct URL, and an additional 14 year-page URLs for FRQs 2004–2017.
- Cataloged 33 distinct MCQ / practice tool pages (full exams, unit exams, topic drills, daily QOTD, Test Builder, Top 100, written-response archive) for CSA, CSP, and Cyber.

## What was blocked, and why

### 1. JavaScript-rendered question pages

Every page that actually delivers practice content — the topic drill pages (`/pages/ap-csa-practice-test-loops`, etc.), the Test Builder, the per-FRQ detail pages (`/pages/ap-csa-2025-frq-1-dogwalker`, etc.), the daily-practice pages, the AP Cyber question pages — returns an empty or near-empty body when fetched server-side. The question content is mounted into the DOM by client-side JavaScript after page load, either by reading a JSON bundle in the page's `<script>` tags or by calling a backend API. The text-extraction layer of the `web_fetch` tool I had available only sees the rendered text of the initial server response, so it sees an empty container.

**What this means for the task.** I could not extract a single full MCQ stem, choices, correct-answer flag, FRQ prompt body, or solution explanation. The total extracted question count is 0. The site advertises roughly 586 CSA MCQs + 100 CSP "top" questions + ~140 additional CSP MCQs across topic tests + 250+ Cyber MCQs + 88 CSA FRQs + 34 CSA FRQ-style coding problems — call it 1,200+ items — none of which I could pull bodies for.

### 2. No sandboxed shell to run a real crawler

The plan called for a polite Python crawler (`requests` + `beautifulsoup4`, or `httpx`) with a 1–2 req/s rate limit and a custom UA. The Linux sandbox in this session reported "VM is not available" on every bash invocation, so I could not run any scripted crawler or even fetch `robots.txt` directly. Even if I had bash, a `requests`-based crawler would have hit the same JavaScript-rendering wall — to get the questions I'd need a headless browser (Playwright/Selenium) that actually runs the SPA, then either scrapes the rendered DOM or intercepts the JSON the SPA fetches from the backend.

### 3. robots.txt and ToS not directly verifiable

The `web_fetch` tool requires URLs to come from a prior tool result or user message, so I couldn't pull `https://www.apcsexamprep.com/robots.txt` (no link to it anywhere on the public pages). Both `/policies/terms-of-service` and `/policies/privacy-policy` returned empty bodies on fetch — they're rendered by Shopify client-side from policy data on the store, same JS-rendering pattern. I was therefore **unable to confirm or deny an explicit scraping prohibition in the site's ToS**. Standard Shopify boilerplate ToS typically prohibits automated access for the purpose of republishing content, but I didn't have its actual text in front of me.

### 4. Copyright / ethical layer

Even setting the technical blocker aside, large-scale extraction-and-republication of this site's question bank would raise real issues:

- The AP CSA FRQs from 2004–2025 are College Board copyright (the prompts themselves), and Tanner Crow's solutions and explanations are his original work.
- The MCQ banks (586 CSA + 250 Cyber + the CSP top 100) are explicitly described as the site author's original content.
- The site monetizes via cram kits and tutoring on top of free content; redistribution of the full bank would directly compete with the business.

For personal study use against a single user, fetching one page at a time through a browser is fine. For a programmatic dump, the right move is to ask Tanner (`tanner@apcsexamprep.com`) — he runs a teacher resources / Teachers Pay Teachers track and may license bulk content for classroom use.

## How to actually get the question bodies if you need them

In rough order of effort:

1. **Use the Chrome MCP / browser automation against your own session.** Open each topic page in a real browser, let the SPA hydrate, then read the rendered DOM. The Chrome MCP tools (`mcp__Claude_in_Chrome__*`) are listed as available — if the Chrome extension is installed and connected, a future run could navigate page-by-page and call `get_page_text` after each load. Rate-limit politely.
2. **Find the underlying JSON.** Inspect the network panel on a question page. The SPA almost certainly fetches `/something.json` or hits a Shopify metafield API. Once that endpoint is identified, one direct fetch returns dozens of questions at once instead of one per page.
3. **Email the site owner.** For teacher use specifically, Tanner offers teacher resources and Teachers Pay Teachers materials. A direct ask is faster than scraping and stays on the right side of the ToS.
4. **Use the paid PDFs.** The 4-week Cram Kit and the year-specific FRQ Year Packs are sold as PDFs; those are easily parseable once purchased and avoid the JS-rendering wall entirely.

## Honest scope summary

The user asked for "every question they can extract." The honest answer is: **zero question bodies extracted, 30 FRQs cataloged by metadata, 33 MCQ tool pages cataloged by URL.** The site is fully usable as a study tool through a browser — but it's deliberately not structured to be machine-readable, which is the entire blocker here.
