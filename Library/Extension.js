import LoggerInstance from './Logger.js';
import Events from './Events.js';
import Chrome from './Target/chrome/Engine.js';
import Mozilla from './Target/mozilla/Engine.js';
import TypeInstance from './Constants/Type.js';
import EngineInstance from './Constants/Engine.js';

export const Logger = LoggerInstance;
export const Type = TypeInstance;
export const Engine = EngineInstance;

export default (new class Extension {
    Engine = null;
    Events = null;

    constructor() {
        this.Events = new Events();

        let api = null;

        if (typeof (browser) !== 'undefined') {
            api = browser;
        } else if (typeof (chrome) !== 'undefined') {
            api = chrome;
        }

        if (api !== null) {
            this.findEngine(api).then((browser) => {
                this.handleEngine(browser);
            }).catch((error) => {
                Logger.warn('Unsupported Browser-Engine:', error);
            });
        }
    }

    on(name, callback) {
        this.Events.on(name, callback);
    }

    findEngine(destination) {
        return new Promise((success, failure) => {
            try {
                let target = null;

                if (typeof (destination.runtime.getBrowserInfo) !== 'undefined') {
                    target = destination.runtime.getBrowserInfo();
                } else {
                    this.Events.emit('engine', 'Chrome');
                    success('Chrome');
                    return;
                }

                target.then((data) => {
                    this.Events.emit('engine', data.vendor);
                    success(data.vendor);
                }).catch(failure);
            } catch (exception) {
                failure(exception);
            }
        });
    }

    handleEngine(name) {
        switch (name) {
            case 'Mozilla':
                Logger.info('Found Mozilla-Engine.');
                this.Engine = Engine.MOZILLA;

                if (typeof (Mozilla.onInit) !== 'undefined') {
                    Mozilla.onInit(this);
                    this.Events.emit('engineInit', Mozilla);
                }
                break;
            case 'Chrome':
                Logger.info('Found Chrome-Engine.');
                this.Engine = Engine.CHROME;

                if (typeof (Chrome.onInit) !== 'undefined') {
                    Chrome.onInit(this);
                    this.Events.emit('engineInit', Chrome);
                }
                break;
            default:
                Logger.warn('Bad Engine handling:', name);
                break;
        }
    }

    getEngine() {
        return this.Engine;
    }

    createComponent(type) {
        return new Promise((success, failure) => {
            switch (type) {
                case Type.TOOLBAR:
                    switch (this.Engine) {
                        case Engine.CHROME:
                            Chrome.createToolbar(this).then(success).catch(failure);
                            break;
                        case Engine.MOZILLA:
                            Mozilla.createToolbar(this).then(success).catch(failure);
                            break;
                    }
                    break;
                case Type.ADDRESSBAR:
                case Type.CONTEXTMENU:
                case Type.SIDEBAR:
                case Type.OPTIONS:
                case Type.WINDOW:
                case Type.DEVTOOLS:
                    Logger.warn('Currently not implemented:', type);
                    break;
            }
        });
    }
}());