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

      // 构造提醒内容
      let thing1 = ''
      if (nearItems.length > 0) {
        thing1 = `${nearItems[0].name}等${nearItems.length}件物品即将过期`
      } else if (expiredItems.length > 0) {
        thing1 = `${expiredItems[0].name}等${expiredItems.length}件物品已过期`
      }

      if (thing1.length > 20) thing1 = thing1.slice(0, 20)

      try {
        await cloud.openapi.subscribeMessage.send({
          touser: openid,
          templateId: process.env.SUBSCRIBE_TEMPLATE_ID || '',
          page: 'pages/index/index',
          data: {
            thing1: { value: thing1 },
            date2: { value: todayStr },
            number3: { value: String(items.length) },
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
