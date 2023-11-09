## 1. 准备

首先，需要确保你已经安装了 node，然后我们来初始化一个项目

```bash
mkdir mycli-demo & cd mycli-demo
npm init -y
```

## 2. 添加一个简单的命令

在 package.json 中添加 bin 配置，<code style="color: #c7254e">mycli</code>是我们 cli 工具提供的命令名称，对应的值是文件入口，我们这里指向<code style="color: #c7254e">bin/cli.js</code>文件

```diff
{
  "name": "mycli-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
+ "bin":{
+   "mycli": "./bin/cli.js"
+ },
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

在项目中创建<code style="color: #c7254e">bin/cli.js</code>，并打印一段文字

```js
#!/usr/bin/env node

console.log("i'm a cli");
```

> **第一行很重要，用来指明运行环境**

此时我们可以再控制台运行<code style="color: #c7254e">mycli</code>

你可能会有错误：控制台找不到我们的<code style="color: #c7254e">cli</code>工具，这是因为我们在使用一个工具的时候必须安装它，例如你没有安装<code style="color: #c7254e">npm</code>的时候去使用也会遇到同样的错误。

由于我们的<code style="color: #c7254e">mycli</code>并没有发布，因此可以借助<code style="color: #c7254e">npm link</code>或者<code style="color: #c7254e">yarn link</code>选择本地安装，执行：

```bash
npm link

yarn link
```

> 如果你觉得 npm link 和 yarn link 比较繁琐，你也可以使用[yalc](https://www.npmjs.com/package/yalc) 进行本地调试

然后再执行<code style="color: #c7254e">mycli</code>,就可以看到控制台输出了<code style="color: #c7254e">bin/cli.js</code>中打印的内容

至此，我们已经了解<code style="color: #c7254e">cli</code>工具是如何作用的，下面我们在此基础上做一些改进，让他可以处理参数，彩色打印，显示加载中等等功能

## 3. 处理参数

很多时候我们需要在运行<code style="color: #c7254e">cli</code>工具时携带参数，那么如何获取到这个参数呢？

在<code style="color: #c7254e">node</code>程序中，通过<code style="color: #c7254e">process.argv</code>可获取到命令的参数，以数组返回

可以看到其实我们已经拿到各个参数，但是这样的获取方式不太直观，所以我们引入一个第三方 npm 包帮我们处理这部分功能：<code style="color: #c7254e">commander</code>,参考文档：[commander 文档](https://github.com/tj/commander.js/blob/HEAD/Readme_zh-CN.md)

```bash
npm i commander -S
```

我们在<code style="color: #c7254e">bin/cli.js</code>添加如下代码

```diff
#!/usr/bin/env node
+ const program = require('commander')

console.log("i'm a cli")

// 打印参数
console.log(process.argv)

+ program
+  .command('create <projectName>')
+  .description('create a new project')
+  .alias('c')
+  .option('-u, --umi', 'umi react template')
+  .option('-v, --vite', 'vite react template')
+  .option('-w, --webpack', 'webpack react template')
+  .action((projectName, options) => {
+    console.log(projectName, options)
+ })
+ program.version('1.0.0').parse(process.argv)
```

到目前为止，我们可以直观的获取到命令的参数，你可以在控制台尝试一下

## 4. 交互式命令

有的时候我们可能需要在命令行工具中融入一些交互，根据用户的输入或者选择生成一些东西或者做相应的操作。我们可以引入一个<code style="color: #c7254e">npm</code>包来帮我们实现：[inquirer](https://www.npmjs.com/package/inquirer)

```bash
npm i inquirer -S
```

我们在<code style="color: #c7254e">bin/cli.js</code>添加如下代码

```diff
#!/usr/bin/env node
const program = require('commander')
+ const inquirer = require('inquirer')

console.log("i'm a cli")

// 打印参数
console.log(process.argv)

program
  .command('create <projectName>')
  .description('create a new project')
  .alias('c')
  .option('-u, --umi', 'umi react template')
  .option('-v, --vite', 'vite react template')
  .option('-w, --webpack', 'webpack react template')
  .action((projectName, options) => {
    console.log(projectName, options)
+   inquirer
+     .prompt([
+       {
+         type: 'list',
+         name: 'frameTemplate',
+         message: '请选择框架类型',
+         choices: ['vite react', 'umi react', 'webpack react']
+       }
+     ])
+     .then((answer) => {
+       console.log(answer)
+     })
  })
program.version('1.0.0').parse(process.argv)

