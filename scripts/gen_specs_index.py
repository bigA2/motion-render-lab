import os, json
d='src/specs'; ids=sorted(f[:-5] for f in os.listdir(d) if f.endswith('.json'))
with open(f'{d}/index.ts','w') as o:
    o.write("import {Spec} from '../kit/engine';\n")
    for i,n in enumerate(ids): o.write(f"import s{i} from './{n}.json';\n")
    o.write('export const SPECS = ['+', '.join(f's{i}' for i in range(len(ids)))+'] as unknown as Spec[];\n')
print(len(ids),'specs')
