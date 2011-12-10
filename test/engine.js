var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('engine').addBatch({
  'compile': {
    topic: function () {
      return function (mocks) {
        return sandbox.require('../lib/engine', mocks);
      };
    },
    'when directory contains multiple files': {
      topic: function (topic) {
        topic({
          requires: {
            file: {
              walkSync: function (dir, cb) {
                assert.equal(dir, 'products');
                cb(dir, [], [ 'new.html', 'old.html', 'README.TXT' ]);
              }
            },
            fs: {
              readFile: function (file, encoding, cb) {
                assert.equal(encoding, 'utf8');
                var data;
                if (file === 'products/new.html') {
                  data = '<div id="new">{products.new}</div>';
                } else if (file === 'products/old.html') {
                  data = '<div id="old">{products.old}</div>';
                } else {
                  data = 'unexpected file ' + file;
                }
                cb(null, data);
              }
            }
          }
        }).compile('products', this.callback);
      },
      'then result should contain compilation result of all files': function (result, dummy) {
        assert.isFunction(result['new.html'].fn);
        assert.equal(result['new.html'].globals.length, 1);
        assert.equal(result['new.html'].globals[0], 'products');
        assert.isFunction(result['old.html'].fn);
        assert.equal(result['old.html'].globals.length, 1);
        assert.equal(result['old.html'].globals[0], 'products');
      },
      'and it should not contain compilation result of non .html file': function (result, dummy) {
        assert.isUndefined(result['README.TXT']);
      }
    },
    'when directory is empty': {
      topic: function (topic) {
        topic({
          requires: {
            file: {
              walkSync: function (dir, cb) {
                assert.equal(dir, 'products');
                cb(dir, [], []);
              }
            }
          }
        }).compile('products', this.callback);
      },
      'then result should be empty': function (result, dummy) {
        assert.isEmpty(_.keys(result));
      }
    }
  },
  'process': {
    'should write file with evaluated data and display page names on console': function () {
      var _messages = [], mkdirsPaths = [], processCount = 0, _results,
        engine = sandbox.require('../lib/engine', {
          requires: {
            file: {
              mkdirs: function (path, mode, cb) {
                mkdirsPaths.push(path);
                assert.equal(mode, '0755');
                cb(null);
              }
            },
            fs: {
              writeFile: function (file, data, encoding, cb) {
                assert.equal(encoding, 'utf8');
                cb(null);
              }
            }
          },
          globals: {
            console: {
              log: function (message) {
                _messages.push(message);
              }
            }
          }
        }),
        process = function (params, cb) {
          assert.equal(params.name, 'Bob');
          processCount += 1;
          cb(params);
        },
        dir = 'out',
        pages = { 'index.html': { process: process },
          'product/items.html': { process: process, globals: [ 'items' ] }},
        layouts = { 'default.html': { process: process },  'brochure.html': { process: process } },
        partials = { 'header.html': { process: process } },
        params = { name: 'Bob', sitemap: { 'products.html': { layout: 'brochure.html' } } };
      engine.process(dir, pages, layouts, partials, params, function (err, results) {
        assert.isUndefined(err);
        _results = results;
      });
      // each partial and layout is processed once per page
      assert.equal(processCount, 6);
      assert.equal(mkdirsPaths.length, 2);
      assert.equal(mkdirsPaths[0], 'out');
      assert.equal(mkdirsPaths[1], 'out/product');
      assert.equal(_messages.length, 2);
      assert.equal(_messages[0], '+ creating out/index.html');
      assert.equal(_messages[1], '+ creating out/product/items.html');
      assert.equal(_results.length, 2);
      assert.equal(_results[0], 'index.html');
      assert.equal(_results[1], 'product/items.html');
    }
  }
}).exportTo(module);