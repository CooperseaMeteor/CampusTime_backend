#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const REFERENCE_SOURCES = [
    { table: 'users', column: 'avatar' },
    { table: 'dishes', column: 'image' },
    { table: 'merchants', column: 'banner_image' },
    { table: 'posts', column: 'image' },
    { table: 'reviews', column: 'images' },
    { table: 'content_audit', column: 'images' }
];

function parseArgs(argv) {
    const args = new Set(argv.slice(2));
    let minAgeDays = 7;

    for (let i = 2; i < argv.length; i += 1) {
        const current = argv[i];
        if (current === '--min-age-days' && argv[i + 1]) {
            minAgeDays = Number(argv[i + 1]);
        }
        if (current.startsWith('--min-age-days=')) {
            minAgeDays = Number(current.split('=')[1]);
        }
    }

    if (!Number.isFinite(minAgeDays) || minAgeDays < 0) {
        throw new Error('参数错误: --min-age-days 必须是大于等于 0 的数字');
    }

    return {
        apply: args.has('--apply'),
        minAgeDays
    };
}

function normalizeUploadsRef(input) {
    if (typeof input !== 'string') {
        return null;
    }

    let value = input.trim();
    if (!value) {
        return null;
    }

    value = value.replace(/\\/g, '/');

    const queryIndex = value.search(/[?#]/);
    if (queryIndex >= 0) {
        value = value.slice(0, queryIndex);
    }

    try {
        value = decodeURIComponent(value);
    } catch (err) {
        // ignore malformed URI sequences
    }

    const lower = value.toLowerCase();
    const marker = '/uploads/';
    const markerIndex = lower.indexOf(marker);

    if (markerIndex >= 0) {
        value = value.slice(markerIndex + marker.length);
    } else if (lower.startsWith('uploads/')) {
        value = value.slice('uploads/'.length);
    } else if (lower.startsWith('/uploads/')) {
        value = value.slice('/uploads/'.length);
    } else {
        const isSingleFileName = !value.includes('/');
        if (!isSingleFileName) {
            return null;
        }
    }

    value = value.replace(/^\.+\//, '').replace(/^\/+/, '');

    if (!value || value.includes('..')) {
        return null;
    }

    return value.replace(/\/+/g, '/');
}

function extractRefs(raw) {
    const results = [];

    const walk = (node) => {
        if (node == null) {
            return;
        }

        if (typeof node === 'string') {
            const trimmed = node.trim();
            if (!trimmed) {
                return;
            }

            if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                try {
                    walk(JSON.parse(trimmed));
                    return;
                } catch (err) {
                    // not a valid JSON string, continue as normal string
                }
            }

            const normalized = normalizeUploadsRef(trimmed);
            if (normalized) {
                results.push(normalized);
            }
            return;
        }

        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }

        if (typeof node === 'object') {
            Object.values(node).forEach(walk);
        }
    };

    walk(raw);
    return results;
}

function listUploadFilesRecursively(rootDir) {
    const files = [];

    const walk = (currentDir) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                walk(fullPath);
                continue;
            }

            if (!entry.isFile()) {
                continue;
            }

            if (entry.name === '.gitkeep') {
                continue;
            }

            const stats = fs.statSync(fullPath);
            const relPath = path.relative(rootDir, fullPath).split(path.sep).join('/');

            files.push({
                relPath,
                fullPath,
                mtimeMs: stats.mtimeMs
            });
        }
    };

    walk(rootDir);
    return files;
}

async function getExistingReferenceSources() {
    const existing = [];

    for (const source of REFERENCE_SOURCES) {
        const [rows] = await pool.query(
            `
            SELECT 1
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = ?
              AND COLUMN_NAME = ?
            LIMIT 1
            `,
            [source.table, source.column]
        );

        if (rows.length > 0) {
            existing.push(source);
        }
    }

    return existing;
}

async function collectReferencedFiles() {
    const referenced = new Set();
    const existingSources = await getExistingReferenceSources();

    for (const source of existingSources) {
        const sql = `SELECT \`${source.column}\` AS value FROM \`${source.table}\` WHERE \`${source.column}\` IS NOT NULL`;
        const [rows] = await pool.query(sql);

        rows.forEach((row) => {
            extractRefs(row.value).forEach((item) => referenced.add(item));
        });
    }

    return {
        referenced,
        existingSources
    };
}

async function main() {
    const startedAt = Date.now();
    const { apply, minAgeDays } = parseArgs(process.argv);

    if (!fs.existsSync(UPLOADS_DIR)) {
        throw new Error(`上传目录不存在: ${UPLOADS_DIR}`);
    }

    const minAgeMs = minAgeDays * 24 * 60 * 60 * 1000;
    const now = Date.now();

    const allUploadFiles = listUploadFilesRecursively(UPLOADS_DIR);
    const { referenced, existingSources } = await collectReferencedFiles();

    const orphanCandidates = allUploadFiles.filter((file) => {
        if (referenced.has(file.relPath)) {
            return false;
        }

        return now - file.mtimeMs >= minAgeMs;
    });

    console.log('=== 上传文件清理检查 ===');
    console.log(`模式: ${apply ? 'APPLY(实际删除)' : 'DRY-RUN(仅预览)'}`);
    console.log(`最小文件年龄: ${minAgeDays} 天`);
    console.log(`上传目录: ${UPLOADS_DIR}`);
    console.log(`存在的引用来源: ${existingSources.map((s) => `${s.table}.${s.column}`).join(', ') || '无'}`);
    console.log(`磁盘文件总数: ${allUploadFiles.length}`);
    console.log(`数据库引用文件数: ${referenced.size}`);
    console.log(`可清理候选数: ${orphanCandidates.length}`);

    if (orphanCandidates.length > 0) {
        console.log('\n候选文件(最多显示 50 条):');
        orphanCandidates.slice(0, 50).forEach((file) => {
            console.log(`- ${file.relPath}`);
        });
        if (orphanCandidates.length > 50) {
            console.log(`... 其余 ${orphanCandidates.length - 50} 条未显示`);
        }
    }

    let deletedCount = 0;

    if (apply) {
        for (const file of orphanCandidates) {
            try {
                fs.unlinkSync(file.fullPath);
                deletedCount += 1;
            } catch (err) {
                console.error(`删除失败: ${file.relPath} - ${err.message}`);
            }
        }
    }

    const durationMs = Date.now() - startedAt;
    console.log('\n=== 完成 ===');
    console.log(`已删除文件数: ${deletedCount}`);
    console.log(`耗时: ${durationMs} ms`);

    if (!apply && orphanCandidates.length > 0) {
        console.log('\n如需执行删除，请运行:');
        console.log('node scripts/cleanup-unused-uploads.js --apply');
    }
}

main()
    .catch((err) => {
        console.error('清理脚本执行失败:', err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await pool.end();
        } catch (err) {
            // ignore pool close errors
        }
    });
