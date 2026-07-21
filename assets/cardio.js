/* ============================================================
   心梗 · 脑梗 · 猝死急救页面数据与渲染
   内容整理自：《心梗脑梗猝死全人群深度调研报告》
             《心梗、脑梗、心源性猝死与"熬夜猝死"深度调研报告》(2026-03-25)
   ============================================================ */

/* ---------- 1. 数字看风险 ---------- */
const stats = [
  { num: "54.4万", color: "var(--red)", label: "我国每年心源性猝死人数", note: "居世界首位，粗略计算平均每分钟约1人猝死" },
  { num: "60~70%", color: "var(--blue)", label: "缺血性脑卒中占全部脑卒中比例", note: "即脑梗死，是卒中的绝对主体；卒中致死率居我国死因第一位" },
  { num: "16.8%", color: "var(--orange)", label: "急性心梗患者中55岁以下占比", note: "年发病率87.6/10万，年轻化趋势明显" },
  { num: "4分钟", color: "var(--green)", label: "心肺复苏黄金时间", note: "超过6分钟即使抢救成功，也可能造成不可逆脑损伤" },
  { num: "4.5小时", color: "var(--teal)", label: "脑卒中静脉溶栓黄金窗口", note: "我国溶栓率仅5.6%，远低于发达国家20%，主因是送医延迟" },
  { num: "≈2/5", color: "var(--indigo)", label: "心血管病占城乡居民死因比例", note: "2021年农村48.98%、城市47.35%，每5例死亡约2例死于心血管病" },
];

document.getElementById("stats").innerHTML = stats.map(s => `
  <div class="statcard">
    <div class="stat-num" style="color:${s.color}">${s.num}</div>
    <div class="stat-label">${s.label}</div>
    <div class="stat-note">${s.note}</div>
  </div>`).join("");

/* ---------- 2. FAST + BE ---------- */
const fastItems = [
  { l: "F", bg: "var(--blue)", t: "Face 脸", b: "让患者微笑或龇牙，一侧嘴角下垂、眼睑闭合不全 → 83%脑卒中患者首发症状是面部歪斜" },
  { l: "A", bg: "var(--orange)", t: "Arms 手臂", b: "让患者双臂平举，一侧手臂无力麻木、不能抬起或保持平举" },
  { l: "S", bg: "var(--green)", t: "Speech 言语", b: "让患者重复一句简单的话，若含糊不清、词不达意或完全失语" },
  { l: "T", bg: "var(--red)", t: "Time 时间", b: "立即拨打120，记录症状出现时间——这是能否溶栓治疗的关键指标" },
  { l: "B", bg: "var(--indigo)", t: "Balance 平衡", b: "突然站不稳、失去平衡（BEFAST扩展项，提示后循环卒中）" },
  { l: "E", bg: "var(--teal)", t: "Eyes 视力", b: "突然视力模糊、黑蒙、复视（BEFAST扩展项）" },
];

document.getElementById("fastgrid").innerHTML = fastItems.map(f => `
  <div class="fastcard">
    <div class="fast-letter" style="background:${f.bg}">${f.l}</div>
    <div><div class="fast-t">${f.t}</div><div class="fast-b">${f.b}</div></div>
  </div>`).join("") + `
  <div class="fastcard" style="grid-column:1/-1">
    <div class="fast-letter" style="background:var(--text-3)">中</div>
    <div>
      <div class="fast-t">中国"中风120"口诀</div>
      <div class="fast-b">1 看一张脸是否对称；2 查两只胳膊能否平举；0（聆）听讲话是否清楚。任何一项异常，立刻拨打120。</div>
      <div class="fast-ext"><strong>BE FAST扩展识别：</strong>加入Balance平衡和Eyes视力两项后，可将公众自我识别卒中率从70%提高到超过90%。</div>
    </div>
  </div>`;

