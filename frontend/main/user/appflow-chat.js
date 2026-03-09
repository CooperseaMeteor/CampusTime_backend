// Shared Appflow floating chat bootstrap for user pages.
(function () {
    var INTEGRATE_ID = 'cit-16a8d24bfaea4a2a9c8c';
    var REQUEST_DOMAIN = 'https://1494565958858265.appflow.aliyunnest.com';

    if (window.__appflowChatBootstrapped) {
        return;
    }

    // AI assistant page keeps in-page chat and does not use floating widget.
    var page = (window.location.pathname.split('/').pop() || '').toLowerCase();
    if (page === 'user_ai_assistant.html') {
        return;
    }

    function initSdk() {
        if (!window.APPFLOW_CHAT_SDK || typeof window.APPFLOW_CHAT_SDK.init !== 'function') {
            return;
        }

        window.APPFLOW_CHAT_SDK.init({
            integrateConfig: {
                integrateId: INTEGRATE_ID,
                domain: {
                    requestDomain: REQUEST_DOMAIN
                },
                draggable: true
            }
        });

        window.__appflowChatBootstrapped = true;
    }

    var sdkSrc = 'https://o.alicdn.com/appflow/chatbot/v1/AppflowChatSDK.js';
    var existing = document.querySelector('script[src="' + sdkSrc + '"]');

    if (existing) {
        if (window.APPFLOW_CHAT_SDK) {
            initSdk();
        } else {
            existing.addEventListener('load', initSdk, { once: true });
        }
        return;
    }

    var script = document.createElement('script');
    script.src = sdkSrc;
    script.async = true;
    script.onload = initSdk;
    document.head.appendChild(script);
})();
