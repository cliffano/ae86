var ae86 = require('./ae86'),
  p = require('path'),
  prms = require(p.join(process.cwd(), 'params'));

function exec() {
  var x = new ae86.AE86();
  x.gen(prms.params);
}

exports.exec = exec;