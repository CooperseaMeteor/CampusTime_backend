# 前端部署清单 - 管理员权限系统升级

## 📋 必须上传到服务器的文件

### 1️⃣ 登录系统（frontend/login/）
- ✅ `admin_login.html` - 已改造支持多职位登录

### 2️⃣ 管理员核心JS库（frontend/main/admin/）
- ✅ `admin-auth.js` - **新增**权限认证中间件
- ✅ `admin-navbar.js` - **新增**职位切换导航栏
- ✅ `admin-manager.js` - **新增**管理员管理逻辑

### 3️⃣ 配置文件（frontend/）
- ⚠️ `config.js` - 需要添加 `ADMIN_LOGIN: '/admin/login'` 接口

### 4️⃣ 管理页面改造（frontend/main/admin/）
需要在各个管理页面头部引入新的JS文件：

```html
<!-- 在 <head> 或 <body> 底部添加 -->
<script src="admin-auth.js"></script>
<script src="admin-navbar.js"></script>

<!-- 在页面顶部添加导航栏容器 -->
<div id="adminNavbar"></div>

<!-- 页面加载时检查权限 -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    // 检查页面访问权限（根据页面类型调整参数）
    AdminAuth.checkPageAccess('stall_admin'); // 最低要求档口管理员
    // AdminAuth.checkPageAccess('school_admin'); // 最低要求学校管理员
    // AdminAuth.checkPageAccess('super_admin'); // 仅超级管理员
});
</script>
```

需要改造的页面：
- `super_admin_index.html`
- `school_admin_index.html`
- `merchant_admin_index.html`  
- `stall_dashboard.html`
- `admin_manage.html`
- `canteen_manage.html`
- `comment_manage.html`
- 其他所有管理页面...

---

## 🔧 后端接口要求

### 必须实现的接口：

#### 1. 管理员登录
```
POST /api/admin/login
Body: { username, password }
Response: {
  code: 200,
  data: {
    token: "jwt_token",
    adminId: 123,
    adminInfo: {
      username: "超级管理员",
      real_name: "张三",
      identity_label: "教职工",
      identity_suffix: "主播",
      identity_suffix_status: "approved"
    },
    positions: [
      {
        id: 456,
        role: "super_admin",
        label: "平台 · 超级管理员",
        target: "/main/admin/super_admin_index.html",
        permissions: ["admin.*", "org.*", ...]
      }
    ]
  }
}
```

#### 2. 获取管理员列表
```
GET /api/admin/management/list
Headers: {
  Authorization: "Bearer token",
  X-Active-Position-Id: 456
}
Response: {
  code: 200,
  data: [
    {
      id: 1,
      username: "xxx",
      real_name: "xxx",
      identity_label: "教职工",
      identity_suffix: "主播",
      identity_suffix_status: "approved",
      positions: [
        {
          id: 1,
          role: "school_admin",
          school_id: 1,
          school_name: "XX大学"
        }
      ]
    }
  ]
}
```

#### 3. 创建管理员
```
POST /api/admin/management/create
Body: {
  username, password, real_name, phone, email,
  identity_label, identity_suffix,
  role, school_id, merchant_node_id, stall_id
}
```

#### 4. 其他接口
- `POST /api/admin/management/:id/disable` - 禁用管理员
- `POST /api/admin/management/:id/assign` - 调岗
- `POST /api/admin/management/:id/permissions` - 授权
- `GET /api/admin/management/my-created` - 我的创建

---

## 🚀 部署步骤

### Step 1: 上传新文件
```bash
# 在服务器上（宝塔文件管理或FTP）
1. 上传 admin-auth.js 到 frontend/main/admin/
2. 上传 admin-navbar.js 到 frontend/main/admin/
3. 上传 admin-manager.js 到 frontend/main/admin/
4. 覆盖 admin_login.html 到 frontend/login/
```

### Step 2: 修改各管理页面
在每个管理页面（super_admin_index.html等）添加：

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 原有内容 -->
</head>
<body>
    <!-- ✅ 新增：导航栏容器 -->
    <div id="adminNavbar"></div>
    
    <!-- 原有页面内容 -->
    
    <!-- ✅ 新增：引入JS库 -->
    <script src="admin-auth.js"></script>
    <script src="admin-navbar.js"></script>
    
    <!-- ✅ 新增：权限检查 -->
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        // 根据页面类型设置最低权限要求
        AdminAuth.checkPageAccess('super_admin'); // 仅超级管理员
    });
    </script>
</body>
</html>
```

### Step 3: 修改API调用
所有管理页面的API调用改用 `AdminAuth.apiCall()`：

```javascript
// ❌ 旧代码
fetch('/api/xxx', {
    headers: { 'Authorization': 'Bearer ' + token }
})

// ✅ 新代码
AdminAuth.apiCall('/xxx', { method: 'GET' })
```

### Step 4: 测试流程
1. 访问 `http://campusfood.cn/login/admin_login.html`
2. 使用测试账号登录（超级管理员/123456）
3. 如果有多职位，应弹出职位选择器
4. 进入管理后台，顶部应显示导航栏
5. 测试职位切换功能
6. 测试权限控制（按钮显隐）

---

## ⚠️ 重要注意事项

### 1. Token验证
后端必须实现中间件验证：
- 从 `Authorization` header 获取token
- 从 `X-Active-Position-Id` header 获取当前激活职位
- 验证token有效性
- 加载职位对应的权限列表
- 将权限信息挂载到 `req.adminContext`

### 2. 跨校禁止
- 同一账号不能绑定不同 `school_id` 的职位
- 后端创建职位时必须校验

### 3. 权限继承
- 新建管理员权限 = `操作者权限 ∩ 角色模板权限`
- 不能授予自己没有的权限

### 4. 自己不能操作自己
- 不能修改自己的权限
- 不能禁用自己
- 不能调整自己的职位

---

## 🐛 已知问题和TODO

### 已完成 ✅
- [x] 管理员登录支持多职位
- [x] 职位切换导航栏
- [x] 权限认证中间件
- [x] 管理员列表树状展示框架

### 待完成 🔨
- [ ] 后端实现完整的管理员接口
- [ ] 管理员创建表单完整实现
- [ ] 调岗功能实现
- [ ] 权限授予界面
- [ ] 身份标签后缀审核流程
- [ ] 审计日志查看
- [ ] "我的创建"列表
- [ ] 搜索跳转高亮
- [ ] 拖动调岗
- [ ] 商户树节点管理

---

## 📞 需要协调的事项

### 与后端对接
1. 确认 `/api/admin/login` 接口返回格式
2. 确认 `X-Active-Position-Id` header的处理方式
3. 确认权限列表的格式（数组 vs 对象）
4. 确认作用域数据过滤的实现方式

### 与前端组员协调
1. 统一在所有管理页面引入 `admin-auth.js` 和 `admin-navbar.js`
2. 统一使用 `AdminAuth.apiCall()` 进行API调用
3. 统一使用 `AdminAuth.hasPermission()` 进行按钮显隐控制
4. 统一页面布局（预留导航栏高度60px）

---

## 📚 相关文档
- 《管理员权限与层级规范V1.md》 - 完整设计规范
- `ADMIN_SYSTEM_IMPLEMENTATION_SUMMARY.md` - 后端实现总结
- `backend/routes/admin-management.js` - 后端路由参考

