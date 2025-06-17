/**
 * Simple logger utility
 */
class Logger {
    static info(message) {
        console.log(message);
    }

    static error(message, error = null) {
        if (error) {
            console.error(message, error.message);
        } else {
            console.error(message);
        }
    }

    static warn(message) {
        console.warn(message);
    }

    static success(message) {
        console.log(message);
    }
}

module.exports = Logger;
