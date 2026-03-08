// 导航栏管理器 - 统一处理登录状态显示和退出功能
class NavigationManager {
    constructor() {
        this.init();
    }
    
    // 初始化导航栏
    init() {
        // 页面加载时更新导航栏状态
        document.addEventListener('DOMContentLoaded', () => {
            this.updateNavigationState();
        });
    }
    
    // 更新导航栏状态
    updateNavigationState() {
        const isLoggedIn = Router.isLoggedIn();
        const loginItem = document.querySelector('.nav-item[onclick*="login"]');
        const logoutItem = document.querySelector('.nav-item:not([onclick*="login"])');
        
        if (loginItem && logoutItem) {
            if (isLoggedIn) {
                // 用户已登录，显示退出按钮
                loginItem.style.display = 'none';
                logoutItem.style.display = 'block';
                logoutItem.textContent = '退出';
                logoutItem.setAttribute('onclick', 'NavigationManager.handleLogout()');
                logoutItem.style.cursor = 'pointer';
            } else {
                // 用户未登录，显示登录按钮
                loginItem.style.display = 'block';
                logoutItem.style.display = 'none';
                loginItem.textContent = '登录';
            }
        }
    }
    
    // 处理退出登录
    static handleLogout() {
        if (confirm('确定要退出登录吗？')) {
            // 清除用户数据
            Router.logout();
            
            // 更新导航栏状态
            const navManager = new NavigationManager();
            navManager.updateNavigationState();
        }
    }
}

// 创建全局导航管理器实例
const navManager = new NavigationManager();