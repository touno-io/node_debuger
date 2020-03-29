# @touno-io/debuger

**debuger beautiful message logs and insert log to mongodb.**

[![version](https://img.shields.io/npm/v/@touno-io/debuger.svg?style=flat-square)](https://www.npmjs.org/package/@touno-io/debuger)
[![downloads](https://img.shields.io/npm/dt/@touno-io/debuger.svg?style=flat-square)](https://www.npmjs.org/package/@touno-io/debuger)
[![status](https://img.shields.io/travis/touno-io/node-debuger/master.svg?style=flat-square)](https://travis-ci.org/touno-io/node-debuger)
![activity](https://img.shields.io/github/commit-activity/y/touno-io/node-debuger.svg?style=flat-square)
![DUB](https://img.shields.io/dub/l/vibe-d.svg?style=flat-square)

### Installation
```bash
npm i @touno-io/debuger
// or
yarn i @touno-io/debuger
```

----------
### Preview

![Alt text](/docs/preview.gif?raw=true "Preview")

### Logger
##### `object` debuger
  - **log** `function(...msg)` message log normal
  - **start** `function(...msg)` start log and color green.
  - **success** `function(...msg)` start log and color green.
  - **warn** `function(...msg)` start log and color green.
  - **info** `function(...msg)` info log and color blue.
  - **error** `function(...msg)` error log and color red.

##### `object` progress cli
  - **wait** `function(msg, max = 100, sizeBar = 25)` message and progress bar.
  - **increment** `function(value)` add value.
  - **update** `function(value)` set value.
  - **stop** `function()` start log and color green.
  - **info** `function(...msg)` info log and color blue.
  - **error** `function(...msg)` error log and color red.

**sample**
```javascript
// es6
import debuger from '@touno.io/debuger'
const logger = await debuger('test')

// javascript
const logger = require('@touno.io/debuger')('test')

logger.log('message')
logger.info('message')
logger.start('begin')
logger.success('end')
logger.warn('error type warning.')
logger.error(new Error('Error'))

// progress
logger.wait('begin', 100)
logger.update(50)
logger.stop()
```

----------
### License
MIT © 2018 Touno™
