/**
 * 管理员顶部导航栏 - 职位切换器组件
 * 支持多职位切换、退出登录
 */

class AdminNavbar {
    /**
     * 初始化导航栏
     * @param {string} containerId 容器ID
     */
    static init(containerId = 'adminNavbar') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('导航栏容器不存在:', containerId);
            return;
        }

        const adminInfo = AdminAuth.getAdminInfo();
        const currentPosition = AdminAuth.getActivePosition();
        const allPositions = AdminAuth.getAllPositions();

        if (!adminInfo || !currentPosition) {
            console.warn('管理员信息不完整，无法初始化导航栏');
            return;
        }

        const html = `
            <div class="admin-navbar" style="background: #001529; color: white; padding: 0 20px; display: flex; align-items: center; justify-content: space-between; height: 60px; position: sticky; top: 0; z-index: 999; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                <!-- 左侧：Logo和标题 -->
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 24px;">🍽️</div>
                    <div>
                        <div style="font-size: 18px; font-weight: bold;">校园食光管理后台</div>
                        <div style="font-size: 12px; color: #8c8c8c;">${AdminAuth.getRoleLabel(currentPosition.role)}</div>
                    </div>
                </div>

                <!-- 右侧：用户信息和操作 -->
                <div style="display: flex; align-items: center; gap: 15px;">
                    ${allPositions.length > 1 ? this.renderPositionSwitcher(allPositions, currentPosition) : ''}
                    ${this.renderUserMenu(adminInfo, currentPosition)}
                </div>
            </div>
        `;

        container.innerHTML = html;

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 渲染职位切换器（多职位时显示）
     */
    static renderPositionSwitcher(positions, currentPosition) {
        return `
            <div style="position: relative;">
                <button id="positionSwitcherBtn" style="background: #1890FF; border: none; color: white; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                    <span>📋 我的职位 (${positions.length})</span>
                    <span id="switcherArrow">▼</span>
                </button>
                <div id="positionDropdown" style="display: none; position: absolute; top: 45px; right: 0; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 280px; max-height: 400px; overflow-y: auto; z-index: 1000;">
                    ${positions.map(pos => `
                        <div class="position-item" data-id="${pos.id}" data-target="${pos.target}" 
                             style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid #f5f5f5; ${pos.id === currentPosition.id ? 'background: #e6f7ff;' : ''}">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div style="flex: 1;">
                                    <div style="color: #333; font-weight: ${pos.id === currentPosition.id ? 'bold' : 'normal'}; margin-bottom: 4px;">${pos.label}</div>
                                    <div style="font-size: 12px; color: #8c8c8c;">${AdminAuth.getRoleLabel(pos.role)}</div>
                                    ${pos.schoolName ? `<div style="font-size: 11px; color: #bfbfbf; margin-top: 2px;">📍 ${pos.schoolName}</div>` : ''}
                                </div>
                                ${pos.id === currentPosition.id ? '<div style="color: #1890FF; font-size: 20px;">✓</div>' : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 渲染用户菜单
     */
    static renderUserMenu(adminInfo, currentPosition) {
        const identityLabel = AdminAuth.getIdentityLabel(adminInfo);
        
        return `
            <div style="position: relative;">
                <button id="userMenuBtn" style="background: transparent; border: 1px solid #ffffff30; color: white; padding: 8px 15px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 10px; font-size: 14px;">
                    <div style="text-align: right;">
                        <div style="font-weight: bold;">${adminInfo.real_name || adminInfo.username}</div>
                        ${identityLabel ? `<div style="font-size: 11px; color: #8c8c8c;">${identityLabel}</div>` : ''}
                    </div>
                    <span id="userMenuArrow">▼</span>
                </button>
                <div id="userDropdown" style="display: none; position: absolute; top: 45px; right: 0; background: white; border: 1px solid #e5e5e5; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 180px; z-index: 1000;">
                    <div onclick="AdminNavbar.goToProfile()" style="padding: 12px 15px; cursor: pointer; color: #333; border-bottom: 1px solid #f5f5f5;">
                        <span>👤 个人中心</span>
                    </div>
                    <div onclick="AdminNavbar.showSettings()" style="padding: 12px 15px; cursor: pointer; color: #333; border-bottom: 1px solid #f5f5f5;">
                        <span>⚙️ 设置</span>
                    </div>
                    <div onclick="AdminNavbar.logout()" style="padding: 12px 15px; cursor: pointer; color: #ff4d4f;">
                        <span>🚪 退出登录</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定事件
     */
    static bindEvents() {
        // 职位切换器点击事件
        const switcherBtn = document.getElementById('positionSwitcherBtn');
        if (switcherBtn) {
            switcherBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('positionDropdown');
                const arrow = document.getElementById('switcherArrow');
                const isVisible = dropdown.style.display === 'block';
                
                dropdown.style.display = isVisible ? 'none' : 'block';
                arrow.textContent = isVisible ? '▼' : '▲';
                
                // 关闭用户菜单
                document.getElementById('userDropdown').style.display = 'none';
                document.getElementById('userMenuArrow').textContent = '▼';
            });

            // 职位项点击事件
            document.querySelectorAll('.position-item').forEach(item => {
                item.addEventListener('click', function() {
                    const positionId = parseInt(this.dataset.id);
                    const target = this.dataset.target;
                    AdminAuth.switchPosition(positionId, target);
                });

                // 鼠标悬停效果
                item.addEventListener('mouseenter', function() {
                    if (!this.style.background.includes('e6f7ff')) {
                        this.style.backgroundColor = '#f5f5f5';
                    }
                });
                item.addEventListener('mouseleave', function() {
                    if (!this.style.background.includes('e6f7ff')) {
                        this.style.backgroundColor = 'white';
                    }
                });
            });
        }

        // 用户菜单点击事件
        const userMenuBtn = document.getElementById('userMenuBtn');
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('userDropdown');
                const arrow = document.getElementById('userMenuArrow');
                const isVisible = dropdown.style.display === 'block';
                
                dropdown.style.display = isVisible ? 'none' : 'block';
                arrow.textContent = isVisible ? '▼' : '▲';
                
                // 关闭职位切换器
                if (document.getElementById('positionDropdown')) {
                    document.getElementById('positionDropdown').style.display = 'none';
                    document.getElementById('switcherArrow').textContent = '▼';
                }
            });
        }

        // 点击页面其他地方关闭下拉菜单
        document.addEventListener('click', () => {
            if (document.getElementById('positionDropdown')) {
                document.getElementById('positionDropdown').style.display = 'none';
                document.getElementById('switcherArrow').textContent = '▼';
            }
            if (document.getElementById('userDropdown')) {
                document.getElementById('userDropdown').style.display = 'none';
                document.getElementById('userMenuArrow').textContent = '▼';
            }
        });
    }

    /**
     * 去个人中心
     */
    static goToProfile() {
        alert('个人中心功能开发中...');
        // window.location.href = '/main/admin/admin_profile.html';
    }

    /**
     * 显示设置
     */
    static showSettings() {
        alert('设置功能开发中...');
    }

    /**
     * 退出登录
     */
    static logout() {
        if (confirm('确定要退出登录吗？')) {
            AdminAuth.logout();
        }
    }
}

// 自动初始化（如果页面有导航栏容器）
document.addEventListener('DOMContentLoaded', function() {
    // 如果在 iframe 中，跳过自动初始化（避免重复）
    if (window.self !== window.top) {
        return;
    }
    
    const container = document.getElementById('adminNavbar');
    if (container && !container.hasAttribute('data-navbar-initialized')) {
        container.setAttribute('data-navbar-initialized', 'true');
        AdminNavbar.init();
    }
});
