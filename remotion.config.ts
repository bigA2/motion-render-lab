import {Config} from '@remotion/cli/config';
import {existsSync} from 'fs';
Config.setEntryPoint('src/index.ts');
// Cloud containers cannot download Remotion's Chrome; use the pre-installed Playwright headless shell when present.
const CLOUD_CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
if (existsSync(CLOUD_CHROME)) Config.setBrowserExecutable(CLOUD_CHROME);
