const { Solar, Lunar } = require('../lunar.js');

// 天干五行对应关系
const TIANGAN_WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水'
};

// 地支藏干映射表（专业排盘标准）
const DIZHI_CANGGAN = {
  '子': [{ gan: '癸', strength: 1.0 }],           // 子藏癸水
  '丑': [                                         // 丑藏己土、癸水、辛金（己为主气）
    { gan: '己', strength: 0.6 },
    { gan: '癸', strength: 0.3 },
    { gan: '辛', strength: 0.1 }
  ],
  '寅': [                                         // 寅藏甲木、丙火、戊土（甲为主气）
    { gan: '甲', strength: 0.6 },
    { gan: '丙', strength: 0.3 },
    { gan: '戊', strength: 0.1 }
  ],
  '卯': [{ gan: '乙', strength: 1.0 }],           // 卯藏乙木
  '辰': [                                         // 辰藏戊土、乙木、癸水（戊为主气）
    { gan: '戊', strength: 0.6 },
    { gan: '乙', strength: 0.3 },
    { gan: '癸', strength: 0.1 }
  ],
  '巳': [                                         // 巳藏丙火、庚金、戊土（丙为主气）
    { gan: '丙', strength: 0.6 },
    { gan: '庚', strength: 0.3 },
    { gan: '戊', strength: 0.1 }
  ],
  '午': [                                         // 午藏丁火、己土（丁为主气）
    { gan: '丁', strength: 0.7 },
    { gan: '己', strength: 0.3 }
  ],
  '未': [                                         // 未藏己土、丁火、乙木（己为主气）
    { gan: '己', strength: 0.6 },
    { gan: '丁', strength: 0.3 },
    { gan: '乙', strength: 0.1 }
  ],
  '申': [                                         // 申藏庚金、壬水、戊土（庚为主气）
    { gan: '庚', strength: 0.6 },
    { gan: '壬', strength: 0.3 },
    { gan: '戊', strength: 0.1 }
  ],
  '酉': [{ gan: '辛', strength: 1.0 }],           // 酉藏辛金
  '戌': [                                         // 戌藏戊土、辛金、丁火（戊为主气）
    { gan: '戊', strength: 0.6 },
    { gan: '辛', strength: 0.3 },
    { gan: '丁', strength: 0.1 }
  ],
  '亥': [                                         // 亥藏壬水、甲木（壬为主气）
    { gan: '壬', strength: 0.7 },
    { gan: '甲', strength: 0.3 }
  ]
};

// 季节调节系数（专业命理学）
const SEASONAL_STRENGTH = {
  '春': { 木: 1.2, 火: 1.0, 土: 0.8, 金: 0.6, 水: 0.9 },  // 春季木旺
  '夏': { 木: 0.9, 火: 1.2, 土: 1.0, 金: 0.6, 水: 0.7 },  // 夏季火旺
  '秋': { 木: 0.6, 火: 0.8, 土: 1.0, 金: 1.2, 水: 0.9 },  // 秋季金旺
  '冬': { 木: 0.7, 火: 0.6, 土: 0.8, 金: 0.9, 水: 1.2 }   // 冬季水旺
};

// 程序员类型映射
const PROGRAMMER_TYPES = {
  '木': { name: '🌱 创新开拓者', desc: '充满创意，善于开辟新领域' },
  '火': { name: '🔥 激情冲锋者', desc: '热情洋溢，执行力强' },
  '土': { name: '🏔️ 稳重架构师', desc: '踏实可靠，善于构建稳定系统' },
  '金': { name: '⚔️ 逻辑大师', desc: '思维缜密，追求完美代码' },
  '水': { name: '💧 灵活变通者', desc: '适应力强，善于解决复杂问题' }
};

