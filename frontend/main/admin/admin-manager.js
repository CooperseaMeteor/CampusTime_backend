/**
 * 管理员管理核心逻辑
 * 基于《校园食光》管理员权限与层级规范V1
 */

class AdminManager {
    static adminList = [];
    static currentFilter = 'all';
    static searchKeyword = '';

    /**
     * 初始化页面
     */
    static async init() {
        // 检查页面访问权限
        if (!AdminAuth.checkPageAccess('stall_admin', ['admin.create', 'admin.assign'])) {
            return;
        }

        // 加载管理员列表
        await this.loadAdminList();

        // 绑定搜索事件
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchKeyword = e.target.value.trim();
            this.filterAndRender();
        });
    }

    /**
     * 加载管理员列表
     */
    static async loadAdminList() {
        try {
            const data = await AdminAuth.apiCall('/admin/management/list', {
                method: 'GET'
            });

            if (data.code === 200) {
                this.adminList = data.data || [];
                this.renderAdminList();
            } else {
                this.showError(data.message || '加载失败');
            }
        } catch (error) {
            console.error('加载管理员列表失败:', error);
            this.showError('网络错误，请稍后重试');
        }
    }

    /**
     * 渲染管理员列表（按规范实现树状展示）
     */
    static renderAdminList() {
        const container = document.getElementById('adminListContent');
        if (!container) return;

        // 分组：未分配、按学校/商户树分组
        const grouped = this.groupAdmins(this.adminList);

        let html = '';

        // 1. 未分配职位的（绿色高亮）
        if (grouped.unassigned && grouped.unassigned.length > 0) {
            html += this.renderSection('未分配职位', grouped.unassigned, 'unassigned', true);
        }

        // 2. 已分配的按组织树展示
        if (grouped.schools) {
            for (const school of grouped.schools) {
                html += this.renderSchoolSection(school);
            }
        }

        container.innerHTML = html || '<div class="empty">暂无管理员数据</div>';

        // 绑定事件
        this.bindListEvents();
    }

    /**
     * 分组管理员
     */
    static groupAdmins(admins) {
        const result = {
            unassigned: [],
            schools: []
        };

        // 按作用域分组
        admins.forEach(admin => {
            if (!admin.positions || admin.positions.length === 0) {
                result.unassigned.push(admin);
            } else {
                // 按学校分组
                admin.positions.forEach(pos => {
                    if (pos.school_id) {
                        let school = result.schools.find(s => s.id === pos.school_id);
                        if (!school) {
                            school = {
                                id: pos.school_id,
                                name: pos.school_name || `学校${pos.school_id}`,
                                admins: []
                            };
                            result.schools.push(school);
                        }
                        school.admins.push({ ...admin, currentPosition: pos });
                    }
                });
            }
        });

        // 排序未分配的
        result.unassigned.sort((a, b) => this.sortByIdentity(a, b));

        return result;
    }

    /**
     * 渲染学校section
     */
    static renderSchoolSection(school) {
        const admins = school.admins || [];
        if (admins.length === 0) return '';

        return `
            <div class="list-section">
                <div class="section-header" onclick="AdminManager.toggleSection(this)">
                    <span class="section-title">🏫 ${school.name}</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-content">
                    ${admins.map(admin => this.renderAdminItem(admin)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染普通section
     */
    static renderSection(title, admins, className = '', highlight = false) {
        if (!admins || admins.length === 0) return '';

        return `
            <div class="list-section ${className}">
                <div class="section-header" onclick="AdminManager.toggleSection(this)">
                    <span class="section-title">${title} (${admins.length})</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="section-content">
                    ${admins.map(admin => this.renderAdminItem(admin, highlight)).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染管理员条目
     */
    static renderAdminItem(admin, highlight = false) {
        const identityLabel = AdminAuth.getIdentityLabel(admin);
        const position = admin.currentPosition || {};
        const positionText = position.role ? AdminAuth.getRoleLabel(position.role) : '未分配';

        return `
            <div class="admin-item ${highlight ? 'unassigned' : ''}" data-id="${admin.id}">
                <div class="admin-info">
                    <span class="admin-name">${admin.real_name || admin.username}</span>
                    ${identityLabel ? `<span class="admin-identity">${identityLabel}</span>` : ''}
                    <span class="admin-position">${positionText}</span>
                </div>
                <div class="admin-actions">
                    ${AdminAuth.hasPermission('admin.update') ? 
                        `<button class="action-btn action-edit" onclick="AdminManager.editAdmin(${admin.id})">编辑</button>` : ''}
                    ${AdminAuth.hasPermission('admin.assign') ? 
                        `<button class="action-btn action-edit" onclick="AdminManager.assignPosition(${admin.id})">调岗</button>` : ''}
                    ${AdminAuth.hasPermission('admin.disable') ? 
                        `<button class="action-btn action-delete" onclick="AdminManager.disableAdmin(${admin.id})">禁用</button>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * 折叠/展开section
     */
    static toggleSection(headerEl) {
        const icon = headerEl.querySelector('.collapse-icon');
        const content = headerEl.nextElementSibling;
        
        if (content.style.display === 'none') {
            content.style.display = 'block';
            icon.classList.remove('collapsed');
        } else {
            content.style.display = 'none';
            icon.classList.add('collapsed');
        }
    }

    /**
     * 身份标签排序
     */
    static sortByIdentity(a, b) {
        const order = { '教职工': 1, '工作人员': 2, '运营专员': 3 };
        
        const labelA = a.identity_label || '';
        const labelB = b.identity_label || '';
        
        // 先按标签分组
        if (order[labelA] !== order[labelB]) {
            return (order[labelA] || 99) - (order[labelB] || 99);
        }
        
        // 同标签内按标签+后缀总字数
        const fullA = labelA + (a.identity_suffix || '');
        const fullB = labelB + (b.identity_suffix || '');
        
        if (fullA.length !== fullB.length) {
            return fullA.length - fullB.length;
        }
        
        // 再按名字字数
        const nameA = a.real_name || a.username;
        const nameB = b.real_name || b.username;
        
        if (nameA.length !== nameB.length) {
            return nameA.length - nameB.length;
        }
        
        // 最后按字典序
        return nameA.localeCompare(nameB, 'zh-CN');
    }

    /**
     * 显示创建管理员模态框
     */
    static showCreateModal() {
        if (!AdminAuth.hasPermission('admin.create')) {
            alert('您没有创建管理员的权限');
            return;
        }

        const modal = document.getElementById('createModal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadRoleOptions();
            this.loadNodeOptions();
        }
    }

    /**
     * 关闭创建模态框
     */
    static closeCreateModal() {
        const modal = document.getElementById('createModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('createForm').reset();
        }
    }

    /**
     * 加载角色选项（根据当前用户权限）
     */
    static loadRoleOptions() {
        const select = document.getElementById('roleSelect');
        if (!select) return;

        const currentPosition = AdminAuth.getActivePosition();
        const roles = [];

        // 根据当前角色决定能创建的角色
        if (currentPosition.role === 'super_admin') {
            roles.push(
                { value: 'super_admin', label: '平台超级管理员' },
                { value: 'school_admin', label: '学校管理员' },
                { value: 'merchant_admin', label: '商户管理员' },
                { value: 'stall_admin', label: '档口管理员' }
            );
        } else if (currentPosition.role === 'school_admin') {
            roles.push(
                { value: 'school_admin', label: '学校管理员' },
                { value: 'merchant_admin', label: '商户管理员' },
                { value: 'stall_admin', label: '档口管理员' }
            );
        } else if (currentPosition.role === 'merchant_admin') {
            roles.push(
                { value: 'merchant_admin', label: '商户管理员' },
                { value: 'stall_admin', label: '档口管理员' }
            );
        }

        select.innerHTML = '<option value="">请选择</option>' + 
            roles.map(r => `<option value="${r.value}">${r.label}</option>`).join('');
    }

    /**
     * 加载节点选项
     */
    static async loadNodeOptions() {
        // TODO: 从后端获取可分配的节点列表
        const select = document.getElementById('nodeSelect');
        if (!select) return;

        // 暂时静态
        select.innerHTML = '<option value="">暂不绑定</option>';
    }

    /**
     * 提交创建表单
     */
    static async submitCreate(formData) {
        try {
            const data = await AdminAuth.apiCall('/admin/management/create', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (data.code === 200) {
                alert('创建成功！');
                this.closeCreateModal();
                this.loadAdminList();
            } else {
                alert('创建失败：' + data.message);
            }
        } catch (error) {
            console.error('创建管理员失败:', error);
            alert('网络错误，请稍后重试');
        }
    }

    /**
     * 显示"我的创建"
     */
    static showMyCreated() {
        alert('我的创建功能开发中...');
    }

    /**
     * 编辑管理员
     */
    static editAdmin(adminId) {
        alert(`编辑管理员 ${adminId} 功能开发中...`);
    }

    /**
     * 调岗
     */
    static assignPosition(adminId) {
        alert(`调岗管理员 ${adminId} 功能开发中...`);
    }

    /**
     * 禁用管理员
     */
    static async disableAdmin(adminId) {
        if (!confirm('确定要禁用此管理员吗？')) return;

        try {
            const data = await AdminAuth.apiCall(`/admin/management/${adminId}/disable`, {
                method: 'POST'
            });

            if (data.code === 200) {
                alert('禁用成功');
                this.loadAdminList();
            } else {
                alert('禁用失败：' + data.message);
            }
        } catch (error) {
            console.error('禁用管理员失败:', error);
            alert('网络错误，请稍后重试');
        }
    }

    /**
     * 绑定列表事件
     */
    static bindListEvents() {
        // 创建表单提交
        const form = document.getElementById('createForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = Object.fromEntries(new FormData(form));
                await this.submitCreate(formData);
            });
        }
    }

    /**
     * 过滤并重新渲染
     */
    static filterAndRender() {
        // TODO: 实现搜索过滤
        this.renderAdminList();
    }

    /**
     * 显示错误
     */
    static showError(message) {
        const container = document.getElementById('adminListContent');
        if (container) {
            container.innerHTML = `<div class="empty">❌ ${message}</div>`;
        }
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    AdminManager.init();
});
