var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    shell = require('shelljs'),
    child_process = require('child_process'),
    jsdom = require('jsdom-nogyp').jsdom,
    Zip = require('adm-zip'),
    xfaceUtil = require('./util'),
    events = require('./events'),
    help = require('./help');

var TAG_A_EXPRESSION = '<a\\s+.*?href\\s*=\\s*"(.*?)".*?(/>|>.*?</a>)',
    CORDOVA_INCL_JS = "cordova-incl.js";
var AUTO_TEST_FRAMEWORK_FILES = [
    'jasmine.css',
    'jasmine.js',
    'test-runner.js',
    'html' /*folder*/
];

var BASE_TEST_FRAMEWORK_FILES = [
    'base.js',
    'main.js',
    'master.css',
    CORDOVA_INCL_JS
];

/**
 * 设置平台工程下的应用
 * @param {String} command 支持的命令:`add`
 * @param {Array} targets 如果值为`test`，则将已安装插件测试页面合并，然后将合并后页面安装到平台工程下，
 *      如果为路径，则安装该路径下对应的应用页面
 * @param {String} testTemplate 插件测试模板路径，该参数可选，如果未传该参数，则从网上下载
 */
module.exports = function(command, targets, testTemplate) {
    if (arguments.length === 0) {
        return Q(help());
    }
    return Q.try(function() {
        var xfaceProj = xfaceUtil.isxFace(process.cwd());
        if (!xfaceProj) {
            return Q.reject(new Error('Current working directory is not a xFace-based project.'));
        }
        var target = (targets.length == 0 ? undefined : targets[0]);
        if (command !== 'add') {
            var desc = target ? ' ' + target : '';
            return Q.reject(new Error('Do not support command `xface app ' + command + desc + '`! \nPlease try command `xface app add' + desc + '`! '));
        }
        if (target == 'test' || path.basename(target) == target) {
            return installPluginTest(xfaceProj, target, testTemplate);
        } else if (fs.existsSync(target)) {
            return installApp(xfaceProj, target);
        } else {
            return Q.reject(new Error('App path `' + target + '` not found! '));
        }
    });
};

function fetchTestTemplate() {
    var templateCachePath = path.join(xfaceUtil.globalConfig, 'xface-test-template');
    if(fs.existsSync(templateCachePath)) {
        events.emit('verbose', 'Plugin test template existed, no need to clone it.');
        return Q(templateCachePath);
    }
    var d = Q.defer(),
        cmd = 'git clone https://github.com/polyvi/xface-test-template.git ' + templateCachePath;
    child_process.exec(cmd, function(err, stdout, stderr) {
        if(err) {
            d.reject(err);
        } else {
            d.resolve();
        }
    });
    return d.promise.then(function() {
        return Q(templateCachePath);
    });
}

function matchPart(plugins, part) {
    var index = plugins.indexOf(part);
    if (-1 !== index) {
        return plugins[index];
    } else {
        var plugin = null;
        plugins.every(function (p) {
            if(p.indexOf(part) !== -1) {
                plugin = p;
                return false;
            } else return true;
        });
        return plugin;
    }
}

function installPluginTest(xfaceProj, target, testTemplate) {
    var plugins = xfaceUtil.findPlugins(path.join(xfaceProj, 'plugins'));
    if(target == 'test') {
        if (plugins.length === 0) {
            events.emit('warn', 'You need install one plugin at least! ');
            return Q();
        }
    } else {
        var plugin = matchPart(plugins, target);
        if(!plugin) Q.reject(new Error('Can not find plugin id that matches `' + target + '`, try command `xface plugin ls` to show installed plugins! '));
        plugins = [plugin];
    }
    var q = testTemplate ? Q(testTemplate) : fetchTestTemplate();
    return q.then(function(template) {
        return mergePluginTests(xfaceProj, plugins, template);
    })
    .then(function(testPath) {
        return installApp(xfaceProj, testPath);
    });
}

