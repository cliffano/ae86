var assert = require('assert'),
    AE86 = require('../../lib/ae86').AE86,
    path = require('path'),
    vows = require('vows');

vows.describe('AE86').addBatch({
    'init': {
        topic: function () {
            var base = 'build/test/init';
            this.options = {
                layouts: path.join(base, 'layouts'),
                pages: path.join(base, 'pages'),
                partials: path.join(base, 'partials'),
                static: path.join(base, 'static'),
                mode: 0755
            };
            return new AE86(this.options);
        },
        'should create project directories and files': function (topic) {
            topic.init();
        }
    }
}).export(module);