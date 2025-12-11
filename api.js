const DegenAPI = (function() {
    'use strict';
    
    const m = {};
    let t = null;
    
    m.init = function(tracker) {
        t = tracker;
        console.log('🔧 API module initializing');
        
        // SETUP FETCH INTERCEPTION
        const origFetch = window.fetch;
        window.fetch = async function(...args) {
            const response = await origFetch.apply(this, args);
            const url = args[0]?.url || args[0];
            
            if (url && url.includes('api.degenidle.com')) {
                console.log('🌐 Fetch to API:', url);
                const clone = response.clone();
                try {
                    const data = await clone.json();
                    if (data && t.data && t.data.process) {
                        console.log('📊 Processing fetch data');
                        t.data.process(url, data);
                    }
                } catch(e) {}
            }
            return response;
        };
        
        // SETUP XHR INTERCEPTION  
        const OrigXHR = window.XMLHttpRequest;
        function NewXHR() {
            const xhr = new OrigXHR();
            const origOpen = xhr.open;
            const origSend = xhr.send;
            
            xhr.open = function(method, url) {
                this._url = url;
                return origOpen.apply(this, arguments);
            };
            
            xhr.send = function(body) {
                if (this._url && this._url.includes('api.degenidle.com')) {
                    console.log('📤 XHR to API:', this._url);
                    this.addEventListener('load', function() {
                        if (this.status === 200 && this.responseText) {
                            try {
                                const data = JSON.parse(this.responseText);
                                if (data && t.data && t.data.process) {
                                    console.log('📊 Processing XHR data');
                                    t.data.process(this._url, data);
                                }
                            } catch(e) {}
                        }
                    });
                }
                return origSend.apply(this, arguments);
            };
            
            return xhr;
        }
        NewXHR.prototype = OrigXHR.prototype;
        window.XMLHttpRequest = NewXHR;
        
        console.log('✅ API interception ready');
    };
    
    window.DegenAPI = m;
    return m;
})();
