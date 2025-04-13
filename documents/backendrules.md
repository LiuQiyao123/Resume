## 3. API接口设计规范

### 3.1 RESTful API设计

- **HTTP方法使用**:
  - GET: 获取资源
  - POST: 创建资源
  - PUT: 完全更新资源
  - PATCH: 部分更新资源
  - DELETE: 删除资源

- **URL设计**:
  - 使用名词表示资源: `/api/resumes`而非`/api/getResumes`
  - 复数形式表示集合: `/api/users`而非`/api/user`
  - 使用嵌套表示关系: `/api/users/{id}/resumes`
  - 使用查询参数控制结果: `/api/resumes?sortBy=updatedAt&limit=10`

- **状态码使用**:
  - 200: 成功
  - 201: 创建成功
  - 400: 请求错误
  - 401: 未授权
  - 403: 禁止访问
  - 404: 资源不存在
  - 500: 服务器错误

### 3.2 请求与响应格式

- **请求数据验证**:
  - 所有请求参数必须验证合法性
  - 使用Joi或Yup进行模式验证
  - 提供明确的错误消息

- **统一响应格式**:
  ```json
  {
    "success": true/false,
    "data": { ... },  // 成功时返回的数据
    "error": {        // 失败时返回的错误信息
      "code": "ERROR_CODE",
      "message": "用户友好的错误消息",
      "details": { ... }  // 可选的详细错误信息
    },
    "meta": {         // 元数据，如分页信息
      "page": 1,
      "limit": 10,
      "total": 100
    }
  }
  ```

- **数据序列化原则**:
  - 日期格式: ISO 8601 (如 `2023-06-01T12:00:00Z`)
  - 嵌套限制: 最多3层嵌套，避免过于复杂的结构
  - 敏感数据: 永不在响应中包含密码等敏感信息

### 3.3 API文档与版本控制

- **文档规范**:
  - 使用Swagger/OpenAPI记录API规范
  - 每个端点必须包含描述、参数说明、响应示例
  - 保持文档与实现同步更新

- **版本控制策略**:
  - URL路径版本: `/api/v1/resources`
  - 重大变更必须升级版本号
  - 保持向后兼容，旧版本至少维护6个月

### 3.4 微信小程序专用接口

- **登录认证流程**:
  - 使用code换取session_key和openid
  - 生成自定义登录态token返回给客户端
  - 后续请求通过token验证身份

- **支付接口规范**:
  - 严格按照微信支付接口规范实现
  - 完整的支付状态跟踪与通知处理
  - 事务保证支付与业务状态一致性

- **小程序特有能力接口**:
  - 消息订阅: 遵循订阅消息规范
  - 文件上传: 支持直接上传与云存储中转
  - 分享功能: 支持动态生成分享卡片内容

## 4. 数据库设计规范

### 4.1 数据库选型

- **主数据库**: MongoDB
  - 理由: 灵活的文档模型适合简历数据的复杂结构
  - 版本要求: 4.4+
  - 配置策略: 副本集保证高可用性

- **辅助存储**:
  - Redis: 会话存储、缓存、计数器
  - 对象存储(COS/OSS): 文件存储(简历PDF、模板图片)

### 4.2 数据模型设计

- **模型设计原则**:
  - 单一职责: 每个模型专注于表示一个实体
  - 避免过深嵌套: 最多2层嵌套文档
  - 适当反范式化: 提高读取性能的场景可适当冗余

- **通用字段**:
  - `_id`: 主键，MongoDB自动生成
  - `createdAt`: 创建时间，自动生成
  - `updatedAt`: 更新时间，自动更新
  - `isDeleted`: 逻辑删除标志，默认false

- **关系处理**:
  - 一对多: 使用引用(如用户-简历)
  - 多对多: 使用引用数组或关联集合
  - 内嵌文档: 当子实体生命周期完全依赖父实体时使用

### 4.3 数据库表/集合设计

#### 4.3.1 用户集合 (users)

```javascript
{
  _id: ObjectId,
  openid: String,          // 微信小程序openid
  unionid: String,         // 微信开放平台unionid(可选)
  nickname: String,        // 用户昵称
  avatar: String,          // 头像URL
  gender: Number,          // 性别(0未知/1男/2女)
  credits: {
    balance: Number,       // 当前积分
    totalEarned: Number,   // 累计获得积分
    totalSpent: Number     // 累计消费积分
  },
  statistics: {
    resumeCount: Number,   // 简历数量
    optimizationCount: Number, // 优化次数
    downloadCount: Number  // 下载次数
  },
  referrer: ObjectId,      // 引荐人ID(可选)
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,         // 最后登录时间
  status: String           // 状态(active/banned)
}
```

