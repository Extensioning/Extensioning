import WebExt from 'web-ext';
import Path from 'path';

class Development {
    constructor() {
        let path = Path.resolve(import.meta.dirname, '../Build/firefox/');

        WebExt.cmd.run({
            artifactsDir: '',
            startUrl: 'about:debugging#/runtime/this-firefox',
            devtools: true,
            sourceDir: path
        }, {}).then(r => {

        }).catch(r => {
            console.error(r);
        });
    }
}

new Development();