/**

 * 路由管理工具函数

 * 提供页面导航、权限检查、API调用等功能

 */



(function() {
    if (window.Router) {
        return;
    }

class Router {

    /**

     * 导航到指定页面

     * @param {string} pagePath - 目标页面路径（使用getAbsolute方法）

     * @param {boolean} replace - 是否替换历史记录（默认false）

     */

    static navigate(pagePath, replace = false) {

        if (replace) {

            window.location.replace(pagePath);

        } else {

            window.location.href = pagePath;

        }

    }



    /**

     * 导航到用户首页

     */

    static toUserIndex() {

        this.navigate(USER_ROUTES.getAbsoluteIndex());

    }



    /**

     * 导航到管理员首页

     */

    static toAdminIndex() {

        this.navigate(ADMIN_ROUTES.getAbsoluteIndex());

    }



    /**

     * 导航到超级管理员首页

     */

    static toSuperAdminIndex() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminIndex());

    }



    /**

     * 导航到超级管理员学校管理页面

     */

    static toSuperAdminSchool() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminSchool());

    }



    /**

     * 导航到超级管理员用户管理页面

     */

    static toSuperAdminUsers() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminUsers());

    }



    /**

     * 导航到超级管理员内容审核页面

     */

    static toSuperAdminAudit() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminAudit());

    }



    /**

     * 导航到超级管理员系统设置页面

     */

    static toSuperAdminSettings() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSuperAdminSettings());

    }



    /**

     * 导航到学校管理员首页

     */

    static toSchoolAdminIndex() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminIndex());

    }



    /**

     * 导航到学校管理员商户管理页面

     */

    static toSchoolAdminMerchant() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminMerchant());

    }



    /**

     * 导航到学校管理员内容发布页面

     */

    static toSchoolAdminContent() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminContent());

    }



    /**

     * 导航到学校管理员学生管理页面

     */

    static toSchoolAdminStudents() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminStudents());

    }



    /**

     * 导航到学校管理员数据查看页面

     */

    static toSchoolAdminData() {

        this.navigate(ADMIN_ROUTES.getAbsoluteSchoolAdminData());

    }



    /**

     * 导航到商户管理员首页

     */

    static toMerchantAdminIndex() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantAdminIndex());

    }



    /**

     * 导航到商户管理员档口管理页面

     */

    static toMerchantAdminStalls() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantAdminStalls());

    }



    /**

     * 导航到商户管理员菜品管理页面

     */

    static toMerchantDishManage() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantDishManage());

    }



    /**

     * 导航到商户管理员内容发布页面

     */

    static toMerchantContentPublish() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantContentPublish());

    }



    /**

     * 导航到商户管理员口碑管理页面

     */

    static toMerchantReputationManage() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantReputationManage());

    }



    /**

     * 导航到商户管理员数据分析页面

     */

    static toMerchantDataAnalysis() {

        this.navigate(ADMIN_ROUTES.getAbsoluteMerchantDataAnalysis());

    }



    /**

     * 导航到档口管理员首页

     */

    static toStallAdminIndex() {

        this.navigate(ADMIN_ROUTES.getAbsoluteStallAdminIndex());

    }



    /**

     * 导航到用户登录

     */

    static toUserLogin() {

        this.navigate(LOGIN_ROUTES.getAbsoluteUserLogin());

    }



    /**

     * 导航到管理员登录

     */

    static toAdminLogin() {

        this.navigate(LOGIN_ROUTES.getAbsoluteAdminLogin());

    }



    /**

     * 导航到注册页面

     */

    static toRegister() {

        this.navigate(LOGIN_ROUTES.getAbsoluteRegister());

    }



    /**

     * 导航到用户资料页

     */

    static toUserProfile() {

        this.navigate(USER_ROUTES.getAbsoluteProfile());

    }



    /**

     * 导航到商户详情页

     * @param {number} merchantId - 商户ID

     */

    static toMerchantDetail(merchantId) {

        this.navigate(USER_ROUTES.getAbsoluteMerchantDetail(merchantId));

    }



    /**

     * 导航到档口菜单页

     * @param {number} stallId - 档口ID

     */

    static toStallMenu(stallId) {

        this.navigate(USER_ROUTES.getAbsoluteStallMenu(stallId));

    }



    /**

     * 导航到食堂页面

     */

    static toUserCanteen() {

        this.navigate(USER_ROUTES.getAbsoluteCanteen());

    }



    /**

     * 导航到社区页面

     */

    static toUserCommunity() {

        this.navigate(USER_ROUTES.getAbsoluteCommunity());

    }



    /**

     * 导航到AI助手页面

     */

    static toUserAIAssistant() {

        this.navigate(USER_ROUTES.getAbsoluteAIAssistant());

    }



    /**

     * 导航到饮食档案编辑页面

     */

    static toDietProfileEdit() {

        this.navigate(USER_ROUTES.getAbsoluteDietProfileEdit());

    }



    /**

     * 导航到管理员数据报表页面

     */

    static toAdminDataReport() {

        this.navigate(ADMIN_ROUTES.getAbsoluteDataReport());

    }



    /**

     * 导航到管理员评论管理页面

     */

    static toAdminCommentManage() {

        this.navigate(ADMIN_ROUTES.getAbsoluteCommentManage());

    }



    /**

     * 导航到管理员食堂管理页面

     */

    static toAdminCanteenManage() {

        this.navigate(ADMIN_ROUTES.getAbsoluteCanteenManage());

    }



    /**

     * 导航到管理员内容发布页面

     */

    static toAdminContentPublish() {

        this.navigate(ADMIN_ROUTES.getAbsoluteContentPublish());

    }



    /**

     * 导航到管理员档口工作台页面

     */

    static toAdminStallDashboard() {

        this.navigate(ADMIN_ROUTES.getAbsoluteStallDashboard());

    }



    /**

     * 检查用户是否已登录

     * @returns {boolean}

     */

    static isLoggedIn() {

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) || localStorage.getItem('accessToken');
        return !!token;

    }



    /**

     * 获取当前用户信息

     * @returns {object|null}

     */

    static getCurrentUser() {

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (!token) return null;



        return {

            userId: localStorage.getItem(STORAGE_KEYS.USER_ID),

            username: localStorage.getItem(STORAGE_KEYS.USERNAME),

            role: localStorage.getItem(STORAGE_KEYS.USER_ROLE),

            realName: localStorage.getItem(STORAGE_KEYS.REAL_NAME),

            studentId: localStorage.getItem(STORAGE_KEYS.STUDENT_ID),

            college: localStorage.getItem(STORAGE_KEYS.COLLEGE),

            major: localStorage.getItem(STORAGE_KEYS.MAJOR),

            grade: localStorage.getItem(STORAGE_KEYS.GRADE),

            phone: localStorage.getItem(STORAGE_KEYS.PHONE),

            avatar: localStorage.getItem(STORAGE_KEYS.AVATAR)

        };

    }



    /**

     * 获取当前用户角色

     * @returns {string|null} - 'user', 'admin', 或 null

     */

    static getUserRole() {

        const role = localStorage.getItem(STORAGE_KEYS.USER_ROLE);
        return role ? role.toLowerCase() : null;

    }



    /**

     * 检查用户是否有指定角色

     * @param {string} role - 要检查的角色

     * @returns {boolean}

     */

    static hasRole(role) {

        if (!role) return false;
        return this.getUserRole() === role.toLowerCase();

    }



    /**

     * 保存登录用户信息到本地存储

     * @param {object} userData - 用户数据

     */

    static saveUserData(userData) {
        console.log('saveUserData接收到的数据:', userData);

        if (userData.accessToken) {

            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, userData.accessToken);
            console.log('已保存accessToken到key:', STORAGE_KEYS.ACCESS_TOKEN);

        }

        if (userData.refreshToken) {

            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, userData.refreshToken);

        }

        if (userData.userId) {

            localStorage.setItem(STORAGE_KEYS.USER_ID, userData.userId);
            console.log('已保存userId到key:', STORAGE_KEYS.USER_ID, '值:', userData.userId);

        }

        if (userData.username) {

            localStorage.setItem(STORAGE_KEYS.USERNAME, userData.username);

        }

        if (userData.role) {

            localStorage.setItem(STORAGE_KEYS.USER_ROLE, String(userData.role).toLowerCase());

        } else if (userData.accessToken) {

            localStorage.setItem(STORAGE_KEYS.USER_ROLE, 'user');

        }

        if (userData.realName) {

            localStorage.setItem(STORAGE_KEYS.REAL_NAME, userData.realName);

        }

        if (userData.studentId) {

            localStorage.setItem(STORAGE_KEYS.STUDENT_ID, userData.studentId);

        }

        if (userData.college) {

            localStorage.setItem(STORAGE_KEYS.COLLEGE, userData.college);

        }

        if (userData.major) {

            localStorage.setItem(STORAGE_KEYS.MAJOR, userData.major);

        }

        if (userData.grade) {

            localStorage.setItem(STORAGE_KEYS.GRADE, userData.grade);

        }

        if (userData.phone) {

            localStorage.setItem(STORAGE_KEYS.PHONE, userData.phone);

        }

        if (userData.avatar) {

            localStorage.setItem(STORAGE_KEYS.AVATAR, userData.avatar);

        }

    }



    /**

     * 清除登录用户信息（退出登录）

     */

    static clearUserData() {

        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);

        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);

        localStorage.removeItem(STORAGE_KEYS.USER_ID);

        localStorage.removeItem(STORAGE_KEYS.USERNAME);

        localStorage.removeItem(STORAGE_KEYS.USER_ROLE);

        localStorage.removeItem(STORAGE_KEYS.REAL_NAME);

        localStorage.removeItem(STORAGE_KEYS.STUDENT_ID);

        localStorage.removeItem(STORAGE_KEYS.COLLEGE);

        localStorage.removeItem(STORAGE_KEYS.MAJOR);

        localStorage.removeItem(STORAGE_KEYS.GRADE);

        localStorage.removeItem(STORAGE_KEYS.PHONE);

        localStorage.removeItem(STORAGE_KEYS.AVATAR);

    }



    /**

     * 执行API请求

     * @param {string} endpoint - API端点（来自API_ENDPOINTS）

     * @param {object} options - 请求选项（method, body, headers等）

     * @returns {Promise}

     */

    static async apiCall(endpoint, options = {}) {

        const url = `${CONFIG.API_BASE_URL}${endpoint}`;

        const headers = {

            'Content-Type': 'application/json',

            ...options.headers

        };



        // 如果存在token，添加到请求头

        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        if (token) {

            headers.Authorization = `Bearer ${token}`;

        }



        try {

            const response = await fetch(url, {

                ...options,

                headers

            });

            // 如果Token过期，先尝试刷新，避免后续解析非JSON响应直接抛错

            if (response.status === 401) {

                const refreshed = await this.refreshToken();

                if (refreshed) {

                    return this.apiCall(endpoint, options);

                }

                this.toUserLogin();

                return null;

            }

            // 无内容响应

            if (response.status === 204) {

                return { code: 200, data: null, message: 'No Content' };

            }

            const contentType = (response.headers.get('content-type') || '').toLowerCase();

            if (!contentType.includes('application/json')) {

                const rawText = await response.text();

                const snippet = (rawText || '').slice(0, 200);

                throw new Error(`API ${endpoint} 返回非JSON（HTTP ${response.status}）: ${snippet || '空响应'}`);

            }

            const data = await response.json();

            return data;

        } catch (error) {

            console.error('API请求失败:', error);

            throw error;

        }

    }



    /**

     * 刷新Token

     * @returns {Promise<boolean>}

     */

    static async refreshToken() {

        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) return false;



        try {

            const response = await fetch(`${CONFIG.API_BASE_URL}${API_ENDPOINTS.REFRESH_TOKEN}`, {

                method: 'POST',

                headers: {

                    'Content-Type': 'application/json'

                },

                body: JSON.stringify({ refreshToken })

            });



            if (response.ok) {

                const data = await response.json();

                localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken);

                return true;

            }

            return false;

        } catch (error) {

            console.error('Token刷新失败:', error);

            return false;

        }

    }



    /**

     * 退出登录

     */

    static logout() {

        this.clearUserData();

        this.toUserLogin();

    }



    /**

     * 检查权限并导航（用于需要权限的页面）

     * @param {string} requiredRole - 所需角色（'user' 或 'admin'）

     */

    static checkPermissionAndRedirect(requiredRole) {

        if (!this.isLoggedIn()) {

            alert('请先登录');

            this.toUserLogin();

            return false;

        }



        const userRole = this.getUserRole();

        // 检查用户是否有user角色或requiredRole指定的角色

        if (userRole !== requiredRole && !(requiredRole === 'user' && (userRole === 'user' || userRole === USER_ROLES.STUDENT))) {

            alert('您没有权限访问此页面');

            if (requiredRole === 'admin') {

                this.toAdminLogin();

            } else {

                this.toUserIndex();

            }

            return false;

        }



        return true;

    }

}



