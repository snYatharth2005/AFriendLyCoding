if (typeof window.__afcInjected === 'undefined') {
window.__afcInjected = true;
console.log('[AFC] content.js injected.');

let isSyncRunning = false;

function getCookie(name) {
  return document.cookie.split('; ').find(r => r.startsWith(name + '='))?.split('=')[1];
}

/* ─── PROFILE ─────────────────────────────────────────────────── */
async function fetchUserProfile() {
  const csrf = getCookie('csrftoken');
  const res = await fetch('https://leetcode.com/graphql/', {
    method: 'POST', credentials: 'include',
    headers: { 'Content-Type': 'application/json', 'x-csrftoken': csrf, 'Referer': 'https://leetcode.com/' },
    body: JSON.stringify({ query: `query { userStatus { username realName avatar isSignedIn } }` })
  });
  const json = await res.json();
  if (!json?.data?.userStatus) throw new Error('Not logged into LeetCode?');
  console.log('[AFC] Profile OK:', json.data.userStatus.username);
  return json.data.userStatus;
}

/* ─── SOLVED PROBLEMS ─────────────────────────────────────────── */
async function fetchSolvedProblems(onProgress) {
  const csrf = getCookie('csrftoken');
  if (!csrf) throw new Error('Not logged into LeetCode — no csrftoken found.');

  const QUERY = `
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
    }`;

  const solved = [];
  const pageSize = 500;
  let skip = 0;
  let hasMore = true;

  console.log('[AFC] Starting fetch...');

  while (hasMore) {
    console.log(`[AFC] Fetching skip=${skip} | solved so far: ${solved.length}`);
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', 'x-csrftoken': csrf, 'Referer': 'https://leetcode.com/problemset/' },
      body: JSON.stringify({ query: QUERY, variables: { limit: pageSize, skip, filters: { filterCombineType: 'ALL' } } })
    });

    console.log('[AFC] HTTP status:', res.status);
    if (!res.ok) {
      const txt = await res.text();
      console.error('[AFC] Error body:', txt.substring(0, 300));
      throw new Error(`LeetCode API ${res.status}: ${txt.substring(0, 100)}`);
    }

    const json = await res.json();
    const page = json?.data?.problemsetQuestionListV2;
    if (!page) {
      console.error('[AFC] Unexpected response:', JSON.stringify(json).substring(0, 400));
      throw new Error('Unexpected response from LeetCode. See console.');
    }

    hasMore = page.hasMore;
    console.log(`[AFC] Got ${page.questions.length} | hasMore=${hasMore}`);

    for (const q of page.questions) {
      if (q.status === 'SOLVED') {
        solved.push({
          frontendId: parseInt(q.questionFrontendId, 10),
          title:      q.title,
          slug:       q.titleSlug,
          difficulty: q.difficulty,
          status:     'SOLVED',
          topics:     q.topicTags.map(t => t.name).join(',')
        });
      }
    }

    skip += page.questions.length;
    onProgress(solved.length, skip);
    if (hasMore) await new Promise(r => setTimeout(r, 150));
  }

  console.log(`[AFC] Done. ${solved.length} solved.`);
  await chrome.storage.local.set({ allProblems: solved, lastLeetCodeSync: new Date().toISOString() });
  return { problems: solved, total: solved.length };
}

/* ─── Message listener ────────────────────────────────────────── */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[AFC] Message:', request.type);

  /* SYNC_PROFILE */
  if (request.type === 'SYNC_PROFILE') {
    sendResponse({ ack: true });
    chrome.storage.local.set({ syncProfileStatus: { done: false } });
    fetchUserProfile()
      .then(profile => chrome.storage.local.set({ leetcodeProfile: profile, syncProfileStatus: { done: true, success: true, profile } }))
      .catch(err => {
        console.error('[AFC] Profile error:', err.message);
        chrome.storage.local.set({ syncProfileStatus: { done: true, success: false, error: err.message } });
      });
    return false;
  }

  /* SYNC_SOLVED */
  if (request.type === 'SYNC_SOLVED') {
    if (isSyncRunning) { sendResponse({ ack: true, alreadyRunning: true }); return false; }
    isSyncRunning = true;
    sendResponse({ ack: true });
    chrome.storage.local.set({ syncSolvedStatus: { done: false, fetched: 0, total: 0 } });

    fetchSolvedProblems((fetched, scanned) => {
      console.log(`[AFC] Progress: ${fetched} solved / ${scanned} scanned`);
      chrome.storage.local.set({ syncSolvedStatus: { done: false, fetched, total: scanned } });
    })
      .then(({ total }) => {
        chrome.storage.local.set({ syncSolvedStatus: { done: true, success: true, total, solved: total } });
      })
      .catch(err => {
        console.error('[AFC] Error:', err.message);
        chrome.storage.local.set({ syncSolvedStatus: { done: true, success: false, error: err.message } });
      })
      .finally(() => { isSyncRunning = false; });
    return false;
  }

  sendResponse({ ack: false });
  return false;
});

} // end injection guard
