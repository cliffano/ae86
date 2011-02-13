var fs = require('fs'),
    jazz = require('jazz'),
    path = require('path');
    
var Engine = function () {
};
Engine.prototype.prepare = function (file, encoding) {
    var data = fs.readFileSync(file, encoding);
    return jazz.compile(data);
};
Engine.prototype._combine = function (objects) {
    var combined = {}, i, j;
    for (i in objects) {
        if (objects.hasOwnProperty(i)) {
            for (j in objects[i]) {
                if (objects[i].hasOwnProperty(j)) {
                    combined[j] = objects[i][j];
                }
            }
        }
    }
    return combined;
};
Engine.prototype._predefined = function (partials, params) {
    var that = this;
    return {
        'include': function (file, cb) {
            partials[file].eval(that._combine([params, that._predefined(partials, params)]), cb);
        }
    };
};
Engine.prototype.merge = function (page, layout, partials, params, cb) {
    var that = this;
    page.eval({}, function (data) {
        layout.eval(that._combine([params, that._predefined(partials, params), { body: data }]), cb);
    });
};

exports.Engine = Engine;