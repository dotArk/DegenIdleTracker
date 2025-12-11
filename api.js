console.log('🔧 API.JS IS LOADING');

const DegenAPI = (function() {
    'use strict';
    
    const mod = {};
    let t = null;
    const API_ROOT = "https://api.degenidle.com/api/";
    
    mod.init = function(tracker) {
        t = tracker;
        setup();
    };
    
    function setup() {
        t.log('Setting up API interception (XP Tracker pattern)...');
        
        // 1. Hook fetch (correct pattern)
        const origFetch = window.fetch;
        window.fetch = async function(input, init) {
            const response = await origFetch.apply(this, arguments);
            
            try {
                const url = (typeof input === 'string') ? input : (input?.url || '');
                
                if (url.startsWith(API_ROOT)) {
                    const clone = response.clone();
                    clone.json()
                        .then(json => {
                            t.log(`Fetch response: ${url}`);
                            if (t.data && t.data.process) {
                                t.data.process(url, json);
                            }
                        })
                        .catch(() => {});
                }
            } catch(e) {}
            
            return response;
        };
        
        // 2. Hook XMLHttpRequest (XP Tracker pattern)
        (function() {
            const XHR = XMLHttpRequest;
            
            function newXHR() {
                const realXHR = new XHR();
                
                realXHR.addEventListener('readystatechange', function() {
                    try {
                        if (realXHR.readyState === 4 && realXHR.responseURL?.startsWith(API_ROOT)) {
                            try {
                                const json = JSON.parse(realXHR.responseText);
                                t.log(`XHR response: ${realXHR.responseURL}`);
                                if (t.data && t.data.process) {
                                    t.data.process(realXHR.responseURL, json);
                                }
                            } catch(e) {
                                // Not JSON
                            }
                        }
                    } catch(e) {}
                }, false);
                
                return realXHR;
            }
            
            newXHR.prototype = XHR.prototype;
            window.XMLHttpRequest = newXHR;
        })();
        
        t.log('API interception ready');
    }
    
    mod.test = function() {
        t.log('Testing interception');
        t.notify('Testing', 'info');
        
        if (t.game) {
            t.game.api.last = Date.now();
            t.notify('Active', 'success');
        }
        
        return true;
    };
    
    window.DegenAPI = mod;
    return mod;
})();
