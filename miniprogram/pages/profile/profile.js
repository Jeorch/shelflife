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

  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      this.setData({ userInfo: e.detail.userInfo, hasUserInfo: true })
      app.globalData.userInfo = e.detail.userInfo
    }
  },
})
