# Week 1 specs (W1-04..W1-14): problem -> FansaChat solution per audience. Writes src/specs/<id>.json
# Each: 4-5 real tools of that audience (Activepieces pieces), email at most once, own colour structure,
# camera moves vary (right/down/zoom/whip/iris/up), hero = blue orb.
import json

def H(x, y, mood='happy', size=200): return {'x': x, 'y': y, 'mood': mood, 'size': size}
def title(text, y=0.18, size=110, style='blur', em=None, x=0.5, **k): d = {'t': 'title', 'text': text, 'size': size, 'style': style, 'x': x, 'y': y}; d.update(k); d['em'] = em or []; return d
def chat_beat(prompt, go='right', hero=None): return {'dur': 165, 'go': go, 'hero': hero or H(0.88, 0.2, 'wow', 150), 'els': [{'t': 'chat', 'text': prompt, 'typeDur': 125, 'x': 0.5, 'y': 0.52, 'cw': 1300, 'p45': {'cw': 860}}]}
def flow_beat(line, nodes, go='down', layout='snake'): return {'line': line, 'go': go, 'hold': 70, 'hero': H(0.9, 0.86, 'happy', 160), 'els': [{'t': 'flow', 'nodes': nodes, 'layout': layout, 'layout45': 'col', 'x': 0.5, 'y': 0.5, 'p45': {'s': 0.8}}]}
def end_beat(line, tag, apps, go='zoom'): return {'line': line, 'go': go, 'focus': [0.5, 0.5], 'els': [{'t': 'end', 'tag': tag, 'apps': apps, 'ctaWord': 'join', 'x': 0.5, 'y': 0.5}]}
def tell_beat(line, go='zoom'): return {'line': line, 'go': go, 'focus': [0.5, 0.35], 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('So tell FansaChat, once.', y=0.45, size=120, em=['FansaChat,', 'once.'])]}
def phone_beat(line, head, notes, go='right', em=None): return {'line': line, 'go': go, 'hero': H(0.12, 0.84, 'wink', 180), 'els': [title(head, y=0.4, size=96, align='left', x=0.3, em=em or [], p45={'x': 0.5, 'y': 0.12, 's': 0.85}), {'t': 'phone', 'notes': notes, 'x': 0.74, 'y': 0.5, 'ps': 1.05, 'p45': {'x': 0.5, 'y': 0.58, 'ps': 0.95}}]}

S = {}
# ---------- W1-04 Designers · B4 green ----------
S['W1-04'] = {'pal': 'B4', 'audience': 'designers', 'lines': [
  "Designers: the client sent feedback.",
  "In Figma. On WhatsApp. In a voice note. In a Slack thread.",
  "Version twelve. Final final. Really final.",
  "You spend more time finding feedback than designing.",
  "So tell FansaChat, once.",
  "It builds the flow, and tests it.",
  "Every comment lands in one Notion board. Sorted.",
  "Less hunting. More designing.",
  "FansaChat. Feedback, organised for you. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78), 'els': [title('Feedback is in.', style='flip', y=0.2, size=118), {'t': 'card', 'icon': 'figma', 'title': 'New comment', 'sub': '“Can we make the logo pop more?”', 'x': 0.45, 'y': 0.58, 'word': 'feedback', 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'wow', 180), 'els': [title('Everywhere at once.', y=0.14, em=['Everywhere']), {'t': 'cloud', 'apps': ['figma', 'whatsapp', 'slack', 'gmail', 'notion', 'trello', 'canva', 'dropbox'], 'x': 0.5, 'y': 0.54, 'word': 'figma'}]},
  {'line': 2, 'go': 'whip', 'hero': H(0.86, 0.8, 'meh', 190), 'els': [{'t': 'pile', 'items': [['figma', 'logo_v12_final_FINAL.fig', 'changes requested'], ['dropbox', 'logo_v11_final.png', 'outdated'], ['canva', 'logo_v10.png', 'outdated'], ['figma', 'logo_v9_really_final', 'outdated']], 'x': 0.4, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.5}}, title('FINAL FINAL.', style='tape', size=110, x=0.72, y=0.2, word='final', p45={'x': 0.5, 'y': 0.13})]},
  {'line': 3, 'go': 'down', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [{'t': 'compare', 'left': {'t': 'Finding feedback', 'rows': [], 'meter': 0.8}, 'right': {'t': 'Designing', 'rows': [], 'meter': 0.25}, 'x': 0.5, 'y': 0.48, 'cw': 1400}]},
  tell_beat(4),
  chat_beat("When a client comments in Figma, messages me on WhatsApp or posts in Slack, add it as a task on my Notion feedback board, tagged by project, and ping me on Telegram."),
  flow_beat(5, [['figma', 'Figma', 'New comment'], ['whatsapp', 'WhatsApp', 'Client message'], ['slack', 'Slack', 'Thread reply'], ['notion', 'Notion', 'Task on board'], ['telegram', 'Telegram', 'Ping you']]),
  phone_beat(6, 'One board. Every comment.', [['notion', 'Feedback added ✓', 'Bloom Studio · logo'], ['figma', 'New Figma comment synced ✓', 'Tagged: v12'], ['telegram', '3 new comments today', 'All in Notion']], em=['Every', 'comment.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Less hunting.', style='roll', y=0.32, size=120), title('More designing.', style='flip', y=0.55, size=120, word='more')]},
  end_beat(8, 'Feedback, organised for you.', ['figma', 'notion', 'slack', 'whatsapp', 'canva', 'trello', 'dropbox', 'telegram', 'drive'])]}

