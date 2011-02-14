var f = require('file'),
    fs = require('fs'),
    path = require('path');

var AE86 = function (options) {
    console.log('Revving up AE86\'s ' + options.engine + ' engine...');
    this.options = options;
    var Engine = require('./engines/' + options.engine).Engine;
    this.engine = new Engine();
};
// async copy files in static dir to out dir
AE86.prototype._copyStatic = function () {
    var staticDir = this.options.static, outDir = this.options.out, mode = this.options.mode;
    f.mkdirs(outDir, mode, function () {
        f.walk(staticDir, function (err, orig, dirs, files) {
            if (err) {
                throw err;
            }
            files.forEach(function (file) {
                f.mkdirs(path.dirname(file).replace(staticDir, outDir), mode, function (err) {
                    fs.link(file, file.replace(staticDir, outDir), function (err) {
                        if (err) {
                            throw err;
                        }
                        console.log('\t- ' + file.replace(staticDir, ''));
                    });    
                });
            });
        });
    });
};
// sync load of files in template dir
AE86.prototype._loadTemplates = function (templateDir) {
    var templates = {}, encoding = this.options.encoding, engine = this.engine;
    f.walkSync(templateDir, function (origDir, dirs, files) {
        files.forEach(function (file) {
            templates[path.join(origDir.replace(templateDir, ''), file).replace(/^\//, '')] =
                engine.prepare(path.join(origDir, file), encoding);
        });
    });
    return templates;
};
// async write pages merged with layouts, partials, and params
AE86.prototype._writePages = function (layouts, partials, params) {
    var pagesDir = this.options.pages, outDir = this.options.out, mode = this.options.mode,
        encoding = this.options.encoding, engine = this.engine;
    f.walk(pagesDir, function (err, orig, dirs, files) {
        if (err) {
            throw err;
        }
        files.forEach(function (file) {
            f.mkdirs(path.dirname(file).replace(pagesDir, outDir), mode, function (err) {
                engine.merge(
                    engine.prepare(file, encoding),
                    layouts['default'],
                    partials,
                    params,
                    function (data) {
                        fs.writeFile(file.replace(pagesDir, outDir), data, function (err) {
                            if (err) {
                                throw err;
                            }
                            console.log('\t- ' + file.replace(pagesDir, ''));
                        });
                    });   
            });
        });
    });
};
AE86.prototype.drift = function () {
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