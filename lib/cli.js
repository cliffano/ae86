var AE86 = require('./ae86').AE86,
  ae86 = new AE86(),
  fs = require('fs'),
  nomnom = require('nomnom'),
  p = require('path');

function exec() {

  var scriptOpts = {
    version: {
      string: '-v',
      flag: true,
      help: 'AE86 version number',
      callback: function () {
        return JSON.parse(fs.readFileSync(p.join(__dirname, '../package.json'))).version;
      }
    }
  };

  nomnom.scriptName('ae86').opts(scriptOpts);
  nomnom.command('init').callback(function (args) {
    ae86.init();
  });
  nomnom.command('gen').callback(function (args) {
    var prms = require(p.join(process.cwd(), 'params'));
    ae86.gen(prms.params);
  });
  nomnom.parseArgs();
}

exports.exec = exec;