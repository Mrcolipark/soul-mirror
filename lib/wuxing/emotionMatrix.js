/**
 * 五行 × 情绪的 5×8 文案模板矩阵
 * 为不同五行属性的人在不同情绪状态下提供个性化建议
 */

// 五行 × 情绪矩阵建议
const WUXING_EMOTION_MATRIX = {
  // 木 × 8种情绪
  '木': {
    '高兴': {
      energy: '🌱 木生火，你的创新能量正在燃烧',
      advice: '趁势推进新项目，你的创造力现在最强',
      code: '适合探索新技术栈，设计创新架构',
      caution: '控制节奏，避免过度消耗创造力'
    },
    '愤怒': {
      energy: '🔥 木火相生，愤怒转化为行动力',
      advice: '将愤怒转化为改进动力，推动积极变革',
      code: '适合重构技术债务，推进架构优化',
      caution: '避免冲动决策，保持理性思考'
    },
    '悲伤': {
      energy: '💧 金克木，需要水的滋养来恢复',
      advice: '寻找学习新知识来重新激发兴趣',
      code: '专注熟悉的技术领域，避免学习压力',
      caution: '避免自我怀疑，相信自己的创新能力'
    },
    '焦虑': {
      energy: '🌪️ 木气不稳，需要土的稳定支撑',
      advice: '回到基础工作，通过小成就建立信心',
      code: '专注代码质量，通过重构获得成就感',
      caution: '避免同时开展多个项目'
    },
    '平静': {
      energy: '🍃 木性平和，最佳的成长状态',
      advice: '制定长期技术规划，稳步提升能力',
      code: '适合学习新框架，建立知识体系',
      caution: '保持这种状态，避免急于求成'
    },
    '疲惫': {
      energy: '🪴 木需要休息来重新生长',
      advice: '适度休息，通过自然环境恢复能量',
      code: '处理简单bug修复，避免复杂任务',
      caution: '不要强撑，给自己充分的恢复时间'
    },
    '惊讶': {
      energy: '✨ 木遇新机，创新灵感即将迸发',
      advice: '抓住灵感，快速验证新想法',
      code: '尝试实验性技术，探索可能性',
      caution: '记录灵感，但要理性评估可行性'
    },
    '无聊': {
      energy: '🌾 木气停滞，需要新的刺激',
      advice: '寻找新的技术挑战，重燃学习热情',
      code: '尝试参与开源项目，接触新领域',
      caution: '避免盲目跳槽，先在现有环境寻找机会'
    }
  },

  // 火 × 8种情绪
  '火': {
    '高兴': {
      energy: '🔥 火焰正旺，执行力达到峰值',
      advice: '全力推进重要项目，现在是最佳时机',
      code: '适合攻克技术难题，实现关键突破',
      caution: '注意可持续性，避免过度燃烧'
    },
    '愤怒': {
      energy: '💥 火上浇油，需要冷静控制',
      advice: '暂时离开现场，通过运动释放能量',
      code: '避免重要技术决策，专注简单任务',
      caution: '绝对避免与团队发生冲突'
    },
    '悲伤': {
      energy: '💧 水克火，内心能量被压制',
      advice: '寻找团队支持，通过社交恢复活力',
      code: '选择与他人协作的任务，避免独自工作',
      caution: '不要独自承受，主动寻求帮助'
    },
    '焦虑': {
      energy: '🌀 火焰不稳，容易失控',
      advice: '建立清晰的优先级，逐个击破任务',
      code: '专注单一任务，避免多线程工作',
      caution: '控制工作节奏，避免加班过度'
    },
    '平静': {
      energy: '🕯️ 稳定的火焰，高效而持久',
      advice: '保持当前节奏，稳步推进目标',
      code: '适合处理核心业务逻辑，保证质量',
      caution: '维持规律作息，保持稳定状态'
    },
    '疲惫': {
      energy: '🪫 火焰微弱，急需充电',
      advice: '立即停止高强度工作，充分休息',
      code: '只处理紧急bug，推迟新功能开发',
      caution: '火型人最容易过劳，必须强制休息'
    },
    '惊讶': {
      energy: '🎆 火花四射，爆发式创造力',
      advice: '快速行动，将灵感转化为实际成果',
      code: '适合原型开发，快速验证想法',
      caution: '保持专注，不要被太多想法分散注意力'
    },
    '无聊': {
      energy: '🔥 火缺乏燃料，需要新挑战',
      advice: '主动寻找有挑战性的项目',
      code: '尝试性能优化，挑战技术极限',
      caution: '避免盲目求变，先完成手头工作'
    }
  },

  // 土 × 8种情绪
  '土': {
    '高兴': {
      energy: '🏔️ 大地丰收，稳定中带有喜悦',
      advice: '巩固现有成果，为下一阶段做准备',
      code: '完善文档和测试，夯实项目基础',
      caution: '保持谦逊，避免因成功而松懈'
    },
    '愤怒': {
      energy: '🌋 地火相合，需要理性控制',
      advice: '深呼吸，通过逻辑分析化解情绪',
      code: '专注代码重构，通过整理获得平静',
      caution: '避免冲动，土型人的愤怒持续时间长'
    },
    '悲伤': {
      energy: '🏜️ 大地干涸，需要水的滋润',
      advice: '寻求稳定的支持系统，逐步恢复',
      code: '处理熟悉的维护工作，重建信心',
      caution: '不要独自消化痛苦，寻求专业帮助'
    },
    '焦虑': {
      energy: '🌪️ 大地震动，失去根基',
      advice: '回到基础工作，重新建立稳定感',
      code: '专注代码规范，通过秩序感缓解焦虑',
      caution: '制定详细计划，避免不确定性'
    },
    '平静': {
      energy: '⛰️ 如山般稳重，最佳工作状态',
      advice: '发挥稳定优势，承担团队支撑角色',
      code: '适合架构设计，建立稳固的技术基础',
      caution: '保持这种状态，土型人的稳定最珍贵'
    },
    '疲惫': {
      energy: '🪨 大地沉重，需要减负',
      advice: '减少承担，学会合理分配责任',
      code: '专注核心功能，暂停非必要优化',
      caution: '土型人容易过度承担，要学会说不'
    },
    '惊讶': {
      energy: '🌱 大地新生，稳中有变',
      advice: '谨慎分析新情况，稳步适应变化',
      code: '仔细评估新技术，确保兼容性',
      caution: '不要急于改变，先充分了解情况'
    },
    '无聊': {
      energy: '🏞️ 平静过度，需要适度刺激',
      advice: '寻找有意义的长期项目',
      code: '专注系统优化，在稳定中寻找乐趣',
      caution: '避免盲目求变，在现有基础上创新'
    }
  },

  // 金 × 8种情绪
  '金': {
    '高兴': {
      energy: '⚔️ 锋芒毕露，逻辑思维最敏锐',
      advice: '利用清晰思维解决复杂问题',
      code: '适合算法优化，追求代码完美',
      caution: '避免过度追求完美而影响进度'
    },
    '愤怒': {
      energy: '🗡️ 金属锐利，容易伤人伤己',
      advice: '冷静分析问题本质，理性沟通',
      code: '专注代码review，通过批判性思维宣泄',
      caution: '控制言辞，避免过于犀利的批评'
    },
    '悲伤': {
      energy: '🔗 金属黯淡，失去光泽',
      advice: '通过逻辑分析来理解和接受情况',
      code: '专注bug修复，通过解决问题获得成就感',
      caution: '不要过度自我批判，接受不完美'
    },
    '焦虑': {
      energy: '⚡ 金属导电，情绪传导强烈',
      advice: '制定详细计划，用逻辑对抗不确定性',
      code: '建立完善的测试体系，增强确定性',
      caution: '避免过度分析，有时要相信直觉'
    },
    '平静': {
      energy: '🛡️ 金属稳固，思维清晰',
      advice: '发挥逻辑优势，做重要技术决策',
      code: '适合系统设计，建立完善的架构',
      caution: '平衡理性与感性，避免过于冷漠'
    },
    '疲惫': {
      energy: '🔧 金属疲劳，需要保养',
      advice: '停止过度思考，给大脑充分休息',
      code: '处理简单重复工作，降低思维负担',
      caution: '金型人容易思虑过度，要学会放空'
    },
    '惊讶': {
      energy: '💎 金属闪耀，洞察力增强',
      advice: '深入分析新现象，发现规律',
      code: '适合技术调研，探索新方案',
      caution: '保持客观，避免偏见影响判断'
    },
    '无聊': {
      energy: '🔩 金属生锈，缺乏挑战',
      advice: '寻找有挑战性的技术难题',
      code: '尝试复杂算法，挑战逻辑极限',
      caution: '避免为了挑战而挑战，要有实际意义'
    }
  },

  // 水 × 8种情绪
  '水': {
    '高兴': {
      energy: '🌊 水流畅快，适应力最强',
      advice: '抓住机会，灵活应对各种情况',
      code: '适合处理复杂业务逻辑，展现灵活性',
      caution: '保持专注，避免过于分散注意力'
    },
    '愤怒': {
      energy: '🌪️ 水火不容，情绪波动大',
      advice: '让情绪如水般流动，不要压抑',
      code: '适合处理灵活性要求高的任务',
      caution: '避免冲动决策，给情绪一些流动时间'
    },
    '悲伤': {
      energy: '🌧️ 水汇成海，情绪深沉',
      advice: '允许情绪自然流淌，寻找支持',
      code: '选择需要耐心的任务，如数据处理',
      caution: '不要独自沉溺，保持与他人的连接'
    },
    '焦虑': {
      energy: '🌀 水流湍急，方向不明',
      advice: '寻找稳定的着力点，逐步建立秩序',
      code: '专注单一项目，避免多任务切换',
      caution: '建立固定的工作流程，减少变数'
    },
    '平静': {
      energy: '🏞️ 水面如镜，智慧显现',
      advice: '发挥洞察力，深入理解问题本质',
      code: '适合复杂问题分析，系统性思考',
      caution: '保持这种难得的平静状态'
    },
    '疲惫': {
      energy: '💧 水源枯竭，需要补给',
      advice: '寻找能量源泉，可能是学习或社交',
      code: '处理轻松的维护工作，避免高强度思考',
      caution: '水型人易过度付出，要学会为自己充电'
    },
    '惊讶': {
      energy: '💫 水波激荡，直觉敏锐',
      advice: '相信直觉，快速适应新情况',
      code: '适合原型开发，探索可能性',
      caution: '验证直觉，避免过于依赖感觉'
    },
    '无聊': {
      energy: '🌊 水需要流动，渴望变化',
      advice: '主动寻求新的学习机会',
      code: '尝试新的技术领域，保持流动性',
      caution: '避免频繁换方向，在变化中保持核心'
    }
  }
};

