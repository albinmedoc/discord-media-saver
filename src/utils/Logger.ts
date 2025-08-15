/**
 * Simple logger utility with timestamp prefixes
 */
export class Logger {
    private static getTimestamp(): string {
        return new Date().toISOString();
    }

    static info(message: string): void {
        console.log(`[${this.getTimestamp()}] ${message}`);
    }

    static error(message: string, error?: Error | null): void {
        if (error) {
            console.error(`[${this.getTimestamp()}] ${message}`, error.message);
        } else {
            console.error(`[${this.getTimestamp()}] ${message}`);
        }
    }

    static warn(message: string): void {
        console.warn(`[${this.getTimestamp()}] ${message}`);
    }

    static success(message: string): void {
        console.log(`[${this.getTimestamp()}] ${message}`);
    }
}
