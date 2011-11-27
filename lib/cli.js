var AE86 = require('./ae86').AE86;

function exec() {
  var ae86 = new AE86();
  ae86.drift();
}

exports.exec = exec;