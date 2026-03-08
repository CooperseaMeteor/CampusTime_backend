#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

const BASE_UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
const DEFAULT_SUB_DIR = 'dishes';
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function parseArgs(argv) {
    const args = argv.slice(2);
    let apply = false;
    let subDir = DEFAULT_SUB_DIR;

    for (let i = 0; i < args.length; i += 1) {
        const current = args[i];
        if (current === '--apply') {
            apply = true;
            continue;
        }
        if (current === '--dir' && args[i + 1]) {
            subDir = args[i + 1];
            i += 1;
            continue;
        }
        if (current.startsWith('--dir=')) {
            subDir = current.split('=')[1] || DEFAULT_SUB_DIR;
        }
    }

    return {
        apply,
        subDir: String(subDir || DEFAULT_SUB_DIR).replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
    };
}

function normalizeText(input) {
    if (!input) {
        return '';
    }

    return String(input)
        .toLowerCase()
        .trim()
        .replace(/\.[^.]+$/, '')
        .replace(/[\s\-_]+/g, '')
        .replace(/[()（）【】\[\]{}'"`~!@#$%^&*+=|;:,<>?，。！？、：；“”‘’]/g, '');
}

function collectImageFiles(dirPath, subDir) {
    if (!fs.existsSync(dirPath)) {
        return [];
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const files = [];

    for (const entry of entries) {
        if (!entry.isFile()) {
            continue;
        }

        const ext = path.extname(entry.name).toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            continue;
        }

        files.push({
            fileName: entry.name,
            normalizedBaseName: normalizeText(path.basename(entry.name, ext)),
            relativeUrl: `/uploads/${subDir}/${entry.name}`
        });
    }

    return files;
}

async function loadDishes() {
    const [rows] = await pool.query('SELECT id, name, image FROM dishes');
    return rows;
}

function buildImageMap(files) {
    const map = new Map();

    for (const file of files) {
        if (!file.normalizedBaseName) {
            continue;
        }

        if (!map.has(file.normalizedBaseName)) {
            map.set(file.normalizedBaseName, []);
        }

        map.get(file.normalizedBaseName).push(file);
    }

    return map;
}

async function main() {
    const startedAt = Date.now();
    const { apply, subDir } = parseArgs(process.argv);

    const targetDir = path.join(BASE_UPLOADS_DIR, subDir);
    const files = collectImageFiles(targetDir, subDir);
    const imageMap = buildImageMap(files);
    const dishes = await loadDishes();

    const toUpdate = [];
    const unmatched = [];
    const ambiguous = [];

    for (const dish of dishes) {
        const normalizedDishName = normalizeText(dish.name);
        if (!normalizedDishName) {
            continue;
        }

        const candidates = imageMap.get(normalizedDishName) || [];

        if (candidates.length === 0) {
            unmatched.push(dish);
            continue;
        }

        if (candidates.length > 1) {
            ambiguous.push({ dish, candidates });
            continue;
        }

        const matched = candidates[0];
        if (dish.image === matched.relativeUrl) {
            continue;
        }

        toUpdate.push({
            id: dish.id,
            name: dish.name,
            oldImage: dish.image,
            newImage: matched.relativeUrl,
            fileName: matched.fileName
        });
    }

    console.log('=== Dish Image Link By Name ===');
    console.log(`Mode: ${apply ? 'APPLY' : 'DRY-RUN'}`);
    console.log(`Image directory: ${targetDir}`);
    console.log(`Image file count: ${files.length}`);
    console.log(`Dish count: ${dishes.length}`);
    console.log(`Match ready count: ${toUpdate.length}`);
    console.log(`Unmatched dish count: ${unmatched.length}`);
    console.log(`Ambiguous match count: ${ambiguous.length}`);

    if (toUpdate.length > 0) {
        console.log('\nPlanned updates (max 50 shown):');
        toUpdate.slice(0, 50).forEach((item) => {
            console.log(`- [${item.id}] ${item.name}: ${item.oldImage || '(empty)'} -> ${item.newImage}`);
        });
        if (toUpdate.length > 50) {
            console.log(`... and ${toUpdate.length - 50} more`);
        }
    }

    if (ambiguous.length > 0) {
        console.log('\nAmbiguous matches (manual handling needed, max 20 shown):');
        ambiguous.slice(0, 20).forEach(({ dish, candidates }) => {
            const names = candidates.map((c) => c.fileName).join(', ');
            console.log(`- [${dish.id}] ${dish.name}: ${names}`);
        });
    }

    let updatedCount = 0;
    if (apply && toUpdate.length > 0) {
        for (const item of toUpdate) {
            await pool.query('UPDATE dishes SET image = ? WHERE id = ?', [item.newImage, item.id]);
            updatedCount += 1;
        }
    }

    console.log('\n=== Done ===');
    console.log(`Updated rows: ${updatedCount}`);
    console.log(`Elapsed: ${Date.now() - startedAt} ms`);

    if (!apply) {
        console.log('\nTo apply changes, run:');
        console.log('node scripts/link-dish-images-by-name.js --apply');
    }
}

main()
    .catch((err) => {
        console.error('Script failed:', err.message);
        process.exitCode = 1;
    })
    .finally(async () => {
        try {
            await pool.end();
        } catch (err) {
            // ignore
        }
    });
