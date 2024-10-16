import Events from '../../Events.js';
import Toolbar from './Components/Toolbar.js';
import Addressbar from "./Components/Addressbar.js";

export default (new class Engine {
    Tabs = [];

    on(core, name, callback) {
        core.Events.on(name, callback);
    }

    onInit(core) {
        browser.runtime.onInstalled.addListener((args) => {
            core.Events.emit('installed', args);
        });

        setInterval(() => {
            browser.tabs.query({

            }).then((tabs) => {
                let temp = [];

                tabs.forEach((tab) => {
                    temp.push(tab.id);
                });

                if(JSON.stringify(temp) !== JSON.stringify(this.Tabs)) {
                    this.Tabs = temp;
                    core.Events.emit('tabs', this.Tabs);
                }
            });
        }, 1000);
    }

    getTabs() {
        return this.Tabs;
    }

    createToolbar(core) {
        return new Promise((success, failure) => {
            success(new Toolbar);
        });
    }

    createAddressbar(core) {
        return new Promise((success, failure) => {
            success(new Addressbar(this));
        });
    }
}());