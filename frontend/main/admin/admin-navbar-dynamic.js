/**

 * 动态导航栏组件

 * 根据用户角色动态生成导航菜单

 * 依赖: config.js, admin-permission.js

 */



// 导航菜单配置
const NAV_MENUS = {
    [USER_ROLES.SCHOOL_ADMIN]: [
        { name: '控制台', icon: 'tachometer-alt', route: 'SCHOOL_ADMIN.INDEX' },
        { name: '商户管理', icon: 'store', route: 'SCHOOL_ADMIN.MERCHANT_MANAGE' },
        { name: '内容发布', icon: 'bullhorn', route: 'SCHOOL_ADMIN.CONTENT_PUBLISH' },
        { name: '学生管理', icon: 'user-graduate', route: 'SCHOOL_ADMIN.STUDENT_MANAGE' },
        { name: '数据查看', icon: 'chart-line', route: 'SCHOOL_ADMIN.DATA_VIEW' }
    ],
    [USER_ROLES.MERCHANT_ADMIN]: [
        { name: '控制台', icon: 'tachometer-alt', route: 'MERCHANT_ADMIN.INDEX' },
        { name: '档口管理', icon: 'utensils', route: 'MERCHANT_ADMIN.STALL_MANAGE' },
        { name: '菜品管理', icon: 'hamburger', route: 'MERCHANT_ADMIN.DISH_MANAGE' },
        { name: '宣传管理', icon: 'camera', route: 'MERCHANT_ADMIN.PROMOTION_MANAGE' },
        { name: '评价回复', icon: 'comments', route: 'MERCHANT_ADMIN.REVIEW_REPLY' }
    ]
};



/**

 * 生成导航栏HTML

 * @param {string} currentPage - 当前页面文件名

 * @returns {string} 导航栏HTML

 */

function generateNavbarHTML(currentPage) {

    const currentRole = window.AdminPermission ? window.AdminPermission.getCurrentRole() : 'student';

    const menuItems = NAV_MENUS[currentRole] || [];

    

    // 生成导航标签HTML

    const navTabsHTML = menuItems.map(item => {

        const routeParts = item.route.split('.');

        let routeURL = '';

        

        // 根据路由配置生成URL

        if (routeParts.length === 2) {

            const category = routeParts[0];

            const routeName = routeParts[1];

            if (ADMIN_ROUTES[category] && ADMIN_ROUTES[category][routeName]) {

                // 检查是否有对应的getAbsolute方法

                const methodName = `getAbsolute${category.charAt(0).toUpperCase() + category.slice(1)}${routeName.charAt(0).toUpperCase() + routeName.slice(1)}`;

                if (typeof ADMIN_ROUTES[methodName] === 'function') {

                    routeURL = ADMIN_ROUTES[methodName]();

                }

            }

        }

        

        // 检查当前页面是否匹配

        const isActive = currentPage.includes(item.route.toLowerCase()) || 

                       (routeURL && currentPage.includes(routeURL.split('/').pop()));

        

        return `

            <a class="nav-tab ${isActive ? 'active' : ''}" 

               href="javascript:void(0)" 

               onclick="Router.navigate('${routeURL}')">

                <i class="fas fa-${item.icon}"></i> ${item.name}

            </a>

        `;

    }).join('');

    

    // 获取角色显示名称

    const roleDisplayName = window.AdminPermission ? 

        window.AdminPermission.getRoleDisplayName(currentRole) : '访客';

    

    return `

        <div class="nav-tabs">

            ${navTabsHTML}

        </div>

    `;

}



/**

 * 更新导航栏

 * @param {string} currentPage - 当前页面文件名

 */

function updateNavbar(currentPage) {

    const navContainer = document.querySelector('.nav-tabs');

    if (navContainer) {

        navContainer.innerHTML = generateNavbarHTML(currentPage);

    }

}



/**

 * 初始化动态导航栏

 */

function initDynamicNavbar() {

    // 如果在 iframe 中，跳过初始化

    if (window.self !== window.top) {

        return;

    }

    

    // 防止重复初始化

    if (window.__navbarDynamicInitialized) {

        return;

    }

    window.__navbarDynamicInitialized = true;

    

    // 等待DOM加载完成

    if (document.readyState === 'loading') {

        document.addEventListener('DOMContentLoaded', function() {

            updateTopNavUserInfo();

        });

    } else {

        updateTopNavUserInfo();

    }

}



/**

 * 更新顶部导航栏用户信息

 */

function updateTopNavUserInfo() {

    const navRight = document.querySelector('.nav-right');

    if (!navRight) return;

    

    const currentRole = window.AdminPermission ? window.AdminPermission.getCurrentRole() : 'student';

    const roleDisplayName = window.AdminPermission ? 

        window.AdminPermission.getRoleDisplayName(currentRole) : '访客';

    

    // 获取用户信息

    const username = localStorage.getItem('username') || '管理员';

    const realName = localStorage.getItem('realName') || '';

    

    // 构建用户信息HTML

    let userInfoHTML = `<div class="nav-item">

        <i class="fas fa-user-circle"></i> ${roleDisplayName}: ${realName || username}

    </div>`;

    

    // 为管理员添加校区切换（超级管理员）或退出按钮

    if (currentRole !== 'student') {

        userInfoHTML += `

            <div class="nav-item" onclick="showUserMenu()" style="cursor: pointer;">

                <i class="fas fa-chevron-down"></i>

            </div>

        `;

    }

    

    navRight.innerHTML = userInfoHTML;

}