/* ---------- 3. CPR + AED ---------- */
const cprSteps = [
  {
    icon: "👀", ibg: "var(--blue-soft)", step: "第一步", label: "评估安全 · 判断意识与呼吸",
    rows: [
      "确保现场安全，避免自己和患者处于危险之中",
      "拍打并大声呼喊患者，观察胸廓起伏，触摸颈动脉判断是否有搏动",
      "若患者无意识、无呼吸或仅有喘息样呼吸，立即开始心肺复苏——「偶尔大喘气」不算正常呼吸",
    ],
    ev: "不会人工呼吸也不要犹豫，先做徒手按压（Hands-only CPR），持续按压远好于什么都不做。"
  },
  {
    icon: "🫀", ibg: "var(--red-soft)", step: "第二步", label: "胸外按压",
    rows: [
      "位置：双手叠放于患者胸骨下半段（两乳头连线中点）",
      "频率：100~120次/分钟；深度：5~6厘米（成人）",
      "要求：每次按压后充分回弹，双手不要离开胸壁",
      "比例：30次按压 + 2次人工呼吸（不会人工呼吸可持续做胸外按压）",
    ],
    ev: "担心按坏肋骨而不敢按，是心脏骤停现场最常见的错误——对真正心脏骤停者来说，不按才是更大的问题。"
  },
  {
    icon: "⚡", ibg: "var(--orange-soft)", step: "第三步", label: "使用 AED",
    rows: [
      "打开AED电源，按语音提示操作",
      "将电极片贴在患者裸露的胸部（右锁骨下方和左乳头外侧）",
      "AED自动分析心律，如提示需要除颤，确保所有人离开患者，按下除颤按钮",
      "除颤后立即继续胸外按压，直到急救人员到达",
    ],
    ev: "AED的语音提示就是为非专业人士设计的，不会在不该放电时乱放电，「没学过不敢用」不应成为延误的理由。"
  },
  {
    icon: "🚑", ibg: "var(--green-soft)", step: "第四步", label: "持续到急救人员接手",
    rows: [
      "在等待急救人员到来的过程中，持续进行心肺复苏，不要轻易放弃",
      "有人轮换时可交替按压，减少疲劳导致按压质量下降",
    ],
    ev: "每一分钟的延误，患者生存的机会就会急剧下降约10%。"
  },
];

document.getElementById("cprSteps").innerHTML = cprSteps.map((s, i) => `
  <div class="tcard${i === 0 ? " open" : ""}">
    <div class="thead">
      <div class="ticon" style="background:${s.ibg}">${s.icon}</div>
      <div class="tmid">
        <div class="ttime">${s.step}</div>
        <div class="tlabel">${s.label}</div>
      </div>
      <span class="tchev">▼</span>
    </div>
    <div class="tbody">
      <div class="trows">${s.rows.map(r => `<div class="trow-line">${r}</div>`).join("")}</div>
      <div class="ebox"><strong>关键提醒：</strong>${s.ev}</div>
    </div>
  </div>`).join("");
document.querySelectorAll("#cprSteps .thead").forEach(el =>
  el.addEventListener("click", () => el.closest(".tcard").classList.toggle("open"))
);

/* ---------- 4. 心梗/脑梗/猝死/熬夜猝死 对照 ---------- */
const compare = [
  {
    ico: "💔", t: "心梗（心肌梗死）",
    rows: [
      ["本质", "冠状动脉急性堵塞或严重供血不足，导致心肌缺血坏死"],
      ["表现", "胸前区压榨样闷痛，可放射至左肩、左臂、下颌、背部，伴冷汗、气短、恶心"],
      ["第一反应", "停止活动、坐/半卧位、拨打120；符合条件可嚼服阿司匹林"],
      ["常见误区", "当成胃病/焦虑/肌肉拉伤；自己开车硬扛"],
    ]
  },
  {
    ico: "🧠", t: "脑梗 / 卒中",
    rows: [
      ["本质", "脑血流受阻（脑梗）或脑血管破裂（脑出血）统称卒中"],
      ["表现", "口角歪斜、单侧无力麻木、言语含糊、视力异常、突然站不稳"],
      ["第一反应", "拨打120并记录发病时间，不要喂水喂药"],
      ["常见误区", "觉得休息一下会好；先喂水、喂降压药、喂阿司匹林"],
    ]
  },
  {
    ico: "⚡", t: "心源性猝死 / 心脏骤停",
    rows: [
      ["本质", "心脏突然失去有效泵血，常由恶性心律失常、急性心梗、结构性心脏病引起"],
      ["表现", "突然倒地、无反应、不呼吸或只有喘气样呼吸"],
      ["第一反应", "立即呼叫120、取AED、开始胸外按压"],
      ["常见误区", "掐人中、围观等待、怕按坏肋骨不敢按"],
    ]
  },
  {
    ico: "🌙", t: "「熬夜猝死」",
    rows: [
      ["本质", "不是独立病名，是睡眠不足/节律紊乱放大并触发了潜在的心脑血管风险"],
      ["表现", "熬夜后胸痛、心悸、气短、神经功能异常，或直接出现恶性心律失常/倒地"],
      ["第一反应", "按真正的急症路径处理：心梗怎么办、卒中怎么办、骤停怎么办"],
      ["常见误区", "把危险信号归因于「太累了」「睡一觉就好」"],
    ]
  },
];

