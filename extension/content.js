console.log("📦 content.js ACTIVE");

/* =====================================================
   GLOBAL SYNC LOCK
===================================================== */

let isSyncRunning = false;

/* =====================================================
   COOKIE + LOGIN HELPERS
===================================================== */

function getCookie(name) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
}

function isLoggedInToLeetCode() {
  return Boolean(getCookie("csrftoken"));
}

/* =====================================================
   PROFILE FETCH
===================================================== */

async function fetchUserProfile() {
  const csrfToken = getCookie("csrftoken");

  const query = `
    query {
      userStatus {
        username
        realName
        avatar
        isSignedIn
      }
    }
  `;

  const res = await fetch("https://leetcode.com/graphql/", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "x-csrftoken": csrfToken,
      Referer: "https://leetcode.com/",
    },
    body: JSON.stringify({ query }),
  });

  const json = await res.json();
  if (!json?.data?.userStatus) {
    throw new Error("Profile fetch failed");
  }

  return json.data.userStatus;
}

/* =====================================================
   SOLVED PROBLEM FETCH (EXACTLY YOUR OLD LOGIC)
===================================================== */

async function fetchAllProblems() {
  if (!isLoggedInToLeetCode()) {
    throw new Error("Not logged into LeetCode");
  }

  const problems = [];
  const limit = 4000;
  let skip = 0;
  let hasMore = true;

  const csrfToken = getCookie("csrftoken");

  const query = `
    query problemsetQuestionListV2(
      $filters: QuestionFilterInput
      $limit: Int
      $skip: Int
    ) {
      problemsetQuestionListV2(
        filters: $filters
        limit: $limit
        skip: $skip
      ) {
        questions {
          questionFrontendId
          title
          titleSlug
          difficulty
          status
          topicTags { name }
        }
        hasMore
      }
    }
  `;

  while (hasMore) {
    const res = await fetch("https://leetcode.com/graphql/", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": csrfToken,
        Referer: "https://leetcode.com/problemset/",
      },
      body: JSON.stringify({
        query,
        variables: {
          skip,
          limit,
          filters: { filterCombineType: "ALL" },
        },
      }),
    });

    const json = await res.json();
    const data = json?.data?.problemsetQuestionListV2;
    if (!data) throw new Error("Failed to fetch problems");

    for (const q of data.questions) {
      problems.push({
        frontendId: q.questionFrontendId,
        title: q.title,
        slug: q.titleSlug,
        difficulty: q.difficulty,
        status: q.status || "NOT_STARTED",
        topics: q.topicTags.map((t) => t.name),
      });
    }

    skip += data.questions.length;
    hasMore = data.hasMore;

    if (hasMore) await new Promise((r) => setTimeout(r, 120));
  }

  await chrome.storage.local.set({
    allProblems: problems,
    lastLeetCodeSync: new Date().toISOString(),
  });
  
  return problems;
}

async function runProblemSync() {
  const problems = await fetchAllProblems();
  const solved = problems.filter(p => p.status === "SOLVED").length;

  await chrome.storage.local.set({ lastSolvedCount: solved });

  return { total: problems.length, solved };
}

/* =====================================================
   SINGLE MESSAGE LISTENER (IMPORTANT)
===================================================== */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("📨 Received:", request.type);

  /* ---------- PROFILE SYNC ---------- */
  if (request.type === "SYNC_PROFILE") {
    fetchUserProfile()
      .then(async (profile) => {
        await chrome.storage.local.set({
          leetcodeProfile: profile,
          lastProfileSync: new Date().toISOString(),
        });
        sendResponse({ success: true, profile });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }

  /* ---------- SOLVED PROBLEM SYNC ---------- */
  if (request.type === "SYNC_SOLVED") {
    if (isSyncRunning) {
      sendResponse({ success: false, error: "Sync already running" });
      return false;
    }

    isSyncRunning = true;

    runProblemSync()
      .then(({ total, solved }) => {
        sendResponse({ success: true, total, solved });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      })
      .finally(() => {
        isSyncRunning = false;
      });

    return true;
  }

  /* ---------- UNKNOWN ---------- */
  sendResponse({ success: false, error: "Unknown message type" });
  return false;
});
