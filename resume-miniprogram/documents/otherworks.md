# AI简历定制小程序配置工作清单

## 1. 微信小程序开发准备

### 1.1 注册小程序开发者账号
- 访问微信公众平台 (https://mp.weixin.qq.com/)
- 选择"小程序"注册
- 填写主体信息（个人或企业）
- 提交相关认证材料
- 完成邮箱和手机验证
- 支付认证费用（企业类型需要300元认证费）

### 1.2 小程序基础配置
- 登录小程序管理后台
- 配置小程序基本信息：名称、图标、简介
- 配置服务类目（建议选择"教育 - 教育信息服务"或"工具 - 效率工具"）
- 设置小程序管理成员和权限

### 1.3 开发者工具配置
- 下载并安装微信开发者工具
- 创建项目并关联小程序AppID
- 配置开发环境（勾选"不校验合法域名"等开发选项）
- 启用ES6转ES5、增强编译等功能

### 1.4 小程序接口权限申请
- 申请微信登录权限
- 申请获取用户信息权限
- 申请微信支付功能（需完成商户号申请）
- 申请订阅消息能力
- 申请OCR识别能力（如需使用）
- 申请音频内容识别能力（语音输入功能）

### 1.5 服务器域名配置
- 登录小程序管理后台，前往"开发 - 开发设置"
- 配置以下域名：
  * request合法域名（后端API域名）
  * uploadFile合法域名（文件上传域名）
  * downloadFile合法域名（文件下载域名）
  * socket合法域名（如使用WebSocket）
- 配置业务域名（网页内嵌需要）
- 注意：所有域名必须有有效的SSL证书（https）

## 2. 服务器环境准备

### 2.1 云服务器购买与设置
- 选择云服务提供商：腾讯云、阿里云、华为云等
- 购买云服务器（建议配置）：
  * CPU: 4核+
  * 内存: 8GB+
  * 硬盘: 100GB+（SSD）
  * 带宽: 5Mbps+
  * 操作系统: CentOS 7+ 或 Ubuntu 18.04+
- 完成初始化设置：
  * 修改默认密码
  * 创建普通用户（避免使用root）
  * 更新系统包

### 2.2 服务器安全配置
- 配置防火墙：
  ```bash
  # Ubuntu
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  
  # CentOS
  sudo firewall-cmd --permanent --add-service=ssh
  sudo firewall-cmd --permanent --add-service=http
  sudo firewall-cmd --permanent --add-service=https
  sudo firewall-cmd --reload
  ```
- 禁用root远程登录
- 设置SSH密钥认证
- 安装并配置fail2ban防暴力破解

### 2.3 域名注册与配置
- 注册项目域名（如ai-resume.example.com）
- 配置DNS解析，将域名指向服务器IP
- 申请并配置SSL证书：
  * 推荐使用Let's Encrypt免费证书
  * 配置自动续期脚本

### 2.4 Web服务器配置
- 安装Nginx：
  ```bash
  # Ubuntu
  sudo apt update
  sudo apt install nginx
  
  # CentOS
  sudo yum install epel-release
  sudo yum install nginx
  ```
- 配置Nginx虚拟主机：
  ```nginx
  server {
    listen 443 ssl http2;
    server_name api.ai-resume.example.com;
    
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    
    location / {
      proxy_pass http://localhost:3000;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
    }
  }
  
  # HTTP重定向HTTPS
  server {
    listen 80;
    server_name api.ai-resume.example.com;
    return 301 https://$host$request_uri;
  }
  ```
- 验证并启动Nginx配置

### 2.5 Node.js环境配置
- 安装Node.js（推荐使用nvm）：
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
  nvm install 16
  ```
- 安装PM2进程管理器：
  ```bash
  npm install -g pm2
  ```
- 配置系统环境变量：
  ```bash
  # 创建环境变量文件
  vim /etc/environment
  
  # 添加应用所需的环境变量
  NODE_ENV=production
  PORT=3000
  DB_URI=mongodb://localhost:27017/ai_resume
  JWT_SECRET=your_jwt_secret
  WX_APP_ID=your_app_id
  WX_APP_SECRET=your_app_secret
  AI_API_KEY=your_ai_api_key
  # ... 其他环境变量
  ```

## 3. 数据库环境设置

### 3.1 MongoDB安装与配置
- 安装MongoDB：
  ```bash
  # Ubuntu
  sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
  echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
  sudo apt update
  sudo apt install -y mongodb-org
  
  # CentOS
  echo "[mongodb-org-4.4]
  name=MongoDB Repository
  baseurl=https://repo.mongodb.org/yum/redhat/\$releasever/mongodb-org/4.4/x86_64/
  gpgcheck=1
  enabled=1
  gpgkey=https://www.mongodb.org/static/pgp/server-4.4.asc" | sudo tee /etc/yum.repos.d/mongodb-org-4.4.repo
  sudo yum install -y mongodb-org
  ```
- 启用MongoDB服务：
  ```bash
  sudo systemctl start mongod
  sudo systemctl enable mongod
  ```
- 配置MongoDB安全：
  * 创建管理员用户
  * 启用认证
  * 配置防火墙，限制数据库访问

### 3.2 Redis安装与配置
- 安装Redis：
  ```bash
  # Ubuntu
  sudo apt install redis-server
  
  # CentOS
  sudo yum install epel-release
  sudo yum install redis
  ```
- 修改Redis配置，启用持久化：
  ```bash
  sudo vim /etc/redis/redis.conf
  ```
  修改密码、禁用远程访问等安全设置
- 启动Redis服务：
  ```bash
  sudo systemctl start redis
  sudo systemctl enable redis
  ```

### 3.3 数据库初始化
- 创建应用数据库和用户：
  ```bash
  mongo
  
  use admin
  db.createUser({
    user: "admin",
    pwd: "secure_password",
    roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
  })
  
  use ai_resume
  db.createUser({
    user: "app_user",
    pwd: "app_password",
    roles: [ { role: "readWrite", db: "ai_resume" } ]
  })
  ```
- 导入初始数据：
  * 创建默认简历模板集合
  * 配置系统参数
  * 设置积分兑换比例

## 4. AI服务接入准备

### 4.1 DeepSeek R1 API设置
- 注册DeepSeek开发者账号
- 申请API访问权限
- 创建API密钥并记录
- 设置API使用限制和预算
- 配置IP白名单（添加服务器IP地址）

### 4.2 备选AI服务准备
- 考虑注册备用AI服务账号（如百度文心、讯飞星火等）
- 申请对应API密钥
- 设计故障转移策略

### 4.3 AI服务调用测试
- 编写测试脚本验证API连通性
- 测试各种场景的API响应
- 记录API性能基准数据

## 5. 微信支付配置

### 5.1 微信支付商户号申请
- 登录微信商户平台 (https://pay.weixin.qq.com/)
- 选择"注册商户号"
- 填写商户资料（需要营业执照等材料）
- 通过微信认证
- 开通小程序支付功能

### 5.2 支付参数配置
- 获取商户号(mch_id)
- 生成API密钥(key)
- 设置支付回调域名(notify_url)
- 配置支付授权目录

### 5.3 支付证书管理
- 下载API证书
- 安全存储证书文件
- 配置证书到服务端支付代码

### 5.4 支付测试
- 在开发环境测试支付流程
- 验证回调处理
- 测试退款功能

## 6. 云存储配置

### 6.1 对象存储服务设置
- 选择云存储服务（腾讯云COS、阿里云OSS等）
- 创建存储桶，建议以下结构：
  * resume-templates/ - 存储简历模板
  * user-resumes/ - 用户上传的简历
  * generated-documents/ - 生成的文档
  * public-assets/ - 公共资源文件
- 配置适当的访问权限

### 6.2 CDN配置
- 为静态资源配置CDN
- 设置缓存规则
- 配置HTTPS访问

### 6.3 文件访问权限管理
- 配置防盗链
- 设置跨域访问(CORS)策略
- 实现临时URL签名访问

## 7. 监控与日志系统

### 7.1 应用监控系统
- 安装服务器监控工具（如Prometheus + Grafana）
- 配置Node.js应用监控
- 设置监控告警规则

### 7.2 日志管理系统
- 配置集中式日志收集（ELK Stack或相似方案）
- 设置日志轮转策略
- 配置关键错误告警

### 7.3 异常捕获与报告
- 集成Sentry或类似服务
- 配置应用关键错误通知
- 设置每日错误摘要报告

## 8. CI/CD配置

### 8.1 代码仓库设置
- 创建Git仓库（GitHub、GitLab等）
- 配置分支保护规则
- 设置代码审查流程

### 8.2 持续集成配置
- 设置CI管道（GitHub Actions、Jenkins等）
- 配置代码测试、构建步骤
- 设置代码质量检查（ESLint等）

### 8.3 持续部署配置
- 配置自动部署流程
- 设置环境隔离（开发、测试、生产）
- 实现一键回滚机制

## 9. 备份与灾备

### 9.1 数据备份策略
- 配置MongoDB定时备份：
  ```bash
  # 创建备份脚本
  vim /usr/local/bin/backup_mongodb.sh
  
  # 脚本内容
  #!/bin/bash
  BACKUP_DIR="/backup/mongodb/$(date +%Y%m%d)"
  mkdir -p $BACKUP_DIR
  mongodump --uri="mongodb://app_user:app_password@localhost:27017/ai_resume" --out=$BACKUP_DIR
  find /backup/mongodb -type d -mtime +7 -exec rm -rf {} \;
  
  # 设置执行权限
  chmod +x /usr/local/bin/backup_mongodb.sh
  
  # 添加到crontab
  echo "0 2 * * * /usr/local/bin/backup_mongodb.sh >/dev/null 2>&1" | crontab -
  ```
- 配置文件系统备份
- 设置异地备份策略

### 9.2 灾难恢复计划
- 制定恢复流程文档
- 定期测试恢复流程
- 配置高可用方案（可选）

## 10. 微信审核准备

### 10.1 代码审核准备
- 确保代码符合微信规范
- 移除测试代码和调试信息
- 确保所有功能可正常使用

### 10.2 隐私政策准备
- 编写符合要求的隐私政策
- 在小程序中添加隐私协议入口
- 确保获取用户信息前有明确授权提示

### 10.3 审核资料准备
- 准备功能介绍文档
- 准备测试账号
- 准备操作说明文档
- 如有特殊功能，准备相关资质证明

## 11. 上线后运维工作

### 11.1 性能监控
- 定期检查系统性能指标
- 分析API响应时间
- 优化慢查询

### 11.2 安全维护
- 定期进行系统更新和补丁安装
- 监控异常访问行为
- 定期进行安全审计

### 11.3 数据分析
- 配置用户行为分析
- 建立BI报表系统
- 为产品迭代提供数据支持

### 11.4 定期备份验证
- 验证备份数据可恢复性
- 模拟灾难恢复演练
- 更新灾备文档

## 12. 其他注意事项

### 12.1 开发者证书管理
- 妥善保管微信开发者证书
- 配置证书到期提醒
- 准备证书更新流程

### 12.2 法律合规
- 确保符合《网络安全法》要求
- 遵守数据隐私保护规定
- 取得必要的业务资质

### 12.3 团队协作
- 建立开发文档库
- 设置代码规范检查
- 建立团队沟通渠道