```

我们在控制台运行

```bash
mycli create test -r
```

至此，我们完成了交互式命令，下面我将完成一个模板的下载，一起动手吧！

## 5. 完成一个模板下载

在前面的步骤中，我们发现我们的日志打印不是很友好，我们可以通过<code style="color: #c7254e">log-symblos</code> <code style="color: #c7254e">chalk</code> <code style="color: #c7254e">ora</code> 帮我们做一些提示信息的优化

| npm 包名称  | 作用                     | 官网                                                              | 备注                                                                                                   |
| :---------- | ------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| chalk       | 修改控制台中字符串的样式 | [chalk](https://github.com/chalk/chalk#readme)                    | 字体样式、颜色、背景颜色                                                                               |
| log-symbols | 各种日志级别的彩色符号   | [log-symbols](https://github.com/sindresorhus/log-symbols#readme) | 从 5 版本开始使用 ESM[Release v5.0.0](https://github.com/sindresorhus/log-symbols/releases/tag/v5.0.0) |
| ora         | 终端加载效果             | [ora](https://github.com/sindresorhus/ora#readme)                 |                                                                                                        |

> 由于 log-symbols 从 5 版本开始使用 ESM，所以我们这里使用 4 版本

```bash
npm i chalk log-symbols@4 ora -S
```

要下载一个 github 仓库的代码，我们需要引入<code style="color: #c7254e">download-git-repo</code>, [download-git-repo - npm](https://www.npmjs.com/package/download-git-repo)

```bash
npm i download-git-repo -S
```

我们来实现一个简单的下载功能

```diff
#!/usr/bin/env node
const program = require('commander')
const inquirer = require('inquirer')
+ const ora = require('ora')
+ const download = require('download-git-repo')
+ const { errLog, successLog } = require('../src/utils/log.js')

console.log("i'm a cli")

// 打印参数
console.log(process.argv)

program
  .command('create <projectName>')
  .description('create a new project')
  .alias('c')
  .option('-r, --react', 'react template')
  .option('-v, --vue', 'vue template')
  .option('-v2, --vue2', 'vue2 template')
  .option('-v3, --vue3', 'vue3 template')
  .action((projectName, options) => {
    console.log(projectName, options)
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'frameTemplate',
          message: '请选择框架类型',
          choices: ['Vue3', 'Vue2', 'React']
        }
      ])
      .then((answer) => {
        console.log(answer)
+       const spinner = ora()
+       spinner.text = '正在下载模板...'
+       spinner.start()
+       download(
+         '',
+         projectName,
+         { clone: true },
+         function (err) {
+           if (err) {
+             spinner.fail('模板下载失败')
+             errLog(err)
+           } else {
+             spinner.succeed('模板下载成功')
+             successLog('项目初始化完成')
+           }
+         }
+       )
      })
  })
program.version('1.0.0').parse(process.argv)
```

在控制台输入

```bash
 mycli create test -r
```

可以看到模板下载成功

> 如果下载不成功，请详细查看<code style="color: #c7254e">download-git-repo</code>的文档：[download-git-repo - npm](https://www.npmjs.com/package/download-git-repo)

至此，我们已经实现了一个简单的模板仓库下载功能。更多的功能大家可以自行尝试。

## 6. 项目优化

如果我们有多个命令，那么我们就需要写多个

```js
program
  .command("")
  .description("")
  .alias("")
  .option("")
  .action(() => {
    // 命令处理
  });
```

1. 因为这部分代码被重复使用，我们自然而然想到了遍历，首先声明一个 list 变量用来维护我们的命令配置，在 src 新建 command-config.js 文件，该文件导出配置

```js
const COMMAND_LIST = [
  {
    command: "create <projectName>",
    description: "create a new project",
    alias: "c",
    options:  ['-u, --umi', 'umi react template'],
      ['-v, --vite', 'vite react template'],
      ['-w, --webpack', 'webpack react template'],,
    action: require("./commandHandler/create"),
    examples: ['-u', '--umi', '-v', '--vite', '-w, --webpack'].map((v) => `create projectName ${v}`),
  },
];

module.exports = COMMAND_LIST;
```

修改<code style="color: #c7254e">bin/cli.js</code>

```js
/**
 * 注册option
 * @param {Object} commander commander实例
 * @param {Object} option 每个命令配置对象
 * @returns commander
 */
const registerOption = (commander, option) => {
  return option && option.length ? commander.option(...option) : commander;
};
/**
 * 注册action
 * @param {Object} commander commander实例
 * @param {Object} commandEle 每个命令配置对象
 * @returns commander
 */
const registerAction = (commander, commandEle) => {
  const { command, description, alias, options, action } = commandEle;
  const c = commander
    .command(command) // 命令的名称
    .description(description) // 命令的描述
    .alias(alias);
  // 循环options
  options && options.reduce(registerOption, c);
  c.action(action);
  return commander;
};

// 循环创建命令
COMMAND_LIST.reduce(registerAction, program);
```

2. 由于命令处理部分代码量较大，所以我们考虑把命令处理的函数提取在一个文件夹下，我们在 src 下新建 commandHandler 目录，并新建一个 create.js，把 create 命令的处理代码放进 create.js

3. 为了更方便使用，我们改写 mycli --help 命令

```js
// help命令 把example显示出去
const help = () => {
  console.log("\n");
  console.log(chalk.green("如何使用:"));
  COMMAND_LIST.forEach((command, index) => {
    console.log(
      "  ",
      chalk.keyword("orange")(index + 1),
      `${command.command}命令`
    );
    command.examples.forEach((example) => {
      console.log(`     - mycli ${example}`);
    });
  });
};

program.on("-h", help);
program.on("--help", help);
```

4. 为了更方便使用，我们加入对 npx 的支持

```diff
{
  "name": "mycli-demo",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "bin":{
     "mycli": "./bin/cli.js"
  },
  "scripts": {
+   "start": "./bin/cli.js",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

至此我们完成了一个简易版 cli 工具的开发，后续优化版本将会直接发布至 npm
