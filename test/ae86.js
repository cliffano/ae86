var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('ae86').addBatch({
  'init': {
    topic: function () {
      return function (dirs, files, messages) {
        return sandbox.require('../lib/ae86', {
          requires: {
            file: {
              mkdirs: function (dir, mode, cb) {
                assert.equal(mode, '0755');
                dirs.push(dir);
                cb();
              }
            },
            fs: {
              writeFile: function (file, data, encoding, cb) {
                assert.equal(encoding, 'utf8');
                files.push(file);
                cb();
              }
            }
          },
          globals: {
            console: {
              log: function (message) {
                messages.push(message);
              }
            }
          }
        });
      };
    },
    'should create default directories when no options specified': function (topic) {
      var _err,
        dirs = [],
        files = [],
        messages = [],
        ae86 = new topic(dirs, files, messages).AE86();
      ae86.init(function (err) {
        _err = err;
      });
      assert.equal(dirs.length, 4);
      assert.equal(dirs[0], 'layouts');
      assert.equal(dirs[1], 'pages');
      assert.equal(dirs[2], 'partials');
      assert.equal(dirs[3], 'static');
      assert.equal(files.length, 3);
      assert.equal(files[0], 'layouts/default.html');
      assert.equal(files[1], 'pages/index.html');
      assert.equal(files[2], 'params.js');
      assert.isUndefined(_err);
      assert.equal(messages.length, 7);
      assert.equal(messages[0], '+ creating layouts');
      assert.equal(messages[1], '+ creating layouts/default.html');
      assert.equal(messages[2], '+ creating pages');
      assert.equal(messages[3], '+ creating pages/index.html');
      assert.equal(messages[4], '+ creating partials');
      assert.equal(messages[5], '+ creating static');
      assert.equal(messages[6], '+ creating params.js');
    },
    'should create custom directories when options specified': function (topic) {
      var _err,
        dirs = [],
        files = [],
        messages = [],
        ae86 = new topic(dirs, files, messages).AE86({
          layouts: 'mylayouts',
          pages: 'mypages',
          params: 'myparams',
          partials: 'mypartials',
          statik: 'mystatic'
        });
      ae86.init(function (err) {
        _err = err;
      });
      assert.equal(dirs.length, 4);
      assert.equal(dirs[0], 'mylayouts');
      assert.equal(dirs[1], 'mypages');
      assert.equal(dirs[2], 'mypartials');
      assert.equal(dirs[3], 'mystatic');
      assert.equal(files.length, 3);
      assert.equal(files[0], 'mylayouts/default.html');
      assert.equal(files[1], 'mypages/index.html');
      assert.equal(files[2], 'myparams.js');
      assert.isUndefined(_err);
      assert.equal(messages.length, 7);
      assert.equal(messages[0], '+ creating mylayouts');
      assert.equal(messages[1], '+ creating mylayouts/default.html');
      assert.equal(messages[2], '+ creating mypages');
      assert.equal(messages[3], '+ creating mypages/index.html');
      assert.equal(messages[4], '+ creating mypartials');
      assert.equal(messages[5], '+ creating mystatic');
      assert.equal(messages[6], '+ creating myparams.js');
    }
  },
  'gen': {
    topic: function () {
      return function (statik, compileDirs, processTemplates, messages) {
        return sandbox.require('../lib/ae86', {
          requires: {
            dateformat: function (format) {
              assert.equal(format, 'yyyymmddHHMMssLl');
              return 'mydate';
            },
            wrench: {
              copyDirSyncRecursive: function (src, dest) {
                statik[0] = {
                  src: src,
                  dest: dest
                };
              }
            },
            './engine': {
              compile: function (dir, cb) {
                compileDirs.push(dir);
                cb('compiled ' + dir);
              },
              process: function (dir, pages, layouts, partials, params, cb) {
                processTemplates[0] = {
                  dir: dir,
                  pages: pages,
                  layouts: layouts,
                  partials: partials,
                  params: params
                };
                cb(null, ['index.html', 'contact.html']);
              }
            }
          },
          globals: {
            console: {
              log: function (message) {
                messages.push(message);
              }
            }
          }
        });
      };
    },
    'should use default directories when no options specified': function (topic) {
      var _results,
        statik = [],
        compileDirs = [],
        processTemplates = [],
        messages = [],
        ae86 = new topic(statik, compileDirs, processTemplates, messages).AE86();
      ae86.gen({ foo: 'bar' }, function (err, results) {
        assert.isNull(err);
        _results = results;
      });
      assert.equal(statik[0].src, 'static');
      assert.equal(statik[0].dest, 'out');
      assert.equal(compileDirs.length, 3);
      assert.equal(compileDirs[0], 'partials');
      assert.equal(compileDirs[1], 'layouts');
      assert.equal(compileDirs[2], 'pages');
      assert.equal(processTemplates[0].dir, 'out');
      assert.equal(processTemplates[0].pages, 'compiled pages');
      assert.equal(processTemplates[0].layouts, 'compiled layouts');
      assert.equal(processTemplates[0].partials, 'compiled partials');
      assert.equal(processTemplates[0].params.foo, 'bar');
      assert.isEmpty(processTemplates[0].params.sitemap);
      assert.equal(processTemplates[0].params.__genId, 'mydate');
      assert.equal(messages[0], 'Generating website...');
      assert.equal(_results.length, 2);
      assert.equal(_results[0], 'index.html');
      assert.equal(_results[1], 'contact.html');
    },
    'should use custom directories when options specified': function (topic) {
      var _results,
        statik = [],
        compileDirs = [],
        processTemplates = [],
        messages = [],
        ae86 = new topic(statik, compileDirs, processTemplates, messages).AE86({
          out: 'myout',
          layouts: 'mylayouts',
          pages: 'mypages',
          partials: 'mypartials',
          statik: 'mystatic'
        });
      ae86.gen({ foo: 'bar' }, function (err, results) {
        assert.isNull(err);
        _results = results;
      });
      assert.equal(statik[0].src, 'mystatic');
      assert.equal(statik[0].dest, 'myout');
      assert.equal(compileDirs.length, 3);
      assert.equal(compileDirs[0], 'mypartials');
      assert.equal(compileDirs[1], 'mylayouts');
      assert.equal(compileDirs[2], 'mypages');
      assert.equal(processTemplates[0].dir, 'myout');
      assert.equal(processTemplates[0].pages, 'compiled mypages');
      assert.equal(processTemplates[0].layouts, 'compiled mylayouts');
      assert.equal(processTemplates[0].partials, 'compiled mypartials');
      assert.equal(processTemplates[0].params.foo, 'bar');
      assert.isEmpty(processTemplates[0].params.sitemap);
      assert.equal(processTemplates[0].params.__genId, 'mydate');
      assert.equal(messages[0], 'Generating website...');
      assert.equal(_results.length, 2);
      assert.equal(_results[0], 'index.html');
      assert.equal(_results[1], 'contact.html');
    }
  }
}).exportTo(module);