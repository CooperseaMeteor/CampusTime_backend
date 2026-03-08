/**
 * 校园食光管理员规则管理系统
 * 提供规则配置、验证、模板管理等功能
 */

const AdminRules = (function() {
    // 私有变量
    let rules = [];
    let ruleTemplates = [];
    let currentRule = null;
    
    // 规则类型定义
    const RULE_TYPES = {
        SCHOOL: 'school',
        MERCHANT: 'merchant',
        STALL: 'stall',
        USER: 'user',
        CONTENT: 'content',
        SYSTEM: 'system'
    };
    
    // 规则状态
    const RULE_STATUS = {
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        DRAFT: 'draft',
        PENDING: 'pending'
    };
    
    /**
     * 初始化规则管理系统
     */
    function init() {
        console.log('管理员规则管理系统初始化');
        loadDefaultTemplates();
        loadRules();
        return this;
    }
    
    /**
     * 加载默认规则模板
     */
    function loadDefaultTemplates() {
        ruleTemplates = [
            {
                id: 'template_school_basic',
                name: '学校基本规则模板',
                type: RULE_TYPES.SCHOOL,
                description: '适用于学校的基本管理规则模板',
                rules: [
                    { key: 'max_students', value: 10000, description: '最大学生数' },
                    { key: 'max_merchants', value: 50, description: '最大商户数' },
                    { key: 'allow_audit', value: true, description: '允许内容审核' },
                    { key: 'allow_promotion', value: true, description: '允许推广活动' }
                ]
            },
            {
                id: 'template_merchant_operating',
                name: '商户运营规则模板',
                type: RULE_TYPES.MERCHANT,
                description: '商户日常运营管理规则模板',
                rules: [
                    { key: 'max_stalls', value: 10, description: '最大档口数' },
                    { key: 'max_employees', value: 20, description: '最大员工数' },
                    { key: 'require_audit', value: true, description: '需要内容审核' },
                    { key: 'allow_discount', value: true, description: '允许设置折扣' },
                    { key: 'max_discount_rate', value: 30, description: '最大折扣率(%)' }
                ]
            },
            {
                id: 'template_stall_inventory',
                name: '档口库存规则模板',
                type: RULE_TYPES.STALL,
                description: '档口库存管理规则模板',
                rules: [
                    { key: 'inventory_mode', value: 'portion', description: '库存模式(portion/no-limit)' },
                    { key: 'max_daily_portion', value: 100, description: '每日最大份数' },
                    { key: 'low_stock_warning', value: 10, description: '低库存预警值' },
                    { key: 'allow_preorder', value: true, description: '允许预订' },
                    { key: 'preorder_hours', value: 24, description: '预订提前小时数' }
                ]
            },
            {
                id: 'template_content_moderation',
                name: '内容审核规则模板',
                type: RULE_TYPES.CONTENT,
                description: '内容审核管理规则模板',
                rules: [
                    { key: 'auto_moderation', value: true, description: '开启自动审核' },
                    { key: 'sensitive_words', value: [], description: '敏感词列表' },
                    { key: 'max_review_time', value: 24, description: '最大审核时间(小时)' },
                    { key: 'require_image', value: true, description: '要求上传图片' },
                    { key: 'max_images', value: 5, description: '最大图片数量' }
                ]
            }
        ];
        
        console.log(`已加载 ${ruleTemplates.length} 个规则模板`);
    }
    
    /**
     * 加载规则数据
     */
    function loadRules() {
        // 模拟从API加载规则数据
        rules = [
            {
                id: 'rule_001',
                name: '东莞理工学院管理规则',
                type: RULE_TYPES.SCHOOL,
                status: RULE_STATUS.ACTIVE,
                entityId: 'school_001',
                createdAt: '2026-01-15',
                updatedAt: '2026-01-20',
                rules: [
                    { key: 'max_students', value: 12000, description: '最大学生数' },
                    { key: 'max_merchants', value: 35, description: '最大商户数' },
                    { key: 'allow_audit', value: true, description: '允许内容审核' }
                ]
            },
            {
                id: 'rule_002',
                name: '华南理工大学商户规则',
                type: RULE_TYPES.MERCHANT,
                status: RULE_STATUS.ACTIVE,
                entityId: 'school_002',
                createdAt: '2026-01-10',
                updatedAt: '2026-01-18',
                rules: [
                    { key: 'max_stalls', value: 8, description: '最大档口数' },
                    { key: 'max_employees', value: 15, description: '最大员工数' },
                    { key: 'allow_discount', value: true, description: '允许设置折扣' }
                ]
            }
        ];
        
        console.log(`已加载 ${rules.length} 条规则`);
        return rules;
    }
    
    /**
     * 获取所有规则
     * @returns {Array} 规则列表
     */
    function getAllRules() {
        return rules;
    }
    
    /**
     * 根据类型获取规则
     * @param {string} type - 规则类型
     * @returns {Array} 规则列表
     */
    function getRulesByType(type) {
        return rules.filter(rule => rule.type === type);
    }
    
    /**
     * 根据实体ID获取规则
     * @param {string} entityId - 实体ID
     * @returns {Array} 规则列表
     */
    function getRulesByEntity(entityId) {
        return rules.filter(rule => rule.entityId === entityId);
    }
    
    /**
     * 获取规则详情
     * @param {string} ruleId - 规则ID
     * @returns {Object|null} 规则对象
     */
    function getRuleDetails(ruleId) {
        return rules.find(rule => rule.id === ruleId) || null;
    }
    
    /**
     * 创建新规则
     * @param {Object} ruleData - 规则数据
     * @returns {Object} 创建的规则
     */
    function createRule(ruleData) {
        const newRule = {
            id: 'rule_' + Date.now(),
            ...ruleData,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            status: RULE_STATUS.DRAFT
        };
        
        rules.push(newRule);
        console.log(`规则创建成功: ${newRule.id}`);
        return newRule;
    }
    
    /**
     * 更新规则
     * @param {string} ruleId - 规则ID
     * @param {Object} updates - 更新数据
     * @returns {Object|null} 更新后的规则
     */
    function updateRule(ruleId, updates) {
        const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
        
        if (ruleIndex === -1) {
            console.error(`规则不存在: ${ruleId}`);
            return null;
        }
        
        rules[ruleIndex] = {
            ...rules[ruleIndex],
            ...updates,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        console.log(`规则更新成功: ${ruleId}`);
        return rules[ruleIndex];
    }
    
    /**
     * 删除规则
     * @param {string} ruleId - 规则ID
     * @returns {boolean} 是否删除成功
     */
    function deleteRule(ruleId) {
        const initialLength = rules.length;
        rules = rules.filter(rule => rule.id !== ruleId);
        
        const success = rules.length < initialLength;
        if (success) {
            console.log(`规则删除成功: ${ruleId}`);
        } else {
            console.error(`规则删除失败: ${ruleId}`);
        }
        
        return success;
    }
    
    /**
     * 激活规则
     * @param {string} ruleId - 规则ID
     * @returns {boolean} 是否激活成功
     */
    function activateRule(ruleId) {
        const rule = getRuleDetails(ruleId);
        if (!rule) return false;
        
        rule.status = RULE_STATUS.ACTIVE;
        rule.updatedAt = new Date().toISOString().split('T')[0];
        console.log(`规则激活成功: ${ruleId}`);
        return true;
    }
    
    /**
     * 停用规则
     * @param {string} ruleId - 规则ID
     * @returns {boolean} 是否停用成功
     */
    function deactivateRule(ruleId) {
        const rule = getRuleDetails(ruleId);
        if (!rule) return false;
        
        rule.status = RULE_STATUS.INACTIVE;
        rule.updatedAt = new Date().toISOString().split('T')[0];
        console.log(`规则停用成功: ${ruleId}`);
        return true;
    }
    
    /**
     * 应用规则模板
     * @param {string} templateId - 模板ID
     * @param {string} entityId - 实体ID
     * @param {string} entityType - 实体类型
     * @returns {Object} 创建的规则
     */
    function applyTemplate(templateId, entityId, entityType) {
        const template = ruleTemplates.find(t => t.id === templateId);
        if (!template) {
            console.error(`模板不存在: ${templateId}`);
            return null;
        }
        
        const newRule = createRule({
            name: `${entityType}规则 - ${template.name}`,
            type: template.type,
            entityId: entityId,
            templateId: templateId,
            rules: JSON.parse(JSON.stringify(template.rules)) // 深拷贝
        });
        
        console.log(`模板应用成功: ${templateId} -> ${entityId}`);
        return newRule;
    }
    
    /**
     * 验证规则值
     * @param {string} key - 规则键
     * @param {any} value - 规则值
     * @returns {Object} 验证结果 {valid: boolean, message: string}
     */
    function validateRuleValue(key, value) {
        // 基本验证规则
        const validations = {
            max_students: (val) => val >= 0 && val <= 100000,
            max_merchants: (val) => val >= 0 && val <= 100,
            max_stalls: (val) => val >= 0 && val <= 50,
            max_employees: (val) => val >= 0 && val <= 100,
            max_discount_rate: (val) => val >= 0 && val <= 100,
            max_daily_portion: (val) => val >= 0 && val <= 1000,
            low_stock_warning: (val) => val >= 0 && val <= 100,
            preorder_hours: (val) => val >= 0 && val <= 168, // 一周内
            max_review_time: (val) => val >= 0 && val <= 168,
            max_images: (val) => val >= 0 && val <= 20
        };
        
        if (validations[key]) {
            const valid = validations[key](value);
            return {
                valid: valid,
                message: valid ? '验证通过' : `值 ${value} 不符合要求`
            };
        }
        
        // 默认验证通过
        return { valid: true, message: '验证通过' };
    }
    
    /**
     * 导出规则为JSON
     * @param {string} ruleId - 规则ID
     * @returns {string} JSON字符串
     */
    function exportRuleToJson(ruleId) {
        const rule = getRuleDetails(ruleId);
        if (!rule) return null;
        
        return JSON.stringify(rule, null, 2);
    }
    
    /**
     * 导入规则从JSON
     * @param {string} jsonStr - JSON字符串
     * @returns {Object|null} 导入的规则
     */
    function importRuleFromJson(jsonStr) {
        try {
            const ruleData = JSON.parse(jsonStr);
            
            // 验证必要字段
            if (!ruleData.name || !ruleData.type) {
                throw new Error('规则数据缺少必要字段');
            }
            
            // 创建规则
            const newRule = createRule(ruleData);
            return newRule;
        } catch (error) {
            console.error('规则导入失败:', error.message);
            return null;
        }
    }
    
    /**
     * 获取规则模板列表
     * @returns {Array} 模板列表
     */
    function getTemplates() {
        return ruleTemplates;
    }
    
    /**
     * 根据类型获取模板
     * @param {string} type - 规则类型
     * @returns {Array} 模板列表
     */
    function getTemplatesByType(type) {
        return ruleTemplates.filter(template => template.type === type);
    }
    
    /**
     * 获取规则统计信息
     * @returns {Object} 统计信息
     */
    function getStats() {
        const stats = {
            total: rules.length,
            byType: {},
            byStatus: {
                active: 0,
                inactive: 0,
                draft: 0,
                pending: 0
            }
        };
        
        // 按类型统计
        Object.values(RULE_TYPES).forEach(type => {
            stats.byType[type] = getRulesByType(type).length;
        });
        
        // 按状态统计
        rules.forEach(rule => {
            if (rule.status === RULE_STATUS.ACTIVE) stats.byStatus.active++;
            else if (rule.status === RULE_STATUS.INACTIVE) stats.byStatus.inactive++;
            else if (rule.status === RULE_STATUS.DRAFT) stats.byStatus.draft++;
            else if (rule.status === RULE_STATUS.PENDING) stats.byStatus.pending++;
        });
        
        return stats;
    }
    
    // 公共API
    return {
        init,
        RULE_TYPES,
        RULE_STATUS,
        getAllRules,
        getRulesByType,
        getRulesByEntity,
        getRuleDetails,
        createRule,
        updateRule,
        deleteRule,
        activateRule,
        deactivateRule,
        applyTemplate,
        validateRuleValue,
        exportRuleToJson,
        importRuleFromJson,
        getTemplates,
        getTemplatesByType,
        getStats
    };
})();

// 自动初始化
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('super_admin_index.html')) {
        AdminRules.init();
        console.log('规则管理系统已就绪');
    }
});

// 导出到全局
window.AdminRules = AdminRules;