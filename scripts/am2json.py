#!/usr/bin/env python3
"""Alight Motion XML preset -> neutral JSON spec for src/templates/AMTemplate.tsx (stdlib only).

Usage: python scripts/am2json.py in.xml [-o out.json] [--time-unit ms|s|frames]

SOURCES / HONESTY NOTE. Alight Motion has no published XML schema. Searches (2026-10) found only
consumer preset-sharing pages that describe the format in prose ("layers, effects, keyframes, text, colors"):
  https://tutorialsbymuhammad.odoo.com/xml
  https://www.scribd.com/document/633996004/Tradisi   (summary only: source video, bookmarks, shapes with transform/colour/effects)
  https://alightmotionweb.com/alight-motion-presets-and-effects/
No public sample with raw XML was found, and others' presets must not be committed. So this parser is
SCHEMA-TOLERANT and heuristic: it assumes the structure used by public/templates/am/sample.xml
(root scene with width/height/fps/duration; layer elements with type, start/end times, property
child nodes holding <keyframe time= value= easing=>; <effect name=>). Anything it cannot map is listed in
`unsupported` or `warnings`, never faked. Validate against the founder's first real file and adjust the ALIAS tables.

Neutral spec: {fps, duration (s), size:{w,h}, background, layers:[{type,id,start,end,props,
  keyframes:{prop:[{t (s), v, easing}]}, children?}], unsupported:[...], warnings:[...]}
Easing: linear | easeIn | easeOut | easeInOut | hold | [x1,y1,x2,y2] (cubic-bezier).
"""
import argparse, json, re, sys
import xml.etree.ElementTree as ET

LAYER_TAGS = {'element', 'layer', 'text', 'shape', 'image', 'group', 'video', 'object'}
TYPE_ALIAS = {'text': 'text', 'title': 'text', 'shape': 'shape', 'rect': 'shape', 'ellipse': 'shape', 'image': 'image',
              'bitmap': 'image', 'group': 'group', 'container': 'group', 'null': 'group'}
PROP_ALIAS = {'position': 'position', 'pos': 'position', 'translate': 'position', 'scale': 'scale', 'size': 'scale',
              'rotation': 'rotation', 'rotate': 'rotation', 'angle': 'rotation', 'opacity': 'opacity', 'alpha': 'opacity',
              'anchor': 'anchor', 'anchorpoint': 'anchor'}
ATTR_ALIAS = {'startTime': 'start', 'start': 'start', 'in': 'start', 'inPoint': 'start',
              'endTime': 'end', 'end': 'end', 'out': 'end', 'outPoint': 'end'}
NAMED_EASE = {'linear': 'linear', 'easein': 'easeIn', 'easeout': 'easeOut', 'easeinout': 'easeInOut', 'ease': 'easeInOut',
              'hold': 'hold', 'step': 'hold', 'stepped': 'hold'}


def num(s):
    try:
        return float(s)
    except (TypeError, ValueError):
        return None


def val(s):
    """'12' -> 12.0 ; '540,675' -> [540,675] ; '#fff' -> '#ffffff' ; else str."""
    if s is None:
        return None
    s = s.strip()
    n = num(s)
    if n is not None:
        return n
    parts = [p for p in re.split(r'[,\s]+', s) if p]
    if len(parts) > 1 and all(num(p) is not None for p in parts):
        return [num(p) for p in parts]
    if re.fullmatch(r'#[0-9a-fA-F]{3}', s):
        return '#' + ''.join(c * 2 for c in s[1:]).lower()
    if re.fullmatch(r'#[0-9a-fA-F]{6,8}', s):
        return s.lower()
    return s


def easing(el):
    e = (el.get('easing') or el.get('ease') or el.get('interpolation') or 'linear').strip()
    m = re.fullmatch(r'cubic-bezier\(([^)]*)\)', e, re.I)
    if m:
        p = [num(x) for x in m.group(1).split(',')]
        if len(p) == 4 and None not in p:
            return p
    k = e.lower().replace('-', '').replace('_', '').replace(' ', '')
    return NAMED_EASE.get(k, 'linear')


def local(tag):
    return tag.split('}')[-1]


def first(el, *names):
    for n in names:
        if el.get(n) is not None:
            return el.get(n)
    return None


