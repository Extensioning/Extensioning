import Events from '../../Events.js';

export default (new class Engine {
    on(core, name, callback) {
        core.Events.on(name, callback);
    }

    onInit(core) {
        chrome.runtime.onInstalled.addListener((args) => {
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

                    chrome.action.onClicked.addListener((event) => {
                        this.Callbacks.emit('onClick', event);
                    });

                    chrome.action.enable();
                    this.update();
                }

                update() {
                    if (this.Icon !== null) {
                        chrome.action.setIcon({
                            path: this.Icon
                        });
                    }

                    if (this.Text !== null) {
                        chrome.action.setTitle({
                            title: this.Text
                        });
                    }

                    if (this.Content !== null) {
                        chrome.action.setPopup({
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