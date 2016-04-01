declare module "Event" {
    export type EventType = string | string[] | Object | Object[];
    /**
     * The base event class.
     *
     * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
     */
    export class Event<T> {
        /**
         * The type of event.
         *
         * @private
         * @type {string}
         */
        private _type;
        /**
         * The object that dispatched event.
         *
         * @private
         */
        private _target;
        /**
         * Indicates whether the behavior associated with the event can be prevented.
         *
         * @private
         * @type {boolean}
         */
        private _cancellable;
        /**
         * Indicates whether the preventDefault() method has been called on the event.
         *
         * @private
         * @type {boolean}
         * @defaultvalue
         */
        private _isDefaultPrevented;
        /**
         * The options of event.
         *
         * @private
         * @type {Object}
         */
        private _options;
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
}
declare module "EventDispatcher" {
    import ev = require("Event");
    import ls = require('./Listener');
    import lo = require('./ListenerOptions');
    /**
     * The dispatcher of events.
     *
     * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
     */
    export class EventDispatcher<E extends ev.Event<T>, T> {
        /**
         * The generator of unique tockens for suspend/resume methods.
         */
        private static _suspendTokenGen;
        /**
         * The list of listeners of events.
         */
        private _listeners;
        /**
         * The lst of listeners that listen all events.
         */
        private _listenersAll;
        /**
         * The mapping of type of event to the list of listeners.
         */
        private _listenersMap;
        /**
         * Indicates whether listeners are sorted.
         */
        private _listenersSorted;
        /**
         * The list of listened dispatchers.
         */
        private _dispatchers;
        /**
         * The list of tockens for suspend/resume methods.
         */
        private _suspendTokens;
        /**
         * Indicates whether suspended event will added to queue.
         */
        private _suspendQueue;
        /**
         * The queue of suspended events.
         */
        private _queue;
        /**
         * The separator between different deep of type of event.
         */
        private _separator;
        /**
         * The stack of dispatching events.
         */
        private _eventsStack;
        /**
         * @constructor
         * @param {string} separator (By default: ':')
         */
        constructor(separator?: string);
        /**
         * Indicates whether listeners of events has been added.
         */
        hasListeners: boolean;
        /**
         * Indicates whether events suspended.
         */
        suspended: boolean;
        /**
         * Returns separator.
         *
         * @type {string}
         */
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
        addListener(listener: ls.ListenerFn<E, T>, scope: Object, eventType?: ev.EventType, options?: lo.ListenerOptions): void;
        /**
         * Adds the list of listeners of events.
         * If listener already has been added adds types of event and updates options.
         *
         * @param {Array} listeners The list of listener of the events.
         */
        addListeners(listeners: ls.Listener<E, T>[]): void;
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
        hasListener(listener: ls.ListenerFn<E, T>, scope: Object): boolean;
        /**
         * Deletes the listener of events.
         *
         * @param {Function} listener The listener of the events.
         * @param {Object} scope The scope (this reference) in which the listener function is called.
         * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening by listener.
         */
        removeListener(listener: ls.ListenerFn<E, T>, scope: Object, eventType?: ev.EventType): void;
        /**
         * Deletes the list of listeners of events.
         *
         * @param {Array} listeners The list of listeners of the events.
         */
        removeListeners(listeners: ls.Listener<E, T>[]): void;
        /**
         * Suspends the dispatch of events.
         * <b>Note that if this is called multiple times, the converse method resume will have to be called the same number of times for it to resume dispatching.</b>
         * <b>Note the cancellable events can't be suspended.</b>
         *
         * @param {boolean} queue Pass as true to queue up suspended events to be dispatch after the resume call instead of discarding all suspended events.
         * @param {string|null} token (By default: null)
         */
        suspend(queue: boolean, token?: string): string;
        /**
         * Resumes firing events (see suspend).
         * If events were suspended using the queueSuspended parameter, then all events fired during event suspension will be sent to any listeners now.
         *
         * @param {string|null} token (By default: null)
         */
        resume(token?: string): void;
        /**
         * Subscribes on events of the dispatcher.
         *
         * @param {EventDispatcher} dispatcher Listened dispatcher.
         * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
         * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
         */
        relay(dispatcher: EventDispatcher<E, T>, eventType?: ev.EventType, options?: lo.ListenerOptions): void;
        /**
         * Subscribes on events of the list of dispatchers.
         *
         * @param {EventDispatcher} dispatcher The list of listened dispatchers.
         * @param {EventType} eventType (optional; by default: null) The list of types of events that will be listened by listener.
         * @param {Object} options (optional; by default: null) The options of listener. See ListenerOptions description for details.
         */
        relayAll(dispatchers: EventDispatcher<E, T>[], eventType?: ev.EventType, options?: lo.ListenerOptions): void;
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
        unrelay(dispatcher: EventDispatcher<E, T>, eventType?: ev.EventType): void;
        /**
         * Unsubscribes on events of the list of dispatchers.
         *
         * @param {EventDispatcher} dispatcher The list of listened dispatchers.
         * @param {EventType} eventType (optional; by default: null) The list of types of events that will not be listening.
         */
        unrelayAll(dispatchers: EventDispatcher<E, T>[], eventType?: ev.EventType): void;
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
         *
         * @param {string|null} token (By default: null)
         */
        purgeQueue(token?: string): void;
        /**
         * Checks whether exist at least one listener for current type of the event.
         *
         * @param {EventType} eventType The type of event.
         * @return {boolean}
         */
        willDispatch(eventType: ev.EventType): boolean;
        /**
         * The listener of events for listened dispatchers.
         *
         * @private
         * @param {E} event The event received from listened dispatcher.
         */
        private onEvent(event);
        /**
         * Transforms EventType to array of types of events.
         *
         * @private
         * @param {EventType} eventType
         * @return {Array|null}
         */
        private _transform(eventType);
        /**
         * Returns array of listeners by array of types of events/
         *
         * @private
         * @param {Array|null} eventTypes
         * @returns {Array}
         */
        private _eventType2Listener(eventTypes);
        /**
         * Updates mapping of event type to listeners by EventTypeDiff.
         *
         * @private
         * @param {ListenerHelper<E, T>} listener
         * @param {EventTypeDiff} diff
         */
        private _applyEventDiff(listener, diff);
        private _addListener(listener, eventTypes, global?);
        private _removeListener(listener, eventTypes, global?);
    }
}
