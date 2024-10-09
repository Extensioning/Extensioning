import WebExt from 'web-ext';
import Path from 'path';
import * as ChromeLauncher from "chrome-launcher";

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
        ChromeLauncher.launch({
            startingUrl: 'about:extensions',
            chromeFlags: [
                '--disable-features=enableasyncdns',
                '--load-extension=' + Path.resolve(import.meta.dirname, '../Build/chrome/'),
                '--dev',
                '--enable-logging',
                '--test-type=ui',
                '--homepage=about:extensions',
                '--allow-running-insecure-content',
                '--auto-open-devtools-for-tabs',
                '--enable-auto-reload'
            ]
        }).then(chrome => {

        }).catch(r => {
            console.error(r);
        });
    }
}

new Development();