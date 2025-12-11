const DegenAPI = (function() {
    'use strict';
    
    const mod = {};
    let t = null;
    
    mod.init = function(tracker) {
        t = tracker;
        setup();
    };
    
    function setup() {
        t.log('Setting up XHR interception...');
        
        const origXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = function() {
            const xhr = new origXHR();
            const origOpen = xhr.open;
            const origSend = xhr.send;
            
            xhr.open = function(method, url, async, user, password) {
                this._method = method;
                this._url = url;
                t.log(`XHR open: ${method} ${url}`);
                return origOpen.call(this, method, url, async || true, user, password);
            };
            
            xhr.send = function(body) {
                if (this._url && this._url.includes('api.degenidle.com')) {
                    t.log(`XHR send to: ${this._url}`);
                    
                    const origOnReadyStateChange = this.onreadystatechange;
                    const origOnLoad = this.onload;
                    
                    this.addEventListener('load', function() {
                        if (this.status >= 200 && this.status < 300) {
                            try {
                                if (this.responseText) {
                                    const data = JSON.parse(this.responseText);
                                    t.log(`XHR response from: ${this._url}`);
                                    if (t.data && t.data.process) {
                                        t.data.process(this._url, data);
                                    }
                                }
                            } catch(e) {}
                        }
                    });
                    
                    this.addEventListener('error', function() {
                        t.log(`XHR error: ${this._url}`);
                    });
                }
                
                return origSend.call(this, body);
            };
            
            return xhr;
        };
        
        t.log('XHR interception ready');
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
