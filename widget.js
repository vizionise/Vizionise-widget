(function () {
  'use strict';
  console.log('[VAI] Script parsed and IIFE running');

  // ─── Config ──────────────────────────────────────────────────────────────────
  var API_URL = 'https://vizionise-ai-backend-production.up.railway.app/chat';

  var SUGGESTED_PROMPTS = [
    'What services does Vizionise offer?',
    'Do I need a new website?',
    'What AI automations can help my business?',
  ];

  // ─── Asset URL helper ─────────────────────────────────────────────────────────
  function getScriptBase() {
    var scripts = document.querySelectorAll('script[src]');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
        return scripts[i].src.replace('widget.js', '');
      }
    }
    if (document.currentScript && document.currentScript.src) {
      return document.currentScript.src.replace('widget.js', '');
    }
    return '';
  }

  // ─── Inline CSS injection ─────────────────────────────────────────────────────
  // All styles are injected via a <style> tag so no external CSS file is needed.
  function injectCSS() {
    var style = document.createElement('style');
    style.textContent = [
      /* Theme reset */
      '.vai-launcher,.vai-prompt-chip,.vai-send-btn,.vai-close-btn{all:unset!important;box-sizing:border-box!important;cursor:pointer!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;line-height:1!important;-webkit-appearance:none!important;appearance:none!important}',

      /* Launcher */
      '.vai-launcher{position:fixed!important;bottom:24px!important;right:24px!important;pointer-events:auto!important;width:58px!important;height:58px!important;border-radius:50%!important;background:linear-gradient(135deg,#00ff85,#00cc66)!important;border:none!important;box-shadow:0 0 25px rgba(0,255,133,.55),0 4px 16px rgba(0,0,0,.5)!important;display:flex!important;align-items:center!important;justify-content:center!important;z-index:99998!important;transition:transform .2s ease,box-shadow .2s ease!important;padding:0!important;margin:0!important}',
      '.vai-launcher:hover{transform:scale(1.08)!important;box-shadow:0 0 36px rgba(0,255,133,.75),0 6px 24px rgba(0,0,0,.5)!important}',
      '.vai-launcher:active{transform:scale(.95)!important}',
      '.vai-launcher-icon{display:flex!important;align-items:center!important;justify-content:center!important;transition:opacity .15s,transform .15s!important}',
      '.vai-launcher-icon.vai-hidden{opacity:0!important;transform:scale(.5)!important;position:absolute!important;pointer-events:none!important}',

      /* Panel */
      '.vai-panel{position:fixed!important;bottom:96px!important;right:24px!important;pointer-events:auto!important;width:360px!important;height:520px!important;background:#0b0b0b!important;border-radius:16px!important;border:1px solid #1a1a1a!important;box-shadow:0 8px 40px rgba(0,0,0,.8),0 0 0 1px rgba(0,255,133,.06)!important;display:flex!important;flex-direction:column!important;overflow:hidden!important;z-index:99997!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;transform:translateY(14px) scale(.97)!important;opacity:0!important;pointer-events:none!important;transition:transform .22s cubic-bezier(.34,1.56,.64,1),opacity .18s ease!important;color:#fff!important}',
      '.vai-panel.vai-open{transform:translateY(0) scale(1)!important;opacity:1!important;pointer-events:all!important}',

      /* Header */
      '.vai-header{background:#000!important;padding:14px 16px!important;display:flex!important;align-items:center!important;gap:10px!important;border-bottom:1px solid #1a1a1a!important;flex-shrink:0!important}',
      '.vai-header-avatar{width:38px!important;height:38px!important;border-radius:50%!important;background:#00ff85!important;border:1px solid #00ff85!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;overflow:hidden!important}',
      '.vai-header-avatar img{width:100%!important;height:100%!important;object-fit:contain!important;border-radius:50%!important;display:block!important}',
      '.vai-header-info{flex:1!important}',
      '.vai-header-title{color:#fff!important;font-size:14px!important;font-weight:600!important;line-height:1.2!important;margin:0!important}',
      '.vai-header-status{color:#00ff85!important;font-size:11px!important;display:flex!important;align-items:center!important;gap:4px!important;margin:2px 0 0!important}',
      '.vai-status-dot{width:6px!important;height:6px!important;border-radius:50%!important;background:#00ff85!important;animation:vai-pulse 2s infinite!important}',
      '@keyframes vai-pulse{0%,100%{opacity:1}50%{opacity:.35}}',
      '.vai-close-btn{background:transparent!important;border:none!important;color:#555!important;padding:4px!important;border-radius:6px!important;display:flex!important;align-items:center!important;justify-content:center!important;transition:color .15s,background .15s!important}',
      '.vai-close-btn:hover{color:#fff!important;background:rgba(255,255,255,.06)!important}',

      /* Messages */
      '.vai-messages{flex:1!important;overflow-y:auto!important;padding:16px!important;display:flex!important;flex-direction:column!important;gap:12px!important;scroll-behavior:smooth!important}',
      '.vai-messages::-webkit-scrollbar{width:4px}',
      '.vai-messages::-webkit-scrollbar-track{background:transparent}',
      '.vai-messages::-webkit-scrollbar-thumb{background:rgba(0,255,133,.2);border-radius:4px}',

      /* Prompts */
      '.vai-prompts{display:flex!important;flex-direction:column!important;gap:8px!important;margin-bottom:4px!important}',
      '.vai-prompts-label{color:#555!important;font-size:10.5px!important;text-transform:uppercase!important;letter-spacing:.1em!important;margin-bottom:2px!important}',
      '.vai-prompt-chip{background:#111!important;border:1px solid #1a1a1a!important;color:#ccc!important;border-radius:20px!important;padding:9px 15px!important;font-size:12.5px!important;text-align:left!important;transition:background .15s,border-color .15s,color .15s!important;display:block!important;width:100%!important;text-transform:none!important;font-weight:normal!important;letter-spacing:normal!important}',
      '.vai-prompt-chip:hover{background:rgba(0,255,133,.08)!important;border-color:rgba(0,255,133,.4)!important;color:#fff!important}',

      /* Bubbles */
      '.vai-message{display:flex!important;gap:8px!important;max-width:100%!important}',
      '.vai-message.vai-user{flex-direction:row-reverse!important}',
      '.vai-bubble{padding:10px 14px!important;border-radius:14px!important;font-size:13.5px!important;line-height:1.6!important;max-width:82%!important;word-break:break-word!important}',
      '.vai-message.vai-ai .vai-bubble{background:#111!important;color:#fff!important;border-bottom-left-radius:4px!important;border:1px solid #1a1a1a!important}',
      '.vai-message.vai-user .vai-bubble{background:linear-gradient(135deg,#00ff85,#00cc66)!important;color:#000!important;font-weight:500!important;border-bottom-right-radius:4px!important}',

      /* Error bubble */
      '.vai-bubble-error{background:#0f0f0f!important;border:1px solid #2a1a1a!important;color:#ff6b6b!important;line-height:1.65!important}',
      '.vai-error-icon{margin-right:5px!important}',
      '.vai-error-phone{display:inline-block!important;margin-top:8px!important;color:#000!important;background:linear-gradient(135deg,#00ff85,#00cc66)!important;padding:6px 16px!important;border-radius:20px!important;font-weight:700!important;font-size:13px!important;text-decoration:none!important;letter-spacing:.02em!important}',
      '.vai-error-phone:hover{opacity:.88!important}',

      /* Typing */
      '.vai-typing{display:flex!important;align-items:center!important;gap:5px!important;padding:12px 14px!important;background:#111!important;border:1px solid #1a1a1a!important;border-radius:14px!important;border-bottom-left-radius:4px!important;width:fit-content!important}',
      '.vai-typing span{width:7px!important;height:7px!important;border-radius:50%!important;background:#444!important;display:block!important;animation:vai-bounce 1.2s infinite!important}',
      '.vai-typing span:nth-child(2){animation-delay:.2s!important}',
      '.vai-typing span:nth-child(3){animation-delay:.4s!important}',
      '@keyframes vai-bounce{0%,60%,100%{transform:translateY(0);opacity:.4}30%{transform:translateY(-6px);opacity:1;background:#00ff85}}',

      /* Input row */
      '.vai-input-row{padding:12px!important;border-top:1px solid #1a1a1a!important;display:flex!important;gap:8px!important;align-items:flex-end!important;background:#000!important;flex-shrink:0!important}',
      '.vai-input{flex:1!important;background:#0b0b0b!important;border:1px solid #1a1a1a!important;border-radius:10px!important;color:#fff!important;font-size:13.5px!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;padding:9px 12px!important;outline:none!important;resize:none!important;min-height:38px!important;max-height:100px!important;line-height:1.4!important;transition:border-color .2s,box-shadow .2s!important;box-sizing:border-box!important;-webkit-appearance:none!important;appearance:none!important}',
      '.vai-input::placeholder{color:#444!important}',
      '.vai-input:focus{border-color:#00ff85!important;box-shadow:0 0 0 2px rgba(0,255,133,.12)!important;outline:none!important}',
      '.vai-send-btn{width:38px!important;height:38px!important;background:linear-gradient(135deg,#00ff85,#00cc66)!important;border:none!important;border-radius:10px!important;display:flex!important;align-items:center!important;justify-content:center!important;flex-shrink:0!important;transition:transform .15s ease,box-shadow .15s ease!important;padding:0!important;margin:0!important}',
      '.vai-send-btn:hover{transform:scale(1.06)!important;box-shadow:0 0 14px rgba(0,255,133,.5)!important}',
      '.vai-send-btn:active{transform:scale(.93)!important}',
      '.vai-send-btn svg{width:18px!important;height:18px!important;fill:#000!important}',
      '.vai-send-btn:disabled{opacity:.35!important;cursor:not-allowed!important}',

      /* Mobile */
      '@media(max-width:480px){.vai-panel{width:calc(100vw - 16px)!important;right:8px!important;left:8px!important;bottom:80px!important;height:calc(100dvh - 110px)!important;max-height:520px!important}.vai-launcher{right:16px!important;bottom:16px!important}.vai-bubble{font-size:13px!important}}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // ─── HTML template ────────────────────────────────────────────────────────────
  function buildHTML(logoUrl) {
    var launcher = document.createElement('button');
    launcher.className = 'vai-launcher';
    launcher.setAttribute('aria-label', 'Open AI assistant');
    launcher.setAttribute('title', 'Chat with Vizionise AI');
    launcher.innerHTML =
      '<span class="vai-launcher-icon vai-icon-chat">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="#000"/>' +
        '</svg>' +
      '</span>' +
      '<span class="vai-launcher-icon vai-icon-close vai-hidden">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M18 6L6 18M6 6L18 18" stroke="#000" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>' +
      '</span>';

    var promptsHTML =
      '<div class="vai-prompts">' +
        '<div class="vai-prompts-label">Suggested questions</div>';
    SUGGESTED_PROMPTS.forEach(function (p) {
      promptsHTML +=
        '<button class="vai-prompt-chip" data-prompt="' + escapeAttr(p) + '">' +
          escapeHTML(p) +
        '</button>';
    });
    promptsHTML += '</div>';

    var panel = document.createElement('div');
    panel.className = 'vai-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Vizionise AI Assistant');
    panel.innerHTML =
      '<div class="vai-header">' +
        '<div class="vai-header-avatar">' +
          (logoUrl ? '<img src="' + logoUrl + '" alt="Vizionise"/>' : '') +
        '</div>' +
        '<div class="vai-header-info">' +
          '<p class="vai-header-title">Vizionise AI Assistant</p>' +
          '<div class="vai-header-status"><span class="vai-status-dot"></span>Online</div>' +
        '</div>' +
        '<button class="vai-close-btn" aria-label="Close chat">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>' +
          '</svg>' +
        '</button>' +
      '</div>' +
      '<div class="vai-messages" id="vai-messages">' +
        '<div class="vai-message vai-ai">' +
          '<div class="vai-bubble">Hi! I\'m the Vizionise AI assistant. How can I help you today?</div>' +
        '</div>' +
        promptsHTML +
      '</div>' +
      '<div class="vai-input-row">' +
        '<textarea class="vai-input" id="vai-input" rows="1" placeholder="Type a message..." aria-label="Message input"></textarea>' +
        '<button class="vai-send-btn" id="vai-send-btn" aria-label="Send message">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>' +
          '</svg>' +
        '</button>' +
      '</div>';

    return { launcher: launcher, panel: panel };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;');
  }

  // ─── Widget controller ────────────────────────────────────────────────────────
  function init() {
    console.log('[VAI] init() called, document.body:', document.body);
    try {
      injectCSS();
      console.log('[VAI] CSS injected');
    } catch(e) { console.error('[VAI] injectCSS failed:', e); }

    // Prevent horizontal scrollbar without affecting vertical scroll or animations
    var noHScroll = document.createElement('style');
    noHScroll.textContent = 'html,body{overflow-x:hidden!important;max-width:100%!important}';
    document.head.appendChild(noHScroll);

    var logoUrl = getScriptBase() + 'logo.png';
    console.log('[VAI] logoUrl:', logoUrl);
    var els;
    try {
      els = buildHTML(logoUrl);
      console.log('[VAI] HTML built');
    } catch(e) { console.error('[VAI] buildHTML failed:', e); return; }
    var launcher = els.launcher;
    var panel = els.panel;

    var root = document.createElement('div');
    root.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99997;pointer-events:none;';
    root.appendChild(panel);
    root.appendChild(launcher);
    try {
      document.body.appendChild(root);
      console.log('[VAI] Root appended to body. Launcher in DOM:', !!document.querySelector(".vai-launcher"));
    } catch(e) { console.error('[VAI] appendChild failed:', e); }

    var messagesEl = panel.querySelector('#vai-messages');
    var inputEl = panel.querySelector('#vai-input');
    var sendBtn = panel.querySelector('#vai-send-btn');
    var closeBtn = panel.querySelector('.vai-close-btn');
    var iconChat = launcher.querySelector('.vai-icon-chat');
    var iconClose = launcher.querySelector('.vai-icon-close');

    var isOpen = false;
    var isLoading = false;

    function openPanel() {
      isOpen = true;
      panel.classList.add('vai-open');
      iconChat.classList.add('vai-hidden');
      iconClose.classList.remove('vai-hidden');
      launcher.setAttribute('aria-label', 'Close AI assistant');
      inputEl.focus();
    }

    function closePanel() {
      isOpen = false;
      panel.classList.remove('vai-open');
      iconChat.classList.remove('vai-hidden');
      iconClose.classList.add('vai-hidden');
      launcher.setAttribute('aria-label', 'Open AI assistant');
    }

    function togglePanel() {
      if (isOpen) closePanel(); else openPanel();
    }

    function scrollToBottom() {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function appendMessage(role, text) {
      var prompts = messagesEl.querySelector('.vai-prompts');
      if (prompts && role === 'user') prompts.parentNode.removeChild(prompts);

      var wrapper = document.createElement('div');
      wrapper.className = 'vai-message vai-' + role;

      var bubble = document.createElement('div');
      bubble.className = 'vai-bubble';
      bubble.textContent = text;

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
      scrollToBottom();
      return wrapper;
    }

    function appendError() {
      var prompts = messagesEl.querySelector('.vai-prompts');
      if (prompts) prompts.parentNode.removeChild(prompts);

      var wrapper = document.createElement('div');
      wrapper.className = 'vai-message vai-ai';

      var bubble = document.createElement('div');
      bubble.className = 'vai-bubble vai-bubble-error';
      bubble.innerHTML =
        '<span class="vai-error-icon">&#9888;</span>' +
        '<strong>Vizionise servers are acting up.</strong><br>' +
        'For any questions please call us directly:<br>' +
        '<a class="vai-error-phone" href="tel:+18287853299">828-785-3299</a>';

      wrapper.appendChild(bubble);
      messagesEl.appendChild(wrapper);
      scrollToBottom();
    }

    function showTyping() {
      var wrapper = document.createElement('div');
      wrapper.className = 'vai-message vai-ai';
      wrapper.id = 'vai-typing';
      wrapper.innerHTML =
        '<div class="vai-typing">' +
          '<span></span><span></span><span></span>' +
        '</div>';
      messagesEl.appendChild(wrapper);
      scrollToBottom();
    }

    function hideTyping() {
      var el = messagesEl.querySelector('#vai-typing');
      if (el) el.parentNode.removeChild(el);
    }

    function setLoading(state) {
      isLoading = state;
      sendBtn.disabled = state;
      inputEl.disabled = state;
    }

    function autoResizeInput() {
      inputEl.style.height = 'auto';
      inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
    }

    function sendMessage(text) {
      text = (text || inputEl.value).trim();
      if (!text || isLoading) return;

      inputEl.value = '';
      inputEl.style.height = 'auto';

      appendMessage('user', text);
      showTyping();
      setLoading(true);

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
        .then(function (res) {
          if (!res.ok) {
            return res.json().then(function (d) {
              throw new Error(d.error || 'Server error ' + res.status);
            });
          }
          return res.json();
        })
        .then(function (data) {
          hideTyping();
          appendMessage('ai', data.reply || 'No response received.');
        })
        .catch(function () {
          hideTyping();
          appendError();
        })
        .finally(function () {
          setLoading(false);
          inputEl.focus();
        });
    }

    // ─── Event wiring ─────────────────────────────────────────────────────────
    launcher.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', closePanel);
    sendBtn.addEventListener('click', function () { sendMessage(); });

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    inputEl.addEventListener('input', autoResizeInput);

    messagesEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.vai-prompt-chip');
      if (chip) {
        e.stopPropagation();
        sendMessage(chip.getAttribute('data-prompt'));
      }
    });

    document.addEventListener('click', function (e) {
      if (isOpen && !panel.contains(e.target) && !launcher.contains(e.target)) {
        closePanel();
      }
    });
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