document.getElementById("compareGrid").innerHTML = compare.map(c => `
  <div class="ppcrd">
    <div class="ppcrd-ico">${c.ico}</div>
    <div class="ppcrd-t">${c.t}</div>
    ${c.rows.map(r => `<div class="ppcrd-row"><b>${r[0]}：</b>${r[1]}</div>`).join("")}
  </div>`).join("");

/* ---------- 5. 关键筛查数字 ---------- */
const screens = [
  { icon: "🩸", bg: "var(--red-soft)", t: "血压", v: "正常 <120/80；升高 120–129且舒张<80；1级高血压 130–139或80–89；2级 ≥140或≥90", n: "18岁以上都应筛查；40岁以上或高危者至少每年测；>180/120且伴胸痛/神经症状=高血压急症，立即就医" },
  { icon: "🧈", bg: "var(--orange-soft)", t: "血脂", v: "高LDL推动动脉粥样硬化，很多人因无症状而长期不知道偏高", n: "年轻上班族和中老年人最常漏查，建议纳入年度体检" },
  { icon: "🍬", bg: "var(--teal-soft)", t: "血糖", v: "糖尿病/糖前期会显著增加血管损伤和心脑血管事件风险", n: "35~70岁且超重/肥胖的成人建议筛查前期糖尿病和2型糖尿病" },
  { icon: "💓", bg: "var(--blue-soft)", t: "房颤线索", v: "房颤会显著增加缺血性卒中风险", n: "反复心悸、脉搏忽快忽慢、头晕濒晕者应尽快做心电图或动态监测" },
  { icon: "😪", bg: "var(--indigo-soft)", t: "睡眠呼吸暂停线索", v: "会增加高血压、心梗、卒中和房颤风险", n: "鼾声大、憋醒、白天困、晨起头痛或难控高血压者应尽快评估" },
  { icon: "🧬", bg: "var(--green-soft)", t: "家族史", v: "家族中若有人年轻心梗、卒中、肥厚型心肌病或猝死，个体风险评估会被重写", n: "一旦存在应主动告知医生；大学生和运动人群尤其重要" },
];

document.getElementById("screenList").innerHTML = screens.map(s => `
  <div class="iosrow">
    <div class="iosrow-icon" style="background:${s.bg}">${s.icon}</div>
    <div><div class="iosrow-t">${s.t}</div><div class="iosrow-v">${s.v}</div><div class="iosrow-n">${s.n}</div></div>
  </div>`).join("");

