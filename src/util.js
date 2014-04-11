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
var fs            = require('fs'),
    path          = require('path'),
    CordovaError  = require('./CordovaError'),
    shell         = require('shelljs'),
    archiver      = require('archiver'),
    Q             = require('q'),
    events        = require('./events'),
    xml           = require('./xml-helpers'),
    config        = require('./config');

// Global configuration paths
var HOME = process.env[(process.platform.slice(0, 3) == 'win') ? 'USERPROFILE' : 'HOME'];
var global_config_path = path.join(HOME, '.xface');
var lib_path = path.join(global_config_path, 'lib');
shell.mkdir('-p', lib_path);

function isRootDir(dir) {
    if (fs.existsSync(path.join(dir, 'www'))) {
        if (fs.existsSync(path.join(dir, 'config.xml'))) {
            // For sure is.
            if (fs.existsSync(path.join(dir, 'platforms'))) {
                return 2;
            } else {
                return 1;
            }
        }
        // Might be (or may be under platforms/).
        if (fs.existsSync(path.join(dir, 'www', 'config.xml'))) {
            return 1;
        }
    }
    return 0;
}

exports = module.exports = {
    globalConfig:global_config_path,
    libDirectory:lib_path,
    // Runs up the directory chain looking for a .xface directory.
    // IF it is found we are in a xFace project.
    // Omit argument to use CWD.
    isxFace: function isxFace(dir) {
        if (!dir) {
            // Prefer PWD over cwd so that symlinked dirs within your PWD work correctly (CB-5687).
            var pwd = process.env.PWD;
            var cwd = process.cwd();
            if (pwd && pwd != cwd) {
                return this.isxFace(pwd) || this.isxFace(cwd);
            }
            return this.isxFace(cwd);
        }
        var bestReturnValueSoFar = false;
        for (var i = 0; i < 1000; ++i) {
            var result = isRootDir(dir);
            if (result === 2) {
                return dir;
            }
            if (result === 1) {
                bestReturnValueSoFar = dir;
            }
            var parentDir = path.normalize(path.join(dir, '..'));
            // Detect fs root.
            if (parentDir == dir) {
                return bestReturnValueSoFar;
            }
            dir = parentDir;
        }
        console.error('Hit an unhandled case in util.isxFace');
        return false;
    },
    // Cd to project root dir and return its path. Throw CordovaError if not in a Corodva project.
    cdProjectRoot: function() {
        var projectRoot = this.isxFace();
        if (!projectRoot) {
            throw new CordovaError('Current working directory is not a xFace-based project.');
        }
        process.chdir(projectRoot);
        return projectRoot;
    },
    // Recursively deletes .svn folders from a target path
    deleteSvnFolders:function(dir) {
        var contents = fs.readdirSync(dir);
        contents.forEach(function(entry) {
            var fullpath = path.join(dir, entry);
            if (fs.statSync(fullpath).isDirectory()) {
                if (entry == '.svn') {
                    shell.rm('-rf', fullpath);
                } else module.exports.deleteSvnFolders(fullpath);
            }
        });
    },
    listPlatforms:function(project_dir) {
        var core_platforms = require('../platforms');
        return fs.readdirSync(path.join(project_dir, 'platforms')).filter(function(p) {
            return Object.keys(core_platforms).indexOf(p) > -1;
        });
    },
    // list the directories in the path, ignoring any files
    findPlugins:function(pluginPath) {
        var plugins = [],
            stats;

        if (fs.existsSync(pluginPath)) {
            plugins = fs.readdirSync(pluginPath).filter(function (fileName) {
               stats = fs.statSync(path.join(pluginPath, fileName));
               return fileName != '.svn' && fileName != 'CVS' && stats.isDirectory();
            });
        }

        return plugins;
    },
    appDir: function(projectDir) {
        return projectDir;
    },
    projectWww: function(projectDir) {
        return path.join(projectDir, 'www');
    },
    projectConfig: function(projectDir) {
        var rootPath = path.join(projectDir, 'config.xml');
        var wwwPath = path.join(projectDir, 'www', 'config.xml');
        if (fs.existsSync(rootPath)) {
            return rootPath;
        } else if (fs.existsSync(wwwPath)) {
            return wwwPath;
        }
        return rootPath;
    },
    preProcessOptions: function (inputOptions) {
        /**
         * Current Desired Arguments
         * options: {verbose: boolean, platforms: [String], options: [String]}
         * Accepted Arguments
         * platformList: [String] -- assume just a list of platforms
         * platform: String -- assume this is a platform
         */
        var result = inputOptions || {};
        if (Array.isArray(inputOptions)) {
            result = { platforms: inputOptions };
        } else if (typeof inputOptions === 'string') {
            result = { platforms: [inputOptions] };
        }
        result.verbose = result.verbose || false;
        result.platforms = result.platforms || [];
        result.options = result.options || [];

        var projectRoot = this.isxFace();

        if (!projectRoot) {
            throw new CordovaError('Current working directory is not a xFace-based project.');
        }
        var projectPlatforms = this.listPlatforms(projectRoot);
        if (projectPlatforms.length === 0) {
            throw new CordovaError('No platforms added to this project. Please use `xface platform add <platform>`.');
        }
        if (result.platforms.length === 0) {
            result.platforms = projectPlatforms;
        }

        return result;
    },
    getRepoSetPath: function() {
        var json = config.read(this.cdProjectRoot());
        if(json.repoSet) {
            return json.repoSet;
        } else {
            throw new Error('The reposet is not set, maybe you should execute command `xmen set reposet <path>` to set reposet dir.');
        }
    },
    /**
     * 获取平台默认的lib根目录，即xface core的根目录
     * @param projectRoot xFace工程根目录
     * @param platform 平台名称
     */
    getDefaultPlatformLibPath: function(projectRoot, platform) {
        var platforms = require('../platforms');
        if(!platforms.hasOwnProperty(platform)) {
            throw new Error('Platform `' + platform + '` is not valid! ');
        }
        if(config.internalDev(projectRoot)) {
            return path.join(module.exports.getRepoSetPath(), 'xface-' + platform);
        } else {
            return path.join(module.exports.libDirectory, platform, 'cordova', platforms[platform].version);
        }
    },
    /**
     * 将一个文件/目录压缩为一个zip文件
     * @param {String} filePath 源文件（夹）路径，如果以*结尾，则只压缩文件夹的内容（如路径为/a/b/*，则只压缩/a/b下的子文件或子目录）
     * @param {String} zipPath 目标zip文件路径
     */
    zipFolder: function(filePath, zipPath) {
        var zip = archiver('zip');
            wildcard = (path.basename(filePath) == '*'),
            output = fs.createWriteStream(zipPath);
        if(wildcard) filePath = path.dirname(filePath);
        if(!fs.existsSync(filePath)) return Q.reject(new Error('Path "' + filePath + '" not existed.'));
        events.emit('verbose', 'Beginning to zip folder "' + filePath + '", please wait...');

        var d = Q.defer();
        output.on('close', function() {
            events.emit('verbose', 'Finished zip operation, zip path "' + zipPath + '".');
            d.resolve();
        });
        zip.on('error', function(err) {
            d.reject(err);
        });
        zip.pipe(output);
        if(wildcard) {
            if(!fs.statSync(filePath).isDirectory()) {
                return Q.reject(new Error('Path "' + filePath + '" is not a folder.'));
            }
            fs.readdirSync(filePath).forEach(function(f) {
                addToZip(zip, path.join(filePath, f), f);
            });
        } else {
            addToZip(zip, filePath, path.basename(filePath));
        }
        zip.finalize(function(err, bytes) {
            if (err) d.reject(err);
        });
        return d.promise;
    },
    getDefaultAppId: function(platformProj) {
        var platform = path.basename(platformProj),
            parser = require('../platforms')[platform].parser;
        var configXml = new parser(platformProj).config_xml();
        var doc = xml.parseElementtreeSync(configXml),
            appTag = doc.find('pre_install_packages/app_package');
        if(appTag) return appTag.attrib['id'];
        return 'helloxface';
    }
};