# ---------- W1-05 Developers · D2 navy-neon ----------
S['W1-05'] = {'pal': 'D2', 'audience': 'developers', 'lines': [
  "Another bug report. In your DMs. Again.",
  "Discord. X. A screenshot. No steps to reproduce.",
  "You copy it into GitHub. Then tell the team. Then forget.",
  "Your real work keeps getting interrupted.",
  "So tell FansaChat, once.",
  "It builds the flow, and tests it.",
  "Bugs become GitHub issues, with labels, automatically.",
  "Ship code. Not copy-paste.",
  "FansaChat. Bugs sorted before you open the laptop. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'meh'), 'els': [title('Bug report. In your DMs.', style='flip', y=0.2, size=104), {'t': 'card', 'icon': 'discord', 'title': '“the button is broken lol”', 'sub': 'no steps · no browser · no version', 'x': 0.45, 'y': 0.58, 'badge': 'BUG', 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'wow', 180), 'els': [title('From everywhere.', y=0.14, em=['everywhere.']), {'t': 'cloud', 'apps': ['discord', 'x', 'slack', 'telegram', 'github', 'linear', 'sentry', 'gmail'], 'x': 0.5, 'y': 0.54}]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.8, 'meh', 190), 'els': [{'t': 'pile', 'items': [['slack', 'Told the team', 'later'], ['github', 'Issue #482 (copied)', 'no labels'], ['discord', 'Screenshot saved', 'missing info'], ['x', 'DM: “still broken?”', 'unread']], 'x': 0.4, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.5}}, title('COPY. PASTE. FORGET.', style='tape', size=84, x=0.72, y=0.2, word='forget', p45={'x': 0.5, 'y': 0.13})]},
  {'line': 3, 'go': 'whip', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [title('Interrupted.', style='roll', y=0.32, size=140), {'t': 'badges', 'n': 9, 'r': 340, 'x': 0.5, 'y': 0.36, 'glyph': '!'}]},
  tell_beat(4),
  chat_beat("When someone reports a bug on Discord or fills my bug form, create a GitHub issue with labels and the screenshot, post it in our Slack dev channel, and ask the reporter for steps if they're missing."),
  flow_beat(5, [['discord', 'Discord', 'Bug message'], ['googleforms', 'Bug form', 'New report'], ['github', 'GitHub', 'Issue + labels'], ['slack', 'Slack', '#dev alert'], ['discord', 'Reply', 'Ask for steps']]),
  phone_beat(6, 'Bugs become issues. Automatically.', [['github', 'Issue #483 created ✓', 'labels: bug, ui'], ['slack', '#dev notified ✓', '1 new bug'], ['discord', 'Reporter asked for steps ✓', 'reply sent']], em=['Automatically.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Ship code.', style='roll', y=0.32, size=130), {'t': 'strike', 'text': 'Not copy-paste.', 'size': 96, 'x': 0.5, 'y': 0.55, 'word': 'not'}, {'t': 'conveyor', 'apps': ['github', 'gitlab', 'linear', 'jira', 'sentry', 'vercel', 'slack', 'discord'], 'x': 0, 'y': 0.82}]},
  end_beat(8, 'Bugs sorted before you open the laptop.', ['github', 'gitlab', 'linear', 'jira', 'sentry', 'vercel', 'slack', 'discord', 'notion'])]}

