/**
 * Simple logger utility
 */
export class Logger {
    static info(message: string): void {
        console.log(message);
    }

    static error(message: string, error?: Error | null): void {
        if (error) {
            console.error(message, error.message);
        } else {
            console.error(message);
        }
    }

    static warn(message: string): void {
        console.warn(message);
    }

    static success(message: string): void {
        console.log(message);
    }
}
