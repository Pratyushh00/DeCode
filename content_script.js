(function () {
  let btn = null;
  function removeBtn() { if (btn) { try { btn.remove(); } catch (e) { } btn = null; } }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function createBtn(rect, selectedText) {
    removeBtn();
    btn = document.createElement('button');
    btn.textContent = 'Explain ▶';
    Object.assign(btn.style, {
      position: 'absolute',
      zIndex: 2147483647,
      padding: '6px 10px',
      borderRadius: '8px',
      border: 'none',
      boxShadow: '0 6px 22px rgba(0,0,0,0.14)',
      background: 'linear-gradient(135deg,#6b5bff,#4dd0e1)',
      color: '#fff',
      fontSize: '12px',
      cursor: 'pointer',
      transform: 'translateY(0)',
      opacity: '0.98'
    });
    document.body.appendChild(btn);

    // position after adding to DOM
    const bw = btn.offsetWidth || 80;
    const bh = btn.offsetHeight || 28;
    let top = window.scrollY + rect.top - bh - 8;
    if (top < window.scrollY + 6) top = window.scrollY + rect.bottom + 8;
    let left = window.scrollX + rect.left;
    left = clamp(left, window.scrollX + 6, window.scrollX + window.innerWidth - bw - 8);
    btn.style.top = top + 'px';
    btn.style.left = left + 'px';

    // click -> request explanation from background
    const onClick = (e) => {
      e.stopPropagation();
      const selected = window.getSelection().toString();
      btn.textContent = 'Explaining...';
      chrome.runtime.sendMessage({ type: 'explain', code: selected }, (resp) => {
        try { removeBtn(); } catch (e) { }
        if (resp && resp.explanation) {
          showOverlay(resp.explanation);
        } else {
          showOverlay('No explanation returned.');
        }
      });
    };

    btn.addEventListener('click', onClick);

    // remove on scroll/resize or click outside
    const cancel = () => removeBtn();
    setTimeout(() => {
      window.addEventListener('scroll', cancel, { once: true });
      window.addEventListener('resize', cancel, { once: true });
      document.addEventListener('mousedown', function docClick(ev) {
        if (btn && !btn.contains(ev.target)) { removeBtn(); document.removeEventListener('mousedown', docClick); }
      });
    }, 0);
  }

  function showOverlay(text) {
    // remove existing
    const prev = document.getElementById('decode_overlay');
    if (prev) prev.remove();

    const overlay = document.createElement('div');
    overlay.id = 'decode_overlay';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: 2147483647, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(2,6,23,0.65)'
    });

    const modal = document.createElement('div');
    Object.assign(modal.style, {
      maxWidth: '900px', width: 'min(96%,900px)', maxHeight: '82vh', overflow: 'auto', background: '#001220', color: '#e6eef6',
      padding: '18px', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.6)', fontFamily: 'Inter, system-ui, monospace', fontSize: '13px', position: 'relative'
    });

    const close = document.createElement('button');
    close.textContent = 'Close';
    Object.assign(close.style, { position: 'absolute', right: '12px', top: '12px', background: 'transparent', border: 'none', color: '#9fb2c9', cursor: 'pointer' });
    close.addEventListener('click', () => overlay.remove());

    const pre = document.createElement('pre');
    pre.textContent = text;
    Object.assign(pre.style, { whiteSpace: 'pre-wrap', marginTop: '8px', lineHeight: '1.45' });

    modal.appendChild(close);
    modal.appendChild(pre);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // allow closing with ESC
    function onKey(e) {
      if (e.key === 'Escape') overlay.remove();
    }
    window.addEventListener('keydown', onKey, { once: true });
  }

  document.addEventListener('mouseup', () => {
    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) { removeBtn(); return; }
      const text = sel.toString().trim();
      if (!text) { removeBtn(); return; }
      try {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (!rect || (rect.width === 0 && rect.height === 0)) { removeBtn(); return; }
        createBtn(rect, text);
      } catch (e) {
        removeBtn();
        console.warn('DeCode selection error', e);
      }
    }, 10);
  });

  // listen for explanation from background (context-menu flow)
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'show_explanation') {
      showOverlay(msg.explanation || 'No explanation available.');
    }
    if (msg && msg.type === 'get_selection') {
      const sel = window.getSelection();
      sendResponse({ text: sel ? sel.toString() : '' });
    }
  });
})();
