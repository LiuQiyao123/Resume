# AI简历定制小程序外部API调用清单

## 1. 微信小程序API

### 1.1 登录认证API

#### wx.login()
- **用途**: 获取用户登录凭证(code)
- **调用方式**: 小程序客户端调用
- **使用场景**: 用户登录时
- **示例代码**:
  ```javascript
  wx.login({
    success(res) {
      if (res.code) {
        // 将code发送到后端服务器
        wx.request({
          url: 'https://api.example.com/auth/login',
          method: 'POST',
          data: { code: res.code },
          success(result) {
            // 处理登录结果
          }
        })
      } else {
        console.error('登录失败: ' + res.errMsg)
      }
    }
  })
  ```

#### code2Session
- **用途**: 通过临时登录凭证获取用户openid和session_key
- **接口地址**: https://api.weixin.qq.com/sns/jscode2session
- **请求方式**: GET/POST
- **调用方式**: 服务端调用
- **参数**:
  | 参数 | 类型 | 必填 | 说明 |
  |-----|------|------|------|
  | appid | string | 是 | 小程序AppID |
  | secret | string | 是 | 小程序AppSecret |
  | js_code | string | 是 | 登录时获取的code |
  | grant_type | string | 是 | 授权类型，固定值"authorization_code" |
- **响应**:
  ```json
  {
    "openid": "用户唯一标识",
    "session_key": "会话密钥",
    "unionid": "用户在开放平台的唯一标识（仅在满足条件时返回）",
    "errcode": 0,
    "errmsg": "成功"
  }
  ```
- **注意事项**:
  - session_key有效期较短，需合理维护登录态
  - 调用时机: 用户登录时后端服务调用

### 1.2 用户信息API

#### wx.getUserProfile()
- **用途**: 获取用户头像、昵称等信息
- **调用方式**: 小程序客户端调用(需用户主动触发)
- **使用场景**: 用户点击授权按钮时
- **示例代码**:
  ```javascript
  wx.getUserProfile({
    desc: '用于完善简历信息',
    success: (res) => {
      const userInfo = res.userInfo
      // 将用户信息发送到后端服务器
      wx.request({
        url: 'https://api.example.com/user/update-profile',
        method: 'POST',
        data: { userInfo },
        success(result) {
          // 处理结果
        }
      })
    },
    fail: (err) => {
      console.error('获取用户信息失败', err)
    }
  })
  ```
- **注意事项**:
  - 2021年4月后，必须通过button触发，且不再支持wx.getUserInfo静默获取

### 1.3 支付API

#### wx.requestPayment()
- **用途**: 发起微信支付
- **调用方式**: 小程序客户端调用
- **使用场景**: 用户充值积分时
- **示例代码**:
  ```javascript
  wx.requestPayment({
    timeStamp: '1619775140',
    nonceStr: 'a1b2c3d4e5',
    package: 'prepay_id=wx123456789',
    signType: 'MD5',
    paySign: 'paySignFromServer',
    success(res) {
      // 支付成功
    },
    fail(err) {
      // 支付失败
    }
  })
  ```

#### 统一下单API
- **接口地址**: https://api.mch.weixin.qq.com/pay/unifiedorder
- **请求方式**: POST
- **调用方式**: 服务端调用
- **主要参数**:
  | 参数 | 类型 | 必填 | 说明 |
  |-----|------|------|------|
  | appid | string | 是 | 小程序AppID |
  | mch_id | string | 是 | 商户号 |
  | nonce_str | string | 是 | 随机字符串 |
  | sign | string | 是 | 签名 |
  | body | string | 是 | 商品描述 |
  | out_trade_no | string | 是 | 商户订单号 |
  | total_fee | int | 是 | 订单总金额，单位为分 |
  | spbill_create_ip | string | 是 | 终端IP |
  | notify_url | string | 是 | 通知地址 |
  | trade_type | string | 是 | 交易类型，小程序固定为JSAPI |
  | openid | string | 是 | 用户标识 |
- **注意事项**:
  - 需配置支付相关证书
  - 确保服务器IP已添加到微信支付白名单

### 1.4 文件上传与下载

