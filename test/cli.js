var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('cli').addBatch({
  'exec': {
    'should set commands based on args': function () {
      var _scriptOpts,
        initCount = 0,
        genCount = 0,
        parseArgsCount = 0;
        cli = sandbox.require('../lib/cli', {
          globals: {
            process: {
              cwd: function () {
                return 'currdir';
              }
            }
          },
          requires: {
            './ae86': {
              AE86: function () {
                return {
                  init: function () {
                    initCount += 1;
                  },
                  gen: function (params) {
                    assert.equal(params.foo, 'bar');
                    genCount += 1;
                  }
                };
              }
            },
            nomnom: {
              scriptName: function (name) {
                assert.equal(name, 'ae86')
                return {
                  opts: function (scriptOpts) {
                    _scriptOpts = scriptOpts;
                  }
                };
              },
              command: function (name) {
                return {
                  callback: function (cb) {
                    cb({});
                  }
                }
              },
              parseArgs: function () {
                parseArgsCount += 1;
              }
            },
            'currdir/params': {
              params: { foo: 'bar' }
            },
            fs: {
              readFileSync: function (file) {
                return '{ "version": "1.2.3" }';
              }
            }
          }
        });
      cli.exec();
      assert.equal(_scriptOpts.version.string, '-v');
      assert.isTrue(_scriptOpts.version.flag);
      assert.equal(_scriptOpts.version.help, 'AE86 version number');
      assert.equal(_scriptOpts.version.callback(), '1.2.3');
      assert.equal(initCount, 1);
      assert.equal(genCount, 1);
      assert.equal(parseArgsCount, 1);
    }
  }
}).exportTo(module);