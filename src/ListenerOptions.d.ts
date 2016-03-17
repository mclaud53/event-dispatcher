export = ListenerOptions;

/**
 * The interface of options of listener.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
interface ListenerOptions
 {
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
}