def parse_layer(el, tconv, unsupported, warnings):
    tag = local(el.tag).lower()
    t = (el.get('type') or tag).lower()
    ltype = TYPE_ALIAS.get(t) or TYPE_ALIAS.get((el.get('shape') or '').lower())
    if not ltype:
        ltype = 'shape'
        if t not in ('element', 'layer', 'object'):
            warnings.append("layer '%s': unknown type '%s' treated as shape" % (el.get('id') or el.get('name'), t))
    layer = {'type': ltype, 'id': el.get('id') or el.get('name') or '', 'start': None, 'end': None, 'props': {}, 'keyframes': {}}
    for a, v in el.attrib.items():
        k = ATTR_ALIAS.get(a)
        if k:
            layer[k] = tconv(num(v))
        elif a not in ('id', 'name', 'type'):
            layer['props'][a] = val(v)
    children = []
    for c in el:
        ct = local(c.tag).lower()
        if ct in ('effect', 'effects'):
            for e in ([c] if ct == 'effect' else list(c)):
                n = e.get('name') or e.get('type') or e.get('id') or 'unnamed effect'
                if n not in unsupported:
                    unsupported.append(n)
        elif ct in LAYER_TAGS and ct != 'text':
            children.append(parse_layer(c, tconv, unsupported, warnings))
        elif ct == 'text':
            if (c.text or '').strip():
                layer['props']['text'] = c.text.strip()
        elif ct in ('fill', 'stroke'):
            key = 'color' if ct == 'fill' else 'strokeColor'
            if c.get('color') is not None:
                layer['props'][key] = val(c.get('color'))
            if ct == 'stroke' and c.get('width') is not None:
                layer['props']['strokeWidth'] = val(c.get('width'))
        else:
            prop = PROP_ALIAS.get(ct, ct)
            kfs = [k for k in c if local(k.tag).lower() == 'keyframe']
            if kfs:
                frames = [{'t': tconv(num(first(k, 'time', 't'))), 'v': val(first(k, 'value', 'v')), 'easing': easing(k)} for k in kfs]
                frames.sort(key=lambda f: f['t'] if f['t'] is not None else 0)
                layer['keyframes'][prop] = frames
            elif c.get('value') is not None:
                layer['props'][prop] = val(c.get('value'))
            elif (c.text or '').strip():
                layer['props'][prop] = val(c.text)
    if children:
        layer['children'] = children
    if layer['type'] == 'text' and 'text' not in layer['props']:
        warnings.append("text layer '%s' has no text" % layer['id'])
    return layer


def convert(root, unit='ms'):
    fps = num(first(root, 'fps', 'frameRate', 'framerate')) or 30.0
    div = {'ms': 1000.0, 's': 1.0, 'frames': fps}[unit]
    tconv = lambda x: None if x is None else round(x / div, 4)
    unsupported, warnings = [], []
    w = num(first(root, 'width', 'w'))
    h = num(first(root, 'height', 'h'))
    if not w or not h:
        warnings.append('no scene width/height; defaulted to 1080x1920')
        w, h = w or 1080, h or 1920
    layers = [parse_layer(c, tconv, unsupported, warnings) for c in root if local(c.tag).lower() in LAYER_TAGS]
    dur = tconv(num(first(root, 'duration', 'length')))
    if dur is None:
        ends = [l['end'] for l in layers if l['end'] is not None]
        dur = max(ends) if ends else 3.0
        warnings.append('no scene duration; derived from layer ends')
    return {'fps': fps, 'duration': dur, 'size': {'w': int(w), 'h': int(h)}, 'background': val(first(root, 'background', 'bgcolor')),
            'layers': layers, 'unsupported': unsupported, 'warnings': warnings}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('xml')
    ap.add_argument('-o', '--out')
    ap.add_argument('--time-unit', default='ms', choices=['ms', 's', 'frames'])
    a = ap.parse_args()
    spec = convert(ET.parse(a.xml).getroot(), a.time_unit)
    out = a.out or re.sub(r'\.xml$', '', a.xml) + '.json'
    with open(out, 'w', encoding='utf-8') as f:
        json.dump(spec, f, indent=1)
    print('%s: %d layers, %ss @ %sfps, unsupported=%s' % (out, len(spec['layers']), spec['duration'], spec['fps'], spec['unsupported']))
    for m in spec['warnings']:
        print('warning:', m, file=sys.stderr)


if __name__ == '__main__':
    main()
