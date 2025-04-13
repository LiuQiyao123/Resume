const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

class FileUtils {
  // 获取文件URL
  static getFileUrl(filePath) {
    if (!filePath) return null;
    return `/uploads/${path.basename(path.dirname(filePath))}/${path.basename(filePath)}`;
  }

  // 删除文件
  static async deleteFile(filePath) {
    try {
      if (filePath && fs.existsSync(filePath)) {
        await unlinkAsync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除文件失败:', error);
      return false;
    }
  }

  // 检查文件是否存在
  static fileExists(filePath) {
    return filePath && fs.existsSync(filePath);
  }

  // 获取文件扩展名
  static getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
  }

  // 获取文件大小
  static getFileSize(filePath) {
    try {
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      console.error('获取文件大小失败:', error);
      return 0;
    }
  }

  // 获取文件MIME类型
  static getMimeType(filePath) {
    const ext = this.getFileExtension(filePath);
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif'
    };
    return mimeTypes[ext] || 'application/octet-stream';
  }

  // 验证文件类型
  static validateFileType(filePath, allowedTypes) {
    const ext = this.getFileExtension(filePath);
    return allowedTypes.includes(ext);
  }

  // 生成唯一文件名
  static generateUniqueFileName(originalName) {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    return `${timestamp}-${random}${ext}`;
  }
}

module.exports = FileUtils; 