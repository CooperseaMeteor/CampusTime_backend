/**
 * 管理员API工具类
 * 提供管理员页面所需的数据获取和处理功能
 * 依赖: config.js, router.js
 */

class AdminAPI {
    /**
     * 获取管理员仪表板数据
     * @returns {Promise<Object>} 仪表板数据
     */
    static async getDashboardData() {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DASHBOARD);
    }

    /**
     * 获取今日统计数据
     * @returns {Promise<Object>} 今日统计数据
     */
    static async getTodayStats() {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_STATS_TODAY);
    }

    /**
     * 获取指定时间段统计数据
     * @param {Object} params - 查询参数 {startDate, endDate, type}
     * @returns {Promise<Object>} 时间段统计数据
     */
    static async getPeriodStats(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_STATS_PERIOD}?${queryString}`);
    }

    // ==================== 食堂管理 ====================
    
    /**
     * 获取所有食堂列表
     * @param {Object} params - 查询参数 {page, limit, status}
     * @returns {Promise<Object>} 食堂列表
     */
    static async getCanteens(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_CANTEENS}?${queryString}`);
    }

    /**
     * 获取食堂详情
     * @param {number} id - 食堂ID
     * @returns {Promise<Object>} 食堂详情
     */
    static async getCanteenDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_CANTEEN_DETAIL(id));
    }

    /**
     * 创建新食堂
     * @param {Object} data - 食堂数据
     * @returns {Promise<Object>} 创建结果
     */
    static async createCanteen(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_CANTEEN_CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 更新食堂信息
     * @param {number} id - 食堂ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateCanteen(id, data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_CANTEEN_UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除食堂
     * @param {number} id - 食堂ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteCanteen(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_CANTEEN_DELETE(id), {
            method: 'DELETE'
        });
    }

    /**
     * 更新食堂状态
     * @param {number} id - 食堂ID
     * @param {string} status - 状态 (open/closed)
     * @returns {Promise<Object>} 更新结果
     */
    static async updateCanteenStatus(id, status) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_CANTEEN_STATUS(id), {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // ==================== 档口管理 ====================
    
    /**
     * 获取所有档口列表
     * @param {Object} params - 查询参数 {page, limit, canteenId}
     * @returns {Promise<Object>} 档口列表
     */
    static async getStalls(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_STALLS}?${queryString}`);
    }

    /**
     * 获取档口详情
     * @param {number} id - 档口ID
     * @returns {Promise<Object>} 档口详情
     */
    static async getStallDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_STALL_DETAIL(id));
    }

    /**
     * 创建新档口
     * @param {Object} data - 档口数据
     * @returns {Promise<Object>} 创建结果
     */
    static async createStall(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_STALL_CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 更新档口信息
     * @param {number} id - 档口ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateStall(id, data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_STALL_UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除档口
     * @param {number} id - 档口ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteStall(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_STALL_DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== 菜品管理 ====================
    
    /**
     * 获取所有菜品列表
     * @param {Object} params - 查询参数 {page, limit, stallId, category}
     * @returns {Promise<Object>} 菜品列表
     */
    static async getDishes(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_DISHES}?${queryString}`);
    }

    /**
     * 获取菜品详情
     * @param {number} id - 菜品ID
     * @returns {Promise<Object>} 菜品详情
     */
    static async getDishDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DISH_DETAIL(id));
    }

    /**
     * 创建新菜品
     * @param {Object} data - 菜品数据
     * @returns {Promise<Object>} 创建结果
     */
    static async createDish(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DISH_CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 更新菜品信息
     * @param {number} id - 菜品ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateDish(id, data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DISH_UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除菜品
     * @param {number} id - 菜品ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteDish(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DISH_DELETE(id), {
            method: 'DELETE'
        });
    }

    /**
     * 批量操作菜品
     * @param {Object} data - 批量操作数据 {action, dishIds, updateData}
     * @returns {Promise<Object>} 操作结果
     */
    static async batchOperateDishes(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_DISH_BATCH, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== 评论管理 ====================
    
    /**
     * 获取所有评论列表
     * @param {Object} params - 查询参数 {page, limit, status, rating}
     * @returns {Promise<Object>} 评论列表
     */
    static async getReviews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REVIEWS}?${queryString}`);
    }

    /**
     * 获取评论详情
     * @param {number} id - 评论ID
     * @returns {Promise<Object>} 评论详情
     */
    static async getReviewDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_REVIEW_DETAIL(id));
    }

    /**
     * 审核通过评论
     * @param {number} id - 评论ID
     * @returns {Promise<Object>} 审核结果
     */
    static async approveReview(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_REVIEW_APPROVE(id), {
            method: 'PATCH'
        });
    }

    /**
     * 审核拒绝评论
     * @param {number} id - 评论ID
     * @param {string} reason - 拒绝原因
     * @returns {Promise<Object>} 审核结果
     */
    static async rejectReview(id, reason) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_REVIEW_REJECT(id), {
            method: 'PATCH',
            body: JSON.stringify({ reason })
        });
    }

    /**
     * 删除评论
     * @param {number} id - 评论ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteReview(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_REVIEW_DELETE(id), {
            method: 'DELETE'
        });
    }

    /**
     * 获取待审核评论列表
     * @param {Object} params - 查询参数 {page, limit}
     * @returns {Promise<Object>} 待审核评论列表
     */
    static async getPendingReviews(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REVIEWS_PENDING}?${queryString}`);
    }

    // ==================== 内容发布 ====================
    
    /**
     * 获取所有公告列表
     * @param {Object} params - 查询参数 {page, limit, status}
     * @returns {Promise<Object>} 公告列表
     */
    static async getAnnouncements(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_ANNOUNCEMENTS}?${queryString}`);
    }

    /**
     * 获取公告详情
     * @param {number} id - 公告ID
     * @returns {Promise<Object>} 公告详情
     */
    static async getAnnouncementDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_DETAIL(id));
    }

    /**
     * 创建新公告
     * @param {Object} data - 公告数据
     * @returns {Promise<Object>} 创建结果
     */
    static async createAnnouncement(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_CREATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 更新公告信息
     * @param {number} id - 公告ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateAnnouncement(id, data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除公告
     * @param {number} id - 公告ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteAnnouncement(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_DELETE(id), {
            method: 'DELETE'
        });
    }

    /**
     * 置顶/取消置顶公告
     * @param {number} id - 公告ID
     * @param {boolean} pinned - 是否置顶
     * @returns {Promise<Object>} 操作结果
     */
    static async pinAnnouncement(id, pinned = true) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_ANNOUNCEMENT_PIN(id), {
            method: 'PATCH',
            body: JSON.stringify({ pinned })
        });
    }

    // ==================== 用户管理 ====================
    
    /**
     * 获取所有用户列表
     * @param {Object} params - 查询参数 {page, limit, status, role}
     * @returns {Promise<Object>} 用户列表
     */
    static async getUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_USERS}?${queryString}`);
    }

    /**
     * 获取用户详情
     * @param {number} id - 用户ID
     * @returns {Promise<Object>} 用户详情
     */
    static async getUserDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_USER_DETAIL(id));
    }

    /**
     * 更新用户信息
     * @param {number} id - 用户ID
     * @param {Object} data - 更新数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUser(id, data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_USER_UPDATE(id), {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除用户
     * @param {number} id - 用户ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteUser(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_USER_DELETE(id), {
            method: 'DELETE'
        });
    }

    /**
     * 更新用户状态
     * @param {number} id - 用户ID
     * @param {string} status - 状态 (active/inactive/banned)
     * @returns {Promise<Object>} 更新结果
     */
    static async updateUserStatus(id, status) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_USER_STATUS(id), {
            method: 'PATCH',
            body: JSON.stringify({ status })
        });
    }

    // ==================== 数据报表 ====================
    
    /**
     * 获取访客数据报表
     * @param {Object} params - 查询参数 {startDate, endDate, type}
     * @returns {Promise<Object>} 访客数据
     */
    static async getVisitorReports(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REPORTS_VISITORS}?${queryString}`);
    }

    /**
     * 获取菜品数据报表
     * @param {Object} params - 查询参数 {startDate, endDate, type}
     * @returns {Promise<Object>} 菜品数据
     */
    static async getDishReports(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REPORTS_DISHES}?${queryString}`);
    }

    /**
     * 获取食堂数据报表
     * @param {Object} params - 查询参数 {startDate, endDate, type}
     * @returns {Promise<Object>} 食堂数据
     */
    static async getCanteenReports(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REPORTS_CANTEENS}?${queryString}`);
    }

    /**
     * 获取评论数据报表
     * @param {Object} params - 查询参数 {startDate, endDate, type}
     * @returns {Promise<Object>} 评论数据
     */
    static async getReviewReports(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REPORTS_REVIEWS}?${queryString}`);
    }

    /**
     * 导出报表
     * @param {Object} params - 导出参数 {type, format, startDate, endDate}
     * @returns {Promise<Object>} 导出结果
     */
    static async exportReports(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_REPORTS_EXPORT}?${queryString}`);
    }

    // ==================== 批量操作 ====================
    
    /**
     * 批量导入数据
     * @param {FormData} formData - 表单数据
     * @returns {Promise<Object>} 导入结果
     */
    static async batchImport(formData) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_BATCH_IMPORT, {
            method: 'POST',
            body: formData,
            headers: {} // 不设置Content-Type，让浏览器自动设置multipart/form-data
        });
    }

    /**
     * 批量导出数据
     * @param {Object} params - 导出参数 {type, format, filters}
     * @returns {Promise<Object>} 导出结果
     */
    static async batchExport(params) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_BATCH_EXPORT}?${queryString}`);
    }

    /**
     * 批量更新数据
     * @param {Object} data - 批量更新数据 {type, ids, updateData}
     * @returns {Promise<Object>} 更新结果
     */
    static async batchUpdate(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_BATCH_UPDATE, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // ==================== 任务管理 ====================
    
    /**
     * 获取所有任务列表
     * @param {Object} params - 查询参数 {page, limit, status}
     * @returns {Promise<Object>} 任务列表
     */
    static async getTasks(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return await Router.apiCall(`${API_ENDPOINTS.ADMIN_TASKS}?${queryString}`);
    }

    /**
     * 获取任务详情
     * @param {number} id - 任务ID
     * @returns {Promise<Object>} 任务详情
     */
    static async getTaskDetail(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_TASK_DETAIL(id));
    }

    /**
     * 完成任务
     * @param {number} id - 任务ID
     * @param {Object} data - 完成数据 {notes, attachments}
     * @returns {Promise<Object>} 完成结果
     */
    static async completeTask(id, data = {}) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_TASK_COMPLETE(id), {
            method: 'PATCH',
            body: JSON.stringify(data)
        });
    }

    /**
     * 删除任务
     * @param {number} id - 任务ID
     * @returns {Promise<Object>} 删除结果
     */
    static async deleteTask(id) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_TASK_DELETE(id), {
            method: 'DELETE'
        });
    }

    // ==================== 系统设置 ====================
    
    /**
     * 获取系统设置
     * @returns {Promise<Object>} 系统设置
     */
    static async getSettings() {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_SETTINGS);
    }

    /**
     * 更新系统设置
     * @param {Object} data - 设置数据
     * @returns {Promise<Object>} 更新结果
     */
    static async updateSettings(data) {
        return await Router.apiCall(API_ENDPOINTS.ADMIN_SETTING_UPDATE, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
}

// 将AdminAPI添加到全局作用域，以便在HTML中直接使用
window.AdminAPI = AdminAPI;