// cloudfunctions/itemUpdate/index.js
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  const { id, name, category, image, productionDate, expiryDate, shelfLifeDays, note } = event

  if (!id) return { code: -1, message: '缺少物品 id' }
  if (!name || !name.trim()) return { code: -1, message: '物品名称不能为空' }
  if (!expiryDate) return { code: -1, message: '到期日期不能为空' }

  try {
    // 先验证该物品属于当前用户
    const { data } = await db.collection('items')
      .where({ _id: id, _openid: OPENID })
      .limit(1)
      .get()
    if (data.length === 0) return { code: -1, message: '物品不存在或无权限' }

    await db.collection('items').doc(id).update({
      data: {
        name: name.trim(),
        category: category || '其他',
        image: image !== undefined ? image : data[0].image,
        productionDate: productionDate || '',
        expiryDate,
        shelfLifeDays: shelfLifeDays ? Number(shelfLifeDays) : null,
        note: note || '',
        updateTime: db.serverDate(),
      },
    })
    return { code: 0 }
  } catch (e) {
    console.error('[itemUpdate]', e)
    return { code: -1, message: e.message }
  }
}
