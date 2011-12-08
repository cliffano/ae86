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
    console.log('Initialising AE86 project');
    ae86.init(p.join(__dirname, '../examples'), function (err) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      }
      process.exit((err) ? 1 : 0);
    });
  });

  nomnom.command('gen').callback(function (args) {
    var prms = require(p.join(process.cwd(), 'params'));
    console.log('Generating website');
    ae86.gen(prms.params, function (err, results) {
      if (err) {
        console.error('An error has occured. ' + err.message);
      } else {
        console.log('Total of ' + results.length + ' page' +
          ((results.length > 1) ? 's' : ''));
      }
      process.exit((err) ? 1 : 0);
    });
  });

  nomnom.parseArgs();
}

exports.exec = exec;