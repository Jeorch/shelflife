// pages/profile/profile.js
const app = getApp()

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
  },

  onShow() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo, hasUserInfo: true })
    }
  },

  onLogin() {
    if (app.globalData.openid) {
      const userInfo = {
        avatarUrl: '/assets/icons/user.png',
        nickName: '微信用户'
      }
      this.setData({ userInfo, hasUserInfo: true })
      app.globalData.userInfo = userInfo
    } else {
      wx.showToast({ title: '正在初始化登录，请稍后再试', icon: 'none' })
    }
  },
})
