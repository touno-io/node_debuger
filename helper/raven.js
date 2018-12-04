const Raven = require('raven')
const { DevMode } = require('./variable')

let config = null
let logger = console
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
  try { await OnExitProcess() } catch (ex) { report.error(ex) }
  proc.exit()
}

module.exports = {
  warning: report.warning,
  error: report.error,
  async Tracking (OnAsyncCallback, IsExitAfterError = false) {
    // if (!config || !name) throw new Error('Raven not set configuration.')
    // if (!(OnAsyncCallback instanceof Function)) throw new Error('Tracking not Promise.')
    try {
      await OnAsyncCallback()
    } catch (ex) {
      report.error(ex)
      if (!IsExitAfterError) process.exit(0)
    }
  },
  ProcessClosed (proc, OnExitProcess) {
    proc.on('SIGINT', async () => killProcess(proc, OnExitProcess))
    proc.on('SIGTERM', async () => killProcess(proc, OnExitProcess))
  },
  install (data, log) {
    config = data
    logger = log
    Raven.config(!DevMode && process.env.RAVEN_CONFIG).install((err, initialErr) => {
      logger.error(err || initialErr)
      process.exit(1)
    })
  }
}
