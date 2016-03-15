import event = require('./Event');

/**
 * The dispatcher of events.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export class EventDispatcher<E extends event.Event<T>, T>
{

	/**
	 * The list of listeners of events.
	 */
	private _listeners: EventListener<E, T>[] = [];

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
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public add(listener: { (event: E): void }, scope: Object): void
	{
		if (!this.has(listener, scope)) {
			this._listeners.push(new EventListener<E, T>(listener, scope));
		}
	}

	/**
	 * Adds the list of listeners of events.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public addAll(listeners: { (event: E): void }[], scope: Object): void
	{
		var i: number;

		for (i = 0; i < listeners.length; i++) {
			if (!this.has(listeners[i], scope)) {
				this._listeners.push(new EventListener<E, T>(listeners[i], scope));
			}
		}
	}

	/**
	 * Sends event to listeners.
	 * 
	 * @param {T} event Event for dispatching.
	 */
	public dispatch(event: E): void
	{
		var i: number,
			listener: (event: E) => void,
			scope: Object;

		if (this.suspended && !event.cancellable) {
			if (this._suspendQueue) {
				this._queue.push(event);
			}
			return;
		}

		for (i = 0; i < this._listeners.length; i++) {
			listener = this._listeners[i].listener;
			scope = this._listeners[i].scope;
			listener.call(scope, event);
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
	 */
	public remove(listener: { (event: E): void }, scope: Object): void
	{
		var i: number;

		for (i = this._listeners.length - 1; i >= 0; i++) {
			if ((this._listeners[i].listener === listener) && (this._listeners[i].scope === scope)) {
				this._listeners.splice(i, 1);
				break;
			}
		}
	}

	/**
	 * Deletes the list of listeners of events.
	 *
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public removeAll(listeners: { (event: E): void }[], scope: Object): void
	{
		var i: number,
			j: number;

		for (i = 0; i < listeners.length; i++) {
			for (j = this._listeners.length - 1; j >= 0; j++) {
				if ((this._listeners[j].listener === listeners[i]) && (this._listeners[j].scope === scope)) {
					this._listeners.splice(j, 1);
					break;
				}
			}
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
	 */
	public relay(dispatcher: EventDispatcher<E, T>): void
	{
		if (this.relayed(dispatcher)) {
			return;
		}

		dispatcher.add(this.onEvent, this);
	}

	/**
	 * Subscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 */
	public relayAll(dispatchers: EventDispatcher<E, T>[]): void
	{
		var i: number;
		for (i = 0; i < dispatchers.length; i++) {
			this.relay(dispatchers[i]);
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
	 */
	public unrelay(dispatcher: EventDispatcher<E, T>): void
	{
		var index: number = this._dispatchers.indexOf(dispatcher);

		if (index > -1) {
			dispatcher.remove(this.onEvent, event);
			this._dispatchers.splice(index, 1);
		}
	}

	/**
	 * Unsubscribes on events of the list of dispatchers.
	 *
	 * @param {EventDispatcher} dispatcher The list of listened dispatchers.
	 */
	public unrelayAll(dispatchers: EventDispatcher<E, T>[]): void
	{
		var i: number;
		for (i = 0; i < dispatchers.length; i++) {
			this.unrelay(dispatchers[i]);
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
	 * The listener of events for listened dispatchers.
	 *
	 * @private
	 * @param {E} event The event received from listened dispatcher.
	 */
	private onEvent(event: E): void
	{
		this.dispatch(event);
	}
}

/**
 * The container for the event listener.
 *
 * @private
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
class EventListener<E extends event.Event<T>, T>
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
	 * @constructor
	 * @param {Function} listener The listener of the events.
	 * @param {Object} scope The scope (this reference) in which the listener function is called.
	 */
	public constructor(listener: { (event: E): void }, scope: Object)
	{
		this._listener = listener;
		this._scope = scope;
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
}