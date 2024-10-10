import WebExt from 'web-ext';
import Path from 'path';
import Logger from './Logger.js';
import * as ChromeLauncher from "chrome-launcher";
import {template} from 'chalk-template';

class Development {
    Browser = null;
    Version = '1.0.0';
    Browsers = [ 'Firefox', 'Chrome' ];

    constructor() {
        if(process.argv.slice(2).length === 0) {
            this.printHelp();
        }

        process.argv.slice(2).forEach((argument, index, array) => {
            let pair = argument.split('=');
            let name = pair[0].toLowerCase();
            let value = pair[1];

            switch(name) {
                case 'help':
                    this.printHelp();
                    break;
                case 'version':
                    this.printVersion();
                    break;
                case 'browser':
                    let position = this.Browsers.join('~').toLowerCase().split('~').indexOf(value.toLowerCase());

                    if(position >= 0) {
                        this.Browser = this.Browsers[position];
                    }
                    break;
            }
        });

        if(this.Browser === null) {
            Logger.warn('No browser given, using system-default.');
            this.Browser = 'Default';
        }

        Logger.info('Selected Browser:', this.Browser);
        this.handleBrowserSelection();
    }

    printVersion() {
        console.log(this.Version);
        process.exit(0);
    }

    printHelp() {
        let text = '+++ Help +++';
        text += '\nUSAGE:';
        text += '\n\tnpm run dev [OPTIONS]';
        text += '\n';
        text += '\nOPTIONS:';
        text += '\n\thelp\t\t\t- Print this Help';
        text += '\n\tversion\t\t\t- Print the Version';
        text += '\n\tbrowser={yellow <value>}\t\t- use given Browser';
        text += '\n\t\t\t\t  {gray Possible Values:}';
        text += '\n\t\t\t\t  {cyan ' + this.Browsers.join('}, {cyan ') + '}';


        console.log(template(text));
        process.exit(0);
    }

    handleBrowserSelection() {
        switch(this.Browser) {
            case 'Firefox':
                this.startFirefox();
            break;
            case 'Chrome':
                this.startChrome();
            break;
            default:
                // @ToDo find system-default browser
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