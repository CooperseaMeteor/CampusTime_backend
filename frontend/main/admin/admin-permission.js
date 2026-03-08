/**

 * 管理员权限管理模块

 * 提供角色验证、数据过滤、路由跳转等功能

 * 依赖: config.js

 */



/**

 * 获取当前用户角色

 * @returns {string} 用户角色

 */

function getCurrentRole() {

    // 优先使用管理员职位
    const positionsRaw = localStorage.getItem('adminPositions');
    const activeIdRaw = localStorage.getItem('adminActivePositionId');
    if (positionsRaw && activeIdRaw) {
        try {
            const positions = JSON.parse(positionsRaw);
            const activeId = parseInt(activeIdRaw, 10);
            const active = positions.find(p => p.id === activeId);
            if (active && active.role) return active.role;
        } catch (e) {}
    }

    return localStorage.getItem('userRole') || 'student';

}



/**

 * 获取当前用户所属学校ID

 * @returns {string} 学校ID

 */

function getCurrentSchoolId() {
    const positionsRaw = localStorage.getItem('adminPositions');
    const activeIdRaw = localStorage.getItem('adminActivePositionId');
    if (positionsRaw && activeIdRaw) {
        try {
            const positions = JSON.parse(positionsRaw);
            const activeId = parseInt(activeIdRaw, 10);
            const active = positions.find(p => p.id === activeId);
            if (active && active.schoolId) return String(active.schoolId);
        } catch (e) {}
    }

    return localStorage.getItem('schoolId') || '';

}



/**

 * 获取当前用户所属商户ID

 * @returns {string} 商户ID

 */

function getCurrentMerchantId() {
    const positionsRaw = localStorage.getItem('adminPositions');
    const activeIdRaw = localStorage.getItem('adminActivePositionId');
    if (positionsRaw && activeIdRaw) {
        try {
            const positions = JSON.parse(positionsRaw);
            const activeId = parseInt(activeIdRaw, 10);
            const active = positions.find(p => p.id === activeId);
            if (active && active.merchantNodeId) return String(active.merchantNodeId);
        } catch (e) {}
    }

    return localStorage.getItem('merchantId') || '';

}



/**

 * 获取当前用户所属档口ID

 * @returns {string} 档口ID

 */

function getCurrentStallId() {
    const positionsRaw = localStorage.getItem('adminPositions');
    const activeIdRaw = localStorage.getItem('adminActivePositionId');
    if (positionsRaw && activeIdRaw) {
        try {
            const positions = JSON.parse(positionsRaw);
            const activeId = parseInt(activeIdRaw, 10);
            const active = positions.find(p => p.id === activeId);
            if (active && active.stallId) return String(active.stallId);
        } catch (e) {}
    }

    return localStorage.getItem('stallId') || '';

}



/**

 * 检查用户是否有指定角色或更高权限

 * @param {string} requiredRole - 需要的角色

 * @returns {boolean} 是否有权限

 */

function hasPermission(requiredRole) {

    const currentRole = getCurrentRole();

    

    // 角色权限级别映射

    const roleHierarchy = {

        'student': 0,

        'stall_admin': 1,

        'merchant_admin': 2,

        'school_admin': 3,

        'super_admin': 4,

        'admin': 4

    };

    

    const currentLevel = roleHierarchy[currentRole] || 0;

    const requiredLevel = roleHierarchy[requiredRole] || 0;

    

    return currentLevel >= requiredLevel;

}



/**

 * 检查用户是否可以访问指定页面

 * @param {string} pagePath - 页面路径

 * @returns {boolean} 是否可访问

 */

