var f = require('filex'),
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
    var static = this.options.static, out = this.options.out, mode = this.options.mode
    f.mkdirs(out, mode, function () {
        f.walk(static, function (err, orig, dirs, files) {
            if (err) throw err;
            files.forEach(function (file) {
                f.mkdirs(path.dirname(file).replace(static, out), mode, function (err) {
                    fs.link(file, file.replace(static, out), function (err) {
                        if (err) throw err;
                        console.log('\t- ' + file.replace(static, ''));
                    });    
                });
            });
        });
    });
};
// sync load of files in template dir
AE86.prototype._loadTemplates = function (template) {
    var templates = {}, encoding = this.options.encoding, engine = this.engine;
    f.walkSync(template, function (orig, dirs, files) {
        files.forEach(function (file) {
            templates[file] = engine.prepare(path.join(template, file), encoding)
        });
    });
    return templates;
};
// async write pages merged with layouts, partials, and params
AE86.prototype._writePages = function (layouts, partials, params) {
    var pages = this.options.pages, out = this.options.out, mode = this.options.mode,
        encoding = this.options.encoding, engine = this.engine;
    f.walk(pages, function (err, orig, dirs, files) {
        if (err) throw err;
        files.forEach(function (file) {
            f.mkdirs(path.dirname(file).replace(pages, out), mode, function (err) {
                engine.merge(
                    engine.prepare(file, encoding),
                    layouts['default'],
                    partials,
                    params,
                    function (data) {
                        fs.writeFile(file.replace(pages, out), data, function (err) {
                            if (err) throw err;
                            console.log('\t- ' + file.replace(pages, ''));
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