/**
 * 检测插件测试格式是否正确
 */
function checkAndSplitPlugins(xfaceProj, plugins) {
    var result = {
        'valid' : [],
        'invalid' : []
    };
    plugins.forEach(function(p) {
        var testPath = path.join(xfaceProj, 'plugins', p, 'test');
        if(!fs.existsSync(path.join(testPath, 'index.html')) && !fs.existsSync(path.join(testPath, 'spec.html'))) result.invalid.push(p);
        else result.valid.push(p);
    });
    return result;
}

function mergePluginTests(xfaceProj, plugins, testTemplate) {
    events.emit('verbose', 'Begin to merge test cases of installed plugins ...');
    var tmpTests = path.join(xfaceUtil.globalConfig, 'merge_tests');
    if(!fs.existsSync(tmpTests)) shell.mkdir('-p', tmpTests);
    shell.rm('-rf', path.join(tmpTests, '*'));
    shell.cp('-rf', path.join(testTemplate, 'template', '*'), tmpTests);

    var splittedPlugins = checkAndSplitPlugins(xfaceProj, plugins);
    if(splittedPlugins.invalid.length > 0) {
        events.emit('warn', 'Test cases of plugins ' + JSON.stringify(splittedPlugins.invalid) + ' are invalid, will not be added. Continue... ');
    }
    handlePluginTests(xfaceProj, splittedPlugins.valid, tmpTests);

    // 去掉html文件中多余a标签
    var linkHtmls = ['index.html', 'spec.html', path.join('autotest', 'index.html'), path.join('autotest', 'pages', 'all.html')];
    linkHtmls.forEach(function(f) {
        var html = path.join(tmpTests, f);
        if(!fs.existsSync(html)) return;
        pruneInvalidAnchors(html);
    });

    // 去掉autotest/pages/all.html中不需要的js初始化代码
    events.emit('verbose', 'Process auto test html file "all.html". ');
    var allDotHtmlPath = path.join(tmpTests, 'autotest', 'pages', 'all.html'),
        content = fs.readFileSync(allDotHtmlPath, 'utf-8'),
        regexp = /\/\/[*]+InitForExtension\[(.+)\][*]+\/\/[\s\S]+?\/\/[*]+EndInit[*]+\/\//m,
        matchData = content.match(regexp);
    if(matchData && splittedPlugins.valid.indexOf(matchData[1]) == -1) {
        content = content.replace(regexp, '');
        fs.writeFileSync(allDotHtmlPath, content, 'utf-8');
    }

    return Q(tmpTests);
}

function handlePluginTests(xfaceProj, plugins, dest) {
    var hasCordovaInclJs = false; // any plugin use cordova-incl.js?
    plugins.forEach(function(p) {
        events.emit('verbose', 'Process test case of plugin "' + p + '"');
        var srcTestPath = path.join(xfaceProj, 'plugins', p, 'test');

        var children = fs.readdirSync(srcTestPath);
        children.forEach(function(child) {
            var destTopChildPath = path.join(dest, child),
                srcTopChildPath = path.join(srcTestPath, child);
            if(child == 'autotest') {
                mergeAutoTestDir(srcTopChildPath, destTopChildPath);
            } else if(child == 'spec.html') {
                mergeLink(srcTopChildPath, destTopChildPath);
            } else if(child == 'index.html') {
                if(!fs.existsSync(path.join(srcTestPath, 'spec.html'))) {
                    mergeLink(srcTopChildPath, path.join(dest, 'spec.html'));
                }
            } else if(BASE_TEST_FRAMEWORK_FILES.indexOf(child) !== -1) {
                if(child == CORDOVA_INCL_JS) {
                    hasCordovaInclJs = true;
                }
                // no need to copy or merge
            } else {
                shell.cp('-rf', srcTopChildPath, dest);
            }
        });
    });

    if(hasCordovaInclJs) replaceCordovaInclReference(dest);
}

