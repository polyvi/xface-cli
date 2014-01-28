<!--
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
#  KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
#
-->
# xface-cli release notes
## 3.2.0-0.0.2
* 将app.xml中widget的version属性由1.0改为2.0
* 由于reposet的保存方式作了调整，故对reposet配置的读取作相应修改
* 在xface-cli生成合并插件测试时，使用的测试模板通过版本号去下载，与platform的下载保持一致
* 暴露合并插件测试页面的功能，供xmen-cli调用
* 将依赖的default app版本升级为0.0.3
* 更新应用的时候将xface.js、staging目录内容及merges资源拷贝到所有应用中
* 修改一处属性引用错误
* 解决一处逻辑错误，用.xface代替.cordova
* 在extra.js中暴露xcode模块
* updated to 3.3.0
* ubuntu install instructions update (bis repetitam)
* ubuntu install instructions update
* ubuntu install instructions update
* ubuntu install instructions update
* added deprecation notice about wp7
* updated plugman version to 0.17.0
* CB-5573 relies on stderr content and error codes to detect a problem with xcode installation.
* CB-5330: Fix hooks test on windows, move to e2e.
* Moved hooker.spec.js to e2e
* CB-4382: Pass cli arguments to project-level hooks
* CB-5619 Avoid Error: Error ...
* CB-5613 Never hide stack trace on uncaughtExceptions.
* CB-5613 use throw Error to include stack information for -d
* CB-5614 Include path to file when config.xml fails to parse
* CB-5499 added config_xml method to wp7 exports, and added tests for wp7+wp8
* updated to 3.3.0-rc.1
* Document the new Ubuntu support
* updated package.json to use the latest plugman
* CB-5619 Avoid Error: Error ...
* CB-5613 Never hide stack trace on uncaughtExceptions.
* CB-5613 use throw Error to include stack information for -d
* CB-5614 Include path to file when config.xml fails to parse
* CB-5499 added config_xml method to wp7 exports, and added tests for wp7+wp8
* updated to 3.3.0-rc.1
* updated package.json to use the latest plugman
* Document the new Ubuntu support
* make sure the prepare step works in ia32 machines
* Fixes to e2e tests: args[0] bug, corodva -> cordova
* CB-5362 blackberry parser: support local cordova-blackberry
* CB-5348 Minor tweaks to cordova help
* CB-5345 Add pre_package event for windows8 parser.
* update_csproj was called twice, once from update_project and once from update_www
* CB-5343 Tell people to run npm install when requirements are missing
* CB-5325 Improve README
* CB-5311 windows: Provide cmd script so top level node commands run smoothly
* CB-5248 Fix cordova create directory_name com.example.app AppName extra_arg
* updated check reqs to say amazon fireos
* Fixed CLI error while adding amazon-fireos platform.
* updated platforms.js to include fireos
* Added check for awv_interface.jar existance.
* Added amazon-fireos platform. making cli test 'platform ls' pass. Added amazon-fireos platform in the list.
* Fixed CLI error while adding amazon-fireos platform.
* updated platforms.js to include fireos
* Added check for awv_interface.jar existance.
* Added amazon-fireos platform. making cli test 'platform ls' pass. Added amazon-fireos platform in the list.
* Fixed CLI error while adding amazon-fireos platform.
* updated platforms.js to include fireos
* Added check for awv_interface.jar existance.
* Added amazon-fireos platform. making cli test 'platform ls' pass. Added amazon-fireos platform in the list.
* updated ubuntu to use apache repos
* add ubuntu to platform.spec list
* platforms now points to apache to grab cordova-ubuntu
* add ubuntu platform
* platforms now points to apache to grab cordova-ubuntu
* add ubuntu platform
* updated to 3.2.0-0.4.0
* CB-5034 add registry info to README
* Make sure errors during prepare are reported
* CB-5031 Add CLI help text for platform update and plugin search
* CB-5298 Remove redundant requirements check for iOS and Android. The bin/create scripts check.
* windows8. fixes version number parsing logic
* removed 'win-test' fixture, e2e runs fine on windows now.
* [CB-4472] Fix tests broken by previous commit.
* CB-4472 Remove <preference> from template config.xml
* Update release notes
* Update version to 3.2.0-0.3.0
* Fix e2e tests on Windows
* Revert "fixed merge conflict due to e2e"
* CB-5501 fix blackberry10 platform
* [android] fixing failing android parser spec tests.
* [android] call out to platform check_req script
* bumped version to correct npm published version
* fixed merge conflict due to e2e
* skip hooker.spec expects if running on win32. until someone fixes these tests, they are simply skipped over.
* added win-test to be run on windows, which does not include e2e tests which have multiple failures on windows.
* Fix comments left over from debugging.
* Add plugin test
* Minor fixes in create.spec.js
* Add test for "create" command.
* Much more complete 'platform' command integration tests.
* First pass of platform integration test.
* Skeleton of e2e tests in place.
* fixed failing tests recently introduced with Windows8 parser changes
* Update tests to match improvements
* Update parsers to match new libDir returned by lazy_load
* Remove platform check in platform add and update
* Make lazy_load method aware of subdirectory field
* Append subdirectory for concerned platforms
* correctly resolve file/directories using fs provided methods
* Update wp7_parser.js
* Update wp8_parser.js
* CB-5485 fixed issue with use of cordova cli api, if cordova.config is called before cordova.create, the create command failed. Now, project directory must not exist, or only contain the .cordova config file.
* removes traling spaces when reads author from config.xml
* Rewrite properties set, to better match project code style
* Allow version string to have 1, 2, 3, or 4 part numbers
* Improve fix version method
* Update appxmanifest properties' DisplayName and PublisherName
* Append author property to config_parser
* Update Identity.Name in package.appxmanifest
* Fix version and Id in package.appxmanifest
* Add BOM to files to ensure app pass store certification
* CB-5350 Windows8 build fails due to invalid 'Capabilities' definition
* CB-5340 Windows8 build does no write cordova_plugins.js
* CB-5337 Windows8 build fails due to invalid app version
* CB-5321 Windows8 custom_path is not correctly resolved by CLI
* CB-5467: CLI: cordova platform add blackberry10 blocked
* prepare时，仅在config.xml中pre_install_packages标签存在时，才删除该标签
* 重构app模块，支持add多个应用，并增加list命令用于显示安装的所有应用
* 在安装插件或者prepare时，将插件的asset资源拷贝到所有应用目录下
* 初步支持多应用安装，prepare时可以将多应用拷贝到平台工程下，并配置config.xml
* 解决一处引擎xface.js更新之后开发工程中xface.js得不到更新的问题
* 修正两处路径错误
* updated to 3.2.0-0.1.0
* add the output of the plugman results to the console
* CB-5363 Improve config_json error reporting
* CB-5364 config_parser - check for null element text
* Fix issue not finding platform script when in subdir - check platforms which have subdir - append subdir to libDir for detected platforms
* CB-5377 serve: should only indicate listening when it is
* CB-5368 Cordova serve deflate content breaks IE
* Change cordova serve's project.json to include etags.
* CB-5280 Update serve's help text to remove platform arguments
* CB-5364 config_parser - handle duplicates with children and text when merging
* changed rc version based off semver
* updated version for 3.2.0-0.0.0 rc testing
* CB-5320 Document avoiding sudo
* CB-4400: cd to project root in most cordova commands.
* CB-5063: Revert to copying cordova.js before user www dir
* fix 3 failing tests for windows8 and wp8 and add assertions for wp7 too.
* Adding instructions for installing on master.
* CB-5063: Keep cordova.js in platform_www to avoid copying it from lib.
* Remove accidental console.logs in the tests.
* CB-5307: Remove references to Callback and Incubator
* tests were failing attempting to match lib/dir and lib\\dir on windows
* CB-5183 WP7/8 lib path is not correctly resolved by CLI (additional changes)
* CB-5283 Improved cordova serve message to be more descriptive
* [CB-4866] Execute hooks in ascending order of any leading numbers
* [CB-5143] Locate the actual Android app .java file much more carefully.
* Cleaning up wp7+8 parsers' use of promises. Fix tests.
* serve: Fix doRoot() not being called & remove duplicated table.
* serve: provide basic entry point
* Code style (indentation)
* Wait for the pre_package event to finish, or the update_csproj function might give unexpected results. Fixes both the wp7 and wp8 parser.
* Add pre_package event to wp8 project
* readability + code quality in wp7+8 parsers
* CB-5183 WP7/8 custom_path is not correctly resolved by CLI
* [CB-4994] Update xcode dependency to handle Xcode 5 capabilities.
* [CB-5220] "An error occurred" is missing an "A" ...
* 修改reviewboard配置
* 由于android引擎的create/update脚本支持了shared参数，针对内部开发模式，对调用方式作相应调整
* 对原来add/update平台的代码进行了重构
* 在extra.js中暴露hooker模块
* 解决cli js单元测试不过的问题
* 将以前使用的zip压缩模块adm-zip替换为archiver
* 删除UsePlayerMode为true的配置项，默认创建非player工程
* [CB-5197] Updated version and RELEASENOTES.md for release 3.1.0-0.2.0
* increased version of plugman to 0.14.0 in package.json
* CB-5187: remove unused var os_platform
* CB:5187 on node  windows broken compile, emulate, run
* [CB-4976] Don't symlink into ~/.cordova/lib for local libs
* [CB-5142] improve grammar of emulate description
* [CB-5147] emulate needs a space before error message
* CB-5125 add tests for chil process spawn
* CB-5125: replace child process exec with spawn
* CB-4748: Fail quickly if dir passed to cordova create is not empty.
* CB-5106: removed flood of cp error messages when running tests
* CB-5106:[wp7] fixed broken wp7 tests
* CB-5106:[win8] fixed tests for windows 8
* Using .find to grab visualelements instead
* CB-5066: fixed issue with visual elements not being referenced correctly
* windows8: remove debug console.log
* windows8: fixed project parser issue, and updated tests
* Update tests for commit d1c8024: update_project() should not call update_www() directly
* begin firefoxos tests
* CB-5066: dealing with windows8 issues
* config.xml helper function is used, removed error merge of wp folder.
* CB-5066: continuing merge of windows 8 stuff
* CB-5066: merged in windows 8 support into master from cordova-3.1.x
* config.xml helper function is used, removed error merge of wp folder.
* CB-5066: continuing merge of windows 8 stuff
* CB-5066: merged in windows 8 support into master from cordova-3.1.x
* CB-2234 Add 'cordova info' command
* CB-4774: Copy www assets before running plugin prepare
* cordova help should return a Q. fixes CB-5070
* updated to a version greater than our latest version on npm
* added not about platform+os restrictions
* added myself as a contributor, CB-5042 added info on windows8
* CB-5067: added exception incase no platform level config.xml or defaults.xml exisit
* added temp config path for ffos, fixed wp8 config_xml function
* [CB-4774] Updated prepare flow to make platform config.xml a build output   - Adds a new method to manually merge two config.xml files
* CB-5032: clarify the help text
* CB-4957: added fix for FFOS
* 修改spec中一些错误
* 安装应用时，如果应用目录存在workspace文件夹，将其内容压缩成zip，然后删除该文件夹
* 修改合并cordova插件测试时，测试页面中对cordova-incl.js的引用没有修改的bug
* 修改对xplugin依赖的版本号
* 以test模板作为基础合并插件测试
* 移动xmen-cli的app模块到xface-cli中
* fetch插件的时候，内部模式加上reposet，便于xpluin使用link方式代替copy插件
* 在安装插件时，内部开发模式下options参数中加入repoSet属性
* 解决www/config.xml中preference标签合并到平台工程下的config.xml丢失部分数据的问题
* 解决windows平台上判断当前目录是否为xface工程时栈溢出的bug
* 在extra中暴露xplugin模块，以方便xmen中使用
* 在默认应用目录由www->xface3/helloxface之后，修改ios平台拷贝应用及js的逻辑
* fixed merge error
* 删掉误提的orig文件
* [CB-4621] Updating run and emulate commands to always provide default options
* Log requests in cordova serve
* Make cordova serve ignore dot files.
* Update "cordova serve" to work with promises refactoring
* [CB-4774] Display proper error if cordova prepare run not in project dir.
* Fixes a bug where cordova prepare bombs on a config missing a content element   - Changes an undefined check to falsey to cover random null value     returned from elementtree
* Bumping elementtree version to 0.1.5 to match plugman and support namespaced xml elements
* Fix cli.js tests broken by --silent change.
* [CB-4877]: Add basic logging, --silent flag.
* Fix busted test.
* First pass
* [CB-4883]: Graceful handling of lazy loading errors.
* reapplied change to add event mid build to allow mods to www folder pre_package  aka 775e969f9cc27a580123897d922121d564d4554d
* Remove two debugger; lines that snuck in.
* [CB-4604] Execute hooks directly (not .bat files) cross-platform
* Refactor to use Q.js promises in place of callbacks everywhere.
* [CB-4837]: Version 3.0.10. Depends on Plugman 0.12.x.
* Add missing license headers
* Update repo versions to 3.1.0-rc1
* Add `cordova update foo` command, with tests. [CB-4777]
* Add version numbers to `platform ls` output.
* [CB-4545] support for merges directory on both wp7 & wp8
* Rename CHANGELOG.md -> RELEASENOTES.md
* Fix expectation for platform ls test, for firefoxos
* Fix platforms.js: firefoxos.parser
* CB:4657 added ffos support to cli
* CB-4657: added staging_dir function to ff parser
* add default manifest properties for firefox os platform
* make the firefoxos parser actually build the project
* change firefoxos link to tarball
* add firefox platform
* [CB-4797] Fix a crash on undefined platform in path.
* [CB-4797] Add missing return statement in cordova serve
* Fix broken tests due to lazy requiring change.
* [CB-4797] Change `serve` command to serve platforms keyed off of path component.
* [CB-4793] Lazily require modules in some places.
* [CB-4325] Run platform installs in serial instead of in parallel
* Version updated to 3.0.10-dev
* [CB-4751] Updated version and changelog for 3.0.9
* [CB-4184]: Install plugins to platforms serially, not in parallel.
* Fix broken tests for platform ls after my recent change.
* [CB-3904]: platform ls now shows installed and available platforms.
* [WP8] add all files from www dir in actual project directory, not the common one (required in order to respect files from merges)
* 3.0.8
* 3.0.7
* [BlackBerry10] Fixed issue calling check_reqs script with space in path
* CB-4651: Allow default project template to be overridden by config.json
* [CB-4618] fix for xml parsing on windows, use xml-helpers from now on to parse xml
* [CB-4570] [BlackBerry10] Updating the parser not to overwrite config.xml
* [CB-4484] Do not force www app contents to come with an index.html.
* 3.0.6
* [CB-4572] Create parent dir for lazy_loaded local lib
* 3.0.5
* [CB-3191] Support for <content> tag in windows phone platforms.
* [CB-3191] Support for <content> tag (start page declaration) in BlackBerry10.
* [CB-3191] Updated README to reflect <content> tag support. Added support + specs for ios.
* Added tyrion to contributor list.
* [CB-3191] Added specs for config_parser changes to include <content> tag support. Updated stock template.
* Added partial support for "content" tag in config.xml "cordova prepare" now correctly handles the <content> tag. Android only.
* [CB-4532] Changes the CLI to only use optimist for verbose and version - Also adds limited unit tests for the CLI module
* support for merges directory in wp8
* [CB-4511] [BlackBerry10] Fix parser handling of config.xml
* [CB-4200] Add Bash command-line completion
* Add command-line completion script, with installation docs
* bumped to plugman 0.10.0. added optimist. refactored cli shim into own module.
* [CB-4273] Allows arguments pass-through to platform scripts - Splits platforms from options in the bin/cordova script effectively   changing the JS interface
* Changed references to windows phone repo from wp8 to wp
* [CB-4429] Fixed platform add for lazy loaded wp7
* On lazy load error, rmeove any created directories.
* adding latest plugman and bumping version
* updating plugman version and bumping version
* updating plugman version
* Updated README to include windows phone requirements
* added rubennortes email to contributor list.
* added @rubennorte to contributors list.
* Added a spec for [CB-4376].
* [CB-4376] Read config.xml after "before prepare" hooks being executed.
* adding fetch/search from registry and bumping version
* [CB-4322] Use npms proxy configuration (if set) in the lazy load module. Added proxy verbiage to README. Bumped dependency on plugman to 0.9.11. Bumped version to 3.0.1.
* 3.0.0!
* 3.0.0rc1-3. plugman dep bumped to 0.9.10.
* [CB-4286] rearranged
* [CB-4286] changed heading types from # to ##
* [CB-4286] Added known windows issue to README.md
* 3.0.0rc1-2. Bumped plugman to 0.9.9.
* 3.0.0rc1-1. bumped plugman dependency to 0.9.8. Fixes [CB-4283]
* added supported platforms to readme.
* [CB-4128] Change blackberry platform label to blackberry10.
* bumped plugman dep to 0.9.7 and set version to 3.0.0rc1
* [CB-4270] [BlackBerry10] Remove custom emulate logic (moving to cordova-blackberry)
* [CB-4268] [BlackBerry10] Remove custom BB run logic (moving to cordova-blackberry)
* updating lib refs to 30.0.rc1
* [CB-4207] Support for custom lib in windows.
* 2.9.7
* Revert "[CB-4270] [BlackBerry10] Remove custom emulate logic (moving to cordova-blackberry)"
* Revert "[CB-4268] [BlackBerry10] Remove custom BB run logic (moving to cordova-blackberry)"
* Fix for check_requirements function wrapper around errors.
* [CB-4270] [BlackBerry10] Remove custom emulate logic (moving to cordova-blackberry)
* [CB-4268] [BlackBerry10] Remove custom BB run logic (moving to cordova-blackberry)
* [CB-4267] [BlackBerry10] Fix callback chain for build
* 2.9.6
* [CB-4261] Add and test success callbacks for plugin commands.
* [wp-parsers] fixed deletion of cordova.js reference from .csproj
* [windowsphone] Add www contents from root www folder indead of the project one
* 2.9.5
* Added confix_xml function to windows phone parsers
* re-enabling ripple
* 2.9.4. Bumped request dep version from 2.12.x to 2.22.0.
* updated plugman dep to 0.9.3
* [CB-4077] updating plugman version to 0.9.0.
* [CB-4077] Fix tests for cordova-cli
* [CB-4077] Separate the actions of removing a plugin from a platform and removing the plugin entirely
* 2.9.3
* [CB-4182] Delay in lazy load module. Simplified with a stream implementation.
* adding search and fetch
* [CB-4148] Changing application name for ios needs to update all references to app name in native ios projects.
* 2.9.2. [CB-3931] Should ignore "CVS" folders for adding plugins.
* Merge master2->master
* Added missing bin scripts to windows phone
* Version 2.7.4
* [CB-3457] Fix Android to support dash in widget id.
* [CB-3419] Change plugin XML namespace to cordova.apache.org
* Version 2.7.3
* Add Windows support to Android platform-scripts.
* Add WP7 and WP8 support to cordova-cli.
* Add WP7 and WP8 platform files.
* Reorganize specs into cordova-cli/ and platform-script/
* Revert merge branch 'future' into 'master'
* Version 2.7.0 (npm 2.7.2)
* [CB-3238] Update cordova-blackberry to 2.7.0
* [CB-3238] Update cordova-android to 2.7.0
* [CB-3238] Update cordova-ios to 2.7.0
* [CB-3228] Fix 'cordova build blackberry' to use cordova.js
* [npm] Version 2.7.1-rc.1
* [CB-3227] Fix missing build script in iOS project.
* Version 2.7.0-rc.1
* CB-3183 handle missing plugins directory
* [npm] Version 2.6.2
* [npm] Version 2.6.1
* [#3050] Add cordova.platform.support(name, callback).
* [src] Remove unused platform parsers from compile command.
* updated version to 2.6.0
* CB-2811: shell and module-level hooks should receive project root as parameter.
* 2.6.0rc1 used for libs now. Bumped npm version to 2.6.0. added androids local.properties to gitignore.
* Version 2.7.0 (npm 2.7.2)
* [CB-3238] Update cordova-blackberry to 2.7.0
* [CB-3238] Update cordova-android to 2.7.0
* [CB-3238] Update cordova-ios to 2.7.0
* [CB-3228] Fix 'cordova build blackberry' to use cordova.js
* [npm] Version 2.7.1-rc.1
* [CB-3227] Fix missing build script in iOS project.
* Version 2.7.0-rc.1
* CB-3183 handle missing plugins directory
* [npm] Version 2.6.2
* [npm] Version 2.6.1
* [#3050] Add cordova.platform.support(name, callback).
* [src] Remove unused platform parsers from compile command.
* updated version to 2.6.0
* CB-2811: shell and module-level hooks should receive project root as parameter.
* 2.6.0rc1 used for libs now. Bumped npm version to 2.6.0. added androids local.properties to gitignore.
* Access config.xml from serve. Serve from platform dir only
* Fix `cordova prepare` now that plugin assets are copied on (un)install
* using plugman as a lib and updating package.json to use npm version
* Chaning plugman.js to main.js as run target
* [CB-3057] Change iOS platform to default to ARC.
* Fix 'plugin add' tests
* Move www/ and merges/ into app/.
* Install all installed plugins into a newly added platform
* No <platform> tags for JS-only plugins.
* Fix cordova plugin add with trailing slash
* Use the new style of plugman commands
* Make cordova plugin add rely on plugman
* Remove plugin_loader. prepare now calls plugman --prepare
* Tighter Ripple Ingeration
* Added prototype ripple support to command line.
* CB-2628: add link to getting started guides to readme.
* Update project path in example section
* Set missing create options
* [CB-2733] Consistently throw an Error object.
* CB-2702: show warning in bootstrap whenever root user is used to install, regardless of location of install.
* 2.5.5
* Handle spaces in emulate command.
* [CB-2635] Prevent console output in BlackBerry Parser tests.
* 2.5.4. removed an accidental checkin for local.properties
* plugin add/rm no longer change top-level www
* Automatic Javascript installation on prepare
* 2.5.3. added temp and fixture dirs to npmignore. this reduces npm payload from 60MB to 18MB.
* 2.5.2 package.json version.
* Added Michael Wolf to committers list, expanded on "merges" functionality in README
* test fixes and convention  tweaks following merging in "merges" functionality
* Revert "Revert "added merges to base cli documentation""
* Update .gitignore
* added merges to base cli documentation
* added merges to base cli documentation
* added merges tests
* shifted the update_overrides method out of build and into the parsers
* addition of merges functionality
* 2.5.0 (2.5.1 for npm). Uses ios, android, blackberry v2.5.0 now.
* Remove mention of specific cordova version from README, add requirement for xcode + cli xcode tools.
* Small readme tweak.
* 2.5.0rc1 (2.5.0 in package.json). Removed old test related to webworks scripts. Updated lbiraries to 2.5.0rc1. Added a VERSION file.
* 2.4.10
* woops syntax error in package.json
* CB-2445: detect global installs into root-only locations a bit more robustly. Warn noisily if this is so and provide specific instructions on how to fix.
* Added Tim to contributors list.
* No need to inject webworks.js script anymore
* 2.4.9. Fixed an issue where .gitignore was treated as a platform, added a utility "listPlatforms" function as a result. Fixed emulate specs following making a callback mandatory for all project parser update_project methods.
* Create now adds directories for prepapre+compile hooks.also added tests fro this.
* 2.4.8. Fixed a bug where i hardcoded a path. baaad. added test for it.
* 2.4.7. Fixed CLI tools since addition of compile + prepare commands (callbacks were not nested properly). Fixed tests since addition of compile + prepare commands. Rolled back jasmine version since there are issues in 1.2.x. Removed ./bin/notice and put it into bootstrap (for better windows support).
* Update README for prepare and compile.
* Separate build into prepare and compile.
* better errors in ios min checks
* Also adding output to error reporting for android min checks
* also getting rid of unsafe. not needed.
* 2.4.6. Adding output of xcode min reqs failing.
* 2.4.5. trying out the "unsafe-perm" config flag to fix permission weirdness
* package.json @ 2.4.4. tag for 2.4.0
* updating blackberry to 2.4.0
* updating to cordova-ios 2.4.0
* updating to cordova-android 2.4.0
* 2.4.3. Fixes with plugins. Tests are faster. woot.
* typo in help menu
* sped up emulate tests
* tests redone for build
* bumped up to shelljs 0.1.2
* setting ios scripts to executable
* more work for making tests fast
* sped up platform tests!
* fixes for at est cleanup
* tweaked up tests for project parsers.
* speeding up parser specs. refactoring a bit for tighter/clearner/faster tests.
* using cli tools, bootstrap now creates a project for use as text fixtures on install. bootstrap now uses the check_requirements function for platform-specific req checks on install as well. removed old cordova project fixture that was "manually" added.
* CB-2294: when adding platforms, the stock app assets would be left in the platform artifacts.
* CB-2219: moved "check requirements" type stuff into indiv platform handlers. removes dependency on android stuff on-install.
* CB-2299 part 2: apache RAT audit for CLI.
* CB-2299 part 1: apache RAT audit.
* adding npmignore to fix npm installs. removed checked-in local.properties file for android
* still trying to figure out issues with installing from npm...
* Run android config after install.
* Fix for android configuration.
* updating project.properties in cordova-android
* bumping to 2.4.0 package.json version
* support for 2.4.0rc1. "vendored" the platform libs in. added Gord and Braden as contributors. removed dependency on unzip and axed the old download-cordova code.
* Updating README to list support for <preference> tags in config.xml
* Refix CB-2237: Preferecne support in config.xml. Now doesnt clobber default prefs for android and ios.
* Fixes CB-2237: Support for <preference> elements in Android + iOS. Bump to 2.3.5.
* Added support for <preference> elements in config.xml (specs included).
* Fixes CB-2075: cordova-cli has trouble with projects under svn revision control. Added a "deleteSvnFolders" utility method to help with this.
* route "platforms" command to platform, same with "plugins" -> plugin
* Fix for CB-2074: problem when running in iPad 6.0 simulator. Empty space, multiline elements in .plist files cannot exist. Bumping to 2.3.3
* fixing bad install script again.. bumping to 2.3.2
* got rid of old script ref. fixes CB-2182
* updates for 2.3.0 support. bumped version. removed checked-in native project fixtures for tests, now on install create fixtures based on actual `create` scripts for platforms.
* updating readme
* updating version to match cordova versioning, and links to apache
* Updated moving of cordova.blackberry.js
* bumping to 0.1.14
* updating cordova-cli to work with 2.3.00rc1
* updating lib locations. bumping cordova to 2.3.0rc1. updating references to pluginstall
* Remove commented junk from serve.spec.js
* Add spec tests for `serve` command.
* Add search paths to `serve`. Add return values useful for testing.
* Add `serve` command.
* Bump to 0.1.12. Fix to #68: can use either `uri` or `origin` attribute to denote domain whitelist (noted as such in readme).
* Example hook from @dpogue, thanks buddy. Fixes #70.
* Attempt for #69.
* Fix for #68, proper support for blackberry-10 whitelist. Bumped npm version.
* Fixes #65: whitespace <string> elements mess up running on ios simulator.
* bumping support for 2.2.0
* bump to 0.1.10. Whitelist support added across platforms. Bumped pluginstall dependency to version 0.5.3.
* added "remove all access elements" functionality to config_parser. added whitelist support to blackberry
* android projects now adhere to whitelist specified by config.xml
* ios projects now adhere to whitelist specified by config.xml
* adding access whitelist api to config_parser
* fixes to plugin failure output
* bumping to 0.1.9, and bumped pluginstall dependency to 0.5.2
* Fixes #61: hook folders that do not exist blow things up. Now ignore hook folders that no longer exist.
* Axed "docs" command. Updated example usage in help txt a bit. Fixes #59
* Fixes #57 - issue with folders with spaces in them. Still need to wait for android to fix its debug/cordova scripts for full fix, though.
* 0.1.8
* Fixes for download-based lib pull. gotta chmod all the shizz.
* Explicitly fail on platform-add for ios if xcode is not installed or not of minimum requirements. Closes #52.
* Removed dependency on git (closes #55 #53 and #13). Using request + unzip libs to handle downloading the cordova libs.
* adding notice regarding permissions for tool upon install
* 0.1.6
* Fixes #47. Removed node-plist as dependency. Used simpler regex to do string/replace.
* 0.1.5
* Update pluginstall + xcode dependencies. Fixes #49 and #50
* 0.1.4
* Closes #21. Support modifying package identifier via config.xml
* modifying package name (bundle id) for ios projects.
* package id changes supported in android
* cleared up platfrom+plugin add/rm multiple commands
* 0.1.3
* better handling of cli params. closes #30.
* handling multiple platform and plugin add/removes.
* updates to specs following default value changes. (#42)
* worked out the readme regarding hooks/events
* Remove weird characters from default package name + app name. Was throwing errors on older macs. Fixes #42
* landed module-level events/hooks. tweaks to tests
* how to submit bugs.
* 0.1.1
* Fixes #40: undefined not a function when adding ios (would also apply to adding BlackBerry).
* added note about android tools on path to readme
* re-added info in readme about permissions for global node modules
* readme tweaks and 0.1.0!
* plugin hooks
* added hooks for build, emulate and platform commands.
* basic hook info in the readme
* before and after build hooks
* added hooker module for handling project-specific before/after hooks
* moving to a .cordova directory
* readme updates. removed old info. pruned it down so its not so giant. bumped to 0.0.9
* Allow specifying one or more platforms to build/emulate. Fixes #32. Closes #38.
* Allow specifying a platform when building.
* Added spec tests for the aliased commands.
* Allow list and rm as alternatives.
* i am a javascript nub.
* mike as contributor
* Fixes #35 Add www/ to Android test fixture.
* Correct case for the ncallbacks require.
* 0.0.8
* tests should not test native project specifics, only that lower-level modules (project parsers) are invoked to do their tasks. emulate specs added!
* added update_www and update_project methods to project parsers. moved native project specifics to project parser modules (such as retrieving BB env config for deployment).
* platforms related to a project are no longer added to config.xml. instead tool looks at dir tree under ./platforms. simpler.
* added blackberry shortcut for project creation to speed up specs
* updated help txt to reflect -v flag
* added -v switch to print version. specs too
* build specs for bb10 support
* 0.0.7
* updated test bootstrap + tests for bb10 support.
* fixes for bb support
* start of bb support. for platform + build commands
* blackberry platform support added.
* added blackberry project parser + specs in prep for bb support
* removing trycatches
* added uncaughtException handler rather than abruptly calling process.exit
* added check for git command availability. Updated my contact email in the contributors list.
* bumping to 0.0.6
* Fixes issue #26: android 2.1.0 tab breaks create script. also refactored spec helper a bit so that we can turn off the android project create shortcut
* swapped out wrench for shelljs
* bumped to 0.0.5
* Added documentation for plugin removal.
* added build command invoking changes to app data via config.xml specs. also added plugin removal and specs
* bumping to 0.0.4 and added mike + darryl as contributors
* axed asyncblock. tweaked test_bootstrap
* removed asyncblock. using shelljs where appropriate.
* reworked build flow. build tests now run fast! start of incorporating shelljs
* moved lib cloning to util module. `npm test` now makes sure libraries are all cloend down before running tests.
* Output indented XML.
* modified add platform: created a variable for checkout tag, moved get platform logic to seperate function, added error checking when platform already exists, added error checking for invalid platform name. updated instructions to not install as sudo. changed lstatsync to existsSync
* sped up tests by catching calls to android/bin/create at the child_process.exec level. gnarly, but saves test run time by about 50% on my machine
* added documentation on how to edit app name via config.xml. related specs to configuring with config.xml
* adding ios project parser module and related specs. hooked in config name extraction -> interpolation into native project for ios.
* config.xml -> native project configurator modules. moar tests.
* add platform config logic made simpler
* stub of build specs related to config.xml interpolation. added a bunch of fixtures for tests.
* updating package.json to point to anis pluginstall
* removing dot file stuff.. unnecessary abstraction.
* readme todo updates. now links to github issues.
* added a dot parser, start of syncing up config.xml between user and client
* .cordova file now a basic manifest
* updating (temporarily) github url for project, bumping version for npm publish!
* fleshed out plugin addition. tests!
* tweaking readme, added a plugin.xml parser module.
* Test audit and dropped todo based on ML feedback.
* doc tweaks
* removing leading $ from CLI examples. updated command formats based on Brian's feedback.
* more tweaks, mostly hygiene
* merging in changes from Filip, Michal, and Brian
* more editing
* working on the documentation a bit
* dropping todo
* Update doc/help.txt
* added ios project creation tests
* test updates. omg was shooting myself in the foot with jasmine helpers.argh!
* java man. wtf
* replace non-words in package name with underscore
* update android project name on each build
* fixed tests. small logic fix. updates to readme
* forgot asyncblock function wrapper, updated readme
* asyncblock is better. explicitly checks out tag 2.1.0rc1 now after cloning libs.
* todos and asyncblock-ing build command to wait for debug cmd to finish
* using npm-published version of pluginstall. line drawn in sand regarding minimum cordova version. added asyncblock for flow control. fixed an issue with express deprecation warning.
* Add .gitignore.
* fixed up tests a bit
* Most of the way there for #2 (config.xml as user endpoint for modifying app metadata). Fixes #6: can specify app name at create time (and optionally id/package name as well).
* and tweak expectation to go along with that last change
* use exists instead of lstat to check for dir existence. throw instead of console.
* proper refactor, express to deps as it was missing
* helper file makes this a bit more sane.
* commas man. wtf
* reasonable timeout values for tests. callback invocation for plugin support. fixing plugin listing issue
* Missing platform tag
* Issue #5: use the hello-cordova sample application
* todos, callback for plugin module, moar tests.
* On pluginstall, copy in plugin www assets into common project www.
* help updates, sped up tests, routing certain calls to null so as to not overload exec buffer.
* added plugin stuff to readme
* changed command modules to throw, and cli script to handle passing over to console. fixed tests.
* plugin support!
* pluginstall basics
* Copying in common www assets at build time
* build and emulate working.
* Project creation works.
* split out cordova subcommands build and platform into separate files
* contribution section to readme
* finished off platform specs and impl
* split out code into smaller modules, platform command now works. tweaked help txt.
* added platform specs and basic work
* using wrench, fixed up tests
* jasmine, start of www template
* tweaks to readme, begone mocha, welcome back jasmine
* added docs about docs
* added local docs server
* this should not be here
* gratuitous colors
* betterish child process
* slightly better help system
* build and emulate working
* create working w/ new structure
* adding placeholder for tests, vendoring the cordova lib, and seperation of cli from module code
* adding cordova client code
* updating README.rd
* updating README
* Initial commit
* gitignore and test updates
* update with latest refactor
* First cordova-client commit
* Update README.md with project organization.
* Update README.md with commit instructions.
* Add .gitignore.
* added some clarity for those seeking it
* Add README
* 将应用路径由www改为xface3/helloxface
* 将xface-cli对plugman的依赖改为对xplugin的依赖
* 针对android平台prepare时，修改拷贝xface.js及应用的目的路径
* 将创建工程时使用的模板应用地址替换为gitweb上的仓库地址
* 修改更新ios平台xface.js时的js源文件路径
* [ios]为方便开发者，增加默认配置“UsePlayerMode”
* 内部模式下，执行prepare命令时不去下载平台引擎lib工程
* 在内部开发模式下，针对ios平台使用--shared参数来调用create脚本
* 在内部开发模式下，修改创建平台工程时所进行的操作
* 在extra中暴露xml-helpers，另外修改一处理代码错误
* 添加extra.js，用于暴露额外的功能给xmen
* 修改默认reviewboard配置
* 修改版本号为1.0.1
* Checkout cordova-cli3.0.8源码
* 修改一处描述错误
* 继续修改源码中使用cordova的地方，使用xface代替
* 重命名cordova.js->xface.js
* 将cli命令名由cordova改为xface，修改package.json配置文件
* 导入cordova cli 3.0的源码