/* ---------- 6. 分人群预防方案 ---------- */
const groups = [
  {
    id: "student", tabLabel: "大学生", icon: "🎓",
    title: "大学生（18~24岁）",
    subtitle: "发病率低但一旦发生极其凶险，重点是行为触发 + 隐匿心脏问题",
    blocks: [
      { h: "😴 作息", rows: ["每晚23:00前入睡，保证至少7小时睡眠，避免连续熬夜超过2天", "考试周/期末周避免连续多天通宵复习，提前规划分散压力", "睡前1小时减少手机/电脑使用，避免蓝光干扰褪黑素", "学会情绪管理，可通过冥想、深呼吸、听音乐放松"] },
      { h: "🍽️ 饮食", rows: ["减少高油高盐高糖食物、少喝奶茶含糖饮料", "多吃优质蛋白、新鲜蔬菜水果和杂粮，避免暴饮暴食和夜宵", "戒烟限酒；每天至少1500~2000ml温水"] },
      { h: "🏃 运动", rows: ["有氧运动每周≥5次，每次30~50分钟中等强度（快走/慢跑/游泳/骑行/跳绳）", "抗阻运动每周2~3次，间隔至少1天；运动前后必做柔韧拉伸"], warn: "特别警告：平时缺乏运动者绝对不要贸然进行突击式剧烈运动（如突然跑马拉松、做100个俯卧撑），感冒、熬夜、饮酒后禁止剧烈运动" },
      { h: "🩺 定期筛查", rows: ["入学体检关注心电图检查结果，有心脏病家族史者应主动就诊", "有遗传性离子通道病、肥厚型心肌病等家族史应尽早就诊", "建议每年检测一次血压、血脂、血糖"] },
      { h: "⚠️ 最需警惕的场景", rows: ["运动会/体育测试时猝死（1000米跑、篮球赛）", "考试周连续多天熬夜复习后猝死", "熬夜打游戏后猝死", "感冒后剧烈运动导致猝死（病毒性心肌炎）"] },
      { h: "🏠 宿舍应急准备", rows: ["知道校内/场馆AED在哪里", "室友至少会识别「中风120」和徒手CPR", "有基础病/过敏史者可让室友知道"] },
    ]
  },
  {
    id: "worker", tabLabel: "年轻上班族", icon: "💼",
    title: "年轻上班族（25~45岁）",
    subtitle: "最大的风险是看不见的累积：久坐、缺觉、压力、腹型肥胖",
    blocks: [
      { h: "😴 作息", rows: ["严格执行23:00前入睡，保证7小时睡眠，避免长期熬夜加班", "每工作45~60分钟起身活动5分钟，避免久坐不动", "学会控制情绪，通过冥想、瑜伽、旅游放松心情", "周末不要突然改变作息时间"] },
      { h: "🍽️ 饮食", rows: ["规律三餐不跳过早餐，每餐八分饱", "每日食盐控制在6g以内；多吃富含纤维素的食物", "减少应酬饮酒，戒烟；睡前可喝一杯温水降低血液粘稠度"] },
      { h: "🏃 运动", rows: ["有氧运动每周≥5次，每次30~50分钟中等强度", "抗阻运动每周2~3次；工作间隙「微运动」每小时起身5分钟", "运动强度：初始50~70%最大心率（HRmax=207-0.7×年龄）"] },
      { h: "🩺 定期筛查", rows: ["30岁及以上每年至少一次血压检测", "年度体检加做心电图、血脂、血糖、同型半胱氨酸检查", "家族史者应做超声心动图、动态心电图检查", "控制体重（我国18岁以上超重率34.6%，肥胖率17.8%）"] },
      { h: "⚠️ 最需警惕的场景", rows: ["连续加班/熬夜后清晨猝死", "应酬饮酒后猝死", "平时不运动，突然剧烈运动", "长期久坐引发肺栓塞"] },
      { h: "💡 高价值日常动作", rows: ["每30~60分钟起身活动2~5分钟", "150分钟有氧可拆成日内10~15分钟小段", "固定核心睡眠窗口，彻夜未眠后不做高强度训练"] },
    ]
  },
  {
    id: "senior", tabLabel: "中老年人", icon: "👴",
    title: "中老年人（45岁以上 / 父母祖父母）",
    subtitle: "重点是基础病管理 + 规律用药 + 家庭急救准备",
    blocks: [
      { h: "😴 作息", rows: ["建议晚上21:30~22:00入睡，早上6:00~7:00起床", "清晨起床先在床上躺1~2分钟，再慢慢坐起、站立——清晨是心血管事件高发时段", "做好头、颈、脚保暖，寒冷季节心血管事件发病率显著升高", "避免用力排便、情绪激动、突然体位改变"] },
      { h: "🍽️ 饮食", rows: ["严格控盐，每日不超过6g，减少腌制品", "低脂饮食，减少动物内脏、肥肉、油炸食物", "多吃蔬菜水果、杂粮豆类、鱼类，适当补充钙、钾、维生素D"] },
      { h: "🏃 运动", rows: ["有氧运动每周3~5次，每次20~40分钟（散步、太极拳、广场舞、游泳）", "力量运动每周2~3次，用力时呼气、放松时吸气，绝对避免憋气", "平衡训练非常重要，可预防跌倒；柔韧拉伸每周2~3次"], warn: "有心脏病、高血压、糖尿病等基础病者，应在医生指导下制定运动方案；运动中如头晕、心慌、胸闷应立即停止，建议结伴运动" },
      { h: "🩺 定期筛查", rows: ["每年至少1次全面体检，重点血压、血脂、血糖、心电图", "40岁以上加做颈动脉B超、经颅多普勒血管超声", "高血压患者每天测血压，不可自行停药或减药", "房颤患者应特别警惕脑梗风险，规范抗凝治疗"] },
      { h: "⚠️ 最需警惕的场景", rows: ["清晨起床时突发心梗/脑梗", "冬季寒冷天气户外活动时", "上厕所用力排便时", "情绪激动（生气、感伤）后", "夜间睡眠中（脑梗常发于休息/睡眠时）"] },
      { h: "👨‍👩‍👧 家属能做什么", rows: ["准备上臂式血压计、药盒、药物清单、既往病史卡", "记录发病时间，不擅自喂水喂药", "至少一人会识别卒中和心脏骤停，会CPR和AED"] },
    ]
  },
];

