# Task: After Effects .aep templates → Remotion, no After Effects (GitHub runners only)
Repo bigA2/motion-render-lab, branch tools/templates (has src/templates/{LottieTemplate,AMTemplate}.tsx, scripts/am2json.py, .github/workflows/{templates,live}.yml, live.json). Founder has NO After Effects.
1. Evaluate py-aep and aep_parser (PyPI) on a GitHub runner; pick the one that best extracts comps, layers (text/shape/solid/precomp/footage), keyframed transforms + easing, text, colours.
2. scripts/aep2json.py: .aep → the same JSON spec AMTemplate.tsx plays (extend minimally; unsupported effects/expressions listed, never faked).
3. Test with ONE free Mixkit After Effects template (mixkit.co/free-after-effects-templates/) downloaded inside the workflow at runtime — never commit Mixkit files (public repo). Note URL + licence in docs/TEMPLATES.md.
4. templates.yml: add kind=aep (url/path, comp, replace map) → render 4:5 + 16:9 + contact sheet. Point live.json at the aep test comp (prep = download + aep2json) so it shows on https://bigA2.github.io/motion-render-lab/tools/templates/.
5. Document the fallback: LottieFiles browser "AEP to Lottie" → public/templates/lottie → LottieTemplate.
Push, append docs/CLOUD_LOG.md, do not merge to main. Report: parser chosen, run id, honest fidelity vs the template's preview.
