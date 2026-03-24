import fs from 'fs';
import path from 'path';
import axios from 'axios';

/**
 * ファイルを書き込む
 */
export async function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Created: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Failed to write file ${filePath}:`, error);
    throw error;
  }
}

/**
 * 画像をダウンロード
 */
export async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer'
    });

    // ディレクトリ作成
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(outputPath, response.data);
    console.log(`✓ Downloaded image: ${outputPath}`);
    return true;
  } catch (error) {
    console.error(`Failed to download image from ${imageUrl}:`, error);
    return false;
  }
}

/**
 * ファイルが存在するか確認
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * ファイル内容を読む
 */
export function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Failed to read file ${filePath}:`, error);
    return null;
  }
}

/**
 * ディレクトリ内のファイル一覧を取得
 */
export function listFiles(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return [];
    }
    return fs.readdirSync(dirPath);
  } catch (error) {
    console.error(`Failed to list files in ${dirPath}:`, error);
    return [];
  }
}

/**
 * スラッグからファイル名を生成
 */
export function generateFileName(slug) {
  // スラッグを正規化（安全なファイル名に）
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') + '.md';
}