// 五行相生相克的互动建议
const WUXING_INTERACTION_ADVICE = {
  '木': {
    supportedBy: '水', // 水生木
    supports: '火',    // 木生火
    restrainedBy: '金', // 金克木
    restrains: '土',   // 木克土
    
    advice: {
      '水': '与水型人合作能激发你的创造力，向他们学习灵活性',
      '火': '你能激发火型人的行动力，但要注意他们的节奏',
      '金': '与金型人可能有摩擦，但他们的逻辑能完善你的想法',
      '土': '土型人能为你提供稳定支撑，珍惜这种合作关系',
      '木': '同类相聚创意无限，但要避免方向过于分散'
    }
  },
  
  '火': {
    supportedBy: '木',
    supports: '土',
    restrainedBy: '水',
    restrains: '金',
    
    advice: {
      '木': '木型人为你提供创新想法，配合他们的创造力',
      '土': '你的激情能激活土型人，他们为你提供稳定基础',
      '水': '与水型人可能产生冲突，需要更多耐心理解',
      '金': '你的热情可能压倒金型人，注意给他们思考空间',
      '火': '双火相遇能量巨大，但要避免过度消耗'
    }
  },
  
  '土': {
    supportedBy: '火',
    supports: '金',
    restrainedBy: '木',
    restrains: '水',
    
    advice: {
      '火': '火型人的激情能激发你的潜力，接受他们的推动',
      '金': '你为金型人提供支撑，他们的逻辑完善你的想法',
      '木': '木型人可能挑战你的稳定，但能带来新的可能',
      '水': '你能为水型人提供稳定感，但要理解他们的变化',
      '土': '土土相遇稳如泰山，但要避免过于保守'
    }
  },
  
  '金': {
    supportedBy: '土',
    supports: '水',
    restrainedBy: '火',
    restrains: '木',
    
    advice: {
      '土': '土型人为你提供支撑，珍惜这种稳定的合作',
      '水': '你的逻辑能引导水型人的方向，互补效果好',
      '火': '火型人的热情可能压倒你，需要适度调节',
      '木': '你的逻辑能完善木型人的创意，但要温和沟通',
      '金': '双金相遇逻辑完美，但要避免过于挑剔'
    }
  },
  
  '水': {
    supportedBy: '金',
    supports: '木',
    restrainedBy: '土',
    restrains: '火',
    
    advice: {
      '金': '金型人的逻辑为你提供方向，接受他们的指导',
      '木': '你能滋养木型人的创造力，享受这种互动',
      '土': '土型人可能限制你的自由，但能提供稳定感',
      '火': '你能平衡火型人的激烈，发挥调节作用',
      '水': '水水相遇变化无穷，但要保持一定的目标性'
    }
  }
};

