// pages/detail/detail.js
const { getItemStatus, getDaysLeft, formatDate } = require('../../utils/date')
const cloud = require('../../utils/cloud')

const CATEGORIES = ['食品', '药品', '护肤品', '日用品', '其他']

Page({
  data: {
    id: '',
    item: null,
    editing: false,
    categories: CATEGORIES,
    form: {},
    imageLocalPath: '',
    submitting: false,
  },

  async onLoad(options) {
    const id = options.id
    this.setData({ id })
    await this.loadItem(id)
  },

  async loadItem(id) {
    wx.showLoading({ title: '加载中...' })
    try {
      const res = await cloud.call('itemList', { id })
      const raw = res.list && res.list[0]
      if (!raw) { wx.showToast({ title: '物品不存在', icon: 'error' }); return }
      const item = {
        ...raw,
        status: getItemStatus(raw.expiryDate),
        daysLeft: getDaysLeft(raw.expiryDate),
      }
      this.setData({ item, form: { ...raw } })
    } catch (e) {
      console.error('[loadItem]', e)
      wx.showToast({ title: '加载失败', icon: 'error' })
    } finally {
      wx.hideLoading()
    }
  },

  onEditTap() {
    this.setData({ editing: true, imageLocalPath: '' })
  },

  onCancelEdit() {
    this.setData({ editing: false, form: { ...this.data.item }, imageLocalPath: '' })
  },

  onNameInput(e) { this.setData({ 'form.name': e.detail.value }) },
  onCategoryChange(e) { this.setData({ 'form.category': CATEGORIES[e.detail.value] }) },
  onProductionDateChange(e) { this.setData({ 'form.productionDate': e.detail.value }) },
  onExpiryDateChange(e) { this.setData({ 'form.expiryDate': e.detail.value }) },
  onShelfLifeInput(e) { this.setData({ 'form.shelfLifeDays': e.detail.value }) },
  onNoteInput(e) { this.setData({ 'form.note': e.detail.value }) },

  onChooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: res => this.setData({ imageLocalPath: res.tempFiles[0].tempFilePath }),
    })
  },

  onRemoveImage() {
    this.setData({ imageLocalPath: '', 'form.image': '' })
  },

  async onSave() {
    const { form, imageLocalPath, id } = this.data
    if (!form.name.trim()) { wx.showToast({ title: '请填写物品名称', icon: 'none' }); return }
    if (!form.expiryDate) { wx.showToast({ title: '请选择到期日期', icon: 'none' }); return }
    this.setData({ submitting: true })
    wx.showLoading({ title: '保存中...' })
    try {
      let imageFileId = form.image || ''
      if (imageLocalPath) {
        const ext = imageLocalPath.split('.').pop()
        const cloudPath = `items/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const uploadRes = await wx.cloud.uploadFile({ cloudPath, filePath: imageLocalPath })
        imageFileId = uploadRes.fileID
      }
      await cloud.call('itemUpdate', { id, ...form, image: imageFileId })
      wx.hideLoading()
      wx.showToast({ title: '保存成功', icon: 'success' })
      this.setData({ editing: false })
      await this.loadItem(id)
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '保存失败', icon: 'error' })
    } finally {
      this.setData({ submitting: false })
    }
  },

  onDelete() {
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确认删除该物品？',
      confirmColor: '#F44336',
      success: async res => {
        if (!res.confirm) return
        wx.showLoading({ title: '删除中...' })
        try {
          await cloud.call('itemDelete', { id: this.data.id })
          wx.hideLoading()
          wx.showToast({ title: '已删除', icon: 'success' })
          setTimeout(() => wx.navigateBack(), 1000)
        } catch (e) {
          wx.hideLoading()
          wx.showToast({ title: '删除失败', icon: 'error' })
        }
      },
    })
  },
})