function addToZip(zip, filePath, entryPath) {
    var baseName = path.basename(filePath);
    if(fs.statSync(filePath).isFile()) {
        zip.append(fs.createReadStream(filePath), {name: entryPath});
    } else {
        zip.append(new Buffer(0), {name: entryPath + '/'});
        fs.readdirSync(filePath).forEach(function(f) {
            addToZip(zip, path.join(filePath, f), entryPath + '/' + f);
        });
    }
}

// opt_wrap is a boolean: True means that a callback-based wrapper for the promise-based function
// should be created.
function addModuleProperty(module, symbol, modulePath, opt_wrap, opt_obj) {
    var val = null;
    if (opt_wrap) {
        module.exports[symbol] = function() {
            val = val || module.require(modulePath);
            if (arguments.length && typeof arguments[arguments.length - 1] === 'function') {
                // If args exist and the last one is a function, it's the callback.
                var args = Array.prototype.slice.call(arguments);
                var cb = args.pop();
                val.apply(module.exports, args).done(cb, cb);
            } else {
                val.apply(module.exports, arguments).done(null, function(err) { throw err; });
            }
        };
    } else {
        Object.defineProperty(opt_obj || module.exports, symbol, {
            get : function() { return val = val || module.require(modulePath); },
            set : function(v) { val = v; }
        });
    }

    // Add the module.raw.foo as well.
    if(module.exports.raw) {
        Object.defineProperty(module.exports.raw, symbol, {
            get : function() { return val = val || module.require(modulePath); },
            set : function(v) { val = v; }
        });
    }
}

addModuleProperty(module, 'plugin_parser', './plugin_parser');

exports.addModuleProperty = addModuleProperty;
