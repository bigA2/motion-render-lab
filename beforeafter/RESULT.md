# Before/After posts: RESULT

## Posts (each: split + carousel slide 1 BEFORE + slide 2 AFTER = 3 PNGs, 1080x1350, in beforeafter/out/)

| # | Title | Area | Apps |
|---|---|---|---|
| 01 | New lead to CRM | Sales | Typeform, HubSpot, Slack |
| 02 | Booked call to prep page | Sales | Calendly, Notion, Slack |
| 03 | One post to every channel | Marketing | WordPress, Buffer, Instagram, Facebook Pages |
| 04 | Urgent ticket to the right person | Support | Zendesk, Slack, Linear |
| 05 | Order to shipping label and sheet | Ops | Shopify, Shippo, Google Sheets |
| 06 | Payments booked, Monday summary posted | Finance | Stripe, QuickBooks, Slack |
| 07 | Offer accepted to onboarding | HR | Greenhouse, BambooHR, Slack, Google Calendar |
| 08 | Client request to task and alert | Agency | Typeform, Notion, Slack |
| 09 | New video to every audience | Solo creator | YouTube, Bluesky, Discord |
| 10 | Project brief to Notion and Slack | Freelance | Typeform, Notion, Slack |

Captions: beforeafter/captions.md. Build: beforeafter/build.py, workflow .github/workflows/beforeafter.yml (artifact `beforeafter`).

## Fonts
Space Grotesk (500/700) for text, Big Shoulders Display for labels and result words. Two families, no italic or script. CTA comes from glass5/cta.py and inherits Space Grotesk (its button gradient is the house CTA colour, left as is).

## Real UI frames
Cut with ffmpeg from public/real/*.webm. Posts 02, 08, 10 show the real chat for their own flow (P05, P06, P07: booking, client request, brief). The other 7 workflows have no recording, so they show the real, app-neutral "How should your workflow look?" picker from P05 instead of a made-up chat. App logos are all from glass5/icons. No typed or drawn UI.

## QA notes
- Automated (glass5 QA + checks): no text under 30px (CTA t.me and community label forced to 30px by CSS override on cta.py output), no overlaps, nothing covering main text, safe zone, 2 font families. 30/30 PASS (out/QA.txt).
- Opened sample PNGs (posts 02, 04, 05, 06, 08, 10 plus a contact sheet of all 30) to check layout, contrast and clipping. Fixed: footer overlapping the Telegram pill, clipped logo pile, a cached wrong frame, mismatched generic UI crop.
- Known limits: UI frame text is small by nature (real screenshot, not copy). Typeform logo is a plain T mark. Claims are time-based only (seconds, a minute, 10 or 30 minutes), no statistics.

READY: yes
