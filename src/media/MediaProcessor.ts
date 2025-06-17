import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { APIAttachment } from 'discord-api-types/v9';
import { FileUtils } from '../utils/FileUtils';
import { Logger } from '../utils/Logger';

/**
 * Handles media processing and downloading
 */
export class MediaProcessor {
    private readonly saveDirectory: string;

    constructor(saveDirectory: string) {
        this.saveDirectory = saveDirectory;
    }

    /**
     * Process attachments from a Discord message
     */
    async processAttachments(attachments: APIAttachment[], username: string, timestamp: string): Promise<void> {
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
    private async downloadAttachment(attachment: APIAttachment, username: string, timestamp: string): Promise<void> {
        try {
            const filename = FileUtils.generateSafeFilename(attachment, username, timestamp);
            const filepath = path.join(this.saveDirectory, filename);

            Logger.info(`📥 Downloading: ${filename} (${FileUtils.formatFileSize(attachment.size)})`);

            await this.downloadFile(attachment.url, filepath);
            
            Logger.success(`✓ Saved: ${filename}`);
            
        } catch (error) {
            Logger.error(`❌ Could not download ${attachment.filename}:`, error as Error);
        }
    }

    /**
     * Download a file from URL to local path
     */
    private downloadFile(url: string, filepath: string): Promise<void> {
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
