/// <reference path="../typings/main.d.ts" />
import ev = require('../src/Event');
import ed = require('../src/EventDispatcher');
import assert = require('assert');
import sinon = require('sinon');
require('sinomocha')();

describe('EventDispatcher', function() {

	it('creation', function() {
		var instance: ed.EventDispatcher<ev.Event<Object>, Object>;
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();

		assert.equal(instance.hasListeners, false, 'The new EventDispatcher can\'t has listeners');
		assert.equal(instance.suspended, false, 'The new EventDispatcher can\'t be suspended');
	});

	it('add', function() {
		var target: Object = {},
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				// do nothing
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);

		assert.equal(instance.hasListeners, true, 'The EventDispatcher must has listeners');
	});

	it('has', function() {
		var target: Object = {},
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				// do nothing
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);

		assert.equal(instance.has(listener, target), true, 'The listener must exists in the list of listeners');
	});

	it('add & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('add listener twice & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.add(listener, target);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});

	it('add several listeners & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCall: number[] = [];

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(function(e: ev.Event<Object>): void {
			actualCall.push(1);
		}, target);
		instance.add(function(e: ev.Event<Object>): void {
			actualCall.push(2);
		}, target);
		instance.dispatch(e);

		assert.equal(actualCall.join(', '), '1, 2', 'The listeners executed in the wrong order');
	});

	it('add listener, remove listener, dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.remove(listener, target);
		instance.dispatch(e);

		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
		assert.equal(actualCallCounter, 0, 'The listener mustn\'t be executed');
	});	

	it('addAll', function() {
		var target: Object = {},
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				// do nothing
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.addAll([{
			listener: listener,
			scope: target
		}]);

		assert.equal(instance.hasListeners, true, 'The EventDispatcher must has listeners');
	});	

	it('addAll & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.addAll([{
			listener: listener,
			scope: target
		}]);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('addAll two identical listeners & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.addAll([
			{
				listener: listener,
				scope: target
			},
			{
				listener: listener,
				scope: target
			}
		]);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});	

	it('addAll listener, removeAll listener, dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.addAll([{
			listener: listener,
			scope: target
		}]);
		instance.removeAll([{
			listener: listener,
			scope: target
		}]);
		instance.dispatch(e);

		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
		assert.equal(actualCallCounter, 0, 'The listener mustn\'t be executed');
	});

	it('suspend', function() {
		var instance: ed.EventDispatcher<ev.Event<Object>, Object>;
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();

		instance.suspend(false);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
	});	

	it('add & suspend & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});	

	it('add & suspend & dispatch cancellable', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('add & suspend & dispatch & resume', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(false);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');

		instance.resume();

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});		

	it('add & suspend queued & dispatch & resume', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(true);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');

		instance.resume();

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('relay', function() {
		var source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>;

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(source.hasListeners, true, 'The list of listeners can\'t be empty');
	});	

	it('relayed', function() {
		var source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>;

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(instance.relayed(source), true, 'The EventDispatcher must be relayed');
	});		

	it('relay & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relay(source);
		instance.add(listener, target);
		source.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});

	it('relay & unrelay & dispatch', function() {
		var source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>;

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(source.hasListeners, true, 'The list of listeners can\'t be empty');
		instance.unrelay(source);
		assert.equal(instance.hasListeners, false, 'The list of listeners must be empty');
	});

	it('relayAll two identical dispatchers & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relayAll([source, source]);
		instance.add(listener, target);
		source.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed');
	});	

	it('relayAll two dispatchers & both dispatch event', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source1: ed.EventDispatcher<ev.Event<Object>, Object>,
			source2: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		source1 = new ed.EventDispatcher<ev.Event<Object>, Object>();
		source2 = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relayAll([source1, source2]);
		instance.add(listener, target);
		source1.dispatch(e);
		source2.dispatch(e);

		assert.equal(actualCallCounter, 2, 'The listener must be executed twice');
	});	

	it('relayAll & unrelayAll & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			source1: ed.EventDispatcher<ev.Event<Object>, Object>,
			source2: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		source1 = new ed.EventDispatcher<ev.Event<Object>, Object>();
		source2 = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relayAll([source1, source2]);
		instance.unrelayAll([source1, source2]);
		instance.add(listener, target);
		source1.dispatch(e);
		source2.dispatch(e);

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});

	it('purgeListeners', function() {
		var target: Object = {},
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				// do nothing
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);

		assert.equal(instance.hasListeners, true, 'The EventDispatcher must has listeners');

		instance.purge();

		assert.equal(instance.hasListeners, false, 'The EventDispatcher can\'t has listeners');
	});	

	it('purgeListeners by scope', function() {
		var sender: Object = {},
			target1: Object = {},
			target2: Object = {},
			e: ev.Event<Object> = new ev.Event<Object>('EVENT', sender, false, { key: 'value' }),
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			actualCall: number[] = [];

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();

		instance.add(function(e: ev.Event<Object>): void {
			actualCall.push(1);
		}, target1);
		
		instance.add(function(e: ev.Event<Object>): void {
			actualCall.push(2);
		}, target2);

		instance.purgeListeners(target1);

		instance.dispatch(e);

		assert.equal(actualCall.join(', '), '2');
	});		

	it('purgeDispatchers', function() {
		var source: ed.EventDispatcher<ev.Event<Object>, Object>,
			instance: ed.EventDispatcher<ev.Event<Object>, Object>;

		source = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.relay(source);
		assert.equal(source.hasListeners, true, 'The list of listeners can\'t be empty');
		instance.purge();
		assert.equal(source.hasListeners, false, 'The list of listeners must be empty');
	});

	it('purgeQueue', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, false, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.suspend(true);
		instance.dispatch(e);

		assert.equal(instance.suspended, true, 'The EventDispatcher must be suspended');
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');

		instance.purge();
		instance.resume();
		
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed');
	});

	// Tests for release 1.1.0

	it('willDispatch', function () {
		var type: string = 'TEST',
			target: Object = {},
			instance: ed.EventDispatcher<ev.Event<Object>, Object>;
		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		assert.equal(instance.willDispatch(type), false, 'The new EventDispatcher can\'t dispatch event');

		instance.add(function(event: ev.Event<Object>): void {
			// do nothing
		}, target, type);
		assert.equal(instance.willDispatch(type), true, 'The EventDispatcher must dispatch events for added listeners');
	});

	it('add eventType & dispatch', function () {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, type);
		instance.dispatch(e);
		instance.dispatch(new ev.Event<Object>('WRONG_EVENT_TYPE', target, true, { key: 'value' }));

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});

	it('add & remove eventType & dispatch', function() {
		var type: string = 'DENY_TYPE',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target);
		instance.remove(listener, target, type);
		assert.equal(instance.willDispatch(type), false, 'The EventDispatcher can\'t dispatch events for excluded types of event');

		instance.dispatch(e);
		instance.dispatch(new ev.Event<Object>('ALLOW_TYPE', target, true, { key: 'value' }));

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});	

	it('add two types & remove one & dispatch', function() {
		var allowType: string = 'ALLOW_TYPE',
			denyType: string = 'DENY_TYPE',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, [allowType, denyType]);

		assert.equal(instance.willDispatch(allowType), true, 'The EventDispatcher must dispatch events for added listeners');
		assert.equal(instance.willDispatch(denyType), true, 'The EventDispatcher must dispatch events for added listeners');

		instance.remove(listener, target, denyType);
		assert.equal(instance.willDispatch(allowType), true, 'The EventDispatcher must dispatch events for added listeners');
		assert.equal(instance.willDispatch(denyType), false, 'The EventDispatcher can\'t dispatch events for excluded types of event');

		instance.dispatch(new ev.Event<Object>(allowType, target, true, { key: 'value' }));
		instance.dispatch(new ev.Event<Object>(denyType, target, true, { key: 'value' }));

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});	

	it('add single & dispatch twice', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			};

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, null, {single: true});
		instance.dispatch(e);
		instance.dispatch(e);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');
	});

	it('add several with different priority & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCall: number[] = [];

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();

		instance.add(function (event: ev.Event<Object>): void {
			actualCall.push(10);
		}, target, null, { priority: 10 });

		instance.add(function(event: ev.Event<Object>): void {
			actualCall.push(-10);
		}, target, null, { priority: -10 });

		instance.add(function(event: ev.Event<Object>): void {
			actualCall.push(0);
		}, target, null, { priority: 0 });
	
		instance.dispatch(e);

		assert.equal(actualCall.join(', '), '10, 0, -10', 'The listeners executed in a wrong order: ' + actualCall.join(', '));
	});	

	it('add delayed & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			},
			clock: Sinon.SinonFakeTimers = sinon.useFakeTimers();

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, null, { delay: 100 });
		instance.dispatch(e);
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed immediately after dispatch');

		clock.tick(99);	
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed before timeout');

		clock.tick(1);

		assert.equal(actualCallCounter, 1, 'The listener must be executed after timeout');

		clock.restore();
	});

	it('add deferred & dispatch', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			},
			clock: Sinon.SinonFakeTimers = sinon.useFakeTimers();

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, null, { defer: true });
		instance.dispatch(e);
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed immediately after dispatch');

		clock.tick(0);

		assert.equal(actualCallCounter, 1, 'The listener must be executed after timeout');

		clock.restore();
	});

	it('add buffered & dispatch twice', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			},
			clock: Sinon.SinonFakeTimers = sinon.useFakeTimers();

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, null, { buffer: 100 });
		instance.dispatch(e);
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed immediately after dispatch');

		clock.tick(50);

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed before timeout');

		instance.dispatch(e);

		clock.tick(50);

		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed before timeout after second event');

		clock.tick(50);

		assert.equal(actualCallCounter, 1, 'The listener must be executed after timeout');

		clock.restore();
	});

	it('add single buffered & dispatch twice', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = { key: 'value' },
			instance: ed.EventDispatcher<ev.Event<Object>, Object>,
			e: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' }),
			actualCallCounter: number = 0,
			listener: { (e: ev.Event<Object>): void } = function(e: ev.Event<Object>): void {
				actualCallCounter++;
			},
			clock: Sinon.SinonFakeTimers = sinon.useFakeTimers();

		instance = new ed.EventDispatcher<ev.Event<Object>, Object>();
		instance.add(listener, target, null, { single: true, buffer: 100 });
		instance.dispatch(e);
		assert.equal(actualCallCounter, 0, 'The listener can\'t be executed immediately after dispatch');

		clock.tick(50);

		instance.dispatch(e);

		clock.tick(100);

		assert.equal(actualCallCounter, 1, 'The listener must be executed after timeout');

		instance.dispatch(e);

		clock.tick(100);

		assert.equal(actualCallCounter, 1, 'The listener must be executed only once');

		clock.restore();
	});	
});