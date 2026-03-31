// pages/add/add.js
const cloud = require('../../utils/cloud')

const CATEGORIES = ['食品', '药品', '护肤品', '日用品', '其他']

Page({
  data: {
    categories: CATEGORIES,
    form: {
      name: '',
      category: '食品',
      image: '',
      productionDate: '',
      expiryDate: '',
      shelfLifeDays: '',
      note: '',
    },
    imageLocalPath: '',
    submitting: false,
  },

  onNameInput(e) {
    this.setData({ 'form.name': e.detail.value })
  },

  onCategoryChange(e) {
    this.setData({ 'form.category': CATEGORIES[e.detail.value] })
  },

  onProductionDateChange(e) {
    this.setData({ 'form.productionDate': e.detail.value })
  },

  onExpiryDateChange(e) {
    this.setData({ 'form.expiryDate': e.detail.value })
  },

  onShelfLifeInput(e) {
    this.setData({ 'form.shelfLifeDays': e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({ imageLocalPath: tempFilePath })
      },
    })
  },

  onRemoveImage() {
    this.setData({ imageLocalPath: '', 'form.image': '' })
  },

  async onSubmit() {
    const { form, imageLocalPath } = this.data
    if (!form.name.trim()) {
      wx.showToast({ title: '请填写物品名称', icon: 'none' })
      return
    }
    if (!form.expiryDate) {
      wx.showToast({ title: '请选择到期日期', icon: 'none' })
      return
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })
    try {
      let imageFileId = ''
      if (imageLocalPath) {
        const ext = imageLocalPath.split('.').pop()
        const cloudPath = `items/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: imageLocalPath })
        imageFileId = uploadRes.fileID
      }
      await cloud.call('itemAdd', { ...form, image: imageFileId })
      wx.hideLoading()
      wx.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => wx.navigateBack(), 1200)
    } catch (e) {
      wx.hideLoading()
      console.error('[onSubmit]', e)
      wx.showToast({ title: '保存失败，请重试', icon: 'error' })
    } finally {
      this.setData({ submitting: false })
    }
  },
})
