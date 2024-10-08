import Logger from './Logger.js';
import FS from 'fs';
import Path from 'path';

/* Targets */
import Edge from './Targets/Edge.js';
import Chrome from './Targets/Chrome.js';
import Firefox from './Targets/Firefox.js';
import Opera from './Targets/Opera.js';
import Safari from './Targets/Safari.js';

class Build {
    Path;
    Config;
    ConfigFile = '/Config/Extension.json';
    BuildDirectory = '/Build';
    SourceDirectory = '/Source';
    LibraryDirectory = '/Library';

    constructor() {
        Logger.info('Starting Building process...');
        this.Path = Path.resolve(import.meta.dirname, '../');
        Logger.info('Set Path:', '{bgWhite.black ' + this.Path + '}');

        /* Load the Configuration */
        this.loadConfiguration().then((config) => {
            this.Config = config;
            this.createBuildDirectory();
        }).catch((error) => {
            Logger.error(error.message);
        });
    }

    loadConfiguration() {
        Logger.info("Loading Config-File:", '{bgWhite.black ' + Path.join(this.ConfigFile) + '}');

        return new Promise((success, error) => {
            FS.readFile(Path.join(this.Path, this.ConfigFile), 'UTF-8', (err, content) => {
                if (err) {
                    error(err);
                    return;
                }

                try {
                    success(JSON.parse(content));
                } catch (exception) {
                    error(exception);
                }
            });
        });
    }

    createBuildDirectory() {
        Logger.info("{red Remove} old Build-Directory:", '{bgWhite.black ' + Path.join(this.BuildDirectory) + '}');

        FS.rm(Path.join(this.Path, this.BuildDirectory), {
            recursive: true,
            force: true
        }, (error) => {
            if (error) {
                Logger.error(error.message);
            }

            Logger.info("{green Create} new Build-Directory:", '{bgWhite.black ' + Path.join(this.BuildDirectory) + '}');

            FS.mkdir(Path.join(this.Path, this.BuildDirectory), {
                recursive: true
            }, (error) => {
                if (error) {
                    Logger.error(error.message);
                }

                this.createBaseExtension();
            });
        });
    }

    createBaseExtension() {
        if (typeof (this.Config) === 'undefined') {
            Logger.error('The Config-Object is empty. Seems that the file', '{bgWhite.black ' + Path.join(this.ConfigFile) + '}', 'is broken!');
            return;
        }

        if (typeof (this.Config.browsers) === 'undefined' || this.Config.browsers.lenght === 0) {
            Logger.error('Error on {bgWhite.black ' + Path.join(this.ConfigFile) + '}:', 'No browser specified.', '\n\n\t\t{yellow Possible values on "browsers" in Configuration:}', '\n\t\t{cyan: ' + [
                'edge',
                'chrome',
                'firefox',
                'opera',
                'safari'
            ].join('}, {cyan ') + '}');
            return;
        }

        this.Config.browsers.forEach((browser) => {
            this.buildFor(browser);
        });
    }

    buildFor(browser) {
        Logger.log('Build', 'Start building extension for {cyan ' + browser + '}.');

        let instance = null;

        switch (browser) {
            case 'edge':
                instance = new Edge();
                break;
            case 'chrome':
                instance = new Chrome();
                break;
            case 'firefox':
                instance = new Firefox();
                break;
            case 'opera':
                instance = new Opera();
                break;
            case 'safari':
                instance = new Safari();
                break;
        }

        instance.getName = () => {
            return browser;
        };

        Logger.log('Build', '{cyan ' + instance.getName() + '}: Create folder: {bgWhite.black ' + Path.join(this.BuildDirectory, browser) + '}');

        FS.mkdir(Path.join(this.Path, this.BuildDirectory, browser), {
            recursive: true
        }, (error) => {
            if (error) {
                Logger.error(error.message);
            }

            if (typeof (instance.onManifest) === 'undefined') {
                Logger.warn('{cyan ' + instance.getName() + '}: Skipping Manifest.');
                this.buildContent(instance);
                return;
            }

            let indent = 0;

            if (typeof (this.Config.debug) !== 'undefined' && this.Config.debug) {
                indent = 2;
            }

            FS.writeFile(Path.join(this.Path, this.BuildDirectory, browser, 'manifest.json'), JSON.stringify(instance.onManifest(this.Config), null, indent), err => {
                if (err) {
                    Logger.error(err);
                    return;
                }

                Logger.log('Build', '{cyan ' + instance.getName() + '}: Saved Manifest-File: {bgWhite.black ' + Path.join(this.BuildDirectory, browser, 'manifest.json') + '}');

                // Copy Source
                this.buildContent(instance);
            });
        });
    }

    buildContent(browser) {
        if (typeof (browser.onBuild) === 'undefined') {
            Logger.warn('{cyan ' + browser.getName() + '}: Skipping Build.');
            return;
        }

        /* Copying the Source */
        Logger.info('{cyan ' + browser.getName() + '}: Copy Extension-Source from {bgWhite.black ' + Path.join(this.SourceDirectory) + '} to {bgWhite.black ' + Path.join(this.BuildDirectory) + '}');

        FS.cpSync(Path.join(this.Path, this.SourceDirectory), Path.join(this.Path, this.BuildDirectory, browser.getName()), {
            recursive: true
        });

        /* Copying the Library */
        Logger.info('{cyan ' + browser.getName() + '}: Copy Library from {bgWhite.black ' + Path.join(this.LibraryDirectory) + '} to {bgWhite.black ' + Path.join(this.BuildDirectory, this.LibraryDirectory) + '}');

        FS.cpSync(Path.join(this.Path, this.LibraryDirectory), Path.join(this.Path, this.BuildDirectory, browser.getName(), this.LibraryDirectory), {
            recursive: true
        });

        browser.onBuild();
        Logger.info('{cyan ' + browser.getName() + '}: Build finished.');
    }
}

new Build();