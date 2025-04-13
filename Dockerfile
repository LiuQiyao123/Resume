# 使用 Node.js 16 作为基础镜像（根据package.json中的要求）
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 创建必要的目录
RUN mkdir -p logs uploads

# 复制所有文件到容器中
COPY . .

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=80

# 暴露端口（与微信云托管配置一致）
EXPOSE 80

# 启动命令
CMD ["npm", "start"]