// 页面加载时自动检查权限

document.addEventListener('DOMContentLoaded', function() {
    // 如果当前页面在 iframe 中，跳过权限检查（由父页面统一管理）
    if (window.self !== window.top) {
        console.log('🔍 [DEBUG] 页面在iframe中，跳过所有权限检查');
        return;  // 直接返回，不执行任何重定向
    }
    
    // 从URL路径中提取文件名（pathname最后一部分），并去掉查询/哈希
    const rawPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentPage = rawPage.split('?')[0].split('#')[0];

    const userRole = Router.getUserRole();

    // 管理员页面判断（基于路径 + 页面名）
    const isAdminPath = window.location.pathname.includes('/main/admin/');
    
    // 【调试】打印所有相关变量
    console.log('🔍 [DEBUG] 页面检测:', {
        currentPage,
        pathname: window.location.pathname,
        isAdminPath,
        'ROLE_ROUTES.ADMIN_PAGES': ROLE_ROUTES.ADMIN_PAGES,
        '包含在ADMIN_PAGES中': ROLE_ROUTES.ADMIN_PAGES.includes(currentPage),
        '直接匹配admin_shell.html': currentPage === 'admin_shell.html'
    });
    
    const isAdminPage = ROLE_ROUTES.ADMIN_PAGES.includes(currentPage) ||
        ROLE_ROUTES.SUPER_ADMIN_PAGES.includes(currentPage) ||
        ROLE_ROUTES.SCHOOL_ADMIN_PAGES.includes(currentPage) ||
        ROLE_ROUTES.MERCHANT_ADMIN_PAGES.includes(currentPage) ||
        ROLE_ROUTES.STALL_ADMIN_PAGES.includes(currentPage) ||
        currentPage === 'admin_shell.html' ||
        isAdminPath;

    const adminAuthAvailable = typeof window.AdminAuth !== 'undefined';
    const adminToken = localStorage.getItem('adminToken');
    
    // 【调试】打印登录状态
    console.log('🔐 [DEBUG] 登录检测:', {
        adminAuthAvailable,
        'adminToken存在': !!adminToken,
        'adminToken前20字符': adminToken ? adminToken.substring(0, 20) + '...' : 'null'
    });
    
    const adminLoggedIn = !!adminToken || (adminAuthAvailable && AdminAuth.isLoggedIn());
    const isLoggedIn = isAdminPage ? adminLoggedIn : Router.isLoggedIn();
    let activeAdminPosition = null;
    if (isAdminPage) {
        if (adminAuthAvailable) {
            activeAdminPosition = AdminAuth.getActivePosition();
        } else {
            try {
                const positions = JSON.parse(localStorage.getItem('adminPositions') || '[]');
                const activeIdRaw = localStorage.getItem('adminActivePositionId');
                const activeId = activeIdRaw ? parseInt(activeIdRaw, 10) : null;
                activeAdminPosition = positions.find(p => p.id === activeId) || positions[0] || null;
                if (activeAdminPosition && !activeId) {
                    localStorage.setItem('adminActivePositionId', activeAdminPosition.id);
                }
            } catch (e) {
                activeAdminPosition = null;
            }
        }
    }
    const adminRole = activeAdminPosition ? activeAdminPosition.role : null;
    
    // 调试信息
    console.log('权限检查:', { 
        currentPage, 
        userRole, 
        isLoggedIn,
        pathname: window.location.pathname,
        isAdminPage,
        adminToken: !!adminToken,
        adminLoggedIn,
        adminRole
    });

    

    // 检查是否是公开页面

    if (ROLE_ROUTES.PUBLIC_PAGES.includes(currentPage)) {

        return; // 公开页面无需权限验证

    }

    

    // 检查用户是否已登录

    if (isAdminPage) {
        if (!adminLoggedIn) {
            alert('请先登录管理员账号');
            Router.toAdminLogin();
            return;
        }

        if (!adminRole) {
            console.warn('管理员无职位信息，跳转到职位选择页');
            const shellPage = ADMIN_ROUTES.ADMIN_SHELL;
            if (currentPage !== shellPage) {
                Router.navigate(ADMIN_ROUTES.getAbsoluteAdminShell());
                return;
            }
        }
    } else if (!isLoggedIn) {
        alert('请先登录');
        Router.toUserLogin();
        return;
    }

    

    // 检查当前用户是否有权限访问当前页面

    let hasAccess = false;

    
    // 管理员页面使用管理员角色判断
    if (isAdminPage) {
        if (adminLoggedIn && !adminRole) {
            hasAccess = true;
        }
        if (currentPage === ADMIN_ROUTES.ADMIN_SHELL) {
            hasAccess = true;
        }
        if (adminRole === USER_ROLES.SUPER_ADMIN) {
            hasAccess = true;
        } else if (adminRole === USER_ROLES.SCHOOL_ADMIN) {
            hasAccess = ROLE_ROUTES.SCHOOL_ADMIN_PAGES.includes(currentPage) ||
                ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);
        } else if (adminRole === USER_ROLES.MERCHANT_ADMIN) {
            hasAccess = ROLE_ROUTES.MERCHANT_ADMIN_PAGES.includes(currentPage) ||
                ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);
        } else if (adminRole === USER_ROLES.STALL_ADMIN) {
            hasAccess = ROLE_ROUTES.STALL_ADMIN_PAGES.includes(currentPage) ||
                ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);
        }
    }

    // 超级管理员可以访问所有页面
    if (!isAdminPage && userRole === USER_ROLES.SUPER_ADMIN) {

        hasAccess = true;

    }

    // 学校管理员可以访问学校管理员页面和通用管理员页面

    else if (!isAdminPage && userRole === USER_ROLES.SCHOOL_ADMIN) {

        hasAccess = ROLE_ROUTES.SCHOOL_ADMIN_PAGES.includes(currentPage) || 

                   ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);

    }

    // 商户管理员可以访问商户管理员页面和通用管理员页面

    else if (!isAdminPage && userRole === USER_ROLES.MERCHANT_ADMIN) {

        hasAccess = ROLE_ROUTES.MERCHANT_ADMIN_PAGES.includes(currentPage) || 

                   ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);

    }

    // 档口管理员可以访问档口管理员页面和通用管理员页面

    else if (!isAdminPage && userRole === USER_ROLES.STALL_ADMIN) {

        hasAccess = ROLE_ROUTES.STALL_ADMIN_PAGES.includes(currentPage) || 

                   ROLE_ROUTES.ADMIN_PAGES.includes(currentPage);

    }

    // 学生用户可以访问用户页面

    else if (!isAdminPage && userRole === USER_ROLES.STUDENT) {

        hasAccess = ROLE_ROUTES.USER_PAGES.includes(currentPage);

    }

    // 普通用户（user角色）可以访问用户页面

    else if (!isAdminPage && userRole === 'user') {

        hasAccess = ROLE_ROUTES.USER_PAGES.includes(currentPage);


    // 兜底：已登录但角色缺失时，允许访问用户页面
    if (!hasAccess && ROLE_ROUTES.USER_PAGES.includes(currentPage)) {
        hasAccess = true;
    }
    }

    

    // 如果用户是管理员角色（admin），但未匹配以上具体角色，默认可以访问管理员页面

    // 注意：这里的'admin'角色是旧版设计，新版使用具体角色

    if (!isAdminPage && !hasAccess && userRole === 'admin') {

        hasAccess = ROLE_ROUTES.ADMIN_PAGES.includes(currentPage) ||

                   ROLE_ROUTES.SUPER_ADMIN_PAGES.includes(currentPage) ||

                   ROLE_ROUTES.SCHOOL_ADMIN_PAGES.includes(currentPage) ||

                   ROLE_ROUTES.MERCHANT_ADMIN_PAGES.includes(currentPage) ||

                   ROLE_ROUTES.STALL_ADMIN_PAGES.includes(currentPage);

    }

    

    // 如果用户没有权限，跳转到对应的首页

    if (!hasAccess) {

        console.error('权限检查失败详情:', {
            currentPage,
            userRole,
            isLoggedIn,
            hasAccessToken: !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
            USER_PAGES: ROLE_ROUTES.USER_PAGES,
            userInUserPages: ROLE_ROUTES.USER_PAGES.includes(currentPage)
        });

        alert('您没有权限访问此页面');

        switch(userRole) {

            case USER_ROLES.SUPER_ADMIN:

                Router.toSuperAdminIndex();

                break;

            case USER_ROLES.SCHOOL_ADMIN:

                Router.toSchoolAdminIndex();

                break;

            case USER_ROLES.MERCHANT_ADMIN:

                Router.toMerchantAdminIndex();

                break;

            case USER_ROLES.STALL_ADMIN:

                Router.toStallAdminIndex();

                break;

            case USER_ROLES.STUDENT:

            case 'user':
            case 'user':

                Router.toUserIndex();

                break;

            default:

                Router.toUserLogin();

        }

    }

});

window.Router = Router;
})();

