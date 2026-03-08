/**
 * 快捷操作组件
 * 提供扫码快编、批量导入、库存模式批量设置等功能
 * 依赖: config.js, admin-permission.js
 */

/**
 * 扫码快编功能
 * @param {Object} options - 配置选项
 * @param {string} options.scanType - 扫描类型: 'dish'菜品, 'stall'档口, 'merchant'商户
 * @param {Function} options.onScanned - 扫描成功回调
 * @param {Function} options.onError - 错误处理回调
 */
function quickScan(options = {}) {
    const {
        scanType = 'dish',
        onScanned = (data) => console.log('扫描结果:', data),
        onError = (error) => console.error('扫描错误:', error)
    } = options;
    
    console.log(`启动${getScanTypeName(scanType)}扫码快编...`);
    
    // 模拟扫码过程
    const scanResult = simulateScan(scanType);
    
    // 权限检查
    if (!checkQuickActionPermission(scanType)) {
        onError(new Error('权限不足，无法执行此操作'));
        return;
    }
    
    // 处理扫描结果
    if (scanResult.success) {
        console.log(`扫码成功: ${scanResult.data.name || scanResult.data.id}`);
        onScanned(scanResult.data);
    } else {
        onError(new Error(scanResult.error || '扫码失败'));
    }
}

/**
 * 模拟扫码过程
 * @param {string} scanType - 扫描类型
 * @returns {Object} 扫描结果
 */
function simulateScan(scanType) {
    const mockData = {
        dish: {
            success: true,
            data: {
                id: 'dish_' + Date.now(),
                name: '测试菜品',
                price: 25.5,
                category: '主菜',
                stockMode: 'limited'
            }
        },
        stall: {
            success: true,
            data: {
                id: 'stall_' + Date.now(),
                name: '测试档口',
                merchantId: 'merchant_001',
                status: 'open'
            }
        },
        merchant: {
            success: true,
            data: {
                id: 'merchant_' + Date.now(),
                name: '测试商户',
                schoolId: 'school_001',
                status: 'active'
            }
        }
    };
    
    return mockData[scanType] || { success: false, error: '不支持的扫描类型' };
}

/**
 * 获取扫描类型显示名称
 * @param {string} scanType - 扫描类型
 * @returns {string} 显示名称
 */
function getScanTypeName(scanType) {
    const typeNames = {
        dish: '菜品',
        stall: '档口',
        merchant: '商户'
    };
    return typeNames[scanType] || '未知';
}

/**
 * 下载批量导入模板
 * @param {string} templateType - 模板类型: 'dish'菜品, 'stall'档口, 'merchant'商户, 'user'用户
 */
function downloadImportTemplate(templateType = 'dish') {
    console.log(`下载${getTemplateTypeName(templateType)}批量导入模板...`);
    
    // 权限检查
    if (!checkQuickActionPermission(templateType)) {
        alert('权限不足，无法下载此模板');
        return;
    }
    
    // 模板配置
    const templates = {
        dish: {
            filename: '菜品批量导入模板.xlsx',
            columns: ['菜品名称', '价格', '分类', '库存模式', '描述', '图片URL']
        },
        stall: {
            filename: '档口批量导入模板.xlsx',
            columns: ['档口名称', '所属商户', '营业状态', '位置', '联系方式']
        },
        merchant: {
            filename: '商户批量导入模板.xlsx',
            columns: ['商户名称', '所属学校', '经营类型', '联系人', '联系电话']
        },
        user: {
            filename: '用户批量导入模板.xlsx',
            columns: ['用户名', '姓名', '角色', '所属学校', '手机号']
        }
    };
    
    const template = templates[templateType];
    if (!template) {
        alert('不支持的模板类型');
        return;
    }
    
    // 模拟下载
    simulateDownload(template.filename, template.columns);
    alert(`模板"${template.filename}"下载成功！\n包含列: ${template.columns.join(', ')}`);
}

/**
 * 获取模板类型显示名称
 * @param {string} templateType - 模板类型
 * @returns {string} 显示名称
 */
function getTemplateTypeName(templateType) {
    const typeNames = {
        dish: '菜品',
        stall: '档口',
        merchant: '商户',
        user: '用户'
    };
    return typeNames[templateType] || '未知';
}

/**
 * 批量设置库存模式
 * @param {Object} options - 配置选项
 * @param {string} options.mode - 库存模式: 'limited'限量, 'unlimited'不限量
 * @param {Array} options.dishIds - 菜品ID数组（空数组表示全选）
 * @param {Function} options.onSuccess - 成功回调
 * @param {Function} options.onError - 错误处理回调
 */
function batchSetStockMode(options = {}) {
    const {
        mode = 'limited',
        dishIds = [],
        onSuccess = (result) => console.log('批量设置成功:', result),
        onError = (error) => console.error('批量设置失败:', error)
    } = options;
    
    console.log(`批量设置库存模式为: ${mode === 'limited' ? '限量' : '不限量'}`);
    
    // 权限检查 - 需要菜品管理权限
    if (!checkQuickActionPermission('dish_management')) {
        onError(new Error('权限不足，无法批量设置库存模式'));
        return;
    }
    
    // 确认操作
    const dishCount = dishIds.length || '全部';
    const confirmMessage = `确定要将${dishCount}个菜品的库存模式设置为"${mode === 'limited' ? '限量' : '不限量'}"吗？`;
    
    if (!confirm(confirmMessage)) {
        console.log('用户取消操作');
        return;
    }
    
    // 模拟批量设置
    setTimeout(() => {
        const result = {
            success: true,
            mode: mode,
            affectedCount: dishIds.length || 50, // 模拟影响数量
            message: `已成功将${dishIds.length || 50}个菜品的库存模式设置为"${mode === 'limited' ? '限量' : '不限量'}"`
        };
        onSuccess(result);
        alert(result.message);
    }, 1000);
}

