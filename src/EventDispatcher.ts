import ev = require('./Event');
import ls = require('./Listener');
import lo = require('./ListenerOptions');

type EventTypeDiff = {
	add: string[],
	addAll: boolean,
	del: string[],
	delAll: boolean
};

/**
 * The dispatcher of events.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export class EventDispatcher<E extends ev.Event<T>, T>
{

	/**
	 * The list of listeners of events.
	 */
	private _listeners: ListenerHelper<E, T>[] = [];

	/**
	 * The lst of listeners that listen all events.
	 */
	private _listenersAll: ListenerHelper<E, T>[] = [];

	/**
	 * The mapping of type of event to the list of listeners.
	 */
	private _listenersMap: {
		[key: string]: ListenerHelper<E, T>[]
	} = {};

	/**
	 * Indicates whether listeners are sorted.
	 */
	private _listenersSorted: boolean = true;

	/**
	 * The list of listened dispatchers.
	 */
	private _dispatchers: EventDispatcher<E, T>[] = [];

	/**
	 * Event suspend count.
	 */
	private _suspendCount: number = 0;

	/**
	 * Indicates whether suspended event will added to queue.
	 */
	private _suspendQueue: boolean = false;

	/**
	 * The queue of suspended events.
	 */
	private _queue: E[] = [];

	/**
	 * The separator between different deep of type of event.
	 */
	private _separator: string = ':';

	/**
	 * The stack of dispatching events.
	 */
	private _eventsStack: E[] = [];

	/**
	 * @constructor
	 * @param {string} separator (By default: ':')
	 */
	public constructor(separator: string = ':')
	{
		this._separator = separator;
	}

	/**
	 * Indicates whether listeners of events has been added.
	 */
	public get hasListeners(): boolean
	{
		return this._listeners.length > 0;
	}

	/**
	 * Indicates whether events suspended.
	 */
	public get suspended(): boolean
	{
		return this._suspendCount > 0;
	}

	/**
	 * Returns separator. 
	 *
	 * @type {string}
	 */
	public get separator(): string
	{
		return this._separator;
	}

	/**
	 * Adds the listener of events.
	 * If listener already has been added adds types of event and updates options.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public addListener(listener: ls.ListenerFn<E, T>, scope: Object, eventType: ev.EventType = null, options: lo.ListenerOptions = null): void
	{
		var i: number,
			l: ListenerHelper<E, T>,
			eventTypes: string[] = this._transform(eventType),
			diff: EventTypeDiff;

		for (i = 0; i < this._listeners.length; i++) {
			if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
				this._listeners[i].options = options;
				diff = this._listeners[i].allowEventType(eventTypes);
				this._applyEventDiff(this._listeners[i], diff);
				return;
			}
		}

		l = new ListenerHelper<E, T>(listener, scope, eventTypes, options);
		this._addListener(l, l.eventTypes);
	}

	/**
	 * Adds the list of listeners of events.
	 * If listener already has been added adds types of event and updates options.
	 *
	 * @param {Array} listeners The list of listener of the events.
	 */
	public addListeners(listeners: ls.Listener<E, T>[]): void
	{
		var i: number;

		for (i = listeners.length - 1; i >= 0; i--) {
			this.addListener(listeners[i].listener, listeners[i].scope, listeners[i].eventType, listeners[i].options);
		}
	}

	/**
	 * Sends event to listeners.
	 * 
	 * @param {Event} event Event for dispatching.
	 */
	public dispatch(event: E): void
	{
		var i: number,
			index: number,
			eventTypes: string[],
			listeners: ListenerHelper<E, T>[],
			me: EventDispatcher<E, T> = this;

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

		listeners.sort(function(a: ListenerHelper<E, T>, b: ListenerHelper<E, T>): number {
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
						listeners[i].onDispatch = function(l: ListenerHelper<E, T>, e: E) {
							me._removeListener(l, l.eventTypes);
						}
					} else {
						this._removeListener(listeners[i], listeners[i].eventTypes);
					}
				}
			}
		} finally {
			this._eventsStack.pop();
		}
	}

	/**
	 * Checks whether a listener is already added.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 * @return {boolean}
	 */
	public hasListener(listener: ls.ListenerFn<E, T>, scope: Object): boolean
	{
		var i: number;

		for (i = 0; i < this._listeners.length; i++) {
			if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Deletes the listener of events.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening by listener.
	 */
	public removeListener(listener: ls.ListenerFn<E, T>, scope: Object, eventType: ev.EventType = null): void
	{
		var i: number,
			index: number,
			eventTypes: string[] = this._transform(eventType),
			l: ListenerHelper<E, T> = null,
			diff: EventTypeDiff;

		for (i = this._listeners.length - 1; i >= 0; i++) {
			l = this._listeners[i];
			if ((l.listener === listener) && (l.scope === scope)) {
				if (null === eventTypes) {
					this._removeListener(l, l.eventTypes);
				} else {
					diff = l.denyEventType(eventTypes);
					if (l.hasEventTypes) {
						this._applyEventDiff(this._listeners[i], diff);
					} else {
						this._removeListener(l, l.eventTypes);
					}
				}
				break;
			}
		}
	}

	/**
	 * Deletes the list of listeners of events.
	 *
	 * @param {Array} listeners The list of listeners of the events.
	 */
	public removeListeners(listeners: ls.Listener<E, T>[]): void
	{
		var i: number;

		for (i = 0; i < listeners.length; i++) {
			this.removeListener(listeners[i].listener, listeners[i].scope, listeners[i].eventType);
		}
	}

	/**
	 * Suspends the dispatch of events.
	 * <b>Note that if this is called multiple times, the converse method resume will have to be called the same number of times for it to resume dispatching.</b>
	 * <b>Note the cancellable events can't be suspended.</b>
	 *
	 * @param {boolean} queue Pass as true to queue up suspended events to be dispatch after the resume call instead of discarding all suspended events.
	 */
	public suspend(queue: boolean): void
	{
		this._suspendCount++;
		if (queue) {
			this._suspendQueue = true;
		}
	}

	/**
	 * Resumes firing events (see suspend).
	 * If events were suspended using the queueSuspended parameter, then all events fired during event suspension will be sent to any listeners now.
	 */
	public resume(): void
	{
		var event: E;

		if (this._suspendCount > 0) {
			this._suspendCount--;
		}

		while (!this.suspended && (this._queue.length > 0)) {
			event = this._queue.shift();
			this.dispatch(event);
		}

		if (!this.suspended) {
			this._suspendQueue = false;
		}
	}

	/**
	 * Subscribes on events of the dispatcher.
	 *
	 * @param {EventDispatcher} dispatcher Listened dispatcher.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public relay(dispatcher: EventDispatcher<E, T>, eventType: ev.EventType = null, options: lo.ListenerOptions = null): void
	{
		if (this === dispatcher) {
			throw new Error('Dispatcher can\'t relay self events');
		}

		if (this.relayed(dispatcher)) {
			return;
		}

		dispatcher.addListener(this.onEvent, this, eventType, options);
		this._dispatchers.push(dispatcher);
	}

	/**
	 * Subscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public relayAll(dispatchers: EventDispatcher<E, T>[], eventType: ev.EventType = null, options: lo.ListenerOptions = null): void
	{
		var i: number;
		for (i = 0; i < dispatchers.length; i++) {
			this.relay(dispatchers[i], eventType, options);
		}
	}

	/**
	 * Checks whether listen the dispatcher.
	 *
	 * @param {EventDispatcher} dispatcher The dispatcher of events.
	 * @return {boolean}
	 */
	public relayed(dispatcher: EventDispatcher<E, T>): boolean
	{
		return this._dispatchers.indexOf(dispatcher) > -1;
	}

	/**
	 * Unsubscribes from events of the dispatcher.
	 *
	 * @param {EventDispatcher} dispatcher Listened dispatcher.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening.
	 */
	public unrelay(dispatcher: EventDispatcher<E, T>, eventType: ev.EventType = null): void
	{
		var index: number = this._dispatchers.indexOf(dispatcher);

		if (index > -1) {
			dispatcher.removeListener(this.onEvent, this, eventType);
			if (!dispatcher.hasListener(this.onEvent, this)) {
				this._dispatchers.splice(index, 1);
			}
		}
	}

	/**
	 * Unsubscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening.
	 */
	public unrelayAll(dispatchers: EventDispatcher<E, T>[], eventType: ev.EventType = null): void
	{
		var i: number;
		for (i = 0; i < dispatchers.length; i++) {
			this.unrelay(dispatchers[i], eventType);
		}
	}

	/**
	 * Clears all (listeners, listened dispatchers, queue of the suspended events).
	 */
	public purge(): void
	{
		this.purgeListeners();
		this.purgeDispatchers();
		this.purgeQueue();
	}

	/**
	 * Clears the list of listeners.
	 * @param {Object} scope (optional; by default null) 
	 */
	public purgeListeners(scope: Object = null): void
	{
		var i: number,
			index: number;

		if (null === scope) {
			this._listeners.length = 0;
			this._listenersAll.length = 0;
			this._listenersMap = {};
		} else if (this._listeners.length > 0) {
			for (i = this._listeners.length - 1; i >= 0; i--) {
				if (this._listeners[i].scope === scope) {
					this._removeListener(this._listeners[i], this._listeners[i].eventTypes);
				}
			}
		}
	}

	/**
	 * Clears the list of listened dispatchers.
	 */
	public purgeDispatchers(): void
	{
		var i: number;
		for (i = 0; i < this._dispatchers.length; i++) {
			this._dispatchers[i].removeListener(this.onEvent, this);
		}
		this._dispatchers.length = 0;
	}

	/**
	 * Clears the queue of the suspended events.
	 */
	public purgeQueue(): void
	{
		this._queue.length = 0;
	}

	/**
	 * Checks whether exist at least one listener for current type of the event.
	 *
	 * @param {EventType} eventType The type of event.
	 * @return {boolean}
	 */
	public willDispatch(eventType: ev.EventType): boolean
	{
		var i: number,
			eventTypes: string[],
			listeners: ListenerHelper<E, T>[];

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
	}

	/**
	 * The listener of events for listened dispatchers.
	 *
	 * @private
	 * @param {E} event The event received from listened dispatcher.
	 */
	private onEvent(event: E): void
	{
		this.dispatch(event);
	}

	/**
	 * Transforms EventType to array of types of events.
	 *
	 * @private
	 * @param {EventType} eventType
	 * @return {Array|null}
	 */
	private _transform(eventType: ev.EventType): string[]
	{
		var i: number,
			j: number,
			k: string,
			key: string,
			keys: string[],
			arr: string[],
			ret: string[];

		if (null === eventType) {
			return null;
		} else if (typeof (eventType) === 'string') {
			key = eventType.toString();
			ret = [key];
		} else if (eventType instanceof Array) {
			ret = [];
			for (i = 0; i < eventType.length; i++) {
				arr = this._transform(eventType[i]);
				for (j = 0; j < arr.length; j++) {
					if (ret.indexOf(arr[j]) === -1) {
						ret.push(arr[j]);
					}
				}
			}
		} else if (eventType instanceof Object) {
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
	}

	/**
	 * Returns array of listeners by array of types of events/
	 * 
	 * @private
	 * @param {Array|null} eventTypes
	 * @returns {Array}
	 */
	private _eventType2Listener(eventTypes: string[]): ListenerHelper<E, T>[]
	{
		var i: number,
			j: number,
			eventType: string,
			arr: ListenerHelper<E, T>[],
			ret: ListenerHelper<E, T>[] = this._listenersAll.slice();

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
	}

	/**
	 * Updates mapping of event type to listeners by EventTypeDiff.
	 *
	 * @private
	 * @param {ListenerHelper<E, T>} listener
	 * @param {EventTypeDiff} diff
	 */
	private _applyEventDiff(listener: ListenerHelper<E, T>, diff: EventTypeDiff): void
	{
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
	}

	private _addListener(listener: ListenerHelper<E, T>, eventTypes: string[], global: boolean = true): void
	{
		var i: number,
			eventType: string;

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
			} else {
				this._listenersMap[eventType] = [listener];
			}
		}
	}

	private _removeListener(listener: ListenerHelper<E, T>, eventTypes: string[], global: boolean = true): void
	{
		var i: number,
			index: number,
			eventType: string;

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
	}
}

