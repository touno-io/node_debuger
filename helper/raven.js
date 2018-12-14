const Raven = require('raven')
const terminate = require('terminate')
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
const onExit = async pid => new Promise((resolve, reject) => {
  terminate(pid, err => err ? reject(err) : resolve())
})

const onKillProcess = async (pid, OnExitProcess) => {
  logger.log(`Got SIGINT:${pid}.  Press Control-C to exit.`)
  if (!(OnExitProcess instanceof Function)) throw new Error('OnExitProcess not Promise.')
  try {
    await OnExitProcess()
  } catch (ex) {
    await logger.error(ex)
    report.error(ex)
  }
  await onExit(pid)
}

module.exports = {
  ...report,
  async Tracking (OnAsyncCallback, IsExitAfterError = true) {
    // if (!config || !name) throw new Error('Raven not set configuration.')
    try {
      if (!(OnAsyncCallback instanceof Function)) throw new Error('Tracking not Promise.')
      await OnAsyncCallback()
    } catch (ex) {
      await logger.error(ex)
      report.error(ex)
      if (IsExitAfterError) await onExit(process.pid)
    }
  },
  ProcessClosed (proc, OnExit) {
    proc.on('SIGINT', async () => onKillProcess(proc.pid, OnExit))
    proc.on('SIGTERM', async () => onKillProcess(proc.pid, OnExit))
  },
  install (data, OnExit = async () => {}) {
    config = data
    process.on('SIGINT', async () => onKillProcess(process.pid, OnExit))
    process.on('SIGTERM', async () => onKillProcess(process.pid, OnExit))
    Raven.config(!DevMode && process.env.RAVEN_CONFIG).install((err, initialErr) => {
      logger.error(err || initialErr).then(() => {
        report.error(err || initialErr)
        onExit(process.pid)
      })
    })
  }
}
