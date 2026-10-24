#!/usr/bin/env python3
"""Alight Motion (AM) XML project -> neutral JSON spec for src/templates/AMTemplate.tsx (stdlib only).

Usage: python -I scripts/am2json.py in.xml [-o out.json]

Schema (observed in real AM 5.0 exports, Oct 2026; there is no published spec):
  <scene width height fps totalTime(ms) bgcolor="#AARRGGBB">  root and nested (inside <embedScene>)
  layers: <shape s=".rect|.roundrect|.circle|.star|.plus|.arc" (no s + <path d> = free path)>, <text> + <content>,
          <embedScene> (precomp: own <scene>, own time base via inTime/speed), <nullobj> (parent-only),
          common attrs: id label startTime endTime(ms) parent(id in same scene) hidden blending fillType fillColor/fillImage
  <property name="size" type="vec2"> is a HALF extent (full box = 2*size).
  <transform><location|scale|rotation|opacity|pivot value="x,y[,z]"> or <kf t v e>: t is normalized to the layer's
  own duration (may be <0 or >1, unsorted); `e` on a keyframe shapes the segment INTO it (from the previous kf).
  <effect id="com.alightcreative...." hidden?> + <property name type value|kf>.

Neutral spec (all times in seconds, local to the layer's own scene):
  {fps, duration, size:{w,h}, background, layers:[Layer], unsupported:[{effect, layer}], warnings:[...]}
  Layer = {kind: shape|text|group|null, id, label, start, end, parent?, blend?, transform:{location,scale,rotation,opacity,pivot},
           shape?, size?:[w,h], radius?, path?, points?, fill?, stroke?, shadow?, text?, effects:[...], scene?}
  Anim value = static value | {"kf":[{t (s from layer start), v, ease}]} ; ease applies to the segment into that kf:
           "linear" | ["bezier",x1,y1,x2,y2] | ["elastic",...] | ["bounce",...] (elastic/bounce are approximated).
Media fills are not in the pack -> {"type":"placeholder"} + warning. Unmapped effects -> `unsupported`, never faked.
"""
import argparse, json, os, re, sys
import xml.etree.ElementTree as ET

TEXT_PX = 3.75  # AM text size unit -> px (calibrated: Roboto size 18 renders ~67px em at scale 1)
BLUR_UNIT = 0.1  # blur strength 1.0 ~= 10% of the root scene's short side (calibrated by eye)
LAYER_TAGS = ('shape', 'text', 'embedScene', 'nullobj')
SHAPES = {'.rect': 'rect', '.roundrect': 'roundrect', '.circle': 'ellipse', '.star': 'star', '.plus': 'plus'}
BLEND = {'diff': 'difference', 'hard-light': 'hard-light', 'soft-light': 'soft-light', 'multiply': 'multiply',
         'screen': 'screen', 'overlay': 'overlay', 'add': 'plus-lighter', 'lighten': 'lighten', 'darken': 'darken'}
BLUR_FX = ('gaussianblur', 'gaussianblurplus', 'boxblur3')
GLOW_FX = ('deepglow', 'deepglow2', 'softglow')


def nums(s):
    return [float(x) for x in s.split(',')]


def color(s):
    """'#AARRGGBB' -> 'rgba(r,g,b,a)'."""
    s = s.strip().lstrip('#')
    if len(s) == 6:
        s = 'ff' + s
    a, r, g, b = (int(s[i:i + 2], 16) for i in (0, 2, 4, 6))
    return 'rgba(%d,%d,%d,%s)' % (r, g, b, round(a / 255, 3))


def parse_v(s, typ):
    if typ == 'color':
        return color(s)
    if typ == 'bool':
        return s == 'true'
    if typ in ('vec2', 'vec3', 'quat') or ',' in s:
        return nums(s)
    try:
        return float(s)
    except ValueError:
        return s