#### 4.3.2 简历集合 (resumes)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // 关联用户ID
  name: String,            // 简历名称
  resumeData: {            // 简历数据(结构化)
    basicInfo: {
      name: String,
      gender: String,
      age: Number,
      contact: {
        phone: String,
        email: String
      },
      summary: String,
      objective: {
        industry: String,
        position: String,
        targetLevel: String
      }
    },
    education: [{
      institution: String,
      major: String,
      degree: String,
      gpa: Number,
      courses: [String],
      duration: {
        start: Date,
        end: Date
      }
    }],
    workExperience: [{
      company: String,
      position: String,
      duration: {
        start: Date,
        end: Date
      },
      responsibilities: [String],
      achievements: [String]
    }],
    skills: [{
      name: String,
      proficiency: String
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date
    }]
  },
  source: String,          // 来源(upload/conversation/template)
  createdAt: Date,
  updatedAt: Date,
  version: Number          // 版本号
}
```

#### 4.3.3 简历定制记录集合 (optimization_records)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // 用户ID
  resumeId: ObjectId,      // 原始简历ID
  optimizedResumeId: ObjectId, // 优化后的简历ID
  jobInfo: {
    title: String,         // 职位名称
    company: String,       // 公司名称
    source: String,        // 来源平台
    url: String            // 职位链接
  },
  templateId: ObjectId,    // 使用的模板ID
  changeLog: [{
    type: String,          // 修改类型(add/modify/delete)
    section: String,       // 修改所在部分
    original: String,      // 原始内容
    modified: String,      // 修改后内容
    reason: String         // 修改理由
  }],
  outputFiles: [{
    type: String,          // 文件类型
    url: String,           // 文件URL
    createdAt: Date        // 创建时间
  }],
  creditsCost: Number,     // 消耗积分数
  createdAt: Date,
  status: String           // 状态(processing/completed/failed)
}
```

#### 4.3.4 模板集合 (templates)

```javascript
{
  _id: ObjectId,
  name: String,            // 模板名称
  description: String,     // 模板描述
  thumbnail: String,       // 缩略图URL
  previewImages: [String], // 预览图URL列表
  category: [String],      // 分类标签
  type: String,            // 类型(free/paid)
  creditsCost: Number,     // 所需积分(付费模板)
  popularity: Number,      // 使用人气
  suitableFor: [String],   // 适用岗位
  createdAt: Date,
  updatedAt: Date,
  status: String           // 状态(active/disabled)
}
```

