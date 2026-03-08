const express = require('express');

const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ code: 400, message: 'message 不能为空' });
        }

        const apiKey = process.env.DASHSCOPE_API_KEY;
        const model = process.env.DASHSCOPE_MODEL || 'qwen-max';
        const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);

        if (!apiKey) {
            return res.status(500).json({ code: 500, message: '服务端未配置 DASHSCOPE_API_KEY' });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
        const messages = [
            {
                role: 'system',
                content: '你是校园食光AI助手，专门帮助大学生解决校园美食相关问题。你可以推荐食堂和菜品，查询营业时间，提供健康饮食建议，识别菜品图片，解答校园美食问题。请用友好、专业的语气回答。'
            },
            ...safeHistory,
            {
                role: 'user',
                content: message
            }
        ];

        const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`,
                'X-DashScope-SSEService': 'bailian'
            },
            body: JSON.stringify({
                model,
                input: { messages },
                parameters: {
                    result_format: 'message',
                    incremental_output: false
                }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        const text = await response.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = null;
        }

        if (!response.ok) {
            return res.status(response.status).json({
                code: response.status,
                message: '阿里云接口调用失败',
                detail: data || text
            });
        }

        const reply =
            data?.output?.text ||
            data?.output?.choices?.[0]?.message?.content ||
            data?.choices?.[0]?.message?.content ||
            data?.output?.message?.content ||
            '';

        return res.json({
            code: 200,
            message: 'ok',
            data: { reply }
        });
    } catch (error) {
        const msg = error?.name === 'AbortError' ? 'AI请求超时' : 'AI服务异常';
        return res.status(500).json({
            code: 500,
            message: msg,
            error: error.message
        });
    }
});

module.exports = router;
