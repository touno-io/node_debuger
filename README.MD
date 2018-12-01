# @touno-io/debuger


### Requirement Environment
```ini
RAVEN_CONFIG=https://{PUBLIC_KEY}:{SECRET_KEY}@sentry.io/{PROJECT_ID}
MONGODB_DEBUGER_URI=mongodb://localhost:27017/?authMode=scram-sha1&authSource=admin
```
When `MONGODB_DEBUGER_URI` == `undefined` module not insert log to mongodb and like `RAVEN_CONFIG`. 

----------
### Helper
##### `object` debuger
  - **log** `function(...msg)` message log normal
  - **start** `function(...msg)` start log and color green.
  - **success** `function(...msg)` start log and color green.
  - **info** `function(...msg)` info log and color blue.
  - **error** `function(...msg)` error log and color red.

**sample**
```javascript
import { debuger } from '@touno.io/debuger'

debuger.log('')
debuger.success('completed.')
debuger.error(new Error('Error Test'))
```

##### `object` Raven
  - **set** `function(config)` set config Raven object on exception.
  - **error** `function(ex)` reporting error to sentry.
  - **warning** `function(ex)` reporting warning to sentry.

##### `object` Other
  - **DevMode** `boolean` Development.
  - **DebugMode** `boolean` Server Debuging logs.
  - **IsWindows** `boolean` check windows version
  - **IsLinux** `boolean` check linux version

----------
### License
MIT © 2018 Touno™
