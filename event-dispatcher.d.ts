declare type EventType = string | string[] | Object | Object[];

/**
 * The base event class.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
declare class Event<T> {

    /**
     * @contructor
     * @param {string} type The type of event.
     * @param {T} target
     * @param {boolean} cancellable Indicates whether the behavior associated with the event can be prevented.
     * @param {Object} options (optional) The options of event.
     */
    constructor(type: EventType, target: T, cancellable: boolean, options?: Object);
    /**
     * The type of event.
     */
    type: EventType;
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

export type ListenerFn<E extends Event<T>, T> = { (event: E, extra?: any): void };

/**
 * The interface of options of listener.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
declare interface ListenerOptions {
    /**
     * The listener will be executed only once. After that the listener will be automatically removed.
     * By default: false.
     */
    single?: boolean;

    /**
     * The timeout before dispatch event.
     * If during this timeout the event dispatched again the first event will be replaced by second and timeout will be restarted.
     * Must be the natural positive number more than zero.
     */
    buffer?: number;

    /**
     * The timeout before dispatch event.
     * Must be the natural positive number more than zero.
     * If the option "buffer" is set that "delay" is ignored.
     */
    delay?: number;

    /**
     * Defers executing the listener until the current call stack has cleared, similar to using setTimeout with a delay of 0.
     * If one of options : beffer or delay is set, then defer is ignored.
      * By default: false.
     */
    defer?: boolean;

    /**
     * The priority of listener.
     * The listener with the greatest value of a priority is called by the first.
     * By default: 0.
     */
    priority?: number;

    /**
     * The extra data for listener.
     * By default: null.
     */
    extra?: any;    
}

/**
 * The interface of listener.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
declare interface Listener<E extends Event<T>, T> {
    /**
     * The listener of the events.
     *
     * @type {Function}
     */
    listener: ListenerFn<E, T>;

    /**
     * The scope (this reference) in which the listener function is called.
     *
     * @type {Object}
     */
    scope: Object;

    /**
     * The list of types of events that will not be listening by listener.
     * @type {string|Array}
     */
    eventType?: EventType;

    /**
     * The options of listener. See ListenerOptions description for details.
     *
     * @type {Object}
     */
    options?: ListenerOptions;
}

/**
 * The dispatcher of events.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export declare class EventDispatcher<E extends Event<T>, T> {

    /**
     * @constructor
     * @param {string} separator (By default: ':')
     */
    construct(separator?: string): void;
    /**
     * Indicates whether listeners of events has been added.
     */
    hasListeners: boolean;
    /**
     * Indicates whether events suspended.
     */
    suspended: boolean;
    separator: string;
    /**
     * Adds the listener of events.
     * If listener already has been added adds types of event and updates options.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
     * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
     */
    addListener(listener: ListenerFn<E, T>, scope: Object, eventType?: EventType, options?: ListenerOptions): void;
    /**
     * Adds the list of listeners of events.
     * If listener already has been added adds types of event and updates options.
     *
     * @param {Array} listeners The list of listener of the events.
     */
    addListeners(listeners: Listener<E, T>[]): void;
    /**
     * Sends event to listeners.
     *
     * @param {Event} event Event for dispatching.
     */
    dispatch(event: E): void;
    /**
     * Checks whether a listener is already added.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     * @return {boolean}
     */
    hasListener(listener: ListenerFn<E, T>, scope: Object): boolean;
    /**
     * Deletes the listener of events.
     *
     * @param {Function} listener The listener of the events.
     * @param {Object} scope The scope (this reference) in which the listener function is called.
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening by listener.
     */
    removeListener(listener: ListenerFn<E, T>, scope: Object, eventType?: EventType): void;
    /**
     * Deletes the list of listeners of events.
     *
     * @param {Array} listeners The list of listeners of the events.
     */
    removeListeners(listeners: Listener<E, T>[]): void;
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
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
     * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
     */
    relay(dispatcher: EventDispatcher<E, T>, eventType?: EventType, options?: ListenerOptions): void;
    /**
     * Subscribes on events of the list of dispatchers.
     *
     * @param {EventDispatcher} dispatcher The list of listened dispatchers.
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
     * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
     */
    relayAll(dispatchers: EventDispatcher<E, T>[], eventType?: EventType, options?: ListenerOptions): void;
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
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening.
     */
    unrelay(dispatcher: EventDispatcher<E, T>, eventType?: EventType): void;
    /**
     * Unsubscribes on events of the list of dispatchers.
     *
     * @param {EventDispatcher} dispatcher The list of listened dispatchers.
     * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening.
     */
    unrelayAll(dispatchers: EventDispatcher<E, T>[], eventType?: EventType): void;
    /**
     * Clears all (listeners, listened dispatchers, queue of the suspended events).
     */
    purge(): void;
    /**
     * Clears the list of listeners.
     * @param {Object} scope (optional; by default null)
     */
    purgeListeners(scope?: Object): void;
    /**
     * Clears the list of listened dispatchers.
     */
    purgeDispatchers(): void;
    /**
     * Clears the queue of the suspended events.
     */
    purgeQueue(): void;
    /**
     * Checks whether exist at least one listener for current type of the event.
     *
     * @param {EventType} eventType The type of event.
     * @return {boolean}
     */
    willDispatch(eventType: EventType): boolean;
}

