# APCSExamPrep.com — Site Overview

## What it is

APCSExamPrep.com is a free study-resource site for three College Board AP exams: AP Computer Science A (CSA), AP Computer Science Principles (CSP), and the new AP Cybersecurity (launching nationally Fall 2026). It is built and run by Tanner Crow, a Blue Valley North High School AP CS teacher with 11+ years of classroom experience and a 5.0 Wyzant rating across 451+ reviews. Headline stat on the homepage: 54.5% of his AP CSA students score a 5 (vs. 25.5% national average); 34.8% of his AP CSP students score a 5 (vs. 9.6% nationally).

## Who it's for

- High-school students preparing for AP CSA, AP CSP, or AP Cybersecurity
- AP CS teachers (the Test Builder generates printable PDF exams with answer keys, no login required)
- Parents shopping for tutoring

## How the site works (UX flow)

The site is a content/navigation hub that funnels users through three layers:

1. **Course hubs** — landing pages per course (`/pages/ap-csa-exam-prep-hub`, `/pages/ap-computer-science-principles-resources`, `/pages/ap-cybersecurity-complete-course-guide`).
2. **Unit / Big-Idea study guides** — long-form prose study guides per unit (e.g., `/pages/ap-csa-unit-4-data-collections-study-guide`). These DO render server-side.
3. **Interactive practice tools** — practice tests, question-of-the-day, FRQ pages, test builder. These are dynamic JS apps that mount into otherwise empty `<div>` containers.

### Auth & paywall model

- The site is **almost entirely free**. No login is required to read study guides, take practice exams, browse the FRQ archive, or use the Test Builder. There is a "Log in" link in the header that goes to `/customer_authentication/redirect` — that's Shopify's customer account flow, used for tracking digital product purchases, not for gating educational content.
- **Free**: full-length practice exams (CSA 42-MCQ, CSP 70-MCQ, Cyber 43-Q), unit & topic tests, question of the day, FRQ archive (2004–2025) with solutions for 2018–2025, study guides, flashcards, vocabulary lists, reference sheets, the Test Builder over 586+ CSA questions, 21 study games.
- **Paid (Shopify products)**: 4-week / 2-week / 7-day Cram Kits ($29.99+), printable PDF flashcard bundles, downloadable FRQ year packs, condensed quick-reference PDFs, an "MCQ Bootcamp" live walkthrough ($49+), and 1-on-1 tutoring ($110–150/hr).
- **Email-wall**: there are exit-intent modals offering "free daily practice questions" in exchange for an email — content is not gated behind these, they're list-building popups.

### Question types & practice modes

- **AP CSA MCQ** — 4-option multiple choice (A–D) drilled in three ways:
  - Single-topic tests (e.g., Loops, Boolean Logic, Recursion Tracing)
  - Unit assessments (Unit 1/2/3/4 practice exams)
  - Full 42-MCQ simulated exam matching the 2025–2026 digital Bluebook format
- **AP CSA FRQ** — full free-response coding problems sorted by year (2004–2025) and by type:
  - Q1: Methods & Control Structures
  - Q2: Class Writing
  - Q3: ArrayList
  - Q4: 2D Array
  Each FRQ page advertises "interactive editor + 22-minute timer + 9-point rubric + mistake analysis" for years 2018–2025.
- **AP CSP MCQ** — 4-option MCQs across all 5 Big Ideas, plus a 70-MCQ full practice exam and a separate Test Builder.
- **AP CSP Written Response** — "Create Performance Task" prompts with sample responses and scoring archive.
- **AP Cyber** — 250+ MCQs across 5 units, plus a 40-MCQ + 3-FRQ full practice exam.
- **Question of the Day** — a single hard daily question for both CSA and CSP, with a "QOTD Hub" listing all previous days.
- **Test Builder** — generates a custom printable PDF + answer key by filtering 586 CSA questions (or a growing CSP bank) by unit, topic, and difficulty.

### Scoring

