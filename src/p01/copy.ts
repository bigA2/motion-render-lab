// P01 "Stop copying leads by hand" — copy verbatim from E:/fansachat-scripts/scripts/production/P01_leads_to_crm.md
export const VO = [
  "Small business owners — you're still copying every new lead into your CRM by hand.",
  'Open the form. Copy the name. Paste it in HubSpot. Then make a reminder you\'ll forget anyway.',
  "Let's fix that — in one sentence.",
  'When someone fills my Typeform, add them to HubSpot and create a follow-up task in ClickUp.',
  "That's it. FansaChat builds it — and every new lead lands in your CRM with a task, automatically.",
  'Join the waitlist — link in bio.',
];
export const CHECK = [
  {text: 'Copy lead', app: 'typeform'},
  {text: 'Paste in CRM', app: 'hubspot'},
  {text: 'Remind myself', app: 'clickup'},
];
export const TURN = ["let's", 'fix', 'that'];
// the sentence typed into the chat box, in fixed lines; keywords become the 3 nodes
export const SENTENCE = ['When someone fills my Typeform,', 'add them to HubSpot and create', 'a follow-up task in ClickUp.'];
export const KEYWORDS = ['Typeform', 'HubSpot', 'ClickUp'];
export const NODES = [
  {app: 'typeform', name: 'Typeform', action: 'New response'},
  {app: 'hubspot', name: 'HubSpot', action: 'Create contact'},
  {app: 'clickup', name: 'ClickUp', action: 'Create task “Follow up with {name}”'},
];
export const BUILDER = {title: 'Leads to CRM', meta: '3 steps · built from chat', run: 'Approve & Run', reply: 'Here it is — 3 steps. Tell me what to change.', placeholder: 'Describe a workflow…', done: '✓ Done', thinking: 'Thinking…', plan: 'Plan', planMeta: '3 steps'};
// plan checklist rows (each row becomes one node)
export const PLAN = ['New Typeform response', 'Create HubSpot contact', 'Create ClickUp follow-up task'];
export const END = {url: 'fansachat.com'};