// 八卦对应表（标准梅花易数）
const BAGUA_MAPPING = {
  0: { name: '坤', symbol: '☷', nature: '地' },  // 8 -> 0 (余数为0时)
  1: { name: '乾', symbol: '☰', nature: '天' },
  2: { name: '兑', symbol: '☱', nature: '泽' },
  3: { name: '离', symbol: '☲', nature: '火' },
  4: { name: '震', symbol: '☳', nature: '雷' },
  5: { name: '巽', symbol: '☴', nature: '风' },
  6: { name: '坎', symbol: '☵', nature: '水' },
  7: { name: '艮', symbol: '☶', nature: '山' }
};

// 完整64卦表（标准顺序：上卦×8+下卦）
const SIXTY_FOUR_GUA = [
  // 坤宫八卦 (上卦坤☷)
  { name: '坤为地', symbol: '☷☷', meaning: '厚德载物，包容承载' },
  { name: '地天泰', symbol: '☷☰', meaning: '天地交泰，万事亨通' },
  { name: '地泽临', symbol: '☷☱', meaning: '居高临下，领导有方' },
  { name: '地火明夷', symbol: '☷☲', meaning: '韬光养晦，等待时机' },
  { name: '地雷复', symbol: '☷☳', meaning: '一元复始，万象更新' },
  { name: '地风升', symbol: '☷☴', meaning: '步步高升，循序渐进' },
  { name: '地水师', symbol: '☷☵', meaning: '统筹规划，团队协作' },
  { name: '地山谦', symbol: '☷☶', meaning: '谦虚谨慎，稳步前进' },
  
  // 乾宫八卦 (上卦乾☰)
  { name: '天地否', symbol: '☰☷', meaning: '阻塞不通，等待转机' },
  { name: '乾为天', symbol: '☰☰', meaning: '刚健进取，自强不息' },
  { name: '天泽履', symbol: '☰☱', meaning: '礼行天下，谨慎行事' },
  { name: '天火同人', symbol: '☰☲', meaning: '团结协作，和谐共进' },
  { name: '天雷无妄', symbol: '☰☳', meaning: '顺应自然，真诚无伪' },
  { name: '天风姤', symbol: '☰☴', meaning: '相遇际会，把握机缘' },
  { name: '天水讼', symbol: '☰☵', meaning: '争议纷争，慎重处理' },
  { name: '天山遁', symbol: '☰☶', meaning: '适时退避，保存实力' },
  
  // 兑宫八卦 (上卦兑☱)
  { name: '泽地萃', symbol: '☱☷', meaning: '聚集团结，集思广益' },
  { name: '泽天夬', symbol: '☱☰', meaning: '决断果敢，除旧布新' },
  { name: '兑为泽', symbol: '☱☱', meaning: '喜悦和谐，善于沟通' },
  { name: '泽火革', symbol: '☱☲', meaning: '变革创新，改旧换新' },
  { name: '泽雷随', symbol: '☱☳', meaning: '顺势而为，随机应变' },
  { name: '泽风大过', symbol: '☱☴', meaning: '过度超越，需要节制' },
  { name: '泽水困', symbol: '☱☵', meaning: '困境中坚持，等待转机' },
  { name: '泽山咸', symbol: '☱☶', meaning: '相互感应，心有灵犀' },
  
  // 离宫八卦 (上卦离☲)
  { name: '火地晋', symbol: '☲☷', meaning: '晋升有道，前程似锦' },
  { name: '火天大有', symbol: '☲☰', meaning: '成果丰硕，事业有成' },
  { name: '火泽睽', symbol: '☲☱', meaning: '求同存异，化解分歧' },
  { name: '离为火', symbol: '☲☲', meaning: '光明磊落，照亮前程' },
  { name: '火雷噬嗑', symbol: '☲☳', meaning: '排除障碍，执法严明' },
  { name: '火风鼎', symbol: '☲☴', meaning: '推陈出新，开创新局' },
  { name: '火水未济', symbol: '☲☵', meaning: '尚需努力，继续前进' },
  { name: '火山旅', symbol: '☲☶', meaning: '行者无疆，开拓视野' },
  
  // 震宫八卦 (上卦震☳)
  { name: '雷地豫', symbol: '☳☷', meaning: '顺应时势，快乐前行' },
  { name: '雷天大壮', symbol: '☳☰', meaning: '声势浩大，勇往直前' },
  { name: '雷泽归妹', symbol: '☳☱', meaning: '适可而止，见好就收' },
  { name: '雷火丰', symbol: '☳☲', meaning: '丰收在望，成果丰硕' },
  { name: '震为雷', symbol: '☳☳', meaning: '震撼出击，快速行动' },
  { name: '雷风恒', symbol: '☳☴', meaning: '持之以恒，循序渐进' },
  { name: '雷水解', symbol: '☳☵', meaning: '化解危机，柳暗花明' },
  { name: '雷山小过', symbol: '☳☶', meaning: '小心谨慎，不可大意' },
  
  // 巽宫八卦 (上卦巽☴)
  { name: '风地观', symbol: '☴☷', meaning: '观察入微，洞察先机' },
  { name: '风天小畜', symbol: '☴☰', meaning: '积少成多，蓄势待发' },
  { name: '风泽中孚', symbol: '☴☱', meaning: '诚信为本，以心相交' },
  { name: '风火家人', symbol: '☴☲', meaning: '家和万事兴，团队和谐' },
  { name: '风雷益', symbol: '☴☳', meaning: '互惠互利，共同进步' },
  { name: '巽为风', symbol: '☴☴', meaning: '顺风而行，因势利导' },
  { name: '风水涣', symbol: '☴☵', meaning: '化解僵局，重新开始' },
  { name: '风山渐', symbol: '☴☶', meaning: '循序渐进，稳步发展' },
  
  // 坎宫八卦 (上卦坎☵)
  { name: '水地比', symbol: '☵☷', meaning: '亲密合作，互相支持' },
  { name: '水天需', symbol: '☵☰', meaning: '耐心等待，把握时机' },
  { name: '水泽节', symbol: '☵☱', meaning: '节制有度，张弛有道' },
  { name: '水火既济', symbol: '☵☲', meaning: '功成名就，圆满完成' },
  { name: '水雷屯', symbol: '☵☳', meaning: '万物初生，循序渐进' },
  { name: '水风井', symbol: '☵☴', meaning: '深挖潜力，源源不断' },
  { name: '坎为水', symbol: '☵☵', meaning: '险中求胜，迎难而上' },
  { name: '水山蹇', symbol: '☵☶', meaning: '知难而进，克服困难' },
  
  // 艮宫八卦 (上卦艮☶)
  { name: '山地剥', symbol: '☶☷', meaning: '去旧迎新，蜕变重生' },
  { name: '山天大畜', symbol: '☶☰', meaning: '积累实力，厚积薄发' },
  { name: '山泽损', symbol: '☶☱', meaning: '损己利人，合理取舍' },
  { name: '山火贲', symbol: '☶☲', meaning: '文质彬彬，内外兼修' },
  { name: '山雷颐', symbol: '☶☳', meaning: '养精蓄锐，自我修养' },
  { name: '山风蛊', symbol: '☶☴', meaning: '整顿改革，推陈出新' },
  { name: '山水蒙', symbol: '☶☵', meaning: '启蒙教化，循循善诱' },
  { name: '艮为山', symbol: '☶☶', meaning: '稳如泰山，坚守原则' }
];