#### 4.3.5 积分记录集合 (credit_records)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // 用户ID
  type: String,            // 类型(income/expense)
  amount: Number,          // 积分数量
  balanceAfter: Number,    // 变更后余额
  source: {
    type: String,          // 来源类型(register/ad/share/recharge/download/template)
    referenceId: ObjectId, // 关联ID
    description: String    // 详细描述
  },
  createdAt: Date,
  ip: String,              // 操作IP
  device: String           // 设备信息
}
```

#### 4.3.6 会话集合 (conversations)

```javascript
{
  _id: ObjectId,
  userId: ObjectId,        // 用户ID
  startTime: Date,         // 开始时间
  endTime: Date,           // 结束时间(可选)
  resumeId: ObjectId,      // 关联的简历ID(可选)
  messageCount: Number,    // 消息数量
  status: String,          // 状态(active/closed)
  createdAt: Date,
  updatedAt: Date
}
```

#### 4.3.7 消息集合 (messages)

```javascript
{
  _id: ObjectId,
  conversationId: ObjectId, // 所属会话ID
  userId: ObjectId,        // 用户ID(如果是用户消息)
  fromUser: Boolean,       // 是否来自用户
  content: String,         // 消息内容
  type: String,            // 消息类型(text/voice/file)
  fileUrl: String,         // 文件URL(如果是文件消息)
  processingResults: {     // AI处理结果(如果是AI响应)
    extractedInfo: Object, // 提取的信息
    confidence: Number,    // 置信度
    action: String         // 执行的动作
  },
  createdAt: Date,
  duration: Number         // 处理耗时(毫秒)
}
```

### 4.4 索引设计

- **必要索引**:
  - 用户集合: `openid`(唯一), `unionid`(如有)
  - 简历集合: `userId`, `updatedAt`
  - 优化记录: `userId`, `resumeId`, `createdAt`
  - 积分记录: `userId`, `createdAt`
  - 会话集合: `userId`, `startTime`
  - 消息集合: `conversationId`, `createdAt`

- **复合索引**:
  - 简历查询: `{userId: 1, updatedAt: -1}`
  - 优化记录: `{userId: 1, jobInfo.title: 1}`
  - 消息查询: `{conversationId: 1, createdAt: 1}`

- **索引管理原则**:
  - 定期检查索引使用情况
  - 删除未使用的索引
  - 对大集合避免过多索引

### 4.5 数据库操作规范

- **查询优化**:
  - 总是使用索引字段进行查询
  - 限制返回字段: `projection`只返回必要字段
  - 分页查询: 始终使用limit和skip控制结果集大小

- **写入优化**:
  - 批量操作: 使用bulkWrite减少操作次数
  - 原子更新: 使用原子操作符(如$set, $inc)
  - 避免频繁更新: 合并多次更新为一次

- **事务处理**:
  - 涉及多文档更新的关键业务使用事务
  - 记录事务执行的日志，便于问题追踪
  - 设置合理的超时时间

## 5. AI Agent设计规范

### 5.1 Agent架构

- **Agent类型**:
  - 职业咨询顾问Agent: 负责对话收集用户信息
  - 简历优化执行器: 负责基于JD优化简历

- **通用架构**:
  ```
  用户输入 → 
  前处理(标准化、敏感信息过滤) → 
  上下文管理 → 
  DeepSeek R1调用 → 
  输出解析与验证 → 
  后处理(格式化、安全检查) → 
  返回结果
  ```

- **模块化设计**:
  - 输入处理模块: 标准化用户输入
  - 上下文管理模块: 维护对话历史
  - 提示词生成模块: 动态构建Prompt
  - API调用模块: 与DeepSeek R1交互
  - 输出处理模块: 解析和验证AI响应
  - 业务规则模块: 应用领域规则与约束

### 5.2 职业咨询顾问Agent设计

- **核心功能**:
  - 通过对话提取用户信息
  - 结构化存储简历数据
  - 提供专业的简历建议

- **提示词设计原则**:
  - 保持专业咨询顾问角色一致性
  - 结构化提问，逐步深入
  - 提供具体示例和引导

- **交互策略**:
  - 渐进式信息获取: 从基础→教育→工作→项目→技能
  - 关键信息追问: 对模糊或不完整信息主动追问
  - 信息确认: 定期总结已获取信息，确认准确性

- **示例Prompt结构**:
  ```
  # 角色
  你是一位拥有十年经验的职业咨询顾问，专长于简历优化和职业规划。

  # 当前任务
  帮助用户通过对话方式完善简历信息。当前简历状态：
  ${当前简历JSON}
  
  # 对话历史
  ${过去的对话记录}
  
  # 指导策略
  1. 关注尚未填写的关键字段
  2. 对模糊表达请求具体例子
  3. 使用STAR方法引导用户描述经历
  
  # 响应要求
  - 保持专业、友好的对话风格
  - 回复中包含明确问题或引导方向
  - 识别并结构化存储有用信息
  ```

### 5.3 简历优化执行器设计

- **核心功能**:
  - 分析JD要求和关键词
  - 评估简历与JD的匹配度
  - 生成针对性的优化建议

- **处理流程**:
  ```
  职位JD + 用户简历 →
  JD解析(提取关键要求和技能) →
  简历分析(识别优势和不足) →
  匹配度评估 →
  生成优化建议(内容调整、顺序调整、表达优化) →
  最终输出(带修改理由的结构化结果)
  ```

- **优化策略**:
  - 关键词匹配: 确保简历包含JD中的关键词
  - 内容调整: 根据岗位要求突出相关经历
  - 表达优化: 使用更专业、更精确的描述
  - 数据量化: 添加具体数字和业绩指标

- **示例Prompt结构**:
  ```
  # 任务
  优化用户简历以匹配目标职位要求。
  
  # 输入数据
  ## 职位描述
  ${职位JD全文}
  
  ## 提取的关键要求
  技能要求: ${技能列表}
  经验要求: ${经验要求}
  学历要求: ${学历要求}
  
  ## 用户当前简历
  ${简历JSON数据}
  
  # 优化规则
  1. 保留用户原有信息，不添加虚构内容
  2. 调整内容顺序，突出与岗位相关的经历
  3. 优化表达方式，使用行业术语和动作导向描述
  4. 标记所有修改并提供理由
  
  # 输出格式
  请输出JSON格式的优化建议，包含:
  1. 匹配度评分(0-100)
  2. 总体建议
  3. 具体修改(包括修改类型、位置、原内容、新内容和修改理由)
  ```

### 5.4 Agent性能优化

- **响应时间优化**:
  - 缓存常见问题响应
  - 并行处理独立任务
  - 增量生成(流式输出)

- **准确性优化**:
  - 规则约束生成内容
  - 多轮验证关键信息
  - 领域知识库辅助决策

- **资源利用优化**:
  - 批处理请求减少API调用
  - 动态调整上下文长度
  - 定期清理非活跃会话

### 5.5 Agent监控与改进

- **性能指标**:
  - 响应时间: 平均/p95/p99
  - 完成率: 成功完成任务的比例
  - 准确度: 生成内容的准确性评分
  - 用户满意度: 显式与隐式反馈

- **日志记录**:
  - 输入日志: 记录用户请求
  - 处理日志: 记录中间步骤与决策
  - 输出日志: 记录最终响应
  - 错误日志: 记录失败原因和上下文

- **持续改进机制**:
  - A/B测试: 比较不同提示词策略效果
  - 人工反馈: 标注错误案例用于优化
  - 定期回顾: 分析典型失败场景并改进

## 6. 安全规范

### 6.1 认证与授权

- **认证机制**:
  - 基于JWT的无状态认证
  - 令牌有效期: 访问令牌2小时，刷新令牌7天
  - 令牌轮换: 每次使用刷新令牌生成新的访问令牌

- **授权策略**:
  - 基于角色的访问控制(RBAC)
  - 最小权限原则: 仅授予必要权限
  - 资源所有权验证: 确认用户只能访问自己的资源

- **API权限保护**:
  ```javascript
  // 身份验证中间件
  const authMiddleware = (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new Error('未提供认证令牌');
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '未认证或认证已过期'
        }
      });
    }
  };
  
  // 资源所有权验证中间件
  const ownershipMiddleware = (resourceType) => async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await db.collection(resourceType).findOne({
        _id: ObjectId(resourceId),
        userId: ObjectId(req.user.id)
      });
      
      if (!resource) throw new Error('资源不存在或无权访问');
      
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '无权访问此资源'
        }
      });
    }
  };
  ```

### 6.2 数据安全

- **敏感数据处理**:
  - 用户密码: 使用bcrypt哈希存储
  - 微信openid: 加密存储
  - 个人联系方式: 脱敏显示

- **数据传输安全**:
  - 全站HTTPS
  - API请求签名验证
  - 敏感数据传输加密

- **AI数据安全**:
  - 清理提示词中的敏感信息
  - 限制AI模型能访问的用户信息范围
  - AI生成内容的安全过滤

### 6.3 防护措施

- **输入验证**:
  - 所有用户输入严格验证
  - 预防XSS: 转义用户输入
  - 预防SQL注入: 参数化查询和ORM

- **速率限制**:
  ```javascript
  const rateLimit = require('express-rate-limit');
  
  // API请求限制
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每IP限制100次请求
    standardHeaders: true,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMITED',
        message: '请求过于频繁，请稍后再试'
      }
    }
  });
  
  // 登录请求限制(更严格)
  const loginLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    max: 10, // 每IP限制10次登录请求
    standardHeaders: true,
    message: {
      success: false,
      error: {
        code: 'LOGIN_RATE_LIMITED',
        message: '登录尝试过多，请1小时后再试'
      }
    }
  });
  ```

- **错误处理**:
  - 统一错误处理中间件
  - 生产环境隐藏详细错误信息
  - 错误日志记录与监控

## 7. 性能优化规范

### 7.1 响应时间优化

- **API响应目标**:
  - 普通请求: <200ms
  - 复杂查询: <500ms
  - AI处理: <3000ms

- **缓存策略**:
  - Redis缓存热点数据
  - 内存缓存频繁访问的静态数据
  - HTTP缓存控制响应头

- **数据库优化**:
  - 索引覆盖查询
  - 读写分离(需要时)
  - 定期数据库维护与优化

### 7.2 负载处理

- **水平扩展**:
  - 无状态服务设计
  - 负载均衡分配请求
  - 自动扩缩容配置

- **异步处理**:
  - 使用消息队列处理耗时任务
  - 任务调度与限流
  - 非阻塞I/O操作

- **资源限制**:
  - 限制单个请求处理时间
  - 内存使用限制与监控
  - 服务优雅降级策略

### 7.3 AI性能优化

- **模型调用优化**:
  - 批处理合并请求
  - 缓存相似问题的回答
  - 请求超时与重试策略

- **上下文管理**:
  - 动态调整上下文长度
  - 重要信息优先原则
  - 定期清理非关键上下文

- **流式响应**:
  - 增量生成与展示
  - 分步处理复杂任务
  - 即时反馈提升体验

## 8. 开发与部署流程

### 8.1 开发流程

- **Git工作流**:
  - 主分支: main/master(生产)
  - 开发分支: develop(开发集成)
  - 功能分支: feature/*
  - 发布分支: release/*
  - 修复分支: hotfix/*

- **代码审查**:
  - 提交前自测
  - 至少一人同行评审
  - 自动化检查(ESLint, 测试)

- **测试策略**:
  - 单元测试: 覆盖核心逻辑
  - 集成测试: 验证模块交互
  - API测试: 验证端点行为
  - 性能测试: 关键路径负载测试

### 8.2 部署流程

- **环境定义**:
  - 开发环境: 开发人员测试
  - 测试环境: QA团队测试
  - 预生产环境: 最终验证
  - 生产环境: 用户访问

- **CI/CD流程**:
  - 代码提交触发构建
  - 自动化测试执行
  - 通过测试后部署到相应环境
  - 生产部署需人工确认

- **部署策略**:
  - 蓝绿部署: 切换流量到新版本
  - 金丝雀发布: 部分用户先体验新版本
  - 回滚机制: 快速恢复到上一版本

### 8.3 监控与日志

- **监控体系**:
  - 系统监控: CPU、内存、磁盘使用率
  - 应用监控: 请求量、响应时间、错误率
  - 业务监控: 用户活跃度、功能使用率

- **日志管理**:
  - 格式规范: JSON结构化日志
  - 分级策略: ERROR > WARN > INFO > DEBUG
  - 集中存储: ELK或类似日志平台

- **告警机制**:
  - 实时监控异常
  - 多渠道通知(邮件、短信、企业微信)
  - 告警升级策略

## 9. 文档与注释规范

### 9.1 代码注释

- **文件头注释**:
  ```javascript
  /**
   * @file 用户服务模块
   * @description 处理用户注册、登录、积分等核心功能
   * @author 开发者姓名 <email@example.com>
   * @created 2023-06-01
   */
  ```

- **函数注释**:
  ```javascript
  /**
   * 创建新用户账户
   * @param {Object} userData - 用户数据
   * @param {string} userData.openid - 微信openid
   * @param {string} userData.nickname - 用户昵称
   * @param {string} userData.avatar - 头像URL
   * @returns {Promise<Object>} 创建的用户对象
   * @throws {Error} 如果创建失败或参数无效
   */
  async function createUser(userData) {
    // 函数实现
  }
  ```

- **代码块注释**:
  ```javascript
  // 复杂算法实现
  // 1. 首先计算匹配度分数
  // 2. 然后基于分数调整权重
  // 3. 最后生成优化建议
  ```

### 9.2 API文档

- **Swagger/OpenAPI规范**:
  ```yaml
  /api/users:
    post:
      summary: 创建新用户
      description: 基于微信小程序登录创建新用户账户
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [code]
              properties:
                code:
                  type: string
                  description: 微信登录临时凭证
      responses:
        '201':
          description: 创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          description: 参数错误
        '500':
          description: 服务器错误
  ```

- **README文档**:
  - 项目概述
  - 环境要求与配置
  - 安装与启动步骤
  - 主要API说明
  - 开发指南

### 9.3 数据库文档

- **集合设计文档**:
  - 每个集合必须有设计文档
  - 文档内容包括: 集合用途、字段说明、索引说明、示例文档
  - 使用表格形式记录字段属性

  ```markdown
  ## 用户集合(users)设计

  ### 用途
  存储用户基本信息、积分信息及统计数据。

  ### 字段说明
  | 字段名 | 类型 | 必填 | 默认值 | 说明 |
  |-------|------|------|-------|------|
  | _id | ObjectId | 是 | 自动生成 | 用户唯一标识 |
  | openid | String | 是 | - | 微信小程序openid |
  | unionid | String | 否 | null | 微信开放平台unionid |
  | nickname | String | 是 | - | 用户昵称 |
  | ... | ... | ... | ... | ... |

  ### 索引
  | 索引名 | 字段 | 类型 | 说明 |
  |-------|------|------|------|
  | openid_unique | { openid: 1 } | 唯一索引 | 确保openid唯一 |
  | ... | ... | ... | ... |

  ### 示例文档
  ```json
  {
    "_id": "507f1f77bcf86cd799439011",
    "openid": "oj7Nq5gYs6e-1duI_9p40gLtD-ZY",
    "nickname": "用户A",
    ...
  }
  ```

