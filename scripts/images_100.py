# 100 image specs -> src/img/specs.json. Rotates 28 styles x 12 palettes x audience topics. Approved claims only.
import json, itertools
PALS = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'D1', 'D2', 'D3', 'D4']
A = {  # audience -> (pain, sentence, nodes, apps)
 'Freelancers': ("Chasing invoices again?", "If a Stripe invoice isn't paid in 7 days, send a polite WhatsApp reminder and update my Notion board.", [['stripe', 'Stripe', 'Unpaid 7 days'], ['whatsapp', 'WhatsApp', 'Polite reminder'], ['notion', 'Notion', 'Board updated'], ['quickbooks', 'QuickBooks', 'Paid → entry']], ['stripe', 'paypal', 'notion', 'whatsapp', 'quickbooks', 'toggl', 'calendly', 'trello']),
 'Creators': ("Posting one video to 6 apps?", "When I publish on YouTube, post the clip to Instagram, X and LinkedIn and update my Notion calendar.", [['youtube', 'YouTube', 'New video'], ['instagram', 'Instagram', 'Clip posted'], ['linkedin', 'LinkedIn', 'Shared'], ['notion', 'Notion', 'Calendar']], ['youtube', 'instagram', 'x', 'linkedin', 'threads', 'tiktok', 'notion', 'canva']),
 'Designers': ("Feedback in 9 places?", "When a client comments in Figma or WhatsApp, add it to my Notion feedback board and ping me on Telegram.", [['figma', 'Figma', 'Comment'], ['whatsapp', 'WhatsApp', 'Message'], ['notion', 'Notion', 'Task'], ['telegram', 'Telegram', 'Ping']], ['figma', 'canva', 'notion', 'slack', 'whatsapp', 'dropbox', 'drive', 'trello']),
 'Developers': ("Bug reports in your DMs?", "When someone reports a bug on Discord, create a labelled GitHub issue and alert #dev in Slack.", [['discord', 'Discord', 'Bug report'], ['github', 'GitHub', 'Issue + labels'], ['slack', 'Slack', '#dev alert']], ['github', 'gitlab', 'linear', 'jira', 'sentry', 'vercel', 'discord', 'slack']),
 'Shop owners': ("40 orders, 40 copy-pastes?", "When a Shopify order comes in, log it in Sheets, update the customer on WhatsApp and alert me when stock is low.", [['shopify', 'Shopify', 'New order'], ['sheets', 'Sheets', 'Logged'], ['whatsapp', 'WhatsApp', 'Customer update'], ['telegram', 'Telegram', 'Low stock']], ['shopify', 'woo', 'etsy', 'stripe', 'paypal', 'whatsapp', 'instagram', 'sheets']),
 'Agencies': ("New client = 6 tools of setup?", "When a contract is signed, create the HubSpot deal, a ClickUp project, a Slack channel and a Drive folder.", [['docusign', 'DocuSign', 'Signed'], ['hubspot', 'HubSpot', 'Deal'], ['clickup', 'ClickUp', 'Project'], ['slack', 'Slack', 'Channel']], ['hubspot', 'clickup', 'slack', 'notion', 'drive', 'docusign', 'calendly', 'figma']),
 'Sales teams': ("Hot lead waited 15 hours?", "When someone fills my Typeform, add them to HubSpot and send my Calendly link on WhatsApp within a minute.", [['typeform', 'Typeform', 'Lead'], ['hubspot', 'HubSpot', 'Deal'], ['whatsapp', 'WhatsApp', 'Calendly link'], ['slack', 'Slack', '#sales']], ['typeform', 'hubspot', 'salesforce', 'calendly', 'whatsapp', 'slack', 'linkedin', 'zoom']),
 'Support teams': ("“Where's my order?” ×50?", "When a customer asks about their order on WhatsApp, look it up in Shopify and reply with tracking.", [['whatsapp', 'WhatsApp', 'Question'], ['shopify', 'Shopify', 'Find order'], ['whatsapp', 'Reply', 'Tracking link'], ['zendesk', 'Zendesk', 'Refunds → ticket']], ['whatsapp', 'instagram', 'facebook', 'zendesk', 'intercom', 'shopify', 'telegram', 'slack']),
 'Recruiters': ("120 CVs, one inbox?", "When a CV arrives, file it in Drive, add the candidate to Airtable and send a thank-you.", [['googleforms', 'Form', 'Application'], ['drive', 'Drive', 'CV filed'], ['airtable', 'Airtable', 'Candidate'], ['calendly', 'Calendly', 'Interview']], ['linkedin', 'gmail', 'googleforms', 'drive', 'airtable', 'calendly', 'zoom', 'notion']),
 'Coaches': ("Forgot the reminder. Again?", "When someone books on Calendly, send the Zoom link, a Stripe invoice and a WhatsApp reminder 1 hour before.", [['calendly', 'Calendly', 'Booking'], ['zoom', 'Zoom', 'Link'], ['stripe', 'Stripe', 'Invoice'], ['whatsapp', 'WhatsApp', 'Reminder −1h']], ['calendly', 'zoom', 'stripe', 'notion', 'whatsapp', 'gcal', 'paypal', 'telegram']),
 'Ops managers': ("3 hours on the Monday report?", "Every Monday at 8, pull Stripe sales and HubSpot leads into Sheets and post a summary in Slack.", [['gcal', 'Schedule', 'Mon 8:00'], ['stripe', 'Stripe', 'Sales'], ['hubspot', 'HubSpot', 'Leads'], ['slack', 'Slack', 'Report']], ['stripe', 'hubspot', 'asana', 'sheets', 'slack', 'airtable', 'notion', 'gcal']),
 'Teams': ("Every team, its own copy-paste?", "Route leads to the rep on shift, answer order questions and onboard new hires in Slack.", [['hubspot', 'Sales', 'Leads routed'], ['whatsapp', 'Support', 'Answered'], ['xero', 'Finance', 'Reminders'], ['slack', 'HR', 'Onboarding']], ['hubspot', 'zendesk', 'xero', 'asana', 'slack', 'mailchimp', 'jira', 'notion']),
}
AUD = list(A.keys())
specs = []
def add(style, pal, **k): specs.append({'id': f'IMG-{len(specs) + 1:03d}', 'style': style, 'pal': pal, **k})
pal = itertools.cycle(PALS)
# 1) per audience: 6 formats each = 72
for a in AUD:
    pain, sent, nodes, apps = A[a]
    add('glass', next(pal), kicker=a.upper(), head=pain, sub='FansaChat fixes it in one sentence.')
    add('chatHero', next(pal), head=f'{a}: just say it.', em=['say'], prompt=sent)
    add('workflow', next(pal), head='One sentence. Whole workflow.', em=['Whole'], items=nodes)
    add('beforeAfter', next(pal), head=a, left=['Copy', 'Paste', 'Forget a step'], right=['One sentence', 'Built + tested', 'Runs by itself'])
    add(['checklist', 'bento', 'phone', 'orbit', 'clay', 'neubrutal'][AUD.index(a) % 6], next(pal), kicker=f'FOR {a.upper()}', head=f'Automate this, {a.lower()}', em=['this,'], items=[[n[0], n[1] + ' · ' + n[2], n[2]] for n in nodes], apps=apps)
    add(['tape', 'sketch', 'notebook', 'swiss', 'myth', 'neon'][AUD.index(a) % 6], next(pal), head='Stop copy-pasting. Start saying it.', sub=pain, items=[[n[0], n[1]] for n in nodes])
