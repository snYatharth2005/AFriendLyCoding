/* AFriendlyCoding Extension — popup.js */
const API_BASE = 'http://localhost:8080';

/* ─── UI helpers ──────────────────────────────────────────────── */
function showStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg; el.className = `status ${type}`; el.style.display = 'block';
}
function hideStatus(id) { document.getElementById(id).style.display = 'none'; }
function setBtn(id, disabled, text) {
  const el = document.getElementById(id); el.disabled = disabled; if (text) el.textContent = text;
}
function setProgress(pct, label) {
  document.getElementById('prog-wrap-lc').style.display = 'block';
  document.getElementById('prog-fill-lc').style.width   = Math.min(pct, 100) + '%';
  document.getElementById('prog-label-lc').textContent  = label;
}
function hideProgress() {
  document.getElementById('prog-wrap-lc').style.display = 'none';
  document.getElementById('prog-fill-lc').style.width   = '0%';
}
function showLogin() {
  document.getElementById('view-login').classList.remove('hidden');
  document.getElementById('view-home').classList.add('hidden');
}
function showHome(username) {
  document.getElementById('view-login').classList.add('hidden');
  document.getElementById('view-home').classList.remove('hidden');
  document.getElementById('chip-avatar').textContent = (username || 'U')[0].toUpperCase();
  document.getElementById('chip-name').textContent   = username;
  document.getElementById('chip-handle').textContent = '@' + username;
}
function renderSyncStats(s) {
  if (!s) return;
  if (s.solved !== undefined) document.getElementById('stat-solved').textContent = s.solved;
  if (s.lastSync) {
    document.getElementById('stat-total').textContent = s.lastSync;
    document.getElementById('last-sync-badge').style.display = 'block';
    document.getElementById('last-sync-time').textContent    = s.lastSync;
  }
}
function setStatsStatus(msg, color) {
  const el = document.getElementById('lc-stats-status');
  el.textContent = msg;
  el.style.color = color || 'var(--t4)';
}

/* ─── Get LeetCode tab ────────────────────────────────────────── */
async function getLCTab() {
  const tabs = await chrome.tabs.query({ url: '*://leetcode.com/*' });
  console.log('[AFC popup] LC tabs:', tabs.length);
  return tabs[0] || null;
}

/* ─── Inject content.js + send message (for sync) ────────────── */
async function injectAndSend(tabId, message) {
  console.log('[AFC popup] Injecting for:', message.type);
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ['src/content.js'] });
  } catch (e) { console.log('[AFC popup] Inject note:', e.message); }
  await new Promise(r => setTimeout(r, 400));
  return new Promise(resolve => {
    chrome.tabs.sendMessage(tabId, message, res => {
      if (chrome.runtime.lastError) console.warn('[AFC popup] sendMessage:', chrome.runtime.lastError.message);
      console.log('[AFC popup] Ack:', res);
      resolve(res || null);
    });
  });
}

/* ─── Poll storage (for sync only) ───────────────────────────── */
function pollStorage(key, onProgress, timeoutMs = 5 * 60 * 1000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const timer = setInterval(async () => {
      if (Date.now() - start > timeoutMs) { clearInterval(timer); reject(new Error('Timed out. Try again.')); return; }
      const data = await chrome.storage.local.get(key);
      const val  = data[key];
      if (!val || !val.done) { if (val) onProgress(val); return; }
      clearInterval(timer);
      val.success ? resolve(val) : reject(new Error(val.error || 'Error in content script'));
    }, 800);
  });
}

/* ─── Safe response reader ────────────────────────────────────── */
async function readResponse(res) {
  const text = await res.text();
  console.log('[AFC popup] Raw backend response:', text.substring(0, 200));
  try { return JSON.parse(text); } catch { return text; }
}

/* ─── FETCH LIVE STATS via executeScript (returns value directly) */
/* This avoids the storage-polling race condition entirely.
   executeScript runs the function in the tab and returns the result
   directly to the popup — no message passing needed.              */