- **关系图**:
  - 使用ERD图表示集合间关系
  - 注明引用关系和嵌入关系
  - 定期更新以保持与实际设计一致

## 10. 错误处理规范

### 10.1 错误分类

- **系统错误**:
  - 数据库连接错误
  - 第三方API调用失败
  - 资源不足(内存、磁盘等)

- **业务错误**:
  - 参数验证失败
  - 权限不足
  - 业务规则冲突

- **用户输入错误**:
  - 格式错误
  - 数据不完整
  - 违反约束条件

### 10.2 错误码设计

- **错误码格式**: `模块_错误类型_具体错误`
  - 示例: `AUTH_INVALID_TOKEN`, `USER_NOT_FOUND`, `RESUME_VALIDATION_FAILED`

- **错误码映射表**:

  ```javascript
  const ERROR_CODES = {
    // 认证相关
    'AUTH_INVALID_TOKEN': {
      statusCode: 401,
      message: '无效的认证令牌'
    },
    'AUTH_EXPIRED_TOKEN': {
      statusCode: 401,
      message: '认证令牌已过期'
    },
    
    // 用户相关
    'USER_NOT_FOUND': {
      statusCode: 404,
      message: '用户不存在'
    },
    'USER_ALREADY_EXISTS': {
      statusCode: 409,
      message: '用户已存在'
    },
    
    // 简历相关
    'RESUME_NOT_FOUND': {
      statusCode: 404,
      message: '简历不存在'
    },
    'RESUME_VALIDATION_FAILED': {
      statusCode: 400,
      message: '简历数据验证失败'
    },
    
    // AI处理相关
    'AI_PROCESSING_FAILED': {
      statusCode: 500,
      message: 'AI处理失败'
    },
    'AI_TIMEOUT': {
      statusCode: 504,
      message: 'AI处理超时'
    },
    
    // 系统相关
    'SYSTEM_DATABASE_ERROR': {
      statusCode: 500,
      message: '数据库操作失败'
    },
    'SYSTEM_THIRD_PARTY_ERROR': {
      statusCode: 502,
      message: '第三方服务调用失败'
    }
  };
  ```

