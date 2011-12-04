var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('cli').addBatch({
  'exec': {
    topic: function () {
      return function (command, ae86, result) {
        return sandbox.require('../lib/cli', {
          globals: {
            process: {
              exit: function (code) {
                result[0].code = code;
              },
              cwd: function () {
                return 'dummydir';
              }
            },
            console: {
              error: function (message) {
                result[0].message = message;
              },
              log: function (message) {
                result[0].message = message;
              }
            }
          },
          requires: {
            './ae86': {
              AE86: function () {
                return {
                  init: function (cb) {
                    if (command === 'init') {
                      cb(ae86.err, ae86.results);
                    }
                  },
                  gen: function (params, cb) {
                    if (command === 'gen') {
                      assert.equal(params.foo, 'bar');
                      cb(ae86.err, ae86.results);
                    }
                  }
                };
              }
            },
            nomnom: {
              scriptName: function (name) {
                assert.equal(name, 'ae86');
                return {
                  opts: function (scriptOpts) {
                    assert.equal(scriptOpts.version.string, '-v');
                    assert.isTrue(scriptOpts.version.flag);
                    assert.equal(scriptOpts.version.help, 'AE86 version number');
                    assert.equal(scriptOpts.version.callback(), '1.2.3');
                  }
                };
              },
              command: function (name) {
                return {
                  callback: function (cb) {
                    cb({});
                  }
                };
              },
              parseArgs: function () {
                result[0].parseArgsCount = 1;
              }
            },
            fs: {
              readFileSync: function (file) {
                return '{ "version": "1.2.3" }';
              }
            },
            'dummydir/params': {
              params: { foo: 'bar' }
            }
          }
        });
      };
    },
    'should pass exit code 1 when init callback has an error': function (topic) {
      var result = [{}],
        cli = topic('init', { err: new Error('some error')}, result);
      cli.exec();
      assert.equal(result[0].code, 1);
      assert.equal(result[0].parseArgsCount, 1);
      assert.equal(result[0].message, 'Error: some error');
    },
    'should pass exit code 0 when init callback has no error': function (topic) {
      var result = [{}],
        cli = topic('init', {}, result);
      cli.exec();
      assert.equal(result[0].code, 0);
      assert.equal(result[0].parseArgsCount, 1);
      assert.isUndefined(result[0].message);
    },
    'should pass exit code 1  when gen callback has an error': function (topic) {
      var result = [{}],
        cli = topic('gen', { err: new Error('some error')}, result);
      cli.exec();
      assert.equal(result[0].code, 1);
      assert.equal(result[0].parseArgsCount, 1);
      assert.equal(result[0].message, 'Error: some error');
    },
    'should pass exit code 0 when gen callback has no error': function (topic) {
      var result = [{}],
        cli = topic('gen', { results: ['index.html', 'contact.html'] }, result);
      cli.exec();
      assert.equal(result[0].code, 0);
      assert.equal(result[0].parseArgsCount, 1);
      assert.equal(result[0].message, '> total: 2 pages');
    }
  }
}).exportTo(module);