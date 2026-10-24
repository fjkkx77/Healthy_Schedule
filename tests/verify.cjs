// 健康网站回归测试：node tests/verify.cjs
// 两类检查：
//   1. 内容：医学/用药说法不许退回到核查前的错误写法（每条对应 2026-10-24 审查报告里的编号）
//   2. 逻辑：在假 DOM 里真跑首页 / 溃疡页的页面脚本，核推导引擎和服药方案的数字
// 改医学内容前先读 PROJECT_STATUS.md 的「事实核对表」。
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// HS_ROOT 可以指到别的副本（比如修改前的版本），用来确认测试在旧版上真的会红
const ROOT = process.env.HS_ROOT || path.join(__dirname, '..');
// 旧版本里可能还没有某个文件（比如 storage.js），当空文件处理，让检查照常跑完并报红
const read = f => (fs.existsSync(path.join(ROOT, f)) ? fs.readFileSync(path.join(ROOT, f), 'utf8') : '');
let fail = 0, pass = 0;
function ok(cond, msg) { if (cond) pass++; else { fail++; console.log('✗ ' + msg); } }

const PAGES = ['index.html', 'ulcer.html', 'cardio.html', 'skincare.html', 'plan.html'];
const SRC = Object.fromEntries(PAGES.concat(['assets/cardio.js', 'assets/style.css', 'assets/storage.js']).map(f => [f, read(f)]));
// 页面引用了共享的 storage.js 时，跑页面脚本前先把它加载进来（和浏览器里的加载顺序一致）
const withShared = (html, code) => (/assets\/storage\.js/.test(html) ? SRC['assets/storage.js'] + '\n' : '') + code;
const ALL = Object.values(SRC).join('\n');

