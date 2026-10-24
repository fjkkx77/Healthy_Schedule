/* 本地存储的安全读写，溃疡 / 急救 / 护肤三页共用。
   本地存储可能被浏览器禁用（读写会抛错），存的旧值也可能已经对不上现在的选项
   （以后改了选项 id）——都退回默认值，页面内容照常显示。2026-10-24 审查 P2-12 / P3-3。 */
function readSaved(key, valid, fallback) {
  try { const v = localStorage.getItem(key); return valid.indexOf(v) >= 0 ? v : fallback; } catch (e) { return fallback; }
}
function writeSaved(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }
