const codeEl = document.getElementById('code');
const fetchBtn = document.getElementById('fetch');
const explainBtn = document.getElementById('explain');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');

function setStatus(t) { statusEl.innerText = 'Status: ' + t; }

fetchBtn.addEventListener('click', async () => {
  setStatus('Fetching selection...');
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, { type: 'get_selection' }, (resp) => {
    const text = resp?.text || '';
    codeEl.value = text;
    setStatus(text ? 'Selection fetched' : 'No selection found on page');
  });
});

explainBtn.addEventListener('click', async () => {
  const code = codeEl.value.trim();
  if (!code) { setStatus('No code to explain'); return; }
  setStatus('Explaining...');
  resultEl.hidden = true;
  chrome.runtime.sendMessage({ type: 'explain', code }, (resp) => {
    if (!resp) {
      setStatus('No response (maybe service worker sleeping). Try again.');
      return;
    }
    setStatus(resp.ok ? 'Done' : 'Done (with fallback)');
    resultEl.hidden = false;
    resultEl.innerText = resp.explanation || 'No explanation produced.';
  });
});
