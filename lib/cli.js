var ae86 = require('./ae86'),
  bag = require('bagofcli');

function _init() {
  console.log('Creating example AE86 project');
  new ae86().init(bag.exit);
}

function _gen(args) {
  args = args || {};
  console.log('Generating website');
  new ae86({ outDir: args.outDir }).generate(bag.exit);
}

function _watch(args) {
  args = args || {};
  console.log('Watching for changes and automatically regenerating website');
  new ae86({ outDir: args.outDir }).watch(bag.exit);
}

function _clean(args) {
  args = args || {};
  console.log('Removing website');
  new ae86({ outDir: args.outDir }).clean(bag.exit);
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

  bag.command(__dirname, actions);
}

exports.exec = exec;