### 10.3 错误处理流程

- **捕获与记录**:
  ```javascript
  try {
    // 业务逻辑
  } catch (error) {
    // 记录错误
    logger.error({
      message: error.message,
      stack: error.stack,
      context: {
        user: req.user?.id,
        endpoint: req.originalUrl,
        method: req.method
      }
    });
    
    // 转换为统一错误格式
    const appError = convertToAppError(error);
    
    // 响应客户端
    res.status(appError.statusCode).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details
      }
    });
  }
  ```

- **错误转换函数**:
  ```javascript
  function convertToAppError(error) {
    // 如果已经是应用错误直接返回
    if (error.isAppError) return error;
    
    // 根据错误类型转换
    if (error.name === 'ValidationError') {
      return {
        isAppError: true,
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        message: '请求数据验证失败',
        details: error.details
      };
    }
    
    if (error.name === 'MongoError' && error.code === 11000) {
      return {
        isAppError: true,
        code: 'DUPLICATE_ENTITY',
        statusCode: 409,
        message: '创建的实体已存在',
        details: { duplicateKey: Object.keys(error.keyPattern)[0] }
      };
    }
    
    // 默认为服务器错误
    return {
      isAppError: true,
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
      message: '服务器内部错误',
      details: process.env.NODE_ENV === 'production' ? null : {
        originalMessage: error.message,
        stack: error.stack
      }
    };
  }
  ```