// 程序员专属每日卦象解读
const PROGRAMMER_DAILY_ADVICE = {
  '乾为天': {
    todayFocus: '🚀 技术领导日',
    codeAdvice: '适合主导架构设计，推进重要技术决策',
    teamAdvice: '发挥技术影响力，指导团队方向',
    avoid: '避免过于激进的技术选型'
  },
  '坤为地': {
    todayFocus: '🤝 团队协作日',
    codeAdvice: '专注基础功能实现，完善文档注释',
    teamAdvice: '耐心支持团队成员，做好协调工作',
    avoid: '避免独自承担过多任务'
  },
  '泽火革': {
    todayFocus: '🔄 重构优化日',
    codeAdvice: '适合重构老代码，优化系统架构',
    teamAdvice: '推动技术变革，改进开发流程',
    avoid: '避免一次性改动过多模块'
  },
  '雷风恒': {
    todayFocus: '⚡ 持续开发日',
    codeAdvice: '专注长期项目，稳步推进功能',
    teamAdvice: '保持开发节奏，重视代码质量',
    avoid: '避免急于求成，忽视测试'
  },
  '天泽履': {
    todayFocus: '📋 规范执行日',
    codeAdvice: '严格按照编码规范，注重代码review',
    teamAdvice: '推进流程规范，建立最佳实践',
    avoid: '避免忽视团队约定的规范'
  },
  '水火既济': {
    todayFocus: '✅ 项目收尾日',
    codeAdvice: '适合完成收尾工作，部署上线',
    teamAdvice: '总结项目经验，庆祝团队成就',
    avoid: '避免在成功时忽视潜在风险'
  },
  '风山渐': {
    todayFocus: '📈 稳步提升日',
    codeAdvice: '循序渐进优化代码，小步快跑',
    teamAdvice: '通过Code Review传承经验',
    avoid: '避免急于求成的大幅修改'
  },
  '火水未济': {
    todayFocus: '🔧 调试修复日',
    codeAdvice: '专注bug修复，完善异常处理',
    teamAdvice: '加强测试，提升系统稳定性',
    avoid: '避免引入新功能，专注修复'
  },
  '山泽损': {
    todayFocus: '✂️ 代码精简日',
    codeAdvice: '删除冗余代码，优化性能瓶颈',
    teamAdvice: '精简流程，提高开发效率',
    avoid: '避免过度优化影响可读性'
  },
  '风雷益': {
    todayFocus: '🤝 知识共享日',
    codeAdvice: '适合技术分享，编写技术文档',
    teamAdvice: '组织学习会，互相促进成长',
    avoid: '避免闭门造车，多与他人交流'
  }
};

