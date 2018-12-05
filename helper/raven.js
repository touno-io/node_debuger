const Raven = require('raven')
const { DevMode } = require('./variable')
const logger = require('./logger')('raven')

let config = null

let report = {
  warning (ex) {
    Raven.captureMessage(ex instanceof Error ? ex : new Error(ex), { level: 'warning' })
  },
  error (ex) {
    Raven.captureException(ex instanceof Error ? ex : new Error(ex), config)
  }
}

const killProcess = async (proc, OnExitProcess) => {
  logger.log('Got SIGINT.  Press Control-C to exit.')
  if (!(OnExitProcess instanceof Function)) throw new Error('OnExitProcess not Promise.')
  try {
    await OnExitProcess()
  } catch (ex) {
    await logger.error(ex)
    report.error(ex)
  }
  proc.exit()
}

module.exports = {
  ...report,
  async Tracking (OnAsyncCallback, IsNoExitAfterError = false) {
    // if (!config || !name) throw new Error('Raven not set configuration.')
    try {
      if (!(OnAsyncCallback instanceof Function)) throw new Error('Tracking not Promise.')
      await OnAsyncCallback()
    } catch (ex) {
      await logger.error(ex)
      report.error(ex)
      if (!IsNoExitAfterError) process.exit(0)
    }
  },
  ProcessClosed (proc, OnExitProcess) {
    proc.on('SIGINT', async () => killProcess(proc, OnExitProcess))
    proc.on('SIGTERM', async () => killProcess(proc, OnExitProcess))
  },
  install (data, log) {
    config = data
    process.on('SIGINT', async () => killProcess(process, async () => {}))
    process.on('SIGTERM', async () => killProcess(process, async () => {}))
    Raven.config(!DevMode && process.env.RAVEN_CONFIG).install((err, initialErr) => {
      logger.error(err || initialErr).then(() => {
        report.error(err || initialErr)
        process.exit(1)
      })
    })
  }
}
