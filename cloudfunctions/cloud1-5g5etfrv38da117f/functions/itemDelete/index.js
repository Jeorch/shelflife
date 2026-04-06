// cloudfunctions/itemDelete/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id } = event

  if (!id) return { code: -1, message: '缺少物品 id' }

  try {
    // 验证归属
    const { data } = await db.collection('items')
      .where({ _id: id, _openid: OPENID })
      .limit(1)
      .get()
    if (data.length === 0) return { code: -1, message: '物品不存在或无权限' }

    await db.collection('items').doc(id).remove()
    return { code: 0 }
  } catch (e) {
    console.error('[itemDelete]', e)
    return { code: -1, message: e.message }
  }
}
