# DeCode — Chrome extension (v1.0)

DeCode lets you select any code snippet on a webpage and instantly get a language-agnostic explanation.

Features:
- Select code and click the floating **Explain ▶** button, or open the extension popup and press *Fetch selection*.
- Optional: paste your OpenAI API key in Settings to get richer LLM-generated explanations.
- If no API key is provided, DeCode uses a local heuristic fallback to produce a helpful explanation.

Files:
- `manifest.json` — extension manifest (v3)
- `content_script.js` — injects selection helper and supplies selection to popup
- `background.js` — service worker that calls OpenAI (if key present) or local heuristic
- `popup.*` — UI for quick interactions
- `options.html` — settings to store your API key

Installation (developer mode):
1. Download and unzip the `DeCode` folder.
2. Open `chrome://extensions`, enable *Developer mode*.
3. Click *Load unpacked* and select the `DeCode` folder.
4. (Optional) Open DeCode → Settings and paste your OpenAI API key.

Security notes:
- If you provide an API key it is saved in `chrome.storage.sync` — Chrome encrypts synced data per browser profile. You can remove it anytime from Options.
- The extension requests wide host permissions to let content scripts run on all pages; this is required to read page selection. Use responsibly.

Enjoy! — DeCode team
