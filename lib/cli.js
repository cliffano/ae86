"use strict";
import ae86 from './ae86.js';
import bag from 'bagofcli';
import p from 'path';

const DIRNAME = p.dirname(import.meta.url).replace('file://', '');

function _init() {
  bag.logStepHeading('Creating example AE86 project');
  new ae86().init(bag.exit);
}

function _gen(args) {
  args = args || {};
  bag.logStepHeading('Generating website');
  new ae86({ outDir: args.outDir }).generate(bag.exit);
}

function _watch(args) {
  args = args || {};
  bag.logStepHeading('Watching for changes and automatically regenerating website');
  new ae86({ outDir: args.outDir }).watch(bag.exit);
}

function _clean(args) {
  args = args || {};
  bag.logStepHeading('Removing website');
  new ae86({ outDir: args.outDir }).clean(bag.exit);
}

/**
 * Execute AE86 CLI.
 */
function exec() {

  const actions = {
    commands: {
      init: { action: _init },
      gen: { action: _gen },
      watch: { action: _watch },
      drift: { action: _watch },
      clean: { action: _clean }
    }
  };

  bag.command(DIRNAME, actions);
}

const exports = {
  exec: exec
};

export {
  exports as default
};