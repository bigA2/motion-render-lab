# Before/After posts: RESULT

Branch `images/before-after-2026-11-21`. Build: `python beforeafter/build.py` (CI: `.github/workflows/beforeafter.yml`, artifact `beforeafter`). Captions: `beforeafter/captions.md`.
Each post has 3 PNGs (1080x1350) in `beforeafter/out/`: `NN_slug_split.png`, `NN_slug_s1_before.png`, `NN_slug_s2_after.png`.

| # | Post | Area | Workflow | Apps | UI frame |
|---|------|------|----------|------|----------|
| 01 | Booked call, prep ready | Sales | Call booked -> Prep page -> Team heads-up | calendly, notion, slack | real P0x workflow frame |
| 02 | Client request to task and alert | Agency | Client request -> Task, due today -> Alert to team | typeform, notion, slack | real P0x workflow frame |
| 03 | Project brief saved and sent to you | Freelancer | New brief -> Brief page -> Message to you | typeform, notion, slack | real P0x workflow frame |
| 04 | One blog post, drafts for every network | Marketing | New blog post -> Captions written -> Posts queued -> Instagram post | wordpress, openai, buffer, instagram-business | real FansaChat UI frame |
| 05 | Support email to ticket and owner | Support | Support email -> Ticket created -> Owner pinged | gmail, help-scout, slack | real FansaChat UI frame |
| 06 | Order to label and tracking email | Ops / e-commerce | New order -> Label made -> Tracking email -> Order log | shopify, shippo, gmail, google-sheets | real FansaChat UI frame |
| 07 | Monday revenue report builds itself | Finance | Payments -> Books -> Weekly totals -> Report sent | stripe, quickbooks, google-sheets, gmail | real FansaChat UI frame |
| 08 | Offer accepted, onboarding starts | HR | Offer accepted -> HR record -> Welcome email -> Day-one invite | greenhouse, bamboohr, gmail, google-calendar | real FansaChat UI frame |
| 09 | New lead lands in the CRM | Sales | New lead -> Deal created -> First reply -> Team alert | typeform, pipedrive, gmail, slack | real FansaChat UI frame |
| 10 | New video, drafts ready | Solo creator | New upload -> Drafts written -> Drafts saved -> Posts queued | youtube, openai, google-docs, buffer | real FansaChat UI frame |

## Fonts
Space Grotesk (500, 700) for all text and the CTA; Anton for the BEFORE/AFTER labels only. No italic, script or serif faces.

## UI frames
Cut with ffmpeg from `public/real/P05_ui.webm`, `P06_ui.webm`, `P07_ui.webm` and `P05_still_empty.png`. Posts 01 to 03 use the real built workflow step card of the matching recording (booked call, client request, project brief). Posts 04 to 10 do not have their own recordings, so they show generic real UI (workflow shape picker, empty chat) and no invented prompt text. App logos are all from `glass5/icons`.

## QA notes
- Automated per image: every text node >= 30px, nothing outside a 24px margin, no text overlapping text, nothing covering text (elementFromPoint), contrast check on chips, font list (Anton, Grotesk only). Report: `beforeafter/out/QA.txt`, 30/30 PASS.
- Visual: opened contact sheets of all 30 PNGs plus full-size checks (01 split, 05 s2, 10 split). Fixed along the way: text covered by the logo pile, 3 and 4 line headlines touching the flow, flow labels running together on 4-node carousels, UI crop colliding with the footer, footer off the edge.
- `glass5/cta.py` got one backward-compatible `sub` argument so the Telegram line can be >= 30px. Button text is the house CTA.
- Claims are minutes or hours only, no percentages or prices. Posts 04 to 10 describe workflows FansaChat can build from chat with the listed apps; they were not recorded end to end.
- Limits: the UI crops are small in the split post (real UI, screenshot text not legible there), larger in the carousel.

READY: yes
