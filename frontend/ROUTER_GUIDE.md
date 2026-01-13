# CampusTime 前端路由系统使用指南

## 概述

这个路由系统集中管理所有页面路径、API地址和存储键值，使得：
- ✅ 修改任何路径/名字只需改 **一处地方**（config.js）
- ✅ 所有页面跳转自动更新
- ✅ 后期重构HTML文件时无需修改js逻辑
- ✅ 权限管理统一化

## 文件说明

### 1. `frontend/config.js` - 配置文件（核心）
集中定义所有路径和API端点
```javascript
// 登录页面
LOGIN_ROUTES.getAbsoluteUserLogin()    // → /login/user_login.html
LOGIN_ROUTES.getAbsoluteRegister()     // → /login/register.html

// 用户页面
USER_ROUTES.getAbsoluteIndex()         // → /main/user/user_index.html
USER_ROUTES.getAbsoluteProfile()       // → /main/user/user_profile.html
USER_ROUTES.getAbsoluteMerchantDetail(id) // → /main/user/merchant_detail.html?id=123

// 管理员页面
ADMIN_ROUTES.getAbsoluteIndex()        // → /main/admin/admin_index.html
ADMIN_ROUTES.getAbsoluteCanteenManage() // → /main/admin/canteen_manage.html

// API端点
API_BASE_URL                           // = 'http://39.108.138.4:5000/api'
API_ENDPOINTS.LOGIN                    // = '/login'
API_ENDPOINTS.MERCHANT_DETAIL(1)       // = '/merchants/1'
```

### 2. `frontend/router.js` - 路由工具函数
提供导航、权限检查、API调用、token管理等功能

## 使用方法

### 在HTML中引入脚本
```html
<!-- 必须先引入config.js -->
<script src="/config.js"></script>
<!-- 再引入router.js -->
<script src="/router.js"></script>
```

### 页面跳转
```javascript
// 跳转到用户首页
Router.toUserIndex();

// 跳转到管理员首页
Router.toAdminIndex();

// 跳转到注册页面
Router.toRegister();

// 跳转到指定商户详情
Router.toMerchantDetail(1);

// 自定义跳转
Router.navigate(USER_ROUTES.getAbsoluteCanteen());
```

### 用户认证
```javascript
// 检查是否登录
if (Router.isLoggedIn()) {
    console.log('已登录');
}

// 获取当前用户信息
const user = Router.getCurrentUser();
console.log(user.username, user.college, user.grade);

// 获取用户角色
const role = Router.getUserRole();  // 'user' 或 'admin'

// 检查是否有指定角色
if (Router.hasRole('admin')) {
    console.log('是管理员');
}

// 保存用户数据（登录后）
Router.saveUserData({
    accessToken: 'xxx',
    refreshToken: 'xxx',
    userId: 1,
    username: 'john',
    role: 'user',
    college: '计算机学院',
    grade: '大二'
});

// 清除用户数据（退出登录）
Router.clearUserData();

// 退出登录（含跳转）
Router.logout();
```

### API调用
```javascript
// GET请求
const merchants = await Router.apiCall(API_ENDPOINTS.MERCHANTS);

// POST请求 - 登录
const loginResponse = await Router.apiCall(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    body: JSON.stringify({
        username: 'user@example.com',
        password: 'password123'
    })
});

// GET单个商户
const merchant = await Router.apiCall(
    API_ENDPOINTS.MERCHANT_DETAIL(1)
);

// GET档口菜单
const dishes = await Router.apiCall(
    API_ENDPOINTS.STALL_DISHES(2)
);

// 自动处理：
// 1. 添加Content-Type: application/json
// 2. 自动加入Authorization: Bearer token
// 3. Token过期时自动刷新
// 4. 刷新失败时自动跳转到登录页
```

### 权限检查
```javascript
// 在页面加载时检查权限
if (!Router.checkPermissionAndRedirect('user')) {
    // 没有权限，函数内部已跳转
    return;
}
// 有权限，继续执行

// 或者在页面顶部检查
document.addEventListener('DOMContentLoaded', () => {
    if (!Router.isLoggedIn()) {
        alert('请先登录');
        Router.toUserLogin();
        return;
    }
});
```

## 实践示例

### 示例1: 登录页面
```html
<form id="loginForm">
    <input type="text" id="username" placeholder="用户名">
    <input type="password" id="password" placeholder="密码">
    <button type="submit">登录</button>
</form>

<script src="/config.js"></script>
<script src="/router.js"></script>
<script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const response = await Router.apiCall(API_ENDPOINTS.LOGIN, {
            method: 'POST',
            body: JSON.stringify({
                username: document.getElementById('username').value,
                password: document.getElementById('password').value
            })
        });
        
        if (response.code === 200) {
            // 保存用户信息
            Router.saveUserData(response.data);
            
            // 根据角色跳转
            if (response.data.role === 'admin') {
                Router.toAdminIndex();
            } else {
                Router.toUserIndex();
            }
        } else {
            alert('登录失败: ' + response.message);
        }
    });
</script>
```

