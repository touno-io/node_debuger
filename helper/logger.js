const chalk = require('chalk')
const moment = require('moment')
const Time = require('./time')
const { DevMode, DebugMode } = require('./variable')

const groupSize = 6
const scopeSize = 9
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

module.exports = (scopeName = null, Audit = null) => {
  let measure = null

  const logWindows = (scope, icon, title, color, msg) => {
    let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
    msg2.push(color(groupPadding(title, groupSize, 'padStart')))
    if (scope) {
      msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
      msg2.push(chalk.cyan('»'))
    }
    if (DevMode || DebugMode) console.log(...(msg2.concat(msg)))
    if (!Audit) return Promise.resolve()
    return new Audit({ created: new Date(), type: 'logger', scope: scope, message: msg.join(' '), tag: [ 'windows', scope ] }).save()
  }

  const logLinux = (scope, icon, msg) => {
    let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
    if (scope) msg2.push(`[${scope.toUpperCase()}]`)

    if (DevMode || DebugMode) console.log(...(msg2.concat(msg)))
    if (!Audit) return Promise.resolve()
    return new Audit({ created: new Date(), type: 'logger', scope: scope, message: msg.join(' '), tag: [ 'linux', scope ] }).save()
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
      return DevMode ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', msg)
    },
    success (...msg) {
      if (measure) msg.push(`(${measure.total()})`)
      measure = null
      return DevMode ? logWindows(scopeName, '●', 'success', chalk.green.bold, msg) : logLinux(scopeName, '●', msg)
    },
    warning (...msg) {
      measure = null
      return DevMode ? logWindows(scopeName, '▲', 'warning', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', msg)
    },
    info (...msg) {
      return DevMode ? logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg) : logLinux(scopeName, null, msg)
    },
    async error (ex) {
      if (!ex) return
      if (ex instanceof Error) {
        if (DevMode) {
          const Youch = require('youch')
          let output = await new Youch(ex, {}).toJSON()
          console.log(require('youch-terminal')(output))
          return Promise.resolve()
        } else {
          let excep = /at.*?\((.*?)\)/i.exec(ex.stack) || []
          let result1 = logLinux(scopeName, 'х', [ ex.message.indexOf('Error:') === 0 ? ex.message.replace('Error:', 'ERROR-Message:') : `ERROR-Message: ${ex.message}` ])
          logLinux(scopeName, 'х', [ `ERROR-File: ${excep[1] ? excep[1] : 'N/A'}`, ex.message ])
          return result1
        }
      } else {
        let msg = [ ex.toString() ]
        if (measure) msg.push(`(${measure.total()})`)
        return DevMode ? logWindows(scopeName, 'х', 'error', chalk.red.bold, msg) : logLinux(scopeName, 'х', msg)
      }
    }
  }
}
