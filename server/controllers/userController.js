const User = require('../models/User');
const crypto = require('crypto');

// 微信手机号解密函数
function decryptPhoneNumber(sessionKey, encryptedData, iv) {
  try {
    const sessionKeyBuffer = Buffer.from(sessionKey, 'base64');
    const encryptedDataBuffer = Buffer.from(encryptedData, 'base64');
    const ivBuffer = Buffer.from(iv, 'base64');
    
    const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKeyBuffer, ivBuffer);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedDataBuffer, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('解密手机号失败:', error);
    throw new Error('解密手机号失败');
  }
}

// 绑定手机号
const bindPhoneNumber = async (req, res) => {
  try {
    const { encryptedData, iv } = req.body;
    
    // 从token中获取用户信息
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: '未授权' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 获取用户信息，包含sessionKey
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }
    
    if (!user.sessionKey) {
      return res.status(400).json({ error: '缺少sessionKey，请重新登录' });
    }
    
    // 解密手机号
    const phoneData = decryptPhoneNumber(user.sessionKey, encryptedData, iv);
    
    // 更新用户手机号
    user.phone = phoneData.phoneNumber;
    await user.save();
    
    // 清除sessionKey（出于安全考虑）
    user.sessionKey = undefined;
    await user.save();
    
    res.json({
      success: true,
      message: '手机号绑定成功',
      phone: phoneData.phoneNumber
    });
    
  } catch (error) {
    console.error('绑定手机号失败:', error);
    res.status(500).json({ error: '绑定手机号失败' });
  }
};

module.exports = {
  bindPhoneNumber
};