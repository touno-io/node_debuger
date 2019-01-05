const Raven = require('raven')
const { DevMode } = require('./variable')
const logger = require('./logger')('raven')
let pkg = {}
let report = {
  warning (ex) {
    Raven.captureMessage(ex instanceof Error ? ex : new Error(ex), { level: 'warning' })
  },
  error (ex) {
    Raven.captureException(ex instanceof Error ? ex : new Error(ex))
  }
}

const killProcess = async (proc, OnExitProcess, manual) => {
  if (!manual) logger.log('Got SIGINT.  Press Control-C to exit.')
  if (OnExitProcess instanceof Function) {
    try {
      await OnExitProcess()
    } catch (ex) {
      await logger.error(ex)
      report.error(ex)
    }
  }
  proc.exit()
}

const Tracking = async (OnAsyncCallback, IsNoExitAfterError = false) => {
  try {
    if (!(OnAsyncCallback instanceof Function)) throw new Error('Tracking not Promise.')
    await OnAsyncCallback(pkg)
  } catch (ex) {
    await logger.error(ex)
    if (OnAsyncCallback instanceof Function) report.error(ex)
    if (!IsNoExitAfterError) process.exit(0)
  }
}

module.exports = {
  ...report,
  Tracking,
  ProcessClosed (proc, OnExitProcess) {
    proc.on('SIGINT', async () => killProcess(proc, OnExitProcess, true))
    proc.on('SIGTERM', async () => killProcess(proc, OnExitProcess, true))
  },
  install (data, OnExitProcess) {
    pkg = data.pkg ? require(data.pkg) : data
    process.on('SIGINT', async () => killProcess(process, OnExitProcess))
    process.on('SIGTERM', async () => killProcess(process, OnExitProcess))
    Raven.config(!DevMode && process.env.RAVEN_CONFIG).install((err, initialErr) => {
      logger.error(err || initialErr).then(() => {
        report.error(err || initialErr)
        process.exit(1)
      })
    })
    return { Tracking }
  }
}
