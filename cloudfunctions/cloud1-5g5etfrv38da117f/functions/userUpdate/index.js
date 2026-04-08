// cloudfunctions/userUpdate/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { nickName, avatarUrl } = event
  try {
    const { data } = await db.collection('users')
      .where({ _openid: OPENID })
      .limit(1)
      .get()

    if (data.length === 0) {
      return { code: -1, message: '用户不存在' }
    }

    const updateData = { updateTime: db.serverDate() }
    if (nickName !== undefined) updateData.nickName = nickName
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl

    await db.collection('users').doc(data[0]._id).update({ data: updateData })
    return { code: 0 }
  } catch (e) {
    console.error('[userUpdate]', e)
    return { code: -1, message: e.message }
  }
}