/**

 * 显示用户菜单（校区切换、退出等）

 */

function showUserMenu() {

    const currentRole = window.AdminPermission ? window.AdminPermission.getCurrentRole() : 'student';
    const positions = (() => {
        try {
            return JSON.parse(localStorage.getItem('adminPositions') || '[]');
        } catch (e) {
            return [];
        }
    })();
    const activeIdRaw = localStorage.getItem('adminActivePositionId');
    const activeId = activeIdRaw ? parseInt(activeIdRaw, 10) : null;

    // 创建菜单内容
    let menuContent = '';

    if (positions.length > 0) {
        menuContent += `<div class="user-menu-group">我的职位</div>`;
        menuContent += positions.map(pos => {
            const active = pos.id === activeId;
            const label = pos.label || pos.role || pos.id;
            const action = pos.target
                ? `window.AdminAuth ? AdminAuth.switchPosition(${pos.id}, '${pos.target}') : (localStorage.setItem('adminActivePositionId', ${pos.id}), window.location.href='${pos.target}')`
                : `window.AdminAuth ? AdminAuth.switchPosition(${pos.id}) : (localStorage.setItem('adminActivePositionId', ${pos.id}), window.location.reload())`;
            return `
                <div class="user-menu-item" onclick="${action}">
                    <i class="fas fa-briefcase"></i> ${label}
                    ${active ? '<span style="color:#52c41a; margin-left:auto;">当前</span>' : ''}
                </div>
            `;
        }).join('');
    }

    menuContent += `
        <div class="user-menu-item" onclick="Router.toUserIndex()">
            <i class="fas fa-user"></i> 切换到学生界面
        </div>
    `;

    if (currentRole === USER_ROLES.SUPER_ADMIN) {
        menuContent += `
            <div class="user-menu-item" onclick="switchSchool()">
                <i class="fas fa-exchange-alt"></i> 切换校区
            </div>
        `;
    }

    menuContent += `
        <div class="user-menu-item" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i> 退出登录
        </div>
    `;

    

    // 创建菜单容器

    const menuContainer = document.createElement('div');

    menuContainer.className = 'user-menu';

    menuContainer.innerHTML = menuContent;

    

    // 添加样式

    const menuStyle = document.createElement('style');

    menuStyle.textContent = `

        .user-menu {

            position: absolute;

            top: 100%;

            right: 0;

            background-color: white;

            border: 1px solid var(--border-color);

            border-radius: var(--border-radius);

            box-shadow: var(--shadow-card);

            z-index: 1001;

            min-width: 180px;

        }

        

        .user-menu-item {

            padding: 10px 15px;

            display: flex;

            align-items: center;

            gap: 8px;

            cursor: pointer;

            transition: background-color 0.3s;

        }

        

        .user-menu-item:hover {

            background-color: var(--bg-gray);

        }

        

        .user-menu-item i {

            width: 16px;

            text-align: center;

        }

        .user-menu-group {
            padding: 8px 15px;
            font-size: 12px;
            color: var(--text-light);
            border-bottom: 1px solid var(--border-color);
        }

    `;

    document.head.appendChild(menuStyle);

    

    // 显示菜单

    const existingMenu = document.querySelector('.user-menu');

    if (existingMenu) {

        existingMenu.remove();

    }

    

    const navRight = document.querySelector('.nav-right');

    if (navRight) {

        navRight.style.position = 'relative';

        navRight.appendChild(menuContainer);

        

        // 点击其他地方关闭菜单

        document.addEventListener('click', function closeMenu(e) {

            if (!navRight.contains(e.target)) {

                const menu = document.querySelector('.user-menu');

                if (menu) menu.remove();

                document.removeEventListener('click', closeMenu);

            }

        });

    }

}



/**

 * 切换校区（超级管理员功能）

 */

function switchSchool() {

    // 这里可以实现校区切换逻辑

    alert('校区切换功能开发中...');

    showUserMenu(); // 关闭菜单

}



/**

 * 退出登录

 */

function logout() {

    if (confirm('确定要退出登录吗？')) {

        if (window.AdminPermission && window.AdminPermission.clearLoginData) {

            window.AdminPermission.clearLoginData();

        } else {

            // 兼容性处理

            localStorage.clear();

        }

        

        // 跳转到登录页

        Router.toAdminLogin();

    }

}



// 将动态导航栏功能添加到全局作用域

window.DynamicNavbar = {

    generateNavbarHTML,

    updateNavbar,

    initDynamicNavbar,

    updateTopNavUserInfo,

    showUserMenu,

    switchSchool,

    logout

};



// 自动初始化

initDynamicNavbar();