"use strict";
/* eslint no-unused-vars: 0 */
import AE86 from '../lib/ae86.js';
import bag from 'bagofcli';
import Engine from '../lib/engine.js';
import cpr from 'cpr';
import fs from 'fs';
import p from 'path';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
import watch from '@cnakazawa/watch';
import wrench from 'wrench';
const assert = referee.assert;

const DIRNAME = p.dirname(import.meta.url).replace('file://', '');

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
    this.mockCpr = sinon.mock(cpr);
    this.mockFs = sinon.mock(fs);
    this.clock = sinon.useFakeTimers(new Date(2000, 9, 10).getTime());
    this.ae86 = new AE86({ params: { foo: 'bar' }});
  });

  afterEach(function () {
    this.mockCpr.verify();
    this.mockCpr.restore();
    this.mockFs.verify();
    this.mockFs.restore();
    this.clock.restore();
  });

  it('should copy static files and process pages', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(DIRNAME, '/fixtures'); });
    this.mockFs.expects('existsSync').once().withArgs(p.join(DIRNAME, '/fixtures', '/params.js')).returns(true);
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

  it('should handle invalid params file', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(DIRNAME, '/fixtures-error'); });
    this.mockCpr.expects('cpr').once().withArgs('static', 'out').callsArgWith(2);
    const compileStub = sinon.stub(Engine.prototype, 'compile').value(function (dir, cb) {
      assert.isTrue(['partials', 'layouts', 'pages'].indexOf(dir) !== -1);
      cb();
    });
    this.ae86.generate(function (err, result) {
      compileStub.restore();
      done();
    });
  });

  it('should handle inexisting params file', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(DIRNAME, '/fixtures'); });
    this.mockFs.expects('existsSync').once().withArgs(p.join(DIRNAME, '/fixtures', '/params.js')).returns(false);
    this.mockCpr.expects('cpr').once().withArgs('static', 'out').callsArgWith(2);
    const compileStub = sinon.stub(Engine.prototype, 'compile').value(function (dir, cb) {
      assert.isTrue(['partials', 'layouts', 'pages'].indexOf(dir) !== -1);
      cb();
    });
    const mergeStub = sinon.stub(Engine.prototype, 'merge').value(function (dir, templates, params, cb) {
      assert.equals(dir, 'out');
      assert.equals(params, {});
      cb();
    });
    this.ae86.generate(function (err, result) {
      compileStub.restore();
      mergeStub.restore();
      done();
    });
  });

  it('should pass error when an error occurs while preparing static files', function (done) {
    sinon.stub(process, 'cwd').value(function () { return p.join(DIRNAME, '/fixtures'); });
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
    this.mockBag = sinon.mock(bag);
    sinon.stub(process, 'cwd').value(function () { return '/somepath'; });
    this.ae86 = new AE86();
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should ignore swap files and set sample rate on project directories and files', function (done) {
    let watchCounter = 0;
    sinon.stub(watch, 'watchTree').value(function (file, cb) {
      assert.isTrue(['static', 'partials', 'layouts', 'pages', 'params.js'].indexOf(file) !== -1);
      watchCounter += 1;
      if (watchCounter === 5) {
        done();
      }
    });
    this.ae86.watch();
  });

  it('should log message when watching for file changes', function () {
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('Watching for file changes at %s...', 'static');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('Watching for file changes at %s...', 'partials');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('Watching for file changes at %s...', 'layouts');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('Watching for file changes at %s...', 'pages');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('Watching for file changes at %s...', 'params.js');
    sinon.stub(watch, 'watchTree').value(function (file, cb) {
      cb(Object.create(null), null, null);
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });

  it('should log message and set listener when a file is created', function () {
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was created', 'static');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was created', 'partials');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was created', 'layouts');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was created', 'pages');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was created', 'params.js');
    sinon.stub(watch, 'watchTree').value(function (file, cb) {
      cb('somef', {}, null);
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });

  it('should log message and set listener when a file is modified', function () {
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was modified', 'static');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was modified', 'partials');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was modified', 'layouts');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was modified', 'pages');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was modified', 'params.js');
    sinon.stub(watch, 'watchTree').value(function (file, cb) {
      cb('somef', {}, {});
    });
    this.ae86.generate = sinon.spy();
    this.ae86.clean = sinon.spy();
    this.ae86.watch();
  });

  it('should log message and set listener when a file is deleted', function () {
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was deleted', 'static');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was deleted', 'partials');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was deleted', 'layouts');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was deleted', 'pages');
    this.mockBag.expects('logStepItemSuccess').once().withExactArgs('%s was deleted', 'params.js');
    sinon.stub(watch, 'watchTree').value(function (file, cb) {
      cb('somef', {nlink: 0}, {});
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
