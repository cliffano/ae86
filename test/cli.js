var bag = require('bagofholding'),
  buster = require('buster'),
  cli = require('../lib/cli'),
  AE86 = new require('../lib/ae86');

buster.testCase('cli - exec', {
  'should contain commands with actions': function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.init.action);
      assert.defined(actions.commands.gen.action);
      assert.defined(actions.commands.watch.action);
      assert.defined(actions.commands.drift.action);
      assert.defined(actions.commands.clean.action);
      done();
    };
    this.stub(bag, 'cli', { command: mockCommand });
    cli.exec();
  }
});

buster.testCase('cli - init', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain init command and delegate to ae86 init when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Creating example AE86 project');
    this.stub(bag, 'cli', {
      command: function (base, actions) {
        actions.commands.init.action();
      },
      exit: bag.cli.exit
    });
    this.stub(AE86.prototype, 'init', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - gen', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain gen command and delegate to ae86 generate when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Generating website');
    this.stub(bag, 'cli', {
      command: function (base, actions) {
        actions.commands.gen.action();
      },
      exit: bag.cli.exit
    });
    this.stub(AE86.prototype, 'generate', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - watch', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain watch command and delegate to ae86 watch when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Watching for changes and automatically regenerating website');
    this.stub(bag, 'cli', {
      command: function (base, actions) {
        actions.commands.watch.action();
      },
      exit: bag.cli.exit
    });
    this.stub(AE86.prototype, 'watch', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - drift', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain drift command and delegate to ae86 watch when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Watching for changes and automatically regenerating website');
    this.stub(bag, 'cli', {
      command: function (base, actions) {
        actions.commands.watch.action();
      },
      exit: bag.cli.exit
    });
    this.stub(AE86.prototype, 'watch', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - clean', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain clean command and delegate to ae86 clean when exec is called': function (done) {
    this.mockConsole.expects('log').withExactArgs('Removing website');
    this.stub(bag, 'cli', {
      command: function (base, actions) {
        actions.commands.clean.action();
      },
      exit: bag.cli.exit
    });
    this.stub(AE86.prototype, 'clean', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});
