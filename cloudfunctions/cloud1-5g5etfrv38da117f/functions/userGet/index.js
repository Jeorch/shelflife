// cloudfunctions/userGet/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  try {
    const { data } = await db.collection('users')
      .where({ _openid: OPENID })
      .limit(1)
      .get()

    if (data.length === 0) {
      return { code: 0, user: null }
    }
    return { code: 0, user: data[0] }
  } catch (e) {
    console.error('[userGet]', e)
    return { code: -1, message: e.message }
  }
}
