import Events from '../../Events.js';
import Toolbar from './Components/Toolbar.js';

export default (new class Engine {
    on(core, name, callback) {
        core.Events.on(name, callback);
    }

    onInit(core) {
        browser.runtime.onInstalled.addListener((args) => {
            core.Events.emit('installed', args);
        });
    }

    createToolbar(core) {
        return new Promise((success, failure) => {
            success(new Toolbar);
        });
    }
}());