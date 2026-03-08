const pool = require('../config/database');

/**
 * 全局ID生成器
 * 从global_id_sequence表获取下一个可用的ID
 * 用于users和admin_users表，确保ID全局唯一
 */
async function getNextId() {
    const connection = await pool.getConnection();
    try {
        // 插入一条记录到序列表，获取自增ID
        await connection.execute('INSERT INTO global_id_sequence () VALUES ()');
        
        // 获取刚才插入的ID
        const [result] = await connection.execute('SELECT LAST_INSERT_ID() as id');
        const nextId = result[0].id;
        
        // 删除刚才插入的记录（保持表干净）
        await connection.execute('DELETE FROM global_id_sequence WHERE id = ?', [nextId]);
        
        return nextId;
    } finally {
        connection.release();
    }
}

/**
 * 使用示例：在注册用户时
 */
async function registerUserExample(username, passwordHash, role) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 获取下一个可用ID
        const userId = await getNextId();
        
        // 使用获取的ID插入用户
        await connection.execute(
            'INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)',
            [userId, username, passwordHash, role]
        );
        
        await connection.commit();
        return userId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * 使用示例：在创建管理员时
 */
async function createAdminExample(username, passwordHash, realName) {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        // 获取下一个可用ID
        const adminId = await getNextId();
        
        // 使用获取的ID插入管理员
        await connection.execute(
            'INSERT INTO admin_users (id, username, password_hash, real_name, identity_label) VALUES (?, ?, ?, ?, ?)',
            [adminId, username, passwordHash, realName, '工作人员']
        );
        
        await connection.commit();
        return adminId;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

module.exports = {
    getNextId,
    registerUserExample,
    createAdminExample
};
