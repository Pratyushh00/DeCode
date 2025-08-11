# 🎯 DeCode — Highlight. Click. Understand.  
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-F4B400?logo=google-chrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)  
[![LLM Powered](https://img.shields.io/badge/Powered%20by-LLMs-8A2BE2)](https://openai.com/)  

> *Ever stared at a chunk of code like it’s an ancient scroll written in Elvish?*  
> DeCode swoops in to explain it, whether it’s Python, JavaScript, or that mysterious snippet you found on Stack Overflow in 2009.  

---

🎥 Demo Video



---

## ✨ Features  

- 🖱 **Click or Context Menu Magic**  
  - Select code → click the floating **Explain ▶** button.  
  - Or right-click → **Explain selection** from the context menu.  

- 🔑 **Plug in Your API of Choice**  
  - Works with **OpenAI** or **Hugging Face** APIs.  
  - No key? No problem — uses a **local heuristic fallback** for explanations.   

- 🧠 **Language-Agnostic**  
  - Not just for JavaScript — it’ll try to explain *anything* code-like.  

- 📦 **Self-contained**  
  - No server needed — runs entirely in your browser.  

---

## ⚙️ How It Works  

1. **Content Script**  
   - Injects the floating button near your selected code.  
   - Sends selected text to the background service.  

2. **Background Service Worker**  
   - Calls OpenAI or Hugging Face API if an API key is present.  
   - Falls back to heuristic analysis if no key is provided.  

3. **Popup & Options Pages**  
   - **Popup**: Quick access to explain the current selection.  
   - **Options**: Store API keys securely using `chrome.storage.sync`.  

---

## 📚 My Learnings  

- How to **integrate LLM APIs** directly into Chrome extensions.  
- Working with **Manifest V3 service workers** and content scripts.  
- Building **CSP-compliant UIs** (no inline scripts).  
- Using **shadcn/ui** with TailwindCSS for beautiful extension UIs.  
- Managing **cross-script communication** between content, popup, and background.  

---

## 🛤 Future Roadmap  

- 💡 Add **syntax highlighting** to the explanation modal.  
- 🌐 Support **offline ML models** for privacy-friendly explanations.  
- 🔄 Add a **"Re-explain"** button for alternative interpretations.  
- 📖 Add **multi-language translation** of code explanations.  

---

## 🚀 Setup & Installation  

1. **Clone or download** the repository.  
2. Open Chrome and go to: chrome://extensions
3. Enable Developer mode (toggle in the top right).
4. Click Load unpacked → select the cloned folder.
5. (Optional) Open DeCode → Settings and paste your API key.

---

## 🔐 Security Notes

1. API keys are saved in chrome.storage.sync — encrypted and synced per profile.
2. You can delete your keys anytime from the Options page.
3. Wide host permissions are required so content scripts can detect selections anywhere — please use responsibly.

---

Enjoy coding without the headaches — DeCode’s got your back! 🧑‍💻💬
