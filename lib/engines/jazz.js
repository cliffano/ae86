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
Engine.prototype._combine = function (objects) {
    var combined = {}, i, j;
    for (i in objects) {
        for (j in objects[i]) {
            combined[j] = objects[i][j];
        }
    }
    return combined;
};
Engine.prototype._predefined = function () {
    var that = this;
    return {
        'include': function (file, cb) {
            var data = fs.readFileSync(path.join(that.options.partials, file), that.options.encoding);
            jazz.compile(data).eval(that._combine([that.options.params, that._predefined()]), cb);
        }
    };
};
Engine.prototype.merge = function (layout, page, cb) {
    var that = this;
    page.eval({}, function (data) {
        layout.eval(that._combine([that.options.params, that._predefined(), { body: data }]), cb);
    });
};

exports.Engine = Engine;