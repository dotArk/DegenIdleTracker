const DegenAPI = (function () {
    'use strict';

    const mod = {};
    let t = null;

    mod.init = function (tracker) {
        t = tracker;
        setup();
        t.log('API module ready (passive mode)');
    };

    function setup() {
        t.log('Setting up PASSIVE API intercept...');

        const origFetch = window.fetch;
        window.fetch = async function (...args) {
            const [url, opts] = args;
            const urlStr = url.toString();

            if (urlStr.includes('api.degenidle.com')) {
                t.log(`📡 Intercepting (passive): ${urlStr}`);

                try {
                    const resp = await origFetch.apply(this, args);
                    const clone = resp.clone();

                    try {
                        const data = await clone.json();
                        if (t.data && t.data.process) {
                            t.data.process(urlStr, data);
                        }
                    } catch (e) {
                    }

                    return resp;
                } catch (err) {
                    t.log('Fetch error:', err);
                    return origFetch.apply(this, args);
                }
            }

            return origFetch.apply(this, args);
        };

        const origXHR = window.XMLHttpRequest;
        window.XMLHttpRequest = class extends origXHR {
            open(method, url, async = true, user, pass) {
                this._url = url;
                super.open(method, url, async, user, pass);
            }

            send(body) {
                if (this._url && this._url.includes('api.degenidle.com')) {
                    const origReady = this.onreadystatechange;
                    this.onreadystatechange = function () {
                        if (this.readyState === 4 && this.status >= 200 && this.status < 300) {
                            try {
                                const data = JSON.parse(this.responseText);
                                if (t.data && t.data.process) {
                                    t.data.process(this._url, data);
                                }
                            } catch (e) {
                            }
                        }
                        if (origReady) origReady.apply(this, arguments);
                    };
                }
                super.send(body);
            }
        };

        t.log('PASSIVE API intercept ready (no outgoing calls)');
    }

    mod.test = function () {
        t.log('Testing interception (passive)...');
        t.notify('Testing passive monitoring', 'info');

        if (t.game) {
            t.game.api.last = Date.now();
            t.notify('Passive mode active', 'success');
        }

        return true;
    };

    window.DegenAPI = mod;
    return mod;
})();
