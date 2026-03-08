# 🚨 紧急修复 - 快速参考

## 问题现状

1. ✅ 已执行 `admin_system.sql`，新表已创建
2. ⚠️ 旧 `users` 表中的管理员数据未迁移
3. 🚫 注册窗口可以直接注册管理员（安全隐患）

---

## 🎯 立即执行（3 步修复）

### 第 1 步：备份数据库（1 分钟）
```
宝塔面板 → 数据库 → 找到你的数据库 → 点击"备份"
```

### 第 2 步：迁移数据（5 分钟）
```sql
-- 在宝塔 phpMyAdmin 中执行

INSERT INTO admin_users (id, username, password_hash, real_name, phone, email, identity_label, status, created_by, created_at)
SELECT 
    id, username, password_hash,
    COALESCE(real_name, username) as real_name,
    phone, NULL as email,
    CASE 
        WHEN username LIKE '%超级管理员%' THEN '运营专员'
        WHEN username LIKE '%学校管理员%' THEN '教职工'
        ELSE '工作人员'
    END as identity_label,
    CASE WHEN status = 'active' THEN 'active' ELSE 'disabled' END as status,
    NULL, created_at
FROM users
WHERE role = 'admin'
ON DUPLICATE KEY UPDATE real_name = VALUES(real_name);

-- 2. 创建默认职位（所有管理员）
INSERT INTO admin_positions (admin_id, role, assigned_by, assigned_at)
SELECT 
    id,
    CASE 
        WHEN username LIKE '%超级管理员%' THEN 'super_admin'
        WHEN username LIKE '%学校管理员%' THEN 'school_admin'
        WHEN username LIKE '%商户管理员%' THEN 'merchant_admin'
        WHEN username LIKE '%档口管理员%' THEN 'stall_admin'
        ELSE 'school_admin'
    END,
    COALESCE(
        (SELECT id FROM admin_users WHERE username = '超级管理员' LIMIT 1),
        (SELECT id FROM admin_users ORDER BY id LIMIT 1)
    ),
    created_at
FROM users
WHERE role = 'admin'
ON DUPLICATE KEY UPDATE assigned_at = VALUES(assigned_at);

-- 3. 分配默认权限
INSERT INTO admin_permissions (position_id, permission, granted_by, granted_at)
SELECT ap.id, rtp.permission, 1, NOW()
FROM admin_positions ap
JOIN role_template_permissions rtp ON rtp.role = ap.role AND rtp.is_default = TRUE
WHERE NOT EXISTS (SELECT 1 FROM admin_permissions WHERE position_id = ap.id AND permission = rtp.permission);
```

### 第 3 步：禁止注册管理员（2 分钟）
```sql
-- 添加数据库触发器
DELIMITER $$
DROP TRIGGER IF EXISTS prevent_admin_registration$$
CREATE TRIGGER prevent_admin_registration
BEFORE INSERT ON users
FOR EACH ROW
BEGIN
    IF NEW.role = 'admin' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '禁止通过注册接口创建管理员';
    END IF;
END$$
DELIMITER ;
```

**后端代码已自动修复**：`backend/controllers/authController.js`

---

## ✅ 验证

```sql
-- 检查迁移结果
SELECT '原管理员' as 类型, COUNT(*) as 数量 FROM users WHERE role LIKE '%admin%'
UNION ALL
SELECT '原管理员(正确)' as 类型, COUNT(*) as 数量 FROM users WHERE role = 'admin'
UNION ALL
SELECT '新管理员' as 类型, COUNT(*) as 数量 FROM admin_users
UNION ALL
SELECT '职位数' as 类型, COUNT(*) as 数量 FROM admin_positions
UNION ALL
SELECT '权限数' as 类型, COUNT(*) as 数量 FROM admin_permissions;
```

数量应该匹配！

---

## 📁 详细文档

- **完整迁移指南**: [BAOTA_MIGRATION_GUIDE.html](BAOTA_MIGRATION_GUIDE.html)（在浏览器中打开）
- **迁移脚本**: `backend/sql/migrate_existing_data.sql`
- **修复注册**: `backend/sql/fix_registration.sql`

---

## 🆘 遇到问题？

1. 数量不匹配 → 手动检查 users 表中的 role 字段
2. 触发器失败 → 使用宝塔终端：`mysql -u root -p数据库名 < fix_registration.sql`
3. 权限不足 → 重新执行第 2 步的第 3 条 SQL

---

**下一步**: 打开 `BAOTA_MIGRATION_GUIDE.html` 查看详细的可视化操作步骤！
