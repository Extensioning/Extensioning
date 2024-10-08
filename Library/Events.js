export default class Events {
    Events = {};

    _getEventListByName(name) {
        if(typeof this.Events[name] === 'undefined') {
            this.Events[name] = new Set();
        }

        return this.Events[name];
    }

    on(name, callback) {
        this._getEventListByName(name).add(callback);
    }

    once(name, callback) {
        const onceFn = function (...args) {
            this.removeListener(name, onceFn);
            callback.apply(this, args);
        }.bind(this);

        this.on(name, onceFn);
    }

    emit(name, ...args) {
        this._getEventListByName(name).forEach(function (callback) {
            callback.apply(this, args);
        }.bind(this));

        this._getEventListByName('*').forEach(function (callback) {
            callback.apply(this, [name, ...args]);
        }.bind(this));
    }

    removeListener(name, callback) {
        this._getEventListByName(name).delete(callback);
    }
}