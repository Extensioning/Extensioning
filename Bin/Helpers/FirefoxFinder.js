import FS from 'fs';
import Path from 'path';

export default (new class FirefoxFinder {
    constructor() {
        this.windows();
    }

    getPath() {
        return this.windows();
    }

    resolveFirefoxPath() {
        if (this.canAccess(process.env.FIREFOX_PATH)) {
            return process.env.FIREFOX_PATH;
        }

        return undefined;
    }

    canAccess(file) {
        if (!file) {
            return false;
        }

        try {
            FS.accessSync(file);
            return true;
        } catch (e) {
            return false;
        }
    }


    windows() {
        const installations = [];
        const suffixes = [
            `${Path.sep}Mozilla Firefox${Path.sep}firefox.exe`,
        ];
        const prefixes = [
            process.env.LOCALAPPDATA, process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']
        ].filter(Boolean);
        const customPath = this.resolveFirefoxPath();
        if (customPath) {
            installations.push(customPath);
        }
        prefixes.forEach(prefix => suffixes.forEach(suffix => {
            const path = Path.join(prefix, suffix);

            if (this.canAccess(path)) {
                installations.push(path);
            }
        }));

        if (installations.length === 0) {
            throw new Error('Cant find firefox.exe');
        }

        return installations;
    }
}());