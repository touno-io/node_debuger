# @touno-io/debuger

**debuger beautiful message logs and insert log to mongodb.**

[![version](https://img.shields.io/npm/v/@touno-io/debuger.svg?style=flat-square)](https://www.npmjs.org/package/@touno-io/debuger)
[![downloads](https://img.shields.io/npm/dt/@touno-io/debuger.svg?style=flat-square)](https://www.npmjs.org/package/@touno-io/debuger)
[![status](https://img.shields.io/travis/touno-io/node-debuger/master.svg?style=flat-square)](https://travis-ci.org/touno-io/node-debuger)
![activity](https://img.shields.io/github/commit-activity/y/touno-io/node-debuger.svg?style=flat-square)
![DUB](https://img.shields.io/dub/l/vibe-d.svg?style=flat-square)

### Requirement Environment
```ini
RAVEN_CONFIG=https://{PUBLIC_KEY}:{SECRET_KEY}@sentry.io/{PROJECT_ID}
MONGODB_DEBUGER=true
MONGODB_SERVER=localhost:27017
```

When `MONGODB_DEBUGER` is no setting in the environment, module will not insert a database.

### Installation
```bash
npm i @touno-io/debuger
// or
yarn i @touno-io/debuger
```

----------
### Logger
##### `object` debuger
  - **log** `function(...msg)` message log normal
  - **start** `function(...msg)` start log and color green.
  - **success** `function(...msg)` start log and color green.
  - **info** `function(...msg)` info log and color blue.
  - **error** `function(...msg)` error log and color red.

**sample**
```javascript
import debuger from '@touno.io/debuger'

const logger = await debuger('test')
// and not set 'MONGODB_DEBUGER' 
const logger = debuger('test')

logger.log('message')
logger.info('message')
logger.start('begin')
logger.success('end')
logger.warning('error type warning.')
logger.error(new Error('Error'))

```

----------
### License
MIT © 2018 Touno™
