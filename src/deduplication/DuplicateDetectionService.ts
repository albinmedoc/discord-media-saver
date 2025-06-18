import { PrismaClient } from '../generated/prisma';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { Logger } from '../utils/Logger';

/**
 * Duplicate detection service using Prisma ORM and in-memory cache
 * 
 * Features:
 * - MD5 hash-based duplicate detection
 * - PostgreSQL storage with Prisma ORM for persistence
 * - In-memory LRU cache for recent files
 * - Optional - gracefully disables if no database connection
 */
export class DuplicateDetectionService {
    private prisma: PrismaClient | null = null;
    private recentHashes: Map<string, boolean> = new Map();
    private readonly maxCacheSize: number;
    private isEnabled: boolean = false;

    constructor(maxCacheSize: number = 1000) {
        this.maxCacheSize = maxCacheSize;
    }

    /**
     * Initialize the duplicate detection service
     * Attempts to connect to PostgreSQL via Prisma, disables service if connection fails
     */
    async init(databaseUrl?: string): Promise<void> {
        if (!databaseUrl) {
            Logger.info('🔍 Duplicate detection disabled - no database URL provided');
            return;
        }

        try {
            this.prisma = new PrismaClient({
                datasources: {
                    db: {
                        url: databaseUrl
                    }
                }
            });
            
            // Test connection by checking if we can query the database
            await this.prisma.$connect();
            
            this.isEnabled = true;
            Logger.success('✓ Duplicate detection enabled with Prisma + PostgreSQL');
            
        } catch (error) {
            Logger.warn('⚠️ Failed to connect to PostgreSQL via Prisma - duplicate detection disabled');
            Logger.warn(`Database error: ${(error as Error).message}`);
            this.prisma = null;
            this.isEnabled = false;
        }
    }

    /**
     * Calculate MD5 hash of a file
     */
    private async calculateFileHash(filepath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const hash = createHash('md5');
            const stream = fs.createReadStream(filepath);
            
            stream.on('data', (data) => {
                hash.update(data);
            });
            
            stream.on('end', () => {
                resolve(hash.digest('hex'));
            });
            
            stream.on('error', (error) => {
                reject(error);
            });
        });
    }

    /**
     * Check if a file is a duplicate based on its hash
     * Returns true if the file is a duplicate, false if it's unique
     */
    async isDuplicate(filepath: string, filename: string): Promise<boolean> {
        if (!this.isEnabled) {
            return false; // Always allow if duplicate detection is disabled
        }

        try {
            const fileHash = await this.calculateFileHash(filepath);
            
            // Check in-memory cache first
            if (this.recentHashes.has(fileHash)) {
                Logger.info(`🔄 Duplicate detected (cache): ${filename} (hash: ${fileHash})`);
                return true;
            }

            // Check database with Prisma
            if (this.prisma) {
                const existingFile = await this.prisma.fileHash.findFirst({
                    where: { hash: fileHash }
                });

                if (existingFile) {
                    Logger.info(`🔄 Duplicate detected (database): ${filename} (hash: ${fileHash})`);
                    this.addToCache(fileHash);
                    return true;
                }
            }

            // File is unique, record it
            await this.recordFile(filename, fileHash, filepath);
            Logger.info(`✨ Unique file recorded: ${filename} (hash: ${fileHash})`);
            return false;

        } catch (error) {
            Logger.error(`❌ Error checking duplicate for ${filename}:`, error as Error);
            return false; // Allow download on error
        }
    }

    /**
     * Record a new unique file in database and cache
     */
    private async recordFile(filename: string, hash: string, filepath: string): Promise<void> {
        try {
            // Get file size
            const stats = await fs.promises.stat(filepath);
            const fileSize = stats.size;

            // Add to cache
            this.addToCache(hash);

            // Add to database with Prisma
            if (this.prisma) {
                await this.prisma.fileHash.upsert({
                    where: { filename },
                    update: {
                        hash,
                        fileSize: BigInt(fileSize),
                        createdAt: new Date()
                    },
                    create: {
                        filename,
                        hash,
                        fileSize: BigInt(fileSize)
                    }
                });
            }

        } catch (error) {
            Logger.error(`❌ Error recording file ${filename}:`, error as Error);
        }
    }

    /**
     * Add hash to in-memory cache with LRU eviction
     */
    private addToCache(hash: string): void {
        // Remove if already exists (for LRU ordering)
        if (this.recentHashes.has(hash)) {
            this.recentHashes.delete(hash);
        }

        // Add to end
        this.recentHashes.set(hash, true);

        // Evict oldest if cache is full
        if (this.recentHashes.size > this.maxCacheSize) {
            const firstKey = this.recentHashes.keys().next().value;
            if (firstKey !== undefined) {
                this.recentHashes.delete(firstKey);
            }
        }
    }

    /**
     * Get duplicate detection statistics
     */
    async getStats(): Promise<{
        enabled: boolean;
        cacheSize: number;
        maxCacheSize: number;
        totalFilesInDatabase: number;
    }> {
        let totalFilesInDatabase = 0;

        if (this.prisma) {
            try {
                const count = await this.prisma.fileHash.count();
                totalFilesInDatabase = count;
            } catch (error) {
                Logger.error('Error getting database stats:', error as Error);
            }
        }

        return {
            enabled: this.isEnabled,
            cacheSize: this.recentHashes.size,
            maxCacheSize: this.maxCacheSize,
            totalFilesInDatabase
        };
    }

    /**
     * Cleanup database connections
     */
    async cleanup(): Promise<void> {
        if (this.prisma) {
            await this.prisma.$disconnect();
            Logger.info('🔍 Duplicate detection service stopped');
        }
    }

    /**
     * Check if duplicate detection is enabled
     */
    isActive(): boolean {
        return this.isEnabled;
    }
}
