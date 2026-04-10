// app.js
App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: 'cloud1-5g5etfrv38da117f',
      traceUser: true,
    })
    this._login()
  },

  _login() {
    wx.cloud.callFunction({
      name: 'login',
      success: res => {
        console.log('[login] success', res.result)
        this.globalData.openid = res.result.openid
      },
      fail: err => {
        console.error('[login] fail', err)
      }
    })
  },

  globalData: {
    openid: null,
    userInfo: null,
    // 订阅消息模板 ID 配置
    tmplIds: {
      expireNotify: 'vpVFbO8Gu5Nhxbc0ok1CJsrNRTgfu3_Qy0_jp2qwedM'
    }
  }
})
