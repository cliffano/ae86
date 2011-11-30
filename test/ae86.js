var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('ae86').addBatch({
  'init': {
    topic: function () {
      return function (dirs) {
        return sandbox.require('../lib/ae86', {
          requires: {
            file: {
              mkdirsSync: function (dir, mode) {
                assert.equal(mode, '0755');
                dirs.push(dir);
              }
            }
          }
        });
      };
    },
    'should create default directories when no options specified': function (topic) {
      var dirs = [],
        ae86 = new topic(dirs).AE86();
      ae86.init();
      assert.equal(dirs[0], 'layouts');
      assert.equal(dirs[1], 'pages');
      assert.equal(dirs[2], 'partials');
      assert.equal(dirs[3], 'static');
    },
    'should create custom directories when options specified': function (topic) {
      var dirs = [],
        ae86 = new topic(dirs).AE86({
          layouts: 'mylayouts',
          pages: 'mypages',
          partials: 'mypartials',
          statik: 'mystatic'
        });
      ae86.init();
      assert.equal(dirs[0], 'mylayouts');
      assert.equal(dirs[1], 'mypages');
      assert.equal(dirs[2], 'mypartials');
      assert.equal(dirs[3], 'mystatic');
    }
  },
  'gen': {
    topic: function () {
      return function (statik, compileDirs, processTemplates) {
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
              process: function (dir, pages, layouts, partials, params) {
                processTemplates[0] = {
                  dir: dir,
                  pages: pages,
                  layouts: layouts,
                  partials: partials,
                  params: params
                };
              }
            }
          }
        });
      };
    },
    'should use default directories when no options specified': function (topic) {
      var statik = [],
        compileDirs = [],
        processTemplates = [],
        ae86 = new topic(statik, compileDirs, processTemplates).AE86();
      ae86.gen({ foo: 'bar' });
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
    },
    'should use custom directories when options specified': function (topic) {
      var statik = [],
        compileDirs = [],
        processTemplates = [],
        ae86 = new topic(statik, compileDirs, processTemplates).AE86({
          out: 'myout',
          layouts: 'mylayouts',
          pages: 'mypages',
          partials: 'mypartials',
          statik: 'mystatic'
        });
      ae86.gen({ foo: 'bar' });
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
    }
  }
}).exportTo(module);