var f = require('file'),
    fs = require('fs'),
    path = require('path'),
    wrench = require('wrench');

var AE86 = function (options) {
    console.log('Revving up AE86\'s ' + options.engine + ' engine...');
    this.options = options;
    var Engine = require('./engines/' + options.engine).Engine;
    this.engine = new Engine();
};
// sync create static, layouts, partials, and pages dirs
AE86.prototype.init = function () {
    console.log('Creating static, layouts, partials, pages directories, and params.js file...');
    f.mkdirsSync(this.options.static, this.options.mode);
    f.mkdirsSync(this.options.layouts, this.options.mode);
    f.mkdirsSync(this.options.partials, this.options.mode);
    f.mkdirsSync(this.options.pages, this.options.mode);
    fs.writeFileSync('params.js', 'exports.params = {\n};', this.options.encoding);
};
// sync delete generated pages
AE86.prototype.clean = function () {
    console.log('Deleting generated pages...');
    try {
        if (fs.statSync(this.options.out).isDirectory()) {
            wrench.rmdirSyncRecursive(this.options.out);
        } else {
            fs.unlinkSync(this.options.out);
        }
    } catch (e) {
    }
};
// check if file is to be ignored
AE86.prototype._isIgnored = function (file) {
    var isIgnored = false, item;
    for (item in this.options.ignore) {
        if (file.match(new RegExp('^' + this.options.ignore[item] + '/')) ||
                file.match(new RegExp('/' + this.options.ignore[item] + '/')) ||
                file.match(new RegExp('/' + this.options.ignore[item] + '$'))) {
            isIgnored = true;
            break;
        }
    }
    return isIgnored;
};
// async copy files in static dir to out dir
AE86.prototype._copyStatic = function () {
    var staticDir = this.options.static, outDir = this.options.out, mode = this.options.mode, that = this;
    f.mkdirs(outDir, mode, function () {
        f.walk(staticDir, function (err, orig, dirs, files) {
            if (err) {
                throw err;
            }
            files.forEach(function (file) {
                if (!that._isIgnored(file)) {
                    f.mkdirs(path.dirname(file).replace(staticDir, outDir), mode, function (err) {
                        fs.link(file, file.replace(staticDir, outDir), function (err) {
                            if (err) {
                                throw err;
                            }
                            console.log('\t- ' + file.replace(staticDir, '').replace(/^\//, ''));
                        });    
                    });
                }
            });
        });
    });
};
// sync load of files in template dir
AE86.prototype._loadTemplates = function (templateDir) {
    var templates = {}, encoding = this.options.encoding, engine = this.engine, that = this;
    f.walkSync(templateDir, function (origDir, dirs, files) {
        files.forEach(function (file) {
            if (!that._isIgnored(file)) {
                templates[path.join(origDir.replace(templateDir, ''), file).replace(/^\//, '')] =
                    engine.prepare(path.join(origDir, file), encoding);
            }
        });
    });
    return templates;
};
// async write pages merged with layouts, partials, and params
AE86.prototype._writePages = function (layouts, partials, params) {
    var pagesDir = this.options.pages, outDir = this.options.out, mode = this.options.mode,
        encoding = this.options.encoding, engine = this.engine, that = this;
    f.walk(pagesDir, function (err, orig, dirs, files) {
        if (err) {
            throw err;
        }
        files.forEach(function (file) {
            if (!that._isIgnored(file)) {
                f.mkdirs(path.dirname(file).replace(pagesDir, outDir), mode, function (err) {
                    var filePath = file.replace(pagesDir, '').replace(/^\//, '');
                    engine.merge(
                        filePath,
                        engine.prepare(file, encoding),
                        layouts['default'],
                        partials,
                        params,
                        function (data) {
                            fs.writeFile(file.replace(pagesDir, outDir), data, function (err) {
                                if (err) {
                                    throw err;
                                }
                                console.log('\t- ' + filePath);
                            });
                        });   
                });
            }
        });
    });
};
AE86.prototype.generate = function () {
    var layouts, partials;

    console.log('Copying static...');
    this._copyStatic();

    console.log('Loading layouts...');
    layouts = this._loadTemplates(this.options.layouts);
    
    console.log('Loading partials...');
    partials = this._loadTemplates(this.options.partials);
    
    console.log('Writing pages...');
    this._writePages(layouts, partials, this.options.params);
};

exports.AE86 = AE86;