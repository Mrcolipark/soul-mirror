/**
 * 五行关系分析模块
 * @module WuxingInteractionAnalyzer
 * @author Soul Mirror Team
 * @since 1.0.0
 */

// 传统五行相生循环 - 顺时针方向
const SHENG_RELATIONS = {
  '木': '火',  // 钻木取火
  '火': '土',  // 灰烬成土
  '土': '金',  // 矿藏于土
  '金': '水',  // 金生水珠
  '水': '木'   // 水润木生
};

// 五行相克规律 - 隔位相克
const KE_RELATIONS = {
  '木': '土',  // 根破土
  '火': '金',  // 火炼金
  '土': '水',  // 堤防水
  '金': '木',  // 斧伐木
  '水': '火'   // 水灭火
};

// 反向索引，提升查询性能
const REVERSE_RELATIONS = {
  generateBy: {},
  generateTo: {},
  restrainedBy: {},
  restrainTo: {}
};

// 初始化反向关系
Object.entries(SHENG_RELATIONS).forEach(([from, to]) => {
  REVERSE_RELATIONS.generateBy[to] = from;
  REVERSE_RELATIONS.generateTo[from] = to;
});

Object.entries(KE_RELATIONS).forEach(([from, to]) => {
  REVERSE_RELATIONS.restrainedBy[to] = from;
  REVERSE_RELATIONS.restrainTo[from] = to;
});

