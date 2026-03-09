const express = require('express');

const router = express.Router();

async function readJsonSafe(response) {
    const text = await response.text();
    try {
        return { text, data: JSON.parse(text) };
    } catch (e) {
        return { text, data: null };
    }
}

function extractReplyFromAny(data) {
    const candidates = [
        data?.answer,
        data?.reply,
        data?.output?.text,
        data?.output?.answer,
        data?.output?.message?.content,
        data?.output,
        data?.data?.answer,
        data?.data?.reply,
        data?.data?.output,
        data?.result,
        data?.text,
        data?.message,
        data?.choices?.[0]?.message?.content,
        data?.output?.choices?.[0]?.message?.content
    ];

    for (const item of candidates) {
        if (typeof item === 'string' && item.trim()) {
            return item.trim();
        }
    }

    return '';
}

async function callAppflowWebhook({ webhookUrl, userMessage, history, timeoutMs }) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const payload = {
            message: userMessage,
            query: userMessage,
            input: userMessage,
            history,
            stream: false
        };

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const result = await readJsonSafe(response);
        if (!response.ok) {
            return {
                ok: false,
                status: response.status,
                detail: result.data || result.text
            };
        }

        const reply = extractReplyFromAny(result.data);
        return {
            ok: true,
            reply,
            raw: result.data || result.text
        };
    } finally {
        clearTimeout(timeoutId);
    }
}

router.post('/chat', async (req, res) => {
    try {
        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== 'string') {
            return res.status(400).json({ code: 400, message: 'message 不能为空' });
        }

        const appflowWebhookUrl = process.env.APPFLOW_WEBHOOK_URL;
        const apiKey = process.env.DASHSCOPE_API_KEY;
        const model = process.env.DASHSCOPE_MODEL || 'qwen-max';
        const timeoutMs = Number(process.env.AI_TIMEOUT_MS || 30000);

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

        // 优先走 AppFlow webhook（适配你训练在 AppFlow 的智能体）。
        if (appflowWebhookUrl) {
            const appflowResult = await callAppflowWebhook({
                webhookUrl: appflowWebhookUrl,
                userMessage: message,
                history: safeHistory,
                timeoutMs
            });

            if (appflowResult.ok) {
                return res.json({
                    code: 200,
                    message: 'ok',
                    data: {
                        reply: appflowResult.reply || '抱歉，我暂时无法理解这个问题。请换种方式提问。'
                    }
                });
            }

            return res.status(appflowResult.status || 500).json({
                code: appflowResult.status || 500,
                message: 'AppFlow Webhook 调用失败',
                detail: appflowResult.detail
            });
        }

        if (!apiKey) {
            return res.status(500).json({ code: 500, message: '服务端未配置 APPFLOW_WEBHOOK_URL 或 DASHSCOPE_API_KEY' });
        }

        // 优先使用 OpenAI 兼容模式，稳定性通常更好。
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const primaryResponse = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7
            }),
            signal: controller.signal
        });

        const primaryResult = await readJsonSafe(primaryResponse);

        if (primaryResponse.ok) {
            clearTimeout(timeoutId);

            const reply =
                primaryResult.data?.choices?.[0]?.message?.content ||
                primaryResult.data?.output?.text ||
                '';

            return res.json({
                code: 200,
                message: 'ok',
                data: { reply: reply || '抱歉，我暂时无法理解这个问题。请换种方式提问。' }
            });
        }

        // 兼容模式失败时，回退到旧版 generation 接口，避免线上中断。
        const fallbackResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
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

        const fallbackResult = await readJsonSafe(fallbackResponse);

        if (!fallbackResponse.ok) {
            return res.status(fallbackResponse.status).json({
                code: fallbackResponse.status,
                message: '阿里云接口调用失败',
                detail: {
                    primary: primaryResult.data || primaryResult.text,
                    fallback: fallbackResult.data || fallbackResult.text
                }
            });
        }

        const reply =
            fallbackResult.data?.output?.text ||
            fallbackResult.data?.output?.choices?.[0]?.message?.content ||
            fallbackResult.data?.choices?.[0]?.message?.content ||
            fallbackResult.data?.output?.message?.content ||
            '';

        return res.json({
            code: 200,
            message: 'ok',
            data: { reply: reply || '抱歉，我暂时无法理解这个问题。请换种方式提问。' }
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
