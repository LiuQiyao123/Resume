# 智能简历系统服务器端

这是一个基于 Node.js + Express + MongoDB 的智能简历系统服务器端。

## 功能特点

- 用户管理（登录、注册、个人信息管理）
- 简历管理（创建、编辑、优化、文件上传）
- 职位管理（发布、搜索、筛选）
- 申请管理（投递、状态管理、统计）
- 收藏管理（收藏、取消收藏、统计）
- 积分系统
- 日志系统
- 缓存机制
- 文件上传
- 数据验证

## 技术栈

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Winston
- Jest

## 环境要求

- Node.js >= 14.0.0
- MongoDB >= 4.4
- npm >= 6.0.0

## 安装步骤

1. 克隆项目
```bash
git clone <repository_url>
cd resume-server
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，填入必要的配置信息
```

4. 创建必要的目录
```bash
mkdir uploads logs
```

5. 启动 MongoDB
```bash
# 确保 MongoDB 服务已启动
```

## 运行项目

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行测试并监视文件变化
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## API 文档

### 用户相关

- POST /api/users/login - 用户登录
- GET /api/users/profile - 获取用户信息
- PUT /api/users/profile - 更新用户信息
- GET /api/users/points - 获取用户积分
- GET /api/users/resumes/count - 获取用户简历数量
- POST /api/users/avatar - 上传头像
- DELETE /api/users/avatar - 删除头像

### 简历相关

- GET /api/resumes - 获取简历列表
- GET /api/resumes/:id - 获取简历详情
- POST /api/resumes - 创建简历
- PUT /api/resumes/:id - 更新简历
- DELETE /api/resumes/:id - 删除简历
- POST /api/resumes/:id/customize - 优化简历
- POST /api/resumes/:id/upload - 上传简历文件
- DELETE /api/resumes/:id/file - 删除简历文件

### 职位相关

- GET /api/jobs - 获取职位列表
- GET /api/jobs/:id - 获取职位详情
- POST /api/jobs - 发布职位
- PUT /api/jobs/:id - 更新职位
- DELETE /api/jobs/:id - 删除职位
- GET /api/jobs/categories - 获取职位分类
- GET /api/jobs/locations - 获取职位地点

### 申请相关

- GET /api/applications - 获取申请列表
- GET /api/applications/:id - 获取申请详情
- POST /api/applications - 创建申请
- PUT /api/applications/:id/status - 更新申请状态
- DELETE /api/applications/:id - 删除申请
- GET /api/applications/stats - 获取申请统计

### 收藏相关

- GET /api/collections - 获取收藏列表
- POST /api/collections - 添加收藏
- DELETE /api/collections/:id - 删除收藏
- GET /api/collections/check - 检查收藏状态
- GET /api/collections/stats - 获取收藏统计

## 目录结构

```
server/
├── src/
│   ├── config/         # 配置文件
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/        # 数据模型
│   ├── routes/        # 路由
│   ├── utils/         # 工具函数
│   └── app.js         # 应用入口
├── tests/             # 测试文件
├── uploads/           # 上传文件目录
├── logs/              # 日志目录
├── .env              # 环境变量
├── .gitignore        # Git忽略文件
├── jest.config.js    # Jest配置
├── package.json      # 项目配置
└── README.md         # 项目说明
```

## 注意事项

1. 确保 MongoDB 服务已启动
2. 正确配置 .env 文件中的环境变量
3. 创建必要的目录（uploads、logs）
4. 开发环境使用 nodemon 实现热重载
5. 生产环境使用 PM2 等进程管理工具

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT 

# 微信小程序简历后端服务

## 环境配置

### 本地开发环境

1. 创建 `.env` 文件：
```bash
# 服务器配置
PORT=3000
NODE_ENV=development

# MongoDB配置（本地）
MONGODB_URI=mongodb://localhost:27017/resume_miniprogram

# JWT配置
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=wx772e456ae8f2cd6a
WECHAT_SECRET=your_wechat_app_secret
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务：
```bash
npm run dev
```

### 微信云托管部署

#### 方案1：使用腾讯云 MongoDB

1. **购买腾讯云 MongoDB 实例**
   - 登录腾讯云控制台
   - 选择 MongoDB 服务
   - 创建实例（建议选择与云托管同地域）
   - 获取连接地址

2. **配置环境变量**
```bash
# 生产环境配置
NODE_ENV=production
PORT=3000

# 腾讯云 MongoDB
MONGODB_URI=mongodb://username:password@your-mongodb-host:27017/resume_miniprogram?authSource=admin

# JWT密钥（32位以上随机字符串）
JWT_SECRET=aB3$kL9mN2pQ7rS1tU4vW8xY6zA5bC0dE9fG2hI6jK
JWT_EXPIRES_IN=7d

# 微信小程序配置
WECHAT_APPID=wx772e456ae8f2cd6a
WECHAT_SECRET=your_actual_wechat_app_secret

# 云托管环境ID
CLOUDBASE_ENV=prod-2gn7vn8085ebc3d9
```

#### 方案2：使用 MongoDB Atlas

1. **创建 MongoDB Atlas 账户**
   - 访问 https://www.mongodb.com/atlas
   - 创建免费集群
   - 配置网络访问（允许所有IP：0.0.0.0/0）
   - 创建数据库用户

2. **获取连接字符串**
```bash
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/resume_miniprogram?retryWrites=true&w=majority
```

### 部署步骤

1. **准备代码**
```bash
# 确保所有文件都已提交
git add .
git commit -m "准备部署"
```

2. **配置云托管**
   - 在微信开发者工具中打开云托管
   - 创建新的服务
   - 上传代码包

3. **设置环境变量**
   在云托管控制台中设置以下环境变量：
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `WECHAT_APPID`
   - `WECHAT_SECRET`
   - `NODE_ENV=production`

4. **部署服务**
   - 选择版本并部署
   - 等待部署完成
   - 测试接口是否正常

### API 接口

#### 认证相关
- `POST /api/auth/login` - 微信登录
- `POST /api/auth/refresh-token` - 刷新token
- `POST /api/auth/logout` - 退出登录

#### 用户相关
- `GET /api/user/info` - 获取用户信息
- `PUT /api/user/info` - 更新用户信息

#### 系统接口
- `GET /health` - 健康检查

### 安全建议

1. **JWT_SECRET 生成**
```javascript
// 使用 Node.js 生成随机密钥
const crypto = require('crypto');
const secret = crypto.randomBytes(32).toString('hex');
console.log(secret);
```

2. **数据库安全**
   - 使用强密码
   - 限制网络访问
   - 定期备份数据

3. **API 安全**
   - 使用 HTTPS
   - 实施请求频率限制
   - 验证输入数据

### 故障排除

1. **数据库连接失败**
   - 检查 MONGODB_URI 格式
   - 确认网络访问权限
   - 验证用户名密码

2. **微信登录失败**
   - 检查 WECHAT_APPID 和 WECHAT_SECRET
   - 确认小程序配置正确
   - 查看错误日志

3. **JWT Token 问题**
   - 检查 JWT_SECRET 配置
   - 确认 token 过期时间设置 