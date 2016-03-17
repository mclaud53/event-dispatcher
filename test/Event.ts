/// <reference path="../typings/main.d.ts" />
import ev = require('../src/Event');
import assert = require('assert');
require('sinomocha')();

describe('Event', function () {
	it('creation', function() {
		var type: string = 'TEST',
			target: Object = {},
			options: Object = {key: 'value'},
			instance: ev.Event<Object> = new ev.Event<Object>(type, target, true, { key: 'value' });

		assert.equal(instance.type, type, 'The wrong type of event');
		assert.equal(instance.target, target, 'The wrong target of event');
		assert.equal(instance.cancellable, true, 'The event isn\'t cancellable');
		assert.deepEqual(instance.options, options, 'The wrong options of event');
	});
});