// 五行互动的详细解释
const INTERACTION_EXPLANATIONS = {
  // 相生关系的互动解释
  'sheng': {
    '木生火': {
      energy: '🌱→🔥 创新点燃激情',
      description: '木型创新者为火型执行者提供想法燃料',
      programming: '适合木型做架构设计，火型负责快速实现',
      teamwork: '木型人提供创意方向，火型人推动项目执行',
      benefits: '木型获得实现价值，火型获得创新灵感',
      caution: '木型要控制想法输出频率，火型要保护创新来源',
      compatibility: 90
    },
    '火生土': {
      energy: '🔥→🏔️ 激情铸就稳固',
      description: '火型执行者的成果为土型架构师奠定基础',
      programming: '火型快速开发原型，土型完善架构和文档',
      teamwork: '火型人负责突破，土型人负责巩固成果',
      benefits: '火型看到想法落地，土型获得优质基础',
      caution: '火型要注意质量，土型要及时跟进节奏',
      compatibility: 85
    },
    '土生金': {
      energy: '🏔️→⚔️ 稳重孕育精准',
      description: '土型稳重者为金型逻辑家提供扎实基础',
      programming: '土型建立规范流程，金型进行精确优化',
      teamwork: '土型提供稳定环境，金型发挥分析优势',
      benefits: '土型获得精确反馈，金型获得可靠数据',
      caution: '土型要保持开放性，金型要避免过度挑剔',
      compatibility: 88
    },
    '金生水': {
      energy: '⚔️→💧 逻辑催生智慧',
      description: '金型逻辑者的分析为水型智者提供洞察',
      programming: '金型做系统分析，水型提供灵活方案',
      teamwork: '金型提供清晰思路，水型适应复杂情况',
      benefits: '金型看到思路应用，水型获得分析支撑',
      caution: '金型要允许灵活性，水型要重视逻辑基础',
      compatibility: 92
    },
    '水生木': {
      energy: '💧→🌱 智慧滋养创新',
      description: '水型智者的洞察滋养木型创新者的想象',
      programming: '水型分析需求，木型设计创新解决方案',
      teamwork: '水型提供深度理解，木型提供创新突破',
      benefits: '水型看到智慧应用，木型获得深度支撑',
      caution: '水型要避免过度引导，木型要保持独立思考',
      compatibility: 94
    }
  },

  // 相克关系的互动解释
  'ke': {
    '木克土': {
      energy: '🌱⚔️🏔️ 创新冲击稳定',
      description: '木型创新冲击土型传统，带来变革压力',
      programming: '木型推动新技术，可能挑战土型的稳定架构',
      teamwork: '需要平衡创新与稳定，避免过度冲突',
      challenge: '土型感受变化压力，木型可能显得激进',
      resolution: '木型控制变革节奏，土型适度接受新事物',
      compatibility: 65
    },
    '火克金': {
      energy: '🔥⚔️⚔️ 激情压倒理性',
      description: '火型激情可能压倒金型的冷静分析',
      programming: '火型追求速度，可能忽视金型的质量要求',
      teamwork: '需要平衡执行速度与代码质量',
      challenge: '金型感受压力过大，火型认为过于拘谨',
      resolution: '火型尊重分析过程，金型适应快节奏',
      compatibility: 60
    },
    '土克水': {
      energy: '🏔️⚔️💧 稳定限制流动',
      description: '土型稳定性可能限制水型的灵活性',
      programming: '土型重视规范，可能约束水型的创造性方案',
      teamwork: '需要在规范与灵活性间找到平衡',
      challenge: '水型感受束缚，土型担心失控',
      resolution: '土型给予适度空间，水型尊重基本规范',
      compatibility: 70
    },
    '金克木': {
      energy: '⚔️⚔️🌱 逻辑削减创意',
      description: '金型严密逻辑可能削减木型的创新冲动',
      programming: '金型重视可行性分析，可能打击木型创意',
      teamwork: '需要保护创新同时确保可行性',
      challenge: '木型感受批评过多，金型担心不切实际',
      resolution: '金型温和表达观点，木型理性评估创意',
      compatibility: 58
    },
    '水克火': {
      energy: '💧⚔️🔥 智慧冷却激情',
      description: '水型深度思考可能冷却火型的行动激情',
      programming: '水型的全面分析可能延缓火型的执行',
      teamwork: '需要平衡深度思考与快速行动',
      challenge: '火型感受拖延，水型担心盲目行动',
      resolution: '水型适度简化分析，火型给予思考时间',
      compatibility: 55
    }
  },

  // 同类关系的互动解释
  'same': {
    '木木': {
      energy: '🌱🌱 创意共鸣',
      description: '双重创新能量，想法丰富但可能缺乏执行',
      programming: '容易产生大量创新想法，但需要执行力补强',
      teamwork: '头脑风暴效果极佳，但要避免纸上谈兵',
      benefits: '创意无限，互相激发',
      caution: '注意实际执行，避免方向分散',
      compatibility: 75
    },
    '火火': {
      energy: '🔥🔥 激情燃烧',
      description: '双重执行力，推进快速但容易过度消耗',
      programming: '开发速度极快，但要注意可持续性',
      teamwork: '冲劲十足，但要预防团队过劳',
      benefits: '执行力强，效率极高',
      caution: '控制节奏，避免过度燃烧',
      compatibility: 70
    },
    '土土': {
      energy: '🏔️🏔️ 稳如磐石',
      description: '双重稳定性，基础牢固但可能缺乏变化',
      programming: '系统架构稳定，但创新可能不足',
      teamwork: '团队稳定可靠，但要引入新活力',
      benefits: '基础扎实，质量可靠',
      caution: '适度创新，避免过于保守',
      compatibility: 80
    },
    '金金': {
      energy: '⚔️⚔️ 逻辑无敌',
      description: '双重分析力，思考深度但可能过于挑剔',
      programming: '代码质量极高，但可能影响进度',
      teamwork: '分析全面，但要避免过度完美主义',
      benefits: '逻辑清晰，质量保证',
      caution: '平衡完美与效率，避免过度批评',
      compatibility: 78
    },
    '水水': {
      energy: '💧💧 智慧如海',
      description: '双重适应力，灵活变通但可能缺乏方向',
      programming: '适应性强，但需要明确目标导向',
      teamwork: '应变能力强，但要保持专注',
      benefits: '灵活性高，适应性强',
      caution: '明确方向，避免过度变化',
      compatibility: 73
    }
  }
};

// 今日五行时势分析
const DAILY_WUXING_INFLUENCE = {
  // 根据季节确定主导五行
  getSeason: () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return { element: '木', season: '春' };
    if (month >= 6 && month <= 8) return { element: '火', season: '夏' };
    if (month >= 9 && month <= 11) return { element: '金', season: '秋' };
    return { element: '水', season: '冬' };
  },

  // 根据时辰确定当前五行
  getHour: () => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 1) return '水';   // 子时
    if (hour >= 1 && hour < 3) return '土';   // 丑时
    if (hour >= 3 && hour < 5) return '木';   // 寅时
    if (hour >= 5 && hour < 7) return '木';   // 卯时
    if (hour >= 7 && hour < 9) return '土';   // 辰时
    if (hour >= 9 && hour < 11) return '火';  // 巳时
    if (hour >= 11 && hour < 13) return '火'; // 午时
    if (hour >= 13 && hour < 15) return '土'; // 未时
    if (hour >= 15 && hour < 17) return '金'; // 申时
    if (hour >= 17 && hour < 19) return '金'; // 酉时
    if (hour >= 19 && hour < 21) return '土'; // 戌时
    if (hour >= 21 && hour < 23) return '水'; // 亥时
    return '土';
  }
};

