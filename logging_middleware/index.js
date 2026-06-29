"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Log = Log;
async function Log(stack, level, pkg, message, accessToken) {
    const payload = {
        stack,
        level,
        package: pkg,
        message,
        timestamp: new Date().toISOString(),
    };
    try {
        await fetch("http://4.224.186.213/evaluation-service/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
        });
    }
    catch (_err) {
        // Swallow logging errors to avoid impacting application flow
    }
}
