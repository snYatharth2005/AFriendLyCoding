const app = document.getElementById("app");
let isSyncing = false;

/* =====================================================
   UTILITIES
===================================================== */

function showNotification(message, type = "info", duration = 3000) {
  const n = document.createElement("div");
  n.textContent = message;

  n.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    z-index: 10000;
    opacity: 0;
    transform: translateX(100%);
    transition: all 0.3s ease;
    background: ${
      type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"
    };
  `;

  document.body.appendChild(n);

  requestAnimationFrame(() => {
    n.style.opacity = "1";
    n.style.transform = "translateX(0)";
  });

  setTimeout(() => {
    n.style.opacity = "0";
    n.style.transform = "translateX(100%)";
    setTimeout(() => n.remove(), 300);
  }, duration);
}

function formatDate(d) {
  if (!d) return "Never";
  const date = new Date(d);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
}

async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

function sendMessageWithTimeout(tabId, message, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("Timeout")), timeout);
    chrome.tabs.sendMessage(tabId, message, (res) => {
      clearTimeout(id);
      chrome.runtime.lastError
        ? reject(new Error(chrome.runtime.lastError.message))
        : resolve(res);
    });
  });
}

/* =====================================================
   ENTRY
===================================================== */

document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["APP_JWT_TOKEN"], (d) => {
    d.APP_JWT_TOKEN ? renderDashboard() : renderLogin();
  });
});

/* =====================================================
   LOGIN
===================================================== */

function renderLogin() {
  app.innerHTML = `
    <div class="container">
      <h3>🔐 LeetCode Sync Login</h3>
      <input id="username" placeholder="Username"/>
      <input id="password" type="password" placeholder="Password"/>
      <button id="loginBtn">Login</button>
      <p id="loginMessage"></p>
    </div>
  `;
  loginBtn.onclick = login;
}

async function login() {
  const u = username.value.trim();
  const p = password.value.trim();
  const msg = document.getElementById("loginMessage");

  if (!u || !p) return (msg.textContent = "Missing credentials");

  try {
    const res = await fetchWithTimeout("http://127.0.0.1:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: u, password: p }),
    });

    if (!res.ok) throw new Error("Invalid credentials");

    const { token } = await res.json();

    chrome.storage.local.set(
      {
        APP_JWT_TOKEN: token,
        username: u,
        profileSynced: false, // 🔑 important
      },
      async () => {
        showNotification("Login successful", "success");

        await autoProfileSyncOnce(); // 👤 NEW
        triggerSolvedSync();         // 🔄 ORIGINAL
      }
    );
  } catch (e) {
    msg.textContent = e.message;
  }
}

/* =====================================================
   PROFILE SYNC (NEW, ADDITIVE)
===================================================== */

async function autoProfileSyncOnce() {
  const { profileSynced } = await chrome.storage.local.get("profileSynced");
  if (profileSynced) return;

  const tabs = await chrome.tabs.query({ url: "*://leetcode.com/*" });
  if (!tabs.length) return;

  try {
    const res = await sendMessageWithTimeout(
      tabs[0].id,
      { type: "SYNC_PROFILE" }
    );

    if (!res.success) throw new Error(res.error);

    await sendProfileToBackend(res.profile);

    await chrome.storage.local.set({
      profileSynced: true,
      lastProfileSync: new Date().toISOString(),
    });

    showNotification("Profile synced", "success");
  } catch (e) {
    console.warn("Profile auto-sync skipped:", e.message);
  }
}

async function manualProfileSync() {
  const tabs = await chrome.tabs.query({ url: "*://leetcode.com/*" });
  if (!tabs.length) return showNotification("Open LeetCode first", "error");

  try {
    const res = await sendMessageWithTimeout(
      tabs[0].id,
      { type: "SYNC_PROFILE" }
    );

    if (!res.success) throw new Error(res.error);

    await sendProfileToBackend(res.profile);

    await chrome.storage.local.set({
      profileSynced: true,
      lastProfileSync: new Date().toISOString(),
    });
    console.log(chrome.storage.local.get("allProblems"));
    showNotification("Profile synced manually", "success");
  } catch (e) {
    showNotification(e.message, "error");
  }
}

async function sendProfileToBackend(profile) {
  const { APP_JWT_TOKEN } = await chrome.storage.local.get("APP_JWT_TOKEN");

  console.log("➡️ Sending profile to backend:", profile);
  console.log("➡️ JWT exists:", Boolean(APP_JWT_TOKEN));

  const res = await fetchWithTimeout(
    "http://localhost:8080/api/leetcode/sync/profile",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${APP_JWT_TOKEN}`,
      },
      body: JSON.stringify({
        avatar: profile.avatar,
        realName: profile.realName,
        leetCodeUsername: profile.username,
        isSignedIn: profile.isSignedIn,
      }),
    }
  );

  console.log("⬅️ Backend response status:", res.status);

  if (!res.ok) throw new Error(await res.text());
}


