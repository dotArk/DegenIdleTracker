const DegenAPI = (function() {
    'use strict';
    
    const m = {};
    let t = null;
    const R = "https://api.degenidle.com/api/";
    
    m.init = function(tracker) {
        t = tracker;
        console.log('🔧 API init - tracker:', !!t, 't.data:', !!(t && t.data));
        
        setTimeout(() => {
            console.log('🔧 Delayed setup - t.data:', !!(t && t.data));
            setup();
        }, 100);
    };
    
    function proc(u, d) {
        console.log('🔧 Proc called - u:', u, 't:', !!t, 't.data:', !!(t && t.data));
        if (t && t.data && typeof t.data.process === 'function') {
            console.log('✅ Calling t.data.process');
            t.data.process(u, d);
        } else {
            console.log('❌ Cannot process: t.data.process not available');
        }
    }
    
    function setup() {
        console.log('🔧 Setting up intercept...');
        
        const of = window.fetch;
        window.fetch = async function(i, init) {
            const r = await of.apply(this, arguments);
            const u = (typeof i === 'string') ? i : (i?.url || '');
            
            if (u && u.includes('api.degenidle.com')) {
                console.log('🌐 Fetch:', u);
                const c = r.clone();
                try {
                    const d = await c.json();
                    proc(u, d);
                } catch(e) {}
            }
            return r;
        };
        
        const oX = window.XMLHttpRequest;
        function nX() {
            const x = new oX();
            const oO = x.open;
            x.open = function(m, u, a, user, pass) {
                this._u = u;
                return oO.call(this, m, u, a, user, pass);
            };
            
            const oS = x.send;
            x.send = function(b) {
                if (this._u && this._u.includes('api.degenidle.com')) {
                    console.log('📤 XHR:', this._u);
                    this.addEventListener('load', function() {
                        if (this.status >= 200 && this.status < 300 && this.responseText) {
                            try {
                                const d = JSON.parse(this.responseText);
                                proc(this._u, d);
                            } catch(e) {}
                        }
                    }, false);
                }
                return oS.call(this, b);
            };
            return x;
        }
        nX.prototype = oX.prototype;
        window.XMLHttpRequest = nX;
        
        console.log('✅ Intercept ready');
    }
    
    window.DegenAPI = m;
    return m;
})();