/**
 * The container for the event listener.
 *
 * @private
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
class ListenerHelper<E extends ev.Event<T>, T>
{
	private static _orderGen: number = 0;

	/**
	 * The listener of the events.
	 */
	private _listener: ls.ListenerFn<E, T>;

	/**
	 * The scope (this reference) in which the listener function is called.
	 */
	private _scope: Object;

	/**
	 * The list of types of events.
	 * If null listens all events.
	 */
	private _listOfAllowTypes: string[] = null;

	private _listOfDenyTypes: string[] = null;

	private _options: lo.ListenerOptions;

	private _timeout: Object = null;

	private _order: number;

	/**
	 * Callback. Triggered after event has been dispatched.
	 */
	public onDispatch: { (l: ListenerHelper<E, T>, e: E): void } = null;

	/**
	 * @constructor
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public constructor(listener: ls.ListenerFn<E, T>, scope: Object, eventTypes: string[], options: lo.ListenerOptions)
	{
		this._order = ++ListenerHelper._orderGen;
		this._listener = listener;
		this._scope = scope;
		this._listOfAllowTypes = eventTypes;
		this.options = options;
		if (this.buffer) {
			this._timeout = {};
		}
	}

	public get order(): number
	{
		return this._order;
	}

	public get eventTypes(): string[]
	{
		return this._listOfAllowTypes;
	}

	public get hasEventTypes(): boolean
	{
		if (null === this._listOfAllowTypes) {
			return true;
		}
		return this._listOfAllowTypes.length > 0;
	}

	/**
	 * The listener of the events.
	 */
	public get listener(): (event: E) => void
	{
		return this._listener;
	}

	/**
	 * The scope (this reference) in which the listener function is called.
	 */
	public get scope(): Object
	{
		return this._scope;
	}

	public get options(): lo.ListenerOptions
	{
		return this._options;
	}

	public set options(options: lo.ListenerOptions)
	{
		if (null === options) {
			return;
		}

		this._options = options;
	}

	public get extra(): any
	{
		if (this._options &&  this._options.hasOwnProperty('extra')) {
			return this._options.extra;
		} else {
			return null;
		}
	}

	public get single(): boolean
	{
		if (!this._options) {
			return false;
		} else {
			return !!this._options.single;
		}
	}

	public get buffer(): number
	{
		if (this._options && this._options.hasOwnProperty('buffer') && this._options.buffer > 0) {
			return +this._options.buffer;
		} else {
			return 0;
		}
	}

	public get delay(): number
	{
		if (this._options && this._options.hasOwnProperty('delay') && this._options.delay > 0) {
			return +this._options.delay;
		} else {
			return 0;
		}
	}

	public get defer(): boolean
	{
		if (this._options && this._options.hasOwnProperty('defer')) {
			return !!this._options.defer;
		} else {
			return false;
		}
	}

	public get priority(): number
	{
		if (this._options && this._options.hasOwnProperty('priority')) {
			return +this._options.priority;
		} else {
			return 0;
		}
	}

	public allowEventType(eventTypes: string[]): EventTypeDiff
	{
		var i: number,
			index: number,
			ret: EventTypeDiff = {
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
			} else {
				for (i = 0; i < eventTypes.length; i++) {
					index = this._listOfDenyTypes.indexOf(eventTypes[i]);
					if (index > -1) {
						this._listOfDenyTypes.splice(index, 1);
					}
				}
			}
		} else {
			if (null === eventTypes) {
				ret.addAll = true;
				ret.del = this._listOfAllowTypes;
				this._listOfAllowTypes = null;
			} else {
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
	}

	public denyEventType(eventTypes: string[]): EventTypeDiff
	{
		var i: number,
			index: number,
			index: number,
			ret: EventTypeDiff = {
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
		} else {
			for (i = 0; i < eventTypes.length; i++) {
				index = this._listOfAllowTypes.indexOf(eventTypes[i]);
				if (index > -1) {
					this._listOfAllowTypes.splice(index, 1);
					ret.del.push(eventTypes[i]);
				}
			}
		}

		return ret;
	}

	/**
	 * Sends event to listeners.
	 */
	public dispatch(event: E, eventTypes: string[]): void
	{
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
	}

	/**
	 * Checks whether exist at least one listener for current type of the event.
	 *
	 * @param {Array} eventTypes The list of types of events.
	 * @return {boolean}
	 */
	public willDispatch(eventTypes: string[]): boolean
	{
		var i: number,
			eventType: string;

		if (null === this._listOfAllowTypes) {
			if (null === this._listOfDenyTypes || 0 === this._listOfDenyTypes.length) {
				return true;
			} else {
				for (i = 0; i < eventTypes.length; i++) {
					eventType = eventTypes[i];
					if (this._listOfDenyTypes.indexOf(eventType) === -1) {
						return true;
					}
				}
			}
		} else {
			for (i = 0; i < eventTypes.length; i++) {
				eventType = eventTypes[i];
				if (this._listOfAllowTypes.indexOf(eventType) > -1) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Sends buffered event to listeners.
	 */
	private _dispatchBuffered(event: E, eventTypes: string[]): void
	{
		var me = this,
			hash: string = eventTypes.join(',');

		if (this._timeout.hasOwnProperty(hash)) {
			clearTimeout(this._timeout[hash]);
		}

		this._timeout[hash] = setTimeout(function() {
			delete me._timeout[hash];
			me._dispatch(event);
		}, this.buffer);
	}

	/**
	 * Sends delayed event to listeners.
	 */
	private _dispatchDelayed(event: E): void
	{
		var me = this;
		setTimeout(function() {
			me._dispatch(event);
		}, this.delay);
	}

	/**
	 * Sends deferred event to listeners.
	 */
	private _dispatchDeferred(event: E): void
	{
		var me = this;
		setTimeout(function () {
			me._dispatch(event);
		}, 0);
	}

	/**
	 * Sends event to listeners.
	 */
	private _dispatch(event: E): void
	{
		this._listener.call(this._scope, event, this.extra);

		if (this.onDispatch) {
			this.onDispatch(this, event);
		}
	}
}