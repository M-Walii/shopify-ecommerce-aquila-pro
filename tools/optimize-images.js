#!/usr/bin/env node
/**
 * Optimize images inside /docs using sharp.
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const IMAGES_DIR = path.resolve(__dirname, '..', 'docs');
const EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

async function walk(dir){
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for(const e of entries){
    const full = path.join(dir, e.name);
    if(e.isDirectory()) await walk(full);
    else if(EXTS.has(path.extname(e.name).toLowerCase())) await optimize(full);
  }
}

async function optimize(file){
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);
  const outWebp = base + '.webp';
  const image = sharp(file).rotate();
  await image.webp({ quality: 75 }).toFile(outWebp);
  const { size: inSize } = await fs.promises.stat(file);
  const { size: outSize } = await fs.promises.stat(outWebp);
  console.log(`Optimized: ${path.basename(file)} -> ${path.basename(outWebp)} (${Math.round(outSize/inSize*100)}%)`);
}

walk(IMAGES_DIR).catch(err=>{ console.error(err); process.exit(1); });
