// pages/profile/profile.js
const app = getApp()
const cloud = require('../../utils/cloud')

Page({
  data: {
    userInfo: null,
    hasUserInfo: false,
    editing: false,
    editNickName: '',
    stats: { total: 0, normal: 0, near: 0, expired: 0 },
    categoryStats: [],
  },

  onShow() {
    this._loadUser()
    this._loadStats()
  },

  async _loadUser() {
    if (!app.globalData.openid) return
    try {
      const res = await cloud.call('userGet', {})
      if (res.user) {
        const userInfo = {
          nickName: res.user.nickName || '微信用户',
          avatarUrl: res.user.avatarUrl || '',
        }
        this.setData({ userInfo, hasUserInfo: true })
        app.globalData.userInfo = userInfo
      }
    } catch (e) {
      console.error('[_loadUser]', e)
    }
  },

  async _loadStats() {
    if (!app.globalData.openid) return
    try {
      const res = await cloud.call('itemList', {})
      const items = res.list || []
      const { getItemStatus } = require('../../utils/date')
      const stats = { total: items.length, normal: 0, near: 0, expired: 0 }
      const categoryMap = {}
      items.forEach(item => {
        const s = getItemStatus(item.expiryDate)
        stats[s] = (stats[s] || 0) + 1
        const cat = item.category || '其他'
        categoryMap[cat] = (categoryMap[cat] || 0) + 1
      })
      const categoryStats = Object.keys(categoryMap).map(name => ({
        name,
        count: categoryMap[name],
      }))
      this.setData({ stats, categoryStats })
    } catch (e) {
      console.error('[_loadStats]', e)
    }
  },

  // 新版头像选择（基础库 2.21.2+）
  onChooseAvatar(e) {
    const avatarUrl = e.detail.avatarUrl
    this.setData({ 'userInfo.avatarUrl': avatarUrl })
    this._saveUserInfo({ avatarUrl })
  },

  onStartEdit() {
    this.setData({ editing: true, editNickName: this.data.userInfo.nickName })
  },

  onNickNameInput(e) {
    this.setData({ editNickName: e.detail.value })
  },

  // 新版昵称输入框失焦时触发（type="nickname"）
  onNickNameBlur(e) {
    const nickName = e.detail.value.trim() || this.data.userInfo.nickName
    this.setData({ editNickName: nickName })
  },

  async onSaveNickName() {
    const nickName = this.data.editNickName.trim()
    if (!nickName) {
      wx.showToast({ title: '昵称不能为空', icon: 'none' })
      return
    }
    await this._saveUserInfo({ nickName })
    this.setData({ 'userInfo.nickName': nickName, editing: false })
    app.globalData.userInfo = { ...app.globalData.userInfo, nickName }
  },

  onCancelEdit() {
    this.setData({ editing: false })
  },

  async _saveUserInfo(data) {
    try {
      await cloud.call('userUpdate', data)
    } catch (e) {
      console.error('[_saveUserInfo]', e)
      wx.showToast({ title: '保存失败', icon: 'error' })
    }
  },

  onLogin() {
    if (!app.globalData.openid) {
      wx.showToast({ title: '正在初始化，请稍后', icon: 'none' })
      return
    }
    // 触发登录并写入默认用户信息
    cloud.call('login', {}).then(() => {
      this._loadUser()
    }).catch(e => {
      console.error('[onLogin]', e)
    })
  },
})
