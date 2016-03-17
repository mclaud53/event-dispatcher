import ev = require('./Event');
import ls = require('./Listener');
import lo = require('./ListenerOptions');

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
	 * Adds the listener of events.
	 * If listener already has been added adds types of event and updates options.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * 	The list of valid values:
	 *		null         				 - Listens all types of events (by default)
	 *		'eventType'  				 - Listens only events that has type 'eventType'
	 *		['eventType1', 'eventType2'] - Listens events thats has type 'eventType1' or 'eventType2'
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public add(listener: { (event: E): void }, scope: Object, eventType: (string | string[]) = null, options: lo.ListenerOptions = null): void
	{
		var i: number,
			l: ListenerHelper<E, T> = null,
			priority: number;

		for (i = 0; i < this._listeners.length; i++) {
			if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
				l = this._listeners[i];
				break;
			}
		}

		if (null === l) {
			l = new ListenerHelper<E, T>(listener, scope, eventType, options);
			if (this._listeners.length > 0) {
				if (this._listeners[0].priority < l.priority) {
					this._listenersSorted = false;
				}
			}
			this._listeners.unshift(l);
		} else {
			l.allowEventType(eventType);
			priority = l.priority;
			l.options = options;
			if (priority !== l.priority) {
				this._listenersSorted = false;
			}
		}
	}

	/**
	 * Adds the list of listeners of events.
	 * If listener already has been added adds types of event and updates options.
	 *
	 * @param {Array} listeners The list of listener of the events.
	 */
	public addAll(listeners: ls.Listener<E, T>[]): void
	{
		var i: number;

		for (i = listeners.length - 1; i >= 0; i--) {
			this.add(listeners[i].listener, listeners[i].scope, listeners[i].eventType, listeners[i].options);
		}
	}

	/**
	 * Sends event to listeners.
	 * 
	 * @param {E} event Event for dispatching.
	 */
	public dispatch(event: E): void
	{
		var i: number,
			me: EventDispatcher<E, T> = this;

		if (this.suspended && !event.cancellable) {
			if (this._suspendQueue) {
				this._queue.push(event);
			}
			return;
		}

		if (!this._listenersSorted) {
			this._sortListeners();
		}

		for (i = this._listeners.length - 1; i >= 0; i--) {
			this._listeners[i].dispatch(event);
			if (this._listeners[i].single) {
				if (this._listeners[i].buffer) {
					this._listeners[i].onDispatch = function (l: ListenerHelper<E, T>, e: E) {
						var index: number = me._listeners.indexOf(l);
						l.onDispatch = null;
						if (index > -1) {
							me._listeners.splice(index, 1);
						}
					}
				} else {
					this._listeners.splice(i, 1);
				}
			}
		}
	}

	/**
	 * Checks whether a listener is already added.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 * @return {boolean}
	 */
	public has(listener: { (event: E): void }, scope: Object): boolean
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
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will not be listening by listener.
	 * 	The list of valid values:
	 *		null         				 - Removes listener (by default)
	 *		'eventType'  				 - Stops listening of events that has type 'eventType'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 *		['eventType1', 'eventType2'] - Stops listening of events that has types 'eventType1' or 'eventType2'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 */
	public remove(listener: { (event: E): void }, scope: Object, eventType: (string | string[]) = null): void
	{
		var i: number,
			l: ListenerHelper<E, T> = null;

		for (i = this._listeners.length - 1; i >= 0; i++) {
			l = this._listeners[i];
			if ((l.listener === listener) && (l.scope === scope)) {
				if (null === eventType) {
					this._listeners.splice(i, 1);
				} else {
					l.denyEventType(eventType);
					if (!l.hasEventTypes) {
						this._listeners.splice(i, 1);
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
	public removeAll(listeners: ls.Listener<E, T>[]): void
	{
		var i: number;

		for (i = 0; i < listeners.length; i++) {
			this.remove(listeners[i].listener, listeners[i].scope, listeners[i].eventType);
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
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * 	The list of valid values:
	 *		null         				 - Listens all types of events (by default)
	 *		'eventType'  				 - Listens only events that has type 'eventType'
	 *		['eventType1', 'eventType2'] - Listens events thats has type 'eventType1' or 'eventType2'
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public relay(dispatcher: EventDispatcher<E, T>, eventType: (string | string[]) = null, options: lo.ListenerOptions = null): void
	{
		if (this.relayed(dispatcher)) {
			return;
		}

		dispatcher.add(this.onEvent, this, eventType, options);
		this._dispatchers.push(dispatcher);
	}

	/**
	 * Subscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will be listened by listener.
	 * 	The list of valid values:
	 *		null         				 - Listens all types of events (by default)
	 *		'eventType'  				 - Listens only events that has type 'eventType'
	 *		['eventType1', 'eventType2'] - Listens events thats has type 'eventType1' or 'eventType2'
	 * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
	 */
	public relayAll(dispatchers: EventDispatcher<E, T>[], eventType: (string | string[]) = null, options: lo.ListenerOptions = null): void
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
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will not be listening.
	 * 	The list of valid values:
	 *		null         				 - Stops listening all events of dispatcher (by default)
	 *		'eventType'  				 - Stops listening of events that has type 'eventType'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 *		['eventType1', 'eventType2'] - Stops listening of events that has types 'eventType1' or 'eventType2'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 */
	public unrelay(dispatcher: EventDispatcher<E, T>, eventType: (string | string[]) = null): void
	{
		var index: number = this._dispatchers.indexOf(dispatcher);

		if (index > -1) {
			dispatcher.remove(this.onEvent, this, eventType);
			if (!dispatcher.has(this.onEvent, this)) {
				this._dispatchers.splice(index, 1);
			}
		}
	}

	/**
	 * Unsubscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 * @param {string|string[]} eventType (optional; by default: null) The list of types of events that will not be listening.
	 * 	The list of valid values:
	 *		null         				 - Stops listening all events of dispatcher (by default)
	 *		'eventType'  				 - Stops listening of events that has type 'eventType'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 *		['eventType1', 'eventType2'] - Stops listening of events that has types 'eventType1' or 'eventType2'.
	 *									   If the listener has no other types of events, then listener will be deleted.
	 */
	public unrelayAll(dispatchers: EventDispatcher<E, T>[], eventType: (string | string[]) = null): void
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
	 */
	public purgeListeners(): void
	{
		this._listeners.length = 0;
	}

	/**
	 * Clears the list of listened dispatchers.
	 */
	public purgeDispatchers(): void
	{
		var i: number;
		for (i = 0; i < this._dispatchers.length; i++) {
			this._dispatchers[i].remove(this.onEvent, this);
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
	 * @param {string} eventType The type of event.
	 * @return {boolean}
	 */
	public willDispatch(eventType: string): boolean
	{
		var i: number;

		if (!this.hasListeners) {
			return false;
		}

		for (i = 0; i < this._listeners.length; i++) {
			if (this._listeners[i].willDispatch(eventType)) {
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
	 * Orders list of listeners by priority.
	 */
	private _sortListeners(): void
	{
		this._listeners.sort(function(a: ListenerHelper<E, T>, b: ListenerHelper<E, T>): number {
			return a.priority - b.priority;
		});

		this._listenersSorted = true;
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
	/**
	 * The listener of the events.
	 */
	private _listener: { (event: E): void };

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

	/**
	 * Callback. Triggered after event has been dispatched.
	 */
	public onDispatch: { (l: ListenerHelper<E, T>, e: E): void } = null;

	/**
	 * @constructor
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public constructor(listener: { (event: E): void }, scope: Object, eventType: (string | string[]), options: lo.ListenerOptions)
	{
		this._listener = listener;
		this._scope = scope;
		if (eventType instanceof Array) {
			this._listOfAllowTypes = eventType;
		} else if (null !== eventType) {
			this._listOfAllowTypes = [eventType];
		}
		this.options = options;
		if (this.buffer) {
			this._timeout = {};
		}
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

	public allowEventType(eventType: (string | string[])): void
	{
		var i: number,
			index: number;

		if (null === eventType) {
			this._listOfAllowTypes = null;
			if (this._listOfDenyTypes instanceof Array) {
				this._listOfDenyTypes.length = 0;
			}
			return;
		}

		if (null === this._listOfAllowTypes) {
			if (null === this._listOfDenyTypes || 0 === this._listOfDenyTypes.length) {
				return;
			}

			if (eventType instanceof Array) {
				for (i = 0; i < eventType.length; i++) {
					index = this._listOfDenyTypes.indexOf(eventType[i]);
					if (index > -1) {
						this._listOfDenyTypes.splice(index, 1);
					}
				}
			} else {
				index = this._listOfDenyTypes.indexOf(eventType);
				if (index > -1) {
					this._listOfDenyTypes.splice(index, 1);
				}
			}
		} else {
			if (eventType instanceof Array) {
				for (i = 0; i < eventType.length; i++) {
					index = this._listOfAllowTypes.indexOf(eventType[i]);
					if (-1 === index) {
						this._listOfAllowTypes.push(eventType[i]);
					}
				}
			} else {
				index = this._listOfAllowTypes.indexOf(eventType);
				if (-1 === index) {
					this._listOfAllowTypes.push(eventType);
				}
			}
		}
	}

	public denyEventType(eventType: (string | string[])): void
	{
		var i: number,
			index: number;

		if (null === this._listOfAllowTypes) {
			if (null === this._listOfDenyTypes) {
				this._listOfDenyTypes = [];
			}

			if (eventType instanceof Array) {
				for (i = 0; i < eventType.length; i++) {
					index = this._listOfDenyTypes.indexOf(eventType[i]);
					if (-1 === index) {
						this._listOfDenyTypes.push(eventType[i]);
					}
				}
			} else {
				index = this._listOfDenyTypes.indexOf(eventType);
				if (-1 === index) {
					this._listOfDenyTypes.push(eventType);
				}
			}
		} else {
			if (eventType instanceof Array) {
				for (i = 0; i < eventType.length; i++) {
					index = this._listOfAllowTypes.indexOf(eventType[i]);
					if (index > -1) {
						this._listOfAllowTypes.splice(index, 1);
					}
				}
			} else {
				index = this._listOfAllowTypes.indexOf(eventType);
				if (index > -1) {
					this._listOfAllowTypes.splice(index, 1);
				}
			}
		}
	}

	/**
	 * Sends event to listeners.
	 */
	public dispatch(event: E): void
	{
		if (!this.willDispatch(event.type)) {
			return;
		}

		switch (true) {
			case !!this.buffer:
				this._dispatchBuffered(event);
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
	 * @param {string} eventType The type of event.
	 * @return {boolean}
	 */
	public willDispatch(eventType: string): boolean
	{
		if (null === this._listOfAllowTypes) {
			if (null === this._listOfDenyTypes || 0 === this._listOfDenyTypes.length) {
				return true;
			} else {
				return this._listOfDenyTypes.indexOf(eventType) === -1;
			}
		}
		return this._listOfAllowTypes.indexOf(eventType) > -1;
	}

	/**
	 * Sends buffered event to listeners.
	 */
	private _dispatchBuffered(event: E): void
	{
		var me = this;

		if (this._timeout.hasOwnProperty(event.type)) {
			clearTimeout(this._timeout[event.type]);
		}

		this._timeout[event.type] = setTimeout(function() {
			delete me._timeout[event.type];
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
		this._listener.call(this._scope, event);

		if (this.onDispatch) {
			this.onDispatch(this, event);
		}
	}
}