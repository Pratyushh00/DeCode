// background service worker (updated: add context menu)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'explain') {
    chrome.storage.sync.get(['openaiApiKey'], async ({ openaiApiKey }) => {
      if (!openaiApiKey) {
        console.warn('No API key found in storage.');
        sendResponse({ explanation: 'No API key set — please set it in extension options.' });
        return;
      }

      try {
        const resp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openaiApiKey
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are a helpful assistant that explains code clearly in plain language.' },
              { role: 'user', content: `Explain this code:\n\n${msg.code}` }
            ],
            temperature: 0.3
          })
        });

        if (!resp.ok) {
          const errText = await resp.text();
          console.error('OpenAI API error:', errText);
          sendResponse({ explanation: 'OpenAI API error: ' + errText });
          return;
        }

        const data = await resp.json();
        const content = data.choices?.[0]?.message?.content?.trim() || 'No explanation received.';
        sendResponse({ explanation: content });

      } catch (err) {
        console.error('Fetch failed:', err);
        sendResponse({ explanation: 'Error contacting OpenAI: ' + err.message });
      }
    });

    return true; // <-- This keeps sendResponse alive for async
  }
});


async function callOpenAI(apiKey, prompt) {
  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 600
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + apiKey
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error("OpenAI error: " + res.status + " " + txt);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

function heuristicExplain(code) {
  const lines = code.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const total = lines.length;
  const tokens = code.split(/\s+/).slice(0, 200);
  const hasImport = /\b(import|require|using|include)\b/i.test(code);
  const hasFunc = /\b(function|def|fn|=>|\bclass\b)\b/i.test(code) || /\w+\s*\([^)]*\)\s*\{/m.test(code);
  const hasLoop = /\b(for|while|foreach)\b/i.test(code);
  const hasIf = /\b(if|else|elif|elseif|switch|case)\b/i.test(code);
  const hasComment = /(^\/\/|^#|\/\*|\*\/)/m.test(code);
  const langGuess = guessLanguage(code);
  let explanation = [];
  explanation.push(`**Quick analysis**: ~${total} non-empty line(s). Guessed style: ${langGuess || 'unknown'}.`);
  if (hasImport) explanation.push("The snippet includes module/import statements — it likely depends on external libraries or modules.");
  if (hasFunc) explanation.push("Contains functions or classes — there are reusable parts or definitions.");
  if (hasLoop) explanation.push("Includes looping constructs — iterates over data or repeats operations.");
  if (hasIf) explanation.push("Conditional logic present — different execution paths based on conditions.");
  if (hasComment) explanation.push("Has comments — the author documented intent.");
  explanation.push("\n**Top tokens / identifiers (first 20):** " + tokens.join(' ').slice(0, 200));
  explanation.push("\n**Possible intent / behavior**:");
  if (/\breturn\b/i.test(code)) explanation.push("- Likely returns a value or result to the caller.");
  if (/\bconsole\.log\b|\bprint\b|\bprintln\b/i.test(code)) explanation.push("- Produces console or log output for debugging or user info.");
  if (/\bfetch\b|\baxios\b|\bhttp\b|\brequest\b/i.test(code)) explanation.push("- Performs network requests (HTTP).");
  if (/\bmap\b|\bfilter\b|\breduce\b/i.test(code)) explanation.push("- Uses functional transforms on collections (map/filter/reduce).");
  explanation.push("\n**Suggested explanation (plain)**:");
  const plain = [];
  plain.push("This code appears to perform a set of operations with the following structure: ");
  if (hasImport) plain.push("1) It imports or includes dependencies.");
  if (hasFunc) plain.push("2) It defines one or more functions/classes to encapsulate behavior.");
  if (hasLoop) plain.push("3) It loops over data to process items.");
  if (hasIf) plain.push("4) It branches logic based on conditions.");
  if (!hasFunc && !hasLoop && !hasIf) plain.push("1) It likely performs a short, linear sequence of operations.");
  plain.push("Finally, it may produce output or return results.");
  explanation.push(plain.join(' '));
  return explanation.join('\n');
}

function guessLanguage(code) {
  const samples = {
    "python": [/^\s*def\s+\w+\(/m, /^\s*import\s+\w+/m, /:\s*$/m],
    "javascript": [/\bconsole\.log\b/, /=>/, /\bfunction\b/, /\bconst\b|\blet\b|\bvar\b/],
    "java": [/\bpublic\b|\bstatic\b/, /System\.out\.println/],
    "c/cpp": [/#include\s*<.*>/, /\bprintf\b/, /cout\s*<</],
    "ruby": [/\bdef\b/, /end\b/],
    "go": [/\bfunc\b/, /package\s+main/]
  };
  for (const [k, regs] of Object.entries(samples)) {
    if (regs.some(r => r.test(code))) return k;
  }
  return "";
}

// context menu click handler: explain the selected text and send to content script
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== 'decode_explain') return;
  const code = info.selectionText || '';
  chrome.storage.sync.get(['openai_key'], async (res) => {
    const key = res.openai_key;
    let explanation = '';
    if (key && key.length > 10) {
      try {
        const prompt = `Explain the following code snippet in plain, non-technical language and then provide a short technical summary. Do not assume the language; treat it as language-agnostic.\n\nCode:\n"""\n${code}\n"""`;
        explanation = await callOpenAI(key, prompt);
      } catch (e) {
        console.error('OpenAI call failed for context menu, falling back to heuristic', e);
        explanation = heuristicExplain(code);
      }
    } else {
      explanation = heuristicExplain(code);
    }
    try {
      chrome.tabs.sendMessage(tab.id, { type: 'show_explanation', explanation });
    } catch (e) {
      console.error('Could not send message to tab', e);
    }
  });
});

// existing runtime message handling (for popup/content script requests)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'explain') {
    const code = msg.code || '';
    chrome.storage.sync.get(['openai_key'], async (res) => {
      const key = res.openai_key;
      if (key && key.length > 10) {
        try {
          const prompt = `Explain the following code snippet in plain, non-technical language and then provide a short technical summary. Do not assume the language; treat it as language-agnostic.\n\nCode:\n"""\n${code}\n"""`;
          const explanation = await callOpenAI(key, prompt);
          sendResponse({ ok: true, explanation });
        } catch (e) {
          console.error(e);
          const explanation = heuristicExplain(code);
          sendResponse({ ok: false, explanation, error: e.message });
        }
      } else {
        const explanation = heuristicExplain(code);
        sendResponse({ ok: true, explanation });
      }
    });
    return true; // signal async response
  }
});
