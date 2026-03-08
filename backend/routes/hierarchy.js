/**
 * 平台层级结构 API
 * 提供组织结构树、学校、商户、档口等数据
 */

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { adminAuthMiddleware } = require('../middleware/adminAuth');

// 应用管理员权限中间件
router.use(adminAuthMiddleware);

/**
 * 获取完整的组织结构树
 * GET /api/hierarchy/tree
 * 返回：学校 > 商户 > 档口的树形结构
 */
router.get('/tree', async (req, res) => {
    try {
        const { adminContext } = req;
        const { role, schoolId } = adminContext;

        // 查询学校
        let schoolQuery = 'SELECT id, name, code, status FROM schools';
        const schoolParams = [];

        if (role !== 'super_admin' && schoolId) {
            schoolQuery += ' AND id = ?';
            schoolParams.push(schoolId);
        }

        const [schools] = await pool.execute(schoolQuery, schoolParams);

        const tree = {
            id: 'root',
            name: '校园食光平台',
            type: 'platform',
            icon: 'fa-globe-asia',
            children: [],
            stats: {
                schools: schools.length,
                merchants: 0,
                stalls: 0
            }
        };

        for (const school of schools) {
            const [nodes] = await pool.execute(
                'SELECT id, parent_id, name, node_type FROM merchants WHERE school_id = ?',
                [school.id]
            );

            const nodeIds = nodes.map(node => node.id);

            let stalls = [];
            if (nodeIds.length > 0) {
                const placeholders = nodeIds.map(() => '?').join(',');
                const [stallRows] = await pool.execute(
                    `SELECT id,
                            COALESCE(merchant_node_id, merchant_id) AS node_id,
                            name,
                            open_status,
                            location
                     FROM stalls
                     WHERE merchant_id IN (${placeholders})
                        OR merchant_node_id IN (${placeholders})`,
                    [...nodeIds, ...nodeIds]
                );
                stalls = stallRows;
            }

            const stallsByNode = new Map();
            stalls.forEach(stall => {
                if (!stallsByNode.has(stall.node_id)) {
                    stallsByNode.set(stall.node_id, []);
                }
                stallsByNode.get(stall.node_id).push(stall);
            });

            const nodesByParent = new Map();
            nodes.forEach(node => {
                const parentKey = node.parent_id || 0;
                if (!nodesByParent.has(parentKey)) {
                    nodesByParent.set(parentKey, []);
                }
                nodesByParent.get(parentKey).push(node);
            });

            const buildNode = (node) => {
                const childrenNodes = nodesByParent.get(node.id) || [];
                const childTrees = childrenNodes.map(child => buildNode(child));
                const nodeStalls = stallsByNode.get(node.id) || [];

                const stallChildren = nodeStalls.map(stall => ({
                    id: stall.id,
                    name: stall.name,
                    type: 'stall',
                    icon: 'fa-utensils',
                    status: stall.open_status,
                    stats: {
                        open_status: stall.open_status
                    }
                }));

                const allChildren = [...childTrees, ...stallChildren];

                return {
                    id: node.id,
                    name: node.name,
                    type: 'merchant',
                    icon: 'fa-store',
                    children: allChildren,
                    stats: {
                        stalls: nodeStalls.length
                    }
                };
            };

            const rootNodes = nodesByParent.get(0) || [];
            const merchantTrees = rootNodes.map(node => buildNode(node));

            const schoolNode = {
                id: school.id,
                name: school.name,
                status: school.status,
                type: 'school',
                icon: 'fa-university',
                children: merchantTrees,
                stats: {
                    merchants: nodes.length,
                    stalls: stalls.length
                }
            };

            tree.children.push(schoolNode);
            tree.stats.merchants += nodes.length;
            tree.stats.stalls += stalls.length;
        }

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        console.error('获取组织结构树失败:', error);
        res.status(500).json({
            success: false,
            error: '获取组织结构树失败'
        });
    }
});

/**
 * 获取学校列表
 * GET /api/hierarchy/schools
 */
router.get('/schools', async (req, res) => {
    try {
        const { adminContext } = req;
        const { role, schoolId } = adminContext;

        let query = 'SELECT id, name, code, status, created_at FROM schools';
        const params = [];

        if (role !== 'super_admin' && schoolId) {
            query += ' AND id = ?';
            params.push(schoolId);
        }

        const [schools] = await pool.execute(query, params);

        res.json({
            success: true,
            data: schools
        });
    } catch (error) {
        console.error('获取学校列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取学校列表失败'
        });
    }
});

/**
 * 获取指定学校的商户列表
 * GET /api/hierarchy/schools/:schoolId/merchants
 */
router.get('/schools/:schoolId/merchants', async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { adminContext } = req;

        // 权限检查
        if (adminContext.role !== 'super_admin' && adminContext.schoolId !== parseInt(schoolId)) {
            return res.status(403).json({
                success: false,
                error: '无权访问其他学校的数据'
            });
        }

        const [merchants] = await pool.execute(
            'SELECT id, parent_id, name, node_type FROM merchants WHERE school_id = ?',
            [schoolId]
        );

        res.json({
            success: true,
            data: merchants
        });
    } catch (error) {
        console.error('获取商户列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取商户列表失败'
        });
    }
});

/**
 * 获取指定商户的档口列表
 * GET /api/hierarchy/merchants/:merchantId/stalls
 */
