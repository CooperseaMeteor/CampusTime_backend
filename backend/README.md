# 校园食光 - Node.js 后端

## 项目说明
这是校园食光应用的后端服务，使用 Node.js + Express 框架实现用户注册和登录功能。

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置数据库
编辑 `.env` 文件，配置数据库连接信息：
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=campus_food
JWT_SECRET=your_secret_key
```

### 3. 创建数据库
使用 MySQL 客户端运行 `sql/init.sql` 文件：
```bash
mysql -u root -p < sql/init.sql
```

### 4. 启动开发服务器
```bash
npm run dev
```

服务器将在 `http://localhost:5000` 运行

## API 文档

### 注册用户
**POST** `/api/register`

请求体：
```json
{
  "username": "用户名",
  "password": "密码",
  "isAdmin": false
}
```

响应：
```json
{
  "code": 201,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "用户名",
    "role": "user"
  }
}
```

### 用户登录
**POST** `/api/login`

请求体：
```json
{
  "username": "用户名",
  "password": "密码"
}
```

响应：
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "userId": 1,
    "username": "用户名",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

### 获取用户信息
**GET** `/api/user`

请求头：
```
Authorization: Bearer token_here
```

响应：
```json
{
  "code": 200,
  "message": "获取用户信息成功",
  "data": {
    "id": 1,
    "username": "用户名",
    "role": "user",
    "status": "active",
    "created_at": "2025-12-15T10:00:00.000Z"
  }
}
```

## 项目结构
```
backend/
├── config/          # 配置文件
│   └── database.js  # 数据库连接配置
├── controllers/     # 控制器（业务逻辑）
│   └── authController.js
├── middleware/      # 中间件
│   └── auth.js      # JWT认证中间件
├── routes/          # 路由
│   └── auth.js      # 认证相关路由
├── sql/             # SQL脚本
│   └── init.sql     # 数据库初始化
├── server.js        # 应用入口
├── package.json     # 依赖配置
├── .env             # 环境变量
└── .gitignore       # Git忽略文件
```

## 开发建议
1. 修改 `.env` 中的 `JWT_SECRET` 为强密钥
2. 在生产环境中使用 HTTPS
3. 添加请求速率限制防止暴力攻击
4. 实现完整的错误日志记录

## 生产部署（阿里云宝塔）

### 环境准备
- 阿里云轻量/云服务器（Linux，宝塔面板，2核2G即可）
- 开放端口：`80`、`443`、`22`（SSH），数据库端口`3306`建议仅内网访问或IP白名单

### 步骤一：安装运行环境
1. 在宝塔面板：软件商店安装 `Nginx`、`MySQL`、`PM2`（或 Node.js）
2. SSH 服务器，确认 Node 版本：
```bash
node -v
npm -v
```
建议 Node.js `>= 18`

### 步骤二：部署代码
1. 在服务器创建目录并拉取代码（或上传压缩包解压）：
```bash
mkdir -p /srv/campustime/backend
cd /srv/campustime/backend
# 例如使用 git
git clone <your_repo_url> .
npm install
```
2. 复制环境变量模板并填写：
```bash
cp .env.example .env
# 修改 CORS_ORIGIN 为你的前端域名
# 修改 DB_* 为宝塔 MySQL 的账号/密码/库名
```

### 步骤三：初始化数据库
在服务器执行初始化 SQL：
```bash
mysql -u root -p < sql/init.sql
```
该脚本会创建 `users`、`refresh_tokens` 以及 Phase1 所需的 `merchants/stalls/dishes/reviews` 表，并插入少量示例数据。

### 步骤四：使用 PM2 启动后端
```bash
npm run build # 若需要
pm2 start server.js --name campustime-backend
pm2 save
pm2 status
```
如需开机自启：
```bash
pm2 startup
```

### 步骤五：配置 Nginx 反向代理
在宝塔面板为你的域名新建站点，反代到 `http://127.0.0.1:5000`，开启 HTTPS（Let’s Encrypt）。示例：
```
location /api/ {
  proxy_pass http://127.0.0.1:5000/api/;
  proxy_set_header Host $host;
  proxy_set_header X-Real-IP $remote_addr;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}
```

### 步骤六：安全与配置
- `.env` 中设置 `CORS_ORIGIN=https://你的前端域名`
- 数据库 `3306` 端口禁止公网直连，或设置访问白名单
- 使用强 `JWT_SECRET`（长度>=64的随机字符串）

### 验证
```bash
curl -s https://your-domain.com/api/health
```
返回 `{"status":"OK"}` 即部署成功

### 常见问题
- 端口被占用：
```bash
lsof -i:5000
kill -9 <pid>
```
- 数据库编码：确保 `utf8mb4`，防止中文乱码