const ptabs = document.getElementById("ptabs");
const pcontent = document.getElementById("pcontent");
const STORE_KEY = "cardioGroup";

function renderGroupTabs(activeId) {
  ptabs.innerHTML = groups.map(g => `
    <div class="ptab${g.id === activeId ? " on" : ""}" data-id="${g.id}">
      <span class="pico">${g.icon}</span>${g.tabLabel}
    </div>`).join("");
  ptabs.querySelectorAll(".ptab").forEach(el => {
    el.addEventListener("click", () => {
      localStorage.setItem(STORE_KEY, el.dataset.id);
      renderGroupTabs(el.dataset.id);
      renderGroupContent(el.dataset.id);
    });
  });
}

function renderGroupContent(activeId) {
  const g = groups.find(x => x.id === activeId);
  pcontent.innerHTML = `
    <div class="pc-title">${g.title}</div>
    <div class="pc-sub">${g.subtitle}</div>
    ${g.blocks.map(b => `
      <div class="pc-block">
        <div class="pc-block-h">${b.h}</div>
        ${b.rows.map(r => `<div class="pc-row">${r}</div>`).join("")}
        ${b.warn ? `<div class="pc-warn">⚠️ ${b.warn}</div>` : ""}
      </div>`).join("")}
  `;
}

const savedGroup = localStorage.getItem(STORE_KEY) || "student";
renderGroupTabs(savedGroup);
renderGroupContent(savedGroup);

/* ---------- 7. 12周心肺能力提升框架 ---------- */
const weekPlan = [
  { icon: "①", bg: "var(--blue-soft)", t: "第1~4周 · 建立习惯与耐受", v: "每周4天中等强度有氧20~30分钟 + 2天基础力量训练", n: "长期不动者可从10~15分钟开始，不追求速度，只追求连续完成" },
  { icon: "②", bg: "var(--orange-soft)", t: "第5~8周 · 增加总量与功能", v: "有氧逐步增加到每周150分钟左右，可加入1次轻度间歇", n: "若出现胸痛、眩晕、异常气短或持续心悸，立刻停止并评估" },
  { icon: "③", bg: "var(--green-soft)", t: "第9~12周 · 巩固心肺适能", v: "总量维持在每周150~300分钟，保留2天力量训练", n: "身体状态稳定者可每周安排1次稍高强度训练；彻夜未眠/发热恢复期不做高强度" },
  { icon: "📐", bg: "var(--indigo-soft)", t: "运动处方六要素（FITT-VP）", v: "频率：有氧3~5次/周，抗阻2~3次/周 · 强度：中等50~70%最大心率", n: "总量：WHO推荐每周≥150分钟中等强度或75分钟高强度有氧；每1~3个月重新评估调整方案" },
];

document.getElementById("weekPlan").innerHTML = weekPlan.map(w => `
  <div class="iosrow">
    <div class="iosrow-icon" style="background:${w.bg}">${w.icon}</div>
    <div><div class="iosrow-t">${w.t}</div><div class="iosrow-v">${w.v}</div><div class="iosrow-n">${w.n}</div></div>
  </div>`).join("");

/* ---------- 8. 常见误区纠偏 ---------- */
const myths = [
  { x: "年轻人不会心梗/脑梗/猝死", o: "遗传性心肌病、心律失常、吸烟、兴奋剂、肥胖、感染后心肌问题都可能带来急症，年轻人也要重视家族史和运动中症状" },
  { x: "没有胸痛就不是心脏问题", o: "女性、老年人和糖尿病患者的心梗表现常不典型，无法解释的气短、冷汗、上腹不适、异常疲劳也要警惕" },
  { x: "中风患者先喂水喂药压一压", o: "卒中患者可能吞咽困难，脑出血与脑梗处理不同，应先拨打120记录时间，不喂水不喂药" },
  { x: "掐人中能救猝死", o: "心脏骤停的关键是恢复循环和除颤，不是刺激面部，应立刻做胸外按压并找AED" },
  { x: "电子烟比香烟安全，问题不大", o: "没有任何安全的烟草产品，包括电子烟，最安全的策略是完全不吸" },
  { x: "红酒护心，可以每天喝点", o: "不应为了心血管获益而开始饮酒，总体原则是越少越好，能不喝更好" },
  { x: "补觉一天就能抵消长期熬夜", o: "一次补觉不能完全抵消长期睡眠不足和节律紊乱的影响，维持规律睡眠窗口才是根本" },
  { x: "感冒发烧刚好就能恢复高强度运动", o: "感染后若有胸痛、心悸、气短应警惕心肌炎，恢复运动应循序渐进，发热期间不运动" },
];

