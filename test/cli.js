var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('cli').addBatch({
  'exec': {
    topic: function () {
      return function (command, ae86, checks) {
        checks.messages = [];
        return sandbox.require('../lib/cli', {
          requires: {
            './ae86': {
              AE86: function () {
                return {
                  init: function (dir, cb) {
                    if (command === 'init') {
                      assert.isNotNull(dir);
                      cb(ae86.err);
                    }
                  },
                  gen: function (params, cb) {
                    if (command === 'gen') {
                      assert.equal(params.foo, 'bar');
                      cb(ae86.err, ae86.results);
                    }
                  },
                  watch: function (listener) {
                    if (command === 'watch') {
                      listener({ mtime: 8 }, { mtime: 7 });
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
                checks.parseArgsCount = 1;
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
          },
          globals: {
            process: {
              exit: function (code) {
                checks.code = code;
              },
              cwd: function () {
                return 'dummydir';
              }
            },
            console: {
              error: function (message) {
                checks.messages.push(message);
              },
              log: function (message) {
                checks.messages.push(message);
              }
            }
          }
        });
      };
    },
    'should pass exit code 1 when init callback has an error': function (topic) {
      var checks = {},
        cli = topic('init', { err: new Error('some error')}, checks);
      cli.exec();
      assert.equal(checks.code, 1);
      assert.equal(checks.parseArgsCount, 1);
      assert.equal(checks.messages.length, 4);
      assert.equal(checks.messages[0], 'Initialising project');
      assert.equal(checks.messages[1], 'An error has occured. some error');
      assert.equal(checks.messages[2], 'Generating website');
      assert.equal(checks.messages[3], 'Watching project');
    },
    'should pass exit code 0 when init callback has no error': function (topic) {
      var checks = {},
        cli = topic('init', {}, checks);
      cli.exec();
      assert.equal(checks.code, 0);
      assert.equal(checks.parseArgsCount, 1);
      assert.equal(checks.messages.length, 3);
      assert.equal(checks.messages[0], 'Initialising project');
      assert.equal(checks.messages[1], 'Generating website');
      assert.equal(checks.messages[2], 'Watching project');
    },
    'should pass exit code 1  when gen callback has an error': function (topic) {
      var checks = {},
        cli = topic('gen', { err: new Error('some error')}, checks);
      cli.exec();
      assert.equal(checks.code, 1);
      assert.equal(checks.parseArgsCount, 1);
      assert.equal(checks.messages.length, 4);
      assert.equal(checks.messages[0], 'Initialising project');
      assert.equal(checks.messages[1], 'Generating website');
      assert.equal(checks.messages[2], 'An error has occured. some error');
      assert.equal(checks.messages[3], 'Watching project');
    },
    'should pass exit code 0 when gen callback has no error': function (topic) {
      var checks = {},
        cli = topic('gen', { results: ['index.html', 'contact.html'] }, checks);
      cli.exec();
      assert.equal(checks.code, 0);
      assert.equal(checks.parseArgsCount, 1);
      assert.equal(checks.messages.length, 4);
      assert.equal(checks.messages[0], 'Initialising project');
      assert.equal(checks.messages[1], 'Generating website');
      assert.equal(checks.messages[2], 'Total of 2 pages');
      assert.equal(checks.messages[3], 'Watching project');
    },
    'should watch with specified listener': function (topic) {
      var checks = {},
        cli = topic('watch', {}, checks);
      cli.exec();
      assert.equal(checks.messages.length, 4);
      assert.equal(checks.messages[0], 'Initialising project');
      assert.equal(checks.messages[1], 'Generating website');
      assert.equal(checks.messages[2], 'Watching project');
      assert.equal(checks.messages[3], 'Change detected. Regenerating website');
    }
  }
}).exportTo(module);