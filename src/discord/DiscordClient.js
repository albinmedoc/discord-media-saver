const WebSocket = require('ws');
const Logger = require('../utils/Logger');

/**
 * Discord WebSocket client for handling gateway connection
 */
class DiscordClient {
    constructor(config, mediaProcessor) {
        this.config = config;
        this.mediaProcessor = mediaProcessor;
        this.ws = null;
        this.heartbeatInterval = null;
        this.sessionId = null;
        this.sequenceNumber = null;
    }

    /**
     * Connect to Discord Gateway
     */
    async connect() {
        Logger.info('🔌 Connecting to Discord Gateway...');
        
        this.ws = new WebSocket(this.config.getGatewayUrl());
        
        this.ws.on('open', () => {
            Logger.success('✓ Connected to Discord Gateway');
        });

        this.ws.on('message', (data) => {
            this.handleMessage(JSON.parse(data.toString()));
        });

        this.ws.on('close', (code, reason) => {
            Logger.error(`❌ Connection closed: ${code} ${reason}`);
            Logger.info('🔄 Reconnecting in 5 seconds...');
            setTimeout(() => this.connect(), this.config.getReconnectDelay());
        });

        this.ws.on('error', (error) => {
            Logger.error('❌ WebSocket error:', error);
        });
    }

    /**
     * Handle incoming WebSocket messages
     */
    handleMessage(message) {
        const { op, d, t, s } = message;

        // Update sequence number
        if (s !== null) {
            this.sequenceNumber = s;
        }

        switch (op) {
            case 10: // Hello
                this.startHeartbeat(d.heartbeat_interval);
                this.identify();
                break;

            case 11: // Heartbeat ACK
                // Silent heartbeat ACK
                break;

            case 0: // Dispatch
                this.handleDispatch(t, d);
                break;

            case 1: // Heartbeat request
                this.sendHeartbeat();
                break;

            case 7: // Reconnect
                Logger.info('🔄 Discord requesting reconnection');
                this.ws.close();
                break;

            case 9: // Invalid session
                Logger.error('❌ Invalid session, starting new...');
                this.sessionId = null;
                setTimeout(() => this.identify(), this.config.getIdentifyDelay());
                break;
        }
    }

    /**
     * Handle Discord event dispatches
     */
    handleDispatch(eventType, data) {
        switch (eventType) {
            case 'READY':
                Logger.success(`✓ Logged in as: ${data.user.username}`);
                this.sessionId = data.session_id;
                Logger.info(`🔍 Monitoring channel: ${this.config.getChannelId()}`);
                break;

            case 'MESSAGE_CREATE':
                if (data.channel_id === this.config.getChannelId() && data.attachments.length > 0) {
                    Logger.info(`📨 New message with ${data.attachments.length} attachment(s) from ${data.author.username}`);
                    this.mediaProcessor.processAttachments(data.attachments, data.author.username, data.timestamp);
                }
                break;

            case 'RESUMED':
                Logger.success('✓ Session resumed');
                break;
        }
    }

    /**
     * Start heartbeat interval
     */
    startHeartbeat(interval) {
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
    sendHeartbeat() {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                op: 1,
                d: this.sequenceNumber
            }));
        }
    }

    /**
     * Send identification payload to Discord
     */
    identify() {
        const payload = {
            op: 2,
            d: {
                token: this.config.getToken(),
                intents: this.config.getDiscordIntents(),
                properties: {
                    os: "linux",
                    browser: "discord-media-saver",
                    device: "discord-media-saver"
                }
            }
        };

        this.ws.send(JSON.stringify(payload));
        Logger.info('🔐 Sending identification...');
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        if (this.ws) {
            this.ws.close();
        }
    }
}

module.exports = DiscordClient;