- **全局错误处理中间件**:
  ```javascript
  app.use((err, req, res, next) => {
    // 记录错误
    logger.error({
      message: err.message,
      stack: err.stack,
      context: {
        user: req.user?.id,
        endpoint: req.originalUrl,
        method: req.method
      }
    });
    
    // 转换错误
    const appError = convertToAppError(err);
    
    // 响应客户端
    res.status(appError.statusCode).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details
      }
    });
  });
  ```

### 10.4 前端错误处理

- **错误响应处理**:
  - 对不同错误码采取不同处理策略
  - 友好展示错误信息
  - 提供恢复操作建议

- **重试策略**:
  - 网络错误自动重试
  - 指数退避算法(exponential backoff)
  - 重试次数限制

- **用户友好提示**:
  ```javascript
  function handleApiError(error) {
    // 检查是否是网络错误
    if (!error.response) {
      wx.showToast({
        title: '网络连接失败，请检查网络设置',
        icon: 'none'
      });
      return;
    }
    
    // 处理常见HTTP错误
    switch (error.response.status) {
      case 401:
        // 未授权，重新登录
        wx.showModal({
          title: '登录已过期',
          content: '请重新登录继续使用',
          showCancel: false,
          success: () => {
            // 跳转登录页
            wx.navigateTo({ url: '/pages/login/login' });
          }
        });
        break;
        
      case 403:
        wx.showToast({
          title: '您没有权限执行此操作',
          icon: 'none'
        });
        break;
        
      case 404:
        wx.showToast({
          title: '请求的资源不存在',
          icon: 'none'
        });
        break;
        
      case 500:
      case 502:
      case 503:
        wx.showToast({
          title: '服务器暂时不可用，请稍后再试',
          icon: 'none'
        });
        break;
        
      default:
        // 处理业务错误码
        const errorCode = error.response.data?.error?.code;
        const errorMessage = error.response.data?.error?.message || '操作失败，请重试';
        
        wx.showToast({
          title: errorMessage,
          icon: 'none'
        });
    }
  }
  ```

