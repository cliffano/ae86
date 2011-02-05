var fs = require('fs'),
    jazz = require('jazz');
    
var Engine = function (options) {
    this.options = options;
};
Engine.prototype.prepareFile = function (options, file) {
    var data = fs.readFileSync(file, options.encoding);
    return jazz.compile(data);
};
Engine.prototype.merge = function (layout, page, cb) {
    var that = this;
    page.eval({}, function (data) {
        layout.eval({ page: data }, cb);
    });
};

exports.Engine = Engine;