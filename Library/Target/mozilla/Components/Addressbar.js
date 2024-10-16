import Events from "../../../Events.js";

export default class Addressbar {
    Engine = null;
    Callbacks = null;
    Text = null;
    Content = null;
    Icon = null;
    LastTab = null;

    constructor(engine) {
        this.Engine = engine;
        this.Callbacks = new Events();

        browser.pageAction.onClicked.addListener((event) => {
            this.Callbacks.emit('onClick', event);
        });

        browser.tabs.onUpdated.addListener(this.tabUpdated.bind(this));
        browser.tabs.onActivated.addListener(this.tabUpdated.bind(this));
    }

    tabUpdated(query) {
        if(typeof(query.tabId) === 'undefined') {
            this.LastTab = query;
        } else {
            this.LastTab = query.tabId;
        }

        browser.pageAction.show(this.LastTab);
        this.update(this.LastTab);
    }

    update(tab){
        if(typeof(tab) === 'undefined') {
            if(this.LastTab === null) {
                return;
            }

            tab = this.LastTab;
        }

        this.LastTab = tab;

        if (this.Icon !== null) {
            browser.pageAction.setIcon({
                tabId: tab,
                path: this.Icon
            });
        }

        if (this.Text !== null) {
            browser.pageAction.setTitle({
                tabId: tab,
                title: this.Text
            });
        }

        if (this.Content !== null) {
            browser.pageAction.setPopup({
                tabId: tab,
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
}