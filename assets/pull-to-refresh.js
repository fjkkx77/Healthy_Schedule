/* ============================================================
   下拉刷新（三个页面共用）
   上半是手势内核：只做算术和状态流转，不碰 DOM，可以脱离浏览器单测；
   下半是 DOM 装配：造指示器、接 touch 事件、执行刷新。
   参数在多个项目上收敛过：死区 16px / 阻尼 0.42 / 阈值 clamp(56, 屏高×10%, 100)
   / 最大下拉 120px / spinner 停 260ms。三条铁律，少一条就会出现"往上滑却刷新了"：
     · 起手 16px 死区内什么都不做
     · 出了死区方向一锤定音，判成不是下拉就整次弃权
     · 位移从死区之外开始算（dy - DEADZONE），否则过死区那一刻指示器会跳一下
   ============================================================ */
(function (global) {
  'use strict';

  var DEADZONE = 16;    // 起手死区（px，手指位移）：按下瞬间的抖动不算下拉
  var DAMPING  = 0.42;  // 阻尼：手指位移 × 它 = 指示器位移
  var MAX_PULL = 120;   // 指示器最多下移这么多

  // 阈值按屏高推导：844px 屏算出 84、568px 屏算出 57，手指行程都稳定在 ≈26% 屏高
  function thresholdFor(h) { return Math.min(100, Math.max(56, h * 0.1)); }

  /* ---------- 手势内核 ---------- */
  function createPullGesture(env) {
    var isBlocked = env.isBlocked || function () { return false; };
    var scrollTop = env.scrollTop || function () { return 0; };
    var viewportHeight = env.viewportHeight || function () { return 800; };
    var onPaint = env.onPaint || function () {};
    var onSettle = env.onSettle || function () {};
    var onTrigger = env.onTrigger || function () {};

    var startX = 0, startY = 0, pulling = false, locked = false, distance = 0, refreshing = false;
    function threshold() { return thresholdFor(viewportHeight()); }

    return {
      start: function (x, y, touchCount) {
        // 多指（缩放）不管；被挡住不管；不在顶部不管
        if (refreshing || touchCount !== 1 || isBlocked() || scrollTop() > 0) { pulling = false; return false; }
        startX = x; startY = y; pulling = true; locked = false; distance = 0;
        return true;
      },
      // 返回 true = 这次滑动归下拉刷新，调用方必须 preventDefault
      move: function (x, y) {
        if (!pulling || refreshing) return false;
        var dx = x - startX, dy = y - startY;
        if (!locked) {
          if (Math.abs(dy) < DEADZONE && Math.abs(dx) < DEADZONE) return false;            // 死区内继续观察
          if (dy <= 0 || Math.abs(dx) > Math.abs(dy)) { pulling = false; return false; }   // 上滑/横滑 → 整次弃权
          locked = true;
        }
        // 拉到一半改主意往上滑：必须交还控制权，否则用户会觉得"页面卡住滚不动"
        if (dy <= 0 || scrollTop() > 0) { pulling = false; locked = false; distance = 0; onSettle(); return false; }
        distance = Math.min((dy - DEADZONE) * DAMPING, MAX_PULL);
        onPaint(distance);
        return true;
      },
      end: function () {
        // 只在死区里观察过、没真进入下拉的，当这次手势没发生过
        if (!pulling || !locked || refreshing) { pulling = false; locked = false; return false; }
        pulling = false; locked = false;
        if (distance < threshold()) { distance = 0; onSettle(); return false; }
        refreshing = true;
        onTrigger(threshold());
        return true;
      },
      // 触摸被系统打断（来电、系统手势）：当没拉过，收回指示器，绝不触发刷新
      cancel: function () {
        var wasPulling = pulling && locked;
        pulling = false; locked = false;
        if (refreshing) return;
        distance = 0;
        if (wasPulling) onSettle();
      },
      cancelRefresh: function () { refreshing = false; distance = 0; }, // 断网被拦下来之后要能再用
      getDistance: function () { return distance; },
      isRefreshing: function () { return refreshing; },
      threshold: threshold
    };
  }

  /* ---------- 刷新：先把同源 css/js 的缓存校验一遍，再 reload ----------
     GitHub Pages 给所有文件都是 Cache-Control: max-age=600。实测 location.reload()
     只会回源校验 HTML 本身，assets/ 下的 css/js 在 10 分钟内直接用缓存——
     刚发版时下拉刷新会拿到"新 HTML + 旧样式/旧脚本"。
     先用 fetch(cache:'no-cache') 把它们各问一遍服务器（没变就是 304，很便宜），
     缓存里就是新的了，随后的 reload 自然用上新版。最多等 2.5 秒，超时照样刷新。 */
  function sameOriginAssets() {
    var nodes = document.querySelectorAll('link[rel="stylesheet"][href], script[src]');
    var urls = [];
    for (var i = 0; i < nodes.length; i++) {
      var raw = nodes[i].getAttribute('href') || nodes[i].getAttribute('src');
      try {
        var u = new URL(raw, location.href);
        if (u.origin === location.origin && urls.indexOf(u.href) < 0) urls.push(u.href);
      } catch (e) {}
    }
    return urls;
  }
  function revalidateThenReload() {
    var done = false;
    function go() { if (!done) { done = true; location.reload(); } }
    if (typeof fetch !== 'function' || typeof Promise !== 'function') { go(); return; }
    setTimeout(go, 2500);
    Promise.all(sameOriginAssets().map(function (u) {
      return fetch(u, { cache: 'no-cache' }).catch(function () {});
    })).then(go, go);
  }

  /* ---------- DOM 装配 ---------- */
  var ARROW = '<svg class="ptr-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>';
  var SPINNER = '<svg class="ptr-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>';

  function setupPullToRefresh(options) {
    options = options || {};
    if (document.getElementById('ptr-indicator')) return null;   // 防止重复装配

    var indicator = document.createElement('div');
    indicator.id = 'ptr-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    indicator.innerHTML = ARROW + SPINNER;
    var tip = document.createElement('div');
    tip.id = 'ptr-tip';
    tip.setAttribute('role', 'status');
    tip.hidden = true;
    document.body.appendChild(indicator);
    document.body.appendChild(tip);

    // 这个站没有弹窗/浮层，也没有表单之类"刷新会毁掉手里工作"的界面，所以默认不挡。
    // 以后加了浮层，要回来在这里排除掉。
    var isBlocked = options.isBlocked || function () { return false; };
    // 三个页面都是整页滚动（body 没有 overflow:hidden），滚动容器就是 window
    var scrollTop = options.scrollTop || function () { return window.scrollY || document.documentElement.scrollTop || 0; };
    var doRefresh = options.doRefresh || revalidateThenReload;
    var tipTimer = null;

    function showTip(msg) {
      tip.textContent = msg; tip.hidden = false;
      requestAnimationFrame(function () { tip.classList.add('show'); });
      clearTimeout(tipTimer);
      tipTimer = setTimeout(function () {
        tip.classList.remove('show');
        setTimeout(function () { tip.hidden = true; }, 300);
      }, 3200);
    }
    function paint(d) {
      indicator.classList.remove('ptr-animate');
      indicator.style.transform = 'translateY(' + d + 'px)';
      indicator.style.opacity = String(Math.min(1, d / (gesture.threshold() * 0.8)));
      indicator.classList.toggle('ptr-ready', d >= gesture.threshold());
    }
    function settle() {
      indicator.classList.add('ptr-animate');
      indicator.style.transform = 'translateY(0)';
      indicator.style.opacity = '0';
      indicator.classList.remove('ptr-ready', 'ptr-loading');
    }
    function trigger(threshold) {
      indicator.classList.add('ptr-animate', 'ptr-loading');
      indicator.style.transform = 'translateY(' + threshold + 'px)';
      indicator.style.opacity = '1';
      try { sessionStorage.setItem('ptr-fired', String(Date.now())); } catch (e) {}   // 给自动化验收用的标记
      // 留一下 spinner 再动手，否则松手瞬间白屏，看起来像卡死
      setTimeout(function () {
        // 没有 Service Worker，断网时 reload 会变成浏览器错误页 = 把网站弄没了
        if (navigator.onLine === false) {
          showTip('当前没有网络，先不刷新了。等有网了再拉一次。');
          gesture.cancelRefresh(); settle(); return;
        }
        doRefresh();
      }, 260);
    }

    var gesture = createPullGesture({
      isBlocked: isBlocked,
      scrollTop: scrollTop,
      viewportHeight: function () { return window.innerHeight; },
      onPaint: paint, onSettle: settle, onTrigger: trigger
    });

    document.addEventListener('touchstart', function (e) {
      gesture.start(e.touches[0].clientX, e.touches[0].clientY, e.touches.length);
    }, { passive: true });
    // 必须 passive:false，否则 preventDefault 无效，页面会跟着一起动
    document.addEventListener('touchmove', function (e) {
      if (gesture.move(e.touches[0].clientX, e.touches[0].clientY)) e.preventDefault();
    }, { passive: false });
    document.addEventListener('touchend', function () { gesture.end(); }, { passive: true });
    document.addEventListener('touchcancel', function () { gesture.cancel(); }, { passive: true });

    return { gesture: gesture, showTip: showTip };
  }

  var api = {
    createPullGesture: createPullGesture, setupPullToRefresh: setupPullToRefresh,
    thresholdFor: thresholdFor, DEADZONE: DEADZONE, DAMPING: DAMPING, MAX_PULL: MAX_PULL
  };
  if (typeof module === 'object' && module.exports) module.exports = api;   // node 单测用
  if (typeof document !== 'undefined') {
    global.PullToRefresh = api;
    var init = function () { api.instance = setupPullToRefresh(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})(typeof window !== 'undefined' ? window : this);
