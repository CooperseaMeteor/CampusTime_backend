# 《校园食光》管理员系统 - 开发进度追踪

**文档说明**: 本文档持续维护，记录所有任务进度和待办事项  
**更新时间**: 2026-02-03  
**当前阶段**: Phase 2 - 数据对接与修复  
**优先级标识**: 🔴 高优先级 | 🟡 中优先级 | 🟢 低优先级
**最新更新**: ✅ 层级树折叠指示器 + ✅ 默认折叠状态（只展开第一层）

---

## 🎯 Phase 1: 核心框架搭建 ✅ 已完成

### 大任务 1.1: 后端权限系统 ✅
- [x] 数据库表设计（5张表：admin_users, admin_positions, admin_permissions, role_template_permissions, admin_audit_log）
- [x] SQL 初始化脚本编写（backend/sql/admin_system.sql）
- [x] 权限中间件开发（backend/middleware/adminAuth.js - 7个函数）
- [x] 管理员 API 路由（backend/routes/admin-management.js - 9个端点）

### 大任务 1.2: 前端管理界面 ✅
- [x] 管理员列表页面（frontend/main/admin/admin_manage.html - 树状结构）
- [x] 弹窗组件库（frontend/main/admin/admin-modals.js）
- [x] 搜索和导航功能（frontend/main/admin/admin-search-manager.js）
- [x] 样式表和响应式设计（frontend/main/admin/admin-modals.css）

### 大任务 1.3: 登录与权限流程 ✅
- [x] 管理员登录流程（frontend/login/admin_login.html）
- [x] 多职位支持与切换（localStorage: adminPositions, adminActivePositionId）
- [x] 统一管理员入口（frontend/main/admin/admin_shell.html）
- [x] iframe 权限检查优化（frontend/router.js - 第 962 行）
- [x] 导航栏重复问题修复（admin-navbar.js, admin-navbar-dynamic.js, navbar.js）

---

## 🚧 Phase 2: 数据对接与修复（进行中）

### 🔴 大任务 2.1: 管理员页面数据对接（高优先级）

**问题描述**: 所有管理员功能页面使用模拟/硬编码数据，未连接后端 API  
**影响范围**: 9个管理员页面，约50+处模拟数据  
**预计工作量**: 3-5天

#### 子任务 2.1.1: super_admin_index.html 数据对接 ✅
**文件**: `frontend/main/admin/super_admin_index.html`

- [x] **角色统计数据** (Line 4078-4110) ✅ 已完成
  ```javascript
  // 已替换: fetch('/api/admin/stats/roles')
  ```
  
- [x] **待审核任务** (Line 5099-5150) ✅ 已完成
  ```javascript
  // 已替换: fetch('/api/admin/audit/pending')
  ```
  
- [x] **最近操作日志** (Line 5115-5270) ✅ 已完成
  ```javascript
  // 已替换: fetch('/api/admin/audit/recent')
  ```

**相关后端API**: 
- ✅ `backend/routes/admin-stats.js` - 已创建（4个端点）
- ✅ `backend/server.js` - 已注册路由
- ✅ 包含权限校验、作用域过滤、分页支持

#### 子任务 2.1.2: super_admin_users.html 数据对接 ✅
**文件**: `frontend/main/admin/super_admin_users.html`

- [x] **用户列表加载** ✅ 已完成
  ```javascript
  // 已替换: fetch('/api/users?page=1&limit=10&role=...&status=...')
  ```
  
- [x] **用户搜索和筛选** ✅ 已完成
  - 按用户名、邮箱、学号搜索
  - 按角色筛选（学生、各类管理员）
  - 按状态筛选（正常、未激活、已封禁）
  
- [x] **用户操作** ✅ 已完成
  - 查看用户详情
  - 重置密码（API: POST /api/users/:id/reset-password）
  - 封禁/解封用户（API: PUT /api/users/:id/status）
  
- [x] **统计信息** ✅ 已完成
  - 总用户数、活跃用户数、新增用户数、已封禁数
  - 实时更新统计数据（API: GET /api/users/stats/summary）