function canAccessPage(pagePath) {

    const currentRole = getCurrentRole();

    const fileName = pagePath.split('/').pop() || '';

    

    // 检查各角色专属页面

    switch(currentRole) {

        case 'super_admin':

        case 'admin':

            return true; // 超级管理员和旧版管理员可访问所有页面

            

        case 'school_admin':

            // 检查是否是学校管理员可访问的页面

            return ROLE_ROUTES.SCHOOL_ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            ) || ROLE_ROUTES.ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            );

            

        case 'merchant_admin':

            // 检查是否是商户管理员可访问的页面

            return ROLE_ROUTES.MERCHANT_ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            ) || ROLE_ROUTES.ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            );

            

        case 'stall_admin':

            // 检查是否是档口管理员可访问的页面

            return ROLE_ROUTES.STALL_ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            ) || ROLE_ROUTES.ADMIN_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            );

            

        case 'student':

            // 学生只能访问用户页面

            return ROLE_ROUTES.USER_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            );

            

        default:

            return ROLE_ROUTES.PUBLIC_PAGES.some(route => 

                fileName.includes(route) || route.includes(fileName)

            );

    }

}



/**

 * 根据角色过滤数据

 * @param {Array|Object} data - 原始数据

 * @param {string} dataType - 数据类型 (users, merchants, stalls, schools等)

 * @returns {Array|Object} 过滤后的数据

 */

function filterDataByScope(data, dataType) {

    const currentRole = getCurrentRole();

    const schoolId = getCurrentSchoolId();

    const merchantId = getCurrentMerchantId();

    const stallId = getCurrentStallId();

    

    // 超级管理员可以看到所有数据

    if (currentRole === 'super_admin' || currentRole === 'admin') {

        return data;

    }

    

    // 处理数组数据

    if (Array.isArray(data)) {

        return data.filter(item => {

            switch(currentRole) {

                case 'school_admin':

                    // 学校管理员只能看到本校数据

                    return dataType === 'schools' ? true : 

                           (dataType === 'users' ? item.schoolId === schoolId :

                           dataType === 'merchants' ? item.schoolId === schoolId :

                           dataType === 'stalls' ? item.schoolId === schoolId : true);

                           

                case 'merchant_admin':

                    // 商户管理员只能看到自己的数据

                    return dataType === 'users' ? item.merchantId === merchantId :

                           dataType === 'merchants' ? item.id === merchantId :

                           dataType === 'stalls' ? item.merchantId === merchantId : true;

                           

                case 'stall_admin':

                    // 档口管理员只能看到自己的数据

                    return dataType === 'users' ? item.stallId === stallId :

                           dataType === 'merchants' ? item.id === merchantId :

                           dataType === 'stalls' ? item.id === stallId : true;

                           

                default:

                    return true;

            }

        });

    }

    

    // 处理对象数据

    if (typeof data === 'object' && data !== null) {

        // 对于API参数，添加scope过滤条件

        const result = { ...data };

        

        switch(currentRole) {

            case 'school_admin':

                if (schoolId) result.schoolId = schoolId;

                break;

            case 'merchant_admin':

                if (merchantId) result.merchantId = merchantId;

                break;

            case 'stall_admin':

                if (stallId) result.stallId = stallId;

                break;

        }

        

        return result;

    }

    

    return data;

}



/**

 * 获取当前角色可访问的路由列表

 * @returns {Array} 可访问的路由列表

 */

function getAccessibleRoutes() {

    const currentRole = getCurrentRole();

    

    switch(currentRole) {

        case 'super_admin':

            return [

                ...ROLE_ROUTES.ADMIN_PAGES,

                ...ROLE_ROUTES.SUPER_ADMIN_PAGES,

                ...ROLE_ROUTES.SCHOOL_ADMIN_PAGES,

                ...ROLE_ROUTES.MERCHANT_ADMIN_PAGES,

                ...ROLE_ROUTES.STALL_ADMIN_PAGES

            ];

            

        case 'school_admin':

            return [

                ...ROLE_ROUTES.ADMIN_PAGES,

                ...ROLE_ROUTES.SCHOOL_ADMIN_PAGES

            ];

            

        case 'merchant_admin':

            return [

                ...ROLE_ROUTES.ADMIN_PAGES,

                ...ROLE_ROUTES.MERCHANT_ADMIN_PAGES

            ];

            

        case 'stall_admin':

            return [

                ...ROLE_ROUTES.ADMIN_PAGES,

                ...ROLE_ROUTES.STALL_ADMIN_PAGES

            ];

            

        default:

            return ROLE_ROUTES.PUBLIC_PAGES;

    }

}



/**

 * 根据角色跳转到对应的工作台

 */

