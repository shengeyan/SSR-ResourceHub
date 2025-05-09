# Node.js 构建镜像
FROM node:22.7.0 AS build

# 设置工作目录
WORKDIR /app

# npm：复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到容器中
COPY . .

# 构建生产环境的静态文件
RUN npm run build

# 验证 dist 文件是否存在
RUN ls -la /app/dist

# 使用 Nginx 提供静态文件服务
FROM nginx:alpine

COPY ./nginx.conf /etc/nginx/nginx.conf

# 删除 Nginx 默认的 index.html
RUN rm -rf /usr/share/nginx/html/*

# 复制 Vite 构建好的文件到 Nginx 默认目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"]