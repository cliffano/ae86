var _ = require('underscore'),
  ae86 = require('./ae86'),
  bag = require('bagofholding');

/**
 * cli#exec
 * 
 * Execute AE86 using template files in the current directory.
 **/
function exec() {

  function _init() {
    new ae86().init(bag.cli.exit);
  }

  function _generate() {
    new ae86().generate(bag.cli.exit);
  }

  function _watch() {
    new ae86().watch(bag.cli.exit);
  }

  function _clean() {
    new ae86().clean(bag.cli.exit);
  }

  var commands = {
    init: {
      desc: 'Create example AE86 project files',
      action: _init
    },
    gen: {
      desc: 'Generate website',
      action: _generate
    },
    watch: {
      desc: 'Watch for changes and automatically regenerate website',
      action: _watch
    },
    clean: {
      desc: 'Remove website',
      action: _clean
    }
  };

  bag.cli.parse(commands, __dirname);
}

exports.exec = exec;