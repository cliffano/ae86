var AE86 = require('./ae86').AE86;

function exec() {
  var ae86 = new AE86(process.cwd());
  ae86.gen();
}

exports.exec = exec;