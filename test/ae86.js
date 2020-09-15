"use strict"
import AE86 from '../lib/ae86.js';
import Engine from '../lib/engine.js';
import minifier from 'minifier';
import cpr from 'cpr';
import p from 'path';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
import watchtree from 'watch-tree-maintained';
import wrench from 'wrench';
const assert = referee.assert;

describe('ae86 - init', function() {

  it('should delegate to cpr cpr when initialising the project', function (done) {
    sinon.stub(cpr, 'cpr').value(function (source, dest, cb) {
      assert.isTrue(source.match(/.+\/examples$/).length === 1);
      assert.equals(dest, '.');
      cb();
    });
    const ae86 = new AE86();
    ae86.init(function (err, result) {
      done();
    });
  });
});

describe('ae86 - generate', function() {

  beforeEach(function () {
    this.mockMinifier = sinon.mock(minifier);
    this.mockCpr = sinon.mock(cpr);
    sinon.useFakeTimers(new Date(2000, 9, 10).getTime());
    this.ae86 = new AE86({ params: { foo: 'bar' }});
  });

  afterEach(function () {
    this.mockMinifier.verify();
    this.mockMinifier.restore();
    this.mockCpr.verify();
    this.mockCpr.restore();
  });

  it('should copy static files and process pages', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(__dirname, '/fixtures'); });
    this.mockMinifier.expects('on').once().withArgs('error');
    this.mockMinifier.expects('minify').once().withArgs('out');
    this.mockCpr.expects('cpr').once().withArgs('static', 'out').callsArgWith(2);
    const compileStub = sinon.stub(Engine.prototype, 'compile').value(function (dir, cb) {
      assert.isTrue(['partials', 'layouts', 'pages'].indexOf(dir) !== -1);
      cb();
    });
    const mergeStub = sinon.stub(Engine.prototype, 'merge').value(function (dir, templates, params, cb) {
      assert.equals(dir, 'out');
      assert.isObject(params.sitemap);
      assert.equals(params.__genId, '20001010000000');
      cb();
    });
    this.ae86.generate(function (err, result) {
      compileStub.restore();
      mergeStub.restore();
      done();
    });
  });

  it('should pass error when an error occurs while preparing static files', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(__dirname, '/fixtures'); });
    this.mockCpr.expects('cpr').once().withArgs('static', 'out').callsArgWith(2, new Error('some error'));
    const compileStub = sinon.stub(Engine.prototype, 'compile').value(function (dir, cb) {
      assert.isTrue(['partials', 'layouts', 'pages'].indexOf(dir) !== -1);
      cb();
    });
    const mergeStub = sinon.stub(Engine.prototype, 'merge').value(function (dir, templates, params, cb) {
      assert.equals(dir, 'out');
      assert.isObject(params.sitemap);
      assert.equals(params.__genId, '20001010000000');
      cb();
    });
    this.ae86.generate(function (err, result) {
      assert.equals(err.message, 'some error');
      compileStub.restore();
      mergeStub.restore();
      done();
    });
  });
});

describe('ae86 - watch', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
    sinon.stub(process, 'cwd').value(function () { return '/somepath'; });
    this.ae86 = new AE86();
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should ignore swap files and set sample rate on project directories and files', function () {
    const mockWatcher = {
      on: function (event, cb) {}
    };
    sinon.stub(watchtree, 'watchTree').value(function (file, opts) {
      assert.isTrue(['static', 'partials', 'layouts', 'pages', 'params.js'].indexOf(file) !== -1);
      assert.equals(opts.ignore, '\\.swp');
      assert.equals(opts['sample-rate'], 5);
      return { on: function (event, cb) {} };
    });
    this.ae86.watch();
  });

  it('should log message and set listener when a file is created', function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was created', 'params.js');
    const mockWatcher = {
      on: function (event, cb) {}
    };
    sinon.stub(watchtree, 'watchTree').value(function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileCreated') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });

  it('should log message and set listener when a file is modified', function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was modified', 'params.js');
    const mockWatcher = {
      on: function (event, cb) {}
    };
    sinon.stub(watchtree, 'watchTree').value(function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileModified') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });

  it('should log message and set listener when a file is deleted', function () {
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'static');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'partials');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'layouts');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'pages');
    this.mockConsole.expects('log').once().withExactArgs('%s was deleted', 'params.js');
    const mockWatcher = {
      on: function (event, cb) {}
    };
    sinon.stub(watchtree, 'watchTree').value(function (file, opts) {
      return { on: function (event, cb) {
        if (event === 'fileDeleted') {
          cb('somepath', 'somestats');
        }
      }};
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });
});

describe('ae86 - clean', function() {

  it('should delegate to wrench rmdirRecursive when removing the generated website', function (done) {
    sinon.stub(wrench, 'rmdirRecursive').value(function (dir, cb) {
      assert.equals(dir, 'out');
      cb();
    });
    const ae86 = new AE86();
    ae86.clean(function (err, result) {
      done();
    });
  });

  it('should use custom out dir when specified', function (done) {
    sinon.stub(wrench, 'rmdirRecursive').value(function (dir, cb) {
      assert.equals(dir, 'someoutdir');
      cb();
    });
    const ae86 = new AE86({ outDir: 'someoutdir' });
    ae86.clean(function (err, result) {
      done();
    });
  });
});
