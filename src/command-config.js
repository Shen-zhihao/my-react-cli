const COMMAND_LIST = [
  {
    command: 'create <projectName>',
    description: 'create a new project',
    alias: 'c',
    options: [
      ['-u, --umi', 'umi react template'],
      ['-v, --vite', 'vite react template'],
      ['-w, --webpack', 'webpack react template'],
    ],
    action: require('./commandHandler/create'),
    examples: ['-u', '--umi', '-v', '--vite', '-w, --webpack'].map((v) => `create projectName ${v}`)
  }
]

module.exports = COMMAND_LIST
