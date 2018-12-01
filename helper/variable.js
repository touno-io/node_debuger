module.exports = {
  DevMode: !(process.env.NODE_ENV === 'production'),
  DebugMode: !!process.env.NODE_DEBUG,
  IsWindows: process.platform === 'win32',
  IsLinux: process.platform !== 'win32'
}