class WuxingInteractionAnalyzer {
  constructor() {
    this.shengRelations = SHENG_RELATIONS;
    this.keRelations = KE_RELATIONS;
    this.reverseRelations = REVERSE_RELATIONS;
    this.explanations = INTERACTION_EXPLANATIONS;
    this.dailyInfluence = DAILY_WUXING_INFLUENCE;
  }

  /**
   * 分析两个五行属性的互动关系
   * @param {string} wuxing1 - 第一个五行属性
   * @param {string} wuxing2 - 第二个五行属性
   * @returns {Object} 互动分析结果
   */
  analyzeInteraction(wuxing1, wuxing2) {
    if (wuxing1 === wuxing2) {
      return this._analyzeSameInteraction(wuxing1);
    }

    // 检查相生关系
    if (this.shengRelations[wuxing1] === wuxing2) {
      return this._analyzeShengInteraction(wuxing1, wuxing2, 'active');
    }
    if (this.shengRelations[wuxing2] === wuxing1) {
      return this._analyzeShengInteraction(wuxing2, wuxing1, 'passive');
    }

    // 检查相克关系
    if (this.keRelations[wuxing1] === wuxing2) {
      return this._analyzeKeInteraction(wuxing1, wuxing2, 'active');
    }
    if (this.keRelations[wuxing2] === wuxing1) {
      return this._analyzeKeInteraction(wuxing2, wuxing1, 'passive');
    }

    // 其他关系（间接关系）
    return this._analyzeIndirectInteraction(wuxing1, wuxing2);
  }

  /**
   * 获取今日五行时势影响
   * @param {string} personalWuxing - 个人五行属性
   * @returns {Object} 今日时势分析
   */
  getTodayInfluence(personalWuxing) {
    const seasonalInfluence = this.dailyInfluence.getSeason();
    const hourlyInfluence = this.dailyInfluence.getHour();
    const currentTime = new Date();
    
    // 分析个人五行与季节五行的关系
    const seasonalInteraction = this.analyzeInteraction(personalWuxing, seasonalInfluence.element);
    
    // 分析个人五行与时辰五行的关系
    const hourlyInteraction = this.analyzeInteraction(personalWuxing, hourlyInfluence);
    
    return {
      personal: personalWuxing,
      seasonal: seasonalInfluence,
      hourly: hourlyInfluence,
      seasonalEffect: seasonalInteraction,
      hourlyEffect: hourlyInteraction,
      overallAdvice: this._generateTodayAdvice(personalWuxing, seasonalInfluence, hourlyInfluence),
      timestamp: currentTime.toISOString()
    };
  }

  /**
   * 分析相生关系互动
   * @private
   */
  _analyzeShengInteraction(generator, receiver, role) {
    const key = `${generator}生${receiver}`;
    const explanation = this.explanations.sheng[key];
    
    return {
      type: 'sheng',
      generator: generator,
      receiver: receiver,
      role: role, // active: 我生对方, passive: 对方生我
      relationship: role === 'active' ? '支持' : '受益',
      ...explanation,
      advice: role === 'active' ? 
        `作为${generator}型，你能为${receiver}型提供支持，但要注意自己的消耗` :
        `作为${receiver}型，你能从${generator}型获得支持，要珍惜这种关系`
    };
  }

  /**
   * 分析相克关系互动
   * @private
   */
  _analyzeKeInteraction(restrainer, restrained, role) {
    const key = `${restrainer}克${restrained}`;
    const explanation = this.explanations.ke[key];
    
    return {
      type: 'ke',
      restrainer: restrainer,
      restrained: restrained,
      role: role, // active: 我克对方, passive: 对方克我
      relationship: role === 'active' ? '压制' : '被制约',
      ...explanation,
      advice: role === 'active' ? 
        `作为${restrainer}型，你可能对${restrained}型形成压力，要注意温和沟通` :
        `作为${restrained}型，你可能感受到${restrainer}型的压力，要学会适应和反馈`
    };
  }

