const chalk = require('chalk')
const f = require('date-format')
const cli = require('cli-progress')

const isWin = process.platform === 'win32'
const isProduction = !(process.env.NODE_ENV === 'development')
const groupSize = 6

const formatDate = isProduction ? 'yyyy-MM-dd hh:mm:ss.SSS' : 'hh:mm:ss.SSS'
let scopeSize = 5
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

  let bSingleBar = null
  return {
    log (...msg) {
      return isWin ? logWindows(scopeName, '…', 'debug', chalk.cyan.bold, msg) : logLinux(scopeName, '…', 'debug', msg)
    },
    start (...msg) {
      return isWin ? logWindows(scopeName, '○', 'start', chalk.cyan.bold, msg) : logLinux(scopeName, '○', 'start', msg)
    },
    success (...msg) {
      return isWin ? logWindows(scopeName, '●', 'finish', chalk.green.bold, msg) : logLinux(scopeName, '●', 'finish', msg)
    },
    warn (...msg) {
      return isWin ? logWindows(scopeName, '▲', 'warn', chalk.yellow.bold, msg) : logLinux(scopeName, '▲', 'warn', msg)
    },
    wait (msg = 'downloading', max = 100, barSize = 25) {
      let msg2 = [ chalk.gray(f.asString(formatDate, new Date())), chalk.magentaBright('▫'), chalk.magentaBright(groupPadding('wait', groupSize, 'padStart')) ]

      if (scopeName) {
        if (scopeName.length > scopeSize) scopeSize = scopeName.length
        msg2.push(groupPadding(scopeName, scopeSize, 'padEnd'))
        msg2.push(chalk.cyan('»'))
      }

      if (isWin) {
        bSingleBar = new cli.SingleBar({
          format: msg2.join(' ') + ` ${msg} ({value}/{total}) ${chalk.gray('{bar}')} {percentage}%`,
          barsize: barSize,
          hideCursor: true
        }, cli.Presets.rect)
  
        bSingleBar.start(max, 0)
      } else {
        msg2.push(msg)
        msg2.push(`(${max}/${max})`)
        logLinux(scopeName, '▫', 'wait', msg2)
      }
      return bSingleBar
    },
    increment (value = 1) {
      if (bSingleBar) bSingleBar.increment(value)
    },
    update (value = 0) {
      if (bSingleBar) bSingleBar.update(value)
    },
    stop () {
      if (bSingleBar) bSingleBar.stop()
      bSingleBar = null
    },
    info (...msg) {
      return isWin ? logWindows(scopeName, '╍', 'info', chalk.blue.bold, msg) : logLinux(scopeName, null, 'info', msg)
    },
    error (ex) {
      if (!ex) return
      if (ex.response) {
        const { status, statusText } = ex.response
        let msg = `${ex.config.method.toUpperCase()} ${ex.config.url} > ${status} ${statusText}`
        return isWin ? logWindows(scopeName, 'х', 'res', chalk.red.bold, msg) : logLinux(scopeName, 'х', 'res', msg)
      } else if (ex.request) {
        let msg = `${ex.config.method.toUpperCase()} ${ex.config.url} > server could not be found.`
        return isWin ? logWindows(scopeName, 'х', 'req', chalk.red.bold, msg) : logLinux(scopeName, 'х', 'req', msg)
      } else {
        let [ , excep ] = /at.*?\((.*?)\)/i.exec(ex.stack) || []
        let win = [ excep ? `${excep.replace(__dirname + '\\', '')} > ${ex.message}` : ex.message ]
        let msg = [ (excep ? `${ex.message} :: ${excep.replace(__dirname + '\\', '')}` : ex.message || ex) ]
        return isWin ? logWindows(scopeName, 'х', 'error', chalk.red.bold, win) : logLinux(scopeName, 'х', 'error', msg)
      }
    }
  }
}