async function fetchLiveStats() {
  const refreshBtn = document.getElementById('btn-refresh-stats');
  refreshBtn.disabled = true;
  refreshBtn.innerHTML = '<span class="spinning">↻</span>';
  setStatsStatus('loading…', 'var(--t3)');

  try {
    const tab = await getLCTab();
    if (!tab) {
      setStatsStatus('open leetcode.com tab', 'var(--t4)');
      return;
    }

    console.log('[AFC popup] Fetching live stats via executeScript in tab:', tab.id);

    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        // This runs INSIDE the LeetCode tab — has full cookie access
        function getCookie(name) {
          return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
        }
        const csrf = getCookie('csrftoken');
        if (!csrf) return { error: 'No csrftoken — not logged into LeetCode' };

        const gql = (query, variables) => fetch('https://leetcode.com/graphql/', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-csrftoken': csrf, 'Referer': 'https://leetcode.com/' },
          body: JSON.stringify({ query, variables })
        }).then(r => r.json());

        try {
          // Get username
          const meData = await gql(`query { userStatus { username } }`);
          const username = meData?.data?.userStatus?.username;
          if (!username) return { error: 'Not logged into LeetCode' };

          const year = new Date().getFullYear();

          // Get streak via getStreakCounter (authenticated, matches LC profile exactly)
          const streakData = await gql(
            `query getStreakCounter {
               streakCounter {
                 streakCount
                 daysSkipped
                 currentDayCompleted
               }
             }`,
            {}
          );
          console.log('[AFC stats] streakData:', JSON.stringify(streakData));
          const streak = streakData?.data?.streakCounter?.streakCount ?? 0;
          console.log('[AFC stats] streak:', streak);

          // Get this week from recentAcSubmissionList (last 50, filter last 7 days)
          const subData = await gql(
            `query recentAc($username: String!) {
               recentAcSubmissionList(username: $username, limit: 50) {
                 titleSlug
                 timestamp
               }
             }`,
            { username }
          );
          const now7 = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
          const subs  = subData?.data?.recentAcSubmissionList || [];
          const weekSet = new Set(
            subs.filter(s => parseInt(s.timestamp) >= now7).map(s => s.titleSlug)
          );
          const thisWeek = weekSet.size;
          console.log('[AFC stats] thisWeek:', thisWeek, 'username:', username);

          return { streak, thisWeek, username };
        } catch (e) {
          return { error: e.message };
        }
      }
    });

    console.log('[AFC popup] executeScript results:', results);
    const result = results?.[0]?.result;

    if (!result || result.error) {
      console.error('[AFC popup] Stats error:', result?.error);
      setStatsStatus(result?.error || 'failed', 'var(--red)');
      return;
    }

    document.getElementById('streak-val').textContent     = result.streak;
    document.getElementById('stat-this-week').textContent = result.thisWeek;
    setStatsStatus('live ✓', 'var(--green)');
    console.log('[AFC popup] Stats updated — streak:', result.streak, 'thisWeek:', result.thisWeek);

  } catch (e) {
    console.error('[AFC popup] fetchLiveStats error:', e.message);
    setStatsStatus('failed', 'var(--red)');
  } finally {
    refreshBtn.disabled = false;
    refreshBtn.innerHTML = '↻';
  }
}

/* ─── LOGIN ───────────────────────────────────────────────────── */
async function login() {
  const username = document.getElementById('inp-username').value.trim();
  const password = document.getElementById('inp-password').value;
  if (!username || !password) { showStatus('login-status', 'Enter username and password.', 'error'); return; }
  setBtn('btn-login', true, '⏳ Signing in…');
  hideStatus('login-status');
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      let msg = `Login failed (${res.status})`;
      try { const b = await res.json(); msg = b.message || b.error || msg; } catch {}
      throw new Error(msg);
    }
    const data = await res.json();
    if (!data.token) throw new Error('No token. Keys: ' + Object.keys(data).join(', '));
    await chrome.storage.local.set({ APP_JWT_TOKEN: data.token, username });
    const stored = await chrome.storage.local.get('syncStats');
    renderSyncStats(stored.syncStats);
    showHome(username);
    document.getElementById('inp-password').value = '';
    fetchLiveStats();
  } catch (e) {
    console.error('[AFC popup] Login error:', e.message);
    showStatus('login-status', e.message, 'error');
  } finally {
    setBtn('btn-login', false, '🔑 Sign In');
  }
}

