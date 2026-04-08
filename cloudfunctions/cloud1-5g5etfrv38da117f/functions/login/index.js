// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID, APPID } = cloud.getWXContext()
  const { nickName, avatarUrl } = event
  try {
    const now = db.serverDate()
    const { data } = await db.collection('users')
      .where({ _openid: OPENID })
      .limit(1)
      .get()

    if (data.length === 0) {
      await db.collection('users').add({
        data: {
          _openid: OPENID,
          appid: APPID,
          nickName: nickName || '微信用户',
          avatarUrl: avatarUrl || '',
          createTime: now,
          updateTime: now,
        },
      })
    } else {
      const updateData = { updateTime: now }
      if (nickName) updateData.nickName = nickName
      if (avatarUrl) updateData.avatarUrl = avatarUrl
      await db.collection('users').doc(data[0]._id).update({ data: updateData })
    }

    return { code: 0, openid: OPENID }
  } catch (e) {
    console.error('[login]', e)
    return { code: -1, message: e.message }
  }
}
