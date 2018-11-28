module.exports = {
  DevMode: !(process.env.NODE_ENV === 'production'),
  IsWindows: process.platform === 'win32',
  IsLinux: process.platform !== 'win32',
}