#### wx.uploadFile()
- **用途**: 上传本地文件到服务器
- **调用方式**: 小程序客户端调用
- **使用场景**: 用户上传简历文件时
- **示例代码**:
  ```javascript
  wx.chooseMessageFile({
    count: 1,
    type: 'file',
    extension: ['pdf', 'doc', 'docx'],
    success(res) {
      const tempFilePath = res.tempFiles[0].path
      wx.uploadFile({
        url: 'https://api.example.com/resume/upload',
        filePath: tempFilePath,
        name: 'resume',
        formData: {
          'userId': 'current-user-id'
        },
        success(uploadRes) {
          const data = JSON.parse(uploadRes.data)
          // 处理上传结果
        }
      })
    }
  })
  ```

#### wx.downloadFile()
- **用途**: 下载文件到本地
- **调用方式**: 小程序客户端调用
- **使用场景**: 用户下载生成的简历时
- **示例代码**:
  ```javascript
  wx.downloadFile({
    url: 'https://example.com/resume/download/123.pdf',
    success(res) {
      const filePath = res.tempFilePath
      wx.openDocument({
        filePath: filePath,
        showMenu: true,
        success() {
          console.log('打开文档成功')
        }
      })
    }
  })
  ```

### 1.5 分享和订阅消息

#### wx.showShareMenu()
- **用途**: 显示小程序分享按钮
- **调用方式**: 小程序客户端调用
- **使用场景**: 用户分享简历或推荐小程序时
- **示例代码**:
  ```javascript
  wx.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
  ```

#### 订阅消息API
- **接口地址**: https://api.weixin.qq.com/cgi-bin/message/subscribe/send
- **请求方式**: POST
- **调用方式**: 服务端调用
- **使用场景**: 发送简历优化完成通知
- **主要参数**:
  | 参数 | 类型 | 必填 | 说明 |
  |-----|------|------|------|
  | access_token | string | 是 | 接口调用凭证 |
  | touser | string | 是 | 接收者openid |
  | template_id | string | 是 | 模板ID |
  | page | string | 否 | 点击模板卡片后的跳转页面 |
  | data | object | 是 | 模板内容 |
  | miniprogram_state | string | 否 | 跳转小程序类型 |
  | lang | string | 否 | 语言类型 |
- **示例请求**:
  ```json
  {
    "touser": "接收者openid",
    "template_id": "模板ID",
    "page": "pages/result/result?id=123",
    "data": {
      "thing1": {"value": "简历优化完成"},
      "time2": {"value": "2023-06-01 14:30"}
    }
  }
  ```

## 2. AI模型服务API

### 2.1 DeepSeek R1 API

#### 对话生成接口
- **接口地址**: https://api.deepseek.com/v1/chat/completions
- **请求方式**: POST
- **调用方式**: 服务端调用
- **使用场景**: 职业顾问对话、简历优化
- **主要参数**:
  | 参数 | 类型 | 必填 | 说明 |
  |-----|------|------|------|
  | api_key | string | 是 | API认证密钥 |
  | model | string | 是 | 模型名称，如"deepseek-r1-40b" |
  | messages | array | 是 | 对话历史记录 |
  | temperature | float | 否 | 生成多样性，0-1.0 |
  | max_tokens | int | 否 | 最大生成token数 |
  | stream | boolean | 否 | 是否启用流式输出 |
- **示例请求**:
  ```json
  {
    "model": "deepseek-r1-40b",
    "messages": [
      {"role": "system", "content": "你是一位拥有十年经验的职业咨询顾问，专长于简历优化和职业规划。"},
      {"role": "user", "content": "我想优化我的软件工程师简历"}
    ],
    "temperature": 0.7,
    "max_tokens": 800
  }
  ```
- **响应示例**:
  ```json
  {
    "id": "chat-123456789",
    "object": "chat.completion",
    "created": 1619775140,
    "model": "deepseek-r1-40b",
    "choices": [{
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "我很乐意帮你优化软件工程师简历。为了给你提供最好的建议，我需要了解几个方面的信息..."
      },
      "finish_reason": "stop"
    }],
    "usage": {
      "prompt_tokens": 52,
      "completion_tokens": 167,
      "total_tokens": 219
    }
  }
  ```
- **注意事项**:
  - API密钥需妥善保存，建议存储在环境变量中
  - 对话历史需精简，避免超出最大上下文窗口
  - 考虑使用流式响应提升用户体验