  /**
   * 分析同类关系互动
   * @private
   */
  _analyzeSameInteraction(wuxing) {
    const key = `${wuxing}${wuxing}`;
    const explanation = this.explanations.same[key];
    
    return {
      type: 'same',
      element: wuxing,
      relationship: '同类共鸣',
      ...explanation,
      advice: `同为${wuxing}型，你们能产生强烈共鸣，但要注意互补不足的方面`
    };
  }

  /**
   * 分析间接关系互动
   * @private
   */
  _analyzeIndirectInteraction(wuxing1, wuxing2) {
    // 找到两者的共同相生或相克点
    const commonGenerated = this._findCommonGenerated(wuxing1, wuxing2);
    const commonRestraint = this._findCommonRestraint(wuxing1, wuxing2);
    
    return {
      type: 'indirect',
      element1: wuxing1,
      element2: wuxing2,
      relationship: '间接关系',
      commonGenerated: commonGenerated,
      commonRestraint: commonRestraint,
      energy: '🔄 间接互动',
      description: `${wuxing1}型与${wuxing2}型之间是间接关系`,
      advice: '你们可以通过共同目标和互补优势来建立良好合作',
      compatibility: 65
    };
  }

  /**
   * 寻找共同生成的元素
   * @private
   */
  _findCommonGenerated(wuxing1, wuxing2) {
    const generated1 = this.shengRelations[wuxing1];
    const generated2 = this.shengRelations[wuxing2];
    
    if (generated1 === generated2) {
      return generated1;
    }
    return null;
  }

  /**
   * 寻找共同克制的元素
   * @private
   */
  _findCommonRestraint(wuxing1, wuxing2) {
    const restrained1 = this.keRelations[wuxing1];
    const restrained2 = this.keRelations[wuxing2];
    
    if (restrained1 === restrained2) {
      return restrained1;
    }
    return null;
  }

  /**
   * 生成今日综合建议
   * @private
   */
  _generateTodayAdvice(personalWuxing, seasonal, hourly) {
    const advice = [];
    
    // 季节影响建议
    if (seasonal.element === personalWuxing) {
      advice.push(`🌟 ${seasonal.season}季${personalWuxing}性当令，是发挥天赋的绝佳时机`);
    } else {
      const seasonalRelation = this.analyzeInteraction(personalWuxing, seasonal.element);
      if (seasonalRelation.type === 'sheng') {
        advice.push(`🌱 ${seasonal.season}季有利于${personalWuxing}型发展，要积极把握机会`);
      } else if (seasonalRelation.type === 'ke') {
        advice.push(`⚠️ ${seasonal.season}季对${personalWuxing}型有挑战，需要小心应对`);
      }
    }
    
    // 时辰影响建议
    const hourlyRelation = this.analyzeInteraction(personalWuxing, hourly);
    if (hourlyRelation.type === 'sheng' && hourlyRelation.role === 'passive') {
      advice.push(`💫 当前时辰有利于${personalWuxing}型，适合重要工作`);
    } else if (hourlyRelation.type === 'ke' && hourlyRelation.role === 'passive') {
      advice.push(`🕐 当前时辰需要${personalWuxing}型多加小心，避免冲动决策`);
    }
    
    return advice.length > 0 ? advice.join('；') : `保持${personalWuxing}型特质，稳步前进`;
  }

  /**
   * 获取五行完整关系网络
   * @param {string} wuxing - 五行属性
   * @returns {Object} 完整的关系网络
   */
  getRelationshipNetwork(wuxing) {
    return {
      element: wuxing,
      generates: this.shengRelations[wuxing],           // 我生谁
      generatedBy: this.reverseRelations.generateBy[wuxing], // 谁生我
      restrains: this.keRelations[wuxing],             // 我克谁
      restrainedBy: this.reverseRelations.restrainedBy[wuxing], // 谁克我
      interactions: {
        supportive: this.reverseRelations.generateBy[wuxing], // 支持我的
        beneficial: this.shengRelations[wuxing],              // 我支持的
        challenging: this.reverseRelations.restrainedBy[wuxing], // 挑战我的
        controlled: this.keRelations[wuxing]                  // 我控制的
      }
    };
  }
}

module.exports = {
  WuxingInteractionAnalyzer,
  SHENG_RELATIONS,
  KE_RELATIONS,
  INTERACTION_EXPLANATIONS,
  DAILY_WUXING_INFLUENCE
};