const inquirer = require('inquirer');
const ora = require('ora');
const download = require('download-git-repo');
const { errLog, successLog } = require('../utils/log.js');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const SOURCESURL = require('../sources');

/**
 * 下载函数，用于下载模板并安装依赖
 * @param {string} answer - 用户输入答案
 * @param {string} projectName - 项目名称
 * @returns {Promise<void>} 无返回值
 */

const downloadFn = async (answer, projectName) => {
  const url = SOURCESURL[answer?.frameTemplate];
  const spinner = ora()
  spinner.text = '正在下载模板...'
  spinner.start()
  try {
    await new Promise((resolve, reject) => {
      download(`direct:${url}`, projectName, { clone: true }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });

    spinner.text = '模板下载成功,正在安装依赖'

    // 进入目录
    process.chdir(projectName);

    // 执行npm install命令
    const { stdout, stderr } = await exec('npm install');
    console.log(stdout);
    spinner.succeed('依赖完成')
    successLog('项目初始化完成')
    return
  } catch (err) {
    spinner.fail('模板下载失败')
    console.error(err);
    errLog(err)
  }
}

/**
 * 创建项目
 * @param {string} projectName - 项目名称
 * @param {Object} options - 选项对象
 * @param {string} options.frameTemplate - 框架类型
 * @returns {void}
 */
const create = (projectName, options) => {
  const key = Object.keys(options)?.[0];
  if (key) {
    console.log(`您的项目名称是:${projectName},使用了${key}配置`)
    downloadFn({ 'frameTemplate': key }, projectName)
    return
  }
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'frameTemplate',
        message: '请选择框架类型',
        choices: ['vite react', 'umi react', 'webpack react']
      }
    ])
    .then((answer) => downloadFn(answer, projectName))
}

module.exports = create