/**
 * 显示快捷操作菜单
 * @param {Object} options - 配置选项
 */
function showQuickActionsMenu(options = {}) {
    const {
        position = { x: 0, y: 0 },
        availableActions = ['scan', 'import', 'stock']
    } = options;
    
    console.log('显示快捷操作菜单...');
    
    // 检查权限并过滤可用的操作
    const filteredActions = availableActions.filter(action => 
        checkQuickActionPermission(action)
    );
    
    if (filteredActions.length === 0) {
        alert('当前没有可用的快捷操作');
        return;
    }
    
    // 构建菜单项
    const menuItems = filteredActions.map(action => {
        switch (action) {
            case 'scan':
                return { text: '扫码快编', icon: 'qrcode', action: () => quickScan() };
            case 'import':
                return { text: '批量导入', icon: 'download', action: () => downloadImportTemplate() };
            case 'stock':
                return { text: '库存设置', icon: 'boxes', action: () => batchSetStockMode() };
            default:
                return null;
        }
    }).filter(item => item !== null);
    
    // 模拟显示菜单
    simulateMenuDisplay(menuItems, position);
}

/**
 * 检查快捷操作权限
 * @param {string} action - 操作类型
 * @returns {boolean} 是否有权限
 */
function checkQuickActionPermission(action) {
    if (!window.AdminPermission) {
        console.warn('AdminPermission未加载，跳过权限检查');
        return true;
    }
    
    const currentRole = AdminPermission.getCurrentRole();
    
    // 权限映射
    const permissionMap = {
        // 扫码快编权限
        'dish': 'dish_management',
        'stall': 'stall_management',
        'merchant': 'merchant_management',
        'scan': 'quick_scan',
        
        // 批量导入权限
        'import': 'batch_import',
        'dish_management': 'dish_management',
        'stall_management': 'stall_management',
        'merchant_management': 'merchant_management',
        'user_management': 'user_management',
        
        // 库存管理权限
        'stock': 'stock_management'
    };
    
    const requiredPermission = permissionMap[action];
    if (!requiredPermission) {
        console.warn(`未配置操作"${action}"的权限要求，默认允许`);
        return true;
    }
    
    return AdminPermission.hasPermission(requiredPermission);
}

/**
 * 模拟下载文件
 * @param {string} filename - 文件名
 * @param {Array} columns - 列名数组
 */
function simulateDownload(filename, columns) {
    // 在实际应用中，这里会创建并下载文件
    console.log(`模拟下载文件: ${filename}`);
    console.log('文件内容结构:', columns);
    
    // 创建虚拟链接（仅用于演示）
    const link = document.createElement('a');
    link.href = 'javascript:void(0)';
    link.download = filename;
    link.click();
}

/**
 * 模拟显示菜单
 * @param {Array} menuItems - 菜单项数组
 * @param {Object} position - 显示位置
 */
function simulateMenuDisplay(menuItems, position) {
    console.log('在位置', position, '显示菜单，包含项目:', menuItems.map(item => item.text));
    
    // 在实际应用中，这里会显示一个模态菜单
    const menuMessage = '快捷操作菜单:\n\n' + 
        menuItems.map((item, index) => `${index + 1}. ${item.text}`).join('\n') +
        '\n\n请选择要执行的操作（实际应显示模态菜单）';
    
    const choice = prompt(menuMessage);
    if (choice && menuItems[parseInt(choice) - 1]) {
        menuItems[parseInt(choice) - 1].action();
    }
}

/**
 * 批量设置菜品状态（扩展功能）
 * @param {Array} dishIds - 菜品ID数组
 * @param {string} status - 状态: 'active'上架, 'inactive'下架
 */
function batchSetDishStatus(dishIds, status = 'active') {
    console.log(`批量设置${dishIds.length}个菜品状态为: ${status}`);
    
    if (!checkQuickActionPermission('dish_management')) {
        alert('权限不足，无法批量设置菜品状态');
        return;
    }
    
    // 模拟API调用
    setTimeout(() => {
        alert(`已成功将${dishIds.length}个菜品状态设置为"${status === 'active' ? '上架' : '下架'}"`);
    }, 1500);
}

// 导出API
const QuickActions = {
    quickScan,
    downloadImportTemplate,
    batchSetStockMode,
    showQuickActionsMenu,
    batchSetDishStatus,
    checkQuickActionPermission
};

// 全局注册
if (typeof window !== 'undefined') {
    window.QuickActions = QuickActions;
    console.log('QuickActions组件已加载');
}

// 自动初始化快捷操作按钮
document.addEventListener('DOMContentLoaded', function() {
    // 查找页面上的快捷操作按钮并绑定事件
    const quickActionButtons = document.querySelectorAll('[data-quick-action]');
    quickActionButtons.forEach(button => {
        const action = button.dataset.quickAction;
        button.addEventListener('click', function() {
            switch (action) {
                case 'scan':
                    quickScan();
                    break;
                case 'import':
                    downloadImportTemplate();
                    break;
                case 'stock':
                    batchSetStockMode();
                    break;
                case 'menu':
                    showQuickActionsMenu();
                    break;
            }
        });
    });
    
    console.log(`初始化了${quickActionButtons.length}个快捷操作按钮`);
});