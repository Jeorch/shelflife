// miniprogram/utils/date.js
// 保质期状态与剩余天数计算工具

/**
 * 将日期字符串或 Date 对象归一化为当天零点的时间戳（ms）
 * @param {string|Date} date
 * @returns {number}
 */
function toMidnight(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/**
 * 计算距到期日的剩余天数（正数=未到期，0=今天到期，负数=已过期）
 * @param {string|Date} expiryDate
 * @returns {number}
 */
function getDaysLeft(expiryDate) {
  const now = toMidnight(new Date())
  const expiry = toMidnight(expiryDate)
  return Math.round((expiry - now) / (1000 * 60 * 60 * 24))
}

/**
 * 根据到期日期返回物品状态
 * @param {string|Date} expiryDate
 * @returns {'normal'|'near'|'expired'}
 */
function getItemStatus(expiryDate) {
  const days = getDaysLeft(expiryDate)
  if (days < 0) return 'expired'
  if (days <= 7) return 'near'
  return 'normal'
}

/**
 * 将 Date 对象格式化为 YYYY-MM-DD 字符串
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const d = new Date(date)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

module.exports = { getDaysLeft, getItemStatus, formatDate, toMidnight }
