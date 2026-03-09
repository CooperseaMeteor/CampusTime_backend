/**

 * CampusTime 前端路由和API配置文件

 * 作用：集中管理所有页面路径和API地址

 * 修改时只需改这一个文件，所有页面跳转会自动更新

 */



// ==================== 基础配置 ====================

var CONFIG = window.CONFIG || {

    // API服务器地址 - 动态获取，根据当前访问的域名
    get API_BASE_URL() {
        return `${window.location.origin}/api`;
    },

    // AppFlow iframe URL for AI assistant page (方式2：集中配置)
    // 将下面地址替换为你在 AppFlow 控制台复制的完整 iframe src 链接。
    APPFLOW_IFRAME_URL: 'https://1494565958858265.appflow.aliyunnest.com/webhook/home/b271bff17a8e26770ccc9d5bc88f6eb574a665e200dfa341439ec336417492e29c9303cb47118866f0/index',

    

    // 获取当前环境下的页面基础URL（保持根路径，避免重复追加子目录导致404）

    getBaseUrl() {

        return window.location.origin;

    }

};
window.CONFIG = CONFIG;



// ==================== 登录相关页面 ====================

var LOGIN_ROUTES = window.LOGIN_ROUTES || {

    // 登录页面（相对路径）

    USER_LOGIN: 'user_login.html',           // 普通用户登录

    ADMIN_LOGIN: 'admin_login.html',         // 管理员登录

    REGISTER: 'register.html',               // 用户注册

    

    // 登录页面绝对路径（用于页面间跳转）

    getAbsoluteUserLogin() {

        return `${CONFIG.getBaseUrl()}/login/user_login.html`;

    },

    getAbsoluteAdminLogin() {

        return `${CONFIG.getBaseUrl()}/login/admin_login.html`;

    },

    getAbsoluteRegister() {

        return `${CONFIG.getBaseUrl()}/login/register.html`;

    }

};
window.LOGIN_ROUTES = LOGIN_ROUTES;



// ==================== 普通用户页面 ====================

var USER_ROUTES = window.USER_ROUTES || {

    // 页面文件名（相对路径）

    SHELL: 'user_shell.html',                // 用户首页容器（支持无登录浏览）

    INDEX: 'user_index.html',                // 用户首页

    PROFILE: 'user_profile.html',            // 我的（个人资料）

    CANTEEN: 'user_canteen.html',            // 食堂

    COMMUNITY: 'user_community.html',        // 社区

    MERCHANT_DETAIL: 'merchant_detail.html', // 商户/食堂详情

    STALL_MENU: 'stall_menu.html',          // 档口菜单

    AI_ASSISTANT: 'user_ai_assistant.html',  // AI助手

    DIET_PROFILE_EDIT: 'user_diet_profile_edit.html', // 饮食档案编辑

    POPUP: 'popup_component.html',           // 弹窗组件（不是独立页面）

    LOGIN_MODAL: 'login-modal.html',         // 登录模态框组件

    

    // 绝对路径生成方法

    getAbsoluteIndex() {

        return `${CONFIG.getBaseUrl()}/main/user/user_shell.html`;

    },

    getAbsoluteProfile() {

        return `${CONFIG.getBaseUrl()}/main/user/user_profile.html`;

    },

    getAbsoluteCanteen() {

        return `${CONFIG.getBaseUrl()}/main/user/user_canteen.html`;

    },

    getAbsoluteCommunity() {

        return `${CONFIG.getBaseUrl()}/main/user/user_community.html`;

    },

    getAbsoluteMerchantDetail(id) {

        return `${CONFIG.getBaseUrl()}/main/user/merchant_detail.html${id ? `?id=${id}` : ''}`;

    },

    getAbsoluteStallMenu(stallId) {

        return `${CONFIG.getBaseUrl()}/main/user/stall_menu.html${stallId ? `?id=${stallId}` : ''}`;

    },

    getAbsoluteAIAssistant() {

        return `${CONFIG.getBaseUrl()}/main/user/user_ai_assistant.html`;

    },



    getAbsoluteDietProfileEdit() {

        return `${CONFIG.getBaseUrl()}/main/user/user_diet_profile_edit.html`;

    }

};
window.USER_ROUTES = USER_ROUTES;



// ==================== 管理员页面 ====================

