const chalk = require('chalk')
const moment = require('moment')
const Time = require('./../time')
const { DevMode, DebugMode } = require('../variable')

const groupSize = 6
const scopeSize = 8
const groupPadding = (msg, size, pad) => {
  return msg.length > size ? msg.substr(0, size) : msg[pad](size, ' ')
}

const logWindows = async (scope, icon, title, color, msg) => {
  let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), color(icon) ]
  msg2.push(color(groupPadding(title, groupSize, 'padStart')))
  if (scope) {
    msg2.push(groupPadding(scope, scopeSize, 'padEnd'))
    msg2.push(chalk.cyan('»'))
  }
  if (DevMode || DebugMode) console.log(...(msg2.concat(msg)))
  if (DevMode) return
  const db = require('./../mongodb')
  let { Audit } = await db.open()
  if (!Audit) return
  await new Audit({ created: new Date(), type: 'logger', scope: scope, message: msg.join(' '), tag: [ 'window', scope ] }).save()
}

const logLinux = async (scope, icon, msg) => {
  let msg2 = [ moment().format('YYYY-MM-DD HH:mm:ss.SSS'), (!icon ? '…' : icon) ]
  if (scope) msg2.push(`[${scope.toUpperCase()}]`)

  if (DevMode || DebugMode) console.log(...(msg2.concat(msg)))
  if (DevMode) return
  const db = require('./../mongodb')
  let { Audit } = await db.open()
  if (!Audit) return
  await new Audit({ created: new Date(), type: 'logger', scope: scope, message: msg.join(' '), tag: [ 'window', scope ] }).save()
}

module.exports = scopeName => {
  let measure = null
  return {
    async log (...msg) {
      if (!DevMode) return
      let msg2 = [ chalk.gray(moment().format('HH:mm:ss.SSS')), chalk.gray.bold('…') ]
      msg2.push(measure ? groupPadding(measure.nanoseconds(), groupSize, 'padStart') : chalk.gray.bold(groupPadding('debug', groupSize, 'padStart')))
      if (scopeName) {
        msg2.push(groupPadding(scopeName, scopeSize, 'padEnd'))
        msg2.push(chalk.cyan('»'))
      }
      console.log(...(msg2.concat(msg)))
    },
    async start (...msg) {
      measure = new Time()
      if (DevMode) await logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg); else await logLinux(scopeName, '○', msg)
    },
    async success (...msg) {
      if (measure) msg.push(`(${measure.total()})`)
      if (DevMode) await logWindows(scopeName, '●', 'success', chalk.green.bold, msg); else await logLinux(scopeName, '●', msg)
      measure = null
    },
    async warning (...msg) {
      if (DevMode) await logWindows(scopeName, '▲', 'warning', chalk.yellow.bold, msg); else await logLinux(scopeName, '▲', msg)
      measure = null
    },
    async info (...msg) {
      if (DevMode) await logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg); else await logLinux(scopeName, null, msg)
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
          await logLinux(scopeName, 'х', [ ex.message.indexOf('Error:') === 0 ? ex.message.replace('Error:', 'ERROR-Message:') : `ERROR-Message: ${ex.message}` ])
          await logLinux(scopeName, 'х', [ `ERROR-File: ${excep[1] ? excep[1] : 'N/A'}`, ex.message ])
          require('../raven').error(ex)
        }
      } else {
        let msg = [ ex.toString() ]
        if (measure) msg.push(`(${measure.total()})`)
        if (DevMode) await logWindows(scopeName, 'х', 'error', chalk.red.bold, msg); else await logLinux(scopeName, 'х', msg)
      }
    }
  }
}
