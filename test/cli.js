"use strict"
/* eslint no-unused-vars: 0 */
import AE86 from '../lib/ae86.js';
import bag from 'bagofcli';
import cli from '../lib/cli.js';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
const assert = referee.assert;

describe('cli - exec', function() {

  it('should contain commands with actions', function (done) {
    const mockCommand = function (base, actions) {
      assert.isString(base);
      assert.isFunction(actions.commands.init.action);
      assert.isFunction(actions.commands.gen.action);
      assert.isFunction(actions.commands.watch.action);
      assert.isFunction(actions.commands.drift.action);
      assert.isFunction(actions.commands.clean.action);
      done();
    };
    sinon.mock({});
    sinon.stub(bag, 'command').value(mockCommand);
    cli.exec();
  });
});

describe('cli - init', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain init command and delegate to ae86 init when exec is called', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Creating example AE86 project');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.init.action();
    });
    sinon.stub(AE86.prototype, 'init').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - gen', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain gen command and delegate to ae86 generate when exec is called', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Generating website');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.gen.action();
    });
    sinon.stub(AE86.prototype, 'generate').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - watch', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain watch command and delegate to ae86 watch when exec is called', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Watching for changes and automatically regenerating website');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.watch.action();
    });
    sinon.stub(AE86.prototype, 'watch').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - drift', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain drift command and delegate to ae86 watch when exec is called', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Watching for changes and automatically regenerating website');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.watch.action();
    });
    sinon.stub(AE86.prototype, 'watch').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - clean', function() {

  beforeEach(function () {
    this.mockBag = sinon.mock(bag);
  });

  afterEach(function () {
    this.mockBag.verify();
    this.mockBag.restore();
  });

  it('should contain clean command and delegate to ae86 clean when exec is called', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Removing website');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.clean.action();
    });
    sinon.stub(AE86.prototype, 'clean').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });

  it('should use output directory arg when provided', function (done) {
    this.mockBag.expects('logStepHeading').withExactArgs('Removing website');
    sinon.stub(bag, 'command').value(function (base, actions) {
      actions.commands.clean.action({ outDir: 'someoutdir' });
    });
    sinon.stub(AE86.prototype, 'clean').value(function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});
