const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.login = async (req, res, next) => {
  try {
    const { code, userInfo } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, message: '缺少微信登录凭证code' });
    }

    const { WECHAT_APPID, WECHAT_SECRET } = process.env;
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${WECHAT_APPID}&secret=${WECHAT_SECRET}&js_code=${code}&grant_type=authorization_code`;

    const { data: wechatData } = await axios.get(url);

    if (wechatData.errcode) {
      console.error('微信登录失败:', wechatData);
      return res.status(400).json({ success: false, message: `微信登录失败: ${wechatData.errmsg}` });
    }

    const { openid: openId, session_key: sessionKey } = wechatData;

    let user = await User.findOne({ openId });

    if (user) {
      user.sessionKey = sessionKey;
      // 可选择在每次登录时更新用户信息
      if (userInfo) {
        user.nickName = userInfo.nickName;
        user.avatarUrl = userInfo.avatarUrl;
      }
      await user.save();
    } else {
      user = await User.create({
        openId,
        sessionKey,
        nickName: userInfo.nickName || `微信用户`,
        avatarUrl: userInfo.avatarUrl || '',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        nickName: user.nickName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('登录流程异常:', error);
    res.status(500).json({ success: false, message: '服务器内部错误' });
  }
}; 