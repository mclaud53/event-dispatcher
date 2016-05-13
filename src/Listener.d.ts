import ev = require('./Event');
import lo = require('./ListenerOptions');

export type ListenerFn<E extends ev.Event<T>, T> = { (event: E, extra?: any): void };

/**
 * The interface of listener.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
export interface Listener<E extends ev.Event<T>, T>
{
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
	 * 	The list of valid values:
	 *		null         				 - Listens all types of events (by default)
	 *		'eventType'  				 - Listens only events that has type 'eventType'
	 *		['eventType1', 'eventType2'] - Listens events thats has type 'eventType1' or 'eventType2'
	 *
	 * @type {string|Array}
	 */
	eventType?: ev.EventType;

	/**
     * The options of listener. See ListenerOptions description for details.
     *
     * @type {Object}
     */
	options?: lo.ListenerOptions;
}