#### 简历结构化分析接口
- **接口地址**: https://api.deepseek.com/v1/embeddings
- **请求方式**: POST
- **调用方式**: 服务端调用
- **使用场景**: 分析上传的简历内容，提取结构化信息
- **示例请求**:
  ```json
  {
    "model": "deepseek-r1-40b",
    "input": "简历全文内容...",
    "instruction": "请从这份简历中提取以下结构化信息: 姓名、联系方式、教育经历、工作经验、技能..."
  }
  ```

### 2.2 微信AI能力接口

#### OCR文字识别
- **接口地址**: https://api.weixin.qq.com/cv/ocr/comm
- **请求方式**: POST
- **调用方式**: 服务端调用
- **使用场景**: 识别上传的简历图片或扫描件
- **主要参数**:
  | 参数 | 类型 | 必填 | 说明 |
  |-----|------|------|------|
  | access_token | string | 是 | 接口调用凭证 |
  | img_url | string | 否 | 图片URL |
  | img | file | 否 | 图片文件 |
- **注意事项**:
  - img与img_url二选一，优先使用img参数

## 3. 云存储服务API

### 3.1 腾讯云对象存储(COS)

#### 上传文件
- **接口地址**: https://cos.<Region>.myqcloud.com/<BucketName-APPID>/<ObjectKey>
- **请求方式**: PUT
- **调用方式**: 服务端调用或客户端直传
- **使用场景**: 存储用户上传的简历、生成的PDF文件
- **认证方式**: 临时密钥(STS)或永久密钥
- **示例代码**:
  ```javascript
  const COS = require('cos-nodejs-sdk-v5');
  const cos = new COS({
    SecretId: 'xxx',
    SecretKey: 'xxx'
  });
  
  cos.putObject({
    Bucket: 'resume-1234567890',
    Region: 'ap-beijing',
    Key: 'resumes/user123/resume-v1.pdf',
    Body: fileContent,
    ContentType: 'application/pdf'
  }, function(err, data) {
    console.log(err || data);
  });
  ```

#### 获取临时预签名URL
- **用途**: 生成带有限时访问权限的URL
- **调用方式**: 服务端调用
- **使用场景**: 提供简历文件的临时下载链接
- **示例代码**:
  ```javascript
  cos.getObjectUrl({
    Bucket: 'resume-1234567890',
    Region: 'ap-beijing',
    Key: 'resumes/user123/resume-v1.pdf',
    Sign: true,
    Expires: 3600 // 1小时有效期
  }, function(err, data) {
    console.log(err || data.Url);
  });
  ```

### 3.2 阿里云对象存储(OSS)

#### 上传文件
- **接口文档**: https://help.aliyun.com/document_detail/31978.html
- **请求方式**: PUT
- **调用方式**: 服务端调用或客户端直传
- **使用场景**: 存储简历模板和图片资源
- **示例代码**:
  ```javascript
  const OSS = require('ali-oss');
  
  const client = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: 'your-access-key-id',
    accessKeySecret: 'your-access-key-secret',
    bucket: 'your-bucket-name'
  });
  
  async function uploadFile() {
    try {
      const result = await client.put(
        'resumes/user123/resume-v1.pdf',
        'local-file-path'
      );
      console.log(result);
    } catch (err) {
      console.error(err);
    }
  }
  ```

## 4. 第三方服务API

### 4.1 PDF生成服务

#### HTML转PDF
- **服务选项**: PDFKit, Puppeteer或第三方API如DocRaptor
- **调用方式**: 服务端调用
- **使用场景**: 生成简历PDF文件
- **Puppeteer示例**:
  ```javascript
  const puppeteer = require('puppeteer');
  
  async function generatePDF(htmlContent, outputPath) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });
  
    await browser.close();
  }
  ```

### 4.2 职位信息API

#### 智联招聘开放平台
- **接口文档**: https://open.zhaopin.com/
- **调用方式**: 服务端调用
- **使用场景**: 职位推荐、JD分析
- **主要接口**:
  - 职位搜索API
  - 职位详情API
- **认证方式**: OAuth2.0

#### Boss直聘开放平台
- **接口文档**: https://open.zhipin.com/
- **调用方式**: 服务端调用
- **使用场景**: 职位推荐、JD分析
- **主要接口**:
  - 职位搜索API
  - 职位详情API
- **认证方式**: API密钥

