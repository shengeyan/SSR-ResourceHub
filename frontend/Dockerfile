#  使用 Node 官方镜像
FROM node:22.7.0

# 设置工作目录
WORKDIR /app

# 复制依赖文件并安装
COPY package*.json ./
RUN npm install

# 复制全部代码
COPY . .

# 构建 SSR 项目
RUN npm run build

# 暴露端口（与 devServer 配置一致）
EXPOSE 3010

# 启动 Nuxt SSR 服务
CMD ["npm", "run", "start"]
