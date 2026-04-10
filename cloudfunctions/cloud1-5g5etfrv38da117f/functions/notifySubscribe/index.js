// cloudfunctions/notifySubscribe/index.js
// 定时触发：每天早上 9 点推送临期/过期提醒
// 触发器配置在云开发控制台：cron "0 9 * * *"
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  try {
    // 查询所有用户
    const { data: users } = await db.collection('users').get()

    let successCount = 0
    let failCount = 0

    for (const user of users) {
      const openid = user._openid
      if (!openid) continue

      // 查询该用户的临期（≤7天）和已过期物品
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const todayStr = formatDate(today)
      const sevenDaysStr = formatDate(sevenDaysLater)

      const { data: items } = await db.collection('items')
        .where({
          _openid: openid,
          expiryDate: _.lte(sevenDaysStr),
        })
        .get()

      if (items.length === 0) continue

      const nearItems = items.filter(i => i.expiryDate >= todayStr)
      const expiredItems = items.filter(i => i.expiryDate < todayStr)

      // 提取最紧急的一件物品作为代表
      const targetItem = nearItems.length > 0 ? nearItems[0] : expiredItems[0]
      const totalCount = items.length
      
      // 计算剩余天数（或过期天数）
      const expiryTime = new Date(targetItem.expiryDate).getTime()
      const daysDiff = Math.round((expiryTime - today.getTime()) / (1000 * 60 * 60 * 24))
      const daysText = daysDiff >= 0 ? `剩余${daysDiff}天` : `已过期${Math.abs(daysDiff)}天`

      // 截断过长字符串以满足微信模板要求
      const safeCategory = targetItem.category.slice(0, 20)
      const safeName = targetItem.name.slice(0, 20)
      const safeNote = `共${totalCount}件物品需处理`.slice(0, 20)

      try {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          templateId: process.env.SUBSCRIBE_TEMPLATE_ID || 'vpVFbO8Gu5Nhxbc0ok1CJsrNRTgfu3_Qy0_jp2qwedM', // 优先使用环境变量，支持热更新
          page: 'pages/index/index',
          data: {
            thing1: { value: safeCategory },    // 物品分类
            thing2: { value: safeName },        // 物品名称
            time3: { value: targetItem.expiryDate }, // 有效期至
            thing4: { value: daysText },        // 剩余天数
            thing5: { value: safeNote },        // 备注
          },
        })
        successCount++
      } catch (sendErr) {
        console.warn(`[notify] send to ${openid} failed`, sendErr.errMsg || sendErr)
        failCount++
      }
    }

    return { code: 0, successCount, failCount }
  } catch (e) {
    console.error('[notifySubscribe]', e)
    return { code: -1, message: e.message }
  }
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
