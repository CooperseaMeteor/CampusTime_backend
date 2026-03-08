/**
 * 导航栏滚动位置管理器
 * 用于保存和恢复导航栏的横向滚动位置
 */
class NavigationScrollManager {
    constructor() {
        this.storageKey = 'navigationScrollPosition';
        this.scrollPosition = 0;
        this.init();
    }
    
    /**
     * 初始化滚动位置管理器
     */
    init() {
        // 从本地存储恢复滚动位置
        this.restoreScrollPosition();
        
        // 监听滚动事件，保存滚动位置
        this.setupScrollListener();
        
        // 监听页面卸载事件，保存滚动位置
        this.setupBeforeUnloadListener();
    }
    
    /**
     * 设置滚动监听器
     */
    setupScrollListener() {
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            navTabs.addEventListener('scroll', () => {
                this.saveScrollPosition();
            });
        }
    }
    
    /**
     * 设置页面卸载监听器
     */
    setupBeforeUnloadListener() {
        window.addEventListener('beforeunload', () => {
            this.saveScrollPosition();
        });
    }
    
    /**
     * 保存当前滚动位置
     */
    saveScrollPosition() {
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            this.scrollPosition = navTabs.scrollLeft;
            localStorage.setItem(this.storageKey, this.scrollPosition);
        }
    }
    
    /**
     * 恢复滚动位置
     */
    restoreScrollPosition() {
        const savedPosition = localStorage.getItem(this.storageKey);
        if (savedPosition !== null) {
            this.scrollPosition = parseInt(savedPosition, 10);
            
            // 延迟恢复，确保DOM已加载
            setTimeout(() => {
                const navTabs = document.querySelector('.nav-tabs');
                if (navTabs) {
                    navTabs.scrollLeft = this.scrollPosition;
                }
            }, 100);
        }
    }
    
    /**
     * 手动设置滚动位置
     * @param {number} position - 滚动位置
     */
    setScrollPosition(position) {
        this.scrollPosition = position;
        localStorage.setItem(this.storageKey, position);
        
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            navTabs.scrollLeft = position;
        }
    }
    
    /**
     * 获取当前滚动位置
     * @returns {number}
     */
    getScrollPosition() {
        return this.scrollPosition;
    }
    
    /**
     * 清除保存的滚动位置
     */
    clearScrollPosition() {
        this.scrollPosition = 0;
        localStorage.removeItem(this.storageKey);
        
        const navTabs = document.querySelector('.nav-tabs');
        if (navTabs) {
            navTabs.scrollLeft = 0;
        }
    }
}

// 创建全局实例
window.NavigationScrollManager = new NavigationScrollManager();

// 导出全局函数
window.saveNavigationScrollPosition = () => window.NavigationScrollManager.saveScrollPosition();
window.restoreNavigationScrollPosition = () => window.NavigationScrollManager.restoreScrollPosition();
window.setNavigationScrollPosition = (position) => window.NavigationScrollManager.setScrollPosition(position);
window.getNavigationScrollPosition = () => window.NavigationScrollManager.getScrollPosition();
window.clearNavigationScrollPosition = () => window.NavigationScrollManager.clearScrollPosition();