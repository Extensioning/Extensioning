import WebExt from 'web-ext';
import ChromeLaunch from 'chrome-launch';
import Path from 'path';

class Development {
    constructor() {
        this.startChrome();
    }

    startFirefox() {
        WebExt.cmd.run({
            artifactsDir: '',
            startUrl: 'about:debugging#/runtime/this-firefox',
            devtools: true,
            sourceDir: Path.resolve(import.meta.dirname, '../Build/firefox/')
        }, {}).then(r => {

        }).catch(r => {
            console.error(r);
        });
    }

    startChrome() {
        const args = [
            '--load-extension=' + Path.resolve(import.meta.dirname, '../Build/chrome/')
        ];

        ChromeLaunch('chrome://extensions/', {args});
    }
}

new Development();