# API接口使用指南

## 概述

本文档介绍了校园食光项目中各个页面使用的API接口，包括接口说明、使用方法和示例代码。

## 修改的文件列表

1. **用户首页 (user_index.html)**
   - 添加了推荐食堂、热门菜品、最新评价的API调用
   - 实现了数据渲染和错误处理机制

2. **食堂页面 (user_canteen.html)**
   - 添加了食堂列表、搜索、详情的API调用
   - 实现了食堂卡片渲染和详情弹窗

3. **个人中心 (user_profile.html)**
   - 添加了用户信息、更新、订单历史的API调用
   - 实现了数据更新和订单列表渲染

4. **社区页面 (user_community.html)**
   - 添加了社区帖子、发表、评论的API调用
   - 实现了帖子列表、评论系统和交互功能

5. **AI助手页面 (user_ai_assistant.html)**
   - 添加了AI聊天接口调用
   - 实现了消息发送、接收和显示功能

6. **弹窗组件 (popup_component.html)**
   - 统一使用Router.apiCall替代直接fetch
   - 确保了API调用的统一性和错误处理

## API接口说明

### 1. 用户首页 (user_index.html)

#### 1.1 推荐食堂接口
```javascript
// 加载推荐食堂
async function loadRecommendedCanteens() {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.MERCHANTS, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const canteens = response.data || [];
            renderCanteens(canteens);
        } else {
            console.error('加载推荐食堂失败:', response);
            showErrorMessage('加载推荐食堂失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载推荐食堂出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 1.2 热门菜品接口
```javascript
// 加载热门菜品数据
async function loadHotDishes() {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.DISHES, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const dishes = response.data || [];
            renderHotDishes(dishes);
        } else {
            console.error('加载热门菜品失败:', response);
            showErrorMessage('加载热门菜品失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载热门菜品出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 1.3 最新评价接口
```javascript
// 加载最新评价数据
async function loadRecentReviews() {
    try {
        const response = await Router.apiCall('/reviews', {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const reviews = response.data || [];
            renderRecentReviews(reviews);
        } else {
            console.error('加载最新评价失败:', response);
            showErrorMessage('加载最新评价失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载最新评价出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

### 2. 食堂页面 (user_canteen.html)

#### 2.1 食堂列表接口
```javascript
// 加载食堂列表数据
async function loadCanteens() {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.MERCHANTS, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const canteens = response.data || [];
            renderCanteens(canteens);
        } else {
            console.error('加载食堂列表失败:', response);
            showErrorMessage('加载食堂列表失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载食堂列表出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 2.2 搜索食堂接口
```javascript
// 搜索食堂
async function searchCanteens(keyword) {
    if (!keyword.trim()) {
        // 如果搜索词为空，加载所有食堂
        loadCanteens();
        return;
    }
    
    try {
        const response = await Router.apiCall(`${API_ENDPOINTS.MERCHANTS}?search=${encodeURIComponent(keyword)}`, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const canteens = response.data || [];
            renderCanteens(canteens);
        } else {
            console.error('搜索食堂失败:', response);
            showErrorMessage('搜索失败，请稍后重试');
        }
    } catch (error) {
        console.error('搜索食堂出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 2.3 食堂详情接口
```javascript
// 获取食堂详情
async function getCanteenDetail(canteenId) {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.MERCHANT_DETAIL(canteenId), {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const canteen = response.data;
            showCanteenDetail(canteen);
        } else {
            console.error('获取食堂详情失败:', response);
            showErrorMessage('获取食堂详情失败，请稍后重试');
        }
    } catch (error) {
        console.error('获取食堂详情出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

### 3. 个人中心 (user_profile.html)

#### 3.1 用户信息接口
```javascript
// 加载用户信息
async function loadUserProfile() {
    try {
        const response = await Router.apiCall(API_ENDPOINTS.USER_PROFILE, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const userProfile = response.data;
            updateProfileUI(userProfile);
        } else {
            console.error('加载用户信息失败:', response);
            showErrorMessage('加载用户信息失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载用户信息出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 3.2 更新用户信息接口
```javascript
// 更新用户信息
async function updateProfile() {
    const profileData = {
        realName: document.getElementById('user-realname').textContent,
        phone: document.getElementById('user-phone').textContent,
        major: document.getElementById('user-major').textContent,
        email: document.getElementById('user-email').textContent
    };
    
    try {
        const response = await Router.apiCall(API_ENDPOINTS.UPDATE_PROFILE, {
            method: 'POST',
            body: JSON.stringify(profileData)
        });
        
        if (response && response.code === 200) {
            alert('更新成功');
            // 重新加载用户信息
            loadUserProfile();
        } else {
            console.error('更新用户信息失败:', response);
            showErrorMessage('更新失败，请稍后重试');
        }
    } catch (error) {
        console.error('更新用户信息出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 3.3 订单历史接口
```javascript
// 加载用户订单历史
async function loadOrderHistory() {
    try {
        const response = await Router.apiCall('/orders', {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const orders = response.data || [];
            renderOrderHistory(orders);
        } else {
            console.error('加载订单历史失败:', response);
            showErrorMessage('加载订单历史失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载订单历史出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

### 4. 社区页面 (user_community.html)

#### 4.1 社区帖子接口
```javascript
// 加载社区帖子
async function loadCommunityPosts() {
    try {
        const response = await Router.apiCall('/posts', {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const posts = response.data || [];
            renderCommunityPosts(posts);
        } else {
            console.error('加载社区帖子失败:', response);
            showErrorMessage('加载社区帖子失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载社区帖子出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 4.2 发表帖子接口
```javascript
// 发表帖子
async function submitPost() {
    const title = document.getElementById('post-title').value;
    const content = document.getElementById('post-content').value;
    const tags = document.getElementById('post-tags').value;
    
    if (!title.trim() || !content.trim()) {
        alert('请填写标题和内容');
        return;
    }
    
    try {
        const response = await Router.apiCall('/posts', {
            method: 'POST',
            body: JSON.stringify({ title, content, tags })
        });
        
        if (response && response.code === 200) {
            alert('发表成功');
            // 清空表单
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            document.getElementById('post-tags').value = '';
            // 重新加载帖子列表
            loadCommunityPosts();
        } else {
            console.error('发表帖子失败:', response);
            showErrorMessage('发表失败，请稍后重试');
        }
    } catch (error) {
        console.error('发表帖子出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 4.3 评论接口
```javascript
// 获取评论
async function loadComments(postId) {
    try {
        const response = await Router.apiCall(`/posts/${postId}/comments`, {
            method: 'GET'
        });
        
        if (response && response.code === 200) {
            const comments = response.data || [];
            renderComments(comments);
        } else {
            console.error('加载评论失败:', response);
            showErrorMessage('加载评论失败，请稍后重试');
        }
    } catch (error) {
        console.error('加载评论出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}

// 提交评论
async function submitComment(postId) {
    const content = document.getElementById('comment-content').value;
    
    if (!content.trim()) {
        alert('请填写评论内容');
        return;
    }
    
    try {
        const response = await Router.apiCall(`/posts/${postId}/comments`, {
            method: 'POST',
            body: JSON.stringify({ content })
        });
        
        if (response && response.code === 200) {
            alert('评论成功');
            // 清空表单
            document.getElementById('comment-content').value = '';
            // 重新加载评论
            loadComments(postId);
        } else {
            console.error('评论失败:', response);
            showErrorMessage('评论失败，请稍后重试');
        }
    } catch (error) {
        console.error('评论出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

#### 4.4 点赞接口
```javascript
// 点赞帖子
async function likePost(postId) {
    try {
        const response = await Router.apiCall(`/posts/${postId}/like`, {
            method: 'POST'
        });
        
        if (response && response.code === 200) {
            alert('点赞成功');
            // 重新加载帖子列表
            loadCommunityPosts();
        } else {
            console.error('点赞失败:', response);
            showErrorMessage('点赞失败，请稍后重试');
        }
    } catch (error) {
        console.error('点赞出错:', error);
        showErrorMessage('网络错误，请检查网络连接');
    }
}
```

### 5. AI助手页面 (user_ai_assistant.html)

#### 5.1 AI聊天接口
```javascript
// 发送消息
async function sendMessage() {
    const input = document.querySelector('.chat-input');
    const message = input.value.trim();
    
    if (!message) {
        return;
    }
    
    // 清空输入框
    input.value = '';
    
    // 添加用户消息
    addMessage('用户', message, 'user');
    
    // 显示加载状态
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span>AI正在思考中...</div>';
    
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
        chatMessages.appendChild(loadingDiv);
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    try {
        // 调用AI API
        const response = await Router.apiCall('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({ message })
        });
        
        // 移除加载状态
        if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        
        if (response && response.code === 200) {
            // 添加AI回复
            const aiMessage = response.data.message || '抱歉，我暂时无法回答这个问题。';
            addMessage('AI', aiMessage, 'ai');
        } else {
            // 添加错误消息
            addMessage('AI', '抱歉，处理您的请求时出现了问题。请稍后重试。', 'ai error');
        }
    } catch (error) {
        // 移除加载状态
        if (loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        
        console.error('AI请求失败:', error);
        // 添加错误消息
        addMessage('AI', '抱歉，网络连接出现问题，请检查网络后重试。', 'ai error');
    }
}
```

### 6. 弹窗组件 (popup_component.html)

#### 6.1 评价提交接口
```javascript
// 调用后端API提交评价
const response = await Router.apiCall('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData)
});
```

## 通用功能

### 错误处理
所有页面都实现了统一的错误处理机制：
```javascript
// 显示错误信息
function showErrorMessage(message) {
    // 创建错误提示元素
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #ff4d4f;
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    
    // 添加到页面
    document.body.appendChild(errorDiv);
    
    // 3秒后自动移除
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}
```

### 时间格式化
```javascript
// 格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '未知时间';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
        return '刚刚';
    }
    // 小于1小时
    else if (diff < 3600000) {
        return Math.floor(diff / 60000) + '分钟前';
    }
    // 小于1天
    else if (diff < 86400000) {
        return Math.floor(diff / 3600000) + '小时前';
    }
    // 小于7天
    else if (diff < 604800000) {
        return Math.floor(diff / 86400000) + '天前';
    }
    // 超过7天，显示具体日期
    else {
        return date.toLocaleDateString();
    }
}
```

## API端点配置

所有API端点都在 `config.js` 文件中的 `API_ENDPOINTS` 对象中定义：

```javascript
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
    
    // 用户相关
    USER_PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update'
};
```

## 使用建议

1. **统一错误处理**：所有API调用都应该包含try-catch块，并调用统一的错误处理函数。

2. **加载状态显示**：在API调用过程中，应该显示加载状态，提升用户体验。

3. **数据验证**：在发送数据前，应该进行基本的数据验证，如检查必填字段。

4. **响应处理**：应该检查API响应的code字段，200表示成功，其他值表示失败。

5. **数据刷新**：在数据更新成功后，应该重新加载相关数据，确保UI与最新数据同步。

## 注意事项

1. 所有API调用都使用了 `Router.apiCall()` 方法，确保了统一的认证和错误处理。

2. 所有页面都实现了数据为空时的友好提示，避免了空白页面的出现。

3. 所有页面都实现了时间格式化功能，提供了友好的时间显示。

4. 所有错误信息都通过统一的 `showErrorMessage()` 函数显示，保持了一致的用户体验。

## 测试方法

1. 打开浏览器开发者工具，查看Network面板，确认API请求是否正常发送。

2. 检查API响应数据格式是否正确，是否有code和data字段。

3. 测试各种网络情况，如网络断开、服务器错误等，确认错误处理是否正常工作。

4. 验证数据渲染是否正确，页面元素是否按预期显示。

5. 测试交互功能，如点击、提交、搜索等，确认功能是否正常工作。