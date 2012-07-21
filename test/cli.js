var bag = require('bagofholding'),
  sandbox = require('sandboxed-module'),
  should = require('should'),
  checks, mocks,
  cli;

describe('cli', function () {

  function create(checks, mocks) {
    return sandbox.require('../lib/cli', {
      requires: {
        bagofholding: {
          cli: {
            exit: bag.cli.exit,
            parse: function (commands, dir) {
              checks.bag_parse_commands = commands;
              checks.bag_parse_dir = dir;
            }
          }
        },
        './ae86': function () {
          return {
            init: function (exit) {
              checks.ae86_init_exit = exit;
            },
            generate: function (exit) {
              checks.ae86_gen_exit = exit;
            },
            watch: function (exit) {
              checks.ae86_watch_exit = exit;
            },
            clean: function (exit) {
              checks.ae86_clean_exit = exit;
            }
          };
        }
      },
      globals: {
        process: bag.mock.process(checks, mocks)
      }
    });
  }

  beforeEach(function () {
    checks = {};
    mocks = {};
    cli = create(checks, mocks);
    cli.exec();
  });

  describe('exec', function () {

    it('should contain init command and delegate to ae86 init when exec is called', function () {
      checks.bag_parse_commands.init.desc.should.equal('Create example AE86 project files');
      checks.bag_parse_commands.init.action();
      checks.ae86_init_exit.should.be.a('function');
    });

    it('should contain gen command and delegate to ae86 gen when exec is called', function () {
      checks.bag_parse_commands.gen.desc.should.equal('Generate website');
      checks.bag_parse_commands.gen.action();
      checks.ae86_gen_exit.should.be.a('function');
    });

    it('should contain watch command and delegate to ae86 watch when exec is called', function () {
      checks.bag_parse_commands.watch.desc.should.equal('Watch for changes and automatically regenerate website');
      checks.bag_parse_commands.watch.action();
      checks.ae86_watch_exit.should.be.a('function');
    });

    it('should contain drift command and delegate to ae86 watch when exec is called', function () {
      checks.bag_parse_commands.drift.desc.should.equal('Alias for watch');
      checks.bag_parse_commands.drift.action();
      checks.ae86_watch_exit.should.be.a('function');
    });

    it('should contain clean command and delegate to ae86 clean when exec is called', function () {
      checks.bag_parse_commands.clean.desc.should.equal('Remove website');
      checks.bag_parse_commands.clean.action();
      checks.ae86_clean_exit.should.be.a('function');
    });
  });
});