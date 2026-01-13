-- 添加用户详细信息字段
USE campus_food;

ALTER TABLE users 
ADD COLUMN real_name VARCHAR(50) NULL COMMENT '真实姓名' AFTER username,
ADD COLUMN student_id VARCHAR(20) NULL COMMENT '学号' AFTER real_name,
ADD COLUMN college VARCHAR(100) NULL COMMENT '学院' AFTER student_id,
ADD COLUMN major VARCHAR(100) NULL COMMENT '专业' AFTER college,
ADD COLUMN grade VARCHAR(20) NULL COMMENT '年级(如:大一、大二、大三、大四、研一等)' AFTER major,
ADD COLUMN class_name VARCHAR(50) NULL COMMENT '班级' AFTER grade,
ADD COLUMN phone VARCHAR(20) NULL COMMENT '手机号' AFTER class_name,
ADD COLUMN avatar VARCHAR(255) NULL COMMENT '头像URL' AFTER phone,
ADD INDEX idx_college (college),
ADD INDEX idx_student_id (student_id);

-- 查看表结构
DESCRIBE users;