def ease(e, warn):
    if not e:
        return 'linear'
    p = e.split()
    if p[0] == 'cubicBezier' and len(p) == 5:
        return ['bezier'] + [float(x) for x in p[1:]]
    if p[0] in ('elastic', 'bounce'):
        warn('easing "%s" approximated' % p[0])
        return [p[0]] + [float(x) for x in p[1:]]
    warn('unknown easing "%s" -> linear' % e)
    return 'linear'


def anim(el, typ, dur, warn, default=None):
    """Static value or {'kf': [...]} from an element carrying value= or <kf> children."""
    if el is None:
        return default
    kfs = [k for k in el if k.tag == 'kf']
    if not kfs:
        return parse_v(el.get('value'), typ) if el.get('value') is not None else default
    out = [{'t': round(float(k.get('t')) * dur, 4), 'v': parse_v(k.get('v'), typ), 'ease': ease(k.get('e'), warn)} for k in kfs]
    out.sort(key=lambda k: k['t'])
    return out[0]['v'] if len(out) == 1 else {'kf': out}


def scale_anim(a, f):
    """Multiply a numeric anim by f."""
    if isinstance(a, dict):
        return {'kf': [dict(k, v=k['v'] * f) for k in a['kf']]}
    return None if a is None else a * f


class Ctx:
    def __init__(self, root_short):
        self.unsupported, self.warnings, self.short = [], [], root_short

    def warn(self, m):
        if m not in self.warnings:
            self.warnings.append(m)


def props(el):
    return {p.get('name'): p for p in el if p.tag == 'property'}


def effects(el, layer, dur, ctx):
    out = []
    for fx in el.findall('effect'):
        if fx.get('hidden') == 'true':
            continue
        fid = fx.get('id') or ''
        name = fid.split('.')[-1]
        P = props(fx)
        g = lambda n, typ='float', d=None: anim(P.get(n), typ, dur, ctx.warn, d)
        if name in BLUR_FX:
            out.append({'kind': 'blur', 'px': scale_anim(g('strength', d=0.0), BLUR_UNIT * ctx.short)})
        elif name == 'motionblur4':
            out.append({'kind': 'motionBlur', 'tune': g('tune', d=1.0)})
        elif name == 'opacity':
            out.append({'kind': 'opacity', 'value': g('opacity', d=g('alpha', d=1.0))})
        elif name == 'fade':
            out.append({'kind': 'fade', 'in': g('inTime', d=0.0), 'out': g('outTime', d=0.0)})
        elif name == 'gradientoverlay2':
            out.append({'kind': 'gradient', 'colors': [g('color1', 'color'), g('color2', 'color')], 'angle': g('angle', d=0.0),
                        'radial': g('gradType', 'int', 0.0) == 1, 'alpha': g('alpha', d=1.0)})
        elif name == 'fourcolorgradient':
            out.append({'kind': 'fourColor', 'colors': [g('color%d' % i, 'color') for i in (1, 2, 3, 4)],
                        'offsets': [g('offset%d' % i, 'vec2', [0.0, 0.0]) for i in (1, 2, 3)] + [[0.0, 0.0]],
                        'alpha': g('alpha', d=1.0), 'blend': g('blend', d=0.0)})
        elif name in GLOW_FX:
            # deepglow*: glow in the layer's own colour unless colour blend is on; softglow: tinted.
            if name == 'softglow':
                c, r, a = g('color', 'color'), scale_anim(g('strength', d=0.1), 200), g('alpha', d=1.0)
            else:
                c = (g('colblend', 'color') or g('color', 'color')) if g('cblend', 'bool', False) else None
                r, a = scale_anim(g('strength', d=0.3), 100), g('oalpha' if name == 'deepglow2' else 'alphaa', d=1.0)
            out.append({'kind': 'glow', 'color': c, 'radius': r, 'alpha': a})
        elif name == 'inner-glow':
            out.append({'kind': 'innerGlow', 'color': g('color', 'color'), 'radius': g('radius', d=20.0), 'alpha': g('alpha', d=1.0)})
        elif name == 'texttransform':
            out.append({'kind': 'textReveal', 'start': g('start', d=0.0), 'end': g('end', d=1.0), 'phase': g('phase', d=0.0),
                        'unit': {0: 'line', 1: 'word', 2: 'char'}.get(int(g('component', 'int', 2.0)), 'char'),
                        'offset': g('offset', 'vec2', [0.0, 0.0]), 'angle': g('angle', d=0.0), 'scale': g('scale', d=0.0),
                        'alpha': g('alpha', d=0.0)})
        elif name == 'textprogress':
            out.append({'kind': 'textProgress', 'start': g('start', d=0.0), 'end': g('end', d=1.0)})
        elif name == 'counter':
            out.append({'kind': 'counter', 'offset': g('offset', d=0.0), 'scale': g('scale', d=1.0)})
        else:
            ctx.unsupported.append({'effect': fid, 'layer': layer})
    return out