**相关后端API**: 
- ✅ `backend/routes/users.js` - 已创建（6个端点）
- ✅ `backend/server.js` - 已注册路由
- ✅ 包含权限校验、搜索筛选、分页支持、用户操作

#### 子任务 2.1.3: super_admin_school.html 数据对接
**文件**: `frontend/main/admin/super_admin_school.html`

- [ ] **学校列表** (Line 762-850)
  ```javascript
  // 当前: 硬编码学校数组（5个假学校）
  // 目标: fetch('/api/schools') - 需新建接口
  ```
  
- [ ] **创建学校** (Line 1022)
  ```javascript
  // 目标: fetch('/api/schools', { method: 'POST' })
  ```
  
- [ ] **编辑学校** (Line 1058)
  ```javascript
  // 目标: fetch('/api/schools/:id', { method: 'PUT' })
  ```

#### 子任务 2.1.4: super_admin_audit.html 数据对接
**文件**: `frontend/main/admin/super_admin_audit.html`

- [ ] **审核内容列表** (Line 960-1050)
  ```javascript
  // 当前: 硬编码内容数组
  // 目标: fetch('/api/content/pending-review')
  ```
  
- [ ] **审核通过** (Line 1187)
  ```javascript
  // 目标: fetch('/api/content/:id/approve', { method: 'POST' })
  ```
  
- [ ] **审核拒绝** (Line 1207)
  ```javascript
  // 目标: fetch('/api/content/:id/reject', { method: 'POST' })
  ```
  
- [ ] **敏感词管理** (Line 948)
  ```javascript
  // 目标: fetch('/api/sensitive-words')
  ```

#### 子任务 2.1.5: super_admin_settings.html 数据对接
**文件**: `frontend/main/admin/super_admin_settings.html`

- [ ] **系统配置加载** (Line 1085)
- [ ] **系统配置保存** (Line 1123)
- [ ] **敏感词导入** (Line 1148)
- [ ] **数据导出** (Line 1165)

#### 子任务 2.1.6: school_admin 系列页面数据对接
**文件**: `frontend/main/admin/school_admin_*.html`

- [ ] **school_admin_index.html**: 仪表板数据 (Line 2064-2416)
- [ ] **school_admin_students.html**: 学生列表 (Line 815-1104)
- [ ] **school_admin_merchant.html**: 商户列表 (Line 817-1128)
- [ ] **school_admin_data.html**: 数据报表 (Line 782-1155)
- [ ] **school_admin_content.html**: 内容发布功能

#### 子任务 2.1.7: merchant_admin_index.html 数据对接
**文件**: `frontend/main/admin/merchant_admin_index.html`

- [ ] **商户仪表板数据** (Line 2288)
- [ ] **档口管理功能**
- [ ] **菜品管理功能**

#### 子任务 2.1.8: stall_dashboard.html 数据对接
**文件**: `frontend/main/admin/stall_dashboard.html`

- [ ] **档口数据统计** (Line 773-1066)
  - 菜品列表、库存管理、口碑管理、操作日志
- [ ] **库存更新 API** (Line 929)
  ```javascript
  // 目标: fetch('/api/dishes/:id/stock', { method: 'PUT' })
  ```
- [ ] **菜品状态切换** (Line 943)
  ```javascript
  // 目标: fetch('/api/dishes/:id/status', { method: 'PUT' })
  ```
- [ ] **菜品编辑** (Line 952)
  ```javascript
  // 目标: fetch('/api/dishes/:id', { method: 'PUT' })
  ```

### 🟡 大任务 2.2: 导航栏重复问题全面排查（中优先级）

**问题描述**: 除首页外的管理页面导航栏可能重复出现  
**已修复**: iframe 检查逻辑已添加到 3 个导航栏脚本  
**待验证**: 实际页面加载测试

#### 子任务 2.2.1: 验证导航栏脚本修复
- [x] admin-navbar.js 已添加 iframe 检查 (Line 213-220)
- [x] admin-navbar-dynamic.js 已修复无限递归 + iframe 检查 (Line 163-185)
- [x] navbar.js 已添加 iframe 检查 (Line 1-10)

