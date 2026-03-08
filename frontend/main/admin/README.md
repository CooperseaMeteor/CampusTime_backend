# 管理员管理系统 - 完整实现指南

## 项目概述

本文档介绍管理员管理系统的完整实现，包含后端 API、前端 UI、数据库设计、权限校验和审计日志等全部功能。

## 文件结构

```
backend/
├── sql/
│   └── admin_system.sql          # 数据库初始化脚本
├── middleware/
│   └── adminAuth.js              # 权限校验中间件
└── routes/
    └── admin-management.js        # 管理员管理 API

frontend/main/admin/
├── admin_manage.html             # 管理员列表主页面
├── admin-modals.js               # 弹窗组件库
├── admin-modals.css              # 弹窗样式
└── admin-search-manager.js       # 搜索和导航管理器
```

## 快速开始

### 1. 初始化数据库

```bash
mysql -u root -p < backend/sql/admin_system.sql
```

### 2. 配置后端路由

在 `backend/server.js` 中：

```javascript
const adminAuth = require('./middleware/adminAuth');
const adminMgmt = require('./routes/admin-management');

app.use('/api/admin', adminAuth.adminAuthMiddleware, adminMgmt);
```

### 3. 前端集成

在前端 HTML 中已自动包含必要脚本：

```html
<script src="admin-modals.js"></script>
<script src="admin-search-manager.js"></script>
```

## 核心功能

### 管理员列表（树状展示）
- 按学校→商户→档口的层级结构展示
- 按身份标签分组和排序
- 支持展开/折叠节点
- 显示各级节点计数

### 搜索功能
- 前缀匹配搜索名称或用户名
- 搜索结果自动展开树并高亮
- 支持快速跳转

### 我的创建
- 侧栏显示当前操作者创建的管理员
- 按创建时间倒序
- 快速编辑和导航

### 管理员操作
- **编辑** - 修改基本信息和身份标签
- **调岗** - 分配或变更职位
- **禁用** - 禁用账号（不删除）
- **更多**
  - 查看详情
  - 审核身份标签
  - 查看操作日志

## 权限体系

### 四层角色

| 角色 | 层级 | 作用域 | 权限 |
|------|------|--------|------|
| super_admin | L0 | 全校 | 所有权限 |
| school_admin | L1 | 学校 | 管理商户/人员/内容 |
| merchant_admin | L2 | 商户 | 管理子树/人员/内容 |
| stall_admin | L3 | 档口 | 管理菜品/评价 |

### 权限清单

```
admin.create              - 创建管理员
admin.assign              - 分配职位
admin.unassign            - 解绑职位
admin.disable             - 禁用账户
admin.manage_peer         - 管理同级管理员 (default: off)
admin.identity.approve    - 审核身份标签
admin.audit               - 查看操作日志
```

### 权限校验流程

```
Token 验证
    ↓
职位加载
    ↓
权限检查 (operator ∩ template)
    ↓
作用域校验
    ↓
自授权禁止
    ↓
审计记录
```

## 身份标签系统

支持三个固定标签 + 自定义后缀（需审核）：

```
身份标签（必选）
├─ 教职工
├─ 工作人员
└─ 运营专员

自定义后缀（可选）
├─ 工作室主任
├─ 部门主管
└─ ... (自定义)

审核状态
├─ draft (草稿)
├─ pending_review (待审核)
├─ approved (已通过)
└─ rejected (已拒绝)
```

## API 端点

### 列表和搜索

```
GET /api/admin/list              # 获取作用域内的管理员树
GET /api/admin/created-by-me     # 获取我创建的管理员
GET /api/admin/search?q=<query>  # 搜索管理员
```

### 创建和编辑

```
POST /api/admin/create           # 创建管理员
POST /api/admin/:id              # 编辑管理员
```

### 职位管理

```
POST /api/admin/:id/assign-position      # 分配职位
POST /api/admin/:id/unassign-position    # 解绑职位
GET  /api/admin/positions                # 获取当前用户职位列表
```

### 账户管理

```
POST /api/admin/:id/disable      # 禁用管理员
```

### 审核和日志

```
POST /api/admin/:id/approve-suffix    # 审核身份后缀
GET  /api/admin/audit-log             # 查看操作日志
```

## 数据库表

### admin_users
- id, username, password_hash, name
- identity_label, identity_suffix, identity_suffix_status
- status (active|disabled)
- created_by, created_at, updated_at

### admin_positions
- id, admin_id, role, school_id, merchant_node_id, stall_id
- assigned_by, assigned_at, unassigned_at, unassigned_by, unassign_reason

### admin_permissions
- id, position_id, permission, granted_by, granted_at, revoked_at

### role_template_permissions
- id, role, permission, is_default

### admin_audit_log
- id, operator_id, position_id, action, target_type, target_id
- before_data, after_data, reason, ip_address, user_agent, created_at

### 5. 规则管理系统

通过 `admin-rules.js` 提供：

- 规则配置和验证
- 规则模板管理
- 规则状态跟踪

## 技术特点

### 前端技术栈
- HTML5 + CSS3：现代Web标准
- JavaScript ES6+：模块化编程
- Font Awesome：图标库
- ECharts：数据可视化

### 设计特点
- 响应式设计：适配不同设备
- 模块化架构：易于维护和扩展
- 统一的UI风格：保持品牌一致性
- 无障碍设计：提升用户体验

### 安全特性
- 基于角色的访问控制
- 前端权限验证
- 数据过滤和验证
- 安全的API调用

## 使用指南

### 登录流程
1. 访问管理员登录页面
2. 输入用户名和密码
3. 系统验证用户身份和权限
4. 根据角色重定向到对应控制台

### 常见操作
1. **数据查看**：在控制台查看相关统计数据
2. **内容管理**：添加、编辑或删除相关内容
3. **用户管理**：管理下级用户和权限
4. **系统设置**：配置系统参数和规则

### 最佳实践
1. 定期备份数据
2. 及时处理审核请求
3. 保持信息更新
4. 遵循操作规范

## 扩展开发

### 添加新角色
1. 在 `admin-permission.js` 中定义新角色
2. 在 `admin-navbar-dynamic.js` 中添加导航菜单
3. 创建对应的HTML页面
4. 实现相应的API接口

### 添加新功能
1. 设计功能模块
2. 创建对应的HTML页面
3. 实现JavaScript逻辑
4. 添加API接口
5. 更新权限控制

## 维护说明

### 定期维护
- 检查日志文件
- 更新系统规则
- 优化性能
- 修复安全问题

### 故障排除
- 检查浏览器控制台错误
- 验证API连接
- 确认权限设置
- 检查网络连接

## 更新日志

### 最新版本特性
- 优化权限管理系统
- 改进用户界面体验
- 增强数据可视化功能
- 提升系统安全性

---

*本文档最后更新时间：2026-01-29*