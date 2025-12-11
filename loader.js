// ==UserScript==
// @name         Degen Idle Data Tracker v0.5.0
// @namespace    http://tampermonkey.net/
// @version      0.5.0
// @description  Track & Display Data For The Game 'Degen Idle'
// @author       .Ark
// @match        https://degenidle.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @connect      api.degenidle.com
// @require      https://raw.githubusercontent.com/dotArk/DegenIdleTracker/main/core.js
// @require      https://raw.githubusercontent.com/dotArk/DegenIdleTracker/main/data.js
// @require      https://raw.githubusercontent.com/dotArk/DegenIdleTracker/main/api.js
// @require      https://raw.githubusercontent.com/dotArk/DegenIdleTracker/main/ui.js
// ==/UserScript==

(function () {
    'use strict';

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }

    function init() {
        if (typeof DegenTracker !== 'undefined') {
            DegenTracker.init();
        } else {
            console.error('Degen Tracker modules not loaded properly');
            setTimeout(init, 1000);
        }
    }

    window.toggleDegenTracker = function () {
        if (typeof DegenTracker !== 'undefined') {
            DegenTracker.toggleOverlay();
        }
    };
})();
