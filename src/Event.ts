export = Event;

/**
 * The base event class.
 *
 * @author Georgii Matvieiev<georgii.matvieiev@gmail.com>
 */
class Event<T>
{
	/**
	 * The type of event.
	 *
	 * @private
	 * @type {string}
	 */
	private _type: string;

	/**
	 * The object that dispatched event.
	 *
	 * @private
	 */
	private _target: T;

	/**
	 * Indicates whether the behavior associated with the event can be prevented.
	 *
	 * @private
	 * @type {boolean}
	 */
	private _cancellable: boolean;

	/**
	 * Indicates whether the preventDefault() method has been called on the event.
	 *
	 * @private
	 * @type {boolean}
	 * @defaultvalue
	 */
	private _isDefaultPrevented: boolean = false;

	/**
	 * The options of event.
	 *
	 * @private
	 * @type {Object}
	 */
	private _options: Object;

	/**
	 * @contructor
	 * @param {string} type The type of event.
	 * @param {T} target
	 * @param {boolean} cancellable Indicates whether the behavior associated with the event can be prevented.
	 * @param {Object} options (optional) The options of event.
	 */
	public constructor(type: string, target: T, cancellable: boolean, options: Object = {})
	{
		this._type = type;
		this._target = target;
		this._cancellable = cancellable;
		this._options = options;
	}

	/**
	 * The type of event.
	 */
	public get type(): string
	{
		return this._type;
	}

	/**
	 * The object that dispatched event.
	 */
	public get target(): T
	{
		return this._target;
	}

	/**
	 * Indicates whether the behavior associated with the event can be prevented.
	 */
	public get cancellable(): boolean
	{
		return this._cancellable;
	}

	/**
	 * Indicates whether the preventDefault() method has been called on the event.
	 */
	public get isDefaultPrevented(): boolean
	{
		return this._isDefaultPrevented;
	}

	/**
	 * The options of event.
	 */
	public get options(): Object
	{
		return this._options;
	}

	/**
	 * Cancels an event's default behavior if that behavior can be canceled.
	 */
	public preventDefault(): void
	{
		if (this.cancellable) {
			this._isDefaultPrevented = true;
		}
	}
}