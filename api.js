const DegenAPI = (function() {
    'use strict';
    
    const m = {};
    let t = null;
    const API_ROOT = "https://api.degenidle.com/api/";
    
    m.init = function(tracker) {
        t = tracker;
        console.log('🔧 API module initializing (XP Tracker pattern)');
        setupInterceptors();
    };
    
    function setupInterceptors() {
        const _originalFetch = window.fetch;
        window.fetch = async function(input, init) {
            const response = await _originalFetch.apply(this, arguments);

            try {
                const url = (typeof input === 'string') ? input : (input?.url || '');

                if (url.startsWith(API_ROOT)) {
                    const clone = response.clone();
                    clone.json()
                        .then(json => {
                            console.log('🌐 Fetch intercepted:', url);
                            if (t && t.data && t.data.process) {
                                t.data.process(url, json);
                            }
                        })
                        .catch(() => {});
                }
            } catch(e) {}

            return response;
        };
        
        (function() {
            const XHR = XMLHttpRequest;
            function newXHR() {
                const realXHR = new XHR();

                realXHR.addEventListener('readystatechange', function() {
                    try {
                        if (realXHR.readyState === 4 && realXHR.responseURL?.startsWith(API_ROOT)) {
                            try {
                                const json = JSON.parse(realXHR.responseText);
                                console.log('📤 XHR intercepted:', realXHR.responseURL);
                                if (t && t.data && t.data.process) {
                                    t.data.process(realXHR.responseURL, json);
                                }
                            } catch(e) {}
                        }
                    } catch(e) {}
                }, false);

                return realXHR;
            }

            newXHR.prototype = XHR.prototype;
            window.XMLHttpRequest = newXHR;
        })();
        
        console.log('✅ API interceptors installed (XP Tracker pattern)');
    }
    
    window.DegenAPI = m;
    return m;
})();
