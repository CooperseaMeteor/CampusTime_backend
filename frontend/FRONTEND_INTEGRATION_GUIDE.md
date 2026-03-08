## 一、已上线/可直接用

- 用户/登录：注册、登录、刷新、登出、获取当前用户信息、更新资料（GET /api/user，POST /api/user）；表：users、refresh_tokens。
- 商户/档口/菜品/评价：
  - 商户列表、详情：`GET /api/merchants`，`GET /api/merchants/:id`
  - 商户下档口：`GET /api/merchants/:id/stalls`
  - 档口详情：`GET /api/stalls/:id`
  - 档口下菜品：`GET /api/stalls/:id/dishes`
  - 全部菜品：`GET /api/dishes`
  - 评价列表：`GET /api/reviews`
  - 创建评价：`POST /api/dishes/:id/reviews`（需登录，rating 1-5）
- 社区动态/评论/点赞：
  - 动态流：`GET /api/posts?tab=recommend|latest&page&limit`
  - 发帖：`POST /api/posts`（需登录）
  - 评论：`GET /api/posts/:id/comments`，`POST /api/posts/:id/comments`（需登录）
  - 点赞：`POST /api/posts/:id/like`（需登录）
- 打卡/想去：`POST /api/merchants/:id/checkin`，`POST /api/merchants/:id/wish`（均需登录）
- 订单列表：`GET /api/orders`（需登录，page/limit）
- 管理端：`GET /api/admin/stats/today`，`GET /api/admin/dishes`，`PATCH /api/admin/dishes/:id`

## 二、页面替换指引

- 首页：社区动态流 → `GET /api/posts`；推荐卡片 → 先用 `GET /api/dishes` 热度排序。
- 社区页：帖子列表 → `GET /api/posts`；发布 → `POST /api/posts`；评论 → `GET/POST /api/posts/:id/comments`；点赞 → `POST /api/posts/:id/like`。
- 商户详情页：讨论嵌入可先用 `GET /api/posts`；“想去/已打卡” → `POST /api/merchants/:id/wish` / `POST /api/merchants/:id/checkin`。
- 档口菜单页：库存/标签字段已可用；评价入口 → `POST /api/dishes/:id/reviews`。
- 个人中心：用户信息 → `GET /api/user`；编辑保存 → `POST /api/user`；订单/足迹 → `GET /api/orders`；AI 偏好/历史暂未实现。

## 三、后续计划（可后置）

- AI 对话历史/偏好：表 ai_dialogs、user_preferences；接口 `GET/POST /api/ai/history`，`GET/POST /api/user/preferences`。
- 扩展：商户维度帖子过滤、帖子审核/置顶/删除。

## 四、前后端字段对齐要点

- 所有接口统一 `{code, message, data}`；分页时 data 为 `{list, total}`（目前 posts/comments/orders 使用 limit/page）。
- 图片/头像字段使用绝对 URL。
- `tags` 用 JSON 数组存储，前端直接 map。
- 时间字段统一 ISO 或 `YYYY-MM-DD HH:mm:ss`。

## 五、落地指引

- 基础域名：`https://campusfood.cn/api`
- 鉴权：用户态接口需 `Authorization: Bearer <accessToken>`
- 刷新：接口返回 401 时前端已封装 refresh 自动重试