var ADMIN_ROUTES = window.ADMIN_ROUTES || {

    // 页面文件名

    INDEX: 'super_admin_index.html',               // 管理员首页（默认指向超级管理员）

    CANTEEN_MANAGE: 'canteen_manage.html',   // 食堂管理

    STALL_DASHBOARD: 'stall_dashboard.html', // 档口工作台

    COMMENT_MANAGE: 'comment_manage.html',   // 评论管理

    CONTENT_PUBLISH: 'content_publish.html', // 内容发布

    DATA_REPORT: 'data_report.html',         // 数据报表

    NAVBAR: 'navbar.js',                     // 导航栏脚本（非页面）

    ADMIN_SHELL: 'admin_shell.html',         // 通用管理员入口（职位切换）

    

    // 各管理员角色首页文件名

    SUPER_ADMIN_INDEX: 'super_admin_index.html',       // 超级管理员首页

    SUPER_ADMIN_SCHOOLS: 'super_admin_school.html',   // 学校管理

    SUPER_ADMIN_USERS: 'super_admin_users.html',       // 用户管理

    SUPER_ADMIN_AUDIT: 'super_admin_audit.html',   // 内容审核

    SUPER_ADMIN_SETTINGS: 'super_admin_settings.html', // 系统设置

    

    SCHOOL_ADMIN_INDEX: 'school_admin_index.html',     // 学校管理员首页

    SCHOOL_ADMIN_MERCHANT: 'school_admin_merchant.html', // 商户管理

    SCHOOL_ADMIN_CONTENT: 'school_admin_content.html',      // 内容发布

    SCHOOL_ADMIN_STUDENTS: 'school_admin_students.html',     // 学生管理

    SCHOOL_ADMIN_DATA: 'school_admin_data.html',          // 数据查看

    

    MERCHANT_ADMIN_INDEX: 'merchant_admin_index.html',        // 商户管理员首页

    MERCHANT_ADMIN_STALLS: 'stall_dashboard.html',  // 档口管理（使用现有档口工作台）

    

    STALL_ADMIN_INDEX: 'stall_dashboard.html',         // 档口管理员首页

    

    // 绝对路径生成方法

    getAbsoluteIndex() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_index.html`;

    },

    getAbsoluteCanteenManage() {

        return `${CONFIG.getBaseUrl()}/main/admin/canteen_manage.html`;

    },

    getAbsoluteStallDashboard() {

        return `${CONFIG.getBaseUrl()}/main/admin/stall_dashboard.html`;

    },

    getAbsoluteCommentManage() {

        return `${CONFIG.getBaseUrl()}/main/admin/comment_manage.html`;

    },

    getAbsoluteContentPublish() {

        return `${CONFIG.getBaseUrl()}/main/admin/content_publish.html`;

    },

    getAbsoluteDataReport() {

        return `${CONFIG.getBaseUrl()}/main/admin/data_report.html`;

    },

    getAbsoluteAdminShell() {

        return `${CONFIG.getBaseUrl()}/main/admin/admin_shell.html`;

    },



    // 超级管理员特定路由

    getAbsoluteSuperAdminIndex() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_index.html`;

    },

    getAbsoluteSuperAdminSchool() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_school.html`;

    },

    getAbsoluteSuperAdminUsers() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_users.html`;

    },

    getAbsoluteSuperAdminAudit() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_audit.html`;

    },

    getAbsoluteSuperAdminSettings() {

        return `${CONFIG.getBaseUrl()}/main/admin/super_admin_settings.html`;

    },



    // 学校管理员特定路由

    getAbsoluteSchoolAdminIndex() {

        return `${CONFIG.getBaseUrl()}/main/admin/school_admin_index.html`;

    },

    getAbsoluteSchoolAdminContent() {

        return `${CONFIG.getBaseUrl()}/main/admin/school_admin_content.html`;

    },

    getAbsoluteSchoolAdminStudents() {

        return `${CONFIG.getBaseUrl()}/main/admin/school_admin_students.html`;

    },

    getAbsoluteSchoolAdminMerchant() {

        return `${CONFIG.getBaseUrl()}/main/admin/school_admin_merchant.html`;

    },

    getAbsoluteSchoolAdminData() {

        return `${CONFIG.getBaseUrl()}/main/admin/school_admin_data.html`;

    },



    // 商户管理员特定路由

    getAbsoluteMerchantAdminIndex() {

        return `${CONFIG.getBaseUrl()}/main/admin/merchant_admin_index.html`;

    },

    getAbsoluteMerchantAdminStalls() {

        return `${CONFIG.getBaseUrl()}/main/admin/stall_dashboard.html`;

    },



    // 档口管理员特定路由

    getAbsoluteStallAdminIndex() {

        return `${CONFIG.getBaseUrl()}/main/admin/stall_dashboard.html`;

    }

};
window.ADMIN_ROUTES = ADMIN_ROUTES;



// ==================== API端点 ====================

var API_ENDPOINTS = window.API_ENDPOINTS || {

    // 认证
    LOGIN: '/login',
    ADMIN_LOGIN: '/admin/login',
    REGISTER: '/register',
    REFRESH_TOKEN: '/refresh',
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

    USER_PROFILE: '/user',

    

    // ==================== 管理员API端点 ====================

    // 数据统计

    ADMIN_DASHBOARD: '/admin/dashboard',

    ADMIN_STATS_TODAY: '/admin/stats/today',

    ADMIN_STATS_PERIOD: '/admin/stats/period',

    

    // 食堂管理

    ADMIN_CANTEENS: '/admin/canteens',

    ADMIN_CANTEEN_DETAIL: (id) => `/admin/canteens/${id}`,

    ADMIN_CANTEEN_CREATE: '/admin/canteens',

    ADMIN_CANTEEN_UPDATE: (id) => `/admin/canteens/${id}`,

    ADMIN_CANTEEN_DELETE: (id) => `/admin/canteens/${id}`,

    ADMIN_CANTEEN_STATUS: (id) => `/admin/canteens/${id}/status`,

    

    // 档口管理

    ADMIN_STALLS: '/admin/stalls',

    ADMIN_STALL_DETAIL: (id) => `/admin/stalls/${id}`,

    ADMIN_STALL_CREATE: '/admin/stalls',

    ADMIN_STALL_UPDATE: (id) => `/admin/stalls/${id}`,

    ADMIN_STALL_DELETE: (id) => `/admin/stalls/${id}`,

    

    // 菜品管理

    ADMIN_DISHES: '/admin/dishes',

    ADMIN_DISH_DETAIL: (id) => `/admin/dishes/${id}`,

    ADMIN_DISH_CREATE: '/admin/dishes',

    ADMIN_DISH_UPDATE: (id) => `/admin/dishes/${id}`,

    ADMIN_DISH_DELETE: (id) => `/admin/dishes/${id}`,

    ADMIN_DISH_BATCH: '/admin/dishes/batch',

    

    // 评论管理

    ADMIN_REVIEWS: '/admin/reviews',

    ADMIN_REVIEW_DETAIL: (id) => `/admin/reviews/${id}`,

    ADMIN_REVIEW_APPROVE: (id) => `/admin/reviews/${id}/approve`,

    ADMIN_REVIEW_REJECT: (id) => `/admin/reviews/${id}/reject`,

    ADMIN_REVIEW_DELETE: (id) => `/admin/reviews/${id}`,

    ADMIN_REVIEWS_PENDING: '/admin/reviews/pending',

    

    // 内容发布

    ADMIN_ANNOUNCEMENTS: '/admin/announcements',

    ADMIN_ANNOUNCEMENT_DETAIL: (id) => `/admin/announcements/${id}`,

    ADMIN_ANNOUNCEMENT_CREATE: '/admin/announcements',

    ADMIN_ANNOUNCEMENT_UPDATE: (id) => `/admin/announcements/${id}`,

    ADMIN_ANNOUNCEMENT_DELETE: (id) => `/admin/announcements/${id}`,

    ADMIN_ANNOUNCEMENT_PIN: (id) => `/admin/announcements/${id}/pin`,

    

    // 用户管理

    ADMIN_USERS: '/admin/users',

    ADMIN_USER_DETAIL: (id) => `/admin/users/${id}`,

    ADMIN_USER_UPDATE: (id) => `/admin/users/${id}`,

    ADMIN_USER_DELETE: (id) => `/admin/users/${id}`,

    ADMIN_USER_STATUS: (id) => `/admin/users/${id}/status`,

    

    // 数据报表

    ADMIN_REPORTS_VISITORS: '/admin/reports/visitors',

    ADMIN_REPORTS_DISHES: '/admin/reports/dishes',

    ADMIN_REPORTS_CANTEENS: '/admin/reports/canteens',

    ADMIN_REPORTS_REVIEWS: '/admin/reports/reviews',

    ADMIN_REPORTS_EXPORT: '/admin/reports/export',

    

    // 批量操作

    ADMIN_BATCH_IMPORT: '/admin/batch/import',

    ADMIN_BATCH_EXPORT: '/admin/batch/export',

    ADMIN_BATCH_UPDATE: '/admin/batch/update',

    

    // 任务管理

    ADMIN_TASKS: '/admin/tasks',

    ADMIN_TASK_DETAIL: (id) => `/admin/tasks/${id}`,

    ADMIN_TASK_COMPLETE: (id) => `/admin/tasks/${id}/complete`,

    ADMIN_TASK_DELETE: (id) => `/admin/tasks/${id}`,

    

    // 系统设置

    ADMIN_SETTINGS: '/admin/settings',

    ADMIN_SETTING_UPDATE: '/admin/settings',

    

    // 测试端点

    PING: '/ping',

    HEALTH: '/health'

};
window.API_ENDPOINTS = API_ENDPOINTS;



// ==================== 存储键值 ====================

var STORAGE_KEYS = window.STORAGE_KEYS || {

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
window.STORAGE_KEYS = STORAGE_KEYS;



// ==================== 用户角色常量 ====================

var USER_ROLES = window.USER_ROLES || {

    SUPER_ADMIN: 'super_admin',

    SCHOOL_ADMIN: 'school_admin',

    MERCHANT_ADMIN: 'merchant_admin',

    STALL_ADMIN: 'stall_admin',

    STUDENT: 'student',

    USER: 'user'

};
window.USER_ROLES = USER_ROLES;



// ==================== 页面角色权限 ====================

var ROLE_ROUTES = window.ROLE_ROUTES || {

    // 需要用户角色的页面

    USER_PAGES: [

        USER_ROUTES.INDEX,

        USER_ROUTES.PROFILE,

        USER_ROUTES.CANTEEN,

        USER_ROUTES.COMMUNITY,

        USER_ROUTES.MERCHANT_DETAIL,

        USER_ROUTES.STALL_MENU,

        USER_ROUTES.AI_ASSISTANT,

        USER_ROUTES.DIET_PROFILE_EDIT

    ],

    

    // 需要管理员角色的页面（通用管理页面）

    ADMIN_PAGES: [

        ADMIN_ROUTES.ADMIN_SHELL,

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

        LOGIN_ROUTES.REGISTER,

        USER_ROUTES.SHELL,     // user_shell.html - 允许无登录浏览
        
        USER_ROUTES.INDEX      // user_index.html - 允许无登录浏览内容

    ],



    // 超级管理员专属页面

    SUPER_ADMIN_PAGES: [

        ADMIN_ROUTES.SUPER_ADMIN_INDEX,

        ADMIN_ROUTES.SUPER_ADMIN_SCHOOLS,

        ADMIN_ROUTES.SUPER_ADMIN_USERS,

        ADMIN_ROUTES.SUPER_ADMIN_AUDIT,

        ADMIN_ROUTES.SUPER_ADMIN_SETTINGS

    ],



    // 学校管理员专属页面

    SCHOOL_ADMIN_PAGES: [

        ADMIN_ROUTES.SCHOOL_ADMIN_INDEX,

        ADMIN_ROUTES.SCHOOL_ADMIN_MERCHANT,

        ADMIN_ROUTES.SCHOOL_ADMIN_CONTENT,

        ADMIN_ROUTES.SCHOOL_ADMIN_STUDENTS,

        ADMIN_ROUTES.SCHOOL_ADMIN_DATA

    ],



    // 商户管理员专属页面

    MERCHANT_ADMIN_PAGES: [

        ADMIN_ROUTES.MERCHANT_ADMIN_INDEX,

        ADMIN_ROUTES.MERCHANT_ADMIN_STALLS

    ],



    // 档口管理员专属页面

    STALL_ADMIN_PAGES: [

        ADMIN_ROUTES.STALL_ADMIN_INDEX

    ]

};
window.ROLE_ROUTES = ROLE_ROUTES;



// ==================== 导出配置 ====================

// 在HTML中可以通过 <script src="config.js"></script> 引入后使用

// 例如：window.location.href = USER_ROUTES.getAbsoluteIndex();

