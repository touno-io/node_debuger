const chalk = require('chalk')
const moment = require('moment')
const { logging } = require('@touno-io/db/schema')

const DevMode = !(process.env.NODE_ENV === 'production')
const logSaved = process.env.MONGODB_DEBUGER === 'true'
const logServer = process.env.MONGODB_SERVER || process.env.MONGODB_URI

if (logSaved && !logServer) {
  // eslint-disable-next-line no-console
  console.log(`Please set env name 'MONGODB_URI' or 'MONGODB_SERVER'.`)
  process.exit(1)
}

let groupSize = 5
let scopeSize = 5
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

module.exports = (scopeName = null) => {
  const logWindows = (scope, icon, status, color, msg) => {
    let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
    if (status && status.length > groupSize) groupSize = status.length
    msg2.push(color(groupPadding(status, groupSize, 'padStart')))
    if (scope) {
      if (scope.length > scopeSize) scopeSize = scope.length
      msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
      msg2.push(chalk.cyan('»'))
    }
    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
    if (!logSaved) return Promise.resolve()
    let data = { service: 'logging', status, scope, message: msg.join(' '), group: 'windows', raw: msg2.concat(msg).join(' ') }
    const { Audit } = logging.get()

    if (!Audit) return Promise.reject('Please await or call logger after scope.')
    return new Audit(data).save()
  }

  const logLinux = (scope, icon, status, msg) => {
    let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
    if (scope) msg2.push(`[${scope.toUpperCase()}]`)

    process.stdout.write(msg2.concat(msg).join(' ') + '\n')
    if (!logSaved) return Promise.resolve()

    let data = { service: 'logging', status, scope, message: msg.join(' '), group: 'linux', raw: msg2.concat(msg).join(' ') }
    const { Audit } = logging.get()
    
    if (!Audit) return Promise.reject('Please await or call logger after scope.')
    return new Audit(data).save()
  }

  const obj = {
    log (...msg) {
      return DevMode ? logWindows(scopeName, '…', 'debug', chalk.cyan.bold, msg) : logLinux(scopeName, '…', 'debug', msg)
    },
    start (...msg) {
      return DevMode ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', 'start', msg)
    },
    success (...msg) {
      return DevMode ? logWindows(scopeName, '●', 'success', chalk.green.bold, msg) : logLinux(scopeName, '●', 'success', msg)
    },
    warning (...msg) {
      return DevMode ? logWindows(scopeName, '▲', 'warning', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', 'warning', msg)
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
  return logSaved ? logging.open().then(() => obj) : obj
}
