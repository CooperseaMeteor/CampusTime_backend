/**
 * 路由管理工具函数
 * 提供页面导航、权限检查、API调用等功能
 */

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
     * 检查用户是否已登录
     * @returns {boolean}
     */
    static isLoggedIn() {
        return !!localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
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
        return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    }

    /**
     * 检查用户是否有指定角色
     * @param {string} role - 要检查的角色
     * @returns {boolean}
     */
    static hasRole(role) {
        return this.getUserRole() === role;
    }

    /**
     * 保存登录用户信息到本地存储
     * @param {object} userData - 用户数据
     */
    static saveUserData(userData) {
        if (userData.accessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, userData.accessToken);
        }
        if (userData.refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, userData.refreshToken);
        }
        if (userData.userId) {
            localStorage.setItem(STORAGE_KEYS.USER_ID, userData.userId);
        }
        if (userData.username) {
            localStorage.setItem(STORAGE_KEYS.USERNAME, userData.username);
        }
        if (userData.role) {
            localStorage.setItem(STORAGE_KEYS.USER_ROLE, userData.role);
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

            const data = await response.json();

            // 如果Token过期，尝试刷新
            if (response.status === 401) {
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // 递归重试请求
                    return this.apiCall(endpoint, options);
                } else {
                    // 刷新失败，跳转到登录
                    this.toUserLogin();
                    return null;
                }
            }

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
        if (userRole !== requiredRole) {
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
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // 检查是否需要权限验证
    if (ROLE_ROUTES.ADMIN_PAGES.includes(currentPage)) {
        if (!Router.hasRole('admin')) {
            Router.toAdminLogin();
        }
    } else if (ROLE_ROUTES.USER_PAGES.includes(currentPage)) {
        if (!Router.hasRole('user')) {
            Router.toUserLogin();
        }
    }
});