/* ---------- 1. 内容 ---------- */
// P1-1：普通人 CPR 不摸脉搏；流程里要有打 120 和取 AED
const cpr = SRC['assets/cardio.js'].split('const cprSteps')[1].split('];')[0];
ok(!/颈动脉|摸脉搏判断|判断是否有搏动/.test(cpr.replace(/不要去摸脉搏/g, '')), 'P1-1 CPR 步骤里不能让普通人摸颈动脉/脉搏');
ok(/120/.test(cpr.split('第二步')[0]) && /AED/.test(cpr.split('第二步')[0]), 'P1-1 CPR 第一步要有「打 120」和「取 AED」');
// P1-2：TIA（症状几分钟就好了）也要立即打 120
const urg = SRC['cardio.html'].split('class="urgstack')[1];
const red = urg.split('urg-h">当天')[0];
ok(/几分钟/.test(red) && /好了/.test(red), 'P1-2 「立刻拨打 120」档要包含症状几分钟就好了的情形');
ok(!/当天尽快就医[\s\S]*短暂性单侧麻木无力或短暂说不清/.test(urg), 'P1-2 TIA 不能只在「当天就医」档');
// P1-3：意可贴禁忌按说明书全文
const ul = SRC['ulcer.html'];
ok(!/神经病史/.test(ul), 'P1-3 说明书写的是「精神病史」，不是「神经病史」');
for (const k of ['精神病史', '活动性结核', '早期妊娠', '角膜溃疡', '心或肾功能不全', '非感染性']) ok(ul.includes(k), 'P1-3 意可贴禁忌/适应症缺「' + k + '」');
// 疑似 P1-4：不从谷歌加载字体（国内连不上时会阻塞首屏）
ok(!/fonts\.googleapis|fonts\.gstatic/.test(ALL), 'P1-4 不能同步加载谷歌字体');
ok(!/'Noto Sans SC'/.test(SRC['assets/style.css']), 'P1-4 字体栈不再依赖 Noto Sans SC 网络字体');
// P2-3 蜂胶膜：3 天无缓解就医、过敏
ok(/3 天/.test(ul) && /过敏/.test(ul) && !/可全程(用|贴)到愈合/.test(ul), 'P2-3 蜂胶膜要写「3 天无缓解就医」和过敏提醒');
// P2-2 补锌
ok(!/抵消熬夜带来的免疫损伤/.test(ul) && /缺锌/.test(ul), 'P2-2 补锌要改成「确诊缺锌再补」');
// P2-4 疗效说法与「先查血」
ok(!/阻断溃疡成型/.test(ul) && /查血|血常规/.test(ul), 'P2-4 不能写「阻断溃疡成型」，要有「反复发作先查血」');
// P2-5 B6 理由
ok(!/已含足量\s*B6/.test(ul) && /0\.2\s*mg/.test(ul), 'P2-5 「复合维生素 B 已含足量 B6」不成立，要写每片 0.2mg');
// P2-6 就医清单
ok(/生殖器/.test(ul) && /出血/.test(ul), 'P2-6 何时就医要补出血/越来越痛、生殖器或皮肤溃疡');
// P2-7 食盐 5g
const cj = SRC['assets/cardio.js'];
ok(!/6\s*g/.test(cj.replace(/2016/g, '')) && (cj.match(/5\s*g/g) || []).length >= 2, 'P2-7 食盐上限应为 5g（两处）');
// P2-8 补钾警示
ok(/补钾[\s\S]{0,80}(肾|普利|沙坦)|(肾|普利|沙坦)[\s\S]{0,80}补钾/.test(cj), 'P2-8 老人补钾要写肾病/降压药警示');
// P2-9 规则卡
const rule = SRC['cardio.html'].split('class="rulecard-h"')[1].split('</div>\n  </div>')[0];
ok(/24 小时/.test(rule), 'P2-9 规则卡的 4.5 小时要带「24 小时」注释');
ok(!/拍打患者/.test(rule), 'P2-9 规则卡「别拍打患者」和 CPR「拍打双肩」打架');
// P2-10 睡眠中国口径
ok(/20–24℃/.test(SRC['index.html']) && /7–8 小时/.test(SRC['index.html']) && /6–7 小时/.test(SRC['index.html']), 'P2-10 首页要用中国 2025 睡眠核心信息的时长和室温');
ok(!/21:30~22:00入睡/.test(cj), 'P2-10 老年人作息改用中国官方 22–23 点入睡');
// P2-13 深色辅助文字对比度
ok(!/--text-4:\s*#6e7681/.test(SRC['assets/style.css']), 'P2-13 深色 --text-4 #6e7681 只有 3.77:1');
// P3 若干
ok(!/Johns Hopkins/.test(SRC['index.html']), 'P3-6 没有对应内容的机构徽章');
ok(!/临床运动处方实践专家共识/.test(SRC['cardio.html']), 'P3-6 检索不到的共识不能列为依据');
ok(!/降低血液粘稠度/.test(cj), 'P3-7 「温水降低血液粘稠度」无依据');
ok(!/1500~2000ml/.test(cj), 'P3-8 饮水量口径要和首页中国值一致');
ok(!/3,577|6,064/.test(SRC['index.html']), 'P3-10 检索不到的 J Sleep Res 2010 引用');
ok(!/深夜凌晨是交感神经和迷走神经/.test(SRC['cardio.html']), 'P3-17 心血管事件高峰在清晨，不是深夜凌晨');
ok(!/≈2\/5/.test(cj), 'P3-18 「≈2/5」与 48% 注释不自洽');
ok(!/40岁以上加做颈动脉B超/.test(cj), 'P3-20 颈动脉超声只针对高危人群');
ok(!/每次20~40分钟（散步/.test(cj), 'P3-21 老年人运动下限不能低于 WHO 150 分钟');
ok(/tel:120/.test(SRC['cardio.html']), 'O-1 急救页要有一键拨打 120');
ok(/apple-touch-icon/.test(SRC['index.html']), 'O-8 主屏幕图标');
for (const p of PAGES) ok(/最后核对/.test(SRC[p]), 'O-4 ' + p + ' 要写最后核对日期');

/* ---------- 2. 逻辑：在假 DOM 里跑页面脚本 ---------- */
function fakeEl() {
  const el = { value: '', checked: false, hidden: false, disabled: false, innerHTML: '', textContent: '', className: '', dataset: {}, style: {},
    children: [], classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    addEventListener() {}, appendChild(c) { el.children.push(c); }, querySelector() { return fakeEl(); }, querySelectorAll() { return []; },
    closest() { return fakeEl(); } };
  return el;
}
function runPage(file, storage) {
  const html = SRC[file];
  const scripts = withShared(html, [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'));
  const els = {};
  const store = storage || {};
  const ctx = {
    document: { getElementById: id => (els[id] = els[id] || fakeEl()), createElement: () => fakeEl(), querySelectorAll: () => [], querySelector: () => fakeEl() },
    localStorage: { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } },
    location: { href: 'https://x/', search: '' }, history: { replaceState() {} }, URL, URLSearchParams,
    setInterval() {}, setTimeout, clearTimeout, console, Date, Math, JSON
  };
  vm.createContext(ctx);
  vm.runInContext(scripts, ctx);
  return { ctx, els };
}

// 首页推导引擎
const idx = runPage('index.html').ctx;
const D = (S, W, free) => idx.derive(Object.assign({ sleepT: S, wakeT: W, freeOn: false }, free || {}));
// P2-14 社会时差跨零点
const jl1 = D(1380, 420, { freeOn: true, sleepF: 60, wakeF: 600 }).free.jetlag;
ok(Math.round(jl1) === 150, 'P2-14 23:00–07:00 对 01:00–10:00 的社会时差应为 150 分钟，实际 ' + Math.round(jl1));
const jl2 = D(30, 450, { freeOn: true, sleepF: 1410, wakeF: 450 }).free.jetlag;
ok(Math.round(jl2) === 30, 'P2-14 00:30–07:30 对 23:30–07:30 的社会时差应为 30 分钟，实际 ' + Math.round(jl2));
// 现实作息（睡 5–11 小时）不许时段重叠、不许末餐排到就寝之后
let bad = 0;
for (let W = 0; W < 1440; W += 15) for (let dur = 300; dur <= 660; dur += 15) {
  const S = ((W - dur) % 1440 + 1440) % 1440;
  const d = D(S, W); const b = idx.buildSchedule(d);
  for (let i = 1; i < b.length; i++) if (b[i].s < b[i - 1].e) bad++;
  if (d.lastMealEnd > d.bed) bad++;
  if (b.some(x => !(x.e > x.s))) bad++;
}
ok(bad === 0, '推导引擎：现实作息下出现 ' + bad + ' 处重叠/末餐在就寝后');
// P2-10 推荐时长按中国 7–8 小时睡眠（卧床再放宽 30 分钟入睡时间）
// 起床 06:00–07:00 都应能落进 22:00–22:59；更晚起床要卧床超过 8.5 小时才行，本来就排不进（页面会说明）
for (const W of [360, 390, 420]) {
  const rec = idx.recommend({ autoS: true, autoW: false, wakeT: W });
  ok(rec.dur >= 420 && rec.dur <= 510, 'P2-10 起床 ' + W + ' 推荐卧床应在 7–8.5 小时，实际 ' + rec.dur);
  ok(rec.inWin, 'CR-1 起床 ' + W + ' 时应能推荐出 22–23 点入睡，实际入睡 ' + rec.sleepT);
}
// CR-2 正常的 22:30–07:00（卧床 8.5 小时）不该报「最该优先解决」
// CR3-1 起床 07:30 排不进窗口时，说明文字不能自相矛盾（「需要 8.5 小时」又说「超出 8.5 小时上限」）
{
  const rec = idx.recommend({ autoS: true, autoW: false, wakeT: 450 });
  const txt = idx.recReason(rec).replace(/<[^>]+>/g, '');
  ok(!rec.inWin && /8 小时 31 分/.test(txt) && /超过推荐上限 8 小时 30 分/.test(txt), 'CR3-1 07:30 起床的说明应写精确区间，实际：' + txt.slice(0, 160));
}
ok(!/22:00–23:00/.test(SRC['index.html']), 'CR3-2 窗口是 22:00–22:59，文字不能写 22:00–23:00');
ok(/escHtml\(SCHED\.err\)/.test(SRC['plan.html']), 'CR3-3 课表报错插进页面前要转义');
{
  const r1 = runPage('index.html'); const ix = r1.ctx;
  const d = ix.derive({ sleepT: 1350, wakeT: 420, freeOn: false });
  ok(ix.derivedCards(d)[0].b.indexOf('推荐区间内') >= 0, 'CR-2 22:30–07:00 应在推荐区间内');
}
ok(!/BED_HI = 1380/.test(SRC['index.html']), 'CR2-2 23:00 不属于 UK Biobank 的 22:00–22:59 那一档');
// CR-6 / CR2-1 被挤压时只出一条警告，不能一边说「这不算问题」一边警告
{
  const r = runPage('index.html'); const ix = r.ctx;
  const d = ix.derive({ sleepT: 600, wakeT: 1080, freeOn: false });   // 10:00 睡、18:00 起：会被挤压
  ok(d.squeezed, 'CR2-1 测试前提：这组作息应被挤压');
  ix.renderAnchorOut({}, d);
  const out = r.els.aOut.innerHTML;
  ok(!/这不算问题/.test(out) && !/进食窗口只有/.test(out) && /排不开两顿饭/.test(out), 'CR2-1 被挤压时只该出「排不开两顿饭」，实际：' + out.replace(/<[^>]+>/g, '').slice(0, 120));
}
// P3-16 咖啡因截止：就寝前 9 小时（一杯咖啡 ≥8.8 小时）
ok(/d\.bed - 540/.test(SRC['index.html']) && !/d\.bed - (360|480)/.test(SRC['index.html']), 'P3-16 首页咖啡因截止应为就寝前 9 小时');
ok(/bedAbs - 540/.test(SRC['plan.html']), 'P3-16 专属方案咖啡因截止应为就寝前 9 小时');
// P3-12 / CR-3 / CR-4 / CR2-5 课表读取失败：真跑 loadSchedule，网络失败和数据读不懂分开说
async function planLoadCases() {
  const src = SRC['plan.html'];
  const code = src.slice(src.indexOf('const SNAPSHOT_AT'), src.indexOf('/* ---------- 日期工具'));
  const run = async fetchImpl => {
    const ctx = { fetch: fetchImpl, AbortController, setTimeout, clearTimeout, Error, String, JSON, Function, Array, RegExp };
    vm.createContext(ctx); vm.runInContext(code + '\nthis.__load = loadSchedule;', ctx);
    return ctx.__load();
  };
  const r1 = await run(() => Promise.reject(new TypeError('Load failed')));             // iOS Safari 断网
  ok(r1.err === '网络不通' && !r1.live, 'CR-3 iOS Safari 断网应说「网络不通」，实际：' + r1.err);
  const r2 = await run(() => Promise.reject(Object.assign(new Error('signal is aborted without reason'), { name: 'AbortError' })));
  ok(/6 秒/.test(r2.err), 'P3-12 超时应说「6 秒没连上」，实际：' + r2.err);
  const r3 = await run(() => Promise.resolve({ ok: true, text: () => Promise.resolve('<html>没有课表 fetch network</html>') }));
  ok(/^课表数据读不懂/.test(r3.err) && !/网络不通/.test(r3.err), 'CR2-5 数据读不懂不该被说成网络问题，实际：' + r3.err);
  const r4 = await run(() => Promise.resolve({ ok: false, status: 404 }));
  ok(r4.err === '课表网站返回 404 错误', 'HTTP 错误码，实际：' + r4.err);
  ok(!/[A-Za-z]{6,}/.test(r1.err + r2.err + r4.err), 'P3-12 提示里不出英文原文');
}
ok(!/function readSaved/.test(SRC['assets/cardio.js'] + SRC['ulcer.html'] + SRC['skincare.html']), 'CR-7 存储兜底只保留 assets/storage.js 一份');
// P3-1 专属方案：按节次排的实训也算实训周
ok(/type === "practical"/.test(SRC['plan.html']), 'P3-1 实训周判断要认 type: "practical"');

// 溃疡页服药方案
const ulc = runPage('ulcer.html', { ulcerPhase: 'early' }).ctx;
const phases = vm.runInContext('phases', ulc);
for (const p of phases) for (const s of p.schedules) {
  const folate = s.blocks.reduce((n, b) => n + b.meds.filter(m => /叶酸/.test(m.n)).length, 0);
  ok(folate <= 2, 'P2-1 「' + p.title + ' / ' + (s.tag || '默认') + '」叶酸一天 ' + folate + ' 片，超过 2 片（0.4mg 片按 UL 1mg 算）');
  const vc = s.blocks.reduce((n, b) => n + b.meds.filter(m => /维生素C/.test(m.n)).length, 0);
  ok(vc <= 3, 'P3-19 「' + p.title + '」维 C 一天 ' + vc + ' 片');
}
// P2-12 / P3-3：存储一碰就抛错、或存了对不上的旧值，页面也得渲染出来
for (const [file, key] of [['ulcer.html', 'ulcerPhase'], ['skincare.html', 'skincareRoutine']]) {
  let r;
  try { r = runPage(file, { [key]: 'not-a-valid-id' }); ok(r.els.pcontent && r.els.pcontent.innerHTML.length > 50, 'P3-3 ' + file + ' 存了非法旧值时内容为空'); }
  catch (e) { ok(false, 'P3-3 ' + file + ' 存了非法旧值时报错：' + e.message); }
  try {
    const throwing = new Proxy({}, { has() { throw new Error('SecurityError'); }, get() { throw new Error('SecurityError'); } });
    const html = SRC[file]; const scripts = withShared(html, [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n'));
    const els = {};
    const ctx = { document: { getElementById: id => (els[id] = els[id] || fakeEl()) }, console, Date, Math, JSON };
    Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError'); } });
    vm.createContext(ctx); vm.runInContext(scripts, ctx);
    ok(els.pcontent && els.pcontent.innerHTML.length > 50, 'P2-12 ' + file + ' 存储不可用时内容为空');
    void throwing;
  } catch (e) { ok(false, 'P2-12 ' + file + ' 存储不可用时报错：' + e.message); }
}
{
  const els = {};
  const ctx = { document: { getElementById: id => (els[id] = els[id] || fakeEl()), querySelectorAll: () => [] }, console, Date, Math, JSON };
  Object.defineProperty(ctx, 'localStorage', { get() { throw new Error('SecurityError'); } });
  try { vm.createContext(ctx); vm.runInContext(withShared(SRC['cardio.html'], SRC['assets/cardio.js']), ctx); ok(els.mythGrid && els.mythGrid.innerHTML.length > 50 && els.pcontent.innerHTML.length > 50, 'P2-12 急救页存储不可用时下半部分为空'); }
  catch (e) { ok(false, 'P2-12 急救页存储不可用时报错：' + e.message); }
}

// CR2-4 共享的 storage.js 没加载到（弱网）时，三页也不能空白
for (const file of ['ulcer.html', 'skincare.html']) {
  const html = SRC[file]; const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
  const els = {};
  const ctx = { document: { getElementById: id => (els[id] = els[id] || fakeEl()) }, localStorage: { getItem() { return null; }, setItem() {} }, console, Date, Math, JSON };
  try { vm.createContext(ctx); vm.runInContext(scripts, ctx); ok(els.pcontent.innerHTML.length > 50, 'CR2-4 ' + file + ' 没有 storage.js 时内容为空'); }
  catch (e) { ok(false, 'CR2-4 ' + file + ' 没有 storage.js 时报错：' + e.message); }
}
{
  const els = {};
  const ctx = { document: { getElementById: id => (els[id] = els[id] || fakeEl()), querySelectorAll: () => [] }, localStorage: { getItem() { return null; }, setItem() {} }, console, Date, Math, JSON };
  try { vm.createContext(ctx); vm.runInContext(SRC['assets/cardio.js'], ctx); ok(els.pcontent.innerHTML.length > 50, 'CR2-4 急救页没有 storage.js 时分人群方案为空'); }
  catch (e) { ok(false, 'CR2-4 急救页没有 storage.js 时报错：' + e.message); }
}

planLoadCases().catch(e => { ok(false, '专属方案课表读取测试自身出错（页面结构可能改了）：' + e.message); }).then(() => {
  console.log((fail ? '✗ ' : '✓ ') + pass + ' 条通过，' + fail + ' 条失败');
  process.exit(fail ? 1 : 0);
});
