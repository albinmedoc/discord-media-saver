import { Pool, PoolConfig } from 'pg';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { Logger } from '../utils/Logger';

/**
 * Duplicate detection service using PostgreSQL and in-memory cache
 * 
 * Features:
 * - MD5 hash-based duplicate detection
 * - PostgreSQL storage for persistence
 * - In-memory LRU cache for recent files
 * - Optional - gracefully disables if no database connection
 */
export class DuplicateDetectionService {
    private pool: Pool | null = null;
    private recentHashes: Map<string, boolean> = new Map();
    private readonly maxCacheSize: number;
    private isEnabled: boolean = false;

    constructor(maxCacheSize: number = 1000) {
        this.maxCacheSize = maxCacheSize;
    }

    /**
     * Initialize the duplicate detection service
     * Attempts to connect to PostgreSQL, disables service if connection fails
     */
    async init(databaseUrl?: string): Promise<void> {
        if (!databaseUrl) {
            Logger.info('🔍 Duplicate detection disabled - no database URL provided');
            return;
        }

        try {
            const poolConfig: PoolConfig = {
                connectionString: databaseUrl,
                max: 5,
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 5000,
            };

            this.pool = new Pool(poolConfig);
            
            // Test connection
            const client = await this.pool.connect();
            await this.createTables();
            client.release();
            
            this.isEnabled = true;
            Logger.success('✓ Duplicate detection enabled with PostgreSQL');
            
        } catch (error) {
            Logger.warn('⚠️ Failed to connect to PostgreSQL - duplicate detection disabled');
            Logger.warn(`Database error: ${(error as Error).message}`);
            this.pool = null;
            this.isEnabled = false;
        }
    }

    /**
     * Create necessary database tables
     */
    private async createTables(): Promise<void> {
        if (!this.pool) return;

        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS file_hashes (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                hash CHAR(32) NOT NULL,
                file_size BIGINT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await this.pool.query(createTableQuery);
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

            // Check database
            if (this.pool) {
                const result = await this.pool.query(
                    'SELECT id FROM file_hashes WHERE hash = $1',
                    [fileHash]
                );

                if (result.rows.length > 0) {
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

            // Add to database
            if (this.pool) {
                await this.pool.query(`
                    INSERT INTO file_hashes (filename, hash, file_size) 
                    VALUES ($1, $2, $3) 
                    ON CONFLICT (filename) DO UPDATE SET 
                        hash = EXCLUDED.hash,
                        file_size = EXCLUDED.file_size,
                        created_at = CURRENT_TIMESTAMP
                `, [filename, hash, fileSize]);
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

        if (this.pool) {
            try {
                const result = await this.pool.query('SELECT COUNT(*) as count FROM file_hashes');
                totalFilesInDatabase = parseInt(result.rows[0].count, 10);
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
        if (this.pool) {
            await this.pool.end();
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
