// miniprogram/utils/cloud.js
// 云函数调用统一封装，统一错误处理

/**
 * 调用云函数，返回 result，失败时抛出错误
 * @param {string} name 云函数名
 * @param {object} data 入参
 * @returns {Promise<any>}
 */
function call(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: res => {
        if (res.result && res.result.code !== 0) {
          reject(new Error(res.result.message || '云函数返回错误'))
        } else {
          resolve(res.result)
        }
      },
      fail: err => {
        console.error(`[cloud.call] ${name} failed`, err)
        reject(err)
      },
    })
  })
}

module.exports = { call }