function replaceCordovaInclReference(dir) {
    fs.readdirSync(dir).forEach(function(child) {
        var childPath = path.join(dir, child);
        if(fs.statSync(childPath).isDirectory()) replaceCordovaInclReference(childPath);
        else if(path.extname(child).toLowerCase() == '.html') {
            var content = fs.readFileSync(childPath, 'utf-8');
            if(content.indexOf(CORDOVA_INCL_JS) > -1) {
                content = content.replace(/cordova-incl\.js/mg, 'base.js');
                fs.writeFileSync(childPath, content, 'utf-8');
            }
        }
    });
}

function mergeAutoTestDir(srcDir, destDir) {
    var children = fs.readdirSync(srcDir);
    children.forEach(function(child) {
        // framework files are not be processed
        if(AUTO_TEST_FRAMEWORK_FILES.indexOf(child) != -1) return;
        var srcFilePath = path.join(srcDir, child);
        if('index.html' == child) mergeLink(srcFilePath, path.join(destDir, 'index.html'));
        else if('pages' == child && fs.existsSync(srcDir, 'pages', 'all.html')) {
            fs.readdirSync(path.join(srcDir, 'pages')).forEach(function(c) {
                if(c != 'all.html') shell.cp('-rf', path.join(srcDir, 'pages', c), path.join(destDir, 'pages'));
            });
        }
        else {
            shell.cp('-rf', srcFilePath, destDir);
            if('tests' == child) {
                var html = path.join(destDir, 'pages', 'all.html');
                fs.readdirSync(srcFilePath).forEach(function(js) {
                });
                appendScriptTag(html, fs.readdirSync(srcFilePath).map(function(js) {
                    return '../tests/' + js;
                }));
            }
        }
    });
}

/**
 * 将自动测试对应的js文件链接添加到all.html中
 */
function appendScriptTag(html, jsFiles) {
    events.emit('verbose', 'Insert script tag into all.html for auto test js "' + JSON.stringify(jsFiles) + '".');
    var doc = jsdom(fs.readFileSync(html, 'utf-8')),
        scriptTags = doc.getElementsByTagName('script'),
        links = [],
        lastScriptTag = scriptTags[scriptTags.length - 1];
    for(var i = 0; i < scriptTags.length; i++) {
        links.push(scriptTags[i].getAttribute('src'));
    }

    jsFiles.forEach(function(file) {
        if(links.indexOf(file) > -1 || path.extname(file).toLowerCase() != '.js') return; // 重复链接或者非js文件，不予添加
        var newScriptTag = jsdom('<script type="text/javascript" src="' + file + '"></script>').children[0];
        newScriptTag = doc.importNode(newScriptTag, true);
        doc.head.insertBefore(newScriptTag, lastScriptTag)
    });
    // Because wp8 need 'DOCTYPE', just add it
    fs.writeFileSync(html, '<!DOCTYPE html>\n' + doc.innerHTML, 'utf-8');
}

/**
 * 去掉html文件中链接不存在的a标签
 */
function pruneInvalidAnchors(file) {
    var content = fs.readFileSync(file, 'utf-8'),
        dir = path.dirname(file),
        result,
        changed = false,
        anchors = [],
        regexp = new RegExp(TAG_A_EXPRESSION, 'igm');
    while((result = regexp.exec(content)) != null) {
        if(fs.existsSync(path.join(dir, result[1]))) continue;
        anchors.push(result[0]);
        changed = true;
    }
    if(changed) {
        anchors.forEach(function(a) {
            content = content.replace(RegExp(a), '');
        });
        content = content.replace(/^\s*$/gm, ''); // remove blank line
        fs.writeFileSync(file, content, 'utf-8');
    }
}

/**
 * 将源html中的a标签添加到目标html中
 */
