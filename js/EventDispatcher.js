"use strict";
var ev = require('./Event');
var EventDispatcher = (function () {
    function EventDispatcher(separator) {
        if (separator === void 0) { separator = ':'; }
        this._listeners = [];
        this._listenersAll = [];
        this._listenersMap = {};
        this._listenersSorted = true;
        this._dispatchers = [];
        this._suspendTokens = [];
        this._suspendQueue = false;
        this._queue = [];
        this._separator = ':';
        this._eventsStack = [];
        this._separator = separator;
    }
    Object.defineProperty(EventDispatcher.prototype, "hasListeners", {
        get: function () {
            return this._listeners.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventDispatcher.prototype, "suspended", {
        get: function () {
            return this._suspendTokens.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventDispatcher.prototype, "separator", {
        get: function () {
            return this._separator;
        },
        enumerable: true,
        configurable: true
    });
    EventDispatcher.prototype.addListener = function (listener, scope, eventType, options) {
        if (eventType === void 0) { eventType = null; }
        if (options === void 0) { options = null; }
        var i, l, eventTypes = this._transform(eventType), diff;
        for (i = 0; i < this._listeners.length; i++) {
            if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
                this._listeners[i].options = options;
                diff = this._listeners[i].allowEventType(eventTypes);
                this._applyEventDiff(this._listeners[i], diff);
                return;
            }
        }
        l = new ListenerHelper(listener, scope, eventTypes, options);
        this._addListener(l, l.eventTypes);
    };
    EventDispatcher.prototype.addListeners = function (listeners) {
        var i;
        for (i = listeners.length - 1; i >= 0; i--) {
            this.addListener(listeners[i].listener, listeners[i].scope, listeners[i].eventType, listeners[i].options);
        }
    };
    EventDispatcher.prototype.dispatch = function (event) {
        var i, index, eventTypes, listeners, me = this;
        if (this._eventsStack.indexOf(event) > -1) {
            return;
        }
        if (this.suspended && !event.cancellable) {
            if (this._suspendQueue) {
                this._queue.push(event);
            }
            return;
        }
        eventTypes = this._transform(event.type);
        listeners = this._eventType2Listener(eventTypes);
        listeners.sort(function (a, b) {
            if (a.priority === b.priority) {
                return b.order - a.order;
            }
            return a.priority - b.priority;
        });
        if (0 === listeners.length) {
            return;
        }
        this._eventsStack.push(event);
        try {
            for (i = listeners.length - 1; i >= 0; i--) {
                listeners[i].dispatch(event, eventTypes);
                if (listeners[i].single) {
                    if (listeners[i].buffer) {
                        listeners[i].onDispatch = function (l, e) {
                            me._removeListener(l, l.eventTypes);
                        };
                    }
                    else {
                        this._removeListener(listeners[i], listeners[i].eventTypes);
                    }
                }
            }
        }
        finally {
            this._eventsStack.pop();
        }
    };
    EventDispatcher.prototype.hasListener = function (listener, scope) {
        var i;
        for (i = 0; i < this._listeners.length; i++) {
            if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
                return true;
            }
        }
        return false;
    };
    EventDispatcher.prototype.removeListener = function (listener, scope, eventType) {
        if (eventType === void 0) { eventType = null; }
        var i, index, eventTypes = this._transform(eventType), l = null, diff;
        for (i = this._listeners.length - 1; i >= 0; i--) {
            l = this._listeners[i];
            if ((l.listener === listener) && (l.scope === scope)) {
                if (null === eventTypes) {
                    this._removeListener(l, l.eventTypes);
                }
                else {
                    diff = l.denyEventType(eventTypes);
                    if (l.hasEventTypes) {
                        this._applyEventDiff(this._listeners[i], diff);
                    }
                    else {
                        this._removeListener(l, l.eventTypes);
                    }
                }
                break;
            }
        }
    };
    EventDispatcher.prototype.removeListeners = function (listeners) {
        var i;
        for (i = 0; i < listeners.length; i++) {
            this.removeListener(listeners[i].listener, listeners[i].scope, listeners[i].eventType);
        }
    };
    EventDispatcher.prototype.suspend = function (queue, token) {
        if (token === void 0) { token = null; }
        if (null === token) {
            token = (++EventDispatcher._suspendTokenGen).toString();
        }
        if (this._suspendTokens.indexOf(token) === -1) {
            this._suspendTokens.push(token);
        }
        if (queue) {
            this._suspendQueue = true;
        }
        if (this._suspendQueue && this._queue.indexOf(token) === -1) {
            this._queue.push(token);
        }
        return token;
    };
    EventDispatcher.prototype.resume = function (token) {
        if (token === void 0) { token = null; }
        var index, event;
        if (token === null) {
            token = this._suspendTokens.pop();
        }
        else {
            index = this._suspendTokens.indexOf(token);
            if (index === -1) {
                return;
            }
            else {
                this._suspendTokens.splice(index, 1);
            }
        }
        while (!this.suspended && (this._queue.length > 0)) {
            event = this._queue.shift();
            if (event instanceof ev.Event) {
                this.dispatch(event);
            }
        }
        if (!this.suspended) {
            this._suspendQueue = false;
        }
    };
    EventDispatcher.prototype.relay = function (dispatcher, eventType, options) {
        if (eventType === void 0) { eventType = null; }
        if (options === void 0) { options = null; }
        if (this === dispatcher) {
            throw new Error('Dispatcher can\'t relay self events');
        }
        if (this.relayed(dispatcher)) {
            return;
        }
        dispatcher.addListener(this.onEvent, this, eventType, options);
        this._dispatchers.push(dispatcher);
    };
    EventDispatcher.prototype.relayAll = function (dispatchers, eventType, options) {
        if (eventType === void 0) { eventType = null; }
        if (options === void 0) { options = null; }
        var i;
        for (i = 0; i < dispatchers.length; i++) {
            this.relay(dispatchers[i], eventType, options);
        }
    };
    EventDispatcher.prototype.relayed = function (dispatcher) {
        return this._dispatchers.indexOf(dispatcher) > -1;
    };
    EventDispatcher.prototype.unrelay = function (dispatcher, eventType) {
        if (eventType === void 0) { eventType = null; }
        var index = this._dispatchers.indexOf(dispatcher);
        if (index > -1) {
            dispatcher.removeListener(this.onEvent, this, eventType);
            if (!dispatcher.hasListener(this.onEvent, this)) {
                this._dispatchers.splice(index, 1);
            }
        }
    };
    EventDispatcher.prototype.unrelayAll = function (dispatchers, eventType) {
        if (eventType === void 0) { eventType = null; }
        var i;
        for (i = 0; i < dispatchers.length; i++) {
            this.unrelay(dispatchers[i], eventType);
        }
    };
    EventDispatcher.prototype.purge = function () {
        this.purgeListeners();
        this.purgeDispatchers();
        this.purgeQueue();
    };
    EventDispatcher.prototype.purgeListeners = function (scope) {
        if (scope === void 0) { scope = null; }
        var i, index;
        if (null === scope) {
            this._listeners.length = 0;
            this._listenersAll.length = 0;
            this._listenersMap = {};
        }
        else if (this._listeners.length > 0) {
            for (i = this._listeners.length - 1; i >= 0; i--) {
                if (this._listeners[i].scope === scope) {
                    this._removeListener(this._listeners[i], this._listeners[i].eventTypes);
                }
            }
        }
    };
    EventDispatcher.prototype.purgeDispatchers = function () {
        var i;
        for (i = 0; i < this._dispatchers.length; i++) {
            this._dispatchers[i].removeListener(this.onEvent, this);
        }
        this._dispatchers.length = 0;
    };
    EventDispatcher.prototype.purgeQueue = function (token) {
        if (token === void 0) { token = null; }
        var i, index, start, count = 0, event, events;
        if (null === token) {
            this._queue.length = 0;
        }
        else {
            index = this._queue.indexOf(token);
            if (index > -1) {
                events = [];
                for (i = this._queue.length - 1; i >= index; i--) {
                    event = this._queue.pop();
                    if (!(event instanceof ev.Event)) {
                        events.push(event);
                    }
                }
                for (i = events.length - 1; i >= 0; i--) {
                    this._queue.push(events.pop());
                }
            }
        }
    };
    EventDispatcher.prototype.willDispatch = function (eventType) {
        var i, eventTypes, listeners;
        if (null === eventType || (eventType instanceof Array && 0 === eventType.length)) {
            throw new Error('EventType can\'t be null or empty array');
        }
        if (!this.hasListeners) {
            return false;
        }
        eventTypes = this._transform(eventType);
        listeners = this._eventType2Listener(eventTypes);
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].willDispatch(eventTypes)) {
                return true;
            }
        }
        return false;
    };
    EventDispatcher.prototype.onEvent = function (event) {
        this.dispatch(event);
    };
    EventDispatcher.prototype._transform = function (eventType) {
        var i, j, k, key, keys, arr, ret;
        if (null === eventType) {
            return null;
        }
        else if (typeof (eventType) === 'string') {
            key = eventType.toString();
            ret = [key];
        }
        else if (eventType instanceof Array) {
            ret = [];
            for (i = 0; i < eventType.length; i++) {
                arr = this._transform(eventType[i]);
                for (j = 0; j < arr.length; j++) {
                    if (ret.indexOf(arr[j]) === -1) {
                        ret.push(arr[j]);
                    }
                }
            }
        }
        else if (eventType instanceof Object) {
            ret = [];
            keys = Object.keys(eventType);
            for (i = 0; i < keys.length; i++) {
                key = keys[i];
                arr = this._transform(eventType[key]);
                for (j = 0; j < arr.length; j++) {
                    k = key + this._separator + arr[j];
                    if (ret.indexOf(k) === -1) {
                        ret.push(k);
                    }
                }
            }
        }
        return ret.sort();
    };
    EventDispatcher.prototype._eventType2Listener = function (eventTypes) {
        var i, j, eventType, arr, ret = this._listenersAll.slice();
        if (null === eventTypes) {
            return ret;
        }
        for (i = 0; i < eventTypes.length; i++) {
            eventType = eventTypes[i];
            if (!this._listenersMap.hasOwnProperty(eventType)) {
                continue;
            }
            arr = this._listenersMap[eventType];
            for (j = 0; j < arr.length; j++) {
                if (ret.indexOf(arr[j]) === -1) {
                    ret.push(arr[j]);
                }
            }
        }
        return ret;
    };
    EventDispatcher.prototype._applyEventDiff = function (listener, diff) {
        if (diff.add.length) {
            this._addListener(listener, diff.add, false);
        }
        if (diff.addAll) {
            this._addListener(listener, null, false);
        }
        if (diff.del.length) {
            this._removeListener(listener, diff.del, false);
        }
        if (diff.delAll) {
            this._removeListener(listener, null, false);
        }
    };
    EventDispatcher.prototype._addListener = function (listener, eventTypes, global) {
        if (global === void 0) { global = true; }
        var i, eventType;
        if (global) {
            if (this._listeners.indexOf(listener) === -1) {
                this._listeners.push(listener);
            }
        }
        if (null === eventTypes) {
            if (this._listenersAll.indexOf(listener) === -1) {
                this._listenersAll.push(listener);
            }
            return;
        }
        for (i = 0; i < eventTypes.length; i++) {
            eventType = eventTypes[i];
            if (this._listenersMap.hasOwnProperty(eventType)) {
                if (this._listenersMap[eventType].indexOf(listener) === -1) {
                    this._listenersMap[eventType].push(listener);
                }
            }
            else {
                this._listenersMap[eventType] = [listener];
            }
        }
    };
    EventDispatcher.prototype._removeListener = function (listener, eventTypes, global) {
        if (global === void 0) { global = true; }
        var i, index, eventType;
        if (global) {
            index = this._listeners.indexOf(listener);
            if (index > -1) {
                this._listeners.splice(index, 1);
            }
        }
        if (null === eventTypes) {
            index = this._listenersAll.indexOf(listener);
            if (index > -1) {
                this._listenersAll.splice(index, 1);
            }
            return;
        }
        for (i = 0; i < eventTypes.length; i++) {
            eventType = eventTypes[i];
            if (this._listenersMap.hasOwnProperty(eventType)) {
                index = this._listenersMap[eventType].indexOf(listener);
                if (index > -1) {
                    this._listenersMap[eventType].splice(index, 1);
                }
            }
        }
    };
    EventDispatcher._suspendTokenGen = 0;
    return EventDispatcher;
}());
exports.EventDispatcher = EventDispatcher;
var ListenerHelper = (function () {
    function ListenerHelper(listener, scope, eventTypes, options) {
        this._listOfAllowTypes = null;
        this._listOfDenyTypes = null;
        this._timeout = null;
        this.onDispatch = null;
        this._order = ++ListenerHelper._orderGen;
        this._listener = listener;
        this._scope = scope;
        this._listOfAllowTypes = eventTypes;
        this.options = options;
        if (this.buffer) {
            this._timeout = {};
        }
    }
    Object.defineProperty(ListenerHelper.prototype, "order", {
        get: function () {
            return this._order;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "eventTypes", {
        get: function () {
            return this._listOfAllowTypes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "hasEventTypes", {
        get: function () {
            if (null === this._listOfAllowTypes) {
                return true;
            }
            return this._listOfAllowTypes.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "listener", {
        get: function () {
            return this._listener;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "scope", {
        get: function () {
            return this._scope;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "options", {
        get: function () {
            return this._options;
        },
        set: function (options) {
            if (null === options) {
                return;
            }
            this._options = options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "extra", {
        get: function () {
            if (this._options && this._options.hasOwnProperty('extra')) {
                return this._options.extra;
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "single", {
        get: function () {
            if (!this._options) {
                return false;
            }
            else {
                return !!this._options.single;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "buffer", {
        get: function () {
            if (this._options && this._options.hasOwnProperty('buffer') && this._options.buffer > 0) {
                return +this._options.buffer;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "delay", {
        get: function () {
            if (this._options && this._options.hasOwnProperty('delay') && this._options.delay > 0) {
                return +this._options.delay;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "defer", {
        get: function () {
            if (this._options && this._options.hasOwnProperty('defer')) {
                return !!this._options.defer;
            }
            else {
                return false;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListenerHelper.prototype, "priority", {
        get: function () {
            if (this._options && this._options.hasOwnProperty('priority')) {
                return +this._options.priority;
            }
            else {
                return 0;
            }
        },
        enumerable: true,
        configurable: true
    });
    ListenerHelper.prototype.allowEventType = function (eventTypes) {
        var i, index, ret = {
            add: [],
            addAll: false,
            del: [],
            delAll: false
        };
        ret.add.length = 0;
        ret.addAll = false;
        ret.del.length = 0;
        ret.delAll = false;
        if (null === this._listOfAllowTypes) {
            if (null === this._listOfDenyTypes || 0 === this._listOfDenyTypes.length) {
                return ret;
            }
            if (null === eventTypes) {
                this._listOfDenyTypes.length = 0;
            }
            else {
                for (i = 0; i < eventTypes.length; i++) {
                    index = this._listOfDenyTypes.indexOf(eventTypes[i]);
                    if (index > -1) {
                        this._listOfDenyTypes.splice(index, 1);
                    }
                }
            }
        }
        else {
            if (null === eventTypes) {
                ret.addAll = true;
                ret.del = this._listOfAllowTypes;
                this._listOfAllowTypes = null;
            }
            else {
                for (i = 0; i < eventTypes.length; i++) {
                    index = this._listOfAllowTypes.indexOf(eventTypes[i]);
                    if (-1 === index) {
                        this._listOfAllowTypes.push(eventTypes[i]);
                        ret.add.push(eventTypes[i]);
                    }
                }
            }
        }
        return ret;
    };
    ListenerHelper.prototype.denyEventType = function (eventTypes) {
        var i, index, index, ret = {
            add: [],
            addAll: false,
            del: [],
            delAll: false
        };
        ret.add.length = 0;
        ret.addAll = false;
        ret.del.length = 0;
        ret.delAll = false;
        if (null === this._listOfAllowTypes) {
            if (null === this._listOfDenyTypes) {
                this._listOfDenyTypes = [];
            }
            for (i = 0; i < eventTypes.length; i++) {
                index = this._listOfDenyTypes.indexOf(eventTypes[i]);
                if (-1 === index) {
                    this._listOfDenyTypes.push(eventTypes[i]);
                }
            }
        }
        else {
            for (i = 0; i < eventTypes.length; i++) {
                index = this._listOfAllowTypes.indexOf(eventTypes[i]);
                if (index > -1) {
                    this._listOfAllowTypes.splice(index, 1);
                    ret.del.push(eventTypes[i]);
                }
            }
        }
        return ret;
    };
    ListenerHelper.prototype.dispatch = function (event, eventTypes) {
        if (!this.willDispatch(eventTypes)) {
            return;
        }
        switch (true) {
            case !!this.buffer:
                this._dispatchBuffered(event, eventTypes);
                break;
            case !!this.delay:
                this._dispatchDelayed(event);
                break;
            case this.defer:
                this._dispatchDeferred(event);
                break;
            default:
                this._dispatch(event);
                break;
        }
    };
    ListenerHelper.prototype.willDispatch = function (eventTypes) {
        var i, eventType;
        if (null === this._listOfAllowTypes) {
            if (null === this._listOfDenyTypes || 0 === this._listOfDenyTypes.length) {
                return true;
            }
            else {
                for (i = 0; i < eventTypes.length; i++) {
                    eventType = eventTypes[i];
                    if (this._listOfDenyTypes.indexOf(eventType) === -1) {
                        return true;
                    }
                }
            }
        }
        else {
            for (i = 0; i < eventTypes.length; i++) {
                eventType = eventTypes[i];
                if (this._listOfAllowTypes.indexOf(eventType) > -1) {
                    return true;
                }
            }
        }
        return false;
    };
    ListenerHelper.prototype._dispatchBuffered = function (event, eventTypes) {
        var me = this, hash = eventTypes.join(',');
        if (this._timeout.hasOwnProperty(hash)) {
            clearTimeout(this._timeout[hash]);
        }
        this._timeout[hash] = setTimeout(function () {
            delete me._timeout[hash];
            me._dispatch(event);
        }, this.buffer);
    };
    ListenerHelper.prototype._dispatchDelayed = function (event) {
        var me = this;
        setTimeout(function () {
            me._dispatch(event);
        }, this.delay);
    };
    ListenerHelper.prototype._dispatchDeferred = function (event) {
        var me = this;
        setTimeout(function () {
            me._dispatch(event);
        }, 0);
    };
    ListenerHelper.prototype._dispatch = function (event) {
        this._listener.call(this._scope, event, this.extra);
        if (this.onDispatch) {
            this.onDispatch(this, event);
        }
    };
    ListenerHelper._orderGen = 0;
    return ListenerHelper;
}());
