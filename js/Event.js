"use strict";
var Event = (function () {
    function Event(type, target, cancellable, options) {
        if (options === void 0) { options = {}; }
        this._isDefaultPrevented = false;
        this._type = type;
        this._target = target;
        this._cancellable = cancellable;
        this._options = options;
    }
    Object.defineProperty(Event.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "cancellable", {
        get: function () {
            return this._cancellable;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "isDefaultPrevented", {
        get: function () {
            return this._isDefaultPrevented;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Event.prototype, "options", {
        get: function () {
            return this._options;
        },
        enumerable: true,
        configurable: true
    });
    Event.prototype.preventDefault = function () {
        if (this.cancellable) {
            this._isDefaultPrevented = true;
        }
    };
    return Event;
}());
exports.Event = Event;
