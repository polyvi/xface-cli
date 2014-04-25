/**
    Licensed to the Apache Software Foundation (ASF) under one
    or more contributor license agreements.  See the NOTICE file
    distributed with this work for additional information
    regarding copyright ownership.  The ASF licenses this file
    to you under the Apache License, Version 2.0 (the
    "License"); you may not use this file except in compliance
    with the License.  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing,
    software distributed under the License is distributed on an
    "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, either express or implied.  See the License for the
    specific language governing permissions and limitations
    under the License.
*/

/*global require: true, module: true, process: true*/
/*jslint sloppy: true, white: true, newcap: true */

var path              = require('path'),
    fs                = require('fs'),
    glob              = require('glob'),
    _                 = require('underscore'),
    shell             = require('shelljs'),
    cordova_util      = require('./util'),
    hooker            = require('./hooker'),
    superspawn        = require('./superspawn');

// Returns a promise.
module.exports = function compile(options) {
    var projectRoot = cordova_util.cdProjectRoot();
    options = cordova_util.preProcessOptions(options);

    var hooks = new hooker(projectRoot);
    var ret = hooks.fire('before_compile', options);
    options.platforms.forEach(function(platform) {
        ret = ret.then(function() {
            var args = options.options.slice(0); // clone

            var buildBackupFile;
            // default just build device package for ios
            if (platform === 'ios') {
                if(args.indexOf('--device') < 0 && args.indexOf('--emulator') < 0) {
                    args.push('--device');
                }
                var archs = collectIosPluginLibraryArchs(projectRoot);
                if(needModifyArchs(archs)) {
                    var originalFile = path.join(projectRoot, 'platforms', platform, 'cordova', 'build'),
                        buildBackupFile = path.join(projectRoot, 'platforms', platform, 'cordova', 'build-backup-for-project');
                    !fs.existsSync(buildBackupFile) && shell.cp('-f', originalFile, buildBackupFile);
                    shell.chmod('a+x', buildBackupFile);
                    modifyBuildArchitecture(originalFile, archs);
                }
            }
            var cmd = path.join(projectRoot, 'platforms', platform, 'cordova', 'build');
            return superspawn.spawn(cmd, args, { stdio: 'inherit', printCommand: true })
            .then(function(data) {
                if(platform === 'ios' && fs.existsSync(buildBackupFile)) {
                    shell.mv('-f', buildBackupFile, cmd);
                }
                return data;
            });
        });
    });
    ret = ret.then(function() {
        return hooks.fire('after_compile', options);
    });
    return ret;
};

function needModifyArchs(archs) {
    return archs != 'default';
}

/**
 * 收集所有插件静态库均支持的architecture交集
 * 可能的值包含armv7, armv7s, arm64, default
 */
function collectIosPluginLibraryArchs(projectRoot) {
    var parser = new (require('./metadata/ios_parser'))(path.join(projectRoot, 'platforms', 'ios'));
    var pluginsDir = path.join(parser.cordovaproj, 'Plugins');
    if(!fs.existsSync(pluginsDir)) return 'default';
    var staticLibs = glob.sync(path.join(pluginsDir, '**', '*.a')),
        frameworks = glob.sync(path.join(pluginsDir, '**', '*.framework'));
    frameworks.forEach(function(framework) {
        var name = path.basename(framework, path.extname(framework));
        var libPath = path.join(framework, name);
        fs.existsSync(libPath) && staticLibs.push(libPath);
    });
    if(staticLibs.length <= 0) return 'default';

    var archs = ['armv7', 'armv7s', 'arm64'],
        expr = /.*:.*:\s*(.*?)\s*$/i;
    staticLibs.forEach(function(lib) {
        var output = shell.exec('lipo -info "' + lib + '"', {silent:true}).output;
        var matchData = output.match(expr);
        if(matchData) {
            archs = _.intersection(archs, matchData[1].split(/\s+/));
        }
    });
    return archs;
}

function modifyBuildArchitecture(buildPath, archs) {
    var grossExpr = /^.*-sdk\s+iphoneos.*$/im,
        explicitExpr = /(.*ARCHS=").*?(".*VALID_ARCHS=").*?(".*)/;
    var content = fs.readFileSync(buildPath, 'utf-8');
    var origin = content.match(grossExpr)[0];
    if(!origin) throw new Error('Can\'t find iphoneos build script line in "' + buildPath + '".');

    var archsStr = archs.join(' '),
        replacement = origin.replace(explicitExpr, '$1' + archsStr + '$2' + archsStr + '$3');
    fs.writeFileSync(buildPath, content.replace(origin, replacement), 'utf-8');
}