/**
 * 八字计算器 - 专业的四柱八字计算
 */
class BaziCalculator {
  constructor() {
    // 使用 lunar.js
  }

  /**
   * 计算八字
   * @param {string} birthday - 生日 YYYY-MM-DD
   * @param {number} hour - 小时 0-23
   * @returns {Object} 八字信息
   */
  calculateBazi(birthday, hour) {
    // 增强的输入验证和标准化
    if (typeof birthday !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthday)) {
      throw new Error(`Invalid birthday format: ${birthday}. Expected YYYY-MM-DD`);
    }
    
    const numHour = Number(hour);
    if (isNaN(numHour) || numHour < 0 || numHour > 23) {
      throw new Error(`Invalid hour: ${hour}. Expected number 0-23`);
    }
    
    const [year, month, day] = birthday.split('-').map(Number);
    
    // 验证日期有效性
    if (year < 1000 || year > 9999) {
      throw new Error(`Invalid year: ${year}`);
    }
    if (month < 1 || month > 12) {
      throw new Error(`Invalid month: ${month}`);
    }
    if (day < 1 || day > 31) {
      throw new Error(`Invalid day: ${day}`);
    }
    
    // 强制使用精确的时间参数，避免浮点数精度问题
    const exactHour = Math.floor(numHour);
    const exactMinute = 0;
    const exactSecond = 0;
    
    // 创建Solar对象时使用固定的参数，避免系统时间影响
    const solar = Solar.fromYmdHms(year, month, day, exactHour, exactMinute, exactSecond);
    const lunar = solar.getLunar();
    
    // 为调试目的记录关键信息
    const debugInfo = {
      inputBirthday: birthday,
      inputHour: hour,
      parsedYear: year,
      parsedMonth: month,
      parsedDay: day,
      exactHour: exactHour,
      solarDateTime: solar.toYmdHms(),
      lunarDate: `${lunar.getYear()}-${lunar.getMonth()}-${lunar.getDay()}`,
      systemTimezone: new Date().getTimezoneOffset()
    };
    
