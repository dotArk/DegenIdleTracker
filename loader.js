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

(function() {
    'use strict';

    function init() {
        if (typeof DegenTracker !== 'undefined' &&
            typeof DegenData !== 'undefined' &&
            typeof DegenUI !== 'undefined' &&
            typeof DegenAPI !== 'undefined') {

            console.log('✅ All Degen Tracker modules loaded');
            DegenTracker.init();

            window.DegenTracker = DegenTracker;

        } else {
            setTimeout(init, 100);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.toggleDegenTracker = function() {
        if (typeof DegenTracker !== 'undefined' && DegenTracker.toggle) {
            DegenTracker.toggle();
        } else {
            console.log('⚠️ Degen Tracker not ready yet');
        }
    };
})();
