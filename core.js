const DegenTracker = (function () {
    'use strict';

    const API = {};

    API.CFG = {
        debug: true,
        storageKey: 'degen_game_data_v0_5',
        autoSave: true,
        autoSaveInterval: 30000,
        maxDataHistory: 100,
        uiIntegration: true
    };

    API.log = function (...args) {
        if (API.CFG.debug) {
            console.log(`%c[Degen]`, 'color: #3498db; font-weight: bold', ...args);
        }
    };

    API.fmt = function (num, decimals = 0) {
        if (num === undefined || num === null) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toFixed(decimals);
    };

    API.timeAgo = function (ts) {
        if (!ts) return 'Unknown';
        const secs = Math.floor((Date.now() - ts) / 1000);
        if (secs < 60) return 'just now';
        const mins = Math.floor(secs / 60);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    };

    API.fmtTime = function (secs) {
        if (!secs || secs < 0) return '0s';
        const d = Math.floor(secs / 86400);
        const h = Math.floor((secs % 86400) / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = Math.floor(secs % 60);

        const parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0) parts.push(`${h}h`);
        if (m > 0) parts.push(`${m}m`);
        if (s > 0 || parts.length === 0) parts.push(`${s}s`);

        return parts.join(' ');
    };

    API.notify = function (msg, type = 'info') {
        const notif = document.createElement('div');
        notif.textContent = msg;
        notif.style.cssText = `
            position: fixed; top: 50px; right: 20px;
            background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white; padding: 10px 15px; border-radius: 6px; z-index: 10001;
            font-size: 12px; animation: fadeInOut 3s ease-in-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        `;

        if (!document.querySelector('#degen-notif-anim')) {
            const style = document.createElement('style');
            style.id = 'degen-notif-anim';
            style.textContent = `
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: translateY(-10px); }
                    15% { opacity: 1; transform: translateY(0); }
                    85% { opacity: 1; transform: translateY(0); }
                    100% { opacity: 0; transform: translateY(-10px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    };

    API.data = null;
    API.ui = null;
    API.api = null;
    API.game = null;

    API.init = function () {
        API.log('Initializing Degen Tracker v0.5.0');

        if (typeof DegenData !== 'undefined') {
            API.data = DegenData;
            API.log('Data module loaded');
        }
        if (typeof DegenUI !== 'undefined') {
            API.ui = DegenUI;
            API.log('UI module loaded');
        }
        if (typeof DegenAPI !== 'undefined') {
            API.api = DegenAPI;
            API.log('API module loaded');
        }

        try {
            if (API.data && API.data.init) API.data.init(API);
            if (API.api && API.api.init) API.api.init(API);
            if (API.ui && API.ui.init) API.ui.init(API);
            API.log('All modules initialized');
        } catch (err) {
            API.log('Init error:', err);
        }
    };

    API.toggle = function () {
        if (API.ui && API.ui.toggle) {
            API.ui.toggle();
        }
    };

    window.DegenTracker = API;
    return API;
})();
