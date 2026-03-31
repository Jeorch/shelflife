// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID, APPID } = cloud.getWXContext()
  try {
    const now = db.serverDate()
    // 查询用户是否已存在
    const { data } = await db.collection('users')
      .where({ _openid: OPENID })
      .limit(1)
      .get()

    if (data.length === 0) {
      // 新用户，写入
      await db.collection('users').add({
        data: {
          _openid: OPENID,
          appid: APPID,
          createTime: now,
          updateTime: now,
        },
      })
    } else {
      // 老用户，更新 updateTime
      await db.collection('users').doc(data[0]._id).update({
        data: { updateTime: now },
      })
    }

    return { code: 0, openid: OPENID }
  } catch (e) {
    console.error('[login]', e)
    return { code: -1, message: e.message }
  }
}
