var ae86 = require('./ae86'),
  bag = require('bagofholding');

function _init() {
  new ae86().init(bag.cli.exit);
}

function _gen() {
  new ae86().generate(bag.cli.exit);
}

function _watch() {
  new ae86().watch(bag.cli.exit);
}

function _clean() {
  new ae86().clean(bag.cli.exit);
}

/**
 * Execute AE86 CLI.
 */
function exec() {

  var actions = {
    commands: {
      init: { action: _init },
      gen: { action: _gen },
      watch: { action: _watch },
      drift: { action: _watch },
      clean: { action: _clean }
    }
  };

  bag.cli.command(__dirname, actions);
}

exports.exec = exec;