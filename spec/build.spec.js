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
var xface = require('../xface'),
    platforms = require('../platforms'),
    shell = require('shelljs'),
    path = require('path'),
    fs = require('fs'),
    hooker = require('../src/hooker'),
    Q = require('q'),
    util = require('../src/util');

var supported_platforms = Object.keys(platforms).filter(function(p) { return p != 'www'; });

describe('build command', function() {
    var is_cordova, cd_project_root, list_platforms, fire;
    var project_dir = '/some/path';
    var prepare_spy, compile_spy;
    var result;

    function buildPromise(f) {
        f.then(function() { result = true; }, function(err) { result = err; });
    }

    function wrapper(f, post) {
        runs(function() {
            buildPromise(f);
        });
        waitsFor(function() { return result; }, 'promise never resolved', 500);
        runs(post);
    }

    beforeEach(function() {
        is_cordova = spyOn(util, 'isxFace').andReturn(project_dir);
        cd_project_root = spyOn(util, 'cdProjectRoot').andReturn(project_dir);
        list_platforms = spyOn(util, 'listPlatforms').andReturn(supported_platforms);
        fire = spyOn(hooker.prototype, 'fire').andReturn(Q());
        prepare_spy = spyOn(xface.raw, 'prepare').andReturn(Q());
        compile_spy = spyOn(xface.raw, 'compile').andReturn(Q());
    });
    describe('failure', function() {
        it('should not run inside a xFace-based project with no added platforms by calling util.listPlatforms', function(done) {
            list_platforms.andReturn([]);
            Q().then(xface.raw.build).then(function() {
                expect('this call').toBe('fail');
            }, function(err) {
                expect(err.message).toEqual(
                    'No platforms added to this project. Please use `xface platform add <platform>`.'
                )
            }).fin(done);
        });

        it('should not run outside of a xFace-based project', function(done) {
            is_cordova.andReturn(false);

            Q().then(xface.raw.build).then(function() {
                expect('this call').toBe('fail');
            }, function(err) {
                expect(err.message).toEqual(
                    'Current working directory is not a xFace-based project.'
                )
            }).fin(done);
        });
    });

    describe('success', function() {
        it('should run inside a xFace-based project with at least one added platform and call both prepare and compile', function(done) {
            xface.raw.build(['android','ios']).then(function() {
                var opts = {verbose: false, platforms: ['android', 'ios'], options: []};
                expect(prepare_spy).toHaveBeenCalledWith(opts);
                expect(compile_spy).toHaveBeenCalledWith(opts);
                done();
            });
        });
        it('should pass down options', function(done) {
            xface.raw.build({platforms: ['android'], options: ['--release']}).then(function() {
                expect(prepare_spy).toHaveBeenCalledWith({platforms: ['android'], options: ["--release"]});
                expect(compile_spy).toHaveBeenCalledWith({platforms: ['android'], options: ["--release"]});
                done();
            });
        });
    });

    describe('hooks', function() {
        describe('when platforms are added', function() {
            it('should fire before hooks through the hooker module', function(done) {
                xface.raw.build(['android', 'ios']).then(function() {
                    expect(fire).toHaveBeenCalledWith('before_build', {verbose: false, platforms:['android', 'ios'], options: []});
                    done();
                });
            });
            it('should fire after hooks through the hooker module', function(done) {
                xface.raw.build('android').then(function() {
                     expect(fire).toHaveBeenCalledWith('after_build', {verbose: false, platforms:['android'], options: []});
                     done();
                });
            });
        });

        describe('with no platforms added', function() {
            it('should not fire the hooker', function(done) {
                list_platforms.andReturn([]);
                Q().then(xface.raw.build).then(function() {
                    expect('this call').toBe('fail');
                }, function(err) {
                    expect(err.message).toEqual(
                        'No platforms added to this project. Please use `xface platform add <platform>`.'
                    )
                }).fin(done);
            });
        });
    });
});
