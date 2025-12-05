"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.logger = exports.Logger = void 0;
exports.setupLogging = setupLogging;
exports.getLogger = getLogger;
var Logger = /** @class */ (function () {
    function Logger(options) {
        this.level = options.level;
        this.verbose = options.verbose || false;
        this.quiet = options.quiet || false;
    }
    Logger.prototype.shouldLog = function (level) {
        if (this.quiet && level !== "error") {
            return false;
        }
        if (this.verbose) {
            return true;
        }
        var levels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3,
        };
        return levels[level] >= levels[this.level];
    };
    Logger.prototype.formatMessage = function (level, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var timestamp = new Date().toISOString();
        var prefix = "[".concat(timestamp, "] [").concat(level.toUpperCase(), "]");
        if (args.length > 0) {
            return __spreadArray(["".concat(prefix, " ").concat(message)], args, true);
        }
        return ["".concat(prefix, " ").concat(message)];
    };
    Logger.prototype.debug = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog("debug")) {
            var _a = this.formatMessage.apply(this, __spreadArray(["debug",
                message], args, false)), formattedMessage = _a[0], formattedArgs = _a.slice(1);
            console.debug.apply(console, __spreadArray([formattedMessage], formattedArgs, false));
        }
    };
    Logger.prototype.info = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog("info")) {
            var _a = this.formatMessage.apply(this, __spreadArray(["info",
                message], args, false)), formattedMessage = _a[0], formattedArgs = _a.slice(1);
            console.info.apply(console, __spreadArray([formattedMessage], formattedArgs, false));
        }
    };
    Logger.prototype.warn = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog("warn")) {
            var _a = this.formatMessage.apply(this, __spreadArray(["warn",
                message], args, false)), formattedMessage = _a[0], formattedArgs = _a.slice(1);
            console.warn.apply(console, __spreadArray([formattedMessage], formattedArgs, false));
        }
    };
    Logger.prototype.error = function (message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.shouldLog("error")) {
            var _a = this.formatMessage.apply(this, __spreadArray(["error",
                message], args, false)), formattedMessage = _a[0], formattedArgs = _a.slice(1);
            console.error.apply(console, __spreadArray([formattedMessage], formattedArgs, false));
        }
    };
    Logger.prototype.setLevel = function (level) {
        this.level = level;
    };
    Logger.prototype.setVerbose = function (verbose) {
        this.verbose = verbose;
    };
    Logger.prototype.setQuiet = function (quiet) {
        this.quiet = quiet;
    };
    return Logger;
}());
exports.Logger = Logger;
var globalLogger = null;
function setupLogging(verbose, quiet) {
    if (verbose === void 0) { verbose = false; }
    if (quiet === void 0) { quiet = false; }
    var level = "info";
    if (quiet) {
        level = "error";
    }
    else if (verbose) {
        level = "debug";
    }
    globalLogger = new Logger({ level: level, verbose: verbose, quiet: quiet });
}
function getLogger() {
    if (!globalLogger) {
        globalLogger = new Logger({ level: "info" });
    }
    return globalLogger;
}
// Export convenience functions
exports.logger = getLogger();
exports.log = {
    debug: function (message) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = getLogger()).debug.apply(_a, __spreadArray([message], args, false));
    },
    info: function (message) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = getLogger()).info.apply(_a, __spreadArray([message], args, false));
    },
    warn: function (message) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = getLogger()).warn.apply(_a, __spreadArray([message], args, false));
    },
    error: function (message) {
        var _a;
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return (_a = getLogger()).error.apply(_a, __spreadArray([message], args, false));
    },
};
