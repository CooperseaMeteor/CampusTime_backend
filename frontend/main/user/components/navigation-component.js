/**

 * 导航栏组件管理器

 * 负责加载和管理用户界面导航栏

 */

class NavigationComponent {

    constructor() {

        this.isLoaded = false;

        this.defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22 viewBox=%220 0 64 64%22%3E%3Crect width=%2264%22 height=%2264%22 rx=%2232%22 fill=%22%23f2f3f5%22/%3E%3Ccircle cx=%2232%22 cy=%2225%22 r=%2212%22 fill=%22%239aa1ab%22/%3E%3Cpath d=%22M14 54c2.6-9.4 10.2-14 18-14s15.4 4.6 18 14%22 fill=%22%239aa1ab%22/%3E%3C/svg%3E';

        this.currentPage = this.detectCurrentPage();

    }

    

    /**

     * 检测当前页面

     */

    detectCurrentPage() {

        const currentPath = window.location.pathname;

        

        if (currentPath.includes('user_index.html') || currentPath.endsWith('/')) {

            return 'index';

        } else if (currentPath.includes('user_community.html')) {

            return 'community';

        } else if (currentPath.includes('user_canteen.html')) {

            return 'canteen';

        } else if (currentPath.includes('user_profile.html')) {

            return 'profile';

        } else if (currentPath.includes('user_ai_assistant.html')) {

            return 'ai-assistant';

        }

        

        return 'index'; // 默认为首页

    }

    

    /**

     * 加载导航栏组件

     */

    async loadNavigation() {

        if (this.isLoaded) {

            console.log('导航栏已加载，跳过重复加载');

            return;

        }

        // 防止重复注入导航栏（某些页面可能重复触发初始化）
        if (document.querySelector('.main-nav')) {
            console.log('检测到已存在主导航栏，跳过注入');
            this.isLoaded = true;
            this.setActiveNavItem();
            this.updateUserPanel();
            return;
        }

        

        // 检测是否在 iframe 中加载

        // 使用多种方法检测 iframe 环境，提高检测准确性

        const isInIframe = window.frameElement || window !== window.top;

        

        // 检查父窗口是否为 user_shell.html，如果是则仍然加载导航栏

        let shouldLoadNavigation = true;

        

        if (isInIframe) {

            console.log('页面在 iframe 中加载，检查是否为 user_shell.html...', {

                frameElement: !!window.frameElement,

                windowNotTop: window !== window.top,

                location: window.location.href,

                parentLocation: window.parent ? window.parent.location.href : 'unknown'

            });

            

            // 检查父窗口的URL是否包含 user_shell.html

            const parentUrl = window.parent ? window.parent.location.href : '';

            const isShellIframe = parentUrl.includes('user_shell.html');

            

            if (!isShellIframe) {

                // 如果不是 user_shell.html 的 iframe，则跳过导航栏加载

                console.log('不是 user_shell.html 的 iframe，跳过导航栏加载');

                shouldLoadNavigation = false;

                

                // 在普通 iframe 中，减少主内容区域的上边距

                const mainContent = document.querySelector('.main-content');

                if (mainContent) {

                    mainContent.style.paddingTop = '20px';

                }

            } else {

                // 如果是 user_shell.html 的 iframe，则仍然加载导航栏

                console.log('是 user_shell.html 的 iframe，继续加载导航栏');

                shouldLoadNavigation = true;

            }

        }

        

        if (!shouldLoadNavigation) {

            return;

        }

        

        console.log('开始加载导航栏组件...');

        

        try {

            // 获取导航栏组件

            console.log('正在请求导航栏HTML文件...');

            const response = await fetch('/main/user/components/navigation.html');

            

            if (!response.ok) {

                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);

            }

            

            const navigationHTML = await response.text();

            console.log('导航栏HTML加载成功，开始解析...');

            

            // 创建临时容器

            const tempContainer = document.createElement('div');

            tempContainer.innerHTML = navigationHTML;

            

            // 提取导航栏样式

            console.log('提取导航栏样式...');

            const styles = tempContainer.querySelectorAll('style');

            let styleText = '';

            styles.forEach(style => {

                styleText += style.textContent;

            });

            

            if (styleText) {

                // 创建样式元素并添加到页面头部

                const existingStyle = document.getElementById('navigation-component-style');
                if (!existingStyle) {
                    const navigationStyle = document.createElement('style');
                    navigationStyle.id = 'navigation-component-style';
                    navigationStyle.textContent = styleText;
                    document.head.appendChild(navigationStyle);
                }

                console.log('导航栏样式添加成功');

            }

            

            // 提取顶部导航栏

            const globalNav = tempContainer.querySelector('.global-nav');

            if (globalNav) {

                document.body.prepend(globalNav);

                console.log('顶部导航栏添加成功');

            }

            

            // 提取主导航栏

            const mainNav = tempContainer.querySelector('.main-nav');

            if (mainNav) {

                // 始终将导航栏插入到页面顶部

                document.body.insertBefore(mainNav, document.body.firstChild);

                console.log('主导航栏添加成功');

            } else {

                console.warn('未找到主导航栏元素(.main-nav)');

            }

            

            // navigation.html 内联脚本不再重复注入，避免覆盖当前组件逻辑
            // 导航行为和激活态由 NavigationComponent 统一管理

            

            // 设置当前活动导航项

            setTimeout(() => {

                this.setActiveNavItem();

                this.updateUserPanel();

                console.log('活动导航项设置完成');

            }, 100);

            

            this.isLoaded = true;

            console.log('导航栏组件加载完成！');

            

        } catch (error) {

            console.error('加载导航栏组件失败:', error);

            console.error('错误详情:', {

                message: error.message,

                stack: error.stack,

                location: window.location.href

            });

        }

    }

    

    /**

     * 设置活动导航项

     */

    setActiveNavItem() {

        const navTabs = document.querySelectorAll('.nav-tab');

        navTabs.forEach(tab => {

            tab.classList.remove('active');

            if (tab.getAttribute('data-page') === this.currentPage) {

                tab.classList.add('active');

            }

        });

    }

    /**
     * 更新导航栏用户区域（头像/用户名/退出按钮）
     */
    updateUserPanel() {
        // 用户头像/名称现已放在 user_shell 的橙色顶栏。
        // 保留空实现，兼容旧调用点。
        return;
    }

    

    /**

     * 导航到指定页面

     */

    navigateToPage(page) {

        // “我的”要求登录：未登录时不跳转页面，只弹窗提示
        if (page === 'profile' && !Router.isLoggedIn()) {
            const shouldLogin = window.confirm('请先登录后再进入“我的”。\n\n点击“确定”立即登录，点击“取消”留在当前页。');
            if (shouldLogin) {
                this.openLoginPopup();
            }
            return;
        }

        switch(page) {

            case 'index':

                // 在 user_shell 的 iframe 中点击“首页”应加载内容页，不能再跳回 shell，避免壳套壳
                if (window.self !== window.top) {
                    Router.navigate(`${CONFIG.getBaseUrl()}/main/user/user_index.html`);
                } else {
                    Router.toUserIndex();
                }

                break;

            case 'community':

                Router.navigate(USER_ROUTES.getAbsoluteCommunity());

                break;

            case 'canteen':

                Router.navigate(USER_ROUTES.getAbsoluteCanteen());

                break;

            case 'profile':

                Router.navigate(USER_ROUTES.getAbsoluteProfile());

                break;

            case 'ai-assistant':

                Router.navigate(USER_ROUTES.getAbsoluteAIAssistant());

                break;

        }

    }

    /**
     * 打开登录弹窗：iframe 场景优先父窗口(user_shell)，避免命中页面内旧弹窗实现
     */
    openLoginPopup() {
        try {
            if (window.parent && window.parent !== window) {
                if (typeof window.parent.showLoginModal === 'function') {
                    window.parent.showLoginModal('user');
                    return;
                }
                if (typeof window.parent.openLoginModal === 'function') {
                    window.parent.openLoginModal('user');
                    return;
                }
            }
        } catch (e) {
            console.warn('调用父窗口登录弹窗失败:', e);
        }

        if (typeof window.showLoginModal === 'function') {
            window.showLoginModal('user');
            return;
        }

        if (typeof window.openLoginModal === 'function') {
            window.openLoginModal('user');
            return;
        }

        alert('未找到可用的登录弹窗入口，请刷新页面后重试。');
    }

    

    /**

     * 切换学校

     */

    switchSchool(school) {

        console.log('切换学校到:', school);

        // 这里可以添加切换学校的逻辑

        // 例如：重新加载页面数据、更新配置等

    }

    

    /**

     * 确保登录模态框

     */

    ensureLoginModal(callback) {

        if (typeof openLoginModal === 'function') {

            openLoginModal();

        } else {

            console.warn('openLoginModal 函数未定义');

        }

    }

}



