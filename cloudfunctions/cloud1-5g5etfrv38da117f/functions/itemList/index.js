// cloudfunctions/itemList/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, category } = event

  try {
    // 查询单条
    if (id) {
      const { data } = await db.collection('items')
        .where({ _id: id, _openid: OPENID })
        .limit(1)
        .get()
      return { code: 0, list: data }
    }

    // 查询列表（云数据库单次最多 100 条，分页可后续扩展）
    const query = { _openid: OPENID }
    if (category) query.category = category

    const { data } = await db.collection('items')
      .where(query)
      .orderBy('expiryDate', 'asc')
      .limit(100)
      .get()

    return { code: 0, list: data }
  } catch (e) {
    console.error('[itemList]', e)
    return { code: -1, message: e.message }
  }
}
