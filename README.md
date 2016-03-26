# EventDispatcher

 [![Build Status](https://api.travis-ci.org/mclaud53/event-dispatcher.svg?branch=master)](http://travis-ci.org/mclaud53/event-dispatcher)


## Install

 ```js
npm i frog-event-dispatcher
```

```js
bower i frog-event-dispatcher
```

Definitions for typescript:
```js
...
  "dependencies": {
  	...
  	"frog-event-dispatcher": "github:mclaud53/event-dispatcher/event-dispatcher.d.ts#1.3.0"
  	...
  }
...
```

## Usage

Simple example:
```js

var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

// subscribe on event "SOME_EVENT"
dispatcher.addListener(function (e) {
	console.log('event received!');
}, this, 'SOME_EVENT');

// dispatch of event
dispatcher.dispatch(new fed.Event('SOME_EVENT', this)); // -> event received!
```

To listen several events in one listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.type);
}, this, ['EVENT_1', 'EVENT_2', 'EVENT_3']);

dispatcher.dispatch(new fed.Event('EVENT_1', this)); // -> EVENT_1
dispatcher.dispatch(new fed.Event('EVENT_2', this)); // -> EVENT_2
dispatcher.dispatch(new fed.Event('EVENT_3', this)); // -> EVENT_3
```

To listen all events in one listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.type);
}, this);

dispatcher.dispatch(new fed.Event('ANY_EVENT', this)); // -> ANY_EVENT
```

To listen all events except some:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	listener = function (e) {
		console.log(e.type);
	};

dispatcher.addListener(listener, this);
dispatcher.removeListener(listener, this, ['EXCLUDED_EVENT', 'EXLUDED_EVENT_TOO']);

dispatcher.dispatch(new fed.Event('ANY_EVENT', this)); // -> ANY_EVENT
dispatcher.dispatch(new fed.Event('EXCLUDED_EVENT', this)); // -> 
```

To add several listeners:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListeners([
	{
		listener: function (e) {
			console.log('first listener!');
		},
		scope: this,
		eventType: 'FIRST_EVENT'
	},
	{
		listener: function (e) {
			console.log('second listener!');
		},
		scope: this,
		eventType: 'SECOND_EVENT'
	},
	{
		listener: function (e) {
			console.log('third listener!');
		},
		scope: this,
		eventType: 'THIRD_EVENT'
	}
]);

dispatcher.dispatch(new fed.Event('FIRST_EVENT', this));  // -> first listener!
dispatcher.dispatch(new fed.Event('SECOND_EVENT', this)); // -> second listener!
dispatcher.dispatch(new fed.Event('THIRD_EVENT', this));  // -> second listener!
```

To set priority to the listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log('listener with priority 0');
}, this, 'SOME_EVENT');	

dispatcher.addListener(function (e) {
	console.log('listener with priority -100');
}, this, 'SOME_EVENT', {priority: -100});

dispatcher.addListener(function (e) {
	console.log('listener with priority 100');
}, this, 'SOME_EVENT', {priority: 100});

dispatcher.dispatch(new fed.Event('SOME_EVENT', this));

// -> listener with priority 100
// -> listener with priority 0
// -> listener with priority -100
```

Dispatch of cancellable event:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	e.preventDefault();
}, this, 'SOME_EVENT');

dispatcher.dispatch(new fed.Event('SOME_EVENT', this, 'cancellable'));

console.log(event.isDefaultPrevented); // -> true
```

Dispatch event with extra data:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.options);
}, this, 'SOME_EVENT');

dispatcher.dispatch(new fed.Event('SOME_EVENT', this, false, {extra: 'extra data'})); // -> { extra: 'extra data' }
```

Automatic removal of the listener after receiving the first event:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND'], {single: true});

dispatcher.dispatch(new fed.Event('FIRST', this)); // -> FIRST
dispatcher.dispatch(new fed.Event('SECOND', this)); // -> 
```

Addition of the deferred listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log('event received!');
}, this, null, {delay: true});

dispatcher.dispatch(new fed.Event('SOME_EVENT', this));
console.log('event dispatched!');

// -> event dispatched!
// -> event received!
```

Addition of the delayed listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	time = (new Date()).valueOf();

dispatcher.addListener(function (e) {
	var delay = (new Date()).valueOf() - time;
	console.log('event received! delay: ' + delay);
}, this, null, {delay: 100});

dispatcher.dispatch(new fed.Event('SOME_EVENT', this));
console.log('event dispatched!');

// -> event dispatched!
// -> event received! delay: 102
```

Addition of the buffered listener:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	time = (new Date()).valueOf();

dispatcher.addListener(function (e) {
	var delay = (new Date()).valueOf() - time;
	console.log('event received! delay: ' + delay);
}, this, null, {buffer: 100});

dispatcher.dispatch(new fed.Event('SOME_EVENT', this));
setTimeout(function () {
	dispatcher.dispatch(new fed.Event('SOME_EVENT', this));
}, 50);

// -> event received! delay: 152
```

To check whether listeners were added:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.hasListeners); // -> false
dispatcher.addListener(listener, this);
console.log(dispatcher.hasListeners); // -> true
dispatcher.removeListener(listener, this);
console.log(dispatcher.hasListeners); // -> false
```

