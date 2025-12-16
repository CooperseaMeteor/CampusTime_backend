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
