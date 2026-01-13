/**
 * CampusTime 前端路由和API配置文件
 * 作用：集中管理所有页面路径和API地址
 * 修改时只需改这一个文件，所有页面跳转会自动更新
 */

// ==================== 基础配置 ====================
const CONFIG = {
    // API服务器地址
    API_BASE_URL: 'http://39.108.138.4:5000/api',
    
    // 获取当前环境下的页面基础URL
    getBaseUrl() {
        const protocol = window.location.protocol; // http: or https:
        const host = window.location.host; // 39.108.138.4 or localhost
        return `${protocol}//${host}`;
    }
};

// ==================== 登录相关页面 ====================
const LOGIN_ROUTES = {
    // 登录页面（相对路径）
    USER_LOGIN: 'user_login.html',           // 普通用户登录
    ADMIN_LOGIN: 'admin_login.html',         // 管理员登录
    REGISTER: 'register.html',               // 用户注册
    
    // 登录页面绝对路径（用于页面间跳转）
    getAbsoluteUserLogin() {
        return `/login/user_login.html`;
    },
    getAbsoluteAdminLogin() {
        return `/login/admin_login.html`;
    },
    getAbsoluteRegister() {
        return `/login/register.html`;
    }
};

// ==================== 普通用户页面 ====================
const USER_ROUTES = {
    // 页面文件名（相对路径）
    INDEX: 'user_index.html',                // 用户首页
    PROFILE: 'user_profile.html',            // 我的（个人资料）
    CANTEEN: 'user_canteen.html',            // 食堂
    COMMUNITY: 'user_community.html',        // 社区
    MERCHANT_DETAIL: 'merchant_detail.html', // 商户/食堂详情
    STALL_MENU: 'stall_menu.html',          // 档口菜单
    AI_ASSISTANT: 'user_ai_assistant.html',  // AI助手
    POPUP: 'popup_component.html',           // 弹窗组件（不是独立页面）
    LOGIN_MODAL: 'login-modal.html',         // 登录模态框组件
    
    // 绝对路径生成方法
    getAbsoluteIndex() {
        return `/main/user/user_index.html`;
    },
    getAbsoluteProfile() {
        return `/main/user/user_profile.html`;
    },
    getAbsoluteCanteen() {
        return `/main/user/user_canteen.html`;
    },
    getAbsoluteCommunity() {
        return `/main/user/user_community.html`;
    },
    getAbsoluteMerchantDetail(id) {
        return `/main/user/merchant_detail.html${id ? `?id=${id}` : ''}`;
    },
    getAbsoluteStallMenu(stallId) {
        return `/main/user/stall_menu.html${stallId ? `?id=${stallId}` : ''}`;
    },
    getAbsoluteAIAssistant() {
        return `/main/user/user_ai_assistant.html`;
    }
};

// ==================== 管理员页面 ====================
const ADMIN_ROUTES = {
    // 页面文件名
    INDEX: 'admin_index.html',               // 管理员首页
    CANTEEN_MANAGE: 'canteen_manage.html',   // 食堂管理
    STALL_DASHBOARD: 'stall_dashboard.html', // 档口工作台
    COMMENT_MANAGE: 'comment_manage.html',   // 评论管理
    CONTENT_PUBLISH: 'content_publish.html', // 内容发布
    DATA_REPORT: 'data_report.html',         // 数据报表
    NAVBAR: 'navbar.js',                     // 导航栏脚本（非页面）
    
    // 绝对路径生成方法
    getAbsoluteIndex() {
        return `/main/admin/admin_index.html`;
    },
    getAbsoluteCanteenManage() {
        return `/main/admin/canteen_manage.html`;
    },
    getAbsoluteStallDashboard() {
        return `/main/admin/stall_dashboard.html`;
    },
    getAbsoluteCommentManage() {
        return `/main/admin/comment_manage.html`;
    },
    getAbsoluteContentPublish() {
        return `/main/admin/content_publish.html`;
    },
    getAbsoluteDataReport() {
        return `/main/admin/data_report.html`;
    }
};

// ==================== API端点 ====================
const API_ENDPOINTS = {
    // 认证
    LOGIN: '/login',
    REGISTER: '/register',
    REFRESH_TOKEN: '/refresh-token',
    LOGOUT: '/logout',
    
    // 商户相关
    MERCHANTS: '/merchants',
    MERCHANT_DETAIL: (id) => `/merchants/${id}`,
    MERCHANT_STALLS: (id) => `/merchants/${id}/stalls`,
    
    // 档口相关
    STALLS: '/stalls',
    STALL_DETAIL: (id) => `/stalls/${id}`,
    STALL_DISHES: (id) => `/stalls/${id}/dishes`,
    
    // 菜品相关
    DISHES: '/dishes',
    DISH_DETAIL: (id) => `/dishes/${id}`,
    
    // 评价相关
    REVIEWS: '/reviews',
    REVIEW_DETAIL: (id) => `/reviews/${id}`,
    
    // 用户相关
    USERS: '/users',
    USER_PROFILE: '/users/profile',
    
    // 测试端点
    PING: '/ping',
    HEALTH: '/health'
};

// ==================== 存储键值 ====================
const STORAGE_KEYS = {
    // Token相关
    ACCESS_TOKEN: 'token',
    REFRESH_TOKEN: 'refreshToken',
    
    // 用户信息
    USER_ID: 'userId',
    USERNAME: 'username',
    USER_ROLE: 'userRole',
    
    // 用户详细信息
    REAL_NAME: 'realName',
    STUDENT_ID: 'studentId',
    COLLEGE: 'college',
    MAJOR: 'major',
    GRADE: 'grade',
    PHONE: 'phone',
    AVATAR: 'avatar'
};

// ==================== 页面角色权限 ====================
const ROLE_ROUTES = {
    // 需要用户角色的页面
    USER_PAGES: [
        USER_ROUTES.INDEX,
        USER_ROUTES.PROFILE,
        USER_ROUTES.CANTEEN,
        USER_ROUTES.COMMUNITY,
        USER_ROUTES.MERCHANT_DETAIL,
        USER_ROUTES.STALL_MENU,
        USER_ROUTES.AI_ASSISTANT
    ],
    
    // 需要管理员角色的页面
    ADMIN_PAGES: [
        ADMIN_ROUTES.INDEX,
        ADMIN_ROUTES.CANTEEN_MANAGE,
        ADMIN_ROUTES.STALL_DASHBOARD,
        ADMIN_ROUTES.COMMENT_MANAGE,
        ADMIN_ROUTES.CONTENT_PUBLISH,
        ADMIN_ROUTES.DATA_REPORT
    ],
    
    // 公开页面（无需认证）
    PUBLIC_PAGES: [
        LOGIN_ROUTES.USER_LOGIN,
        LOGIN_ROUTES.ADMIN_LOGIN,
        LOGIN_ROUTES.REGISTER
    ]
};

// ==================== 导出配置 ====================
// 在HTML中可以通过 <script src="config.js"></script> 引入后使用
// 例如：window.location.href = USER_ROUTES.getAbsoluteIndex();