function mergeLink(src, dest) {
    events.emit('verbose', 'Merge html file from source "' + src + '"...');
    var doc = jsdom(fs.readFileSync(dest, 'utf-8')),
        content = fs.readFileSync(src, 'utf-8'),
        regexp = new RegExp(TAG_A_EXPRESSION, 'igm'),
        anchors = doc.body.getElementsByTagName('a'),
        links = [],
        lastAnchor = anchors[anchors.length - 1],
        result;
    for(var i = 0; i < anchors.length; i++) {
        links.push(anchors[i].getAttribute('href'));
    }

    var bodyChildren = doc.body.children,
        insertPosTag = null, // 最后一个a标签后一个标签
        found = false;
    for(var i = 0; i < bodyChildren.length; i++) {
        if(found && bodyChildren[i].tagName) {
            insertPosTag = bodyChildren[i];
            break;
        } else if(bodyChildren[i] == lastAnchor) {
            found = true;
        }
    }

    while((result = regexp.exec(content)) != null) {
        if(links.indexOf(result[1]) > -1) continue; // 重复链接，不予添加
        var newAnchor = jsdom(result[0]).children[0];
        newAnchor = doc.importNode(newAnchor, true);
        if(insertPosTag === null) doc.body.appendChild(newAnchor);
        else doc.body.insertBefore(newAnchor, insertPosTag)
    }
    // Because wp8 need 'DOCTYPE', just add it
    fs.writeFileSync(dest, '<!DOCTYPE html>\n' + doc.innerHTML, 'utf-8');
}

/**
 * 将应用拷贝到平台工程及www/helloxface下面
 * @param {Object} projRoot
 * @param {Object} appPath
 */
function installApp(projRoot, appPath) {
    if (!fs.existsSync(path.join(appPath, 'index.html')) && !fs.existsSync(path.join(appPath, 'app.xml'))) {
        return Q.reject(new Error('App at path `' + appPath + '` not valid, file `index.html` or `app.xml` not existed! '));
    }

    // 如果源应用中没有app.xml，使用老的app.xml，否则覆盖
    var srcPath = path.join(appPath, '*'),
        wwwAppPath = path.join(projRoot, 'www', 'helloxface'),
        appXml = path.join(wwwAppPath, 'app.xml'),
        content = null;
    if(fs.existsSync(appXml)) content = fs.readFileSync(appXml);
    shell.rm('-rf', path.join(wwwAppPath, '*'));
    if(content) fs.writeFileSync(appXml, content);
    shell.cp('-Rf', srcPath, wwwAppPath);

    var workspaceDir = path.join(wwwAppPath, 'workspace');
    if(fs.existsSync(workspaceDir) && fs.readdirSync(workspaceDir).length > 0) {
        events.emit('verbose', 'Begin to zip folder "' + workspaceDir + '", please wait...');
        var zip = new Zip(),
            zipPath = workspaceDir + '.zip';
        zip.addLocalFolder(workspaceDir);
        zip.writeZip(zipPath);
        shell.rm('-rf', path.join(workspaceDir, '*'));
        shell.mv(zipPath, workspaceDir);
    }

    var platforms = xfaceUtil.listPlatforms(projRoot);
    platforms.forEach(function(p) {
        var platformAppPath = null;
        events.emit('verbose', 'Install app `' + appPath + '` for platform ' + p + '! ');
        if (p === 'android')
            platformAppPath = path.join(projRoot, 'platforms', p, 'assets', 'xface3', 'helloxface');
        else
            platformAppPath = path.join(projRoot, 'platforms', p, 'xface3', 'helloxface');
        deleteAppPages(platformAppPath);
        shell.cp('-Rf', path.join(wwwAppPath, '*'), platformAppPath);
    });
}

/**
 * 删除应用目录下页面及资源，xface.js及插件源码除外
 */
function deleteAppPages(appPath) {
    var PULGIN_JS_FILES = [
        'xface.js',
        'cordova_plugins.js',
        'plugins'
    ];
    var children = fs.readdirSync(appPath);
    children.forEach(function(child) {
        if(PULGIN_JS_FILES.indexOf(child) > -1) return; // next
        shell.rm('-rf', path.join(appPath, child));
    });
}