#### 子任务 2.2.2: 测试导航栏行为
- [ ] 测试 admin_shell.html 主页面导航栏正常显示
- [ ] 测试 super_admin_index.html iframe 内无重复导航栏
- [ ] 测试 school_admin_index.html iframe 内无重复导航栏
- [ ] 测试 merchant_admin_index.html iframe 内无重复导航栏
- [ ] 测试 stall_dashboard.html iframe 内无重复导航栏
- [ ] 测试职位切换后导航栏更新正确

### 🟢 大任务 2.3: 后端 API 补充（低优先级）

**问题描述**: 当前只有管理员管理 API（9个端点），业务 API 缺失  
**依赖**: Phase 2.1 数据对接需要这些 API  
**预计工作量**: 5-7天

#### 子任务 2.3.1: 学校管理 API
**需求**: 超级管理员创建、查看、编辑学校

- [ ] `GET /api/schools` - 获取学校列表
  - 参数: `page`, `limit`, `keyword`
  - 权限: `org.school.view`
  
- [ ] `POST /api/schools` - 创建学校
  - 字段: `name`, `address`, `contact`, `description`
  - 权限: `org.school.create`
  
- [ ] `PUT /api/schools/:id` - 更新学校信息
  - 权限: `org.school.update`
  
- [ ] `DELETE /api/schools/:id` - 停用学校
  - 权限: `org.school.disable`

#### 子任务 2.3.2: 商户管理 API
**需求**: 学校管理员管理商户树（1-N级）

- [ ] `GET /api/merchants` - 获取商户树列表
  - 参数: `school_id`, `parent_id`（支持树形）
  - 权限: 作用域校验
  
- [ ] `POST /api/merchants` - 创建商户节点
  - 字段: `name`, `parent_id`, `school_id`, `level`
  - 权限: `org.merchant.create`
  
- [ ] `PUT /api/merchants/:id` - 更新商户信息
  - 权限: `org.merchant.update`
  
- [ ] `POST /api/merchants/:id/move` - 移动商户节点
  - 字段: `new_parent_id`
  - 权限: `org.merchant.move`

#### 子任务 2.3.3: 档口管理 API
**需求**: 商户/学校管理员管理档口

- [ ] `GET /api/stalls` - 获取档口列表
  - 参数: `merchant_id`, `school_id`
  - 权限: 作用域校验
  
- [ ] `POST /api/stalls` - 创建档口
  - 字段: `name`, `merchant_id`, `description`, `location`
  - 权限: `org.stall.create`
  
- [ ] `PUT /api/stalls/:id` - 更新档口信息
  - 权限: `org.stall.update`
  
- [ ] `GET /api/stalls/:id/dishes` - 获取档口菜品
  - 权限: `dish.view`

#### 子任务 2.3.4: 内容审核 API
**需求**: 超级/学校管理员审核用户内容

- [ ] `GET /api/content/pending-review` - 待审核内容列表
  - 参数: `type` (comment/post/review), `school_id`
  - 权限: `review.audit`
  
- [ ] `POST /api/content/:id/approve` - 审核通过
  - 权限: `review.audit`
  
- [ ] `POST /api/content/:id/reject` - 审核拒绝
  - 字段: `reason`
  - 权限: `review.audit`

#### 子任务 2.3.5: 数据统计 API
**需求**: 各级管理员查看数据看板

- [ ] `GET /api/admin/stats/roles` - 角色统计
  - 返回: 各角色管理员数量
  - 权限: 作用域校验
  
- [ ] `GET /api/admin/stats/dashboard` - 仪表板数据
  - 返回: 待审核数、活跃用户数、近期操作等
  - 权限: 作用域校验
  
- [ ] `GET /api/schools/:id/stats` - 学校数据统计
  - 返回: 商户数、档口数、用户数等
  - 权限: 作用域校验
  
- [ ] `GET /api/merchants/:id/stats` - 商户数据统计
  - 权限: 作用域校验
  
- [ ] `GET /api/stalls/:id/stats` - 档口数据统计
  - 返回: 菜品数、销量、评价等
  - 权限: 作用域校验

---

## 📊 进度统计

### Phase 1: 核心框架（已完成）
- **完成度**: 100% (16/16 子任务)
- **代码行数**: 约 2650+ 行
- **文件数量**: 7 个源文件 + 4 份文档

