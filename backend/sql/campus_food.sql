-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- 主机： localhost
-- 生成日期： 2026-02-05 10:56:35
-- 服务器版本： 5.7.40-log
-- PHP 版本： 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 数据库： `campus_food`
--

-- --------------------------------------------------------

--
-- 表的结构 `admin_audit_log`
--

CREATE TABLE `admin_audit_log` (
  `id` bigint(20) NOT NULL,
  `operator_id` int(11) NOT NULL COMMENT '操作者ID',
  `operator_position_id` int(11) DEFAULT NULL COMMENT '操作时使用的职位ID',
  `action` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型: create_admin/assign_position/grant_permission/revoke_permission/approve_suffix等',
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作目标类型: admin/position/permission等',
  `target_id` int(11) DEFAULT NULL COMMENT '操作目标ID',
  `before_data` json DEFAULT NULL COMMENT '操作前数据快照',
  `after_data` json DEFAULT NULL COMMENT '操作后数据快照',
  `reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '操作原因（如调岗原因）',
  `ip_address` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员操作审计日志';

--
-- 转存表中的数据 `admin_audit_log`
--

INSERT INTO `admin_audit_log` (`id`, `operator_id`, `operator_position_id`, `action`, `target_type`, `target_id`, `before_data`, `after_data`, `reason`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 13, 6, 'create_admin', 'admin', 11, NULL, '{\"role\": \"merchant_admin\", \"username\": \"商户管理员\"}', '新建商户级管理员', '127.0.0.1', 'Mozilla/5.0', '2026-02-01 03:41:48'),
(2, 13, 6, 'assign_position', 'position', 4, '{\"role\": \"stall_admin\", \"admin_id\": 11}', '{\"role\": \"merchant_admin\", \"admin_id\": 11}', '权限调整', '127.0.0.1', 'Mozilla/5.0', '2026-02-02 03:41:48'),
(3, 13, 6, 'grant_permission', 'permission', 100, NULL, '{\"permission\": \"org.merchant.create\", \"position_id\": 4}', '授予商户创建权限', '127.0.0.1', 'Mozilla/5.0', '2026-02-02 19:41:48'),
(4, 13, 6, 'approve_suffix', 'admin', 11, NULL, '{\"status\": \"approved\", \"identity_suffix\": \"档口主播\"}', '审批身份后缀', '127.0.0.1', 'Mozilla/5.0', '2026-02-02 23:41:48'),
(5, 13, 6, 'disable_admin', 'admin', 10, '{\"status\": \"active\"}', '{\"status\": \"disabled\"}', '账号异常，停用处理', '127.0.0.1', 'Mozilla/5.0', '2026-02-02 15:41:48'),
(6, 2, 1, 'create_admin', 'admin', 14, NULL, '{\"role\": \"merchant_admin\", \"username\": \"新管理员\", \"school_id\": 1}', '新建学校内商户管理员', '192.168.1.100', 'Mozilla/5.0', '2026-01-31 03:41:48'),
(7, 2, 1, 'update_admin', 'admin', 11, '{\"real_name\": \"张三\"}', '{\"real_name\": \"张三(修改)\"}', '更新管理员信息', '192.168.1.100', 'Mozilla/5.0', '2026-02-01 03:41:48'),
(8, 2, 1, 'grant_permission', 'permission', 101, NULL, '{\"permission\": \"org.stall.create\", \"position_id\": 1}', '授予档口创建权限', '192.168.1.100', 'Mozilla/5.0', '2026-02-02 03:41:48'),
(9, 11, 4, 'create_admin', 'admin', 15, NULL, '{\"role\": \"stall_admin\", \"username\": \"档口长\", \"merchant_id\": 1}', '新建档口管理员', '10.0.0.50', 'Mozilla/5.0', '2026-02-02 22:41:48'),
(10, 11, 4, 'update_admin', 'admin', 12, '{\"identity_suffix\": \"档口主管\"}', '{\"identity_suffix\": \"高级档口主管\"}', '提升档口长等级', '10.0.0.50', 'Mozilla/5.0', '2026-02-03 01:41:48'),
(11, 12, 5, 'update_admin', 'admin', 12, '{\"identity_suffix\": \"档口主管\"}', '{\"identity_suffix\": \"高级档口主管\"}', '自助更新身份信息', '10.0.0.60', 'Mozilla/5.0', '2026-02-03 03:11:48'),
(12, 12, 5, 'grant_permission', 'permission', 128, NULL, '{\"permission\": \"dish.create\", \"position_id\": 5}', '商品管理权限', '10.0.0.60', 'Mozilla/5.0', '2026-02-03 03:26:48'),
(13, 11, 4, 'pending_review_suffix', 'admin', 11, NULL, '{\"status\": \"pending\", \"identity_suffix\": \"直播主播\"}', '等待身份后缀审批', '10.0.0.50', 'Mozilla/5.0', '2026-02-02 21:41:48'),
(14, 2, 1, 'pending_review_admin', 'admin', 14, NULL, '{\"status\": \"pending_review\", \"real_name\": \"新管理员\"}', '等待上级审批', '192.168.1.100', 'Mozilla/5.0', '2026-02-02 22:41:48'),
(15, 13, 6, 'create_admin', 'admin', 10, NULL, '{\"role\": \"school_admin\", \"username\": \"学校管理员\"}', '平台启动初始化', '127.0.0.1', 'Mozilla/5.0', '2026-01-09 03:41:48'),
(16, 13, 6, 'assign_position', 'position', 1, NULL, '{\"role\": \"school_admin\", \"admin_id\": 2, \"school_id\": 1}', '关键部署', '127.0.0.1', 'Mozilla/5.0', '2026-01-10 03:41:48'),
(17, 13, 6, 'grant_permission', 'permission', 28, NULL, '{\"permission\": \"org.merchant.create\", \"position_id\": 1}', '权限初始化', '127.0.0.1', 'Mozilla/5.0', '2026-01-11 03:41:48'),
(18, 2, 1, 'create_admin', 'admin', 11, NULL, '{\"role\": \"merchant_admin\", \"username\": \"商户管理员\"}', '学校初期部署', '192.168.1.100', 'Mozilla/5.0', '2026-01-12 03:41:48'),
(19, 2, 1, 'create_admin', 'admin', 12, NULL, '{\"role\": \"stall_admin\", \"username\": \"档口管理员\"}', '学校初期部署', '192.168.1.100', 'Mozilla/5.0', '2026-01-13 03:41:48');

-- --------------------------------------------------------

--
-- 表的结构 `admin_permissions`
--

CREATE TABLE `admin_permissions` (
  `id` int(11) NOT NULL,
  `position_id` int(11) NOT NULL COMMENT '职位ID（关联 admin_positions.id）',
  `permission` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限标识，如 admin.create',
  `granted_by` int(11) NOT NULL COMMENT '授权人ID',
  `granted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` datetime DEFAULT NULL COMMENT 'NULL表示当前有效'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员权限授予表';

--
-- 转存表中的数据 `admin_permissions`
--

INSERT INTO `admin_permissions` (`id`, `position_id`, `permission`, `granted_by`, `granted_at`, `revoked_at`) VALUES
(1, 6, 'org.school.create', 1, '2026-02-01 17:22:11', NULL),
(2, 6, 'org.school.update', 1, '2026-02-01 17:22:11', NULL),
(3, 6, 'org.school.disable', 1, '2026-02-01 17:22:11', NULL),
(4, 6, 'org.merchant.create', 1, '2026-02-01 17:22:11', NULL),
(5, 6, 'org.merchant.update', 1, '2026-02-01 17:22:11', NULL),
(6, 6, 'org.merchant.move', 1, '2026-02-01 17:22:11', NULL),
(7, 6, 'org.merchant.disable', 1, '2026-02-01 17:22:11', NULL),
(8, 6, 'org.stall.create', 1, '2026-02-01 17:22:11', NULL),
(9, 6, 'org.stall.update', 1, '2026-02-01 17:22:11', NULL),
(10, 6, 'org.stall.move', 1, '2026-02-01 17:22:11', NULL),
(11, 6, 'org.stall.disable', 1, '2026-02-01 17:22:11', NULL),
(12, 6, 'admin.create', 1, '2026-02-01 17:22:11', NULL),
(13, 6, 'admin.update', 1, '2026-02-01 17:22:11', NULL),
(14, 6, 'admin.disable', 1, '2026-02-01 17:22:11', NULL),
(15, 6, 'admin.assign', 1, '2026-02-01 17:22:11', NULL),
(16, 6, 'admin.unassign', 1, '2026-02-01 17:22:11', NULL),
(17, 6, 'admin.grant', 1, '2026-02-01 17:22:11', NULL),
(18, 6, 'admin.role', 1, '2026-02-01 17:22:11', NULL),
(19, 6, 'admin.identity.approve', 1, '2026-02-01 17:22:11', NULL),
(20, 6, 'admin.audit', 1, '2026-02-01 17:22:11', NULL),
(21, 6, 'content.announce.create', 1, '2026-02-01 17:22:11', NULL),
(22, 6, 'content.announce.update', 1, '2026-02-01 17:22:11', NULL),
(23, 6, 'content.announce.publish', 1, '2026-02-01 17:22:11', NULL),
(24, 6, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(25, 6, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(26, 6, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(27, 6, 'data.report.view', 1, '2026-02-01 17:22:11', NULL),
(28, 1, 'org.merchant.create', 1, '2026-02-01 17:22:11', NULL),
(29, 2, 'org.merchant.create', 1, '2026-02-01 17:22:11', NULL),
(30, 3, 'org.merchant.create', 1, '2026-02-01 17:22:11', NULL),
(31, 1, 'org.merchant.update', 1, '2026-02-01 17:22:11', NULL),
(32, 2, 'org.merchant.update', 1, '2026-02-01 17:22:11', NULL),
(33, 3, 'org.merchant.update', 1, '2026-02-01 17:22:11', NULL),
(34, 1, 'org.merchant.move', 1, '2026-02-01 17:22:11', NULL),
(35, 2, 'org.merchant.move', 1, '2026-02-01 17:22:11', NULL),
(36, 3, 'org.merchant.move', 1, '2026-02-01 17:22:11', NULL),
(37, 1, 'org.merchant.disable', 1, '2026-02-01 17:22:11', NULL),
(38, 2, 'org.merchant.disable', 1, '2026-02-01 17:22:11', NULL),
(39, 3, 'org.merchant.disable', 1, '2026-02-01 17:22:11', NULL),
(40, 1, 'org.stall.create', 1, '2026-02-01 17:22:11', NULL),
(41, 2, 'org.stall.create', 1, '2026-02-01 17:22:11', NULL),
(42, 3, 'org.stall.create', 1, '2026-02-01 17:22:11', NULL),
(43, 1, 'org.stall.update', 1, '2026-02-01 17:22:11', NULL),
(44, 2, 'org.stall.update', 1, '2026-02-01 17:22:11', NULL),
(45, 3, 'org.stall.update', 1, '2026-02-01 17:22:11', NULL),
(46, 1, 'org.stall.move', 1, '2026-02-01 17:22:11', NULL),
(47, 2, 'org.stall.move', 1, '2026-02-01 17:22:11', NULL),
(48, 3, 'org.stall.move', 1, '2026-02-01 17:22:11', NULL),
(49, 1, 'org.stall.disable', 1, '2026-02-01 17:22:11', NULL),
(50, 2, 'org.stall.disable', 1, '2026-02-01 17:22:11', NULL),
(51, 3, 'org.stall.disable', 1, '2026-02-01 17:22:11', NULL),
(52, 1, 'org.school.update', 1, '2026-02-01 17:22:11', NULL),
(53, 2, 'org.school.update', 1, '2026-02-01 17:22:11', NULL),
(54, 3, 'org.school.update', 1, '2026-02-01 17:22:11', NULL),
(55, 1, 'admin.create', 1, '2026-02-01 17:22:11', NULL),
(56, 2, 'admin.create', 1, '2026-02-01 17:22:11', NULL),
(57, 3, 'admin.create', 1, '2026-02-01 17:22:11', NULL),
(58, 1, 'admin.update', 1, '2026-02-01 17:22:11', NULL),
(59, 2, 'admin.update', 1, '2026-02-01 17:22:11', NULL),
(60, 3, 'admin.update', 1, '2026-02-01 17:22:11', NULL),
(61, 1, 'admin.disable', 1, '2026-02-01 17:22:11', NULL),
(62, 2, 'admin.disable', 1, '2026-02-01 17:22:11', NULL),
(63, 3, 'admin.disable', 1, '2026-02-01 17:22:11', NULL),
(64, 1, 'admin.assign', 1, '2026-02-01 17:22:11', NULL),
(65, 2, 'admin.assign', 1, '2026-02-01 17:22:11', NULL),
(66, 3, 'admin.assign', 1, '2026-02-01 17:22:11', NULL),
(67, 1, 'admin.unassign', 1, '2026-02-01 17:22:11', NULL),
(68, 2, 'admin.unassign', 1, '2026-02-01 17:22:11', NULL),
(69, 3, 'admin.unassign', 1, '2026-02-01 17:22:11', NULL),
(70, 1, 'admin.grant', 1, '2026-02-01 17:22:11', NULL),
(71, 2, 'admin.grant', 1, '2026-02-01 17:22:11', NULL),
(72, 3, 'admin.grant', 1, '2026-02-01 17:22:11', NULL),
(73, 1, 'admin.identity.approve', 1, '2026-02-01 17:22:11', NULL),
(74, 2, 'admin.identity.approve', 1, '2026-02-01 17:22:11', NULL),
(75, 3, 'admin.identity.approve', 1, '2026-02-01 17:22:11', NULL),
(76, 1, 'admin.audit', 1, '2026-02-01 17:22:11', NULL),
(77, 2, 'admin.audit', 1, '2026-02-01 17:22:11', NULL),
(78, 3, 'admin.audit', 1, '2026-02-01 17:22:11', NULL),
(79, 1, 'content.announce.create', 1, '2026-02-01 17:22:11', NULL),
(80, 2, 'content.announce.create', 1, '2026-02-01 17:22:11', NULL),
(81, 3, 'content.announce.create', 1, '2026-02-01 17:22:11', NULL),
(82, 1, 'content.announce.update', 1, '2026-02-01 17:22:11', NULL),
(83, 2, 'content.announce.update', 1, '2026-02-01 17:22:11', NULL),
(84, 3, 'content.announce.update', 1, '2026-02-01 17:22:11', NULL),
(85, 1, 'content.announce.publish', 1, '2026-02-01 17:22:11', NULL),
(86, 2, 'content.announce.publish', 1, '2026-02-01 17:22:11', NULL),
(87, 3, 'content.announce.publish', 1, '2026-02-01 17:22:11', NULL),
(88, 1, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(89, 2, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(90, 3, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(91, 1, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(92, 2, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(93, 3, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(94, 1, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(95, 2, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(96, 3, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(97, 1, 'data.report.view', 1, '2026-02-01 17:22:11', NULL),
(98, 2, 'data.report.view', 1, '2026-02-01 17:22:11', NULL),
(99, 3, 'data.report.view', 1, '2026-02-01 17:22:11', NULL),
(100, 4, 'org.merchant.create', 1, '2026-02-01 17:22:11', NULL),
(101, 4, 'org.merchant.update', 1, '2026-02-01 17:22:11', NULL),
(102, 4, 'org.merchant.move', 1, '2026-02-01 17:22:11', NULL),
(103, 4, 'org.merchant.disable', 1, '2026-02-01 17:22:11', NULL),
(104, 4, 'org.stall.create', 1, '2026-02-01 17:22:11', NULL),
(105, 4, 'org.stall.update', 1, '2026-02-01 17:22:11', NULL),
(106, 4, 'org.stall.move', 1, '2026-02-01 17:22:11', NULL),
(107, 4, 'org.stall.disable', 1, '2026-02-01 17:22:11', NULL),
(108, 4, 'admin.create', 1, '2026-02-01 17:22:11', NULL),
(109, 4, 'admin.update', 1, '2026-02-01 17:22:11', NULL),
(110, 4, 'admin.disable', 1, '2026-02-01 17:22:11', NULL),
(111, 4, 'admin.assign', 1, '2026-02-01 17:22:11', NULL),
(112, 4, 'admin.unassign', 1, '2026-02-01 17:22:11', NULL),
(113, 4, 'admin.grant', 1, '2026-02-01 17:22:11', NULL),
(114, 4, 'admin.identity.approve', 1, '2026-02-01 17:22:11', NULL),
(115, 4, 'admin.audit', 1, '2026-02-01 17:22:11', NULL),
(116, 4, 'content.announce.create', 1, '2026-02-01 17:22:11', NULL),
(117, 4, 'content.announce.update', 1, '2026-02-01 17:22:11', NULL),
(118, 4, 'content.announce.publish', 1, '2026-02-01 17:22:11', NULL),
(119, 4, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(120, 4, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(121, 4, 'dish.create', 1, '2026-02-01 17:22:11', NULL),
(122, 4, 'dish.update', 1, '2026-02-01 17:22:11', NULL),
(123, 4, 'dish.delete', 1, '2026-02-01 17:22:11', NULL),
(124, 4, 'stock.update', 1, '2026-02-01 17:22:11', NULL),
(125, 4, 'price.update', 1, '2026-02-01 17:22:11', NULL),
(126, 4, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(127, 4, 'data.report.view', 1, '2026-02-01 17:22:11', NULL),
(128, 5, 'dish.create', 1, '2026-02-01 17:22:11', NULL),
(129, 5, 'dish.update', 1, '2026-02-01 17:22:11', NULL),
(130, 5, 'dish.delete', 1, '2026-02-01 17:22:11', NULL),
(131, 5, 'stock.update', 1, '2026-02-01 17:22:11', NULL),
(132, 5, 'price.update', 1, '2026-02-01 17:22:11', NULL),
(133, 5, 'review.audit', 1, '2026-02-01 17:22:11', NULL),
(134, 5, 'review.delete', 1, '2026-02-01 17:22:11', NULL),
(135, 5, 'data.dashboard.view', 1, '2026-02-01 17:22:11', NULL),
(136, 5, 'data.report.view', 1, '2026-02-01 17:22:11', NULL);

-- --------------------------------------------------------

--
-- 表的结构 `admin_positions`
--

CREATE TABLE `admin_positions` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL COMMENT '管理员ID',
  `role` enum('super_admin','school_admin','merchant_admin','stall_admin') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员角色',
  `school_id` int(11) DEFAULT NULL COMMENT '学校ID（NULL表示平台级）',
  `merchant_node_id` int(11) DEFAULT NULL COMMENT '商户树节点ID（NULL表示学校级/平台级）',
  `stall_id` int(11) DEFAULT NULL COMMENT '档口ID（NULL表示非档口级）',
  `assigned_by` int(11) NOT NULL COMMENT '绑定操作者ID',
  `assigned_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `unassigned_at` datetime DEFAULT NULL COMMENT 'NULL表示当前生效',
  `unassigned_by` int(11) DEFAULT NULL COMMENT '解绑操作者ID',
  `unassign_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '解绑原因（用于审计）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员职位绑定表（支持多职位、历史记录）';

--
-- 转存表中的数据 `admin_positions`
--

INSERT INTO `admin_positions` (`id`, `admin_id`, `role`, `school_id`, `merchant_node_id`, `stall_id`, `assigned_by`, `assigned_at`, `unassigned_at`, `unassigned_by`, `unassign_reason`) VALUES
(1, 2, 'school_admin', 1, NULL, NULL, 13, '2026-01-17 00:03:53', NULL, NULL, NULL),
(2, 3, 'school_admin', 1, NULL, NULL, 13, '2026-01-17 20:42:18', NULL, NULL, NULL),
(3, 10, 'school_admin', 1, NULL, NULL, 13, '2026-01-31 16:36:29', NULL, NULL, NULL),
(4, 11, 'merchant_admin', 1, 1, NULL, 13, '2026-01-31 16:37:35', NULL, NULL, NULL),
(5, 12, 'stall_admin', 1, 1, 1, 13, '2026-01-31 16:55:18', NULL, NULL, NULL),
(6, 13, 'super_admin', 1, NULL, NULL, 13, '2026-01-31 17:28:01', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '登录用户名',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码哈希',
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '真实姓名',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `identity_label` enum('教职工','工作人员','运营专员') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '工作人员' COMMENT '固定身份标签',
  `identity_suffix` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '自定义后缀（如：主播、审核员、档口长）',
  `identity_suffix_status` enum('draft','pending_review','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'draft' COMMENT '后缀审核状态',
  `identity_suffix_approver_id` int(11) DEFAULT NULL COMMENT '后缀审核人ID',
  `identity_suffix_approved_at` datetime DEFAULT NULL COMMENT '后缀审核通过时间',
  `identity_suffix_rejected_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '拒绝原因',
  `status` enum('active','inactive','banned') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `created_by` int(11) DEFAULT NULL COMMENT '创建者ID',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL COMMENT '软删除时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员账号表';

--
-- 转存表中的数据 `admin_users`
--

INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `real_name`, `phone`, `email`, `identity_label`, `identity_suffix`, `identity_suffix_status`, `identity_suffix_approver_id`, `identity_suffix_approved_at`, `identity_suffix_rejected_reason`, `status`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'bql2025', '$2a$10$gNR.gL8wdWoc3rWVzN.W2OryTgAlqLPzH5ejCAB72ZpWMnnnrpaRy', 'bql2025', NULL, NULL, '工作人员', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-17 00:03:53', '2026-01-17 00:03:53', NULL),
(3, '羊羊羊', '$2a$10$3NMNy7UicAsK/B6r2/3CUeaDzb14WdVxr2jZ1kEFoqUBKRfGbNhC.', '羊羊羊', NULL, NULL, '工作人员', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-17 20:42:18', '2026-01-17 20:42:18', NULL),
(10, '学校管理员', '$2a$10$hOVa4i8tAG2dqjVYSfogSuGT7Ihfn964H45vVJUMksbn1qbhkzXPi', '学校管理员', NULL, NULL, '教职工', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-31 16:36:29', '2026-01-31 16:36:29', NULL),
(11, '商户管理员', '$2a$10$24MOwImv0qfQ5pOr97iGKeJcZSSq2j94FAB081hsx/3bE.r7C7rPy', '商户管理员', NULL, NULL, '工作人员', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-31 16:37:35', '2026-01-31 16:37:35', NULL),
(12, '档口管理员', '$2a$10$H0yL.Nbgr8556qJ8XmE4rOKVmg68kXyJQT2aZrQJPeOufdDwv0ZnC', '档口管理员', NULL, NULL, '工作人员', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-31 16:55:18', '2026-01-31 16:55:18', NULL),
(13, '超级管理员', '$2a$10$LjDSYyKPaqFsO8Hje6C9IuyQ7r2JlLkZuCoprzkJOH49Dm4rBGu7i', '超级管理员', NULL, NULL, '运营专员', NULL, 'draft', NULL, NULL, NULL, 'active', NULL, '2026-01-31 17:28:01', '2026-01-31 17:28:01', NULL);

-- --------------------------------------------------------

--
-- 表的结构 `checkins`
--

CREATE TABLE `checkins` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `merchant_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户打卡';

-- --------------------------------------------------------

--
-- 表的结构 `comments`
--

CREATE TABLE `comments` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL COMMENT '帖子ID',
  `user_id` int(11) NOT NULL COMMENT '评论人',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '评论内容',
  `parent_id` int(11) DEFAULT NULL COMMENT '父级评论',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区评论表';

-- --------------------------------------------------------

--
-- 表的结构 `content_audit`
--

CREATE TABLE `content_audit` (
  `id` int(11) NOT NULL,
  `author` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `content` text COLLATE utf8mb4_unicode_ci,
  `content_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'post',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `images` json DEFAULT NULL,
  `sensitive_words` json DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- 表的结构 `dishes`
--

CREATE TABLE `dishes` (
  `id` int(11) NOT NULL,
  `stall_id` int(11) NOT NULL COMMENT '所属档口',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '菜品名称',
  `price` decimal(10,2) NOT NULL COMMENT '价格',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '菜品图片',
  `stock_mode` enum('limited','unlimited') COLLATE utf8mb4_unicode_ci DEFAULT 'unlimited' COMMENT '库存模式',
  `total_stock` int(11) DEFAULT NULL COMMENT '总库存（限量模式）',
  `remaining_stock` int(11) DEFAULT NULL COMMENT '剩余库存（限量模式）',
  `is_available` tinyint(1) DEFAULT '1' COMMENT '是否在售',
  `tags` json DEFAULT NULL COMMENT '口味/特性标签',
  `popularity` int(11) DEFAULT '0' COMMENT '热度',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜品表';

--
-- 转存表中的数据 `dishes`
--

INSERT INTO `dishes` (`id`, `stall_id`, `name`, `price`, `image`, `stock_mode`, `total_stock`, `remaining_stock`, `is_available`, `tags`, `popularity`, `created_at`, `updated_at`) VALUES
(1, 1, '宫保鸡丁', '15.00', 'https://via.placeholder.com/80?text=宫保鸡丁', 'limited', 50, 12, 1, '[\"微辣\", \"下饭\"]', 89, '2026-01-11 08:05:28', '2026-01-11 08:05:28'),
(2, 1, '麻婆豆腐', '12.00', 'https://via.placeholder.com/80?text=麻婆豆腐', 'unlimited', NULL, NULL, 1, '[\"中辣\", \"川味\"]', 76, '2026-01-11 08:05:28', '2026-01-11 08:05:28'),
(3, 2, '鱼香肉丝', '16.00', 'https://via.placeholder.com/80?text=鱼香肉丝', 'limited', 30, 3, 1, '[\"甜辣\", \"家常\"]', 95, '2026-01-11 08:05:28', '2026-01-11 08:05:28');

-- --------------------------------------------------------

--
-- 表的结构 `global_id_sequence`
--

CREATE TABLE `global_id_sequence` (
  `id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='全局ID序列，供应用层获取';

-- --------------------------------------------------------

--
-- 表的结构 `id_sequence`
--

CREATE TABLE `id_sequence` (
  `id` int(11) NOT NULL,
  `table_name` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `current_val` int(11) NOT NULL DEFAULT '0' COMMENT '对应业务表的当前最大ID',
  `step` int(11) NOT NULL DEFAULT '1' COMMENT 'ID自增步长（默认1）'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='users和admin_users共享的ID序列';

--
-- 转存表中的数据 `id_sequence`
--

INSERT INTO `id_sequence` (`id`, `table_name`, `created_at`, `current_val`, `step`) VALUES
(3, 'users_admin_shared', '2026-02-04 00:10:05', 16, 1);

-- --------------------------------------------------------

--
-- 表的结构 `merchants`
--

CREATE TABLE `merchants` (
  `id` int(11) NOT NULL,
  `school_id` int(11) DEFAULT NULL COMMENT '所属学校ID',
  `parent_id` int(11) DEFAULT NULL COMMENT '父节点ID（同表自关联）',
  `node_type` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'merchant' COMMENT '节点类型: merchant/area/floor 等',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商户名称',
  `banner_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商户横幅图',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `rating` decimal(3,2) DEFAULT '0.00' COMMENT '综合评分',
  `review_count` int(11) DEFAULT '0' COMMENT '评价数量',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商户表';

--
-- 转存表中的数据 `merchants`
--

INSERT INTO `merchants` (`id`, `school_id`, `parent_id`, `node_type`, `name`, `banner_image`, `tags`, `rating`, `review_count`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, 'merchant', '商户A', 'https://via.placeholder.com/800x200?text=MerchantA', '[\"干净\", \"好评多\"]', '4.60', 12, '2026-01-11 08:05:28', '2026-02-02 20:33:54'),
(2, 1, NULL, 'merchant', '商户B', NULL, NULL, '0.00', 0, '2026-02-05 02:20:43', '2026-02-05 02:20:43'),
(4, 3, NULL, 'merchant', '商户A', NULL, NULL, '0.00', 0, '2026-02-05 02:27:43', '2026-02-05 02:27:43'),
(5, 1, 1, 'merchant', '一楼', NULL, NULL, '0.00', 0, '2026-02-05 02:27:43', '2026-02-05 02:27:43');

-- --------------------------------------------------------

--
-- 表的结构 `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) DEFAULT '0.00',
  `status` enum('processing','completed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'processing',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- --------------------------------------------------------

--
-- 表的结构 `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单明细';

-- --------------------------------------------------------

--
-- 表的结构 `posts`
--

CREATE TABLE `posts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT '作者',
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '标题',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '正文',
  `tags` json DEFAULT NULL COMMENT '标签数组',
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '图片URL',
  `like_count` int(11) DEFAULT '0' COMMENT '点赞数',
  `comment_count` int(11) DEFAULT '0' COMMENT '评论数',
  `view_count` int(11) DEFAULT '0' COMMENT '浏览数',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社区帖子表';

-- --------------------------------------------------------

--
-- 表的结构 `post_likes`
--

CREATE TABLE `post_likes` (
  `id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='帖子点赞表';

-- --------------------------------------------------------

--
-- 表的结构 `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='刷新令牌表';

--
-- 转存表中的数据 `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(12, 4, '72f6e243edf35ea727c6a43309903bc06ec72f80bc403970d859ed5b34ce27c7c48d18710beab7a4b2d7556841a81cffe6bfa7224ad2b3f086cc08780493f6b1', '2026-02-16 21:00:02', '2026-01-17 13:00:01'),
(20, 4, '0db57e9d63dd027cd30ff711558f2619e1df1b39675d3362dc33d159e96a3e21c2c0346aa74f3c09dc6eebc72017f1616fdc6439b592db8ed41e84ba86eb68be', '2026-02-16 22:13:51', '2026-01-17 14:13:51'),
(23, 4, 'eae82d0e5bb0532bab7e32572b260c5084cab9999963698b3d3a1c0bd016b411845fa06752822861bce4379eed2794832d8bf327eb3f9099de12f564492cb2b8', '2026-02-16 22:30:12', '2026-01-17 14:30:12'),
(32, 4, '4c24c0aff26ef79eec55c925200456817b1e94d493470856dad6171ea76143aab4e5063c187121fe8fc9c61d73afdfab99ca9c81332616839882ddcb8a03857f', '2026-02-19 18:31:02', '2026-01-20 10:31:02'),
(33, 4, 'd798f8e9f4b52816bf920f1fdecb3f10733f3642f5db995eb89934e7510b211a506ddc1d3bcc0e8d8a1d9bb3895608cf239c10761a8389a3097cdcd33427d9a0', '2026-02-19 18:31:06', '2026-01-20 10:31:06'),
(35, 4, '4bf069eeef117e621053c5a75a66e1d39436163f579b0ee98ef9c41cff76378d7998a08b1374d31534d9c39f8bc8c4c764a26a1c744666b5051637ddd64f9026', '2026-02-19 18:32:18', '2026-01-20 10:32:17'),
(36, 4, '04d4950c61856b207548c7e8e3d3c3ab735aa96172e29bb2aeb314f229ab691eddc3f659ae7d4741da1bd7f180662786b138d1041e5825864eedf2f5622a30e3', '2026-02-19 18:34:30', '2026-01-20 10:34:30'),
(38, 4, '8d50cd2379861511cfd4f85a9cc5bd07751c398cca112e3619fcaf86ff1f7cad04f5149c5563711b50ca4622dfef7a270d2a0eb376f71ac0aebbd5942f3298f2', '2026-02-19 18:34:48', '2026-01-20 10:34:47'),
(42, 4, '123d1fd737f97a9fec0d83aaaad4ef6ff9ae5d679a504f7622f49a42596feb539164f5b62d4e9acb6341669c6a4e305301a75f344f265fa9a7b5ddb041eeb7ad', '2026-02-19 18:47:00', '2026-01-20 10:46:59'),
(44, 4, '6d95387dad833f358142ac6da75d4b9fad596ee5ec1c3a305e495c6bcc393df6b03abdf6ecc45d8f3a2430093415b797111e546723cca24484b0e981b1b276c1', '2026-02-19 18:47:32', '2026-01-20 10:47:32'),
(50, 4, 'a674e406e7a9dae1f89bff005a550616dd7d7ccee053635b5ca0844f9afce5e52a9a8019d4ea8245bba3b2666029b22d289cac5c7fd983210329a58e1f67be76', '2026-02-19 19:14:36', '2026-01-20 11:14:36'),
(54, 4, '4bd97382ca669aa14b606de7c5ba8efec604ab30bd7dc8eae7006e9611451754ada2f608cf351219352169af79617eab1a3158e00094989f920e2c0a11041e2a', '2026-02-19 19:58:54', '2026-01-20 11:58:53'),
(56, 4, 'edfa2ad7a18d0dd6b2b23e6a544440b1c72d625e309a6b12d3b77f57d585591e9ec297052fa8fe252f2065689e6a31d7d21612ce322541b45aa957070cdd6d94', '2026-02-19 20:00:56', '2026-01-20 12:00:56'),
(57, 4, '1dfe3f1ffb184245038fdc0d4260ea4623aa0a16711f18b6bc9a59c4c2905818838f5596ddfd5c1c65c62c6e6f629ef188ef24f9a4e1aac536b7b8ede0b84407', '2026-02-19 20:01:01', '2026-01-20 12:01:00'),
(62, 4, 'e0e9bb297bdded2d1dede6aaa0ceb657ffcbbc52dfb05bf4c307da3844c20432b8236ed312df967c316da22db16b28bd84761063cd4a43027422924040ad2d05', '2026-02-19 20:32:29', '2026-01-20 12:32:28'),
(63, 4, '24f6811e3f0f0fa925b644177e4fe6601cb0d016b459ff0bba86e8e61a60e8a6e18a634c0b88b6d48ffe230bcf63da1013e8a72dcdcdfa0bc042a54e68a9add3', '2026-02-19 20:32:35', '2026-01-20 12:32:34'),
(64, 4, '94418d81f6b443cd1e061a6887fbcdb39a9e6dc40b6d607c49fecdbe5a5bff99420a574756bd9b40e457d72ae427cbc4794e303718215dc10764606d9cbe0724', '2026-02-19 20:33:07', '2026-01-20 12:33:06'),
(73, 4, 'da018ed1e6d31feff3fec4a64bafaa598ed331cf362e46ba043f495f1d44faea35f23a2584103338cbd6e932a23d25e846c4e9b1c8fc848b733350d45cb0b9ba', '2026-02-19 20:59:31', '2026-01-20 12:59:30'),
(76, 4, '9f52a36e6bcd6a603c883a980556714bf10d7289a3da1b83a7ce7f681255a6ebd6b43faf824a51e64f8b2e45d6e647f79783a5ee0aeecfe55b7d0e4c78cee189', '2026-02-19 21:09:07', '2026-01-20 13:09:06'),
(79, 4, '397d4be3ae761b93892aef8334150247a37d1b5015d2982945b7b8eb86eeb430ba652b230210a1747e3300377551cfd2c5f0641c238d72647cf5cf23e10bab65', '2026-02-19 21:14:13', '2026-01-20 13:14:13'),
(83, 4, '8efa96c693d08c785548619af67a20a8923894cf2165edfd7fea4b836e5fe0c4e7f68a36c01e4a928e876f9a2cab41d2697f8e8ced8bd57f76597e2baa92369b', '2026-02-19 21:20:37', '2026-01-20 13:20:36'),
(84, 4, '7f650fdf4ff26308500453e8f568ebc605ff907eef4274ad71c88b8daa7f66eb12782abfb2f5206698c48cfe4103f8a911cfb3fd7b1a7b0e4adf60260217732f', '2026-02-19 21:20:42', '2026-01-20 13:20:42'),
(85, 4, 'f0382b43e68a17e3dfefd51976bc29d55607bb9210ad824ed826e870e3175bda74ae57c97595b562b17bd6e7826b96479750a55c1821425b596197921da7a81e', '2026-02-19 21:27:18', '2026-01-20 13:27:17'),
(86, 4, 'a37ae01b2be9d1a8e040c6741808e0f2c0968fa199aafa954d3bf58b63fd80538828a348ebd6eade168a9fa034fd04a87721cd374bd76ef99d50e99139a4b7b9', '2026-02-19 21:27:20', '2026-01-20 13:27:20'),
(90, 4, 'f1bfb2a47119668c13c64fbb072541aeb36411b27811fb85b5ac3141b196e71b8cc91ce51d1d314873fd7f4d7b7cfc60f3d8f449b8f82d12c8a5fc32455adbf2', '2026-02-19 21:27:57', '2026-01-20 13:27:57'),
(91, 4, 'b7893bdca4b8e5c3b16dc2f60f1a510f0ff2b85286ccbe29a9c109f76b03882f471b752c2a799d932ca4965014a3310d275de327f7971967db784f4b191bde9f', '2026-02-19 21:29:08', '2026-01-20 13:29:08'),
(94, 4, '0b65eb64b3baaeb3c8e9e638494d9972143f6347c649b34b8c431f223f0a2ed3a502f446a4faa9f1a1239467eb6e4cc0070ef6e894b23897771d80f7bd60a35b', '2026-02-19 21:31:57', '2026-01-20 13:31:57'),
(96, 4, '58137c36865eb7ed817af684070157cdc511427e982b137bfde39a92d7bb8fee3e46a9d10e77b3c1ba10a8ce7dee599f8744c8549d42a2748eb2fa6ecad45fdb', '2026-02-19 21:59:07', '2026-01-20 13:59:06'),
(97, 4, 'd06959baf35000151c1a93cd3ca019b147e135ef21c544a248a72e51a4113561104afdb430d5e214ea18350b765c27e0810879825c44445bd172d583f3821e1d', '2026-02-19 22:28:20', '2026-01-20 14:28:20'),
(101, 4, 'bb2f52a21b06934063fcd1281386f46c74c2c96570b19367add5164f4bb6d1ec602adc19e4f6eef6db6804d07117cd17703446a2bc2ce81925a1f381398c7e9b', '2026-02-19 22:32:26', '2026-01-20 14:32:25'),
(115, 4, '3232da4932cd81035adf0170cb2f97d3917e93872186db5a5a3eaba50a5ad94e5011f1e527f43d6fbc8cf9544358bbe21429612b88882fc0f4913f0e36bdce56', '2026-02-20 22:25:06', '2026-01-21 14:25:05'),
(126, 4, 'd9e64c1c8e9f207e01b02736ea64f8f3f253ec75e9cbf866fe99490e9efda78cfebc628936e1f4718bb8faa60f1c5fca57136e799a414d2e68f0365ba9914644', '2026-02-22 21:25:05', '2026-01-23 13:25:05'),
(127, 4, 'ca193ff04806ff3c56d8980d244fcd9751b7640c2fe7dac4690a0fc340723a7a439e28f9736d2694f7e965e4023357772378e11230ff58b839ef6ea2314828c1', '2026-02-22 21:29:56', '2026-01-23 13:29:55'),
(129, 4, '1d763fc64f26abd034709d33dc794f0e86f3c9834aaa176c3d571d8abb35275770a40d4abb5b20ce3168cba5a51b11ca088e23a0a64c9daa09570cc3f7fc30e4', '2026-02-22 21:40:48', '2026-01-23 13:40:47'),
(130, 4, 'a3e19322d991de64a5ebfa493f1878034df053872317e2684da88b5dbac0aa62eae021acbe91550fe0aedca8bbad961cebdb20c6d58c79abcb9f6663d8865024', '2026-02-22 23:42:34', '2026-01-23 15:42:33'),
(131, 4, 'd783d4de7f62c06c68417a952fc74b06008c2bc44643877692dab579431d4c732b93694c5377eb08e2660c8631ddf2a05345a13f5aeb3615174c7cb66699e8d0', '2026-02-23 00:07:02', '2026-01-23 16:07:01'),
(132, 4, '9ad4e5f04b8ff096947ce69815b2aeb2532239287b96bbcdfe5c9c2c69c42a80ad447e935339bd92badad6dd0b5437e0b2e28b619e7e0e2eb31d9a0c6f8f2c01', '2026-02-23 18:48:26', '2026-01-24 10:48:25'),
(133, 4, '82887cb2cf84eddbc7c7c01a96aebbe5de8173ba394084c6d22f34c9166e3f7e60b6f9478268adcc49a7e8027d4372367fb8b893f08ef8d936144633d7f4af49', '2026-02-23 18:49:10', '2026-01-24 10:49:09'),
(134, 4, '3582f3df9a475f933f997b5a31b7402c593a0a98cba3db8490824e31086b1f39c55ea3d7687c116211bee4b0a16fd105c4cb035f26ca532eb4a68689f8033d6a', '2026-02-24 12:15:32', '2026-01-25 04:15:31'),
(136, 4, '2a224e9d2c05ebb4943e43d5da9b6c560aa572c9667bac71150120ec11654eee0854b2676d98e26e1956a71282073fa019842e5f958f585dbea0f0778e9359e6', '2026-02-24 12:56:55', '2026-01-25 04:56:55'),
(138, 4, '2bcf7920638869a0a9e19600ee25277805ba2ac967994ef6fbba108650b2ddc356f8c958a7e73e40fbe66325aca702f36f8695e6737d859d40d7dbba874e8950', '2026-02-24 12:58:17', '2026-01-25 04:58:16'),
(139, 1, '7aa268af9fe403a100859be3e9aba3d7d4b9647bf11a066295412219ed1e066cefb3bfec0c007b369ed0e2b342c9d418af27b9abd47328963355f93dab721063', '2026-02-24 12:58:38', '2026-01-25 04:58:38'),
(140, 1, 'de8724a9e9dd2263edab3dec76dc121ac374dfcfd7eb98c10f8884885fdab5d9f0798916b478245afbda76e7748ee3490d1693bb8c2d19c306057ffb34eeb147', '2026-02-24 12:58:52', '2026-01-25 04:58:52'),
(142, 1, 'c180cd8f55c792845b75d1e8f558345bd6461f1b172e757148e5f110bffcb4bbb29097fed65147b194c57fa8d44bbb3e9a28ee7b6b2360a620106d4b65331dc3', '2026-02-25 21:24:20', '2026-01-26 13:24:19'),
(143, 9, 'c1b1d10f25be5578259deb9dad6333f6758d56cd159b995b11d1902cc48d24e4fabfce654cff35d2c89938d1b394f28b796affd4edae6542e184c2dce947b5ce', '2026-02-25 21:26:33', '2026-01-26 13:26:33'),
(144, 9, '3621f05b6b4f29872e44f72d26d2542e21f1029ba1218e098cb276b9a8ec501f577b5fdd9ee2c3e27d0e34cca41d0e7a8ac7b29373ec2b6af3305edbd7958aff', '2026-02-25 21:29:32', '2026-01-26 13:29:31'),
(145, 9, '1cb51a179e97dfa745cbd27726233db165d478d0a42a4e27a717dc99d0e32e7444ff8738a97e2702c64069b88d3c2fa493566a3a1f269a8acd86aa84ac921bae', '2026-02-25 21:29:47', '2026-01-26 13:29:47'),
(146, 4, 'b721af5c17375cf08f6e918e7117b5cb47197cd86f4750e4a5c513f39c1f3184a3519a4c625677076da3b7dfeabe1a87ae7ffa9e14c7e8be6aa6fe8ab72fcccf', '2026-02-27 11:34:23', '2026-01-28 03:34:22'),
(147, 4, '67da221c2978208733d0dfc90377c363f33c166b0d8a1f76b2c06a84b6b7bad8e6aced33823d6b0fb7cb458828333cd165ac7c1ad6ffb942be75b695508ee508', '2026-02-27 11:37:30', '2026-01-28 03:37:29'),
(149, 4, '293f4266b38ac9b4933204ea0c88f70ef6470d903aa20e35b09abd942e2586cc7eeb37af14c64c9650113339b00788fc32e1895bcc610aa5feb70f9a8ce657de', '2026-02-27 13:56:25', '2026-01-28 05:56:24'),
(150, 1, '1a194e3550261369cac489fc9967dbb3e07b2eeb4014fef4be5274fb08f341f644b7a61b2109f633d551ec3fe2d6ca435326fe9b8cb3e9caea60959437acd674', '2026-02-27 15:56:20', '2026-01-28 07:56:20'),
(152, 1, '9d619775c21b3e8c9ca61cdcccabce22c08bd2f34a82d0ff15b0518bd7747b4062498ec6e39e7d32b2f207e72bb19a1eff89132a8f55bca6af3091688d781dbd', '2026-02-27 15:58:04', '2026-01-28 07:58:03'),
(191, 4, '2877274fc3c47311a441df56b6bd8a21af25674b4534263b878292c4869b7b8a2f4c835b3b3d10dd0a31abf4c3d0f8cf4da4eafab872ae4128199906e9e67a99', '2026-03-03 16:37:11', '2026-02-01 08:37:10'),
(192, 4, '6ca41c6d66264de009db99d987613c38b1e521d1df8efd16b801ec30b47c2bd11e80b8cfa3a9e3357d63ceb39461c7aa88035e3a48983ac9027de50edcfad0b9', '2026-03-03 16:37:56', '2026-02-01 08:37:55'),
(193, 4, '4521f4861e4f47f83e0712ca87966be87b4a6444124d17bb25479c17b78df3744eaac252a377584fac9b2667b3455a8004226ed0bf2a60354fd86fde1677f947', '2026-03-03 16:38:08', '2026-02-01 08:38:08'),
(194, 4, '45e860bd597f98689d0b2adc76b47d49b68c19cbd5a9f5c4d7903082f80ccb8c34eab582006aa6d62799c32c28e1c9f2a3c17cda057d1427155e9b1689a4e3fd', '2026-03-03 16:38:58', '2026-02-01 08:38:57'),
(195, 4, '33f1feb317458654125e2b2b722b730565eb4548a3a08bae3d89528e9896cf58a529ec9f30df97673c1bbe6aca88e17c4f0be92042b770ccadb143fb70d5433c', '2026-03-03 16:44:01', '2026-02-01 08:44:00'),
(196, 1, 'e56f0b5a672cdc7b67ae8b8b3983f082bdfda4d774f36864ef84809d77c17ba0c3dd59381f4bcbdcf98f17e8600eea8e0e83993c7c895ba5aab2c32f0666155b', '2026-03-03 17:53:25', '2026-02-01 09:53:24'),
(197, 1, '39ab559454957306fbb91cf53c20499ab7a7ea72563e52c4bd7e0e46d676448da57b8e0ef231adad25356a41fcfbf462aa8b47214ff64c8e6fa3da5ab48d3e12', '2026-03-03 17:53:32', '2026-02-01 09:53:32'),
(198, 1, 'bae976f4dcd3f0c2e64324e5c4b13d984a7263f69ca1ffc39e99b90adff4b2aa03de11e6c4f3a86975c2437fafa33249f70fc326535bc591a420aa72b103f9f4', '2026-03-03 17:53:40', '2026-02-01 09:53:39'),
(202, 1, '767f4eec2decf36fbe6fbbc7d8ac6d5d3e62cd3ec5e18acae4375c038a65c88eaa3a1423c352efcd00b798c1e9cc47664e8fbf43492688c43dc74276eb7d81df', '2026-03-03 20:52:15', '2026-02-01 12:52:14'),
(206, 1, 'b9b3ec2558d5315dfe85aa18189cc013c83a2c36b67e298c9547c4b6fa3a0968f623650187b065eb3d2b8efd798a9f11416df554a93127bf20d81932d8ce1950', '2026-03-03 20:53:26', '2026-02-01 12:53:25'),
(208, 1, '9032585e94802ce50f9dfa7c5912a00819f77839a308c2d721e350235542fed05688786baf04929a55449cc9b3eb49ad6f6af6ba7bf9441606b4337abe9f47fb', '2026-03-03 20:59:10', '2026-02-01 12:59:10'),
(209, 1, '60be234179f248acd48241fe5c6acb8a40dc6ca2638b0c246135815fd1c411118801b3f77e0170944c9e17b804612daf335a1935de11ea7e6d5aca610e582edd', '2026-03-03 20:59:10', '2026-02-01 12:59:10'),
(210, 1, '40fa2e6fda3a28cf6bb0e46ddafa97792af9702ac0d982cf6563a4a2d84e56abc1b82599a57d3a5907c3f307927b810b904b2734236e874ef1edb2cefa99aef2', '2026-03-03 21:30:23', '2026-02-01 13:30:23'),
(211, 1, '542ee4a6d6a4c38e38448c79571906347aecac3cedd0f6b9bc2f92ce9bb6c6b8c1a4248cf1f1ee94d190ad5ad061d5a6b27cc55cda337fae0cdab79499aa82e2', '2026-03-03 21:30:32', '2026-02-01 13:30:32'),
(212, 1, 'b0bee92ba761f6b2d90f5bc76f4834d8bf3faf22602cd41f9fcb42f705c09957214aa1d80c186d84c20b124dd1d7a61f1c5087f300cea4900d797febf64f509a', '2026-03-03 21:31:14', '2026-02-01 13:31:13'),
(213, 1, 'c61105551041340510ed391c2eb6dbfac57ca626e6ee42283221d6a622e5ecfcb6a49d6ca5475a772a7bfd3c257e28f2ea15cc1a59ab7daaebcd5df25ff1d639', '2026-03-03 21:31:14', '2026-02-01 13:31:14'),
(214, 1, '8f0dd4bd845f89a0604bb8aa6a5a5fcfe1045b628f559e4038d0427797f6ca0bb467299b459eff1a83a4ee02e7ff9be716d7fe052c1ea53b7dfdd84cb49eac6f', '2026-03-03 21:44:18', '2026-02-01 13:44:17'),
(215, 1, '86477517e269bc7cab5c1b1f542e1e43860fe9e0a883b94b330d5c802b0d7619e3895faa355e63915bb27db2da64ab4609b5c3819447ebc7eb79e4bacebf7be2', '2026-03-03 21:44:25', '2026-02-01 13:44:24'),
(217, 1, 'e6ac90f9f27186a7ed206a81afc084d57a84652b7fb8ad5ca89767bc2da34f87f3dcc6f718680124ace73d37287ebb7394a9ae1917a996ce21fe78abf7829b68', '2026-03-03 21:57:58', '2026-02-01 13:57:58'),
(218, 1, '148a581df782b0031315ad7ed46255e01c9e3315a580b6b2202949dd532226cae4e0ea4c59394c790e2e987d949fa1315a3e09f8f233c1da9a80e20e678c16ee', '2026-03-03 22:02:31', '2026-02-01 14:02:31'),
(219, 1, '2f020868e27e6005276cdba5eed420a870ff0ecbabcf908b219470d8950460de45a4a2e3a99d7dc38698713397206d6165def256c95722bfcdf67b9381cc5586', '2026-03-03 22:23:56', '2026-02-01 14:23:56'),
(221, 1, '18e942da06457c1686aaa765bc411d4eb3323d0d952c6d8ffc7b631f8831c0a2fdffcad0864bbfececf0578ea71632c5d85d316a36a59bda57cde55c943b64b6', '2026-03-03 23:03:41', '2026-02-01 15:03:40'),
(222, 1, 'dbbdcba7d62047abead5423176b5aadddfa63db979d5572d991a71a5243250f2b3914668b6455c458752ecc57a147bb838c222e73ac58b4391401e31f4312c0a', '2026-03-03 23:10:13', '2026-02-01 15:10:13'),
(223, 1, 'a7e6a433799153545e28ccb09b9b4dc4e234cb42621191d94b9bc5b72e039f07609a5d9608e6b0f6e8469d41b9f9228cda14814a39119cff61d12a062c69b3d1', '2026-03-03 23:13:45', '2026-02-01 15:13:45'),
(224, 1, '8beb90f67302c6139250eb9752194af3ccb43687e1e8e1f4544242601a893115d6ce1bf6ef9f990850272247e1f01db9d369231013c47de98f01d642cd2d52ea', '2026-03-03 23:14:12', '2026-02-01 15:14:11'),
(225, 1, '45c64a91e6e5b219b3c948349c4ed5ac767bf4891454fd6b81c389c91cd5ac7e5310680bafc5d3c0aec9c69dde1ce5964aba22fb827ca14740b489f3e06c1fe3', '2026-03-03 23:14:24', '2026-02-01 15:14:24'),
(226, 1, '678469b4f05a87fb4121919c025c76ba9702c9c830709cf2879355ddbab74d123a51e9408c99e94c026488adca3c304498f2cb30aedbe2eb9ae682b941a8d28d', '2026-03-03 23:14:49', '2026-02-01 15:14:49'),
(227, 1, 'd5e2d367212823383d319889237d279828523152e19975f35ea67483d96c078eb2cb40d1f483f6f2496cbe0508e51513f5e44225cb1b1f52499caa3427fb36a1', '2026-03-03 23:14:59', '2026-02-01 15:14:59'),
(228, 1, '76e59c4ba2831c7c4e72a90a205df5dd0e6d400c70dd6d1cc9ce61f5ac6b03ec0e5cf718a9cd50aef5eda565f627caba65ae0049366b4586b52dbc55beaf188b', '2026-03-03 23:21:48', '2026-02-01 15:21:48'),
(229, 1, '3f66c77d656c5832c7eae0415665e034d799dd0b494ab421428ddbc52ad5afe58032001a486fb82829360240f035f34bf94a3242b8fe3fb86186277945936bd2', '2026-03-03 23:27:49', '2026-02-01 15:27:48'),
(230, 1, '875eab91b9bce3341b1b0d351358f2ea60a3d977df0a1541201e021a92d42a37d5147991bd0a94a4b8de1ab172840c41319c1de6de7f9bfa78fd818429aa61cd', '2026-03-03 23:29:45', '2026-02-01 15:29:44'),
(231, 1, '7e5fd84855539626ed9032f9f587705c578bbf3d88e7a72d1a781028305c61c965649e55bc8f0ee6a7eb4ab4aec33eb33b5a5c736d7e95b201bb338a2dc75172', '2026-03-04 00:14:42', '2026-02-01 16:14:42'),
(232, 1, 'd0502d3a8de82e6a0c1020296b1d042e771ae13530683370ecfc0ad13e69dd3629808800de21f5eed38f1eea4c45e0218e79631e8452b7335c24d59da61a9845', '2026-03-04 00:20:58', '2026-02-01 16:20:57'),
(233, 1, 'd40c62baff1420ece0f1225a01b765e0be53b20a02d3e1cdf0c28f8f6522b97c0bc6cadf48b872211252148ecea77c7858043ee9e56ff4877816c219b030c8ec', '2026-03-04 00:20:58', '2026-02-01 16:20:57'),
(234, 1, 'c370695fd580d97378cbd4e4e74fe7cd220bc438a2feca92b5fde7d98380ee58cfe2938e186b0665a6c2b960331c7b3a32efd14ae113d5e9d7a06c701acfcf5f', '2026-03-04 00:21:06', '2026-02-01 16:21:06'),
(235, 1, 'a6b14ec5b7d40220b904c38c74bed274acba03ca6127a62d704d404a2d21b7c5034569375cf2b8aa59eb3e9eedf386e5f65097c896fa1b99561e54ffba64762e', '2026-03-04 00:55:13', '2026-02-01 16:55:13'),
(236, 1, 'ba0083107a3fd9f09313ef8b81b7188d012e9b44a040b4843020903e5169e2397307ba6c2e728eaac45faf994a4eeb1072953df2eee510821133e144976c4df7', '2026-03-04 01:01:28', '2026-02-01 17:01:27'),
(237, 1, 'b16829d5f770e2c1c0ce13395338370b3785f2ba34d5b3666c3fb751dcd678abac75e89f52c6ba3bc602c57e31c0def377a9cc412e5ace5bc0f1d7e02b1d67b8', '2026-03-04 01:07:14', '2026-02-01 17:07:14'),
(238, 1, '75ba0c40e8e4fff6bdc08a35de08f06e10aaf45ca0b87ee955f0a70122694b1092c44c3fd593aa7817e485800f6bf90a7da2eb4c26384d74319d746eb31d81f7', '2026-03-04 01:14:08', '2026-02-01 17:14:07'),
(239, 1, 'c74ee332c61338541f19f19be6cc26f3da012bd1a75a653dd19f1aa8a870866a6c4f9560d67ceb4fe93e642983daf0856c55d8c404a2a762bf301238f31ce2be', '2026-03-04 22:27:34', '2026-02-02 14:27:34'),
(240, 1, '6c0e808bb0b9e45d5f56d0be8196ce3638a67ee01c006183c2e9bcc71350d0a392d106f888378924998f1992e6a6c5f18d293c3843cda459c14ea5a73a5ce3e8', '2026-03-05 02:19:54', '2026-02-02 18:19:53'),
(241, 1, '1aa6f38281e0813377607a3aa14e991fa69d67aa2384117e78edc131487f7c591b9d360bb7488ce0e31536a31bf11ceb983a290feb874e3c7a7c264eb273e4e8', '2026-03-05 02:34:34', '2026-02-02 18:34:34'),
(242, 1, 'ae04e31f9f385234f3c009d78215c99c75659f9b05de89e8515a41d47479ccfaefaf89a97387bc312a72e17e32a2d3e3dbf83aefc9c9a4bb71197b20a4a9a247', '2026-03-05 02:38:47', '2026-02-02 18:38:47'),
(243, 1, 'd65990572d457bfc0ac1e5e30c594d7babfee0e453aacba278f204b0fc704629d2df5015e7f723e38f3a12abac932f2436e8dd6ae65a45b713d9bbabb3eb8b6a', '2026-03-05 02:43:33', '2026-02-02 18:43:32'),
(244, 1, '76b65c29e45ae6cfed1e2cd114f2c6a9b9f33e7ecee6d60c9cdf5db316863f4b9be6962ea2d2ed449b73eb75982e54b446ef43a1a9c54e1f5024fd5f0a25d3a2', '2026-03-05 02:46:20', '2026-02-02 18:46:19'),
(245, 1, '7b7c326a1744582b60643ed5dc67bfdffaee96559580dfafb222494bce3e151834146aa0195c2eb453cfdb064a25c0e0ac52c2485431fd7621281c694bf20bec', '2026-03-05 02:49:15', '2026-02-02 18:49:14'),
(246, 1, '7aefef9780754a8e15e1a31546a83f2e4735ac799cefbcb6ea563c8a41dbd37c6649ac57e4be479e344875e4306850dce5c8bb9459b016e339599396f7d2fc14', '2026-03-05 12:54:17', '2026-02-03 04:54:17'),
(247, 1, 'afc73e4a1f5d4721b4e08dc56bbef434e164be1028eaa83bd41096e1cb4df854885c6e23998ffc93855bb54f2f8b1fe72cd5dbb3715897e76d83ff9776f370a2', '2026-03-05 12:57:44', '2026-02-03 04:57:44'),
(248, 1, '857810ab9a4ec38793f672db186f246f10131fc7a2baeb332317509c54700dcc71335c67466b964984c67c66cae6e0116a68873e3a344628e98ad55deda839e9', '2026-03-05 13:07:16', '2026-02-03 05:07:16'),
(249, 1, '41713f92294b287e0d68bab9528ce4df741b10606a77f7e7115918eca43a9e98c6852e4af411c57304c9d0d278ca7103d9cf1f0b176af8a33a481bdc3fe999b5', '2026-03-05 14:37:06', '2026-02-03 06:37:05'),
(250, 1, '6ea54999c265a13a2ca23289c35f72c13d25060084351f7c2cad154c628d0b0d676efc93e68f74d58349c5cd171336dc3308291447d4e808863c31dd1137311e', '2026-03-06 09:46:20', '2026-02-04 01:46:20'),
(251, 4, '96f5c3d2367db2757cb4ecd14060f20cfe282eebdf3090076d0da15affcae086d1d22b06ac9a8d8a450b7582d6767c562a1d3985341a569310b8110a8f1c3ef8', '2026-03-06 11:16:43', '2026-02-04 03:16:43'),
(252, 1, 'f52a3528a6bb58ff3f51efd631bc1a806b47d01b6c3f97792b827d3d346bbb475ffd990accc6f42b21f3549096a52f316c29664e5cf005d0b5edd2b6a59b8c12', '2026-03-06 11:16:44', '2026-02-04 03:16:44'),
(253, 4, 'f2c32827c599bcbde4e323e9e8d50a5b6cf575698572ae27a6d5c4fb1b423dd567b411e2e67d9c62d3b26f2202bf6155a818ed7bd9b629230a0b648add1d1cac', '2026-03-06 11:57:08', '2026-02-04 03:57:07'),
(254, 4, '53a8cbc2566dd3921fb8867ecd5971e87d1e7cb6299fcf8b6c8013b1ddf85e8c694bf35dda19064d660c4582c2b9b6473f02f57df8ddd7c49ef845c5544bdd01', '2026-03-06 12:28:56', '2026-02-04 04:28:55'),
(255, 16, 'b870bb44f45512361e405eb2336f6792e10df7e08eeb087c7a575ceafdcd2ef57fec6f5dfd7e030ef9dda464ab75ba54d04ba546515292b13686089da5d4864e', '2026-03-06 16:31:40', '2026-02-04 08:31:40'),
(256, 17, '64dca8560c79dbbb487027934c095489e4637cee1c213da3d60094156669f6db491b681f32bbcd902a36f76fe94e691d3dec65b200a2f502279f6a02be0a7825', '2026-03-06 16:44:02', '2026-02-04 08:44:02'),
(257, 18, 'c2f18205524e66a5104dae06cf2443b6a9c74fd02c3432a5853d9d382d0d5e5ea000eefd290794cc0e5e5ff622ef928729ca89426fc201a08d28431d270e965d', '2026-03-06 17:16:42', '2026-02-04 09:16:41'),
(258, 17, '188595710c5c5fb47306fa0bf193486536983396ee6f23de3297115487e71f2430fd37d974d2a699e8dd6117b44454629c6fc5a3cfed3d3dc5e5c6a01b1e5e44', '2026-03-06 17:18:08', '2026-02-04 09:18:08'),
(259, 1, '83a50042d1579022cd08865cb983f911cccfa7a618228b36de07557e5672380be6ae2956728197dfa4a4af74322f2c0485badb0298a300ac1bcf34cc4fe6d177', '2026-03-06 17:43:17', '2026-02-04 09:43:17'),
(260, 19, '47b071f365f8d125e03b809313f32a48391d5b8a9b89d53ccf62e29316e8fea06e1b9595dbe62fc21a26790d7747a72550d010814bfb56b4c80b6a3b13be6780', '2026-03-06 21:28:41', '2026-02-04 13:28:41'),
(261, 1, '91f1fd5b24e47631abb17ab41f9ae4cd17e672e238bcee652fbef93375ba9ebaf6d074f1e170e1e823262ded37bd1ea1fe3975549f826a0fb827f7506278ea1d', '2026-03-07 10:44:39', '2026-02-05 02:44:38');

-- --------------------------------------------------------

--
-- 表的结构 `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `dish_id` int(11) NOT NULL COMMENT '评价的菜品',
  `user_id` int(11) NOT NULL COMMENT '评价用户',
  `rating` tinyint(4) NOT NULL COMMENT '星级(1-5)',
  `tags` json DEFAULT NULL COMMENT '口味标签',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '评价内容',
  `images` json DEFAULT NULL COMMENT '图片数组',
  `anonymous` tinyint(1) DEFAULT '0' COMMENT '是否匿名',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- --------------------------------------------------------

--
-- 表的结构 `role_template_permissions`
--

CREATE TABLE `role_template_permissions` (
  `id` int(11) NOT NULL,
  `role` enum('super_admin','school_admin','merchant_admin','stall_admin') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色',
  `permission` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '权限标识',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '权限说明',
  `is_default` tinyint(1) DEFAULT '1' COMMENT '是否默认启用',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色权限模板（产品配置）';

--
-- 转存表中的数据 `role_template_permissions`
--

INSERT INTO `role_template_permissions` (`id`, `role`, `permission`, `description`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 'super_admin', 'org.school.create', '创建学校', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(2, 'super_admin', 'org.school.update', '编辑学校', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(3, 'super_admin', 'org.school.disable', '停用学校', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(4, 'super_admin', 'org.merchant.create', '创建商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(5, 'super_admin', 'org.merchant.update', '编辑商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(6, 'super_admin', 'org.merchant.move', '调整商户层级', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(7, 'super_admin', 'org.merchant.disable', '停用商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(8, 'super_admin', 'org.stall.create', '创建档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(9, 'super_admin', 'org.stall.update', '编辑档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(10, 'super_admin', 'org.stall.move', '调整档口归属', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(11, 'super_admin', 'org.stall.disable', '停用档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(12, 'super_admin', 'admin.create', '新建管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(13, 'super_admin', 'admin.update', '编辑管理员资料', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(14, 'super_admin', 'admin.disable', '禁用管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(15, 'super_admin', 'admin.assign', '绑定管理员到节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(16, 'super_admin', 'admin.unassign', '解绑管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(17, 'super_admin', 'admin.grant', '授权/调整权限', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(18, 'super_admin', 'admin.role', '调整管理员层级', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(19, 'super_admin', 'admin.manage_peer', '管理同级管理员', 0, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(20, 'super_admin', 'admin.identity.approve', '审核身份标签后缀', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(21, 'super_admin', 'admin.audit', '查看管理员操作日志', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(22, 'super_admin', 'content.announce.create', '创建公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(23, 'super_admin', 'content.announce.update', '编辑公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(24, 'super_admin', 'content.announce.publish', '发布公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(25, 'super_admin', 'review.audit', '审核评论', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(26, 'super_admin', 'review.delete', '删除内容', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(27, 'super_admin', 'data.dashboard.view', '查看看板', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(28, 'super_admin', 'data.report.view', '查看报表', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(29, 'school_admin', 'org.merchant.create', '创建商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(30, 'school_admin', 'org.merchant.update', '编辑商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(31, 'school_admin', 'org.merchant.move', '调整商户层级', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(32, 'school_admin', 'org.merchant.disable', '停用商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(33, 'school_admin', 'org.stall.create', '创建档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(34, 'school_admin', 'org.stall.update', '编辑档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(35, 'school_admin', 'org.stall.move', '调整档口归属', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(36, 'school_admin', 'org.stall.disable', '停用档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(37, 'school_admin', 'org.school.update', '编辑学校', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(38, 'school_admin', 'admin.create', '新建管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(39, 'school_admin', 'admin.update', '编辑管理员资料', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(40, 'school_admin', 'admin.disable', '禁用管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(41, 'school_admin', 'admin.assign', '绑定管理员到节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(42, 'school_admin', 'admin.unassign', '解绑管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(43, 'school_admin', 'admin.grant', '授权/调整权限', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(44, 'school_admin', 'admin.manage_peer', '管理同级管理员', 0, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(45, 'school_admin', 'admin.identity.approve', '审核身份标签后缀', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(46, 'school_admin', 'admin.audit', '查看管理员操作日志', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(47, 'school_admin', 'content.announce.create', '创建公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(48, 'school_admin', 'content.announce.update', '编辑公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(49, 'school_admin', 'content.announce.publish', '发布公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(50, 'school_admin', 'review.audit', '审核评论', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(51, 'school_admin', 'review.delete', '删除内容', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(52, 'school_admin', 'data.dashboard.view', '查看看板', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(53, 'school_admin', 'data.report.view', '查看报表', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(54, 'merchant_admin', 'org.merchant.create', '创建商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(55, 'merchant_admin', 'org.merchant.update', '编辑商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(56, 'merchant_admin', 'org.merchant.move', '调整商户层级', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(57, 'merchant_admin', 'org.merchant.disable', '停用商户节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(58, 'merchant_admin', 'org.stall.create', '创建档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(59, 'merchant_admin', 'org.stall.update', '编辑档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(60, 'merchant_admin', 'org.stall.move', '调整档口归属', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(61, 'merchant_admin', 'org.stall.disable', '停用档口', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(62, 'merchant_admin', 'admin.create', '新建管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(63, 'merchant_admin', 'admin.update', '编辑管理员资料', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(64, 'merchant_admin', 'admin.disable', '禁用管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(65, 'merchant_admin', 'admin.assign', '绑定管理员到节点', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(66, 'merchant_admin', 'admin.unassign', '解绑管理员', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(67, 'merchant_admin', 'admin.grant', '授权/调整权限', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(68, 'merchant_admin', 'admin.manage_peer', '管理同级管理员', 0, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(69, 'merchant_admin', 'admin.identity.approve', '审核身份标签后缀', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(70, 'merchant_admin', 'admin.audit', '查看管理员操作日志', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(71, 'merchant_admin', 'content.announce.create', '创建公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(72, 'merchant_admin', 'content.announce.update', '编辑公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(73, 'merchant_admin', 'content.announce.publish', '发布公告', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(74, 'merchant_admin', 'review.audit', '审核评论', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(75, 'merchant_admin', 'review.delete', '删除内容', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(76, 'merchant_admin', 'dish.create', '新建菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(77, 'merchant_admin', 'dish.update', '编辑菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(78, 'merchant_admin', 'dish.delete', '删除菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(79, 'merchant_admin', 'stock.update', '调整库存', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(80, 'merchant_admin', 'price.update', '修改价格', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(81, 'merchant_admin', 'data.dashboard.view', '查看看板', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(82, 'merchant_admin', 'data.report.view', '查看报表', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(83, 'stall_admin', 'dish.create', '新建菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(84, 'stall_admin', 'dish.update', '编辑菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(85, 'stall_admin', 'dish.delete', '删除菜品', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(86, 'stall_admin', 'stock.update', '调整库存', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(87, 'stall_admin', 'price.update', '修改价格', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(88, 'stall_admin', 'review.audit', '审核评论', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(89, 'stall_admin', 'review.delete', '删除内容', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(90, 'stall_admin', 'data.dashboard.view', '查看看板', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(91, 'stall_admin', 'data.report.view', '查看报表', 1, '2026-02-01 16:16:44', '2026-02-01 16:16:44'),
(92, 'super_admin', 'content.ai.generate', 'AI生成内容', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(93, 'super_admin', 'content.topic.manage', '管理话题/标签', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(94, 'super_admin', 'review.reject', '拒绝内容', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(95, 'super_admin', 'review.sensitive.manage', '管理敏感词库', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(96, 'super_admin', 'review.blacklist', '拉黑用户', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(97, 'super_admin', 'data.export', '导出数据', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(98, 'super_admin', 'dish.create', '新建菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(99, 'super_admin', 'dish.update', '编辑菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(100, 'super_admin', 'dish.delete', '删除菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(101, 'super_admin', 'stock.mode', '切换库存模式', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(102, 'super_admin', 'stock.update', '调整库存', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(103, 'super_admin', 'price.update', '修改价格', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(132, 'school_admin', 'review.reject', '拒绝内容', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(133, 'school_admin', 'review.sensitive.manage', '管理敏感词库', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(134, 'school_admin', 'review.blacklist', '拉黑用户', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(135, 'school_admin', 'data.export', '导出数据', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(136, 'school_admin', 'dish.create', '新建菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(137, 'school_admin', 'dish.update', '编辑菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(138, 'school_admin', 'dish.delete', '删除菜品', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(139, 'school_admin', 'stock.mode', '切换库存模式', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(140, 'school_admin', 'stock.update', '调整库存', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(141, 'school_admin', 'price.update', '修改价格', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(163, 'merchant_admin', 'review.reject', '拒绝内容', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(164, 'merchant_admin', 'data.export', '导出数据', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(165, 'merchant_admin', 'stock.mode', '切换库存模式', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(191, 'stall_admin', 'stock.mode', '切换库存模式', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12'),
(192, 'stall_admin', 'review.reject', '拒绝内容', 1, '2026-02-02 21:08:12', '2026-02-02 21:08:12');

-- --------------------------------------------------------

--
-- 表的结构 `schools`
--

CREATE TABLE `schools` (
  `id` int(11) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '学校名称',
  `province` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '省份',
  `city` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '城市',
  `contact_phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系电话',
  `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学校地址',
  `code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学校编码',
  `status` enum('active','disabled','pending') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '状态',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `contact_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '联系人',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT '学校描述'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学校表';

--
-- 转存表中的数据 `schools`
--

INSERT INTO `schools` (`id`, `name`, `province`, `city`, `contact_phone`, `address`, `code`, `status`, `created_at`, `updated_at`, `contact_name`, `description`) VALUES
(1, '东莞理工学院', 'guangdong', '东莞市', '0769-22861919', '东莞市莞城街道学院路251号', '11819', 'active', '2026-02-01 17:56:04', '2026-02-05 08:06:00', NULL, NULL),
(2, '华南理工大学', 'guangdong', '广州市', '020-87110737', '广州市天河区五山街道五山路381号', '10561', 'active', '2026-02-01 17:56:04', '2026-02-05 08:05:47', NULL, NULL),
(3, '华南师范大学', 'guangdong', '广州市', '020-85211098', '广州市天河区石牌街道中山大道西55号', '10574', 'active', '2026-02-03 15:47:06', '2026-02-05 08:07:17', NULL, NULL),
(4, '广东工业大学', 'guangdong', '广州市', '020-39322681', '广州市番禺区小谷围街道小谷围街广州大学城外环西路100号', '11845', 'active', '2026-02-03 15:47:06', '2026-02-05 08:06:36', NULL, NULL),
(5, '中山大学', 'guangdong', '广州市', '020-84110558', '广州市海珠区滨江东路中山大学北门科技文化交流中心', '10558', 'pending', '2026-02-04 10:10:50', '2026-02-05 08:07:53', NULL, NULL),
(7, '五邑大学', 'guangdong', '江门市', '0750-3296263', '江门市蓬江区白沙街道东成村22号', NULL, 'disabled', '2026-02-05 00:08:17', '2026-02-05 08:51:53', NULL, NULL);

-- --------------------------------------------------------

--
-- 表的结构 `stalls`
--

CREATE TABLE `stalls` (
  `id` int(11) NOT NULL,
  `merchant_id` int(11) NOT NULL COMMENT '所属商户',
  `merchant_node_id` int(11) DEFAULT NULL COMMENT '所属商户树节点ID',
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '档口名称',
  `open_status` enum('open','closed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'open' COMMENT '营业状态',
  `location` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '位置描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='档口表';

--
-- 转存表中的数据 `stalls`
--

INSERT INTO `stalls` (`id`, `merchant_id`, `merchant_node_id`, `name`, `open_status`, `location`, `created_at`, `updated_at`) VALUES
(1, 1, 1, '一号档口', 'open', '一楼A区', '2026-01-11 08:05:28', '2026-02-02 20:01:14'),
(2, 1, 1, '二号档口', 'open', '一楼B区', '2026-01-11 08:05:28', '2026-02-02 20:01:14'),
(3, 2, 2, '一号档口', 'pending', '', '2026-02-05 02:28:04', '2026-02-05 02:28:04');

-- --------------------------------------------------------

--
-- 表的结构 `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '真实姓名',
  `student_id` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学号',
  `college` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '学院',
  `school` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '学校名称（如：XX大学）',
  `major` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '专业',
  `grade` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '年级',
  `class_name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '班级',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '头像URL',
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '加密后的密码',
  `role` enum('user') COLLATE utf8mb4_unicode_ci DEFAULT 'user' COMMENT '用户角色',
  `status` enum('active','inactive','banned') COLLATE utf8mb4_unicode_ci DEFAULT 'active' COMMENT '账户状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

--
-- 转存表中的数据 `users`
--

INSERT INTO `users` (`id`, `username`, `real_name`, `student_id`, `college`, `school`, `major`, `grade`, `class_name`, `phone`, `avatar`, `password_hash`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, '喵星球的诺诺', '刘星宇', '2024411100116', '计算机科学与技术学院', '东莞理工学院', '计算机科学与技术', '大一', NULL, '13533954373', NULL, '$2a$10$c3bVUvWdJ2V/wO3LJCpzbueNv9XD4Nx76N1ZYPPNsyzybyhOrPtya', 'user', 'active', '2026-01-21 15:53:23', '2026-02-04 00:20:26'),
(4, 'bql', '盛泽斌', '2025404030129', '计算机科学与技术学院', '东莞理工学院', '计算机类', '大一', NULL, '13670337526', NULL, '$2a$10$4AVZbpQgRqIwtRR3owdSYepXxnY.lphFOooZzu2g51fAoHPlMnRES', 'user', 'active', '2026-01-17 12:59:50', '2026-02-04 00:20:26'),
(5, 'testuser123', NULL, NULL, NULL, '东莞理工学院', NULL, NULL, NULL, NULL, NULL, '$2a$10$JN7bm8sx97F3T5U3hv1yzuwy1idDo3iyoXUbvd3ai40h2KTZRYSR6', 'user', 'active', '2026-01-21 14:26:37', '2026-02-04 00:20:26'),
(7, '1', '好', '11111111111', '卓越工程师学院', '东莞理工学院', '个', '大四', NULL, '13133425876', NULL, '$2a$10$eETF2Lw2V5fAT5ak5522ieLO7QjBk2tHctAluIjQiQI4ef4aTFHRu', 'user', 'active', '2026-01-22 08:36:46', '2026-02-04 00:20:26'),
(8, 'admin', '网警测试', '1', '计算机科学与技术学院', '广东警官学院', NULL, '大一', NULL, '18122273907', NULL, '$2a$10$SAwrFeJM7ekohRoxfeyYiujcd9UU5LSjlweebfJ/rw1I5Ay4eVdYu', 'user', 'active', '2026-01-26 07:28:34', '2026-02-04 00:22:13'),
(9, '111', '11', '11111', '计算机科学与技术学院', '华南师范大学', 'qq', '大一', NULL, '11111111111', NULL, '$2a$10$/.vnS0mGE5CaeWhASTpchuBYsLep3klLk8XR0xqsekb9trAUvkbJC', 'user', 'active', '2026-01-26 13:26:24', '2026-02-04 00:22:00'),
(14, '111111', '111', '111111', '教育学院', '广东工业大学', '11', '博三', NULL, '11111111111', NULL, '$2a$10$ZHKSYImAJYB5N2IkNubK7.jJ0cYL.fXyqq7zz59C/36jj2mAHLcwe', 'user', 'banned', '2026-02-03 05:31:58', '2026-02-05 01:52:34'),
(15, '1111111', '11', '111111111', '计算机科学与技术学院', '华南理工大学', '1', '博三', NULL, '11111111111', NULL, '$2a$10$Sr9nO/eVcib2mlD7mqvoo.0JhuQ4xAnqcjbvmT6z615.wXw/gDXkq', 'user', 'active', '2026-02-03 05:33:15', '2026-02-04 00:21:05'),
(16, '冰淇淋1', '盛泽斌', '123456', '计算机科学与技术学院', '东莞理工学院', '计算机类', '大一', NULL, '13670337526', NULL, '$2a$10$iK5pPDu19MFPbmEpeY0/O.cXlJrUxuW9hn.BIzBcYZTL..G4MQZiq', 'user', 'active', '2026-02-04 08:31:06', '2026-02-04 08:31:06'),
(17, '冰淇淋2', '盛泽斌', '1234567', '计算机科学与技术学院', '东莞理工学院', '计算机类', '大一', NULL, '13670337526', NULL, '$2a$10$Xmsry10.o0VfK4uI5KNY9.dwpc79utXPHYulx8noJVSHLVGFzGIyW', 'user', 'active', '2026-02-04 08:43:44', '2026-02-04 08:43:44'),
(18, '冰淇淋3', '盛泽斌', '123456789', '计算机科学与技术学院', '东莞理工学院', '计算机类', '大一', NULL, '13670337526', NULL, '$2a$10$2IDtOTZ2nZ9a/uFjXgr7cOJs40N/nOAQdcSCKD6HVNgDu0y.h3Zr6', 'user', 'active', '2026-02-04 09:16:30', '2026-02-04 09:16:30'),
(19, 'www', '李明洋', '2025404030121', '计算机科学与技术学院', '东莞理工学院', '计算机类', '大一', NULL, '18219028040', NULL, '$2a$10$C2z98Pa3Pt0L0NKNc3Kgo.xN7BwevbNDhsLmi4R6dIbuWoPUrEt/C', 'user', 'active', '2026-02-04 13:28:16', '2026-02-04 13:28:16');

-- --------------------------------------------------------

--
-- 表的结构 `wish_merchants`
--

CREATE TABLE `wish_merchants` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `merchant_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='想去商户';

--
-- 转储表的索引
--

--
-- 表的索引 `admin_audit_log`
--
ALTER TABLE `admin_audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_operator` (`operator_id`,`created_at`),
  ADD KEY `idx_target` (`target_type`,`target_id`),
  ADD KEY `idx_action` (`action`,`created_at`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- 表的索引 `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_position_permission` (`position_id`,`permission`),
  ADD KEY `idx_position` (`position_id`),
  ADD KEY `idx_permission` (`permission`);

--
-- 表的索引 `admin_positions`
--
ALTER TABLE `admin_positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_admin_active` (`admin_id`,`unassigned_at`),
  ADD KEY `idx_school` (`school_id`),
  ADD KEY `idx_merchant` (`merchant_node_id`),
  ADD KEY `idx_stall` (`stall_id`),
  ADD KEY `idx_role` (`role`);

--
-- 表的索引 `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_identity_label` (`identity_label`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- 表的索引 `checkins`
--
ALTER TABLE `checkins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_checkin` (`user_id`,`merchant_id`),
  ADD KEY `fk_checkin_merchant` (`merchant_id`);

--
-- 表的索引 `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_post` (`post_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- 表的索引 `content_audit`
--
ALTER TABLE `content_audit`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `dishes`
--
ALTER TABLE `dishes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_stall` (`stall_id`);

--
-- 表的索引 `global_id_sequence`
--
ALTER TABLE `global_id_sequence`
  ADD PRIMARY KEY (`id`);

--
-- 表的索引 `id_sequence`
--
ALTER TABLE `id_sequence`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_table_name` (`table_name`);

--
-- 表的索引 `merchants`
--
ALTER TABLE `merchants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_school` (`school_id`),
  ADD KEY `idx_parent` (`parent_id`);

--
-- 表的索引 `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`);

--
-- 表的索引 `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_dish` (`dish_id`);

--
-- 表的索引 `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_created` (`created_at`);

--
-- 表的索引 `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_post_user` (`post_id`,`user_id`),
  ADD KEY `fk_likes_user` (`user_id`);

--
-- 表的索引 `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_user` (`user_id`);

--
-- 表的索引 `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dish` (`dish_id`),
  ADD KEY `idx_user` (`user_id`);

--
-- 表的索引 `role_template_permissions`
--
ALTER TABLE `role_template_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_role_perm` (`role`,`permission`),
  ADD KEY `idx_role` (`role`);

--
-- 表的索引 `schools`
--
ALTER TABLE `schools`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_school_name` (`name`);

--
-- 表的索引 `stalls`
--
ALTER TABLE `stalls`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_merchant` (`merchant_id`),
  ADD KEY `idx_merchant_node` (`merchant_node_id`);

--
-- 表的索引 `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_college` (`college`),
  ADD KEY `idx_student_id` (`student_id`);

--
-- 表的索引 `wish_merchants`
--
ALTER TABLE `wish_merchants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_wish` (`user_id`,`merchant_id`),
  ADD KEY `fk_wish_merchant` (`merchant_id`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `admin_audit_log`
--
ALTER TABLE `admin_audit_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- 使用表AUTO_INCREMENT `admin_permissions`
--
ALTER TABLE `admin_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=137;

--
-- 使用表AUTO_INCREMENT `admin_positions`
--
ALTER TABLE `admin_positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- 使用表AUTO_INCREMENT `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- 使用表AUTO_INCREMENT `checkins`
--
ALTER TABLE `checkins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `comments`
--
ALTER TABLE `comments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `content_audit`
--
ALTER TABLE `content_audit`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `dishes`
--
ALTER TABLE `dishes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用表AUTO_INCREMENT `global_id_sequence`
--
ALTER TABLE `global_id_sequence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `id_sequence`
--
ALTER TABLE `id_sequence`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用表AUTO_INCREMENT `merchants`
--
ALTER TABLE `merchants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用表AUTO_INCREMENT `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `posts`
--
ALTER TABLE `posts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=262;

--
-- 使用表AUTO_INCREMENT `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `role_template_permissions`
--
ALTER TABLE `role_template_permissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=193;

--
-- 使用表AUTO_INCREMENT `schools`
--
ALTER TABLE `schools`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用表AUTO_INCREMENT `stalls`
--
ALTER TABLE `stalls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- 使用表AUTO_INCREMENT `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- 使用表AUTO_INCREMENT `wish_merchants`
--
ALTER TABLE `wish_merchants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- 限制导出的表
--

--
-- 限制表 `admin_permissions`
--
ALTER TABLE `admin_permissions`
  ADD CONSTRAINT `fk_position` FOREIGN KEY (`position_id`) REFERENCES `admin_positions` (`id`) ON DELETE CASCADE;

--
-- 限制表 `admin_positions`
--
ALTER TABLE `admin_positions`
  ADD CONSTRAINT `fk_admin` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `checkins`
--
ALTER TABLE `checkins`
  ADD CONSTRAINT `fk_checkin_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_checkin_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `fk_comments_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `dishes`
--
ALTER TABLE `dishes`
  ADD CONSTRAINT `fk_dish_stall` FOREIGN KEY (`stall_id`) REFERENCES `stalls` (`id`) ON DELETE CASCADE;

--
-- 限制表 `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- 限制表 `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `fk_posts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `fk_likes_post` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_refresh_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_review_dish` FOREIGN KEY (`dish_id`) REFERENCES `dishes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_review_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- 限制表 `stalls`
--
ALTER TABLE `stalls`
  ADD CONSTRAINT `fk_stall_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE;

--
-- 限制表 `wish_merchants`
--
ALTER TABLE `wish_merchants`
  ADD CONSTRAINT `fk_wish_merchant` FOREIGN KEY (`merchant_id`) REFERENCES `merchants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wish_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
