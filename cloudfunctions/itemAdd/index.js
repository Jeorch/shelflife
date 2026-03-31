// cloudfunctions/itemAdd/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { name, category, image, productionDate, expiryDate, shelfLifeDays, note } = event

  if (!name || !name.trim()) return { code: -1, message: '物品名称不能为空' }
  if (!expiryDate) return { code: -1, message: '到期日期不能为空' }

  try {
    const now = db.serverDate()
    const res = await db.collection('items').add({
      data: {
        _openid: OPENID,
        name: name.trim(),
        category: category || '其他',
        image: image || '',
        productionDate: productionDate || '',
        expiryDate,
        shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : null,
        note: note || '',
        createTime: now,
        updateTime: now,
      },
    })
    return { code: 0, id: res._id }
  } catch (e) {
    console.error('[itemAdd]', e)
    return { code: -1, message: e.message }
  }
}
