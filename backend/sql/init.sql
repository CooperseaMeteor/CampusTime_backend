-- 创建数据库
CREATE DATABASE IF NOT EXISTS campus_food;
USE campus_food;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password_hash VARCHAR(255) NOT NULL COMMENT '加密后的密码',
    role ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色',
    status VARCHAR(20) DEFAULT 'active' COMMENT '账户状态',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入测试数据（可选）
-- INSERT INTO users (username, password_hash, role) VALUES
-- ('testuser', '$2a$10$hash_here', 'user'),
-- ('admin', '$2a$10$hash_here', 'admin');
