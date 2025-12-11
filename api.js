const DegenAPI = (function() {
    'use strict';
    
    const m = {};
    let t = null;
    const R = "https://api.degenidle.com/api/";
    
    m.init = function(tracker) {
        t = tracker;
        setup();
        t.log('API ready');
    };
    
    function setup() {
        const of = window.fetch;
        window.fetch = async function(i, init) {
            const r = await of.apply(this, arguments);
            const u = (typeof i === 'string') ? i : (i?.url || '');
            
            if (u && u.includes('api.degenidle.com')) {
                const c = r.clone();
                try {
                    const d = await c.json();
                    if (d && t.data && t.data.process) {
                        t.data.process(u, d);
                    }
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
                    this.addEventListener('load', function() {
                        if (this.status >= 200 && this.status < 300 && this.responseText) {
                            try {
                                const d = JSON.parse(this.responseText);
                                if (d && t.data && t.data.process) {
                                    t.data.process(this._u, d);
                                }
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
    }
    
    m.test = function() {
        fetch('https://api.degenidle.com/api/heartbeat/status')
            .then(r => r.json())
            .then(d => t.log('Test OK:', d.success))
            .catch(e => t.log('Test fail:', e));
        return true;
    };
    
    window.DegenAPI = m;
    return m;
})();
