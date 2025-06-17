const fs = require('fs');
const path = require('path');
const https = require('https');
const FileUtils = require('../utils/FileUtils');
const Logger = require('../utils/Logger');

/**
 * Handles media processing and downloading
 */
class MediaProcessor {
    constructor(saveDirectory) {
        this.saveDirectory = saveDirectory;
    }

    /**
     * Process attachments from a Discord message
     */
    async processAttachments(attachments, username, timestamp) {
        for (const attachment of attachments) {
            const isMedia = FileUtils.isMediaFile(attachment.filename, attachment.content_type);
            
            if (isMedia) {
                await this.downloadAttachment(attachment, username, timestamp);
            } else {
                Logger.info(`⏭️ Skipping ${attachment.filename} (not media)`);
            }
        }
    }

    /**
     * Download a single attachment
     */
    async downloadAttachment(attachment, username, timestamp) {
        try {
            const filename = FileUtils.generateSafeFilename(attachment, username, timestamp);
            const filepath = path.join(this.saveDirectory, filename);

            Logger.info(`📥 Downloading: ${filename} (${FileUtils.formatFileSize(attachment.size)})`);

            await this.downloadFile(attachment.url, filepath);
            
            Logger.success(`✓ Saved: ${filename}`);
            
        } catch (error) {
            Logger.error(`❌ Could not download ${attachment.filename}:`, error);
        }
    }

    /**
     * Download a file from URL to local path
     */
    downloadFile(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            
            https.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                    return;
                }

                response.pipe(file);
                
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
                
            }).on('error', (error) => {
                FileUtils.removeFileSafely(filepath);
                reject(error);
            });

            file.on('error', (error) => {
                FileUtils.removeFileSafely(filepath);
                reject(error);
            });
        });
    }
}

module.exports = MediaProcessor;
