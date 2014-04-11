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
    xml           = require('../xml-helpers'),
    util          = require('../util'),
    events        = require('../events'),
    shell         = require('shelljs'),
    project_config= require('../config'),
    Q             = require('q'),
    xplugin       = require('xplugin'),
    ConfigParser = require('../ConfigParser');

var default_prefs = {
    "useBrowserHistory":"true",
    "exit-on-suspend":"false"
};

module.exports = function android_parser(project) {
    if (!fs.existsSync(path.join(project, 'AndroidManifest.xml'))) {
        throw new Error('The provided path "' + project + '" is not an Android project.');
    }
    this.path = project;
    this.strings = path.join(this.path, 'res', 'values', 'strings.xml');
    this.manifest = path.join(this.path, 'AndroidManifest.xml');
    this.android_config = path.join(this.path, 'res', 'xml', 'config.xml');
};

// Returns a promise.
module.exports.check_requirements = function(project_root) {
    // Rely on platform's bin/create script to check requirements.
    return Q(true);
};

module.exports.prototype = {
    findOrientationPreference: function(config) {
        var ret = config.getPreference('orientation');
        if (ret && ret != 'default' && ret != 'portrait' && ret != 'landscape') {
            events.emit('warn', 'Unknown value for orientation preference: ' + ret);
            ret = null;
        }

        return ret;
    },

    update_from_config:function(config) {
        if (config instanceof ConfigParser) {
        } else throw new Error('update_from_config requires a ConfigParser object');

        // Update app name by editing res/values/strings.xml
        var name = config.name();
        var strings = xml.parseElementtreeSync(this.strings);
        strings.find('string[@name="app_name"]').text = name;
        fs.writeFileSync(this.strings, strings.write({indent: 4}), 'utf-8');
        events.emit('verbose', 'Wrote out Android application name to "' + name + '"');

        var manifest = xml.parseElementtreeSync(this.manifest);
        // Update the version by changing the AndroidManifest android:versionName
        var version = config.version();
        manifest.getroot().attrib["android:versionName"] = version;

        // Update package name by changing the AndroidManifest id and moving the entry class around to the proper package directory
        var pkg = config.packageName();
        pkg = pkg.replace(/-/g, '_'); // Java packages cannot support dashes
        var orig_pkg = manifest.getroot().attrib.package;
        manifest.getroot().attrib.package = pkg;

        // Set the orientation in the AndroidManifest
        var orientationPref = this.findOrientationPreference(config);
        if (orientationPref) {
            var act = manifest.getroot().find('./application/activity');
            switch (orientationPref) {
                case 'default':
                    delete act.attrib["android:screenOrientation"];
                    break;
                case 'portrait':
                    act.attrib["android:screenOrientation"] = 'userPortrait';
                    break;
                case 'landscape':
                    act.attrib["android:screenOrientation"] = 'userLandscape';
            }
        }

        // Write out AndroidManifest.xml
        fs.writeFileSync(this.manifest, manifest.write({indent: 4}), 'utf-8');

        var orig_pkgDir = path.join(this.path, 'src', path.join.apply(null, orig_pkg.split('.')));

        var orig_java_class = xplugin.platforms['android'].activity_name(this.path) + '.java';
        var pkgDir = path.join(this.path, 'src', path.join.apply(null, pkg.split('.')));
        shell.mkdir('-p', pkgDir);
        var orig_javs = path.join(orig_pkgDir, orig_java_class);
        var new_javs = path.join(pkgDir, orig_java_class);
        var javs_contents = fs.readFileSync(orig_javs, 'utf-8');
        javs_contents = javs_contents.replace(/package [\w\.]*;/, 'package ' + pkg + ';');
        events.emit('verbose', 'Wrote out Android package name to "' + pkg + '"');
        fs.writeFileSync(new_javs, javs_contents, 'utf-8');
    },

    // Returns the platform-specific www directory.
    www_dir:function() {
        var defaultAppId = util.getDefaultAppId(this.path);
        return path.join(this.path, 'assets', 'xface3', defaultAppId);
    },

    config_xml:function(){
        return this.android_config;
    },

    // Used for creating platform_www in projects created by older versions.
    cordovajs_path:function(libDir) {
        var jsPath = path.join(libDir, 'framework', 'assets', 'xface.js');
        return path.resolve(jsPath);
    },

    // Replace the www dir with contents of platform_www and app www.
    update_www:function() {
        var projectRoot = util.isxFace(this.path);
        var app_www = util.projectWww(projectRoot);
        var platform_www = path.join(this.path, 'platform_www');
        var xface3_dir = path.join(this.path, 'assets', 'xface3');

        // Clear the www dir
        shell.rm('-rf', xface3_dir);
        shell.mkdir(xface3_dir);
        // Copy over all app www assets
        shell.cp('-rf', path.join(app_www, '*'), xface3_dir);
        // Copy over stock platform www assets (xface.js)
        var appIds = xplugin.multiapp_helpers.getInstalledApps(this.path, 'android');
        var xface3Dir = path.dirname(this.www_dir());
        appIds.forEach(function(id) {
            var appPath = path.join(xface3Dir, id);
            shell.cp('-rf', path.join(platform_www, '*'), appPath);
        });
    },

    // update the overrides folder into the www folder
    update_overrides:function() {
        var projectRoot = util.isxFace(this.path);
        var merges_path = path.join(util.appDir(projectRoot), 'merges', 'android');
        if (fs.existsSync(merges_path)) {
            var overrides = path.join(merges_path, '*');
            var appIds = xplugin.multiapp_helpers.getInstalledApps(this.path, 'android');
            var xface3Dir = path.dirname(this.www_dir());
            appIds.forEach(function(id) {
                var appPath = path.join(xface3Dir, id);
                shell.cp('-rf', overrides, appPath);
            });
        }
    },

    // Returns a promise.
    update_project:function(cfg) {
        var platformWww = path.join(this.path, 'assets');
        try {
            this.update_from_config(cfg);
            this.update_overrides();
        } catch(e) {
            return Q.reject(e);
        }
        // delete any .svn folders copied over
        util.deleteSvnFolders(platformWww);
        return Q();
    }
};