/* =====================================================
   PROBLEM SYNC (ORIGINAL – PRESERVED)
===================================================== */

async function triggerSolvedSync() {
  if (isSyncing) return;
  isSyncing = true;

  app.innerHTML = `
    <div class="container">
      <h3>🔄 Syncing LeetCode</h3>
      <p>Fetching problems...</p>
    </div>
  `;

  const tabs = await chrome.tabs.query({ url: "*://leetcode.com/*" });
  if (!tabs.length) {
    isSyncing = false;
    return showNotification("Open LeetCode first", "error");
  }

  try {
    await sendMessageWithTimeout(tabs[0].id, { type: "SYNC_SOLVED" });
    showNotification("LeetCode sync complete", "success");
    renderDashboard();
  } catch (e) {
    showNotification(e.message, "error");
  } finally {
    isSyncing = false;
  }
}

/* =====================================================
   BACKEND PROBLEM SYNC (ORIGINAL)
===================================================== */

async function syncToBackend() {
  if (isSyncing) return;
  isSyncing = true;

  const { APP_JWT_TOKEN, allProblems } =
    await chrome.storage.local.get(["APP_JWT_TOKEN", "allProblems"]);
  
  try {
    const res = await fetchWithTimeout(
      "http://127.0.0.1:8080/api/leetcode/sync",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${APP_JWT_TOKEN}`,
        },
        body: JSON.stringify({ problems: allProblems }),
      }
    );

    if (!res.ok) throw new Error(await res.text());

    await chrome.storage.local.set({
      lastBackendSync: new Date().toISOString(),
    });

    showNotification("Backend sync successful", "success");
    renderDashboard();
  } catch (e) {
    console.log(e, "error");
    showNotification("Backend sync failed: " + e, "error");
  } finally {
    isSyncing = false;
  }
}

/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard() {
  chrome.storage.local.get(
    [
      "allProblems",
      "lastLeetCodeSync",
      "lastBackendSync",
      "lastProfileSync",
      "username",
    ],
    (d) => {
      const problems = d.allProblems || [];
      const solved = problems.filter(p => p.status === "SOLVED");

      app.innerHTML = `
        <div class="dashboard">
          <h3>👋 ${d.username}</h3>
          <p><strong>${solved.length}</strong> / ${problems.length} solved</p>

          <div class="btn-row">
            <button id="syncLC">🔄 Sync LeetCode</button>
            <button id="syncBE">⬆️ Sync Backend</button>
            <button id="syncProfile">👤 Sync Profile</button>
            <button id="logout">🚪 Logout</button>
          </div>

          <p>📥 LC Sync: ${formatDate(d.lastLeetCodeSync)}</p>
          <p>📤 Backend Sync: ${formatDate(d.lastBackendSync)}</p>
          <p>👤 Profile Sync: ${formatDate(d.lastProfileSync)}</p>

          <hr />

          <h4>✅ Solved Problems</h4>
          <div id="solvedList"></div>
        </div>
      `;

      syncLC.onclick = triggerSolvedSync;
      syncBE.onclick = syncToBackend;
      syncProfile.onclick = manualProfileSync;
      logout.onclick = logoutUser;

      renderSolvedProblems(solved);
    }
  );
}

function renderSolvedProblems(solved) {
  const container = document.getElementById("solvedList");

  if (!solved || !solved.length) {
    container.innerHTML = "<p>No solved problems yet</p>";
    return;
  }

  container.innerHTML = solved
    .slice(0, 100)
    .map(
      (p) => `
        <div style="margin-bottom:8px">
          <strong>${p.frontendId}. ${p.title}</strong>
          <div style="font-size:12px;color:#6b7280">
            ${p.difficulty} • ${p.topics?.join(", ") || ""}
          </div>
        </div>
      `
    )
    .join("");
}


/* =====================================================
   LOGOUT
===================================================== */

function logoutUser() {
  chrome.storage.local.clear(renderLogin);
}