# ---------- W1-06 Online shop owners · B6 coral ----------
S['W1-06'] = {'pal': 'B6', 'audience': 'online shop owners', 'lines': [
  "New order! Love that sound.",
  "Now copy the address. Update the sheet. Message the courier.",
  "Forty orders later, it's midnight.",
  "And one typo means a parcel goes to the wrong city.",
  "So tell FansaChat, once.",
  "It builds the flow, and tests it.",
  "Orders log themselves. Customers get updates. You get sleep.",
  "Sell more. Copy nothing.",
  "FansaChat. Your shop, on autopilot. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'wow'), 'els': [title('Cha-ching! 🛍️', style='flip', y=0.2, size=118), {'t': 'notif', 'icon': 'shopify', 'title': 'New order #1046', 'sub': '2 items · $86.00', 'x': 0.45, 'y': 0.55, 'p45': {'x': 0.5, 'y': 0.5}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.85, 'meh', 180), 'els': [{'t': 'list', 'items': [['shopify', 'Copy address from order'], ['sheets', 'Paste into orders sheet'], ['whatsapp', 'Message the courier'], ['instagram', 'Reply to the customer DM']], 'x': 0.45, 'y': 0.52, 'cw': 1000, 'p45': {'x': 0.5, 'cw': 900}}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.84, 'meh', 190), 'els': [{'t': 'counter', 'label': 'ORDERS', 'from': 1, 'to': 40, 'size': 110, 'x': 0.5, 'y': 0.32}, title("It's midnight.", style='roll', y=0.56, size=110, word='midnight')]},
  {'line': 3, 'go': 'whip', 'hero': H(0.86, 0.8, 'wow', 190), 'els': [{'t': 'card', 'icon': '📦', 'title': 'Ship to: Dhaka → Dubai?', 'sub': 'one typo in the address', 'badge': 'WRONG CITY', 'x': 0.45, 'y': 0.5, 'p45': {'x': 0.5}}, {'t': 'badges', 'n': 6, 'r': 300, 'x': 0.45, 'y': 0.5}]},
  tell_beat(4),
  chat_beat("When a Shopify order comes in, add it to my Google Sheet, send the customer a WhatsApp confirmation, message my courier with the address, and warn me on Telegram when stock drops under five."),
  flow_beat(5, [['shopify', 'Shopify', 'New order'], ['sheets', 'Google Sheets', 'Add row'], ['whatsapp', 'WhatsApp', 'Customer update'], ['telegram', 'Courier', 'Pickup + address'], ['telegram', 'Telegram', 'Low-stock alert']]),
  phone_beat(6, 'Orders log themselves.', [['shopify', 'Order #1046 logged ✓', 'row 412 · Sheets'], ['whatsapp', 'Customer updated ✓', '“Your order is packed!”'], ['telegram', 'Low stock: Tote bag (4)', 'reorder soon']], em=['themselves.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Sell more.', style='flip', y=0.32, size=130), {'t': 'strike', 'text': 'Copy nothing.', 'size': 96, 'x': 0.5, 'y': 0.55, 'word': 'copy'}, {'t': 'conveyor', 'apps': ['shopify', 'woo', 'etsy', 'stripe', 'paypal', 'whatsapp', 'instagram', 'sheets'], 'x': 0, 'y': 0.82}]},
  end_beat(8, 'Your shop, on autopilot.', ['shopify', 'woo', 'etsy', 'stripe', 'paypal', 'whatsapp', 'instagram', 'sheets', 'klaviyo'])]}

# ---------- W1-07 Agency owners (10 people) · D1 ink-violet ----------
S['W1-07'] = {'pal': 'D1', 'audience': 'agency owners', 'lines': [
  "You run an agency. Ten people. Forty tools.",
  "A new client signs, and the chaos starts.",
  "Someone makes the CRM deal. Someone opens the project. Someone forgets the Slack channel.",
  "Day one, and the client already feels lost.",
  "So tell FansaChat, once.",
  "It builds the whole onboarding, and tests it.",
  "One signed form. Everything set up in a minute.",
  "Your team does the creative work. Not the admin.",
  "FansaChat. One chat for the whole team. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.8), 'els': [title('10 people. 40 tools.', style='flip', y=0.18, size=118), {'t': 'cloud', 'apps': ['hubspot', 'clickup', 'slack', 'notion', 'figma', 'drive', 'docusign', 'calendly', 'asana', 'gmail', 'zoom', 'canva'], 'x': 0.5, 'y': 0.56}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.86, 'wow', 180), 'els': [{'t': 'card', 'icon': 'docusign', 'title': 'Contract signed ✍️', 'sub': 'North & Co · $4,800/mo retainer', 'x': 0.5, 'y': 0.36}, title('…and the chaos starts.', y=0.62, size=96, em=['chaos'])]},
  {'line': 2, 'go': 'down', 'hold': 10, 'hero': H(0.86, 0.82, 'meh', 180), 'els': [{'t': 'list', 'items': [['hubspot', 'Create the CRM deal (manually)'], ['clickup', 'Open the project + tasks'], ['slack', 'Make the client channel… forgot'], ['drive', 'Shared folder… which one?']], 'x': 0.45, 'y': 0.52, 'cw': 1050, 'p45': {'x': 0.5, 'cw': 920}}]},
  {'line': 3, 'go': 'whip', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [title('Day 1. Client: “Hello?”', style='tape', size=96, y=0.36), {'t': 'badges', 'n': 8, 'r': 330, 'x': 0.5, 'y': 0.4}]},
  tell_beat(4),
  chat_beat("When a contract is signed in DocuSign, create the deal in HubSpot, open a ClickUp project from our template, make a Slack channel with the client, share a Google Drive folder and send the welcome pack."),
  flow_beat(5, [['docusign', 'DocuSign', 'Contract signed'], ['hubspot', 'HubSpot', 'Deal created'], ['clickup', 'ClickUp', 'Project from template'], ['slack', 'Slack', 'Client channel'], ['drive', 'Google Drive', 'Shared folder'], ['gmail', 'Welcome pack', 'Sent']], layout='snake'),
  phone_beat(6, 'Signed form. Set up in a minute.', [['hubspot', 'Deal created ✓', 'North & Co'], ['clickup', 'Project ready ✓', '24 tasks assigned'], ['slack', '#north-co created ✓', 'client invited']], em=['minute.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Creative work.', style='roll', y=0.32, size=130), {'t': 'strike', 'text': 'Not the admin.', 'size': 96, 'x': 0.5, 'y': 0.55, 'word': 'not'}, {'t': 'orbit', 'apps': ['hubspot', 'clickup', 'slack', 'notion', 'figma', 'drive', 'docusign', 'calendly'], 'r': 380, 'x': 0.5, 'y': 0.82}]},
  end_beat(8, 'One chat for the whole team.', ['hubspot', 'clickup', 'slack', 'notion', 'figma', 'drive', 'docusign', 'calendly', 'asana', 'zoom'])]}

