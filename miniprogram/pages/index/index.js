// pages/index/index.js
const { getItemStatus, getDaysLeft } = require('../../utils/date')
const cloud = require('../../utils/cloud')

const CATEGORIES = ['全部', '食品', '药品', '护肤品', '日用品', '其他']

Page({
  data: {
    items: [],
    filteredItems: [],
    activeFilter: 'all',   // all | near | expired
    activeCategory: '全部',
    categoryList: CATEGORIES,
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
      this._applyFilters()
    } catch (e) {
      console.error('[loadItems]', e)
      this.setData({ loading: false })
      wx.showToast({ title: '加载失败', icon: 'error' })
    }
  },

  onFilterTap(e) {
    this.setData({ activeFilter: e.currentTarget.dataset.filter })
    this._applyFilters()
  },

  onCategoryTap(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.category })
    this._applyFilters()
  },

  _applyFilters() {
    const { items, activeFilter, activeCategory } = this.data
    let result = items

    if (activeFilter === 'near') {
      result = result.filter(i => i.status === 'near')
    } else if (activeFilter === 'expired') {
      result = result.filter(i => i.status === 'expired')
    }

    if (activeCategory !== '全部') {
      result = result.filter(i => i.category === activeCategory)
    }

    this.setData({ filteredItems: result })
  },

  onAddTap() {
    wx.navigateTo({ url: '/pages/add/add' })
  },

  onItemTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },
})
