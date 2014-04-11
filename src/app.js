var fs = require('fs'),
    path = require('path'),
    Q = require('q'),
    shell = require('shelljs'),
    child_process = require('child_process'),
    jsdom = require('jsdom-nogyp').jsdom,
    et = require('elementtree'),
    xfaceUtil = require('./util'),
    events = require('./events'),
    lazy_load = require('./lazy_load'),
    xml_helpers = require('./xml-helpers');

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
 * add命令：安装应用到平台工程下；list命令：列出平台工程下安装的所有应用
 * @param {String} command 支持的命令:add, list
 * @param {Array} add命令: targets如果值为`test`，则将已安装插件测试页面合并，然后将合并后页面安装到平台工程下，
 *      如果为路径，则安装该路径下对应的应用页面
 * @param {String} testTemplate 插件测试模板路径，该参数可选，如果未传该参数，则从网上下载
 */
module.exports = function(command, targets, testTemplate) {
    if(!String(command)) command = 'ls';
    return Q.try(function() {
        var xfaceProj = xfaceUtil.isxFace(process.cwd());
        if (!xfaceProj) {
            return Q.reject(new Error('Current working directory is not a xFace-based project.'));
        }
        if(command == 'add') {
            if(targets.length === 1) {
                var target = targets[0];
                // add plugin testcases
                if (target == 'test' || (path.basename(target) == target && !fs.existsSync(target))) {
                    return module.exports.generatePluginTest(xfaceProj, target, testTemplate)
                    .then(function(testPath) {
                        return module.exports.installApp(xfaceProj, [testPath]);
                    });
                }
            }
            return module.exports.installApp(xfaceProj, targets);
        } else if(command == 'ls' || command == 'list') {
            var platforms = xfaceUtil.listPlatforms(xfaceProj);
            if(platforms.length == 0) {
                return Q([]);
            }
            var platformProj = path.join(xfaceProj, 'platforms', platforms[0]);
            var appIds = require('xplugin').multiapp_helpers.getInstalledApps(platformProj, platforms[0]);
            events.emit('results', 'Installed apps: ' + JSON.stringify(appIds));
            return Q(appIds);
        } else {
            return Q.reject(new Error('Do not support command `xface app ' + command + '`! Please try other commands.'));
        }
    });
};

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

module.exports.generatePluginTest = function(xfaceProj, target, testTemplate) {
    var plugins = xfaceUtil.findPlugins(path.join(xfaceProj, 'plugins'));
    if(target == 'test') {
        if (plugins.length === 0) {
            events.emit('warn', 'You need install one plugin at least! ');
            return Q();
        }
    } else {
        var plugin = matchPart(plugins, target);
        if(!plugin) return Q.reject(new Error('Can not find plugin id that matches `' + target + '`, try command `xface plugin ls` to show installed plugins! '));
        plugins = [plugin];
    }
    var q = (testTemplate && fs.existsSync(testTemplate)) ? Q(testTemplate) : lazy_load.cordova('test-template');
    return q.then(function(template) {
        return mergePluginTests(xfaceProj, plugins, template);
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
    if(splittedPlugins.valid <= 0) {
        return Q.reject(new Error('No valid plugin tests can be added, please add new plugins.'));
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
 * 将应用安装到平台工程下
 * @param {Object} projRoot
 * @param {Array} apps
 * @param {Boolean} dirAsId 是否将应用目录名作为应用的id
 */
module.exports.installApp = function(projRoot, apps, dirAsId) {
    var clear = false, // <projRoot>/www下的应用是否已经被清除
        autoId = 1, // 如果app.xml不存在使用该id
        appAppIds = [],
        projectWww = path.join(projRoot, 'www');
    var q = apps.reduce(function(soFar, appPath) {
        return soFar.then(function() {
            if (!fs.existsSync(path.join(appPath, 'index.html')) && !fs.existsSync(path.join(appPath, 'app.xml'))) {
                return Q.reject(new Error('App at path `' + appPath + '` not valid, file `index.html` or `app.xml` not existed! '));
            }
            // 清除www下的所有应用
            if(!clear) {
                clear = true;
                fs.readdirSync(projectWww).forEach(function(f) {
                    var subdir = path.join(projectWww, f);
                    if(fs.lstatSync(subdir).isFile()) return;
                    shell.rm('-rf', subdir);
                });
            }
            var appId;
            if(dirAsId) {
                appId = path.basename(appPath);
            } else if(fs.existsSync(path.join(appPath, 'app.xml'))){
                var appXml = path.join(appPath, 'app.xml');
                var doc = xml_helpers.parseElementtreeSync(appXml);
                appId = doc.getroot().attrib['id'];
            } else {
                appId = String(autoId);
                autoId += 1;
            }
            var destAppDir = path.join(projectWww, appId);
            shell.mkdir(destAppDir);
            shell.cp('-rf', path.join(appPath, '*'), destAppDir);
            appAppIds.push(appId);

            // write app id to app.xml if needed
            var appXml = path.join(destAppDir, 'app.xml');
            if(!fs.existsSync(appXml)) {
                var content = fs.readFileSync(path.join(__dirname, '..', 'templates', 'app.xml'), 'utf-8');
                content = content.replace(/TEMPLATE-APP-ID/gm, appId);
                fs.writeFileSync(appXml, content, 'utf-8');
            }

            // zip workspace to workspace.zip
            var workspaceDir = path.join(destAppDir, 'workspace');
            if(fs.existsSync(workspaceDir) && fs.readdirSync(workspaceDir).length > 0) {
                var zipPath = workspaceDir + '.zip';
                if(fs.existsSync(zipPath)) shell.rm(zipPath);
                return xfaceUtil.zipFolder(path.join(workspaceDir, '*'), zipPath)
                .then(function() {
                    shell.rm('-rf', path.join(workspaceDir, '*'));
                    shell.mv(zipPath, workspaceDir);
                });
            }
        });
    }, Q());

    return q.then(function() {
        var configXml = path.join(projRoot, 'config.xml');
        var doc = xml_helpers.parseElementtreeSync(configXml),
            packagesTag = doc.find('./pre_install_packages');
        if(!packagesTag) {
            packagesTag = et.XML('<pre_install_packages></pre_install_packages>');
            doc.getroot().getchildren().unshift(packagesTag);
        }
        var len = packagesTag.len();
        if(len > 0) packagesTag.delSlice(0, len);

        appAppIds.forEach(function(id) {
            packagesTag.append(et.XML('<app_package id="' + id + '" name="' + id + '" />'))
        });
        fs.writeFileSync(configXml, doc.write({indent: 4}), 'utf-8');
    })
    .then(function() {
        return require('./prepare')();
    });
}