Practice exams give instant scoring with detailed explanations per question, and the CSA exams output an AP score estimate (1–5). There's also a dedicated **AP Score Calculator** page at `/pages/ap-csa-score-calculator`.

## Tech stack

- **Platform**: Shopify. The footer says "Powered by Shopify" and the HTML carries Shopify-specific meta tags (`shopify-checkout-api-token`, `shopify-digital-wallet`). The Shopify store ID is `77884031191`.
- **Assets**: Images and PDFs served from `cdn.shopify.com/s/files/1/0778/8403/1191/...`.
- **Storefront**: standard Shopify theme with custom Liquid templates. Marketing/study-guide pages live under `/pages/...` (Shopify "Pages" model), purchasable products under `/products/...`, blog under `/blogs/...`.
- **Interactive question apps**: the practice-test, Test Builder, FRQ-solution, and QOTD pages are JS-rendered single-page widgets embedded into the page. The static HTML for those pages is essentially empty until the JS runs — a server-side fetch of `/pages/ap-csa-practice-test-loops` returns no question text. This means the questions almost certainly live in a JSON bundle or JS file shipped to the browser, or are pulled from a backend API after the SPA boots.
- **Auth backend**: Shopify Customer Accounts (`/customer_authentication/redirect?locale=en&region_country=US`).
- **Email capture**: Klaviyo or Shopify-native (popup modals on exit).
- **Payments**: Apple Pay, Google Pay, PayPal, Shop Pay, all major cards — standard Shopify checkout.
- **Hosting**: Shopify's edge/CDN.

## Why it works (value proposition)

1. **Teacher credibility, not a content mill.** Almost every prep site is anonymous or AI-generated. This one has a named teacher with verifiable Wyzant reviews, classroom outcomes, and 11+ years of pattern recognition on what the exam actually asks.
2. **Free where the competition gates.** Albert.io, UWorld, and Barron's lock most practice questions behind paywalls. This site puts full-length exams, the full 2004–2025 FRQ archive, daily questions, and a custom test builder out for free — monetization is a thin layer of cram kits and 1-on-1 tutoring on top.
3. **Real teacher tooling.** The Test Builder for teachers (printable PDF + separate answer key, no login) is genuinely rare in this niche — most competitors require classroom subscriptions.
4. **Aligned to the new 2025–2026 digital exam format.** Number of questions and exam structure (Bluebook, 42 MCQ + 4 FRQ for CSA, 70 MCQ + Create Task for CSP) are current — the homepage even references "AP CSA Exam: May 15, 2026".
5. **Pedagogically organized.** Practice is grouped both by unit and by FRQ pattern (Q1–Q4), which mirrors how the College Board actually constructs the test. The FRQ Strategy Guide ("13 patterns, Q1–Q4 decoded") is the kind of meta-content most prep sites don't produce.

## What a user can do with it

- Use the unit study guides + flashcards as the primary self-study path through CSA or CSP.
- Take the free full-length practice exams for a baseline score.
- Drill weak topics with single-topic tests.
- Work through every past FRQ in chronological order — 2018+ have interactive editors with rubric scoring; 2004–2017 are read-only with solutions.
- Subscribe to the email list to get a hard daily MCQ for habit-building.
- For teachers: generate a custom printable exam PDF from the 586-question bank, with a matching answer key, in under a minute.

## Counts (advertised on the site)

| Resource | Count |
|---|---|
| CSA Test Builder question bank | 586+ |
| CSA FRQ archive (2004–2025) | 88 FRQs |
| CSA full-length practice exams | 7 |
| CSA FRQ-style coding practice problems | 34 |
| CSA flashcards | 200 |
| CSA vocabulary terms | 150+ |
| CSP full practice exams | 2 (70-MCQ each) |
| CSP "Top 100 Questions" | 100 |
| CSP vocabulary terms | 150+ |
| AP Cyber practice MCQs | 250+ |
| AP Cyber practice exam | 40 MCQ + 3 FRQ |
| Study games | 21 |
| Tutoring hours delivered | 1,845+ |