To check there are listeners for an event:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.willDispatch('SOME_EVENT')); // -> false
dispatcher.addListener(listener, this, 'SOME_EVENT');
console.log(dispatcher.willDispatch('SOME_EVENT')); // -> true
dispatcher.removeListener(listener, this, 'SOME_EVENT');
console.log(dispatcher.willDispatch('SOME_EVENT')); // -> false
```

To check whether a listener is added
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	listener = function (e) {};

console.log(dispatcher.hasListener(listener, this)); // -> false
dispatcher.addListener(listener, this, 'SOME_EVENT');
console.log(dispatcher.hasListener(listener, this)); // -> true
dispatcher.removeListener(listener, this, 'SOME_EVENT');
console.log(dispatcher.hasListener(listener, this)); // -> false
```

To suspend a dispatching of events:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND']);

console.log(dispatcher.suspended); // -> false
dispatcher.suspend('To enqueue the suspended events');
console.log(dispatcher.suspended); // -> true

dispatcher.dispatch(new fed.Event('FIRST', this)); // -> 

// Warning! The cancellable events can't be suspended
dispatcher.dispatch(new fed.Event('SECOND', this, 'cancellable')); // -> SECOND 

dispatcher.resume(); // -> FIRST
console.log(dispatcher.suspended); // -> false
```

To clear queue of the suspended events:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log(e.type);
}, this, ['FIRST', 'SECOND']);

dispatcher.suspend('To enqueue the suspended events');

dispatcher.dispatch(new fed.Event('FIRST', this)); // -> 
dispatcher.dispatch(new fed.Event('SECOND', this)); // -> 

dispatcher.purgeQueue();

dispatcher.resume(); // -> 
```

To remove all listeners:
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log('first listener');
}, this);

dispatcher.addListener(function (e) {
	console.log('second listener');
}, this);

dispatcher.purgeListeners();

dispatcher.dispatch(new fed.Event('SOME_EVENT', this)); // -> 
```

To remove all listeners by scope:
```js
var fed = require('frog-event-dispatcher'),
	scope1 = {},
	scope2 = {},
	dispatcher = new fed.EventDispatcher();

dispatcher.addListener(function (e) {
	console.log('first listener');
}, scope1);

dispatcher.addListener(function (e) {
	console.log('second listener');
}, scope2);

dispatcher.purgeListeners(scope1);

dispatcher.dispatch(new fed.Event('SOME_EVENT', this)); // -> second listener
```

To proxy events from other dispatcher:
```js
var fed = require('frog-event-dispatcher'),
	first = new fed.EventDispatcher(),
	second = new fed.EventDispatcher();

first.addListener(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new fed.Event('SOME_EVENT', this)); // -> event received!
```

To stop proxying of events from other dispatcher:
```js
var fed = require('frog-event-dispatcher'),
	first = new fed.EventDispatcher(),
	second = new fed.EventDispatcher();

first.addListener(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new fed.Event('SOME_EVENT', this)); // -> event received!

first.unrelay(second);

second.dispatch(new fed.Event('SOME_EVENT', this)); // ->
```

To stop proxying of events from all dispatchers:
```js
var fed = require('frog-event-dispatcher'),
	first = new fed.EventDispatcher(),
	second = new fed.EventDispatcher();

first.addListener(function (e) {
	console.log('event received!');
}, this);

first.relay(second);

second.dispatch(new fed.Event('SOME_EVENT', this)); // -> event received!

first.purgeDispatchers();

second.dispatch(new fed.Event('SOME_EVENT', this)); // ->
```

To check whether events are dispatching from a dispatcher:
```js
var fed = require('frog-event-dispatcher'),
	first = new fed.EventDispatcher(),
	second = new fed.EventDispatcher();

console.log(first.relayed(second)); // -> false
first.relay(second);
console.log(first.relayed(second)); // -> true
first.unrelayAll([second]);
console.log(first.relayed(second)); // -> false
```

To send event with multiple targets (Added in release 1.2.0):
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	event;

dispatcher.addListener(function (e) {
	console.log('first listener');
}, this, 'EVENT:FIRST');

dispatcher.addListener(function (e) {
	console.log('second listener');
}, this, 'EVENT:SECOND');

event = new fed.Event({
	EVENT: ['FIRST', 'SECOND'] // The same as ['EVENT:FIRST', 'EVENT:SECOND']
}, this, false);

dispatcher.dispatch(event);

// -> first listener
// -> second listener
```

To add listener with extra data (Added in release 1.2.1):
```js
var fed = require('frog-event-dispatcher'),
	dispatcher = new fed.EventDispatcher(),
	event;

dispatcher.addListener(function (e, extra) {
	console.log(extra);
}, this, 'EVENT:FIRST', {extra: 'first listener'});

dispatcher.addListener(function (e, extra) {
	console.log(extra);
}, this, 'EVENT:SECOND', {extra: 'second listener'});

event = new fed.Event({
	EVENT: ['FIRST', 'SECOND'] // The same as ['EVENT:FIRST', 'EVENT:SECOND']
}, this, false);

dispatcher.dispatch(event);

// -> first listener
// -> second listener
```

Cross relay events (Added in release 1.2.2)
```js
var fed = require('frog-event-dispatcher'),
	firstDispatcher = new fed.EventDispatcher(),
	secondDispatcher = new fed.EventDispatcher(),
	event = new fed.Event(['FIRST', 'SECOND'], this);

firstDispatcher.addListener(function (e, extra) {
	console.log('first listener');
}, this, 'FIRST');

secondDispatcher.addListener(function (e, extra) {
	console.log('second listener');
}, this, 'SECOND');

firstDispatcher.relay(secondDispatcher);
secondDispatcher.relay(firstDispatcher);

firstDispatcher.dispatch(event);
// -> first listener
// -> second listener

secondDispatcher.dispatch(event);
// -> second listener
// -> first listener
```

## License

MIT