// 创建全局导航栏组件实例

window.NavigationComponent = new NavigationComponent();



// 页面加载完成后自动加载导航栏

document.addEventListener('DOMContentLoaded', function() {

    console.log('DOM加载完成，准备加载导航栏...');

    

    // 移除对Router和USER_ROUTES的强依赖

    // 导航栏可以独立加载，导航功能在需要时再检查依赖

    console.log('开始加载导航栏，不依赖Router和USER_ROUTES...');

    window.NavigationComponent.loadNavigation();
        
        // 导航注入后再同步一次用户信息，避免异步加载时机导致显示延迟
        setTimeout(() => {
            window.NavigationComponent.updateUserPanel();
        }, 200);
        
        // 监听本地存储变化，跨标签页同步登录态
        window.addEventListener('storage', (event) => {
            if (!event || !event.key) {
                return;
            }
            if (event.key.includes('user') || event.key.includes('auth') || event.key.includes('token')) {
                window.NavigationComponent.updateUserPanel();
            }
        });

    // 加载静态图片联动器：将死数据中的占位图/文字图替换为 /uploads/dishes/菜名.*
    const linkerScriptId = 'static-image-linker-script';
    const initImageLinker = () => {
        if (window.StaticImageLinker && typeof window.StaticImageLinker.init === 'function') {
            window.StaticImageLinker.init();
        }
    };

    if (window.StaticImageLinker) {
        initImageLinker();
    } else if (!document.getElementById(linkerScriptId)) {
        const script = document.createElement('script');
        script.id = linkerScriptId;
        script.src = '/main/user/components/static-image-linker.js';
        script.onload = initImageLinker;
        document.head.appendChild(script);
    }

    

    // 同时检查Router和USER_ROUTES的加载状态

    setTimeout(() => {

        const routerLoaded = typeof Router !== 'undefined';

        const userRoutesLoaded = typeof USER_ROUTES !== 'undefined';

        

        console.log('依赖加载状态:', {

            routerLoaded,

            userRoutesLoaded

        });

        

        if (!routerLoaded || !userRoutesLoaded) {

            console.warn('Router或USER_ROUTES未完全加载，导航功能可能受限，但导航栏已显示');

        } else {

            console.log('Router和USER_ROUTES加载完成，导航功能完整可用');

        }

    }, 500);

});



// 导出全局函数供HTML调用

window.navigateToPage = (page) => window.NavigationComponent.navigateToPage(page);

window.switchSchool = (school) => window.NavigationComponent.switchSchool(school);

window.ensureLoginModal = () => window.NavigationComponent.ensureLoginModal();