(function () {
    if (window.StaticImageLinker) {
        return;
    }

    const DEFAULT_DIR = '/uploads/dishes';
    const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const TEXT_SELECTORS = [
        '.card-img',
        '.recommend-img',
        '.post-img',
        '.dish-img',
        '.recommendation-img',
        '.collection-img',
        '.browse-img',
        '.canteen-img',
        '.food-img',
        '.item-img'
    ];
    let observer = null;

    const ALIAS_MAP = {
        '麻辣烫': ['麻辣香锅']
    };

    function normalizeName(text) {
        if (!text) {
            return '';
        }

        return String(text)
            .trim()
            .replace(/图片|特写|环境|档口|价格单|外观|食材区|优惠海报|窗口/gi, '')
            .replace(/[\s\-_]+/g, '')
            .replace(/[()（）【】\[\]{}'"`~!@#$%^&*+=|;:,<>?，。！？、：；“”‘’]/g, '')
            .trim();
    }

    function getBaseDirs() {
        const dirs = new Set([DEFAULT_DIR]);

        try {
            if (window.location && window.location.origin) {
                dirs.add(`${window.location.origin}${DEFAULT_DIR}`);
            }
        } catch (e) {
            // ignore
        }

        try {
            if (window.CONFIG && window.CONFIG.API_BASE_URL) {
                const apiOrigin = String(window.CONFIG.API_BASE_URL).replace(/\/api\/?$/, '');
                dirs.add(`${apiOrigin}${DEFAULT_DIR}`);
            }
        } catch (e) {
            // ignore
        }

        return Array.from(dirs);
    }

    function buildNameVariants(rawName) {
        const raw = String(rawName || '').trim().replace(/\.[^.]+$/, '');
        const normalized = normalizeName(raw);
        const variants = new Set();

        if (raw) {
            variants.add(raw);
            variants.add(raw.replace(/[\s\-_]+/g, ''));
            if (raw.endsWith('图片')) {
                variants.add(raw.replace(/图片$/, ''));
            }
        }

        if (normalized) {
            variants.add(normalized);
            variants.add(`${normalized}图片`);

            if (ALIAS_MAP[normalized]) {
                ALIAS_MAP[normalized].forEach((alias) => variants.add(alias));
            }
        }

        return Array.from(variants).filter(Boolean);
    }

    function buildCandidates(rawName) {
        const dirs = getBaseDirs();
        const names = buildNameVariants(rawName);
        const candidates = [];

        for (const dir of dirs) {
            for (const name of names) {
                for (const ext of EXTENSIONS) {
                    candidates.push(`${dir}/${encodeURIComponent(name)}${ext}`);
                }
            }
        }

        return candidates;
    }

    function attachFallback(img, candidates, onFailAll) {
        let index = 0;

        if (!candidates || candidates.length === 0) {
            if (typeof onFailAll === 'function') {
                onFailAll();
            }
            return;
        }

        img.onload = function () {
            img.dataset.imageLinked = '1';
        };

        img.onerror = function () {
            index += 1;
            if (index >= candidates.length) {
                if (typeof onFailAll === 'function') {
                    onFailAll();
                }
                return;
            }
            img.src = candidates[index];
        };

        img.src = candidates[index];
    }

    function createImgNode(candidates, alt, onFailAll) {
        const img = document.createElement('img');
        img.alt = alt || 'dish';
        img.loading = 'lazy';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.display = 'block';
        attachFallback(img, candidates, onFailAll);
        return img;
    }

    function processTextPlaceholder(el) {
        if (!el || el.dataset.imageLinked === '1') {
            return;
        }

        const text = (el.textContent || '').trim();
        if (!text) {
            return;
        }

        const candidates = buildCandidates(text);
        if (candidates.length === 0) {
            return;
        }

        const originalText = text;
        el.innerHTML = '';
        el.appendChild(
            createImgNode(candidates, text, () => {
                el.textContent = originalText;
            })
        );
    }

    function parsePlaceholderTextFromUrl(src) {
        if (!src || !src.includes('via.placeholder.com')) {
            return '';
        }

        const match = src.match(/[?&]text=([^&]+)/i);
        if (!match) {
            return '';
        }

        try {
            return decodeURIComponent(match[1]);
        } catch (e) {
            return match[1];
        }
    }

    function processPlaceholderImg(img) {
        if (!img || img.dataset.imageLinked === '1') {
            return;
        }

        const text = parsePlaceholderTextFromUrl(img.src) || img.alt || img.getAttribute('data-name') || '';
        if (!text) {
            return;
        }

        const candidates = buildCandidates(text);
        if (candidates.length === 0) {
            return;
        }

        attachFallback(img, candidates);
    }

    function processAll(root) {
        const scope = root || document;

        const textNodes = [];
        for (const selector of TEXT_SELECTORS) {
            const nodes = scope.querySelectorAll ? scope.querySelectorAll(selector) : [];
            nodes.forEach((node) => textNodes.push(node));
        }

        textNodes.forEach((node) => processTextPlaceholder(node));

        const imgNodes = scope.querySelectorAll ? scope.querySelectorAll('img[src*="via.placeholder.com"]') : [];
        imgNodes.forEach((img) => processPlaceholderImg(img));
    }

    function startObserver() {
        if (observer) {
            return;
        }

        observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType !== 1) {
                        return;
                    }
                    processAll(node);
                });
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    window.StaticImageLinker = {
        init() {
            processAll(document);
            startObserver();
        },
        process(root) {
            processAll(root || document);
        },
        normalizeName
    };
})();
