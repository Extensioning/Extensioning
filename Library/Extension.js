import LoggerInstance from './Logger.js';
import Events from './Events.js';
import Chrome from './Target/chrome/Engine.js';
import Mozilla from './Target/mozilla/Engine.js';


export const Logger = LoggerInstance;

export const Type = {
    TOOLBAR: 1,
    ADDRESSBAR: 2,
    CONTEXTMENU: 3,
    SIDEBAR: 4,
    OPTIONS: 5,
    WINDOW: 6,
    DEVTOOLS: 7
};

export const Engine = {
    CHROME: 1,
    MOZILLA: 2
};

export default (new class Extension {
    Engine = null;
    Events = null;

    constructor() {
        this.Events = new Events();

        /* If Both defined */
        if (typeof (window.chrome) !== 'undefined' || typeof (window.browser) !== 'undefined') {
            this.findEngine(window.browser || window.chrome).then((browser) => {
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
                destination.runtime.getBrowserInfo().then((data) => {
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