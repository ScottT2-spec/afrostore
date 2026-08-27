#!/usr/bin/env node

/**
 * Workspace-wide Prokip rebrand pass.
 *
 * This script rewrites Prokip LTD branding to Prokip / Prokip LTD and replaces
 * Prokip LTD-hosted image URLs with local assets from /public/uploads.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = '/Users/mav/Documents/prokip';
const TEXT_EXTENSIONS = new Set(['.html', '.htm', '.js', '.ts', '.tsx', '.json', '.md', '.sql', '.mjs', '.css']);
const SKIP_DIRS = new Set(['.git', 'node_modules', '.next', 'dist', 'build', 'coverage']);

const IMAGE_REPLACEMENTS = [
  { test: /\/fashion\//, file: '/uploads/1782841159287-49176ad23c5f1c7a3a6a2e4e.png' },
  { test: /\/electronics\//, file: '/uploads/1782841298863-b277095b6594bf28a22c5e8d.png' },
  { test: /\/beauty\/perfumes|\/perfumes\//, file: '/uploads/1782849639264-432053c21c9d1d34c04e23a3.png' },
  { test: /\/beauty\/cosmetics|\/beauty\/makeup|\/makeup\//, file: '/uploads/1782849669734-a7cf8d8eb60a10d9e83d5664.png' },
  { test: /\/children\//, file: '/uploads/1782850966159-157829bd8a3b567e981c1399.png' },
  { test: /\/bakery\//, file: '/uploads/1782851081335-ef40430c481abd51406e0f40.png' },
  { test: /\/health\//, file: '/uploads/1782916258406-43258fa3f9d229c5dd6fad61.png' },
  { test: /landing-gadget/, file: '/uploads/1782919584004-fc162ee8b1c27ced2dddb993.png' },
  { test: /\/interior-design\//, file: '/uploads/1782920940731-b8b92506ae654da5cbf60c4d.png' },
  { test: /\/artsy\//, file: '/uploads/1782920972332-3d32725712386a80d8040c1d.png' },
  { test: /\/beverage\//, file: '/uploads/1782921884158-f67979853394e4544d31e418.png' },
];

function chooseLocalImage(filePath) {
  for (const entry of IMAGE_REPLACEMENTS) {
    if (entry.test.test(filePath)) {
      return entry.file;
    }
  }
  return '/prokip-logo.png';
}

function isImageUrl(url) {
  return /\.(png|jpe?g|webp|svg|gif)(?:[?#].*)?$/i.test(url);
}

function replaceprokipImageUrls(content, filePath) {
  const imageUrlPattern = /(?:https?:\/\/|\/\/)?(?:prokip|prokip)\.xtemos\.com[^"'`\s)]+?\.(?:png|jpe?g|webp|svg|gif)(?:\?[^"'`\s)]*)?/gi;
  return content.replace(imageUrlPattern, () => chooseLocalImage(filePath));
}

function replaceBrandText(content) {
  return content
    .replace(/\bprokip\b/g, 'Prokip LTD')
    .replace(/\bprokip\b/g, 'Prokip LTD')
    .replace(/\bprokip\b/g, 'PROKIP')
    .replace(/\bprokip\b/g, 'prokip');
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = replaceBrandText(replaceprokipImageUrls(original, filePath));

  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    console.log(`updated ${filePath}`);
    return true;
  }

  return false;
}

function shouldProcess(filePath) {
  if (!TEXT_EXTENSIONS.has(path.extname(filePath))) {
    return false;
  }

  const parts = filePath.split(path.sep);
  return !parts.some(part => SKIP_DIRS.has(part));
}

function main() {
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'dist' || entry.name === 'build' || entry.name === 'coverage') {
        continue;
      }

      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && shouldProcess(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  walk(ROOT_DIR);

  let modifiedCount = 0;
  for (const file of files) {
    if (processFile(file)) {
      modifiedCount++;
    }
  }

  console.log(`rebranded ${modifiedCount} files`);
}

main();
