require('dotenv').config();
const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// 微信登录接口
app.post('/api/auth/login', async (req, res) => {
  try {
    const { code } = req.body;
    
    // 请求微信接口获取openid和session_key
    const wxLoginUrl = 'https://api.weixin.qq.com/sns/jscode2session';
    const wxResponse = await axios.get(wxLoginUrl, {
      params: {
        appid: process.env.APP_ID,
        secret: process.env.APP_SECRET,
        js_code: code,
        grant_type: 'authorization_code'
      }
    });

    const { openid, session_key } = wxResponse.data;
    
    if (!openid) {
      return res.json({
        success: false,
        message: '登录失败'
      });
    }

    // 生成JWT token
    const token = jwt.sign(
      { openid },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回登录成功信息
    res.json({
      success: true,
      token,
      userInfo: {
        openid
        // 可以添加更多用户信息
      }
    });

  } catch (error) {
    console.error('登录错误：', error);
    res.json({
      success: false,
      message: '服务器错误'
    });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 