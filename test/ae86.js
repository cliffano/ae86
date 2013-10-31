var AE86 = require('../lib/ae86'),
  buster = require('buster-node'),
  Engine = require('../lib/engine'),
  ncp = require('ncp'),
  p = require('path'),
  referee = require('referee'),
  watchtree = require('watch-tree-maintained'),
  wrench = require('wrench'),
  assert = referee.assert;

buster.testCase('ae86 - init', {
  'should delegate to ncp ncp when initialising the project': function (done) {
    this.stub(ncp, 'ncp', function (source, dest, cb) {
      assert.isTrue(source.match(/.+\/ae86\/examples$/).length === 1);
      assert.equals(dest, '.');
      cb();
    });
    var ae86 = new AE86();
    ae86.init(function (err, result) {
      done();
    });
  }
});

buster.testCase('ae86 - generate', {
  setUp: function () {
    this.mockNcp = this.mock(ncp);
    this.useFakeTimers(new Date(2000, 9, 10).getTime());
    this.ae86 = new AE86({ params: { foo: 'bar' }});
  },
  'should copy static files and process pages': function (done) {
    this.stub(process, 'cwd', function () { return p.join(__dirname, '/fixtures'); });
    this.mockNcp.expects('ncp').once().withArgs('static', 'out').callsArgWith(2);
    this.stub(Engine.prototype, 'compile', function (dir, cb) {
      assert.isTrue(['partials', 'layouts', 'pages'].indexOf(dir) !== -1);
      cb();
    });
    this.stub(Engine.prototype, 'merge', function (dir, templates, params, cb) {
      assert.equals(dir, 'out');
      assert.isObject(params.sitemap);
      assert.equals(params.__genId, '20001010000000');
      cb();      
    });
    this.ae86.generate(function (err, result) {
      done();
    });
  }
});

buster.testCase('ae86 - watch', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.stub(process, 'cwd', function () { return '/somepath'; });
    this.ae86 = new AE86();
    require.cache['/somepath/params.js'] = { foo: 'bar' };
  },
  'should ignore swap files and set sample rate on project directories and files': function () {
    var mockWatcher = {
      on: function (event, cb) {}
    };
    this.stub(watchtree, 'watchTree', function (file, opts) {
      assert.isTrue(['static', 'partials', 'layouts', 'pages', 'params.js'].indexOf(file) !== -1);
      assert.equals(opts.ignore, '\\.swp');
      assert.equals(opts['sample-rate'], 5);
      return { on: function (event, cb) {} };
    });
    this.ae86.watch();
  },
  'should log message and set listener when a file is created': function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'params.js');
    var mockWatcher = {
      on: function (event, cb) {}
    };
    this.stub(watchtree, 'watchTree', function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileCreated') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = this.spy();
    this.ae86.clean = this.spy();
    this.ae86.watch();
  },
  'should log message and set listener when a file is modified': function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'params.js');
    var mockWatcher = {
      on: function (event, cb) {}
    };
    this.stub(watchtree, 'watchTree', function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileModified') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = this.spy();
    this.ae86.clean = this.spy();
    this.ae86.watch();
  },
  'should log message and set listener when a file is deleted': function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'params.js');
    var mockWatcher = {
      on: function (event, cb) {}
    };
    this.stub(watchtree, 'watchTree', function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileDeleted') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = this.spy();
    this.ae86.clean = this.spy();
    this.ae86.watch();
  }
});

buster.testCase('ae86 - clean', {
  'should delegate to wrench rmdirRecursive when removing the generated website': function (done) {
    this.stub(wrench, 'rmdirRecursive', function (dir, cb) {
      assert.equals(dir, 'out');
      cb();
    });
    var ae86 = new AE86();
    ae86.clean(function (err, result) {
      done();
    });
  }
});