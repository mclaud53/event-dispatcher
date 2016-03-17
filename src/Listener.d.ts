import Event = require('./Event');
import ListenerOptions = require('./ListenerOptions');

export = Listener;

/**
 * The interface of listener.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
interface Listener<E extends Event<T>, T>
{
	/**
	 * The listener of the events.
	 *
	 * @type {Function}
	 */
	listener: { (event: E): void };

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
	eventType?: (string | string[]);

	/**
     * The options of listener. See ListenerOptions description for details.
     *
     * @type {Object}
     */
	options?: ListenerOptions;
}