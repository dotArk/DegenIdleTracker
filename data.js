const DegenData = (function () {
    'use strict';

    const mod = {};
    let t = null;
    let g = null;

    mod.init = function (tracker) {
        t = tracker;

        g = {
            ver: "0.5.0",
            ts: Date.now(),
            char: null,
            chars: [],
            combat: { active: false, sess: null, stats: null, monster: null },
            skills: null,
            tasks: [],
            guild: { info: null, members: [], res: null },
            wboss: { unclaimed: [], hist: [], upcoming: null },
            daily: null,
            friends: null,
            party: null,
            gboss: null,
            lastUp: null,
            raw: {},
            hist: [],
            api: { calls: 0, last: null, errs: 0 }
        };

        load();
        t.game = g;
    };

    function load() {
        try {
            const stored = localStorage.getItem(t.CFG.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                g = { ...g, ...parsed, ver: "0.5.0" };
                t.log('Loaded stored data');
            }
        } catch (e) {
            t.log('Load error:', e);
        }
    }

    mod.save = function () {
        try {
            localStorage.setItem(t.CFG.storageKey, JSON.stringify(g));
            return true;
        } catch (e) {
            t.log('Save error:', e);
            g.api.errs++;
            return false;
        }
    };

    mod.clear = function () {
        g = {
            ver: "0.5.0",
            ts: Date.now(),
            char: null,
            chars: [],
            combat: { active: false, sess: null, stats: null, monster: null },
            skills: null,
            tasks: [],
            guild: { info: null, members: [], res: null },
            wboss: { unclaimed: [], hist: [], upcoming: null },
            daily: null,
            friends: null,
            party: null,
            gboss: null,
            lastUp: null,
            raw: {},
            hist: [],
            api: { calls: 0, last: null, errs: 0 }
        };

        localStorage.removeItem(t.CFG.storageKey);
        t.game = g;
        t.notify('Data cleared', 'success');
        return g;
    };

    mod.process = function(url, data) {
        if (!data || !data.success) return;
        
        t.log(`Processing: ${url}`);
        
        const endpoint = url.replace('https://api.degenidle.com/api/', '').split('?')[0] || url;
        g.raw[endpoint] = data;
        
        g.api.calls++;
        g.api.last = Date.now();
        
        try {
            if (url.includes('/characters/account/active')) {
                if (data.active_characters) {
                    g.chars = data.active_characters;
                    if (!g.char && data.active_characters.length > 0) {
                        g.char = {
                            character_id: data.active_characters[0].character_id,
                            task_id: data.active_characters[0].task_id
                        };
                    }
                }
            }
            
            if (url.includes('/characters/') && !url.includes('account/active')) {
                let charData = null;
                
                if (data.character) charData = data.character;
                else if (data.data && data.data.character) charData = data.data.character;
                else if (data.data) charData = data.data;
                else if (data.name || data.level) charData = data;
                
                if (charData) {
                    g.char = { ...g.char, ...charData };
                }
            }
            
            if (url.includes('/guilds/character/')) {
                if (data.guild) {
                    g.guild.info = data.guild;
                    g.guild.members = data.members || [];
                }
            }
            
            if (url.includes('/guilds/') && !url.includes('/character/')) {
                if (data.data && data.data.guild) {
                    g.guild.info = data.data.guild;
                    g.guild.members = data.data.members || [];
                } else if (data.guild) {
                    g.guild.info = data.guild;
                    g.guild.members = data.members || [];
                }
            }
            
            if (url.includes('/tasks/') || url.includes('/quests/')) {
                let tasks = [];
                if (data.data && Array.isArray(data.data)) tasks = data.data;
                else if (Array.isArray(data)) tasks = data;
                else if (data.tasks) tasks = data.tasks;
                else if (data.data && data.data.tasks) tasks = data.data.tasks;
                else if (data) tasks = [data];
                
                g.tasks = tasks.filter(task => task && (task.progress !== undefined || task.desc || task.item_name));
            }
            
            if (url.includes('/combat/') || url.includes('/idle-combat/')) {
                g.combat = {
                    active: data.in_combat || data.active || data.data?.in_combat || false,
                    sess: data,
                    stats: data.combat_log || data.stats || data.data?.combat_log,
                    monster: data.current_monster || data.monster || data.data?.current_monster
                };
            }
            
            if (url.includes('/skills')) {
                if (data.data && data.data.skills) g.skills = data.data.skills;
                else if (data.skills) g.skills = data.skills;
                else g.skills = data;
            }
            
            if (url.includes('/daily-rewards/')) {
                if (data.data) g.daily = data.data;
                else g.daily = data;
            }
            
            if (url.includes('/heartbeat/')) {
                if (data.data) g.heartbeat = data.data;
                else g.heartbeat = data;
            }
            
            if (url.includes('/announcements')) {
                if (data.data) g.announcements = data.data;
                else if (data.announcements) g.announcements = data.announcements;
                else g.announcements = data;
            }
            
            if (url.includes('/vote/') || url.includes('/polls')) {
                if (data.data) g.polls = data.data;
                else if (data.polls) g.polls = data.polls;
                else g.polls = data;
            }
        } catch (err) {
            g.api.errs++;
            t.log('Data processing error:', err);
        }

        g.hist.unshift({
            ts: Date.now(),
            endpoint: endpoint,
            char: g.char ? { name: g.char.name, level: g.char.level } : null,
            combat: g.combat.active,
            skills: Object.keys(g.skills || {}).length,
            tasks: g.tasks.length
        });

        if (g.hist.length > t.CFG.maxDataHistory) {
            g.hist.pop();
        }

        g.lastUp = Date.now();
        g.ts = Date.now();

        if (t.CFG.autoSave) mod.save();

        return g;
    };

    mod.getRank = function (charId) {
        if (!charId || !g.guild?.members) return 'No Guild';
        const member = g.guild.members.find(m => m.character_id === charId);
        if (!member) return 'No Guild';
        const ranks = { 1: 'Leader 👑', 2: 'Officer ⭐', 3: 'Member 👤' };
        return ranks[member.rank_id] || 'Member';
    };

    mod.export = function (type) {
        let data, name, mime;

        switch (type) {
            case 'json':
                data = JSON.stringify(g, null, 2);
                name = `degen-${Date.now()}.json`;
                mime = 'application/json';
                break;
            case 'summary':
                const summary = {
                    char: g.char ? { name: g.char.name, level: g.char.level, gold: g.char.gold, class: g.char.class } : null,
                    combat: g.combat.active ? 'Active' : 'Inactive',
                    guild: g.guild?.info?.name || 'None',
                    skills: Object.keys(g.skills || {}).length,
                    tasks: g.tasks.length,
                    ts: new Date().toISOString()
                };
                data = JSON.stringify(summary, null, 2);
                name = `degen-summary-${Date.now()}.json`;
                mime = 'application/json';
                break;
            case 'hist':
                data = JSON.stringify(g.hist || [], null, 2);
                name = `degen-hist-${Date.now()}.json`;
                mime = 'application/json';
                break;
        }

        if (data) {
            const blob = new Blob([data], { type: mime });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            t.notify(`${type} exported`, 'success');
            return true;
        }

        return false;
    };

    mod.get = function () { return g; };
    mod.set = function (newData) { g = newData; t.game = g; };

    window.DegenData = mod;
    return mod;
})();
