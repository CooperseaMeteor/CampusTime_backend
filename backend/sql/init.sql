SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

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

-- 存储 refresh token 的表（用于刷新 access token）
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(512) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新令牌表';

-- Phase 1 业务表：商户 / 档口 / 菜品 / 评价

-- 商户表
CREATE TABLE IF NOT EXISTS merchants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '商户名称',
    banner_image VARCHAR(255) NULL COMMENT '商户横幅图',
    tags JSON NULL COMMENT '标签数组',
    rating DECIMAL(3,2) DEFAULT 0 COMMENT '综合评分',
    review_count INT DEFAULT 0 COMMENT '评价数量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

-- 档口表
CREATE TABLE IF NOT EXISTS stalls (
    id INT PRIMARY KEY AUTO_INCREMENT,
    merchant_id INT NOT NULL COMMENT '所属商户',
    name VARCHAR(100) NOT NULL COMMENT '档口名称',
    open_status ENUM('open','closed') DEFAULT 'open' COMMENT '营业状态',
    location VARCHAR(100) NULL COMMENT '位置描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_merchant (merchant_id),
    CONSTRAINT fk_stall_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='档口表';

-- 菜品表
CREATE TABLE IF NOT EXISTS dishes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    stall_id INT NOT NULL COMMENT '所属档口',
    name VARCHAR(100) NOT NULL COMMENT '菜品名称',
    price DECIMAL(10,2) NOT NULL COMMENT '价格',
    image VARCHAR(255) NULL COMMENT '菜品图片',
    stock_mode ENUM('limited','unlimited') DEFAULT 'unlimited' COMMENT '库存模式',
    total_stock INT NULL COMMENT '总库存（限量模式）',
    remaining_stock INT NULL COMMENT '剩余库存（限量模式）',
    is_available TINYINT(1) DEFAULT 1 COMMENT '是否在售',
    tags JSON NULL COMMENT '口味/特性标签',
    popularity INT DEFAULT 0 COMMENT '热度',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_stall (stall_id),
    CONSTRAINT fk_dish_stall FOREIGN KEY (stall_id) REFERENCES stalls(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜品表';

-- 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    dish_id INT NOT NULL COMMENT '评价的菜品',
    user_id INT NOT NULL COMMENT '评价用户',
    rating TINYINT NOT NULL COMMENT '星级(1-5)',
    tags JSON NULL COMMENT '口味标签',
    content TEXT NULL COMMENT '评价内容',
    images JSON NULL COMMENT '图片数组',
    anonymous TINYINT(1) DEFAULT 0 COMMENT '是否匿名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_dish (dish_id),
    INDEX idx_user (user_id),
    CONSTRAINT fk_review_dish FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE,
    CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 示例数据（可选）
INSERT INTO merchants (name, banner_image, tags, rating, review_count) VALUES
('商户A', 'https://via.placeholder.com/800x200?text=MerchantA', JSON_ARRAY('干净','好评多'), 4.6, 12)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO stalls (merchant_id, name, open_status, location) VALUES
((SELECT id FROM merchants LIMIT 1), '一号档口', 'open', '一楼A区'),
((SELECT id FROM merchants LIMIT 1), '二号档口', 'open', '一楼B区');

INSERT INTO dishes (stall_id, name, price, image, stock_mode, total_stock, remaining_stock, is_available, tags, popularity) VALUES
((SELECT id FROM stalls WHERE name='一号档口' LIMIT 1), '宫保鸡丁', 15.00, 'https://via.placeholder.com/80?text=宫保鸡丁', 'limited', 50, 12, 1, JSON_ARRAY('微辣','下饭'), 89),
((SELECT id FROM stalls WHERE name='一号档口' LIMIT 1), '麻婆豆腐', 12.00, 'https://via.placeholder.com/80?text=麻婆豆腐', 'unlimited', NULL, NULL, 1, JSON_ARRAY('中辣','川味'), 76),
((SELECT id FROM stalls WHERE name='二号档口' LIMIT 1), '鱼香肉丝', 16.00, 'https://via.placeholder.com/80?text=鱼香肉丝', 'limited', 30, 3, 1, JSON_ARRAY('甜辣','家常'), 95);