/* ─── SILENT PROFILE SYNC — called automatically after problem sync ── */
/* Fetches streak + thisWeek and POSTs to backend without UI feedback  */
async function silentSyncProfile(token, tabId) {
  try {
    console.log('[AFC popup] Silent profile sync starting...');

    // Get LC profile basics
    await chrome.storage.local.remove('syncProfileStatus');
    await injectAndSend(tabId, { type: 'SYNC_PROFILE' });
    const profileResult = await pollStorage('syncProfileStatus', () => {}, 15000);
    const profile = profileResult.profile;

    // Get streak + thisWeek via executeScript
    const statsResults = await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        function getCookie(name) {
          return document.cookie.split("; ").find(r => r.startsWith(name + "="))?.split("=")[1];
        }
        const csrf = getCookie("csrftoken");
        if (!csrf) return { error: "No csrf" };
        const gql = (query, variables) => fetch("https://leetcode.com/graphql/", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json", "x-csrftoken": csrf, "Referer": "https://leetcode.com/" },
          body: JSON.stringify({ query, variables })
        }).then(r => r.json());
        try {
          const streakData = await gql("query getStreakCounter { streakCounter { streakCount } }", {});
          const streak = streakData?.data?.streakCounter?.streakCount ?? 0;
          const meData = await gql("query { userStatus { username } }", {});
          const username = meData?.data?.userStatus?.username;
          const subData = await gql(
            "query recentAc($username: String!) { recentAcSubmissionList(username: $username, limit: 50) { titleSlug timestamp } }",
            { username }
          );
          const now7 = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
          const subs = subData?.data?.recentAcSubmissionList || [];
          const thisWeek = new Set(subs.filter(s => parseInt(s.timestamp) >= now7).map(s => s.titleSlug)).size;
          return { streak, thisWeek };
        } catch (e) { return { error: e.message }; }
      }
    });

    const stats = statsResults?.[0]?.result;
    if (!stats || stats.error) { console.warn('[AFC popup] Silent stats failed:', stats?.error); return; }

    const payload = {
      avatar:                profile.avatar,
      realName:              profile.realName,
      leetCodeUsername:      profile.username,
      isSignedIn:            profile.isSignedIn,
      streak:                stats.streak,
      problemsSolvedInAWeek: stats.thisWeek,
      lastSyncedAt:          new Date().toISOString().replace('Z', '')
    };
    console.log('[AFC popup] Silent profile payload:', payload);

    const res = await fetch(`${API_BASE}/api/leetcode/sync/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    console.log('[AFC popup] Silent profile sync result:', res.status);

    // Update live stats in UI
    if (res.ok) {
      document.getElementById('streak-val').textContent     = stats.streak;
      document.getElementById('stat-this-week').textContent = stats.thisWeek;
      setStatsStatus('live ✓', 'var(--green)');
    }
  } catch (e) {
    console.warn('[AFC popup] Silent profile sync error (non-fatal):', e.message);
  }
}

/* ─── SYNC PROBLEMS ───────────────────────────────────────────── */
async function syncProblems() {
  setBtn('btn-sync-lc', true, '⏳ Syncing…');
  hideStatus('sync-lc-status');
  setProgress(5, 'Starting…');
  try {
    const { APP_JWT_TOKEN, username } = await chrome.storage.local.get(['APP_JWT_TOKEN', 'username']);
    if (!APP_JWT_TOKEN) { showLogin(); return; }

    const tab = await getLCTab();
    if (!tab) { showStatus('sync-lc-status', 'No LeetCode tab found. Open leetcode.com first.', 'error'); hideProgress(); return; }

    // Step 1: get already-synced slugs
    setProgress(5, 'Checking backend…');
    let syncedSlugs = new Set();
    try {
      const existingRes = await fetch(`${API_BASE}/questions/get/${username}`, {
        headers: { 'Authorization': `Bearer ${APP_JWT_TOKEN}` }
      });
      if (existingRes.ok) {
        const existing = await existingRes.json();
        console.log('[AFC popup] Already synced:', existing.length, 'sample:', existing[0]);
        existing.forEach(q => { const s = q.slug || q.titleSlug; if (s) syncedSlugs.add(s); });
      }
    } catch (e) { console.warn('[AFC popup] Could not fetch existing:', e.message); }

    // Step 2: fetch from LeetCode
    await chrome.storage.local.remove('syncSolvedStatus');
    setProgress(10, 'Fetching from LeetCode…');
    showStatus('sync-lc-status', 'Fetching solved problems…', 'info');
    await injectAndSend(tab.id, { type: 'SYNC_SOLVED' });

    const result = await pollStorage('syncSolvedStatus', (p) => {
      const pct = p.total > 0 ? Math.round((p.fetched / p.total) * 60) + 10 : 15;
      setProgress(pct, `Found ${p.fetched} solved / ${p.total} scanned…`);
      showStatus('sync-lc-status', `Fetching… ${p.fetched} solved found`, 'info');
    });

    const { allProblems } = await chrome.storage.local.get('allProblems');
    if (!allProblems?.length) throw new Error('No problems in storage after fetch.');

    const newProblems = syncedSlugs.size > 0 ? allProblems.filter(p => !syncedSlugs.has(p.slug)) : allProblems;
    console.log(`[AFC popup] Total: ${allProblems.length} | Synced: ${syncedSlugs.size} | New: ${newProblems.length}`);

    if (newProblems.length === 0) {
      setProgress(100, 'Already up to date!');
      const stats = { solved: allProblems.length, lastSync: new Date().toLocaleString() };
      await chrome.storage.local.set({ syncStats: stats });
      renderSyncStats(stats);
      showStatus('sync-lc-status', `✅ Already up to date! ${allProblems.length} total solved.`, 'success');
      fetchLiveStats();
      return;
    }

    // Step 3: POST to backend
    setProgress(80, `Uploading ${newProblems.length} new problems…`);
    showStatus('sync-lc-status', `Uploading ${newProblems.length} new…`, 'info');
    const syncRes = await fetch(`${API_BASE}/api/leetcode/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${APP_JWT_TOKEN}` },
      body: JSON.stringify({ problems: newProblems })
    });
    if (syncRes.status === 401 || syncRes.status === 403) {
      await chrome.storage.local.remove(['APP_JWT_TOKEN', 'username', 'syncStats']);
      showLogin(); showStatus('login-status', 'Session expired.', 'error'); return;
    }
    if (!syncRes.ok) throw new Error(`Backend failed (${syncRes.status}): ${await syncRes.text()}`);

    await readResponse(syncRes);
    setProgress(100, 'Done!');
    const stats = { solved: allProblems.length, lastSync: new Date().toLocaleString() };
    await chrome.storage.local.set({ syncStats: stats });
    renderSyncStats(stats);
    showStatus('sync-lc-status', `✅ Synced! ${newProblems.length} new · ${allProblems.length} total`, 'success');
    fetchLiveStats();
    silentSyncProfile(APP_JWT_TOKEN, tab.id); // auto-sync streak+week

  } catch (e) {
    console.error('[AFC popup] syncProblems error:', e);
    showStatus('sync-lc-status', 'Error: ' + e.message, 'error');
  } finally {
    setBtn('btn-sync-lc', false, '🔄 Sync Problems');
    setTimeout(hideProgress, 3000);
  }
}

/* ─── SYNC PROFILE ────────────────────────────────────────────── */
async function syncProfile() {
  setBtn('btn-sync-profile', true, '⏳ Syncing profile…');
  hideStatus('sync-profile-status');
  try {
    const { APP_JWT_TOKEN } = await chrome.storage.local.get('APP_JWT_TOKEN');
    if (!APP_JWT_TOKEN) { showLogin(); return; }

    const tab = await getLCTab();
    if (!tab) { showStatus('sync-profile-status', 'Open leetcode.com first.', 'error'); return; }

    // Step 1 — fetch LC profile (avatar, name, username)
    showStatus('sync-profile-status', 'Fetching profile from LeetCode…', 'info');
    await chrome.storage.local.remove('syncProfileStatus');
    await injectAndSend(tab.id, { type: 'SYNC_PROFILE' });
    const profileResult = await pollStorage('syncProfileStatus', () => {}, 30000);
    const profile = profileResult.profile;
    console.log('[AFC popup] Profile fetched:', profile);

    // Step 2 — fetch streak + thisWeek via executeScript (same method as fetchLiveStats)
    showStatus('sync-profile-status', 'Fetching streak & weekly stats…', 'info');
    const statsResults = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async () => {
        function getCookie(name) {
          return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
        }
        const csrf = getCookie('csrftoken');
        if (!csrf) return { error: 'No csrftoken' };
        const gql = (query, variables) => fetch('https://leetcode.com/graphql/', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'x-csrftoken': csrf, 'Referer': 'https://leetcode.com/' },
          body: JSON.stringify({ query, variables })
        }).then(r => r.json());

        try {
          // Streak
          const streakData = await gql(`query getStreakCounter { streakCounter { streakCount daysSkipped currentDayCompleted } }`, {});
          const streak = streakData?.data?.streakCounter?.streakCount ?? 0;

          // This week (last 7 days, deduplicated by slug)
          const meData = await gql(`query { userStatus { username } }`, {});
          const username = meData?.data?.userStatus?.username;
          const subData = await gql(
            `query recentAc($username: String!) { recentAcSubmissionList(username: $username, limit: 50) { titleSlug timestamp } }`,
            { username }
          );
          const now7 = Math.floor(Date.now() / 1000) - 7 * 24 * 3600;
          const subs = subData?.data?.recentAcSubmissionList || [];
          const thisWeek = new Set(subs.filter(s => parseInt(s.timestamp) >= now7).map(s => s.titleSlug)).size;

          console.log('[AFC stats in syncProfile] streak:', streak, 'thisWeek:', thisWeek);
          return { streak, thisWeek };
        } catch (e) { return { error: e.message }; }
      }
    });

    const stats = statsResults?.[0]?.result;
    console.log('[AFC popup] Stats for profile sync:', stats);
    if (stats?.error) console.warn('[AFC popup] Stats warning (non-fatal):', stats.error);

    // Step 3 — get lastSyncedAt from backend
    let lastSyncedAt = null;
    try {
      const lastSyncRes = await fetch(`${API_BASE}/api/leetcode/lastSyncedAt`, {
        headers: { 'Authorization': `Bearer ${APP_JWT_TOKEN}` }
      });
      if (lastSyncRes.ok) {
        lastSyncedAt = await lastSyncRes.text(); // comes as ISO string or null
        lastSyncedAt = lastSyncedAt.replace(/"/g, ''); // strip JSON quotes if any
        if (lastSyncedAt === 'null') lastSyncedAt = null;
        console.log('[AFC popup] lastSyncedAt from backend:', lastSyncedAt);
      }
    } catch (e) { console.warn('[AFC popup] Could not get lastSyncedAt:', e.message); }

    // Step 4 — POST all to /api/leetcode/sync/profile
    showStatus('sync-profile-status', 'Saving to backend…', 'info');
    const payload = {
      avatar:                profile.avatar,
      realName:              profile.realName,
      leetCodeUsername:      profile.username,
      isSignedIn:            profile.isSignedIn,
      streak:                stats?.streak  ?? null,
      problemsSolvedInAWeek: stats?.thisWeek ?? null,
      lastSyncedAt:          lastSyncedAt
    };
    console.log('[AFC popup] Profile sync payload:', payload);

    const res = await fetch(`${API_BASE}/api/leetcode/sync/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${APP_JWT_TOKEN}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Profile backend failed (${res.status})`);

    // Update live stats display too
    if (stats && !stats.error) {
      document.getElementById('streak-val').textContent     = stats.streak;
      document.getElementById('stat-this-week').textContent = stats.thisWeek;
      setStatsStatus('live ✓', 'var(--green)');
    }

    showStatus('sync-profile-status',
      `✅ Profile synced! Streak: ${stats?.streak ?? '?'} 🔥 · Week: ${stats?.thisWeek ?? '?'} solved`, 'success');

  } catch (e) {
    console.error('[AFC popup] syncProfile error:', e.message);
    showStatus('sync-profile-status', 'Error: ' + e.message, 'error');
  } finally {
    setBtn('btn-sync-profile', false, '👤 Sync Profile');
  }
}

/* ─── LOGOUT ──────────────────────────────────────────────────── */
async function logout() {
  await chrome.storage.local.remove(['APP_JWT_TOKEN', 'username', 'syncStats',
    'allProblems', 'leetcodeProfile', 'syncSolvedStatus', 'syncProfileStatus', 'lcStatsStatus']);
  document.getElementById('inp-username').value = '';
  document.getElementById('inp-password').value = '';
  hideStatus('login-status');
  showLogin();
}

/* ─── INIT ────────────────────────────────────────────────────── */
chrome.storage.local.get(['APP_JWT_TOKEN', 'username', 'syncStats'], data => {
  if (data.APP_JWT_TOKEN && data.username) {
    renderSyncStats(data.syncStats);
    showHome(data.username);
    fetchLiveStats();
  } else {
    showLogin();
  }
});

document.getElementById('btn-login').addEventListener('click', login);
document.getElementById('inp-username').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('inp-password').focus(); });
document.getElementById('inp-password').addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
document.getElementById('btn-sync-lc').addEventListener('click', syncProblems);
document.getElementById('btn-sync-profile').addEventListener('click', syncProfile);
document.getElementById('btn-refresh-stats').addEventListener('click', fetchLiveStats);
document.getElementById('btn-logout').addEventListener('click', logout);
