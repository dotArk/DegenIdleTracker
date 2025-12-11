const DegenUI = (function () {
    'use strict';

    const mod = {};
    let t = null; // tracker
    let ov = null; // overlay
    let curTab = 'dashboard';

    mod.init = function (tracker) {
        t = tracker;

        createOV();

        if (t.CFG.uiIntegration) {
            setTimeout(() => createBtn(), 1000);
        } else {
            createFloatBtn();
        }

        createTabs();
        setupEvents();
        addStyles();

        setInterval(() => {
            if (t.game && t.game.lastUp) {
                update();
                updateInd();
            }
        }, 5000);

        t.log('UI ready (passive mode)');
    };

    function createOV() {
        const existing = document.getElementById('degen-ov');
        if (existing) existing.remove();

        ov = document.createElement('div');
        ov.id = 'degen-ov';
        ov.style.cssText = `
            position: fixed; top: 10px; right: 10px;
            background: linear-gradient(135deg, rgba(26, 26, 46, 0.95), rgba(44, 62, 80, 0.95));
            color: #fff; padding: 15px; border-radius: 12px;
            font-family: 'Segoe UI', sans-serif; font-size: 13px;
            z-index: 10000; width: 450px; max-height: 85vh;
            overflow-y: auto; border: 2px solid #3498db;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            backdrop-filter: blur(10px); display: none;
        `;

        const tabs = document.createElement('div');
        tabs.id = 'degen-tabs';
        tabs.style.cssText = `
            display: flex; flex-wrap: wrap; gap: 5px;
            margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1);
            padding-bottom: 10px;
        `;

        ov.appendChild(tabs);

        const content = document.createElement('div');
        content.id = 'degen-content';
        ov.appendChild(content);

        document.body.appendChild(ov);
    }

    function createBtn() {
        const header = document.querySelector('.h-16.px-4.flex.items-center.justify-between');
        if (!header) {
            createFloatBtn();
            return;
        }

        const btnCont = header.querySelector('.flex.items-center.space-x-1.md\\:space-x-4');
        if (!btnCont) {
            createFloatBtn();
            return;
        }

        const existing = document.getElementById('degen-btn');
        if (existing) existing.remove();

        const btn = document.createElement('button');
        btn.id = 'degen-btn';
        btn.type = 'button';
        btn.className = 'bg-[#1E2330] text-[#C5C6C9] px-2 md:px-4 h-10 rounded-lg flex items-center gap-2 hover:bg-[#252B3B] transition-colors cursor-pointer';
        btn.title = 'Degen Tracker (Passive Mode)';

        btn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                <path d="M3 3v18h18"></path>
                <path d="M7 16h8"></path>
                <path d="M7 11h12"></path>
                <path d="M7 6h3"></path>
                <rect x="12" y="8" width="3" height="4" rx="1"></rect>
                <rect x="17" y="13" width="3" height="4" rx="1"></rect>
            </svg>
            <span class="hidden md:inline font-medium">Tracker</span>
        `;

        const ind = document.createElement('div');
        ind.id = 'degen-ind';
        ind.style.cssText = `
            position: absolute; top: -2px; right: -2px;
            width: 8px; height: 8px; border-radius: 50%;
            background-color: #2ecc71; border: 2px solid #1E2330;
            display: none;
        `;

        const wrap = document.createElement('div');
        wrap.className = 'relative';
        wrap.appendChild(btn);
        wrap.appendChild(ind);

        const children = btnCont.children;
        let insertBefore = null;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (child.querySelector && child.querySelector('span.font-medium')) {
                insertBefore = child;
                break;
            }
        }

        if (insertBefore) {
            btnCont.insertBefore(wrap, insertBefore);
        } else {
            btnCont.appendChild(wrap);
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            mod.toggle();
        });
    }

    function createFloatBtn() {
        const btn = document.createElement('button');
        btn.id = 'degen-toggle';
        btn.innerHTML = '<span style="font-size: 16px; margin-right: 5px;">📊</span>Tracker';
        btn.style.cssText = `
            position: fixed; top: 10px; right: 10px;
            background: linear-gradient(135deg, #3498db, #9b59b6);
            color: white; border: none; padding: 8px 12px;
            border-radius: 6px; font-family: 'Segoe UI', sans-serif;
            font-size: 12px; cursor: pointer; z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex; align-items: center; font-weight: bold;
            transition: transform 0.2s, box-shadow 0.2s;
        `;

        btn.addEventListener('mouseover', () => {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
        });

        btn.addEventListener('mouseout', () => {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        });

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            mod.toggle();
        });

        document.body.appendChild(btn);
    }

    function createTabs() {
        const tabs = [
            { id: 'dashboard', name: 'Dashboard', icon: '📊' },
            { id: 'character', name: 'Character', icon: '👤' },
            { id: 'tasks', name: 'Tasks', icon: '📋' },
            { id: 'debug', name: 'Debug', icon: '🔧' }
        ];

        const tabsCont = document.getElementById('degen-tabs');
        if (!tabsCont) return;

        tabsCont.innerHTML = '';

        tabs.forEach(tab => {
            const btn = document.createElement('button');
            btn.id = `tab-${tab.id}`;
            btn.className = 'degen-tab';
            btn.innerHTML = `${tab.icon} ${tab.name}`;
            btn.style.cssText = `
                background: transparent; color: #95a5a6;
                border: none; padding: 8px 12px; border-radius: 6px;
                cursor: pointer; font-size: 12px; transition: all 0.3s;
                display: flex; align-items: center; gap: 5px;
            `;

            btn.addEventListener('click', () => {
                document.querySelectorAll('.degen-tab').forEach(t => {
                    t.style.background = 'transparent';
                    t.style.color = '#95a5a6';
                });

                btn.style.background = 'rgba(52, 152, 219, 0.2)';
                btn.style.color = '#3498db';
                curTab = tab.id;
                updateTab(tab.id);
            });

            tabsCont.appendChild(btn);
        });

        setTimeout(() => {
            document.getElementById('tab-dashboard')?.click();
        }, 100);
    }

    function updateTab(tabId) {
        const content = document.getElementById('degen-content');
        if (!content) return;

        content.innerHTML = '';

        switch (tabId) {
            case 'dashboard':
                content.innerHTML = createDash();
                break;
            case 'character':
                content.innerHTML = createChar();
                break;
            case 'tasks':
                content.innerHTML = createTasks();
                break;
            case 'debug':
                content.innerHTML = createDebug();
                break;
        }
    }

    function createDash() {
        const g = t.game || {};
        const hasChar = g.char?.name || g.skills?.character_name;
        const hasData = g.api?.calls > 0;

        let html = `
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                    <div style="font-size: 14px; color: #ecf0f1;">Degen Tracker v${g.ver || '0.5.0'}</div>
                    <div style="font-size: 10px; background: #3498db; color: white; padding: 2px 8px; border-radius: 10px;">by .Ark</div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid ${hasData ? '#2ecc71' : '#3498db'}; margin-bottom: 15px;">
                    <div style="color: ${hasData ? '#2ecc71' : '#3498db'}; font-weight: bold; margin-bottom: 5px;">
                        ${hasData ? '✅ PASSIVE MONITORING' : '👀 READY TO MONITOR'}
                    </div>
                    <div style="color: #bdc3c7; font-size: 11px;">
                        ${hasData
                ? `Tracking ${g.api.calls} game API calls`
                : 'Play normally to see data appear'}
                    </div>
                    <div style="color: #7f8c8d; font-size: 10px; margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.05);">
                        📡 <em>No additional server requests are made</em>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
        `;

        const stats = [
            { label: 'Character', value: hasChar ? (g.char?.name || g.skills?.character_name) : 'Unknown', color: hasChar ? '#2ecc71' : '#95a5a6', icon: '👤' },
            { label: 'Level', value: g.char?.level || g.skills?.combat || '?', color: '#3498db', icon: '⭐' },
            { label: 'Gold', value: g.char?.gold ? t.fmt(g.char.gold) : '?', color: '#f1c40f', icon: '💰' },
            { label: 'Active Tasks', value: g.tasks?.length || 0, color: '#9b59b6', icon: '📋' },
            { label: 'API Calls', value: g.api?.calls || 0, color: hasData ? '#2ecc71' : '#95a5a6', icon: '📡' },
            { label: 'Last Update', value: g.lastUp ? t.timeAgo(g.lastUp) : 'Never', color: '#e74c3c', icon: '🕒' }
        ];

        stats.forEach(s => {
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span style="font-size: 12px;">${s.icon}</span>
                        <div style="font-size: 10px; color: #95a5a6;">${s.label}</div>
                    </div>
                    <div style="color: ${s.color}; font-size: 14px; font-weight: bold;">${s.value}</div>
                </div>
            `;
        });

        html += `</div>`;

        if (!hasData) {
            html += `
                <div style="background: rgba(52, 152, 219, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #3498db;">
                    <div style="color: #3498db; font-weight: bold; margin-bottom: 10px;">💡 How It Works</div>
                    <div style="color: #ecf0f1; font-size: 11px; line-height: 1.5;">
                        <div style="margin-bottom: 5px;">1. <strong>Play the game normally</strong></div>
                        <div style="margin-bottom: 5px;">2. <strong>Data appears automatically</strong> as you play</div>
                        <div style="margin-bottom: 5px;">3. <strong>Zero extra server load</strong> - only reads existing calls</div>
                        <div>4. <strong>Check back after playing</strong> to see your stats</div>
                    </div>
                </div>
            `;
        }

        return html;
    }

    function createChar() {
        const g = t.game || {};
        const char = g.char || {};
        const skills = g.skills || {};

        let html = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">👤 Character</h3>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                        <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
                            ${char.class === 'warrior' ? '⚔️' : char.class === 'mage' ? '🔮' : char.class === 'ranger' ? '🏹' : '👤'}
                        </div>
                        <div>
                            <div style="font-size: 18px; color: #ecf0f1; font-weight: bold;">${char.name || 'Unknown'}</div>
                            <div style="font-size: 12px; color: #95a5a6;">
                                ${char.class ? char.class.charAt(0).toUpperCase() + char.class.slice(1) : 'Unknown Class'}
                            </div>
                            <div style="font-size: 11px; color: #3498db; margin-top: 4px;">Level ${char.level || skills.combat || '?'}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px;">
        `;

        const stats = [
            { label: 'Total Level', value: char.total_level || char.level || skills.combat || '?', icon: '⭐' },
            { label: 'Gold', value: char.gold ? t.fmt(char.gold) : '0', icon: '💰' },
            { label: 'Location', value: char.location || 'Unknown', icon: '📍' },
            { label: 'Created', value: char.created_at ? new Date(char.created_at).toLocaleDateString() : '?', icon: '📅' }
        ];

        if (skills && Object.keys(skills).length > 0) {
            const skillEntries = Object.entries(skills)
                .filter(([key, val]) => typeof val === 'number' && !key.includes('character'))
                .sort((a, b) => b[1] - a[1])
                .slice(0, 2);

            skillEntries.forEach(([skill, level], i) => {
                const skillName = skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                stats.push({
                    label: skillName,
                    value: t.fmt(level),
                    icon: i === 0 ? '🏆' : '📊'
                });
            });
        }

        stats.forEach(s => {
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span style="font-size: 12px;">${s.icon}</span>
                        <div style="font-size: 10px; color: #95a5a6;">${s.label}</div>
                    </div>
                    <div style="color: #ecf0f1; font-size: 14px; font-weight: bold;">${s.value}</div>
                </div>
            `;
        });

        html += `</div>`;

        return html;
    }

    function createTasks() {
        const g = t.game || {};
        const tasks = g.tasks || [];

        let html = `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">📋 Tasks</h3>
        `;

        if (tasks.length > 0) {
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="color: #2ecc71; font-weight: bold; margin-bottom: 10px;">Active: ${tasks.length}</div>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
            `;

            tasks.forEach((task, i) => {
                if (!task) return;

                const name = task.description || task.item_name || task.name || `Task ${i + 1}`;
                const prog = task.progress || task.current_progress || 0;
                const target = task.target || task.required || task.quantity || 1;
                const pct = Math.min(100, (prog / target) * 100);

                html += `
                    <div style="background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border-left: 4px solid #3498db;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div style="color: #ecf0f1; font-size: 12px; font-weight: bold;">${name}</div>
                            <div style="background: rgba(52, 152, 219, 0.2); color: #3498db; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                                ${prog}/${target}
                            </div>
                        </div>
                        
                        <div style="background: rgba(0,0,0,0.3); height: 6px; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
                            <div style="width: ${pct}%; height: 100%; background: linear-gradient(90deg, #3498db, #2ecc71);"></div>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #95a5a6;">
                            <div>${task.type ? task.type.charAt(0).toUpperCase() + task.type.slice(1) : ''}</div>
                            <div>${task.reward_gold ? `💰 ${t.fmt(task.reward_gold)}` : ''}</div>
                        </div>
                    </div>
                `;
            });

            html += `</div></div>`;
        } else {
            html += `
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📋</div>
                    <div style="color: #95a5a6; margin-bottom: 10px;">No tasks detected yet</div>
                    <div style="color: #7f8c8d; font-size: 11px;">
                        Accept quests in-game to see them here<br>
                        <small>Data appears as you play</small>
                    </div>
                </div>
            `;
        }

        return html;
    }

    function createDebug() {
        const g = t.game || {};

        return `
            <div style="margin-bottom: 20px;">
                <h3 style="color: #3498db; margin-bottom: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">🔧 Debug</h3>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="color: #3498db; font-weight: bold; margin-bottom: 10px;">📡 Passive Mode Active</div>
                    <div style="color: #95a5a6; font-size: 11px; margin-bottom: 15px; line-height: 1.5;">
                        <strong>This tracker makes ZERO API calls</strong><br>
                        It only reads data that the game fetches naturally.<br>
                        <em>No additional server load is created.</em>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 15px;">
                        <button onclick="DegenTracker.data.extractPageData()" style="
                            background: linear-gradient(135deg, #3498db, #2980b9);
                            border: none; color: white; padding: 12px;
                            border-radius: 8px; cursor: pointer; font-weight: bold;
                            font-size: 12px; display: flex; align-items: center;
                            gap: 10px; justify-content: center;
                        ">
                            <span>🔍</span> Read Page Data
                        </button>
                        
                        <button onclick="DegenTracker.api.test()" style="
                            background: linear-gradient(135deg, #9b59b6, #8e44ad);
                            border: none; color: white; padding: 12px;
                            border-radius: 8px; cursor: pointer; font-weight: bold;
                            font-size: 12px; display: flex; align-items: center;
                            gap: 10px; justify-content: center;
                        ">
                            <span>📡</span> Test Interception
                        </button>
                    </div>
                    
                    <div style="color: #7f8c8d; font-size: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.05);">
                        💡 <em>Note: These buttons only read existing data, never make new API calls</em>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="color: #3498db; font-weight: bold; margin-bottom: 10px;">📊 Statistics</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                            <div style="color: #95a5a6; font-size: 10px;">Intercepted Calls</div>
                            <div style="color: #ecf0f1; font-size: 16px; font-weight: bold;">${g.api?.calls || 0}</div>
                        </div>
                        <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                            <div style="color: #95a5a6; font-size: 10px;">Last Update</div>
                            <div style="color: #ecf0f1; font-size: 12px;">${g.lastUp ? t.timeAgo(g.lastUp) : 'Never'}</div>
                        </div>
                        <div style="padding: 10px; background: rgba(255,255,255,0.03); border-radius: 6px;">
                            <div style="color: #95a5a6; font-size: 10px;">Errors</div>
                            <div style="color: #e74c3c; font-size: 16px; font-weight: bold;">${g.api?.errs || 0}</div>
                        </div>
                    </div>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px;">
                    <div style="color: #3498db; font-weight: bold; margin-bottom: 10px;">⚙️ System</div>
                    <div style="display: grid; grid-template-columns: 1fr; gap: 8px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div style="color: #ecf0f1; font-size: 11px;">Auto Save</div>
                            <div style="color: ${t.CFG.autoSave ? '#2ecc71' : '#e74c3c'}; font-size: 11px; font-weight: bold;">
                                ${t.CFG.autoSave ? 'ON' : 'OFF'}
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                            <div style="color: #ecf0f1; font-size: 11px;">Data Points</div>
                            <div style="color: #3498db; font-size: 11px; font-weight: bold;">${g.hist?.length || 0}</div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
                            <div style="color: #ecf0f1; font-size: 11px;">Version</div>
                            <div style="color: #f1c40f; font-size: 11px; font-weight: bold;">v${g.ver || '0.5.0'}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function setupEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest && e.target.closest('[onclick]')) {
                return;
            }
        });
    }

    function addStyles() {
        const style = document.createElement('style');
        style.id = 'degen-styles';
        style.textContent = `
            #degen-btn.active {
                background-color: #252B3B !important;
                color: white !important;
            }
            
            #degen-ind.pulse {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            
            .degen-tab:hover {
                background-color: rgba(52, 152, 219, 0.1) !important;
            }
            
            button:hover {
                transform: translateY(-1px);
                transition: transform 0.2s;
            }
        `;
        document.head.appendChild(style);
    }

    function updateInd() {
        const ind = document.getElementById('degen-ind');
        if (!ind) return;

        const g = t.game || {};

        if (g.lastUp) {
            ind.style.display = 'block';
            const since = Date.now() - g.lastUp;
            if (since < 30000) ind.style.backgroundColor = '#2ecc71';
            else if (since < 300000) ind.style.backgroundColor = '#f1c40f';
            else ind.style.backgroundColor = '#e74c3c';
        } else {
            ind.style.display = 'none';
        }
    }

    function update() {
        if (ov && ov.style.display === 'block') {
            updateTab(curTab);
            updateInd();
        }
    }

    mod.toggle = function () {
        if (!ov) return;

        if (ov.style.display === 'none' || !ov.style.display) {
            ov.style.display = 'block';
            const floatBtn = document.getElementById('degen-toggle');
            if (floatBtn) floatBtn.style.right = '470px';
            update();

            const intBtn = document.getElementById('degen-btn');
            if (intBtn) {
                intBtn.classList.add('bg-[#252B3B]', 'text-white');
                intBtn.classList.remove('text-[#C5C6C9]');
            }
        } else {
            ov.style.display = 'none';
            const floatBtn = document.getElementById('degen-toggle');
            if (floatBtn) floatBtn.style.right = '10px';

            const intBtn = document.getElementById('degen-btn');
            if (intBtn) {
                intBtn.classList.remove('bg-[#252B3B]', 'text-white');
                intBtn.classList.add('text-[#C5C6C9]');
            }
        }
    };

    window.DegenUI = mod;
    return mod;
})();