class WuxingEmotionMatrix {
  constructor() {
    this.matrix = WUXING_EMOTION_MATRIX;
    this.interactions = WUXING_INTERACTION_ADVICE;
  }

  /**
   * 获取五行×情绪的个性化建议
   * @param {string} wuxing - 五行属性
   * @param {string} emotion - 情绪状态
   * @returns {Object} 个性化建议
   */
  getAdvice(wuxing, emotion) {
    const wuxingAdvice = this.matrix[wuxing];
    if (!wuxingAdvice) {
      return null;
    }
    
    const emotionAdvice = wuxingAdvice[emotion];
    if (!emotionAdvice) {
      return null;
    }
    
    return {
      wuxing: wuxing,
      emotion: emotion,
      ...emotionAdvice,
      interaction: this.interactions[wuxing]
    };
  }

  /**
   * 获取五行互动建议
   * @param {string} selfWuxing - 自己的五行
   * @param {string} otherWuxing - 对方的五行
   * @returns {Object} 互动建议
   */
  getInteractionAdvice(selfWuxing, otherWuxing) {
    const selfInteraction = this.interactions[selfWuxing];
    if (!selfInteraction) {
      return null;
    }
    
    const advice = selfInteraction.advice[otherWuxing];
    if (!advice) {
      return null;
    }
    
    // 确定关系类型
    let relationship = 'neutral';
    if (selfInteraction.supports === otherWuxing) {
      relationship = 'supports'; // 我生对方
    } else if (selfInteraction.supportedBy === otherWuxing) {
      relationship = 'supportedBy'; // 对方生我
    } else if (selfInteraction.restrains === otherWuxing) {
      relationship = 'restrains'; // 我克对方
    } else if (selfInteraction.restrainedBy === otherWuxing) {
      relationship = 'restrainedBy'; // 对方克我
    } else if (selfWuxing === otherWuxing) {
      relationship = 'same'; // 同类
    }
    
    return {
      selfWuxing: selfWuxing,
      otherWuxing: otherWuxing,
      relationship: relationship,
      advice: advice
    };
  }

  /**
   * 获取所有五行的情绪建议概览
   * @param {string} emotion - 情绪状态
   * @returns {Object} 所有五行的建议
   */
  getEmotionAdviceForAllWuxing(emotion) {
    const result = {};
    Object.keys(this.matrix).forEach(wuxing => {
      result[wuxing] = this.getAdvice(wuxing, emotion);
    });
    return result;
  }

  /**
   * 获取特定五行的所有情绪建议
   * @param {string} wuxing - 五行属性
   * @returns {Object} 该五行的所有情绪建议
   */
  getAllEmotionAdviceForWuxing(wuxing) {
    return this.matrix[wuxing] || null;
  }
}

module.exports = {
  WuxingEmotionMatrix,
  WUXING_EMOTION_MATRIX,
  WUXING_INTERACTION_ADVICE
};