## 11. 测试规范

### 11.1 测试类型与覆盖率

- **单元测试**:
  - 覆盖率目标: 业务逻辑代码 80%+
  - 重点测试: 服务层(services)、工具函数(utils)
  - 技术选择: Jest或Mocha+Chai

- **集成测试**:
  - 覆盖率目标: 主要API端点 90%+
  - 包含数据库交互
  - 技术选择: Supertest

- **性能测试**:
  - 关键API的性能基准
  - 负载测试(模拟高并发)
  - 技术选择: k6、Apache JMeter

### 11.2 单元测试规范

- **测试文件命名**:
  - 与被测文件对应
  - 后缀为`.test.js`或`.spec.js`
  - 示例: `user-service.js` → `user-service.test.js`

- **目录结构**:
  ```
  src/
    ├── services/
    │   └── user-service.js
    └── utils/
        └── validator.js
  tests/
    ├── unit/
    │   ├── services/
    │   │   └── user-service.test.js
    │   └── utils/
    │       └── validator.test.js
    └── integration/
        └── api/
            └── user-api.test.js
  ```

- **测试组织**:
  ```javascript
  // user-service.test.js
  const UserService = require('../../src/services/user-service');
  const db = require('../../src/config/db');
  const { mockUser, mockResumeData } = require('../mocks/user-mocks');
  
  // 模拟数据库依赖
  jest.mock('../../src/config/db');
  
  describe('UserService', () => {
    beforeEach(() => {
      // 重置模拟和测试状态
      jest.clearAllMocks();
    });
    
    describe('createUser', () => {
      it('should create a user with correct data', async () => {
        // 准备
        db.users.insertOne.mockResolvedValue({ 
          ops: [{ _id: 'mock-id', ...mockUser }]
        });
        
        // 执行
        const result = await UserService.createUser(mockUser);
        
        // 断言
        expect(db.users.insertOne).toHaveBeenCalledWith(expect.objectContaining({
          openid: mockUser.openid,
          nickname: mockUser.nickname
        }));
        expect(result).toHaveProperty('_id', 'mock-id');
        expect(result).toHaveProperty('openid', mockUser.openid);
      });
      
      it('should throw error when required field is missing', async () => {
        // 准备
        const invalidUser = { ...mockUser };
        delete invalidUser.openid;
        
        // 执行 & 断言
        await expect(UserService.createUser(invalidUser))
          .rejects
          .toThrow('openid is required');
      });
    });
    
    // 更多测试...
  });
  ```

### 11.3 API测试规范

- **测试基本流程**:
  - 设置测试数据
  - 发起API请求
  - 验证响应状态和数据
  - 清理测试数据

- **示例**:
  ```javascript
  // user-api.test.js
  const request = require('supertest');
  const app = require('../../src/app');
  const db = require('../../src/config/db');
  const { generateToken } = require('../../src/utils/auth');
  
  describe('User API', () => {
    let testUser;
    let authToken;
    
    beforeAll(async () => {
      // 连接测试数据库
      await db.connect(process.env.TEST_DB_URI);
      
      // 创建测试用户
      testUser = await db.users.insertOne({
        openid: 'test-openid',
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // 生成认证令牌
      authToken = generateToken({ id: testUser.insertedId });
    });
    
    afterAll(async () => {
      // 清理测试数据
      await db.users.deleteOne({ _id: testUser.insertedId });
      await db.close();
    });
    
    describe('GET /api/users/me', () => {
      it('should return current user when authenticated', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .set('Authorization', `Bearer ${authToken}`)
          .expect(200);
          
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty('nickname', '测试用户');
      });
      
      it('should return 401 when not authenticated', async () => {
        const response = await request(app)
          .get('/api/users/me')
          .expect(401);
          
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('UNAUTHORIZED');
      });
    });
    
    // 更多测试...
  });
  ```

