const debuger = require('./helper/debuger')
const serv = require('./helper/variable')
const Time = require('./helper/time')
const Raven = require('./helper/raven')

if (serv.DevMode) {
  try {
    require.resolve('youch')
    require.resolve('youch-terminal')
  } catch (e) {
    console.log(`Please Install modules youch and youch-terminal. 'npm i --save-dev youch youch-terminal'`)
    process.exit(e.code)
  }
}

module.exports = {
  ...serv,
  debuger,
  Time,
  Raven
}
