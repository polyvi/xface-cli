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

var path          = require('path'),
    fs            = require('fs'),
    url           = require('url'),
    shell         = require('shelljs'),
    JSHINT        = require("jshint").JSHINT;

/**
 * 将opts中的属性值以json格式添加到<proj_root>/.xface/config.json中
 * config.json包含的属性主要有id, name, lib, target_proj, dev_type
 * id和name分别为工程的id和名称，target_proj为工程所关联项目（不存在或者为空时表示不关联任何项目）
 * dev_type用于标识是内部项目开发还是外部开发者使用（'internal'表示内部项目开发，不存在或者为空时为外部使用）
 * @param {String} project_root
 * @param {Object} opts
 */
module.exports = function config(project_root, opts) {
    var json = module.exports.read(project_root);
    Object.keys(opts).forEach(function(p) {
        json[p] = opts[p];
    });
    return module.exports.write(project_root, json);
};

module.exports.read = function get_config(project_root) {
    var dotCordova = path.join(project_root, '.xface');

    if (!fs.existsSync(dotCordova)) {
        shell.mkdir('-p', dotCordova);
    }

    var config_json = path.join(dotCordova, 'config.json');
    if (!fs.existsSync(config_json)) {
        return module.exports.write(project_root, {});
    } else {
        var data = fs.readFileSync(config_json, 'utf-8');
        try {
            return JSON.parse(data);
        } catch (e) {
            JSHINT(data);
            var err = JSHINT.errors[0];
            if (err) {
                throw 'Parsing "'+config_json+'" at line '+err.line+" col "+err.character+"; "+err.reason;
            }
            throw e;
        }
    }
};

module.exports.write = function set_config(project_root, json) {
    var dotCordova = path.join(project_root, '.xface');
    var config_json = path.join(dotCordova, 'config.json');
    fs.writeFileSync(config_json, JSON.stringify(json), 'utf-8');
    return json;
};

module.exports.has_custom_path = function(project_root, platform) {
    var json = module.exports.read(project_root);
    if (json.lib && json.lib[platform]) {
        var uri = url.parse(json.lib[platform].uri);
        if (!(uri.protocol)) return uri.path;
        else if (uri.protocol && uri.protocol[1] ==':') return uri.href;
    }
    return false;
};

/**
 * 判断指定工程是否为内部开发使用的工程
 * @param {String} project_root 工程根路径
 */
module.exports.internalDev = function(project_root) {
    var json = module.exports.read(project_root);
    return json.dev_type === 'internal';
}
