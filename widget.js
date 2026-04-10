(function () {
  'use strict';

  // ─── Config ──────────────────────────────────────────────────────────────────
  var API_URL = 'https://vizionise-ai-backend-production.up.railway.app/chat';

  var SUGGESTED_PROMPTS = [
    'What services does Vizionise offer?',
    'Do I need a new website?',
    'What AI automations can help my business?',
  ];

  // ─── CSS injection ────────────────────────────────────────────────────────────
  // Derive the CSS URL from this script's src attribute so hosting works anywhere
  function injectCSS() {
    var scripts = document.querySelectorAll('script[src]');
    var cssHref = '';

    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf('widget.js') !== -1) {
        cssHref = scripts[i].src.replace('widget.js', 'widget.css');
        break;
      }
    }

    // Fallback: look for the currently executing script
    if (!cssHref && document.currentScript && document.currentScript.src) {
      cssHref = document.currentScript.src.replace('widget.js', 'widget.css');
    }

    if (cssHref) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }

    // Prevent widget from causing horizontal scrollbar
    var noScroll = document.createElement('style');
    noScroll.textContent = 'body { overflow-x: hidden !important; }';
    document.head.appendChild(noScroll);
  }

  // ─── HTML template ────────────────────────────────────────────────────────────
  function buildHTML() {
    // Launcher button
    var launcher = document.createElement('button');
    launcher.className = 'vai-launcher';
    launcher.setAttribute('aria-label', 'Open AI assistant');
    launcher.setAttribute('title', 'Chat with Vizionise AI');
    launcher.innerHTML =
      '<span class="vai-launcher-icon vai-icon-chat">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="white"/>' +
        '</svg>' +
      '</span>' +
      '<span class="vai-launcher-icon vai-icon-close vai-hidden">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M18 6L6 18M6 6L18 18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>' +
        '</svg>' +
      '</span>';

    // Prompts HTML
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

    // Chat panel
    var panel = document.createElement('div');
    panel.className = 'vai-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Vizionise AI Assistant');
    panel.innerHTML =
      '<div class="vai-header">' +
        '<div class="vai-header-avatar">AI</div>' +
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
    injectCSS();

    var els = buildHTML();
    var launcher = els.launcher;
    var panel = els.panel;

    var root = document.createElement('div');
    root.style.cssText = 'position:fixed;top:0;left:0;width:0;height:0;overflow:visible;z-index:99997;pointer-events:none;';
    root.appendChild(panel);
    root.appendChild(launcher);
    document.body.appendChild(root);

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
      // Remove prompts once user sends first message
      var prompts = messagesEl.querySelector('.vai-prompts');
      if (prompts && role === 'user') {
        prompts.parentNode.removeChild(prompts);
      }

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
        .catch(function (err) {
          hideTyping();
          appendMessage('ai', 'Sorry, I could not connect to the server. Please try again. (' + err.message + ')');
        })
        .finally(function () {
          setLoading(false);
          inputEl.focus();
        });
    }

    // ─── Event wiring ─────────────────────────────────────────────────────────
    launcher.addEventListener('click', togglePanel);
    closeBtn.addEventListener('click', closePanel);

    sendBtn.addEventListener('click', function () {
      sendMessage();
    });

    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    inputEl.addEventListener('input', autoResizeInput);

    // Delegate prompt chip clicks
    messagesEl.addEventListener('click', function (e) {
      var chip = e.target.closest('.vai-prompt-chip');
      if (chip) {
        var prompt = chip.getAttribute('data-prompt');
        sendMessage(prompt);
      }
    });

    // Close when clicking outside the panel (but not launcher)
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
