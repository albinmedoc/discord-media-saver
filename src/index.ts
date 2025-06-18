import DiscordMediaSaver from './DiscordMediaSaver';
import { Logger } from './utils/Logger';

/**
 * Application entry point
 */
async function main(): Promise<void> {
    const saver = new DiscordMediaSaver();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
        Logger.info('\n🛑 Shutting down...');
        await saver.cleanup();
        process.exit(0);
    });

    process.on('SIGTERM', async () => {
        Logger.info('\n🛑 Shutting down (SIGTERM)...');
        await saver.cleanup();
        process.exit(0);
    });

    try {
        await saver.init();
        
        // Keep process alive
        process.stdin.resume();
        
    } catch (error) {
        Logger.error('❌ Error:', error as Error);
        await saver.cleanup();
        process.exit(1);
    }
}

main();
