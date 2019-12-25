const chalk = require('chalk')
const moment = require('moment')

const DevMode = !(process.env.NODE_ENV === 'production')
const groupSize = 6

let scopeSize = 6
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

module.exports = (scopeName = null) => {
  const logWindows = (scope, icon, status, color, msg) => {
    let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
    msg2.push(color(groupPadding(status, groupSize, 'padStart')))
    if (scope) {
      if (scope.length > scopeSize) scopeSize = scope.length
      msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
      msg2.push(chalk.cyan('»'))
    }
    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
  }

  const logLinux = (scope, icon, status, msg) => {
    let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
    if (scope) msg2.push(`[${scope.toUpperCase()}]`)

    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
    return Promise.resolve()
  }

  return {
    log (...msg) {
      return DevMode ? logWindows(scopeName, '…', 'debug', chalk.cyan.bold, msg) : logLinux(scopeName, '…', 'debug', msg)
    },
    start (...msg) {
      return DevMode ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', 'start', msg)
    },
    success (...msg) {
      return DevMode ? logWindows(scopeName, '●', 'finish', chalk.green.bold, msg) : logLinux(scopeName, '●', 'finish', msg)
    },
    warning (...msg) {
      return DevMode ? logWindows(scopeName, '▲', 'warn', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', 'warn', msg)
    },
    info (...msg) {
      return DevMode ? logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg) : logLinux(scopeName, null, 'info', msg)
    },
    async error (ex) {
      if (!ex) return
      let [ , excep ] = /at.*?\((.*?)\)/i.exec(ex.stack) || []
      let win = [ excep ? `${excep}\n   > ${ex.message}` : ex.message ]
      let msg = [ (excep ? `${ex.message} :: ${excep}` : ex.message || ex) ]

      return DevMode ? logWindows(scopeName, 'х', 'error', chalk.red.bold, win) : logLinux(scopeName, 'х', 'error', msg)
    }
  }
}
