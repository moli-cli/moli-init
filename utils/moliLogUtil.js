var chalk = require("chalk");

module.exports = {
    info: function (msg) {
        if (chalk) {
            console.log(chalk.hex('#800080')('[moli-info] >>>>>>>> ' + msg));
        } else {
            console.log('[moli-info] >>>>>>>> ' + msg);
        }
    },
    error: function (msg) {
        if (chalk) {
            console.error(chalk.hex('#ff3333')('[moli-error] >>>>>>>> ' + msg));
        } else {
            console.error('[moli-error] >>>>>>>> ' + msg);
        }
    },
    warn: function (msg) {
        if (chalk) {
            console.warn(chalk.hex('#ccff00')('[moli-warn] >>>>>>>> ' + msg));
        } else {
            console.warn('[moli-warn] >>>>>>>> ' + msg);
        }
    },
    success: function (msg) {
        if (chalk) {
            console.warn(chalk.hex('#00bb00')('[moli-success] >>>>>>>> ' + msg));
        } else {
            console.warn('[moli-success] >>>>>>>> ' + msg);
        }
    },
    log: function (msg, hex) {
        if (chalk && hex) {
            console.log(chalk.hex(hex)(msg));
        } else {
            if (msg) {
                console.log(msg);
            } else {
                console.log("");
            }
        }
    },
    logInLine: function (msg, hex) {
        if (chalk && hex) {
            process.stdout.write(chalk.hex(hex)(msg));
        } else {
            if (msg) {
                process.stdout.write(msg);
            }
        }
    }
}