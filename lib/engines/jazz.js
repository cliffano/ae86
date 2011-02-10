var fs = require('fs'),
    jazz = require('jazz'),
    path = require('path');
    
var Engine = function (options) {
    this.options = options;
};
Engine.prototype.prepareFile = function (options, file) {
    var data = fs.readFileSync(file, options.encoding);
    return jazz.compile(data);
};
Engine.prototype._predefined = function (params) {
    var that = this;
    return {
        'include': function (file, cb) {
            var data = fs.readFileSync(path.join(that.options.partials, file), that.options.encoding);
            jazz.compile(data).eval(params, cb);
        }
    };
};
Engine.prototype.merge = function (layout, page, cb) {
    var that = this;
    page.eval({}, function (data) {
        var layoutParams = { fn: that._predefined(layoutParams), body: data, params: that.options.params };
        layout.eval(layoutParams, cb);
    });
};

exports.Engine = Engine;