# 2) brand / claims / education = 28
add('minimal', 'B1', head='Automation, in plain English.', em=['plain', 'English.'], sub='Type it. FansaChat builds it.')
add('stat', 'B3', kicker='700+', head='apps, one chat.', sub='Gmail, Shopify, HubSpot, Notion, Slack…')
add('stat', 'D1', kicker='478', head='templates. Or just say it.')
add('stat', 'D2', kicker='22', head='verified MCP servers.', sub='AI that can actually act.')
add('compare', 'B2', head='Runs, not steps.', em=['not'], left=['Billed per step', '5 steps = 5 charges', 'Breaks quietly'], right=['Billed per run', '5 steps = 1 run', 'Tested before it runs'])
add('compare', 'D3', head='Seats vs runs.', left=['Pay per seat', 'Bill grows with team'], right=['Unlimited users', 'Pay for finished runs'])
add('faq', 'B1', head='What is FansaChat?', sub='An AI tool that turns one sentence into a working automation across 700+ apps.')
add('faq', 'B5', head='What is a workflow run?', sub='One finished job, start to end. 3 steps or 30, it counts as one run.')
add('faq', 'D4', head='Do I need to code?', sub='No. Describe the task in plain English. FansaChat builds and tests it.')
add('faq', 'B8', head='How much does it cost?', sub='From $15 a month. Users and workflows are unlimited on every plan.')
add('myth', 'B7', head='Automation is for engineers.', sub='If you can describe it, you can automate it.')
add('myth', 'B6', head='Flowcharts are the only way.', sub='One sentence builds the same flow.')
add('quote', 'B4', quote='The best automation is the one you can explain to a friend.', sub='FansaChat')
add('quote', 'D1', quote='Stop learning tools. Start describing work.', sub='FansaChat')
add('tweet', 'B3', quote='Typed one sentence. Got a tested workflow across Stripe, WhatsApp and Notion. That is the whole product.')
add('tweet', 'B2', quote='Automation should feel like texting a friend, not wiring a circuit board.')
add('chatScreenshot', 'B4', kicker='Client · Bloom Studio', head='Reminders that send themselves.', items=[['them', 'Hey, sorry! Paying today 🙏'], ['me', '(sent automatically by FansaChat ✓)']])
add('editorial', 'B1', head='The one-sentence workflow.', sub='How plain English replaced 40-box flowcharts.')
add('brutal', 'B1', head='COPY. PASTE. NEVER AGAIN.', sub='> one sentence → workflow')
add('retro', 'D1', head='Work smarter, since 2026.')
add('neon', 'D2', head='Your apps. One brain.', sub='FansaChat · 700+ integrations')
add('neon', 'D4', head='Tested before it runs.', sub='Every step checked.')
add('orbit', 'B5', head='Every app, one conversation.', apps=['gmail', 'shopify', 'hubspot', 'notion', 'slack', 'stripe', 'whatsapp', 'telegram'])
add('bento', 'B1', head='What FansaChat does', items=[['💬', 'You type it', 'plain English'], ['⚙️', 'It builds it', 'apps, steps, fields'], ['✓', 'It tests it', 'before it runs'], ['🔁', 'It runs it', 'while you rest'], ['👥', 'Unlimited users', 'every plan']])
add('founder', 'B1', quote='I built FansaChat because I was tired of copy-pasting between apps. Now you can just say what you need.')
add('founder', 'B2', quote='Built in Bangladesh, by one founder, for anyone who is tired of busywork.')
add('glass', 'D1', kicker='TELEGRAM', head='One free automation, every day.', sub='t.me/fansachat')
add('minimal', 'D3', head='Join the waitlist.', em=['waitlist.'], sub='fansachat.com')
assert len(specs) == 100, len(specs)
json.dump(specs, open('src/img/specs.json', 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print(len(specs), 'images,', len({s['style'] for s in specs}), 'styles')