# ---------- W1-08 SMB ops managers · B5 lilac ----------
S['W1-08'] = {'pal': 'B5', 'audience': 'small business operations', 'lines': [
  "Monday, nine a.m. Time for the weekly report.",
  "Sales from Stripe. Leads from HubSpot. Tasks from Asana.",
  "Copy, paste, chart, check. Three hours, gone.",
  "And by Friday, nobody remembers the numbers.",
  "So tell FansaChat, once.",
  "It builds the report flow, and tests it.",
  "Every Monday at eight, the report is already waiting.",
  "Your morning is yours again.",
  "FansaChat. Reports that write themselves. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'meh'), 'els': [title('Monday. 9:00 AM.', style='flip', y=0.2, size=120), {'t': 'card', 'icon': 'gcal', 'title': 'Weekly report', 'sub': 'due 10:00 · recurring', 'x': 0.45, 'y': 0.58, 'badge': 'TODAY', 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'wow', 180), 'els': [{'t': 'card', 'icon': 'stripe', 'title': 'Sales', 'big': '$12,480', 'x': 0.2, 'y': 0.48, 'word': 'sales', 'p45': {'x': 0.5, 'y': 0.22, 's': 0.8}}, {'t': 'card', 'icon': 'hubspot', 'title': 'New leads', 'big': '64', 'x': 0.5, 'y': 0.48, 'word': 'leads', 'p45': {'x': 0.5, 'y': 0.47, 's': 0.8}}, {'t': 'card', 'icon': 'asana', 'title': 'Tasks done', 'big': '38', 'x': 0.8, 'y': 0.48, 'word': 'tasks', 'p45': {'x': 0.5, 'y': 0.72, 's': 0.8}}]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [title('COPY. PASTE. CHART. CHECK.', style='tape', size=78, y=0.24), {'t': 'counter', 'label': 'HOURS', 'from': 0, 'to': 3, 'suffix': 'h', 'size': 110, 'x': 0.5, 'y': 0.56, 'bg': '#E8362B', 'word': 'three'}]},
  {'line': 3, 'go': 'iris', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [title('Friday: “what were the numbers?”', y=0.4, size=96, em=['numbers?”'])]},
  tell_beat(4),
  chat_beat("Every Monday at 8 a.m., pull last week's Stripe sales, new HubSpot leads and finished Asana tasks into a Google Sheet, then post a short summary in Slack and email it to the team."),
  flow_beat(5, [['gcal', 'Schedule', 'Mon 8:00'], ['stripe', 'Stripe', 'Last week sales'], ['hubspot', 'HubSpot', 'New leads'], ['asana', 'Asana', 'Tasks done'], ['sheets', 'Google Sheets', 'Report row'], ['slack', 'Slack', 'Summary posted']]),
  phone_beat(6, 'Report ready at 8:00.', [['slack', 'Weekly report posted ✓', '$12,480 · 64 leads · 38 tasks'], ['sheets', 'Sheet updated ✓', 'Week 41'], ['gmail', 'Team emailed ✓', '8:00 AM']], em=['8:00.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Your morning.', style='roll', y=0.34, size=130), title('Yours again. ☕', style='flip', y=0.56, size=110, word='yours')]},
  end_beat(8, 'Reports that write themselves.', ['stripe', 'hubspot', 'asana', 'sheets', 'slack', 'gmail', 'airtable', 'notion', 'gcal'])]}

