var assert = require('assert'),
    Engine = require('../../lib/engine/jazz').Engine,
    vows = require('vows');

vows.describe('Engine').addBatch({
    'placeholder': {
        topic: function () {
            return new Engine();
        },
        'should do something': function (topic) {
        }
    }
}).export(module);