var fs = require('fs'),
    path = require('path');

var AE86 = function (options) {
    console.log('Revving up AE86\'s ' + options.engine + ' engine...');
    this.options = options;
    var Engine = require('./engines/' + options.engine).Engine;
    this.engine = new Engine(options);
};
AE86.prototype._prepare = function (dir, fn) {
    var props = {};
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var stat = fs.statSync(path.join(dir, files[i]));
        if (stat.isDirectory()) {
            var dirProps = this._prepare(path.join(dir, files[i]), fn);
            for (var j in dirProps) {
                props[j] = dirProps[j];
            }
        } else {
            (fn(props, path.join(dir, files[i])));
        }
    }
    return props;
};
AE86.prototype._generate = function (dir, fn) {
    var files = fs.readdirSync(dir);
    for (var i in files) {
        var stat = fs.statSync(path.join(dir, files[i]));
        if (stat.isDirectory()) {
            this._generate(path.join(dir, files[i]), fn);
        } else {
            fn(path.join(dir, files[i]));
        }
    }
};
AE86.prototype._mkdir = function (subDirs, dir, cb) {
    var that = this;
    path.exists(dir, function (exists) {
        if (exists) {
            cb();
        } else {
            try {
                fs.mkdirSync(dir, 0755);
                for (var i in subDirs) {
                    fs.mkdirSync(subDirs[i], 0755);
                }
                cb();
            } catch (err) {
                subDirs.unshift(dir);
                that._mkdir(subDirs, path.dirname(dir), cb);
            }
        }
    });
};
AE86.prototype.drift = function () {
    var getShortName = function (base, file) {
        return file.replace(base, '').replace(/^\//, '');
    };
    
    console.log('Preparing layouts...');
    var that = this;
    var layouts = this._prepare(this.options.layouts, function (props, file) {
        props[getShortName(that.options.layouts, file)] = that.engine.prepareFile(that.options, file);
    });
    
    console.log('Preparing partials...');
    var partials = this._prepare(this.options.partials, function (props, file) {
        props[getShortName(that.options.partials, file)] = that.engine.prepareFile(that.options, file);
    });
    
    console.log('Generating pages...');
    this._generate(this.options.pages, function (file) {
        var shortName = getShortName(that.options.pages, file);
        var cb = function (data) {
            var file = path.join(that.options.out, shortName);
            that._mkdir([], path.dirname(file), function () {
                fs.writeFile(file, data, function (err) {
                    if (err) {
                        throw err;
                    } else {
                        console.log('\t- ' + shortName);
                    }
                });
            });
        };
        that.engine.merge(
            layouts['default'],
            that.engine.prepareFile(that.options, file),
            cb);
    });
};

exports.AE86 = AE86;