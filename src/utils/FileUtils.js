const fs = require('fs');
const path = require('path');

/**
 * File utility functions
 */
class FileUtils {
    /**
     * Check if a file is a media file based on filename and content type
     */
    static isMediaFile(filename, contentType) {
        const mediaExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.mov', '.avi', '.mkv', '.webm'];
        const mediaContentTypes = ['image/', 'video/'];
        
        const hasMediaExtension = mediaExtensions.some(ext => 
            filename.toLowerCase().endsWith(ext)
        );
        
        const hasMediaContentType = contentType && mediaContentTypes.some(type => 
            contentType.startsWith(type)
        );

        return hasMediaExtension || hasMediaContentType;
    }

    /**
     * Generate a safe filename for downloaded media
     */
    static generateSafeFilename(attachment, username, timestamp) {
        const date = new Date(timestamp);
        const dateStr = date.toISOString().slice(0, 19).replace(/[:.]/g, '-');
        
        // Create safe username
        const safeUsername = username.replace(/[^a-zA-Z0-9]/g, '_');
        const extension = path.extname(attachment.filename) || '.unknown';
        const baseName = path.basename(attachment.filename, extension).replace(/[^a-zA-Z0-9._-]/g, '_');
        
        return `${dateStr}_${safeUsername}_${baseName}${extension}`;
    }

    /**
     * Format file size in human readable format
     */
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    /**
     * Remove a file safely (ignores errors)
     */
    static removeFileSafely(filepath) {
        fs.unlink(filepath, () => {}); // Ignore errors
    }
}

module.exports = FileUtils;