function redirectToDashboard() {

    const currentRole = getCurrentRole();

    const username = localStorage.getItem('username') || '';

    console.log('redirectToDashboard: currentRole =', currentRole);

    console.log('redirectToDashboard: username =', username);

    

    // 处理后端返回'admin'但实际是特定管理员的情况

    let actualRole = currentRole;

    if (currentRole === 'admin') {

        if (username.includes('超级管理员')) {

            actualRole = 'super_admin';

        } else if (username.includes('学校管理员')) {

            actualRole = 'school_admin';

        } else if (username.includes('商户管理员')) {

            actualRole = 'merchant_admin';

        } else if (username.includes('档口管理员')) {

            actualRole = 'stall_admin';

        }

        console.log('redirectToDashboard: 修正后的角色 =', actualRole);

    }

    

    switch(actualRole) {

        case 'super_admin':

            console.log('跳转到超级管理员首页');

            Router.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminIndex());

            break;

        case 'school_admin':

            console.log('跳转到学校管理员首页');

            Router.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminIndex());

            break;

        case 'merchant_admin':

            console.log('跳转到商户管理员首页');

            Router.navigate(ADMIN_ROUTES.getAbsoluteMerchantAdminIndex());

            break;

        case 'stall_admin':

            console.log('跳转到档口管理员首页');

            Router.navigate(ADMIN_ROUTES.getAbsoluteStallAdminIndex());

            break;

        case 'admin':

            console.log('跳转到旧版管理员首页');

            Router.toAdminIndex();

            break;

        default:

            console.log('跳转到用户首页');

            Router.toUserIndex();

    }

}



/**

 * 检查权限并重定向

 * @param {string} requiredRole - 需要的角色

 * @param {string} redirectUrl - 无权限时重定向的URL

 */

function checkPermissionAndRedirect(requiredRole, redirectUrl) {

    if (!hasPermission(requiredRole)) {

        alert('您没有权限访问此页面');

        if (redirectUrl) {

            Router.navigate(redirectUrl);

        } else {

            redirectToDashboard();

        }

        return false;

    }

    return true;

}



/**

 * 获取角色显示名称

 * @param {string} role - 角色代码

 * @returns {string} 角色显示名称

 */

function getRoleDisplayName(role) {

    const roleNames = {

        'super_admin': '超级管理员',

        'school_admin': '学校管理员',

        'merchant_admin': '商户管理员',

        'stall_admin': '档口管理员',

        'student': '学生',

        'admin': '管理员'

    };

    

    return roleNames[role] || '未知角色';

}



/**

 * 保存登录信息

 * @param {Object} userData - 用户数据

 */

function saveLoginData(userData) {

    const { userRole, schoolId, merchantId, stallId, token, refreshToken, ...otherData } = userData;

    

    // 保存角色信息

    localStorage.setItem('userRole', userRole);

    if (schoolId) localStorage.setItem('schoolId', schoolId);

    if (merchantId) localStorage.setItem('merchantId', merchantId);

    if (stallId) localStorage.setItem('stallId', stallId);

    

    // 保存token

    if (token) localStorage.setItem('token', token);

    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

    

    // 保存其他用户信息

    Object.keys(otherData).forEach(key => {

        if (otherData[key] !== undefined) {

            localStorage.setItem(key, otherData[key]);

        }

    });

}



/**

 * 清除登录信息

 */

function clearLoginData() {

    const keysToRemove = [

        'userRole', 'schoolId', 'merchantId', 'stallId',

        'token', 'refreshToken', 'userId', 'username',

        'realName', 'studentId', 'college', 'major', 'grade', 'phone', 'avatar'

    ];

    

    keysToRemove.forEach(key => {

        localStorage.removeItem(key);

    });

}



// 将权限管理函数添加到全局作用域

window.AdminPermission = {

    getCurrentRole,

    getCurrentSchoolId,

    getCurrentMerchantId,

    getCurrentStallId,

    hasPermission,

    canAccessPage,

    filterDataByScope,

    getAccessibleRoutes,

    redirectToDashboard,

    checkPermissionAndRedirect,

    getRoleDisplayName,

    saveLoginData,

    clearLoginData

};