import Events from '../../Events.js';

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
            success(new class Toolbar {
                Callbacks = null;
                Text = null;
                Content = null;
                Icon = null;

                constructor() {
                    this.Callbacks = new Events();

                    browser.browserAction.onClicked.addListener((event) => {
                        this.Callbacks.emit('onClick', event);
                    });

                    browser.tabs.onActivated.addListener((query) => {
                        browser.browserAction.enable();
                        this.update();
                    });
                }

                update() {
                    if (this.Icon !== null) {
                        browser.browserAction.setIcon({
                            path: this.Icon
                        });
                    }

                    if (this.Text !== null) {
                        browser.browserAction.setTitle({
                            title: this.Text
                        });
                    }

                    if (this.Content !== null) {
                        browser.browserAction.setPopup({
                            popup: this.Content
                        });
                    }
                }

                setText(text) {
                    this.Text = text;
                    this.update();
                }

                setIcon(file) {
                    this.Icon = file;
                    this.update();
                }

                setContent(file) {
                    this.Content = file;
                    this.update();
                }

                onClick(callback) {
                    this.Callbacks.on('onClick', callback);
                }
            });
        });
    }
}());