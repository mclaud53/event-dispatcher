/**
 * The base event class.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export declare class Event<T> {
    /**
     * The type of event.
     */
    private _type;
    /**
     * The object that dispatched event.
     */
    private _target;
    /**
     * Indicates whether the behavior associated with the event can be prevented.
     */
    private _cancellable;
    /**
     * Indicates whether the preventDefault() method has been called on the event.
     */
    private _isDefaultPrevented;
    /**
     * The options of event.
     */
    private _options;
    /**
     * @contructor
     * @param {string} type The type of event.
     * @param {T} target
     * @param {boolean} cancellable Indicates whether the behavior associated with the event can be prevented.
     * @param {Object} options (optional) The options of event.
     */
    constructor(type: string, target: T, cancellable: boolean, options?: Object);
    /**
     * The type of event.
     */
    type: string;
    /**
     * The object that dispatched event.
     */
    target: T;
    /**
     * Indicates whether the behavior associated with the event can be prevented.
     */
    cancellable: boolean;
    /**
     * Indicates whether the preventDefault() method has been called on the event.
     */
    isDefaultPrevented: boolean;
    /**
     * The options of event.
     */
    options: Object;
    /**
     * Cancels an event's default behavior if that behavior can be canceled.
     */
    preventDefault(): void;
}

/**
 * The dispatcher of events.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export declare class EventDispatcher<E extends event.Event<T>, T> {
    /**
     * The list of listeners of events.
     */
    private _listeners;
    /**
     * The list of listened dispatchers.
     */
    private _dispatchers;
    /**
     * Event suspend count.
     */
    private _suspendCount;
    /**
     * Indicates whether suspended event will added to queue.
     */
    private _suspendQueue;
    /**
     * The queue of suspended events.
     */
    private _queue;
    /**
     * Indicates whether listeners of events has been added.
     */
    hasListeners: boolean;
    /**
     * Indicates whether events suspended.
     */
    suspended: boolean;
    /**
     * Adds the listener of events.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     */
    add(listener: {
        (event: E): void;
    }, scope: Object): void;
    /**
     * Adds the list of listeners of events.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     */
    addAll(listeners: {
        (event: E): void;
    }[], scope: Object): void;
    /**
     * Sends event to listeners.
     *
     * @param {T} event Event for dispatching.
     */
    dispatch(event: E): void;
    /**
     * Checks whether a listener is already added.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     * @return {boolean}
     */
    has(listener: {
        (event: E): void;
    }, scope: Object): boolean;
    /**
     * Deletes the listener of events.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     */
    remove(listener: {
        (event: E): void;
    }, scope: Object): void;
    /**
     * Deletes the list of listeners of events.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     */
    removeAll(listeners: {
        (event: E): void;
    }[], scope: Object): void;
    /**
     * Suspends the dispatch of events.
     * <b>Note that if this is called multiple times, the converse method resume will have to be called the same number of times for it to resume dispatching.</b>
     * <b>Note the cancellable events can't be suspended.</b>
     *
     * @param {boolean} queue Pass as true to queue up suspended events to be dispatch after the resume call instead of discarding all suspended events.
     */
    suspend(queue: boolean): void;
    /**
     * Resumes firing events (see suspend).
     * If events were suspended using the queueSuspended parameter, then all events fired during event suspension will be sent to any listeners now.
     */
    resume(): void;
    /**
     * Subscribes on events of the dispatcher.
     *
     * @param {EventDispatcher} dispatcher Listened dispatcher.
     */
    relay(dispatcher: EventDispatcher<E, T>): void;
    /**
     * Subscribes on events of the list of dispatchers.
     *
     * @param {EventDispatcher} dispatcher The list of listened dispatchers.
     */
    relayAll(dispatchers: EventDispatcher<E, T>[]): void;
    /**
     * Checks whether listen the dispatcher.
     *
     * @param {EventDispatcher} dispatcher The dispatcher of events.
     * @return {boolean}
     */
    relayed(dispatcher: EventDispatcher<E, T>): boolean;
    /**
     * Unsubscribes from events of the dispatcher.
     *
     * @param {EventDispatcher} dispatcher Listened dispatcher.
     */
    unrelay(dispatcher: EventDispatcher<E, T>): void;
    /**
     * Unsubscribes on events of the list of dispatchers.
     *
     * @param {EventDispatcher} dispatcher The list of listened dispatchers.
     */
    unrelayAll(dispatchers: EventDispatcher<E, T>[]): void;
    /**
     * Clears all (listeners, listened dispatchers, queue of the suspended events).
     */
    purge(): void;
    /**
     * Clears the list of listeners.
     */
    purgeListeners(): void;
    /**
     * Clears the list of listened dispatchers.
     */
    purgeDispatchers(): void;
    /**
     * Clears the queue of the suspended events.
     */
    purgeQueue(): void;
    /**
     * The listener of events for listened dispatchers.
     *
     * @private
     * @param {E} event The event received from listened dispatcher.
     */
    private onEvent(event);
}
