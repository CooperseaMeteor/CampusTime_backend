/**
 * 管理员权限认证中间件（前端版）
 * 基于《校园食光》管理员权限与层级规范V1
 */

class AdminAuth {
    /**
     * 检查管理员登录状态
     * @returns {boolean} 是否已登录
     */
    static isLoggedIn() {
        return !!localStorage.getItem('adminToken');
    }

    /**
     * 获取当前管理员信息
     * @returns {object|null}
     */
    static getAdminInfo() {
        const info = localStorage.getItem('adminInfo');
        return info ? JSON.parse(info) : null;
    }

    /**
     * 获取所有职位
     * @returns {array}
     */
    static getAllPositions() {
        const positions = localStorage.getItem('adminPositions');
        return positions ? JSON.parse(positions) : [];
    }

    /**
     * 获取当前激活的职位ID
     * @returns {number|null}
     */
    static getActivePositionId() {
        const id = localStorage.getItem('adminActivePositionId');
        return id ? parseInt(id) : null;
    }

    /**
     * 获取当前激活的职位信息
     * @returns {object|null}
     */
    static getActivePosition() {
        const positions = this.getAllPositions();
        const activeId = this.getActivePositionId();
        return positions.find(p => p.id === activeId) || null;
    }

    /**
     * 切换职位
     * @param {number} positionId 
     * @param {string} targetPage 目标页面URL
     */
    static switchPosition(positionId, targetPage) {
        localStorage.setItem('adminActivePositionId', positionId);
        if (targetPage) {
            window.location.href = targetPage;
        } else {
            window.location.reload();
        }
    }

    /**
     * 获取API请求头（包含token和激活职位）
     * @returns {object}
     */
    static getHeaders() {
        return {
            'Authorization': 'Bearer ' + localStorage.getItem('adminToken'),
            'X-Active-Position-Id': this.getActivePositionId(),
            'Content-Type': 'application/json'
        };
    }

    /**
     * 检查是否有特定权限
     * @param {string} permission 权限标识，如 'admin.create'
     * @returns {boolean}
     */
    static hasPermission(permission) {
        const position = this.getActivePosition();
        if (!position || !position.permissions) return false;
        
        // 超级管理员拥有所有权限
        if (position.role === 'super_admin') return true;
        
        return position.permissions.includes(permission);
    }

    /**
     * 检查是否有任一权限
     * @param {array} permissions 权限数组
     * @returns {boolean}
     */
    static hasAnyPermission(permissions) {
        return permissions.some(p => this.hasPermission(p));
    }

    /**
     * 检查是否有所有权限
     * @param {array} permissions 权限数组
     * @returns {boolean}
     */
    static hasAllPermissions(permissions) {
        return permissions.every(p => this.hasPermission(p));
    }

    /**
     * 检查角色等级
     * @param {string} requiredRole 需要的角色
     * @returns {boolean}
     */
    static hasRole(requiredRole) {
        const position = this.getActivePosition();
        return position && position.role === requiredRole;
    }

    /**
     * 检查角色等级是否高于或等于指定角色
     * @param {string} minRole 最低角色要求
     * @returns {boolean}
     */
    static hasMinRole(minRole) {
        const roleLevel = {
            'super_admin': 0,
            'school_admin': 1,
            'merchant_admin': 2,
            'stall_admin': 3
        };
        
        const position = this.getActivePosition();
        if (!position) return false;
        
        return roleLevel[position.role] <= roleLevel[minRole];
    }

    /**
     * 页面权限检查（在页面加载时调用）
     * @param {string} requiredRole 需要的最低角色
     * @param {array} requiredPermissions 需要的权限列表（可选）
     */
    static checkPageAccess(requiredRole, requiredPermissions = []) {
        // 检查是否登录
        if (!this.isLoggedIn()) {
            alert('请先登录管理员账号');
            window.location.href = '/login/admin_login.html';
            return false;
        }

        // 检查是否有激活职位
        const position = this.getActivePosition();
        if (!position) {
            alert('未找到有效职位，请重新登录');
            this.logout();
            return false;
        }

        // 检查角色等级
        if (!this.hasMinRole(requiredRole)) {
            alert('您没有访问此页面的权限');
            window.history.back();
            return false;
        }

        // 检查特定权限
        if (requiredPermissions.length > 0 && !this.hasAnyPermission(requiredPermissions)) {
            alert('您没有执行此操作的权限');
            window.history.back();
            return false;
        }

        return true;
    }

    /**
     * 登出
     */
    static logout() {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminInfo');
        localStorage.removeItem('adminPositions');
        localStorage.removeItem('adminActivePositionId');
        window.location.href = '/login/admin_login.html';
    }

    /**
     * API调用封装（自动带token和职位信息）
     * @param {string} endpoint API端点
     * @param {object} options fetch选项
     * @returns {Promise}
     */
    static async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: this.getHeaders()
        };

        const finalOptions = {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...(options.headers || {})
            }
        };

        const response = await fetch('https://campusfood.cn/api' + endpoint, finalOptions);
        const data = await response.json();

        // 处理token过期
        if (data.code === 401) {
            alert('登录已过期，请重新登录');
            this.logout();
            throw new Error('Token expired');
        }

        // 处理权限不足
        if (data.code === 403) {
            alert(data.message || '权限不足');
            throw new Error('Permission denied');
        }

        return data;
    }

    /**
     * 显示职位切换器UI
     */
    static showPositionSwitcher() {
        const positions = this.getAllPositions();
        const activeId = this.getActivePositionId();
        
        if (positions.length <= 1) {
            return; // 只有一个职位不显示切换器
        }

        const html = `
            <div id="positionSwitcherDropdown" style="position: absolute; top: 100%; right: 0; background: white; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 250px; z-index: 1000; margin-top: 5px;">
                ${positions.map(pos => `
                    <div onclick="AdminAuth.switchPosition(${pos.id}, '${pos.target}')" 
                         style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f0f0f0; ${pos.id === activeId ? 'background: #f0f8ff; font-weight: bold;' : ''}"
                         onmouseover="if(${pos.id} !== ${activeId}) this.style.backgroundColor='#f5f5f5'"
                         onmouseout="if(${pos.id} !== ${activeId}) this.style.backgroundColor='white'">
                        <div style="color: #333; margin-bottom: 3px;">${pos.label}</div>
                        <div style="font-size: 12px; color: #999;">${this.getRoleLabel(pos.role)}</div>
                        ${pos.id === activeId ? '<div style="color: #1890FF; font-size: 11px; margin-top: 3px;">✓ 当前职位</div>' : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        return html;
    }

    /**
     * 获取角色中文标签
     * @param {string} role 
     * @returns {string}
     */
    static getRoleLabel(role) {
        const labels = {
            'super_admin': '平台超级管理员',
            'school_admin': '学校管理员',
            'merchant_admin': '商户管理员',
            'stall_admin': '档口管理员'
        };
        return labels[role] || role;
    }

    /**
     * 获取身份标签完整显示
     * @param {object} adminInfo 
     * @returns {string}
     */
    static getIdentityLabel(adminInfo) {
        if (!adminInfo) return '';
        
        let label = adminInfo.identity_label || '';
        
        // 只有审核通过的后缀才显示
        if (adminInfo.identity_suffix && adminInfo.identity_suffix_status === 'approved') {
            label += ' · ' + adminInfo.identity_suffix;
        }
        
        return label;
    }
}

// 页面加载时自动初始化
document.addEventListener('DOMContentLoaded', function() {
    // 如果页面需要登录，可以在这里统一检查
    // AdminAuth.checkPageAccess('stall_admin'); // 示例：最低要求档口管理员
});