    const result = {
      year: lunar.getYearInGanZhi(),
      month: lunar.getMonthInGanZhi(),
      day: lunar.getDayInGanZhi(),
      hour: lunar.getTimeInGanZhi(),
      lunar: lunar,
      _debug: debugInfo  // 调试信息，通常不显示给用户
    };
    
    // 在开发环境中记录调试信息以帮助诊断问题
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG_BAZI) {
      console.debug('BaziCalculator Debug:', JSON.stringify(debugInfo, null, 2));
      console.debug('Result:', `${result.year} ${result.month} ${result.day} ${result.hour}`);
    }
    
    return result;
  }

  /**
   * 专业五行分析（含地支藏干和季节调节）
   * @param {Object} bazi - 八字对象
   * @returns {Object} 五行分析结果
   */
  analyzeWuxing(bazi) {
    const scores = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const tianganCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const dizhiCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
    const details = [];
    
    // 获取当前月份和日期用于季节调节（基于系统时间）
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Date.getMonth() 返回0-11，需要+1
    const currentDay = currentDate.getDate();
    const season = this._getSeason(currentMonth, currentDay);
    
    // 分析天干（四个天干，每个权重1.0）
    const tiangans = [bazi.year[0], bazi.month[0], bazi.day[0], bazi.hour[0]];
    const positions = ['年干', '月干', '日干', '时干'];
    
    tiangans.forEach((gan, index) => {
      const wuxing = TIANGAN_WUXING[gan];
      if (wuxing) {
        const seasonalBonus = SEASONAL_STRENGTH[season][wuxing];
        const finalScore = 1.0 * seasonalBonus;
        
        scores[wuxing] += finalScore;
        tianganCount[wuxing] += 1;
        
        details.push({
          position: positions[index],
          char: gan,
          wuxing: wuxing,
          baseScore: 1.0,
          seasonalBonus: seasonalBonus,
          finalScore: finalScore
        });
      }
    });
    
    // 分析地支藏干（四个地支，按藏干强度计算）
    const dizhis = [bazi.year[1], bazi.month[1], bazi.day[1], bazi.hour[1]];
    const dizhiPositions = ['年支', '月支', '日支', '时支'];
    
    dizhis.forEach((zhi, index) => {
      const cangganList = DIZHI_CANGGAN[zhi];
      if (cangganList) {
        cangganList.forEach(canggan => {
          const wuxing = TIANGAN_WUXING[canggan.gan];
          if (wuxing) {
            const seasonalBonus = SEASONAL_STRENGTH[season][wuxing];
            const finalScore = canggan.strength * seasonalBonus;
            
            scores[wuxing] += finalScore;
            dizhiCount[wuxing] += canggan.strength;
            
            details.push({
              position: `${dizhiPositions[index]}(${zhi}藏${canggan.gan})`,
              char: canggan.gan,
              wuxing: wuxing,
              baseScore: canggan.strength,
              seasonalBonus: seasonalBonus,
              finalScore: finalScore
            });
          }
        });
      }
    });
    
    // 计算总分和比例
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const percentages = {};
    Object.entries(scores).forEach(([element, score]) => {
      percentages[element] = Math.round((score / totalScore) * 100);
    });
    
    // 找出主导元素
    let dominant = '土';
    let maxScore = 0;
    for (const [element, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        dominant = element;
      }
    }
    
    return {
      scores: scores,                    // 加权后的分数
      percentages: percentages,          // 百分比
      totalScore: totalScore,            // 总分
      dominant: dominant,                // 主导元素
      programmerType: PROGRAMMER_TYPES[dominant],
      tianganCount: tianganCount,        // 天干统计
      dizhiCount: dizhiCount,           // 地支统计
      season: season,                    // 当前季节
      details: details                   // 详细分解
    };
  }
  
  /**
   * 根据月份和日期获取准确季节（基于节气）
   * @private
   */
  _getSeason(month, day = 15) {
    // 基于传统节气的季节划分，更准确
    if (month === 2 && day >= 4 || month === 3 || month === 4 || month === 5 && day < 6) return '春';
    if (month === 5 && day >= 6 || month === 6 || month === 7 || month === 8 && day < 8) return '夏';
    if (month === 8 && day >= 8 || month === 9 || month === 10 || month === 11 && day < 7) return '秋';
    return '冬';
  }

  /**
   * 标准梅花易数时间起卦法（每日卦象）
   * @param {Object} bazi - 八字对象（主要用于获取lunar对象）
   * @returns {Object} 卦象信息
   */
  getTodayGua(bazi) {
    const today = new Date();
    
    // 转换为农历时间（使用lunar.js）
    const solar = Solar.fromDate(today);
    const lunar = solar.getLunar();
    
    // 获取农历年月日时
    const lunarYear = lunar.getYear();
    const lunarMonth = lunar.getMonth();
    const lunarDay = lunar.getDay();
    const hour = today.getHours();
    
    // 转换为12时辰 (0-11)
    const shiChen = Math.floor((hour + 1) / 2) % 12;
    
    // 梅花易数标准算法
    let shangGua = (lunarYear + lunarMonth + lunarDay) % 8;
    let xiaGua = (lunarYear + lunarMonth + lunarDay + shiChen) % 8;
    const dongYao = (lunarYear + lunarMonth + lunarDay + shiChen) % 6 + 1; // 变爻(1-6)
    
    // 确保索引有效（余数为0时取8，对应坤卦）
    if (shangGua === 0) shangGua = 8;
    if (xiaGua === 0) xiaGua = 8;
    
    // 转换为数组索引 (0-7)
    const shangGuaIndex = shangGua - 1;
    const xiaGuaIndex = xiaGua - 1;
    
    // 组合成64卦索引 (0-63)
    const guaIndex = shangGuaIndex * 8 + xiaGuaIndex;
    
    return this._buildGuaResult(shangGuaIndex, xiaGuaIndex, dongYao, guaIndex, {
      lunarYear,
      lunarMonth,
      lunarDay,
      shiChen,
      hour
    });
  }
  
  /**
   * 构建卦象结果
   * @private
   */
  _buildGuaResult(shangGuaIndex, xiaGuaIndex, dongYao, guaIndex, timeInfo) {
    const gua = SIXTY_FOUR_GUA[guaIndex];
    const shangBagua = BAGUA_MAPPING[shangGuaIndex];
    const xiaBagua = BAGUA_MAPPING[xiaGuaIndex];
    
    // 获取程序员专属解读
    const dailyAdvice = PROGRAMMER_DAILY_ADVICE[gua.name] || this._getDefaultAdvice(gua.meaning);
    
    return {
      name: gua.name,
      symbol: gua.symbol,
      meaning: gua.meaning,
      shangBagua: shangBagua,        // 上卦信息
      xiaBagua: xiaBagua,            // 下卦信息
      dongYao: dongYao,              // 变爻
      todayFocus: dailyAdvice.todayFocus,
      codeAdvice: dailyAdvice.codeAdvice,
      teamAdvice: dailyAdvice.teamAdvice,
      avoid: dailyAdvice.avoid,
      timeInfo: timeInfo,            // 起卦时间信息
      programmerAdvice: [            // 兼容旧格式
        dailyAdvice.codeAdvice,
        dailyAdvice.teamAdvice,
        `注意: ${dailyAdvice.avoid}`
      ]
    };
  }
  
  /**
   * 获取默认程序员建议（未在专属列表中的卦）
   * @private
   */
  _getDefaultAdvice(meaning) {
    // 根据卦意生成通用程序员建议
    if (meaning.includes('进取') || meaning.includes('前进')) {
      return {
        todayFocus: '🚀 积极开发日',
        codeAdvice: '适合推进新功能，实现创新想法',
        teamAdvice: '主动承担挑战，带领团队前进',
        avoid: '避免过于冒进，注意代码质量'
      };
    } else if (meaning.includes('谨慎') || meaning.includes('小心')) {
      return {
        todayFocus: '🔍 谨慎开发日',
        codeAdvice: '仔细review代码，加强测试覆盖',
        teamAdvice: '做好风险评估，稳步推进',
        avoid: '避免激进的技术变更'
      };
    } else if (meaning.includes('合作') || meaning.includes('团结')) {
      return {
        todayFocus: '🤝 团队协作日',
        codeAdvice: '适合结对编程，知识分享',
        teamAdvice: '加强团队沟通，协同解决问题',
        avoid: '避免独自承担过多工作'
      };
    } else {
      return {
        todayFocus: '⚡ 稳步开发日',
        codeAdvice: '保持编码节奏，专注当前任务',
        teamAdvice: '维护团队稳定，持续改进',
        avoid: '避免急于求成，重视过程'
      };
    }
  }

  /**
   * 获取干支的甲子序号
   * @private
   */
  _getGanZhiIndex(ganZhi) {
    const gan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const zhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    
    const ganIndex = gan.indexOf(ganZhi[0]);
    const zhiIndex = zhi.indexOf(ganZhi[1]);
    
    // 计算甲子序号 (0-59)
    for (let i = 0; i < 60; i++) {
      if (gan[i % 10] === ganZhi[0] && zhi[i % 12] === ganZhi[1]) {
        return i;
      }
    }
    return 0;
  }

  /**
   * 生成程序员建议
   * @private
   */
  _generateProgrammerAdvice(guaName, meaning) {
    const adviceMap = {
      '雷风恒': [
        '🎯 适合长期项目的稳步推进',
        '⚡ 避免急于求成，重视代码质量',
        '🔄 持续重构，逐步优化'
      ],
      '乾为天': [
        '💪 适合挑战高难度技术难题',
        '🚀 主导新项目，展现领导力',
        '⭐ 追求卓越，不断突破自我'
      ],
      '坤为地': [
        '🤝 适合团队协作，发挥支撑作用',
        '📚 夯实基础，完善文档',
        '🌱 培养新人，传承经验'
      ],
      '地天泰': [
        '✨ 项目进展顺利，适合推进关键功能',
        '🎊 团队氛围和谐，沟通效率高',
        '📈 可以申请加薪或晋升'
      ],
      '水火既济': [
        '✅ 适合完成收尾工作',
        '🎯 项目即将圆满完成',
        '🎉 准备庆祝成功'
      ]
    };

    // 如果有特定建议就返回，否则生成通用建议
    if (adviceMap[guaName]) {
      return adviceMap[guaName];
    }

    // 根据卦意生成通用建议
    const advice = [];
    if (meaning.includes('谨慎') || meaning.includes('小心')) {
      advice.push('🔍 仔细review代码，避免低级错误');
      advice.push('💾 及时备份，做好版本控制');
      advice.push('🧪 加强测试，确保稳定性');
    } else if (meaning.includes('前进') || meaning.includes('进步')) {
      advice.push('🚀 适合学习新技术，提升技能');
      advice.push('💡 大胆创新，尝试新方案');
      advice.push('📈 推进重要feature的开发');
    } else if (meaning.includes('合作') || meaning.includes('团')) {
      advice.push('🤝 加强团队沟通，统一认识');
      advice.push('👥 结对编程，知识共享');
      advice.push('🎯 明确分工，协同推进');
    } else {
      advice.push('⚡ 保持专注，提高效率');
      advice.push('🎯 明确目标，有序推进');
      advice.push('💪 持续学习，稳步提升');
    }
    
    return advice;
  }

}

module.exports = BaziCalculator;