document.getElementById("mythGrid").innerHTML = myths.map(m => `
  <div class="mythcard">
    <div class="myth-x">❌ ${m.x}</div>
    <div class="myth-o">✅ ${m.o}</div>
  </div>`).join("");

/* ---------- 8.5 未来7天行动清单 ---------- */
const week7 = [
  { icon: "1", bg: "var(--red-soft)", t: "第1天", v: "量一次血压，记录体重、腰围", n: "并写下家族中是否有人年轻心梗、卒中、猝死" },
  { icon: "2", bg: "var(--orange-soft)", t: "第2天", v: "做一次睡眠盘点", n: "平均睡几小时、是否打鼾、是否白天困、是否经常熬夜" },
  { icon: "3", bg: "var(--teal-soft)", t: "第3天", v: "把含糖饮料、能量饮料和香烟/电子烟", n: "从「常备品」改成「尽量不买」" },
  { icon: "4", bg: "var(--green-soft)", t: "第4天", v: "开始20~30分钟中等强度快走", n: "长期不动者可从10~15分钟开始" },
  { icon: "5", bg: "var(--blue-soft)", t: "第5天", v: "安排一次体检或补做血脂/血糖检查", n: "尤其是年轻上班族与中老年人" },
  { icon: "6", bg: "var(--indigo-soft)", t: "第6天", v: "学会 FAST / 中风120 和徒手 CPR", n: "弄清学校、公司或小区附近 AED 在哪里" },
  { icon: "7", bg: "var(--red-soft)", t: "第7天", v: "把未来4周的睡眠窗口和每周运动时间写进日历", n: "而不是只停留在「想做」" },
];

document.getElementById("week7").innerHTML = week7.map(w => `
  <div class="iosrow">
    <div class="iosrow-icon" style="background:${w.bg}">${w.icon}</div>
    <div><div class="iosrow-t">${w.t}</div><div class="iosrow-v">${w.v}</div><div class="iosrow-n">${w.n}</div></div>
  </div>`).join("");

/* ---------- 9. 家庭/宿舍/办公室行动清单 ---------- */
const actions = [
  { icon: "❤️‍🩹", bg: "var(--red-soft)", t: "学会心肺复苏（CPR）", v: "关键时刻能救家人命的技能", n: "" },
  { icon: "⚡", bg: "var(--orange-soft)", t: "了解身边最近的AED位置", v: "学会使用AED", n: "校内/公司大楼/小区物业通常都有登记" },
  { icon: "🧠", bg: "var(--blue-soft)", t: "记住 FAST / 中风120", v: "能够快速识别脑卒中症状", n: "" },
  { icon: "🏥", bg: "var(--teal-soft)", t: "准备医院名单", v: "当地具备卒中中心/胸痛中心的医院", n: "有备则无患，提前查好路线" },
  { icon: "📋", bg: "var(--green-soft)", t: "建立家庭健康档案", v: "记录每位成员的基础病史、用药情况", n: "" },
  { icon: "🩺", bg: "var(--indigo-soft)", t: "定期体检", v: "不要等「感觉不舒服」才去医院", n: "" },
  { icon: "👴", bg: "var(--orange-soft)", t: "给父母/祖父母的提醒", v: "帮助建立规律服药习惯，绝不可自行停药减药", n: "陪伴运动、关注情绪、冬季保暖、家中备血压计" },
  { icon: "🧑", bg: "var(--red-soft)", t: "给年轻人的提醒", v: "不要觉得「自己年轻不会得心脏病」", n: "戒烟、保证睡眠、不突击式剧烈运动、出现不明原因胸闷心慌尽早就医" },
];

document.getElementById("actionList").innerHTML = actions.map(a => `
  <div class="iosrow">
    <div class="iosrow-icon" style="background:${a.bg}">${a.icon}</div>
    <div><div class="iosrow-t">${a.t}</div><div class="iosrow-v">${a.v}</div>${a.n ? `<div class="iosrow-n">${a.n}</div>` : ""}</div>
  </div>`).join("");
