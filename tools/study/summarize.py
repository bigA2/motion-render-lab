# Prints a markdown table + medians from measure.py JSON files. MIT.
import glob, json, sys, statistics as st
rows = [json.load(open(f)) for f in sorted(glob.glob(sys.argv[1] + '/*.json'))]
def med(key, sub=None):
    v = [(r.get(sub) or {}).get(key) if sub else r.get(key) for r in rows]
    v = [x for x in v if isinstance(x, (int, float))]
    return round(st.median(v), 3) if v else '-'
keys = ['duration_s', 'shot_s_median', 'camera_moving_share', 'zooming_share', 'zoom_in_vs_out', 'rolling_share', 'pan_speed_median_fw_per_s',
        'pan_speed_p90_fw_per_s', 'move_dur_median_s', 'ease_peak_frac_median', 'ease_out_share', 'ease_inout_share', 'ease_in_share',
        'motion_blur_sharpness_ratio', 'alive_share', 'still_share', 'ocr_words_per_frame_median', 'ocr_words_per_frame_p90',
        'text_h_median_pct', 'text_h_p95_pct', 'saturation_mean', 'luma_mean']
akeys = ['onsets_per_s', 'quiet_share', 'onset_on_visual_event_share', 'lufs', 'dyn_range_db']
print(f'videos measured: {len(rows)} (with audio: {sum(1 for r in rows if r.get("has_audio"))})')
print('| metric | median |\n|---|---|')
for k in keys: print(f'| {k} | {med(k)} |')
for k in akeys: print(f'| audio.{k} | {med(k, "audio")} |')
print('\n| video | WxH | dur | shot | move | zoom | roll | ease pk | alive | words | txt h% | ev/s | sync | LUFS |\n|' + '---|' * 14)
for r in rows:
    a = r.get('audio') or {}
    print(f"| {r['label'][:48]} | {int(r['w'] or 0)}x{int(r['h'] or 0)} | {r['duration_s']} | {r['shot_s_median']} | {r['camera_moving_share']} | {r['zooming_share']} | {r['rolling_share']} | {r['ease_peak_frac_median']} | {r['alive_share']} | {r['ocr_words_per_frame_median']} | {r['text_h_median_pct']} | {a.get('onsets_per_s','-')} | {a.get('onset_on_visual_event_share','-')} | {a.get('lufs','-')} |")
