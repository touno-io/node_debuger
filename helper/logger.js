const chalk = require('chalk')
const moment = require('moment')
const Time = require('./time')
const { touno } = require('@touno-io/db/mongo')
const { DevMode } = require('./variable')

const groupSize = 7
const scopeSize = 9
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

module.exports = (scopeName = null, isSaveLog = false) => {
  let measure = null

  const logWindows = (scope, icon, title, color, msg) => {
    let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
    msg2.push(color(groupPadding(title, groupSize, 'padStart')))
    if (scope) {
      msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
      msg2.push(chalk.cyan('»'))
    }
    console.log(...(msg2.concat(msg)))
    if (!isSaveLog || !process.env.MONGODB_SERVER) return Promise.resolve()

    let data = { created: new Date(), type: title, scope: scope, message: msg.join(' '), tag: [ 'windows', scope, 'logger' ] }
    return touno.open().then(({ LogAudit }) => new LogAudit(data).save())
  }

  const logLinux = (scope, icon, title, msg) => {
    let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
    if (scope) msg2.push(`[${scope.toUpperCase()}]`)

    console.log(...(msg2.concat(msg)))
    if (!isSaveLog || !process.env.MONGODB_SERVER) return Promise.resolve()

    let data = { created: new Date(), type: title, scope: scope, message: msg.join(' '), tag: [ 'linux', scope, 'logger' ] }
    return touno.open().then(({ LogAudit }) => new LogAudit(data).save())
  }

  return {
    log (...msg) {
      if (!DevMode) return
      let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), chalk.gray.bold('…') ]
      msg2.push(measure ? groupPadding(measure.nanoseconds(), groupSize, 'padStart') : chalk.gray.bold(groupPadding('debug', groupSize, 'padStart')))
      if (scopeName) {
        msg2.push(groupPadding(scopeName, scopeSize, 'padEnd'))
        msg2.push(chalk.cyan('»'))
      }
      console.log(...(msg2.concat(msg)))
    },
    start (...msg) {
      measure = new Time()
      return DevMode ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', 'start', msg)
    },
    success (...msg) {
      if (measure) msg.push(`(${measure.total()})`)
      measure = null
      return DevMode ? logWindows(scopeName, '●', 'success', chalk.green.bold, msg) : logLinux(scopeName, '●', 'success', msg)
    },
    warning (...msg) {
      measure = null
      return DevMode ? logWindows(scopeName, '▲', 'warning', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', 'warning', msg)
    },
    info (...msg) {
      return DevMode ? logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg) : logLinux(scopeName, null, 'info', msg)
    },
    async error (ex) {
      if (!ex) return
      if (ex instanceof Error) {
        if (DevMode) {
          const Youch = require('youch')
          let output = await new Youch(ex, {}).toJSON()
          console.log(require('youch-terminal')(output))
        } else {
          let excep = /at.*?\((.*?)\)/i.exec(ex.stack) || []
          return logLinux(scopeName, 'х', 'error', [ 'ERROR::', excep[1] ? excep[1] : 'N/A', '\n', ex.message, '\n' ])
        }
      } else {
        let msg = [ ex.toString() ]
        if (measure) msg.push(`(${measure.total()})`)
        return DevMode ? logWindows(scopeName, 'х', 'error', chalk.red.bold, msg) : logLinux(scopeName, 'х', 'error', msg)
      }
    }
  }
}
