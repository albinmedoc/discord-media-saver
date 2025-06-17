import WebSocket from 'ws';
import { 
    GatewayOpcodes, 
    GatewayDispatchEvents
} from 'discord-api-types/gateway/v9';
import type { 
    GatewayReceivePayload, 
    GatewayReadyDispatchData, 
    GatewayMessageCreateDispatchData,
    GatewayHelloData,
    GatewayIdentifyData
} from 'discord-api-types/gateway/v9';
import { Logger } from '../utils/Logger';
import { Config } from '../config/Config';
import { MediaProcessor } from '../media/MediaProcessor';

/**
 * Discord WebSocket client for handling gateway connection
 */
export class DiscordClient {
    private readonly config: Config;
    private readonly mediaProcessor: MediaProcessor;
    private ws: WebSocket | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private sessionId: string | null = null;
    private sequenceNumber: number | null = null;

    constructor(config: Config, mediaProcessor: MediaProcessor) {
        this.config = config;
        this.mediaProcessor = mediaProcessor;
    }

    /**
     * Connect to Discord Gateway
     */
    async connect(): Promise<void> {
        Logger.info('🔌 Connecting to Discord Gateway...');
        
        this.ws = new WebSocket(this.config.getGatewayUrl());
        
        this.ws.on('open', () => {
            Logger.success('✓ Connected to Discord Gateway');
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
            this.handleMessage(JSON.parse(data.toString()) as GatewayReceivePayload);
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
            Logger.error(`❌ Connection closed: ${code} ${reason.toString()}`);
            Logger.info('🔄 Reconnecting in 5 seconds...');
            setTimeout(() => this.connect(), this.config.getReconnectDelay());
        });

        this.ws.on('error', (error: Error) => {
            Logger.error('❌ WebSocket error:', error);
        });
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: GatewayReceivePayload): void {
        const { op, d, t, s } = message;

        // Update sequence number
        if (s !== null && s !== undefined) {
            this.sequenceNumber = s;
        }

        switch (op) {
            case GatewayOpcodes.Hello:
                this.startHeartbeat((d as GatewayHelloData).heartbeat_interval);
                this.identify();
                break;

            case GatewayOpcodes.HeartbeatAck:
                // Silent heartbeat ACK
                break;

            case GatewayOpcodes.Dispatch:
                if (t) {
                    this.handleDispatch(t, d);
                }
                break;

            case GatewayOpcodes.Heartbeat:
                this.sendHeartbeat();
                break;

            case GatewayOpcodes.Reconnect:
                Logger.info('🔄 Discord requesting reconnection');
                this.ws?.close();
                break;

            case GatewayOpcodes.InvalidSession:
                Logger.error('❌ Invalid session, starting new...');
                this.sessionId = null;
                setTimeout(() => this.identify(), this.config.getIdentifyDelay());
                break;
        }
    }

    /**
     * Handle Discord event dispatches
     */
    private handleDispatch(eventType: GatewayDispatchEvents, data: any): void {
        switch (eventType) {
            case GatewayDispatchEvents.Ready:
                const readyData = data as GatewayReadyDispatchData;
                Logger.success(`✓ Logged in as: ${readyData.user.username}`);
                this.sessionId = readyData.session_id;
                Logger.info(`🔍 Monitoring ${this.config.getChannelIds().length} channel(s): ${this.config.getChannelIds().join(', ')}`);
                break;

            case GatewayDispatchEvents.MessageCreate:
                const messageData = data as GatewayMessageCreateDispatchData;
                if (this.config.isMonitoredChannel(messageData.channel_id) && messageData.attachments.length > 0) {
                    Logger.info(`📨 New message with ${messageData.attachments.length} attachment(s) from ${messageData.author.username} in channel ${messageData.channel_id}`);
                    this.mediaProcessor.processAttachments(messageData.attachments, messageData.author.username, messageData.timestamp);
                }
                break;

            case GatewayDispatchEvents.Resumed:
                Logger.success('✓ Session resumed');
                break;
        }
    }

    /**
     * Start heartbeat interval
     */
    private startHeartbeat(interval: number): void {
        Logger.info(`💓 Starting heartbeat every ${interval}ms`);
        
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        this.heartbeatInterval = setInterval(() => {
            this.sendHeartbeat();
        }, interval);
    }

    /**
     * Send heartbeat to Discord
     */
    private sendHeartbeat(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                op: GatewayOpcodes.Heartbeat,
                d: this.sequenceNumber
            }));
        }
    }

    /**
     * Send identification payload to Discord
     */
    private identify(): void {
        const payload: GatewayIdentifyData = {
            token: this.config.getToken(),
            intents: this.config.getDiscordIntents(),
            properties: {
                os: "linux",
                browser: "discord-media-saver",
                device: "discord-media-saver"
            }
        };

        const identifyPayload = {
            op: GatewayOpcodes.Identify,
            d: payload
        };

        this.ws?.send(JSON.stringify(identifyPayload));
        Logger.info('🔐 Sending identification...');
    }

    /**
     * Cleanup resources
     */
    cleanup(): void {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}