router.get('/merchants/:merchantId/stalls', async (req, res) => {
    try {
        const { merchantId } = req.params;

        const [stalls] = await pool.execute(
            'SELECT id, name, open_status, location FROM stalls WHERE merchant_node_id = ? OR merchant_id = ?',
            [merchantId, merchantId]
        );

        res.json({
            success: true,
            data: stalls
        });
    } catch (error) {
        console.error('获取档口列表失败:', error);
        res.status(500).json({
            success: false,
            error: '获取档口列表失败'
        });
    }
});

/**
 * 保存平台层级结构变更
 * POST /api/hierarchy/save
 * body: { updates: [{id,type,name}], creates: [{tempId,type,name,parentId,parentTempId,parentType}] }
 */
router.post('/save', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { adminContext } = req;
        if (!adminContext || adminContext.role !== 'super_admin') {
            return res.status(403).json({ success: false, error: '权限不足' });
        }

        const { updates = [], creates = [], deletes = [] } = req.body || {};

        await connection.beginTransaction();

        // 处理删除
        for (const item of deletes) {
            if (!item || !item.id || !item.type) continue;

            if (item.type === 'school') {
                // 删除学校前，检查是否有商户依赖
                const [merchants] = await connection.execute('SELECT COUNT(*) as count FROM merchants WHERE school_id = ?', [item.id]);
                if (merchants[0].count > 0) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, error: `学校 ${item.id} 存在商户依赖，无法删除` });
                }
                await connection.execute('DELETE FROM schools WHERE id = ?', [item.id]);
            } else if (item.type === 'merchant') {
                // 删除商户前，检查是否有档口依赖
                const [stalls] = await connection.execute('SELECT COUNT(*) as count FROM stalls WHERE merchant_id = ? OR merchant_node_id = ?', [item.id, item.id]);
                if (stalls[0].count > 0) {
                    await connection.rollback();
                    return res.status(400).json({ success: false, error: `商户 ${item.id} 存在档口依赖，无法删除` });
                }
                await connection.execute('DELETE FROM merchants WHERE id = ?', [item.id]);
            } else if (item.type === 'stall') {
                await connection.execute('DELETE FROM stalls WHERE id = ?', [item.id]);
            }
        }

        // 处理更新
        for (const item of updates) {
            if (!item || !item.id || !item.type) continue;
            const name = String(item.name || '').trim();
            if (!name) continue;

            if (item.type === 'school') {
                await connection.execute('UPDATE schools SET name = ?, updated_at = NOW() WHERE id = ?', [name, item.id]);
            } else if (item.type === 'merchant') {
                await connection.execute('UPDATE merchants SET name = ?, updated_at = NOW() WHERE id = ?', [name, item.id]);
            } else if (item.type === 'stall') {
                await connection.execute('UPDATE stalls SET name = ?, updated_at = NOW() WHERE id = ?', [name, item.id]);
            }
        }

        // 处理新增（支持临时父节点映射）
        const tempIdMap = new Map();
        const pending = [...creates];

        const resolveParentId = (item) => {
            if (item.parentId) return item.parentId;
            if (item.parentTempId && tempIdMap.has(item.parentTempId)) return tempIdMap.get(item.parentTempId);
            return null;
        };

        let guard = 0;
        while (pending.length > 0 && guard < 1000) {
            guard += 1;
            let progress = false;

            for (let i = pending.length - 1; i >= 0; i--) {
                const item = pending[i];
                const name = String(item.name || '').trim();
                if (!name) {
                    pending.splice(i, 1);
                    continue;
                }

                if (item.type === 'school') {
                    const [result] = await connection.execute(
                        'INSERT INTO schools (name, province, city, contact_phone, address, status) VALUES (?, ?, ?, ?, ?, ?)',
                        [name, '', '', '', '', 'pending']
                    );
                    tempIdMap.set(item.tempId, result.insertId);
                    pending.splice(i, 1);
                    progress = true;
                } else if (item.type === 'merchant') {
                    const parentId = resolveParentId(item);
                    if (!parentId) continue;
                    let schoolId = null;
                    if (item.parentType === 'school') {
                        schoolId = parentId;
                    } else if (item.parentType === 'merchant') {
                        const [parentRows] = await connection.execute(
                            'SELECT school_id FROM merchants WHERE id = ? LIMIT 1',
                            [parentId]
                        );
                        if (!parentRows.length || !parentRows[0].school_id) {
                            await connection.rollback();
                            return res.status(400).json({ success: false, error: '父级商户缺少学校信息，无法创建子商户' });
                        }
                        schoolId = parentRows[0].school_id;
                    }
                    const [result] = await connection.execute(
                        'INSERT INTO merchants (school_id, parent_id, node_type, name) VALUES (?, ?, ?, ?)',
                        [schoolId, item.parentType === 'merchant' ? parentId : null, 'merchant', name]
                    );
                    tempIdMap.set(item.tempId, result.insertId);
                    pending.splice(i, 1);
                    progress = true;
                } else if (item.type === 'stall') {
                    const parentId = resolveParentId(item);
                    if (!parentId) continue;
                    await connection.execute(
                        'INSERT INTO stalls (merchant_id, merchant_node_id, name, open_status, location) VALUES (?, ?, ?, ?, ?)',
                        [parentId, parentId, name, 'pending', '']
                    );
                    tempIdMap.set(item.tempId, parentId);
                    pending.splice(i, 1);
                    progress = true;
                } else {
                    pending.splice(i, 1);
                }
            }

            if (!progress) break;
        }

        if (pending.length > 0) {
            await connection.rollback();
            return res.status(400).json({ success: false, error: '部分节点缺少父级，保存失败' });
        }

        await connection.commit();
        return res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('保存层级结构失败:', error);
        return res.status(500).json({ success: false, error: '保存失败' });
    } finally {
        connection.release();
    }
});

module.exports = router;
