# 后端修复和数据补充检查清单

## 📋 任务概览
- **目标**: 替换所有模拟数据，使用真实数据库
- **当前状态**: 
  - ✅ 后端权限系统是真实的（adminAuth.js, admin-management.js）
  - ✅ 数据库表结构完整（5张核心表）
  - ⚠️ admin-stats.js 已修复数据库调用（req.db → pool）
  - ❌ 审计日志数据为空（需补充测试数据）

---

## Phase 1: 核心 API 修复 (高优先级)

### ✅ Task 1.1: 修复 admin-stats.js 数据库调用
- **状态**: ✅ **已完成**
- **内容**: 将所有 `req.db.query()` 改为 `pool.execute()`
- **影响行**: 41, 89, 94, 99, 164, 173, 267, 277
- **文件**: `backend/routes/admin-stats.js`

### 🔴 Task 1.2: 上传 admin-stats.js 到服务器
- **状态**: ⏳ **待执行**
- **说明**: 
  - 用户需要通过 SSH/SFTP 上传修改后的文件
  - 路径: `/www/wwwroot/campus_time/backend/routes/admin-stats.js`
  - 验证: `curl http://你的IP:3000/api/admin/stats/roles`

### 🔴 Task 1.3: 启用 server.js 中的统计路由
- **状态**: ⏳ **待执行**  
- **说明**:
  ```javascript
  // 在 server.js 中添加以下代码（在其他路由之后）
  const adminStatsRoutes = require('./routes/admin-stats');
  app.use('/api/admin/stats', adminStatsRoutes);
  ```
- **验证**: 重启 Node 服务后，查询统计 API 是否能获取真实数据

### ✅ Task 1.4: 验证其他路由使用真实数据库
- **状态**: ✅ **已完成**
- **内容**: 已确认以下文件使用真实数据库
  - `backend/middleware/adminAuth.js` ✅ 使用 `pool.execute()`
  - `backend/routes/admin-management.js` ✅ 使用 `pool.query()`
  - `backend/routes/admin.js` ✅ 使用 `pool.query()`
  - `backend/routes/core.js` ✅ 使用 `pool.query()`

---

## Phase 2: 测试数据补充 (中优先级)

### 🔴 Task 2.1: 补充管理员审计日志
- **状态**: ⏳ **待执行**
- **说明**:
  - 执行 SQL 脚本: `backend/sql/insert_test_data.sql`
  - 插入样本: 
    - 最近7天: 12条操作记录（各角色各2-3条）
    - 历史数据: 5条（超过7天）
    - 待审批: 2条
  - 目的: 为 super_admin_index.html 的 loadLogs() 提供真实数据

### 🟡 Task 2.2: 补充学校数据（可选）
- **状态**: ⏳ **待评估**
- **说明**: 
  - 当前数据库只有 school_id=1 的数据
  - 建议保持现状（足够演示）或根据需要添加
- **相关页面**: super_admin_school.html

### 🟡 Task 2.3: 补充商户和档口数据（可选）
- **状态**: ⏳ **待评估**
- **说明**: 需要表结构，建议后续补充
- **相关页面**: super_admin_merchant.html, merchant_admin_index.html

---

## Phase 3: 前端修改完成度追踪

### ✅ Task 3.1: super_admin_index.html 数据对接
- **状态**: ✅ **已完成（前端）**
- **修改内容**:
  - Line 4083-4115: loadRoleStats() → 调用 `/api/admin/stats/roles`
  - Line 5131-5180: loadLogs() → 调用 `/api/admin/audit/recent`
- **依赖**: Task 1.2, 1.3, 2.1

### 🟡 Task 3.2: 其他管理员页面数据对接
- **状态**: ⏳ **后续任务**
- **涉及页面**:
  - super_admin_school.html (学校管理)
  - super_admin_users.html (用户管理)
  - super_admin_audit.html (审计管理)
  - school_admin_*.html (学校级别的各类管理)
  - merchant_admin_index.html (商户管理)
  - 等 8+ 其他页面
- **预计**: 每个页面平均修改 2-3 处

---

## 测试账号信息

### 可用的测试账号

| 用户名 | 密码 | 角色 | 权限范围 |
|--------|------|------|---------|
| 超级管理员 | 123456 | super_admin | 平台级（所有功能） |
| 学校管理员 | 123456 | school_admin | 学校级（商户、档口、管理员） |
| 商户管理员 | 123456 | merchant_admin | 商户级（档口、商品、员工） |
| 档口管理员 | 123456 | stall_admin | 档口级（商品、库存、价格） |

### 登录方式
1. 进入 `/frontend/login/admin_login.html`
2. 输入用户名和密码（如上表）
3. 进入对应的管理后台

---

## 验证清单

### ✅ 后端验证
- [ ] Task 1.2: admin-stats.js 已上传到服务器
- [ ] Task 1.3: server.js 已启用统计路由
- [ ] 测试 `/api/admin/stats/roles` 返回真实数据
- [ ] 测试 `/api/admin/stats/dashboard` 返回真实数据
- [ ] 测试 `/api/admin/audit/recent` 返回真实数据

### ✅ 数据库验证
- [ ] Task 2.1: 审计日志已补充（19条记录）
- [ ] admin_users 表有 5 个活跃账号
- [ ] admin_positions 表有 6 个职位绑定
- [ ] admin_permissions 表有 136 条权限规则

### ✅ 前端验证
- [ ] super_admin_index.html 加载真实统计数据
- [ ] 角色统计显示正确数字
- [ ] 操作日志显示真实记录
- [ ] 待审批项目显示正确（2条）

---

## 重要说明

### ⚠️ 当前状态
- 后端权限系统是**真实的**（数据库支持）
- 统计 API 已修复，但未部署到服务器
- 审计日志表结构完整，但数据为空
- 前端已改为 API 调用方式

### ✅ 实现方式
- 所有管理员 API 使用 `pool.query()` 或 `pool.execute()`
- 数据库使用连接池（config/database.js）
- JWT 和权限认证使用真实数据库
- 无硬编码的用户或权限数据

### 🔄 后续步骤
1. **本周目标**: 完成 Phase 1 (上传并启用统计 API)
2. **下周目标**: 完成 Phase 2 (补充测试数据)
3. **后续**: Phase 3 (完成其他页面的数据对接)

---

## 文件清单

### 已修改的文件
- ✅ `backend/routes/admin-stats.js` (修复数据库调用)
- ✅ `frontend/main/admin/super_admin_index.html` (改为 API 调用)

### 待上传的文件
- ⏳ `backend/routes/admin-stats.js` (上传到服务器)
- ⏳ `backend/sql/insert_test_data.sql` (执行以补充数据)

### 待修改的文件
- 🔲 `backend/server.js` (添加统计路由)
- 🔲 super_admin_school.html
- 🔲 super_admin_users.html
- 🔲 super_admin_audit.html
- 🔲 school_admin_*.html (多个页面)
- 🔲 merchant_admin_index.html
- 等待评估

---

**最后更新**: 2026年2月3日  
**进度**: Phase 1 完成50% | Phase 2待启动 | Phase 3进行中