### 11.4 模拟与存根

- **依赖模拟**:
  - 外部API调用
  - 数据库操作
  - 文件系统操作

- **模拟技术**:
  ```javascript
  // 模拟微信API
  jest.mock('../../src/utils/wx-api', () => ({
    code2Session: jest.fn().mockResolvedValue({
      openid: 'mock-openid',
      session_key: 'mock-session-key'
    }),
    generateQRCode: jest.fn().mockResolvedValue('https://example.com/qrcode.jpg')
  }));
  
  // 模拟AI服务
  jest.mock('../../src/services/ai-service', () => ({
    analyzeResume: jest.fn().mockImplementation((resume) => Promise.resolve({
      score: 85,
      suggestions: [
        { type: 'improvement', section: 'skills', message: '建议添加更多技能关键词' }
      ]
    }))
  }));
  ```

### 11.5 持续集成测试

- **CI流程中的测试**:
  - 每次提交运行单元测试
  - Pull Request运行完整测试套件
  - 定期运行性能测试

- **测试报告**:
  - 生成覆盖率报告
  - 性能测试结果趋势
  - 测试失败即时通知

## 12. 国际化与多语言支持

### 12.1 后端多语言设计

- **错误消息多语言**:
  ```javascript
  const ERROR_MESSAGES = {
    'zh-CN': {
      'AUTH_INVALID_TOKEN': '无效的认证令牌',
      'USER_NOT_FOUND': '用户不存在',
      // 更多错误消息
    },
    'en-US': {
      'AUTH_INVALID_TOKEN': 'Invalid authentication token',
      'USER_NOT_FOUND': 'User not found',
      // 更多错误消息
    }
  };
  
  function getLocalizedErrorMessage(code, lang = 'zh-CN') {
    return ERROR_MESSAGES[lang]?.[code] || ERROR_MESSAGES['zh-CN'][code] || code;
  }
  ```

- **内容多语言**:
  - 数据库字段设计支持多语言
  - 动态返回匹配用户语言的内容

```javascript
// 支持多语言的模板设计
{
  _id: ObjectId,
  name: {
    'zh-CN': '简约商务模板',
    'en-US': 'Simple Business Template'
  },
  description: {
    'zh-CN': '适合商务人士的简洁专业模板',
    'en-US': 'A clean professional template for business professionals'
  },
  // 其他字段
}
```

### 12.2 语言检测与选择

- **语言检测**:
  - 基于用户设置
  - 请求头`Accept-Language`
  - 默认语言设置

- **语言中间件**:
  ```javascript
  function languageMiddleware(req, res, next) {
    // 尝试从多个来源获取语言设置
    const lang = req.query.lang || 
                req.headers['accept-language']?.split(',')[0] || 
                req.user?.preferredLanguage ||
                'zh-CN';
                
    // 验证支持的语言
    req.lang = SUPPORTED_LANGUAGES.includes(lang) ? lang : 'zh-CN';
    
    next();
  }
  ```

## 13. 维护与更新规范

### 13.1 版本管理

- **语义化版本**:
  - 主版本号(MAJOR): 不兼容的API变更
  - 次版本号(MINOR): 向后兼容的功能新增
  - 修订号(PATCH): 向后兼容的问题修正

- **变更日志维护**:
  - 每次发布更新CHANGELOG.md
  - 分类记录新特性、改进、修复
  - 标注不兼容变更和弃用功能

### 13.2 技术栈更新

- **依赖管理**:
  - 定期更新依赖版本
  - 重点关注安全更新
  - 大版本升级需测试验证

- **技术迁移策略**:
  - 渐进式迁移
  - 保持向后兼容
  - 充分的测试覆盖

### 13.3 代码重构

- **重构准则**:
  - 有充分的测试覆盖
  - 小步迭代，避免大规模重写
  - 重构前后行为一致

- **重构时机**:
  - 频繁修改的代码区域
  - 复杂度过高的模块
  - 性能瓶颈点

## 14. 总结

本文档定义了AI定制简历小程序后端系统的完整技术规范，涵盖从技术选型、代码规范、API设计、数据库设计、AI Agent实现到部署运维的各个环节。遵循这些规范将确保系统的可靠性、安全性、可维护性和可扩展性，为用户提供高质量的简历定制服务体验。

所有团队成员应熟悉并严格遵循这些规范。规范会随项目发展持续更新，团队成员发现不合理的地方可提出改进建议。
