import WebExt from 'web-ext';
import Path from 'path';
import Logger from './Logger.js';
import DefaultBrowser from 'default-browser';
import * as ChromeLauncher from "chrome-launcher";
import {template} from 'chalk-template';
import FirefoxFinder from "./Helpers/FirefoxFinder.js";

class Development {
    Browser = null;
    Version = '1.0.0';
    Browsers = ['Firefox', 'Chrome'];

    constructor() {
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
                case 'list':
                    this.printList();
                    break;
                case 'browser':
                    let position = this.Browsers.join('~').toLowerCase().split('~').indexOf(value.toLowerCase());

                    if (position >= 0) {
                        this.Browser = this.Browsers[position];
                    }
                    break;
            }
        });

        if (this.Browser === null) {
            Logger.warn('No browser given, using system-default.');
            DefaultBrowser().then((browser) => {
                this.Browser = browser.name;
                Logger.info('Selected Browser:', this.Browser);
                this.handleBrowserSelection();
            });

            return;
        }

        Logger.info('Selected Browser:', this.Browser);
        this.handleBrowserSelection();
    }

    printVersion() {
        console.log(this.Version);
        process.exit(0);
    }

    printHelp() {
        let text = '{bgGray.black USAGE}';
        text += '\n\t{yellow npm} {gray run dev} {green [OPTIONS]}';
        text += '\n';
        text += '\n{bgGray.black OPTIONS}';
        text += '\n\t{green help}\t\t\t- Print this Help.';
        text += '\n\t{green list}\t\t\t- Pint all available Browsers.';
        text += '\n\t{green version}\t\t\t- Print the Version of the tool.';
        text += '\n\t{green browser}{gray =}{red.italic <value>}\t\t- Use given Browser. The specific Browser must be already installed.';
        text += '\n\t\t\t\t  {gray Possible Values:} {cyan ' + this.Browsers.join('}, {cyan ') + '}';

        console.log(template(text));
        process.exit(0);
    }

    async printList() {
        let defaultBrowser = (await DefaultBrowser()).name;
        let text = '{bgGray.black DEFAULT}';
        text += '\n\tYour default Browser is {blue ' + defaultBrowser + '}.';

        if (this.Browsers.join('~').toLowerCase().split('~').indexOf(defaultBrowser.toLowerCase()) === -1) {
            text += '\n\n\t{yellow [WARNING]} {red Your default Browser will currently not supported!} 🙁';
            text += '\n\t          {grey You must set the target browser with }{green browser}{grey =}{yellow <name> }{grey parameter!}';
        }

        text += '\n\n{bgGray.black AVAILABLE}';

        this.Browsers.forEach((name) => {
            let installed = false;

            switch (name) {
                case 'Firefox':

                    try {
                        FirefoxFinder.getPath();
                        installed = true;
                    } catch (e) {
                    }
                    break;
                case 'Chrome':
                    try {
                        ChromeLauncher.getChromePath();
                        installed = true;
                    } catch (e) {
                    }
                    break;
            }
            text += '\n\t{cyan ' + name + '}\t\t\t';

            if (installed) {
                text += '{bgGreen.whiteBright Installed}';
            } else {
                text += '{bgRed.whiteBright NOT Installed}';
            }
        });

        console.log(template(text));
        process.exit(0);
    }

    handleBrowserSelection() {
        switch (this.Browser) {
            case 'Firefox':
                this.startFirefox();
                break;
            case 'Chrome':
                this.startChrome();
                break;
            default:
                Logger.error('The Browser will currently not supported:', this.Browser);
                Logger.warn('Following Browsers currently available: {cyan ' + this.Browsers.join('}, {cyan ') + '}');
                Logger.info('You can select given browser by type {bgWhiteBright.black npm run dev }{bgWhiteBright.redBright browser=<name>}\n\t       or type {bgWhiteBright.black npm run dev }{bgWhiteBright.redBright list} for more informations.');
                break;
        }
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