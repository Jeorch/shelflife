// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'shelflife-env', // TODO: 替换为你的云环境 ID
      traceUser: true,
    })
    this.globalData = {}
    this._login()
  },

  _login() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.log('[login] success', res.result)
        this.globalData.openid = res.result.openid
        this.globalData.userInfo = res.result.userInfo
      },
      fail: err => {
        console.error('[login] fail', err)
      }
    })
  },

  globalData: {
    openid: null,
    userInfo: null
  }
})
