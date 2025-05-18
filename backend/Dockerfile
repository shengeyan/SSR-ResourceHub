# Node.js 构建镜像
FROM node:22.7.0

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
# RUN npm install
RUN npm install --force

# 复制项目文件
COPY . .

# 编译 NestJS 项目
RUN npm run build

# 暴露端口
EXPOSE 3011

# 启动后端应用
CMD ["npm", "run", "start:prod"]