### Phase 2: 数据对接（进行中）
- **完成度**: 10% (4/42 子任务)
- **已完成**: super_admin_index.html 数据对接
- **待办**: 38 个数据对接子任务

### Phase 3: 测试与优化（未开始）
- **完成度**: 0%
- **待规划**: 集成测试、性能优化、用户体验优化

---

## 🗂️ 已归档任务

<details>
<summary>Phase 1 完整清单（点击展开）</summary>

- [x] 后端：管理员树状列表接口（/api/admin/list）
- [x] 后端：管理员详情接口（/api/admin/:id/detail）
- [x] 后端：审计日志接口（/api/admin/audit）
- [x] 前端：管理页弹窗对接
- [x] 前端：节点选择器（学校/商户/档口）
- [x] 前端：调岗支持选择目标角色与节点
- [x] 前端：权限自定义 UI
- [x] 后端：可授予权限列表接口（/api/admin/permissions/available）
- [x] 前端：通用管理员入口（职位切换页）
- [x] 前端：管理员登录统一入口
- [x] 前端：iframe 权限检查优化
- [x] 前端：导航栏无限递归修复
- [x] 数据库表设计（5张表）
- [x] SQL 初始化脚本
- [x] 权限中间件（7个函数）
- [x] 管理员 API（9个端点）

</details>

---

## 🔗 参考文档

1. **产品规范**: [管理员权限与层级规范V1.md](管理员权限与层级规范V1.md)
2. **文件索引**: [ADMIN_SYSTEM_FILE_INDEX.md](ADMIN_SYSTEM_FILE_INDEX.md)
3. **集成清单**: [frontend/main/admin/INTEGRATION_CHECKLIST.html](frontend/main/admin/INTEGRATION_CHECKLIST.html)

---

## 📝 更新日志

### 2026-02-03 (续)
- ✅ **层级树 UI 改进** (super_admin_index.html)
  - 添加折叠三角形指示器（fa-caret-down 图标）
  - 实现默认折叠状态：深度 > 0 的节点默认折叠，只展开根节点
  - 简化 toggleNode/toggleListNode 函数，改用 CSS 类切换
  - 三角形旋转动画：展开时向下，折叠时向左（-90度）
  - 适配列表视图（手机端）：同步添加折叠功能
  - **解决问题**: 处理大数据量时的性能问题和 UX 可见性

- ✅ **super_admin_users.html 用户管理页面数据对接完成**
  - 创建后端用户管理API (backend/routes/users.js)
  - GET /api/users - 用户列表（支持搜索、筛选、分页）
  - GET /api/users/:id - 用户详情
  - PUT /api/users/:id/status - 更新用户状态（禁用/启用）
  - POST /api/users/:id/reset-password - 重置密码
  - POST /api/users/batch/disable - 批量禁用
  - GET /api/users/stats/summary - 用户统计
  - 前端修改：loadUsersData()调用API，renderUsersTable()接收API数据
  - 用户操作（查看、重置密码、封禁/解封）全部对接API
  - 统计信息实时从数据库更新
  - **进度**: Phase 2.1 完成 4/8 大文件，占 50%

- ✅ 修复导航栏重复问题（admin-navbar.js, admin-navbar-dynamic.js, navbar.js）
- ✅ 添加 iframe 检查逻辑，防止子页面重复初始化导航栏
- ✅ **super_admin_index.html 数据对接完成** - 角色统计、待审核任务、操作日志
- ✅ **创建后端统计API** (backend/routes/admin-stats.js)
  - GET /api/admin/stats/roles - 角色统计
  - GET /api/admin/stats/dashboard - 仪表板数据  
  - GET /api/admin/audit/pending - 待审核任务
  - GET /api/admin/audit/recent - 操作日志（支持筛选、分页）
- ✅ 注册统计API路由到server.js
- 📋 整理数据对接任务清单（42个子任务）
- 📋 规划后端 API 补充任务（5个模块，约20个端点）
- 📋 重新组织进度文档结构（Phase划分 + 优先级标识）

### 2026-02-02
- ✅ 完成 Phase 1 所有任务
- ✅ 前后端核心功能实现
- ✅ 文档编写完成
