var _ = require('underscore'),
  assert = require('assert'),
  sandbox = require('sandboxed-module'),
  vows = require('vows');

vows.describe('ae86').addBatch({
  'init': {
    topic: function () {
      return function (checks) {
        return sandbox.require('../lib/ae86', {
          requires: {
            ncp: {
              ncp: function (src, dest, cb) {
                assert.equal(dest, '.');
                checks.src = src;
                cb();
              }
            }
          }
        });
      };
    },
    'should call ncp recursive copy with specified source dir': function (topic) {
      var _err,
        checks = {},
        ae86 = new topic(checks).AE86();
      ae86.init('examples', function (err) {
        _err = err;
      });
      assert.equal(checks.src, 'examples');
      assert.isUndefined(_err);
    }
  },
  'gen': {
    topic: function () {
      return function (checks) {
        return sandbox.require('../lib/ae86', {
          requires: {
            dateformat: function (format) {
              assert.equal(format, 'yyyymmddHHMMssLl');
              return 'mydate';
            },
            ncp: {
              ncp: function (src, dest, cb) {
                checks.statik = {
                  src: src,
                  dest: dest
                };
                cb();
              }
            },
            './engine': {
              compile: function (dir, cb) {
                checks.compileDirs.push(dir);
                cb('compiled ' + dir);
              },
              process: function (dir, pages, layouts, partials, params, cb) {
                checks.processTemplates = {
                  dir: dir,
                  pages: pages,
                  layouts: layouts,
                  partials: partials,
                  params: params
                };
                cb(null, ['index.html', 'contact.html']);
              }
            }
          }
        });
      };
    },
    'should use default directories when no options specified': function (topic) {
      var _results,
        checks = { compileDirs: [] },
        ae86 = new topic(checks).AE86();
      ae86.gen({ foo: 'bar' }, function (err, results) {
        assert.isUndefined(err);
        _results = results;
      });
      assert.equal(checks.statik.src, 'static');
      assert.equal(checks.statik.dest, 'out');
      assert.equal(checks.compileDirs.length, 3);
      assert.equal(checks.compileDirs[0], 'partials');
      assert.equal(checks.compileDirs[1], 'layouts');
      assert.equal(checks.compileDirs[2], 'pages');
      assert.equal(checks.processTemplates.dir, 'out');
      assert.equal(checks.processTemplates.pages, 'compiled pages');
      assert.equal(checks.processTemplates.layouts, 'compiled layouts');
      assert.equal(checks.processTemplates.partials, 'compiled partials');
      assert.equal(checks.processTemplates.params.foo, 'bar');
      assert.isEmpty(checks.processTemplates.params.sitemap);
      assert.equal(checks.processTemplates.params.__genId, 'mydate');
    },
    'should use custom directories when options specified': function (topic) {
      var _results,
        checks = { compileDirs: [] },
        ae86 = new topic(checks).AE86({
          out: 'myout',
          layouts: 'mylayouts',
          pages: 'mypages',
          partials: 'mypartials',
          statik: 'mystatic'
        });
      ae86.gen({ foo: 'bar' }, function (err, results) {
        assert.isUndefined(err);
        _results = results;
      });
      assert.equal(checks.statik.src, 'mystatic');
      assert.equal(checks.statik.dest, 'myout');
      assert.equal(checks.compileDirs.length, 3);
      assert.equal(checks.compileDirs[0], 'mypartials');
      assert.equal(checks.compileDirs[1], 'mylayouts');
      assert.equal(checks.compileDirs[2], 'mypages');
      assert.equal(checks.processTemplates.dir, 'myout');
      assert.equal(checks.processTemplates.pages, 'compiled mypages');
      assert.equal(checks.processTemplates.layouts, 'compiled mylayouts');
      assert.equal(checks.processTemplates.partials, 'compiled mypartials');
      assert.equal(checks.processTemplates.params.foo, 'bar');
      assert.isEmpty(checks.processTemplates.params.sitemap);
      assert.equal(checks.processTemplates.params.__genId, 'mydate');
    }
  }
}).exportTo(module);