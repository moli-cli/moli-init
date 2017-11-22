var request = require('request');
var chalk = require('chalk');
var inquirer = require('inquirer');
var path = require('path');
var pathExists = require('path-exists');
var fs = require('fs');
var download = require('download-git-repo');
var spawn = require('cross-spawn');
var log = require('../utils/moliLogUtil')

function getHelp() {
    log.log(" Usage : ");
    log.log("");
    log.log(" moli init");
    log.log("");
    process.exit(0);
}

function getVersion() {
    log.log(require("../package.json").version);
    process.exit(0);
}

/**
 * 创建用户项目信息
 */
function createProjectInfo(projectPath) {
    var projectName = path.basename(projectPath);
    var projectInfoFilePath = path.join(projectPath, '.project');
    var projectInfo = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<projectDescription>\n' +
        '    <name>' + projectName + '</name>\n' +
        '    <comment></comment>\n' +
        '    <projects>\n' +
        '    </projects>\n' +
        '    <buildSpec>\n' +
        '    </buildSpec>\n' +
        '    <natures>\n' +
        '    <nature>com.yonyou.uap.ump.project.webProjectNature</nature>\n' +
        '    <nature>com.yonyou.uap.ump.project.nature</nature>\n' +
        '    <nature>org.eclipse.jdt.core.javanature</nature>\n' +
        '    </natures>\n' +
        '</projectDescription>';
    // 将projectInfo写入.project文件中
    fs.writeFileSync(projectInfoFilePath, projectInfo);
}

/**
 * 创建移动app配置信息
 */
function createMobileAppConfig(projectPath) {
    var projectName = path.basename(projectPath);
    var mobileAppConfigFile = path.join(projectPath, 'mobileAppConfig.json');
    var mobileAppConfigObj = {};
    // app构建设置
    mobileAppConfigObj.buildSetting = {
        "appName": projectName,
        "projectName": projectName,
        "packageName": "com.yonyou.moli." + projectName,
        "versionName": "1.0.0",
        "versionCode": "1",
        "versionBuild": "1.0.0",
        "debuggerEnable": "false",
        "startPage": "index.html",
        "reinforcement": "false",
        "sandbox": "false",
        "statusBarTheme": "summer.Animations.NoTitleBar.FullScreen",
        "cordovaPlugins": [
            {
                "name": "cordova-plugin-compat",
                "parameters": []
            }
        ]
    };
    // app中andnroid相关设置
    mobileAppConfigObj.androidSetting = {
        "showLaunch": true,
        "webContentsDebuggingEnabled": true,
        "showCrashLog": false,
        "openKeyBackListener": false
    };
    // mDoctor设置
    mobileAppConfigObj.mDoctor = {
        "openPosition": true,
        "openMDoctor": true,
        "channelKey": "",
        "appKey": "",
        "wifiAutoSync": true
    };
    // launchOptions设置
    mobileAppConfigObj.launchOptions = {
        "autoHideLaunch": false,
        "type": ""
    };
    // app默认设置
    mobileAppConfigObj.statusBarStyle = "dark";
    mobileAppConfigObj.navigationBarHidden = true;
    mobileAppConfigObj.statusBarAppearance = true;
    mobileAppConfigObj.fullScreen = true;
    mobileAppConfigObj.orientation = "portrait";
    mobileAppConfigObj.messageIntercept = "";
    // 将projectInfo写入config.json中
    fs.writeFileSync(mobileAppConfigFile, JSON.stringify(mobileAppConfigObj));
}

/**
 * 初始化moli project
 */
function init() {
    // 获取可以创建的模板列表
    log.info("Available official moli porject templates:");
    var repoNameData = [];
    request({
        url: 'https://api.github.com/users/yymoli/repos',
        headers: {
            'User-Agent': 'moli'
        }
    }, function (err, res, body) {
        if (err) console.log(err);
        var requestBody = JSON.parse(body);
        if (Array.isArray(requestBody)) {
            requestBody.forEach(function (repo, index) {
                // console.log(
                //     (index + 1) + ')' + '  ' + chalk.yellow('★') +
                //     '  ' + chalk.blue(repo.name) +
                //     ' - ' + repo.description);
                if (repo.name.match("tpl-")) {
                    repoNameData.push(`${repo.name} - ${repo.description}`);
                }
            });
            //TODO 人机交互
            inquirer.prompt([{
                type: 'list',
                name: 'selectRepo',
                message: 'Please select :',
                choices: repoNameData
            }]).then(function (answers) {
                var selectName = answers.selectRepo.split(' - ')[0];
                var questions = [{
                    type: 'input',
                    name: 'selectName',
                    message: 'default project name :',
                    default: function () {
                        return 'moli-react-project-demo';
                    }
                }];
                inquirer.prompt(questions).then(function (answers) {
                    var name = answers.selectName,
                        template = selectName;
                    var root = path.resolve(name);
                    if (!pathExists.sync(name)) {
                        fs.mkdirSync(root);
                    } else {
                        console.log(chalk.red(`Directory ${name} Already Exists.`));
                        process.exit(0);
                    }
                    log.info(`Downloading ${template} please wait.`);
                    var downloadStartTime = new Date().getTime();
                    var downloadTimer = setInterval(function () {
                        log.logInLine(".", "#00bb00");
                    }, 1000);
                    //TODO 开始下载
                    download(`yymoli/${template}`, `${name}`, function (err) {
                        if (!err) {
                            // 完成下载
                            clearInterval(downloadTimer);
                            var downloadUsedTime = (new Date().getTime() - downloadStartTime) / 1000;
                            console.log("");
                            log.info(`Download ${name} Done.Used Time：${downloadUsedTime}s`);
                            // 这里需要初始化配置文件和项目文件
                            log.info("Write Project Info To .project File!");
                            createProjectInfo(root);
                            log.info("Write Mobile App Config To mobileAppConfig.json File!");
                            createMobileAppConfig(root);
                            inquirer.prompt([{
                                type: 'confirm',
                                message: 'Automatically install NPM dependent packages?',
                                name: 'ok'
                            }]).then(function (res) {
                                var npmInstallChdir = path.resolve('.', name);
                                if (res.ok) {
                                    log.info(`Install NPM dependent packages,please wait.`);
                                    var npmInstallStartTime = new Date().getTime();
                                    //TODO 选择自动安装
                                    process.chdir(npmInstallChdir);
                                    var args = ['install'].filter(function (e) {
                                        return e;
                                    });
                                    var proc = spawn('npm', args, {
                                        stdio: 'inherit'
                                    });
                                    proc.on('close', function (code) {
                                        var npmInstallUsedTime = (new Date().getTime() - npmInstallStartTime) / 1000;
                                        if (code !== 0) {
                                            log.error('`npm ' + args.join(' ') + '` failed');
                                            return;
                                        }
                                        log.info(`NPM package installed.Used Time：${npmInstallUsedTime}s`);
                                    });
                                } else {
                                    log.info(`\nCancel the installation of NPM dependent package.\nPlease run \'cd ${name} && npm install\' manually.`);
                                }
                            });
                        } else {
                            log.error(requestBody.message);
                        }
                    });
                });
            });
        }
    });
}

module.exports = {
    plugin: function (options) {
        // 判断基本命令信息
        if (options.argv.h || options.argv.help) {
            getHelp();
        }
        if (options.argv.v || options.argv.version) {
            getVersion();
        }
        //
        init();
    }
}
