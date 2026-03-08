# 管理员API接口文档

## 概述

本文档描述了校园食光管理员后台系统的API接口，包括数据统计、食堂管理、档口管理、菜品管理、评论管理、内容发布、用户管理、数据报表、批量操作、任务管理和系统设置等功能。

## 基础信息

- **API基础URL**: `http://39.108.138.4:5000/api`
- **认证方式**: Bearer Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证

所有管理员API请求需要在请求头中包含有效的管理员Token：

```
Authorization: Bearer <admin_token>
```

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据内容
  }
}
```

### 错误响应

```json
{
  "success": false,
  "message": "错误描述",
  "error": {
    "code": "ERROR_CODE",
    "details": "详细错误信息"
  }
}
```

## API端点详情

### 1. 数据统计

#### 1.1 获取仪表板数据

**端点**: `GET /admin/dashboard`

**描述**: 获取管理员仪表板所需的所有数据

**响应示例**:
```json
{
  "success": true,
  "data": {
    "todayStats": {
      "visitors": 1245,
      "newComments": 86,
      "qrOrders": 42,
      "popularDishes": 3
    },
    "pendingTasks": [
      {
        "id": 1,
        "title": "3条新评论需要审核",
        "description": "包含1条负面评价需要优先处理",
        "createdAt": "2023-12-01T10:30:00Z",
        "type": "review"
      }
    ],
    "canteens": [
      {
        "id": 1,
        "name": "第一食堂",
        "status": "open"
      }
    ]
  }
}
```

#### 1.2 获取今日统计数据

**端点**: `GET /admin/stats/today`

**描述**: 获取今日的统计数据

#### 1.3 获取指定时间段统计数据

**端点**: `GET /admin/stats/period`

**参数**:
- `startDate` (string): 开始日期 (YYYY-MM-DD)
- `endDate` (string): 结束日期 (YYYY-MM-DD)
- `type` (string): 统计类型 (visitors/orders/reviews)

### 2. 食堂管理

#### 2.1 获取食堂列表

**端点**: `GET /admin/canteens`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `status` (string): 状态筛选 (open/closed)

#### 2.2 获取食堂详情

**端点**: `GET /admin/canteens/{id}`

#### 2.3 创建食堂

**端点**: `POST /admin/canteens`

**请求体**:
```json
{
  "name": "第四食堂",
  "location": "东区教学楼旁",
  "openTime": "07:00",
  "closeTime": "21:00",
  "description": "新开设的食堂",
  "image": "图片URL"
}
```

#### 2.4 更新食堂信息

**端点**: `PUT /admin/canteens/{id}`

#### 2.5 删除食堂

**端点**: `DELETE /admin/canteens/{id}`

#### 2.6 更新食堂状态

**端点**: `PATCH /admin/canteens/{id}/status`

**请求体**:
```json
{
  "status": "open" // 或 "closed"
}
```

### 3. 档口管理

#### 3.1 获取档口列表

**端点**: `GET /admin/stalls`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `canteenId` (number): 食堂ID筛选

#### 3.2 获取档口详情

**端点**: `GET /admin/stalls/{id}`

#### 3.3 创建档口

**端点**: `POST /admin/stalls`

**请求体**:
```json
{
  "name": "麻辣香锅档口",
  "canteenId": 1,
  "category": "特色小吃",
  "description": "提供各种麻辣香锅",
  "image": "图片URL"
}
```

#### 3.4 更新档口信息

**端点**: `PUT /admin/stalls/{id}`

#### 3.5 删除档口

**端点**: `DELETE /admin/stalls/{id}`

### 4. 菜品管理

#### 4.1 获取菜品列表

**端点**: `GET /admin/dishes`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `stallId` (number): 档口ID筛选
- `category` (string): 分类筛选

#### 4.2 获取菜品详情

**端点**: `GET /admin/dishes/{id}`

#### 4.3 创建菜品

**端点**: `POST /admin/dishes`

**请求体**:
```json
{
  "name": "宫保鸡丁",
  "stallId": 1,
  "price": 12.00,
  "category": "热菜",
  "description": "经典川菜",
  "image": "图片URL",
  "available": true
}
```

#### 4.4 更新菜品信息

**端点**: `PUT /admin/dishes/{id}`

#### 4.5 删除菜品

**端点**: `DELETE /admin/dishes/{id}`

#### 4.6 批量操作菜品

**端点**: `POST /admin/dishes/batch`

**请求体**:
```json
{
  "action": "updatePrice", // 或 "delete", "updateStatus"
  "dishIds": [1, 2, 3],
  "updateData": {
    "price": 15.00
  }
}
```

### 5. 评论管理

#### 5.1 获取评论列表

**端点**: `GET /admin/reviews`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `status` (string): 状态筛选 (pending/approved/rejected)
- `rating` (number): 评分筛选 (1-5)

#### 5.2 获取评论详情

**端点**: `GET /admin/reviews/{id}`

#### 5.3 审核通过评论

**端点**: `PATCH /admin/reviews/{id}/approve`

#### 5.4 审核拒绝评论

**端点**: `PATCH /admin/reviews/{id}/reject`

**请求体**:
```json
{
  "reason": "评论内容不实"
}
```

#### 5.5 删除评论

**端点**: `DELETE /admin/reviews/{id}`

#### 5.6 获取待审核评论列表

**端点**: `GET /admin/reviews/pending`

### 6. 内容发布

#### 6.1 获取公告列表

**端点**: `GET /admin/announcements`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `status` (string): 状态筛选 (draft/published/archived)

#### 6.2 获取公告详情

**端点**: `GET /admin/announcements/{id}`

#### 6.3 创建公告

**端点**: `POST /admin/announcements`

**请求体**:
```json
{
  "title": "食堂营业时间调整通知",
  "content": "由于假期安排，各食堂营业时间将有所调整...",
  "type": "notice", // 或 "event", "promotion"
  "priority": "high", // 或 "medium", "low"
  "publishAt": "2023-12-01T00:00:00Z",
  "expireAt": "2023-12-31T23:59:59Z"
}
```

#### 6.4 更新公告

**端点**: `PUT /admin/announcements/{id}`

#### 6.5 删除公告

**端点**: `DELETE /admin/announcements/{id}`

#### 6.6 置顶/取消置顶公告

**端点**: `PATCH /admin/announcements/{id}/pin`

**请求体**:
```json
{
  "pinned": true
}
```

### 7. 用户管理

#### 7.1 获取用户列表

**端点**: `GET /admin/users`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `status` (string): 状态筛选 (active/inactive/banned)
- `role` (string): 角色筛选 (user/admin)

#### 7.2 获取用户详情

**端点**: `GET /admin/users/{id}`

#### 7.3 更新用户信息

**端点**: `PUT /admin/users/{id}`

#### 7.4 删除用户

**端点**: `DELETE /admin/users/{id}`

#### 7.5 更新用户状态

**端点**: `PATCH /admin/users/{id}/status`

**请求体**:
```json
{
  "status": "banned" // 或 "active", "inactive"
}
```

### 8. 数据报表

#### 8.1 获取访客数据报表

**端点**: `GET /admin/reports/visitors`

**参数**:
- `startDate` (string): 开始日期 (YYYY-MM-DD)
- `endDate` (string): 结束日期 (YYYY-MM-DD)
- `type` (string): 报表类型 (daily/weekly/monthly)

#### 8.2 获取菜品数据报表

**端点**: `GET /admin/reports/dishes`

#### 8.3 获取食堂数据报表

**端点**: `GET /admin/reports/canteens`

#### 8.4 获取评论数据报表

**端点**: `GET /admin/reports/reviews`

#### 8.5 导出报表

**端点**: `GET /admin/reports/export`

**参数**:
- `type` (string): 报表类型 (visitors/dishes/canteens/reviews)
- `format` (string): 导出格式 (excel/pdf/csv)
- `startDate` (string): 开始日期 (YYYY-MM-DD)
- `endDate` (string): 结束日期 (YYYY-MM-DD)

### 9. 批量操作

#### 9.1 批量导入数据

**端点**: `POST /admin/batch/import`

**请求体**: multipart/form-data
- `file` (file): 导入文件
- `type` (string): 数据类型 (dishes/stalls/canteens)

#### 9.2 批量导出数据

**端点**: `GET /admin/batch/export`

**参数**:
- `type` (string): 数据类型 (dishes/stalls/canteens)
- `format` (string): 导出格式 (excel/csv)
- `filters` (object): 筛选条件

#### 9.3 批量更新数据

**端点**: `POST /admin/batch/update`

**请求体**:
```json
{
  "type": "dishes", // 或 "stalls", "canteens"
  "ids": [1, 2, 3],
  "updateData": {
    "status": "inactive"
  }
}
```

### 10. 任务管理

#### 10.1 获取任务列表

**端点**: `GET /admin/tasks`

**参数**:
- `page` (number): 页码，默认1
- `limit` (number): 每页数量，默认10
- `status` (string): 状态筛选 (pending/completed/cancelled)

#### 10.2 获取任务详情

**端点**: `GET /admin/tasks/{id}`

#### 10.3 完成任务

**端点**: `PATCH /admin/tasks/{id}/complete`

**请求体**:
```json
{
  "notes": "任务完成说明",
  "attachments": ["文件URL1", "文件URL2"]
}
```

#### 10.4 删除任务

**端点**: `DELETE /admin/tasks/{id}`

### 11. 系统设置

#### 11.1 获取系统设置

**端点**: `GET /admin/settings`

#### 11.2 更新系统设置

**端点**: `PUT /admin/settings`

**请求体**:
```json
{
  "siteName": "校园食光",
  "contactEmail": "admin@campusfood.com",
  "maintenanceMode": false,
  "announcementDisplayDays": 7
}
```

## 错误代码

| 错误代码 | 描述 |
|---------|------|
| UNAUTHORIZED | 未授权访问 |
| FORBIDDEN | 权限不足 |
| NOT_FOUND | 资源不存在 |
| VALIDATION_ERROR | 数据验证失败 |
| SERVER_ERROR | 服务器内部错误 |

## 使用示例

### JavaScript (使用AdminAPI工具类)

```javascript
// 获取今日统计数据
const todayStats = await AdminAPI.getTodayStats();
console.log('今日访客数:', todayStats.data.visitors);

// 创建新食堂
const newCanteen = await AdminAPI.createCanteen({
  name: "第四食堂",
  location: "东区教学楼旁",
  openTime: "07:00",
  closeTime: "21:00"
});

// 审核通过评论
await AdminAPI.approveReview(reviewId);

// 批量更新菜品价格
await AdminAPI.batchOperateDishes({
  action: "updatePrice",
  dishIds: [1, 2, 3],
  updateData: { price: 15.00 }
});
```

### cURL

```bash
# 获取食堂列表
curl -X GET "http://39.108.138.4:5000/api/admin/canteens" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# 创建新食堂
curl -X POST "http://39.108.138.4:5000/api/admin/canteens" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "第四食堂",
    "location": "东区教学楼旁",
    "openTime": "07:00",
    "closeTime": "21:00"
  }'
```

## 注意事项

1. 所有时间格式均使用ISO 8601标准 (YYYY-MM-DDTHH:mm:ssZ)
2. 分页查询的页码从1开始
3. 批量操作的单次处理数量限制为100条
4. 文件上传大小限制为10MB
5. API调用频率限制为每分钟100次

## 更新日志

### v1.0.0 (2023-12-01)
- 初始版本发布
- 包含所有基础管理功能接口