# ---------- W1-09 Sales teams · B2 orange ----------
S['W1-09'] = {'pal': 'B2', 'audience': 'sales teams', 'lines': [
  "A hot lead filled your form at eleven p.m.",
  "Nobody saw it until the next afternoon.",
  "By then, they'd booked a call with someone else.",
  "Slow replies lose deals. Every single day.",
  "So tell FansaChat, once.",
  "It builds the lead flow, and tests it.",
  "New lead? Reply in seconds. Rep assigned. Call booked.",
  "Hot leads stay hot.",
  "FansaChat. Never miss a lead again. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'wow'), 'els': [title('🔥 Hot lead. 11:02 PM.', style='flip', y=0.2, size=110), {'t': 'card', 'icon': 'typeform', 'title': 'Priya K. · Head of Growth', 'sub': '“Need a demo this week”', 'x': 0.45, 'y': 0.58, 'badge': 'HOT', 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.86, 'meh', 180), 'els': [{'t': 'counter', 'label': 'HOURS WAITING', 'from': 0, 'to': 15, 'suffix': 'h', 'size': 110, 'x': 0.5, 'y': 0.4, 'bg': '#E8362B'}, title('…unread.', style='roll', y=0.62, size=100)]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [{'t': 'card', 'icon': 'calendly', 'title': 'Call booked', 'sub': 'with your competitor', 'x': 0.45, 'y': 0.46, 'badge': 'LOST', 'p45': {'x': 0.5}}, {'t': 'stamp', 'text': 'GONE', 'color': '#E8362B', 'x': 0.7, 'y': 0.32, 'word': 'someone'}]},
  {'line': 3, 'go': 'whip', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [title('Slow replies lose deals.', style='tape', size=96, y=0.36), {'t': 'badges', 'n': 7, 'r': 320, 'x': 0.5, 'y': 0.4}]},
  tell_beat(4),
  chat_beat("When someone fills my Typeform, add them to HubSpot, assign the rep on shift, send them my Calendly link on WhatsApp within a minute, and alert the team in Slack."),
  flow_beat(5, [['typeform', 'Typeform', 'New lead'], ['hubspot', 'HubSpot', 'Contact + deal'], ['salesforce', 'Assign rep', 'Round robin'], ['whatsapp', 'WhatsApp', 'Calendly link'], ['slack', 'Slack', '#sales alert']]),
  phone_beat(6, 'Reply in seconds.', [['whatsapp', 'Priya got your link ✓', '23 seconds after the form'], ['hubspot', 'Deal assigned to Sam ✓', 'Stage: Demo'], ['calendly', 'Demo booked ✓', 'Thu 10:30']], em=['seconds.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Hot leads', style='flip', y=0.32, size=130), title('stay hot. 🔥', style='roll', y=0.55, size=130, word='stay')]},
  end_beat(8, 'Never miss a lead again.', ['typeform', 'hubspot', 'salesforce', 'calendly', 'whatsapp', 'slack', 'linkedin', 'zoom', 'gmail'])]}

# ---------- W1-10 Support teams · B3 sky ----------
S['W1-10'] = {'pal': 'B3', 'audience': 'support teams', 'lines': [
  "“Where's my order?” The same question. Fifty times a day.",
  "On WhatsApp. On Instagram. On Messenger. In your inbox.",
  "You answer the same thing, again and again.",
  "And the hard tickets wait at the bottom.",
  "So tell FansaChat, once.",
  "It builds the support flow, and tests it.",
  "Easy questions answered. Hard ones routed to the right person.",
  "Your team helps people. Not the same answer, fifty times.",
  "FansaChat. Support that keeps up. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'meh'), 'els': [title('“Where’s my order?”', style='flip', y=0.2, size=112), {'t': 'counter', 'label': 'TODAY', 'from': 1, 'to': 50, 'suffix': '×', 'size': 100, 'x': 0.5, 'y': 0.56, 'word': 'fifty'}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'wow', 180), 'els': [{'t': 'cloud', 'apps': ['whatsapp', 'instagram', 'facebook', 'gmail', 'zendesk', 'intercom', 'telegram', 'x'], 'x': 0.5, 'y': 0.52}]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [{'t': 'pile', 'items': [['instagram', '“where is my order??”', 'unanswered'], ['whatsapp', '“order status pls”', 'unanswered'], ['facebook', '“hello? my order”', 'unanswered'], ['gmail', 'RE: RE: my order', 'unanswered']], 'x': 0.42, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.5}}, title('AGAIN.', style='tape', size=120, x=0.74, y=0.2, word='again', p45={'x': 0.5, 'y': 0.13})]},
  {'line': 3, 'go': 'iris', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [{'t': 'card', 'icon': 'zendesk', 'title': 'Refund dispute · urgent', 'sub': 'waiting 2 days', 'badge': 'BURIED', 'x': 0.5, 'y': 0.46}]},
  tell_beat(4),
  chat_beat("When a customer asks about their order on WhatsApp, Instagram or Messenger, look it up in Shopify and reply with the tracking link. If it's a refund or complaint, open a Zendesk ticket for the right agent."),
  flow_beat(5, [['whatsapp', 'WhatsApp', 'Question in'], ['instagram', 'Instagram', 'DM in'], ['shopify', 'Shopify', 'Find order'], ['whatsapp', 'Reply', 'Tracking link'], ['zendesk', 'Zendesk', 'Ticket if refund']]),
  phone_beat(6, 'Easy ones answered.', [['whatsapp', 'Tracking link sent ✓', 'Order #1046 · out for delivery'], ['instagram', 'DM answered ✓', 'in 12 seconds'], ['zendesk', 'Refund ticket → Ana ✓', 'priority: high']], em=['answered.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Help people.', style='flip', y=0.32, size=130), {'t': 'strike', 'text': 'Same answer ×50', 'size': 96, 'x': 0.5, 'y': 0.55, 'word': 'same'}]},
  end_beat(8, 'Support that keeps up.', ['whatsapp', 'instagram', 'facebook', 'zendesk', 'intercom', 'freshdesk', 'shopify', 'telegram', 'slack'])]}

