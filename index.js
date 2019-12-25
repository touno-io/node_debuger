const chalk = require('chalk')
const f = require('date-format')

const production = !(process.env.NODE_ENV === 'development')
const groupSize = 6

const formatDate = production ? 'yyyy-MM-dd hh:mm:ss.SSS' : 'hh:mm:ss.SSS'
let scopeSize = 6
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

module.exports = (scopeName = null) => {
  const logWindows = (scope, icon, status, color, msg) => {
    let msg2 = [ chalk.gray(f.asString(formatDate, new Date())), color(icon) ]
    msg2.push(color(groupPadding(status, groupSize, 'padStart')))
    if (scope) {
      if (scope.length > scopeSize) scopeSize = scope.length
      msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
      msg2.push(chalk.cyan('»'))
    }
    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
  }

  const logLinux = (scope, icon, status, msg) => {
    let msg2 = [ f.asString(formatDate, new Date()), (!icon ? '…' : icon) ]
    if (scope) msg2.push(`[${scope.toUpperCase()}]`)

    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
    return Promise.resolve()
  }

  return {
    log (...msg) {
      return production ? logWindows(scopeName, '…', 'debug', chalk.cyan.bold, msg) : logLinux(scopeName, '…', 'debug', msg)
    },
    start (...msg) {
      return production ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', 'start', msg)
    },
    success (...msg) {
      return production ? logWindows(scopeName, '●', 'finish', chalk.green.bold, msg) : logLinux(scopeName, '●', 'finish', msg)
    },
    warning (...msg) {
      return production ? logWindows(scopeName, '▲', 'warn', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', 'warn', msg)
    },
    info (...msg) {
      return production ? logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg) : logLinux(scopeName, null, 'info', msg)
    },
    async error (ex) {
      if (!ex) return
      let [ , excep ] = /at.*?\((.*?)\)/i.exec(ex.stack) || []
      let win = [ excep ? `${excep} > ${ex.message}` : ex.message ]
      let msg = [ (excep ? `${ex.message} :: ${excep}` : ex.message || ex) ]

      return production ? logWindows(scopeName, 'х', 'error', chalk.red.bold, win) : logLinux(scopeName, 'х', 'error', msg)
    }
  }
}