def parse_layer(el, ctx):
    a = el.attrib
    start, end = float(a.get('startTime', 0)) / 1000, float(a.get('endTime', 0)) / 1000
    dur = max(end - start, 1e-3)
    label = a.get('label') or (el.findtext('content') or '').strip()[:30] or el.tag
    kind = {'shape': 'shape', 'text': 'text', 'embedScene': 'group', 'nullobj': 'null'}[el.tag]
    T = el.find('transform')
    tf = lambda n, typ, d: anim(T.find(n) if T is not None else None, typ, dur, ctx.warn, d)
    L = {'kind': kind, 'id': a.get('id', ''), 'label': label, 'start': round(start, 4), 'end': round(end, 4),
         'transform': {'location': tf('location', 'vec3', [0.0, 0.0, 0.0]), 'scale': tf('scale', 'vec2', [1.0, 1.0]),
                       'rotation': tf('rotation', 'float', 0.0), 'opacity': tf('opacity', 'float', 1.0),
                       'pivot': tf('pivot', 'vec2', [0.0, 0.0])}}
    if a.get('parent'):
        L['parent'] = a['parent']
    if a.get('blending'):
        if a['blending'] in BLEND:
            L['blend'] = BLEND[a['blending']]
        else:
            ctx.warn("blending '%s' not drawn (layer %s)" % (a['blending'], label))
    if a.get('clippingMask'):
        ctx.warn('clipping mask ignored (layer %s)' % label)
    if kind == 'null':
        return L
    P = props(el)
    ft = a.get('fillType', 'color')
    fc = el.find('fillColor')
    if ft == 'color':
        L['fill'] = {'type': 'color', 'color': anim(fc, 'color', dur, ctx.warn, 'rgba(255,255,255,1)')}
    elif ft == 'gradient':
        gr = el.find('gradient')
        L['fill'] = {'type': 'gradient', 'radial': gr.get('type') == 'radial', 'from': color(gr.get('startColor')),
                     'to': color(gr.get('endColor')), 'start': nums(gr.get('start')), 'end': nums(gr.get('end'))}
    elif ft == 'media':
        L['fill'] = {'type': 'placeholder'}
        ctx.warn('media fill not in pack -> placeholder (layer %s)' % label)
    else:
        L['fill'] = None
    st = el.find('path-stroke')
    if st is not None and st.get('enabled') != 'false':
        L['stroke'] = {'color': anim(st.find('color'), 'color', dur, ctx.warn, 'rgba(255,255,255,1)'),
                       'width': anim(st.find('size'), 'float', dur, ctx.warn, 1.0)}
    sh = el.find('shadow')
    if sh is not None and sh.get('enabled') != 'false':
        L['shadow'] = {'color': anim(sh.find('color'), 'color', dur, ctx.warn, 'rgba(0,0,0,1)'),
                       'opacity': anim(sh.find('opacity'), 'float', dur, ctx.warn, 0.5),
                       'blur': anim(sh.find('size'), 'float', dur, ctx.warn, 10.0),
                       'offset': anim(sh.find('offset'), 'vec2', dur, ctx.warn, [0.0, 0.0])}
    if kind == 'shape':
        s = a.get('s')
        half = anim(P.get('size'), 'vec2', dur, ctx.warn, [50.0, 50.0])
        L['size'] = {'kf': [dict(k, v=[2 * k['v'][0], 2 * k['v'][1]]) for k in half['kf']]} if isinstance(half, dict) else [2 * half[0], 2 * half[1]]
        if s is None and el.find('path') is not None:
            L['shape'] = 'path'
            L['path'] = el.find('path').get('d')
        elif s in SHAPES:
            L['shape'] = SHAPES[s]
            if s == '.roundrect':
                L['radius'] = anim(P.get('cornerRadius'), 'float', dur, ctx.warn, 0.0)
            if s == '.star':
                L['points'] = int(float(P['pointCount'].get('value'))) if 'pointCount' in P else 5
                L['inner'] = float(P['innerRadius'].get('value')) if 'innerRadius' in P else 0.5
            if s == '.plus':
                L['stem'] = float(P['stemSize'].get('value')) if 'stemSize' in P else 0.33
        else:
            L['shape'] = None
            ctx.warn("shape '%s' not drawn (layer %s)" % (s, label))
    elif kind == 'text':
        font = a.get('font', '')
        fam = re.search(r'name=([^&]+)', font)
        fam = fam.group(1) if fam else 'sans-serif'
        wt = re.search(r'weight=(\d+)', font) or re.search(r'-(\d00)\.', fam)
        fam = re.sub(r'(\.ttf|\.otf)$', '', fam, flags=re.I)
        fam = re.sub(r'[-_](rg|regular|\d00)$', '', fam, flags=re.I)
        L['text'] = {'content': el.findtext('content') or '', 'font': fam, 'weight': int(wt.group(1)) if wt else 400,
                     'size': round(float(a.get('size', 18)) * TEXT_PX, 2), 'wrap': float(a.get('wrapWidth', 512)),
                     'align': a.get('align', 'center')}
    else:  # embedScene
        sc = el.find('scene')
        L['scene'] = parse_scene(sc, ctx)
        L['scene']['speed'] = float(a.get('speed', 1))
        L['scene']['inTime'] = float(a.get('inTime', 0)) / 1000
    L['effects'] = effects(el, label, dur, ctx)
    return L