# ---------- W1-11 Recruiters / HR · B7 yellow-cobalt ----------
S['W1-11'] = {'pal': 'B7', 'audience': 'recruiters and HR', 'lines': [
  "You posted one job. You got one hundred and twenty CVs.",
  "In your inbox. On LinkedIn. In a form. As a photo.",
  "Download, rename, sort, reply. One by one.",
  "And the best candidate? Hired by someone faster.",
  "So tell FansaChat, once.",
  "It builds the hiring flow, and tests it.",
  "Every CV filed. Every candidate answered. Interviews booked.",
  "Spend your time on people, not paperwork.",
  "FansaChat. Hiring, without the inbox chaos. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'wow'), 'els': [title('1 job post.', style='flip', y=0.2, size=118), {'t': 'counter', 'label': 'CVs', 'from': 0, 'to': 120, 'size': 120, 'x': 0.5, 'y': 0.55, 'word': 'hundred'}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'meh', 180), 'els': [{'t': 'cloud', 'apps': ['gmail', 'linkedin', 'googleforms', 'whatsapp', 'drive', 'outlook', 'dropbox', 'notion'], 'x': 0.5, 'y': 0.52}]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [{'t': 'pile', 'items': [['drive', 'CV_final_v2(1).pdf', 'unsorted'], ['gmail', 'Application – Designer', 'no reply'], ['linkedin', 'InMail: “any update?”', 'no reply'], ['googleforms', 'Form response #87', 'unread']], 'x': 0.42, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.5}}, title('ONE BY ONE.', style='tape', size=110, x=0.74, y=0.2, word='one', p45={'x': 0.5, 'y': 0.13})]},
  {'line': 3, 'go': 'whip', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [{'t': 'card', 'icon': 'linkedin', 'title': 'Ana T. accepted an offer', 'sub': 'at another company', 'badge': 'TOO LATE', 'x': 0.5, 'y': 0.46}]},
  tell_beat(4),
  chat_beat("When a CV arrives by email or my Google Form, save it in a Drive folder for that role, add the candidate to Airtable, send a thank-you reply, and send my Calendly link to anyone I mark as shortlisted."),
  flow_beat(5, [['googleforms', 'Google Form', 'New application'], ['drive', 'Google Drive', 'CV filed by role'], ['airtable', 'Airtable', 'Candidate row'], ['gmail', 'Reply', 'Thank-you sent'], ['calendly', 'Calendly', 'Interview link']]),
  phone_beat(6, 'Every CV filed.', [['airtable', '120 candidates sorted ✓', 'by role + date'], ['gmail', 'Everyone replied to ✓', 'thank-you sent'], ['calendly', 'Interview booked ✓', 'Ana T. · Tue 11:00']], em=['filed.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('People.', style='flip', y=0.32, size=140), {'t': 'strike', 'text': 'Not paperwork.', 'size': 96, 'x': 0.5, 'y': 0.55, 'word': 'not'}]},
  end_beat(8, 'Hiring, without the inbox chaos.', ['linkedin', 'gmail', 'googleforms', 'drive', 'airtable', 'calendly', 'zoom', 'notion', 'slack'])]}

# ---------- W1-12 Coaches / consultants · B4 green (variant via D? keep B8 mint) ----------
S['W1-12'] = {'pal': 'B8', 'audience': 'coaches and consultants', 'lines': [
  "A client booked a session. Amazing.",
  "Now send the Zoom link. The intake form. The invoice. The reminder.",
  "Forget one, and they show up confused. Or don't show up at all.",
  "You became a coach, not an assistant.",
  "So tell FansaChat, once.",
  "It builds the booking flow, and tests it.",
  "Booked? Everything goes out. Reminders included.",
  "Show up. Coach. That's it.",
  "FansaChat. Your bookings, handled. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'happy'), 'els': [title('New booking! 🎉', style='flip', y=0.2, size=118), {'t': 'card', 'icon': 'calendly', 'title': 'Session with Mia', 'sub': 'Thu 4:00 PM · 60 min', 'x': 0.45, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.85, 'meh', 180), 'els': [{'t': 'list', 'items': [['zoom', 'Send the Zoom link'], ['googleforms', 'Send the intake form'], ['stripe', 'Send the invoice'], ['whatsapp', 'Remind 1 hour before']], 'x': 0.45, 'y': 0.52, 'cw': 1000, 'p45': {'x': 0.5, 'cw': 900}}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.84, 'wow', 190), 'els': [{'t': 'card', 'icon': 'zoom', 'title': 'Waiting room · 0 people', 'sub': '4:12 PM', 'badge': 'NO-SHOW', 'x': 0.5, 'y': 0.44}]},
  {'line': 3, 'go': 'iris', 'hero': H(0.5, 0.82, 'meh', 200), 'els': [title('Coach.', style='roll', y=0.32, size=140), {'t': 'strike', 'text': 'Assistant.', 'size': 110, 'x': 0.5, 'y': 0.55, 'word': 'assistant'}]},
  tell_beat(4),
  chat_beat("When someone books on Calendly, send them the Zoom link and my intake form, create a Stripe invoice, add them to my Notion client list, and send a WhatsApp reminder one hour before."),
  flow_beat(5, [['calendly', 'Calendly', 'New booking'], ['zoom', 'Zoom', 'Meeting link'], ['googleforms', 'Intake form', 'Sent'], ['stripe', 'Stripe', 'Invoice'], ['notion', 'Notion', 'Client page'], ['whatsapp', 'WhatsApp', 'Reminder −1h']]),
  phone_beat(6, 'Booked? Handled.', [['zoom', 'Zoom link sent ✓', 'Mia · Thu 4:00'], ['stripe', 'Invoice paid ✓', '$120.00'], ['whatsapp', 'Reminder sent ✓', '1 hour before']], em=['Handled.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [title('Show up. Coach.', style='flip', y=0.34, size=120), title("That's it.", style='roll', y=0.56, size=110, word='that')]},
  end_beat(8, 'Your bookings, handled.', ['calendly', 'zoom', 'stripe', 'notion', 'whatsapp', 'googleforms', 'gcal', 'paypal', 'telegram'])]}

# ---------- W1-13 Beginners / solopreneurs · B1 white ----------
S['W1-13'] = {'pal': 'B1', 'audience': 'beginners and solopreneurs', 'lines': [
  "You tried learning automation once.",
  "Triggers. Webhooks. Forty boxes on a canvas.",
  "Three tutorials later, nothing actually works.",
  "Here's the secret: you don't need to learn any of it.",
  "Just tell FansaChat what you want.",
  "It builds the workflow, and tests it for you.",
  "Your first automation, running in a minute.",
  "Starts at fifteen dollars a month.",
  "FansaChat. Automation in plain English. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.84, 0.78, 'meh'), 'els': [title('Learning automation…', style='flip', y=0.22, size=112), {'t': 'card', 'icon': 'youtube', 'title': 'Tutorial 1 of 37', 'sub': '2:14:08', 'x': 0.45, 'y': 0.58, 'p45': {'x': 0.5, 'y': 0.52}}]},
  {'line': 1, 'go': 'right', 'hero': H(0.86, 0.85, 'wow', 180), 'els': [{'t': 'paths', 'l': 'Triggers · webhooks · 40 boxes', 'r': 'One sentence', 'x': 0.5, 'y': 0.42}]},
  {'line': 2, 'go': 'down', 'hero': H(0.5, 0.84, 'meh', 190), 'els': [{'t': 'card', 'icon': '⚠️', 'title': 'Error: step 14 failed', 'sub': 'invalid JSON in field “body”', 'badge': 'FAILED', 'badgeColor': '#E8362B', 'x': 0.5, 'y': 0.44}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.4], 'hero': H(0.86, 0.3, 'wink', 180), 'els': [title("You don't need to learn it.", style='flip', y=0.44, size=110)]},
  {'line': 4, 'go': 'right', 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('Just tell FansaChat.', y=0.45, size=120, em=['FansaChat.'])]},
  chat_beat("When someone fills my Google Form, add them to my Google Sheet, send them a welcome email, and message me on Telegram.", go='right'),
  flow_beat(5, [['googleforms', 'Google Form', 'New response'], ['sheets', 'Google Sheets', 'Add row'], ['gmail', 'Welcome email', 'Sent'], ['telegram', 'Telegram', 'Ping you']], layout='row'),
  phone_beat(6, 'Running in a minute.', [['sheets', 'Row added ✓', 'New signup: Leo M.'], ['gmail', 'Welcome sent ✓', 'to leo@…'], ['telegram', 'New signup! 🎉', 'Leo M.']], em=['minute.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.84, 'happy', 200), 'els': [{'t': 'counter', 'prefix': '$', 'from': 0, 'to': 15, 'suffix': '/month', 'size': 110, 'x': 0.5, 'y': 0.38}, title('Runs counted, not steps.', y=0.6, size=70, em=['runs'])]},
  end_beat(8, 'Automation, in plain English.', ['googleforms', 'sheets', 'gmail', 'telegram', 'notion', 'slack', 'calendly', 'stripe', 'whatsapp'])]}

# ---------- W1-14 Teams 10-200 (grand) · D3 charcoal-ember ----------
S['W1-14'] = {'pal': 'D3', 'audience': 'teams of 10 to 200', 'lines': [
  "Sales. Support. Finance. Ops. HR. Marketing.",
  "Every team has its own copy-paste job.",
  "And every team waits for someone to automate it.",
  "What if every role had its own flow, from one chat?",
  "So tell FansaChat what each team needs.",
  "It builds every flow, and tests each one.",
  "Leads routed. Tickets answered. Invoices sent. New hires onboarded.",
  "One plan for the whole team. Every role, one flow each.",
  "FansaChat. Your whole company, automated. Join the waitlist."],
 'beats': [
  {'line': 0, 'hero': H(0.88, 0.82, 'happy'), 'els': [{'t': 'carousel', 'items': [['Sales', '#FF8A3D'], ['Support', '#3D9BFF'], ['Finance', '#19A55A'], ['Ops', '#8C72FF'], ['HR', '#FF5A8A'], ['Marketing', '#FFC800']], 'words': ['sales', 'support', 'finance', 'ops', 'hr', 'marketing'], 'x': 0.5, 'y': 0.48}]},
  {'line': 1, 'go': 'right', 'hero': H(0.5, 0.88, 'meh', 180), 'els': [title('Every team. Its own copy-paste.', y=0.16, size=96, em=['copy-paste.']), {'t': 'cloud', 'apps': ['hubspot', 'zendesk', 'xero', 'asana', 'slack', 'gmail', 'sheets', 'mailchimp', 'jira', 'notion'], 'x': 0.5, 'y': 0.58}]},
  {'line': 2, 'go': 'down', 'hero': H(0.86, 0.82, 'meh', 180), 'els': [{'t': 'list', 'items': [['jira', 'IT ticket: “automate leads” — open 41 days'], ['slack', '“Can someone build a Zap?”'], ['notion', 'Automation wishlist (23 items)']], 'x': 0.45, 'y': 0.5, 'cw': 1150, 'p45': {'x': 0.5, 'cw': 960}}]},
  {'line': 3, 'go': 'zoom', 'focus': [0.5, 0.4], 'hero': H(0.88, 0.3, 'wow', 180), 'els': [title('Every role. Its own flow.', style='flip', y=0.44, size=112)]},
  {'line': 4, 'go': 'right', 'hero': H(0.88, 0.3, 'happy', 170), 'els': [title('One chat. Every team.', y=0.45, size=120, em=['Every', 'team.'])]},
  chat_beat("Route new HubSpot leads to the rep on shift, answer order questions on WhatsApp, send overdue invoice reminders from Xero, and onboard new hires in Slack and Notion.", go='right'),
  {'line': 5, 'go': 'down', 'hold': 60, 'hero': H(0.9, 0.86, 'happy', 160), 'els': [{'t': 'list', 'items': [['hubspot', 'Sales · leads routed to the rep on shift'], ['whatsapp', 'Support · order questions answered'], ['xero', 'Finance · overdue reminders'], ['slack', 'HR · new hires onboarded'], ['mailchimp', 'Marketing · new subscribers welcomed']], 'x': 0.5, 'y': 0.5, 'cw': 1250, 'p45': {'cw': 980}}]},
  phone_beat(6, 'Every team, handled.', [['hubspot', 'Lead → Sam ✓', 'in 9 seconds'], ['xero', '12 reminders sent ✓', 'Finance'], ['slack', 'Welcome, Ana! ✓', 'HR onboarding done']], em=['handled.']),
  {'line': 7, 'go': 'up', 'hero': H(0.5, 0.86, 'happy', 200), 'els': [title('One plan. Whole team.', style='flip', y=0.32, size=118), {'t': 'orbit', 'apps': ['hubspot', 'zendesk', 'xero', 'asana', 'slack', 'mailchimp', 'jira', 'notion'], 'r': 400, 'x': 0.5, 'y': 0.72}]},
  end_beat(8, 'Your whole company, automated.', ['hubspot', 'zendesk', 'xero', 'asana', 'slack', 'mailchimp', 'jira', 'notion', 'sheets', 'whatsapp'])]}

if __name__ == "__main__":
  for k, v in S.items():
    v["id"] = k
    json.dump(v, open(f"src/specs/{k}.json", "w", encoding="utf-8"), indent=1, ensure_ascii=False)
  print(len(S), "week-1 specs")
