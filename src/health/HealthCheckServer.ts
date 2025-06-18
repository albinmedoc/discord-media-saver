import * as http from 'http';
import * as url from 'url';
import { Logger } from '../utils/Logger';
import { DuplicateDetectionService } from '../deduplication/DuplicateDetectionService';

/**
 * Health status interface
 */
export interface HealthStatus {
    status: 'healthy' | 'unhealthy';
    timestamp: number;
    discord: {
        connected: boolean;
        lastHeartbeat: number | null;
        reconnectCount: number;
    };
    duplicateDetection: {
        enabled: boolean;
        cacheSize: number;
        maxCacheSize: number;
        totalFilesInDatabase: number;
    };
    uptime: number;
    version: string;
}

/**
 * Health check HTTP server for monitoring application status
 * 
 * Provides a single endpoint for Docker health monitoring:
 * - GET /health - Basic health check (for Docker HEALTHCHECK)
 */
export class HealthCheckServer {
    private server: http.Server | null = null;
    private readonly port: number;
    private readonly startTime: number;
    private discordStatus: {
        connected: boolean;
        lastHeartbeat: number | null;
        reconnectCount: number;
    };
    private duplicateDetection: DuplicateDetectionService | null = null;

    constructor(port: number = 8080) {
        this.port = port;
        this.startTime = Date.now();
        this.discordStatus = {
            connected: false,
            lastHeartbeat: null,
            reconnectCount: 0
        };

        this.server = http.createServer((req, res) => {
            this.handleRequest(req, res);
        });
    }

    /**
     * Set the duplicate detection service for health monitoring
     */
    setDuplicateDetectionService(service: DuplicateDetectionService): void {
        this.duplicateDetection = service;
    }

    /**
     * Handle incoming HTTP requests
     */
    private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname;

        // Only allow GET requests
        if (req.method !== 'GET') {
            this.sendResponse(res, 405, { error: 'Method Not Allowed' });
            return;
        }

        switch (pathname) {
            case '/':
                this.handleRoot(res);
                break;
            case '/health':
                this.handleHealth(res).catch(error => {
                    Logger.error('Error handling health check:', error as Error);
                    this.sendResponse(res, 503, { error: 'Internal Server Error' });
                });
                break;
            default:
                this.sendResponse(res, 404, { error: 'Not Found' });
        }
    }

    /**
     * Handle root endpoint
     */
    private handleRoot(res: http.ServerResponse): void {
        this.sendResponse(res, 200, {
            service: 'Discord Media Saver',
            version: '1.0.0',
            endpoints: [
                '/health'
            ]
        });
    }

    /**
     * Handle basic health check endpoint
     */
    private async handleHealth(res: http.ServerResponse): Promise<void> {
        try {
            const status = await this.getHealthStatus();
            const httpStatus = status.status === 'healthy' ? 200 : 503;
            this.sendResponse(res, httpStatus, status);
        } catch (error) {
            Logger.error('Error getting health status:', error as Error);
            this.sendResponse(res, 503, {
                status: 'unhealthy',
                timestamp: Date.now(),
                error: 'Failed to get health status'
            });
        }
    }

    /**
     * Send JSON response
     */
    private sendResponse(res: http.ServerResponse, statusCode: number, data: any): void {
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(statusCode);
        res.end(JSON.stringify(data, null, 2));
    }

    /**
     * Get comprehensive health status
     */
    private async getHealthStatus(): Promise<HealthStatus> {
        const now = Date.now();
        const heartbeatAge = this.discordStatus.lastHeartbeat ? 
            now - this.discordStatus.lastHeartbeat : null;
        
        // Consider unhealthy if:
        // - Not connected to Discord
        // - Last heartbeat was more than 2 minutes ago
        const isHealthy = this.discordStatus.connected && 
            (heartbeatAge === null || heartbeatAge < 120000);

        // Get duplicate detection stats
        let duplicateDetectionStats = {
            enabled: false,
            cacheSize: 0,
            maxCacheSize: 0,
            totalFilesInDatabase: 0
        };

        if (this.duplicateDetection) {
            try {
                duplicateDetectionStats = await this.duplicateDetection.getStats();
            } catch (error) {
                Logger.error('Error getting duplicate detection stats:', error as Error);
            }
        }

        return {
            status: isHealthy ? 'healthy' : 'unhealthy',
            timestamp: now,
            discord: {
                connected: this.discordStatus.connected,
                lastHeartbeat: this.discordStatus.lastHeartbeat,
                reconnectCount: this.discordStatus.reconnectCount
            },
            duplicateDetection: duplicateDetectionStats,
            uptime: now - this.startTime,
            version: '1.0.0'
        };
    }

    /**
     * Update Discord connection status
     */
    updateDiscordStatus(connected: boolean, lastHeartbeat?: number): void {
        const wasConnected = this.discordStatus.connected;
        this.discordStatus.connected = connected;
        
        if (lastHeartbeat) {
            this.discordStatus.lastHeartbeat = lastHeartbeat;
        }

        // Increment reconnect count if connection status changed from disconnected to connected
        if (!wasConnected && connected) {
            this.discordStatus.reconnectCount++;
        }

        Logger.info(`🏥 Health status updated: Discord ${connected ? 'connected' : 'disconnected'}`);
    }

    /**
     * Start the health check server
     */
    async start(): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.server) {
                reject(new Error('Server not initialized'));
                return;
            }

            this.server.listen(this.port, () => {
                Logger.info(`🏥 Health check server running on port ${this.port}`);
                Logger.info(`🔗 Health endpoint: http://localhost:${this.port}/health`);
                resolve();
            });

            this.server.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    /**
     * Stop the health check server
     */
    async stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    Logger.info('🏥 Health check server stopped');
                    resolve();
                });
            } else {
                resolve();
            }
        });
    }

    /**
     * Get the current server port
     */
    getPort(): number {
        return this.port;
    }
}