def parse_scene(sc, ctx):
    layers = []
    for c in sc:
        if c.tag in LAYER_TAGS and c.get('hidden') != 'true':
            layers.append(parse_layer(c, ctx))
        elif c.tag == 'media':
            ctx.warn('media file not included: %s' % (c.get('filename') or c.get('uri')))
    return {'w': int(sc.get('width')), 'h': int(sc.get('height')), 'background': color(sc.get('bgcolor', '#00000000')),
            'duration': float(sc.get('totalTime', 0)) / 1000, 'layers': layers}


def convert(root):
    ctx = Ctx(min(int(root.get('width')), int(root.get('height'))))
    sc = parse_scene(root, ctx)
    return {'title': root.get('title', ''), 'fps': float(root.get('fps', 30)), 'duration': sc['duration'],
            'size': {'w': sc['w'], 'h': sc['h']}, 'background': sc['background'], 'layers': sc['layers'],
            'unsupported': ctx.unsupported, 'warnings': ctx.warnings}


def main():
    for s in (sys.stdout, sys.stderr):
        s.reconfigure(errors='replace')
    ap = argparse.ArgumentParser()
    ap.add_argument('xml')
    ap.add_argument('-o', '--out')
    a = ap.parse_args()
    spec = convert(ET.parse(a.xml).getroot())
    out = a.out or os.path.splitext(a.xml)[0] + '.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)
    fx = sorted({u['effect'].split('.')[-1] for u in spec['unsupported']})
    print('%s: %d layers, %ss @ %sfps, %dx%d, unsupported=%s' % (out, len(spec['layers']), spec['duration'], spec['fps'],
                                                            spec['size']['w'], spec['size']['h'], fx))
    for m in spec['warnings']:
        print('warning:', m, file=sys.stderr)


if __name__ == '__main__':
    main()
