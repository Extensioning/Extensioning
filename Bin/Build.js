import Logger from './Logger.js';
import FS from 'fs';
import Path from 'path';
import {template} from 'chalk-template';

/* Targets */
import Edge from './Targets/Edge.js';
import Chrome from './Targets/Chrome.js';
import Firefox from './Targets/Firefox.js';
import Opera from './Targets/Opera.js';
import Safari from './Targets/Safari.js';

class Build {
    Path;
    Config;
    Version = '1.0.0';
    ConfigFile = '/Config/Extension.json';
    BuildDirectory = '/Build';
    SourceDirectory = '/Source';
    LibraryDirectory = '/Library';

    constructor() {
        this.Path = Path.resolve(import.meta.dirname, '../');

        /*if (process.argv.slice(2).length === 0) {
            this.printHelp();
        }*/

        process.argv.slice(2).forEach((argument, index, array) => {
            let pair = argument.split('=');
            let name = pair[0].toLowerCase().trim();
            let value = pair[1];

            switch (name) {
                case 'help':
                    this.printHelp();
                    break;
                case 'version':
                    this.printVersion();
                    break;
                case 'config':
                    if(typeof(value) === 'undefined') {
                        Logger.info('Dumped Configuration', {
                            Path: this.Path,
                            ConfigFile: this.ConfigFile,
                            BuildDirectory: this.BuildDirectory,
                            SourceDirectory: this.SourceDirectory,
                            LibraryDirectory: this.LibraryDirectory
                        });
                        process.exit(0);
                        return;
                    }
                    this.ConfigFile = value;
                    break;
                case 'output':
                    this.BuildDirectory = value;
                    break;
                case 'source':
                    this.SourceDirectory = value;
                    break;
                case 'library':
                    this.LibraryDirectory = value;
                    break;
                case 'path':
                    this.Path = value;
                    break;
            }
        });

        this.run();
    }

    run() {
        Logger.info('Starting Building process...');
        Logger.info('Set Path:', '{bgWhite.black ' + this.Path + '}');

        /* Load the Configuration */
        this.loadConfiguration().then((config) => {
            this.Config = config;
            this.createBuildDirectory();
        }).catch((error) => {
            Logger.error(error.message);
        });
    }

    printVersion() {
        console.log(this.Version);
        process.exit(0);
    }

    printHelp() {
        let text = '{bgGray.black USAGE}';
        text += '\n\t{yellow npm} {gray run build} {green [OPTIONS]}';
        text += '\n';
        text += '\n{bgGray.black OPTIONS}';
        text += '\n\t{green help}\t\t\t- Print this Help.';
        text += '\n\t{green version}\t\t\t- Print the Version of the tool.';
        text += '\n\t{green path}{gray =}{red.italic <path>}\t\t- Set Working-Path (Default: {bgWhite.black ' + Path.join(this.Path).replaceAll('\\', '\\\\') + '}).';
        text += '\n\t{green config}{gray =}{red.italic <file>}\t\t- Set Configuration-File.';
        text += '\n\t{green output}{gray =}{red.italic <path>}\t\t- Set the Output-Path (Default: {bgWhite.black /Build}).';
        text += '\n\t{green source}{gray =}{red.italic <path>}\t\t- Set the Source-Path (Default: {bgWhite.black /Source}).';
        text += '\n\t{green library}{gray =}{red.italic <path>}\t\t- Set the Library-Path (Default: {bgWhite.black /Library}).';

        console.log(template(text));
        process.exit(0);
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