### 4.3 短信服务API

#### 腾讯云短信
- **接口文档**: https://cloud.tencent.com/document/product/382/55981
- **调用方式**: 服务端调用
- **使用场景**: 验证码、简历完成通知
- **示例代码**:
  ```javascript
  const tencentcloud = require('tencentcloud-sdk-nodejs');
  const smsClient = tencentcloud.sms.v20210111.Client;
  
  const client = new smsClient({
    credential: {
      secretId: 'xxx',
      secretKey: 'xxx'
    },
    region: 'ap-guangzhou',
    profile: {}
  });
  
  client.SendSms({
    PhoneNumberSet: ['+8613800138000'],
    SmsSdkAppId: 'xxx',
    SignName: '您的签名',
    TemplateId: 'xxx',
    TemplateParamSet: ['参数1', '参数2']
  }).then(
    (data) => {
      console.log(data);
    },
    (err) => {
      console.error(err);
    }
  );
  ```

## 5. API调用注意事项

### 5.1 安全规范

- **密钥管理**:
  - 所有API密钥存储在服务器环境变量或密钥管理系统
  - 客户端代码不得包含任何密钥信息
  - 定期轮换密钥

- **请求保护**:
  - 所有服务间通信使用HTTPS
  - 客户端上传添加文件类型和大小验证
  - 服务端实现请求频率限制

- **数据保护**:
  - 敏感信息传输前加密
  - 保持最小权限原则
  - 对第三方API返回数据进行安全过滤

### 5.2 性能优化

- **并发控制**:
  - 对高频API实现并发控制和队列
  - 特别是对AI服务的调用需限流

- **缓存策略**:
  - 适当缓存不常变化的API响应
  - 使用Redis缓存频繁访问的数据

- **批量处理**:
  - 设计批量API调用减少请求次数
  - 实现消息队列处理非实时任务

### 5.3 容错处理

- **重试机制**:
  - 实现指数退避重试
  - 区分可重试错误和非可重试错误
  - 示例代码:
    ```javascript
    async function requestWithRetry(fn, maxRetries = 3, delay = 1000) {
      let retries = 0;
      while (true) {
        try {
          return await fn();
        } catch (err) {
          if (retries >= maxRetries || !isRetryableError(err)) {
            throw err;
          }
          
          const waitTime = delay * Math.pow(2, retries);
          console.log(`Retry after ${waitTime}ms...`);
          await new Promise(r => setTimeout(r, waitTime));
          retries++;
        }
      }
    }
    ```

- **降级策略**:
  - 当AI服务不可用时降级到基础功能
  - 提供离线模式支持

### 5.4 监控与日志

- **API调用监控**:
  - 记录所有外部API调用情况
  - 监控关键指标: 成功率、响应时间、错误率
  - 设置合理告警阈值

- **日志规范**:
  - 记录API请求与响应(敏感信息脱敏)
  - 异常情况完整记录上下文
  - 使用结构化日志便于分析

## 6. 开发环境配置

### 6.1 API模拟服务

- **本地开发环境使用Mock服务**:
  ```javascript
  // 使用Mockjs模拟微信API
  const Mock = require('mockjs');
  
  // 模拟wx.login接口
  Mock.mock('/mock/wx/login', 'post', {
    'code': '123456',
    'errMsg': 'login:ok'
  });
  
  // 模拟AI接口
  Mock.mock('/mock/ai/analyze', 'post', {
    'success': true,
    'data': {
      'score': '@integer(60, 95)',
      'suggestions': [
        {
          'type': 'improvement',
          'section': 'skills',
          'message': '建议添加更多技能关键词'
        }
      ]
    }
  });
  ```

### 6.2 开发环境与生产环境分离

- **配置区分**:
  ```javascript
  // config.js
  const config = {
    development: {
      wxAppId: 'dev_app_id',
      wxAppSecret: 'dev_app_secret',
      aiApiBaseUrl: 'https://dev-api.deepseek.com/v1',
      // 其他开发环境配置
    },
    production: {
      wxAppId: process.env.WX_APP_ID,
      wxAppSecret: process.env.WX_APP_SECRET,
      aiApiBaseUrl: 'https://api.deepseek.com/v1',
      // 其他生产环境配置
    }
  };
  
  module.exports = config[process.env.NODE_ENV || 'development'];
  ```
