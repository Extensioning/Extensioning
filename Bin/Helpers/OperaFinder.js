import FS from 'fs';
import Path from 'path';

export default (new class OperaFinder {
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
            `${Path.sep}Opera${Path.sep}opera.exe`,
        ];
        const prefixes = [
            process.env.LOCALAPPDATA + Path.sep + 'Programs', process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)']
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
            throw new Error('Cant find opera.exe');
        }

        return installations[0];
    }
}());