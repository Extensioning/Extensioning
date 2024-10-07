import open, { openApp, apps } from 'open';
import Path from 'path';

class Development {
    constructor() {
        let path = Path.resolve(import.meta.dirname, '../Source/');

        // apps.firefox ['about:debugging#/runtime/this-firefox']
        // apps.chrome
        // apps.edge
        openApp(apps.firefox, {
            arguments: ['-install-extension', path]
        });
    }
}

new Development();