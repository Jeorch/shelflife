// pages/index/index.js
const { getItemStatus, getDaysLeft } = require('../../utils/date')
const cloud = require('../../utils/cloud')

Page({
  data: {
    items: [],
    filteredItems: [],
    activeFilter: 'all', // all | near | expired
    nearCount: 0,
    loading: true,
  },

  onLoad() {
    this.loadItems()
  },

  onShow() {
    this.loadItems()
  },

  async loadItems() {
    this.setData({ loading: true })
    try {
      const res = await cloud.call('itemList', {})
      const items = (res.list || []).map(item => ({
        ...item,
        status: getItemStatus(item.expiryDate),
        daysLeft: getDaysLeft(item.expiryDate),
      }))
      items.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      const nearCount = items.filter(i => i.status === 'near' || i.status === 'expired').length
      this.setData({ items, nearCount, loading: false })
      this.applyFilter(this.data.activeFilter)
    } catch (e) {
      console.error('[loadItems]', e)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ activeFilter: filter })
    this.applyFilter(filter)
  },

  applyFilter(filter) {
    const { items } = this.data
    let filteredItems
    if (filter === 'near') {
      filteredItems = items.filter(i => i.status === 'near')
    } else if (filter === 'expired') {
      filteredItems = items.filter(i => i.status === 'expired')
    } else {
      filteredItems = items
    }
    this.setData({ filteredItems })
  },

  onAddTap() {
    wx.navigateTo({ url: '/pages/add/add' })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
})