### 示例2: 用户首页（需要权限）
```html
<script src="/config.js"></script>
<script src="/router.js"></script>
<script>
    // 页面初始化时自动检查权限
    document.addEventListener('DOMContentLoaded', () => {
        const user = Router.getCurrentUser();
        if (!user) {
            Router.toUserLogin();
            return;
        }
        
        // 显示用户信息
        document.getElementById('username').textContent = user.username;
        document.getElementById('college').textContent = user.college;
    });
    
    // 页面跳转
    function goToProfile() {
        Router.toUserProfile();
    }
    
    function goToCanteen() {
        Router.navigate(USER_ROUTES.getAbsoluteCanteen());
    }
</script>
```

### 示例3: API数据加载
```javascript
async function loadMerchants() {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.MERCHANTS);
        
        if (response.code === 200) {
            const merchants = response.data;
            // 渲染商户列表
            merchants.forEach(merchant => {
                console.log(merchant.name, merchant.id);
            });
        }
    } catch (error) {
        console.error('加载商户失败:', error);
        alert('网络错误，请稍后重试');
    }
}

// 页面加载时调用
document.addEventListener('DOMContentLoaded', loadMerchants);
```

## 修改指南

假设后期想改路径，如何操作？

### 场景1: 重命名文件
**旧:** `user_index.html`  
**新:** `home.html`

**只需修改 config.js 一处：**
```javascript
const USER_ROUTES = {
    INDEX: 'home.html',  // ← 改这里
    
    getAbsoluteIndex() {
        return `${CONFIG.getBaseUrl()}/main/user/home.html`;  // ← 这里自动对应
    }
};
```

所有引用 `USER_ROUTES.getAbsoluteIndex()` 的地方自动生效！

### 场景2: 变更目录结构
**旧:** `/main/user/`, `/main/admin/`  
**新:** `/pages/user/`, `/pages/admin/`

**只需修改 config.js 的getAbsolute方法：**
```javascript
const USER_ROUTES = {
    getAbsoluteIndex() {
        return `${CONFIG.getBaseUrl()}/pages/user/user_index.html`;  // ← 改这里
    }
    // ...其他方法类似修改
};
```

### 场景3: 变更API服务器地址
**旧:** `http://39.108.138.4:5000/api`  
**新:** `https://campustime.com/api`

**只需修改 config.js：**
```javascript
const CONFIG = {
    API_BASE_URL: 'https://campustime.com/api',  // ← 改这里
};
```

## 注意事项

1. **脚本顺序很重要**
   ```html
   <script src="/config.js"></script>    <!-- 必须先加载 -->
   <script src="/router.js"></script>    <!-- 后加载，依赖config.js -->
   ```

2. **Storage Keys 统一管理**
   所有localStorage操作都应该用 `STORAGE_KEYS.xxx`，避免硬编码字符串

3. **API调用自动处理认证**
   不需要手动加Authorization header，Router会自动处理

4. **Token刷新自动进行**
   如果access token过期，会自动使用refresh token获取新token

5. **权限检查自动执行**
   router.js加载时会自动检查当前页面权限

## 常见错误

### ❌ 错误1: 硬编码路径
```javascript
// 不要这样做！
window.location.href = '/main/user/user_index.html';
```

### ✅ 正确做法
```javascript
// 要这样做
Router.navigate(USER_ROUTES.getAbsoluteIndex());
// 或
Router.toUserIndex();
```

### ❌ 错误2: 硬编码API地址
```javascript
// 不要这样做！
fetch('http://39.108.138.4:5000/api/merchants', {...})
```

### ✅ 正确做法
```javascript
// 要这样做
Router.apiCall(API_ENDPOINTS.MERCHANTS, {...})
```

### ❌ 错误3: 硬编码localStorage键
```javascript
// 不要这样做！
localStorage.getItem('token');
```

### ✅ 正确做法
```javascript
// 要这样做
localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
```

## 总结

这个系统的核心优势：
1. **一站式管理** - 所有路径、API、键值都在config.js
2. **修改方便** - 改一处生效全局
3. **易于维护** - 后期重构HTML/API无需改js逻辑
4. **自动权限管理** - 登录状态和角色自动检查
5. **Token自动刷新** - 用户无感知刷新token
6. **统一API调用** - 所有请求统一处理认证、错误等
