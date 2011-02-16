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
Engine.prototype._predefined = function (filePath, partials, params) {
    var that = this;
    return {
        'include': function (file, cb) {
            partials[file].process(that._combine([params, that._predefined(filePath, partials, params)]), cb);
        },
        'relative': function (_path, cb) {
            var base = '', i;
            for (i = 0; i < filePath.split('/').length - 1; i += 1) {
                base += '../';
            }
            cb(path.join(base, _path).replace(/^\//, '')); 
        }
    };
};
Engine.prototype.merge = function (filePath, page, layout, partials, params, cb) {
    var that = this,
        pageParams = this._combine([params, this._predefined(filePath, partials, params)]);
    page.process(pageParams, function (data) {
        layout.process(that._combine([pageParams, { body: data }]), cb);
    });
};

exports.Engine = Engine;