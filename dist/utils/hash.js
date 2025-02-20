"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = void 0;
const hashString = async (str) => {
    const msgBuffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};
exports.hashString = hashString;
