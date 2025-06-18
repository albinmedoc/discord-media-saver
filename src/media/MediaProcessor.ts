import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import type { APIAttachment } from 'discord-api-types/v9';
import { FileUtils } from '../utils/FileUtils';
import { Logger } from '../utils/Logger';
import { DuplicateDetectionService } from '../deduplication/DuplicateDetectionService';

/**
 * Handles media processing and downloading
 */
export class MediaProcessor {
    private readonly saveDirectory: string;
    private readonly duplicateDetection: DuplicateDetectionService;

    constructor(saveDirectory: string, duplicateDetection: DuplicateDetectionService) {
        this.saveDirectory = saveDirectory;
        this.duplicateDetection = duplicateDetection;
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
            const date = new Date(timestamp);
            const dateFolder = this.createDateFolder(date);
            const filename = FileUtils.generateSafeFilename(attachment, username, timestamp);
            const filepath = path.join(this.saveDirectory, dateFolder, filename);

            // Check if file already exists locally
            if (fs.existsSync(filepath)) {
                Logger.info(`⏭️ File already exists: ${dateFolder}/${filename}`);
                return;
            }

            Logger.info(`📥 Downloading: ${dateFolder}/${filename} (${FileUtils.formatFileSize(attachment.size)})`);

            await this.downloadFile(attachment.url, filepath);
            
            // Check for duplicates after download
            if (this.duplicateDetection.isActive()) {
                const isDuplicate = await this.duplicateDetection.isDuplicate(filepath, filename);
                if (isDuplicate) {
                    // Remove the duplicate file
                    FileUtils.removeFileSafely(filepath);
                    Logger.info(`🗑️ Removed duplicate: ${dateFolder}/${filename}`);
                    return;
                }
            }
            
            Logger.success(`✓ Saved: ${dateFolder}/${filename}`);
            
        } catch (error) {
            Logger.error(`❌ Could not download ${attachment.filename}:`, error as Error);
        }
    }

    /**
     * Create date-based folder structure (YYYY/MM/DD)
     * 
     * @private
     * @param {Date} date - The date to create folder for
     * @returns {string} The relative path for the date folder
     */
    private createDateFolder(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        const dateFolder = path.join(year.toString(), month, day);
        const fullPath = path.join(this.saveDirectory, dateFolder);
        
        // Ensure the directory exists
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
        }
        
        return dateFolder;
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

    /**
     * Get duplicate detection service for statistics
     */
    getDuplicateDetectionService(): DuplicateDetectionService {
        return this.duplicateDetection;
    }
}
