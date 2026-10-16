"""Shared call-to-action for every production image (founder rule 2026-10-16):
a big 'Join the waitlist' button + a 'FansaChat Community' Telegram button (t.me/fansachat, verified)."""
import pathlib
TG = (pathlib.Path(__file__).parent / "icons" / "telegram-bot.png").as_uri()

def cta(left, top, fs=28, stack=False, gap=16, dark=False):
    h = round(fs * 2.3)
    join = (f'<div data-rank="3" style="display:inline-flex;align-items:center;justify-content:center;height:{h}px;padding:0 {fs}px;border-radius:999px;'
            f'background:linear-gradient(135deg,#7B5CE0,#6468D8);color:#fff;font-weight:700;font-size:{fs}px;white-space:nowrap;'
            f'box-shadow:0 10px 24px rgba(91,70,200,.35),inset 0 1px 0 rgba(255,255,255,.35)">Join the waitlist →</div>')
    tg = (f'<div style="display:inline-flex;align-items:center;gap:{fs // 2}px;height:{h}px;padding:0 {fs}px 0 {fs // 2}px;border-radius:999px;'
          f'background:{"rgba(255,255,255,.12)" if dark else "#fff"};border:2px solid {"rgba(255,255,255,.5)" if dark else "#2AABEE"};white-space:nowrap">'
          f'<img src="{TG}" style="width:{h - 18}px;height:{h - 18}px;border-radius:50%">'
          f'<span data-rank="4" style="font-weight:700;font-size:{round(fs * .86)}px;color:{"#fff" if dark else "#16122C"}">FansaChat Community</span>'
          f'<span data-rank="5" style="font-size:{round(fs * .64)}px;color:{"#CFE9FF" if dark else "#2AABEE"};font-weight:700">t.me/fansachat</span></div>')
    flow = "column;align-items:flex-start" if stack else "row;align-items:center"
    return f'<div class="abs" style="left:{left}px;top:{top}px;display:flex;flex-direction:{flow};gap:{gap}px">{join}{tg}</div>'
