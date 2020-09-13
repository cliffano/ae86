import AE86 from '../lib/ae86.js';
import bag from 'bagofcli';
import cli from '../lib/cli.js';
import referee from '@sinonjs/referee';
import sinon from 'sinon';
const assert = referee.assert;

describe('cli - exec', function() {

  it('should contain commands with actions', function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.init.action);
      assert.defined(actions.commands.gen.action);
      assert.defined(actions.commands.watch.action);
      assert.defined(actions.commands.drift.action);
      assert.defined(actions.commands.clean.action);
      done();
    };
    sinon.mock({});
    sinon.stub(bag, 'command', mockCommand);
    cli.exec();
  });
});

describe('cli - init', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should contain init command and delegate to ae86 init when exec is called', function (done) {
    this.mockConsole.expects('log').withExactArgs('Creating example AE86 project');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.init.action();
    });
    sinon.stub(AE86.prototype, 'init', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - gen', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should contain gen command and delegate to ae86 generate when exec is called', function (done) {
    this.mockConsole.expects('log').withExactArgs('Generating website');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.gen.action();
    });
    sinon.stub(AE86.prototype, 'generate', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - watch', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should contain watch command and delegate to ae86 watch when exec is called', function (done) {
    this.mockConsole.expects('log').withExactArgs('Watching for changes and automatically regenerating website');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.watch.action();
    });
    sinon.stub(AE86.prototype, 'watch', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - drift', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should contain drift command and delegate to ae86 watch when exec is called', function (done) {
    this.mockConsole.expects('log').withExactArgs('Watching for changes and automatically regenerating website');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.watch.action();
    });
    sinon.stub(AE86.prototype, 'watch', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});

describe('cli - clean', function() {

  beforeEach(function () {
    this.mockConsole = sinon.mock(console);
  });

  afterEach(function () {
    this.mockConsole.verify();
    this.mockConsole.restore();
  });

  it('should contain clean command and delegate to ae86 clean when exec is called', function (done) {
    this.mockConsole.expects('log').withExactArgs('Removing website');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.clean.action();
    });
    sinon.stub(AE86.prototype, 'clean', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });

  it('should use output directory arg when provided', function (done) {
    this.mockConsole.expects('log').withExactArgs('Removing website');
    sinon.stub(bag, 'command', function (base, actions) {
      actions.commands.clean.action({ outDir: 'someoutdir' });
    });
    sinon.stub(AE86.prototype, 'clean', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  });
});
