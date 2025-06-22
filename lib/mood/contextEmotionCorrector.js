/**
 * 时间与语境修正模块
 * @module ContextEmotionCorrector
 * @since 0.8.0
 */

// 昼夜节律对情绪的影响系数
const TIME_EMOTION_WEIGHTS = {
  'morning': {  // 6:00-11:00
    '高兴': 1.2,
    '愤怒': 0.8,
    '悲伤': 0.7,
    '焦虑': 0.9,
    '平静': 1.1,
    '疲惫': 0.6,
    '惊讶': 1.0,
    '无聊': 0.8
  },
  // 下午 (11:00-17:00) - 情绪相对平衡
  'afternoon': {
    '高兴': 1.0,
    '愤怒': 1.0,
    '悲伤': 1.0,
    '焦虑': 1.1,
    '平静': 1.0,
    '疲惫': 1.2,
    '惊讶': 1.0,
    '无聊': 1.1
  },
  // 傍晚 (17:00-22:00) - 更容易疲惫和放松
  'evening': {
    '高兴': 1.1,
    '愤怒': 1.1,
    '悲伤': 1.0,
    '焦虑': 1.2,
    '平静': 1.2,
    '疲惫': 1.3,
    '惊讶': 0.9,
    '无聊': 1.0
  },
  // 深夜 (22:00-6:00) - 更容易负面情绪
  'night': {
    '高兴': 0.8,
    '愤怒': 1.2,
    '悲伤': 1.3,
    '焦虑': 1.4,
    '平静': 0.9,
    '疲惫': 1.5,
    '惊讶': 0.8,
    '无聊': 1.2
  }
};

// 上下文关键词修正规则
const CONTEXT_CORRECTION_RULES = {
  // 工作相关上下文
  'work': {
    keywords: ['代码', '项目', '工作', 'bug', '加班', '开发', '程序', '系统', '功能', 'deadline', 'review'],
    adjustments: {
      '高兴': { bonus: 0.1, reason: '工作成就感加成' },
      '愤怒': { bonus: 0.2, reason: '工作压力放大' },
      '焦虑': { bonus: 0.2, reason: '工作焦虑加强' },
      '疲惫': { bonus: 0.3, reason: '工作疲劳明显' }
    }
  },
  // 学习相关上下文
  'learning': {
    keywords: ['学习', '掌握', '理解', '搞懂', '弄明白', '学会', '教程', '文档', '知识'],
    adjustments: {
      '高兴': { bonus: 0.2, reason: '学习成就感' },
      '焦虑': { bonus: 0.1, reason: '学习压力' },
      '惊讶': { bonus: 0.2, reason: '学习发现' }
    }
  },
  // 社交相关上下文
  'social': {
    keywords: ['团队', '同事', '朋友', '聊天', '交流', '讨论', '分享', '合作'],
    adjustments: {
      '高兴': { bonus: 0.1, reason: '社交正面情绪' },
      '愤怒': { bonus: 0.1, reason: '人际冲突' },
      '悲伤': { bonus: 0.1, reason: '社交压力' }
    }
  },
  // 成就相关上下文
  'achievement': {
    keywords: ['完成', '成功', '搞定', '解决', '实现', '达成', '通过', '拿下'],
    adjustments: {
      '高兴': { bonus: 0.3, reason: '成就感强烈' },
      '平静': { bonus: 0.1, reason: '完成后的平静' }
    }
  },
  // 问题相关上下文
  'problem': {
    keywords: ['问题', '错误', '失败', '崩溃', '报错', '异常', '故障', '卡住'],
    adjustments: {
      '愤怒': { bonus: 0.2, reason: '问题带来挫折' },
      '焦虑': { bonus: 0.2, reason: '问题引发焦虑' },
      '疲惫': { bonus: 0.1, reason: '解决问题的疲劳' }
    }
  }
};

// 情绪强度修正词汇
const INTENSITY_MODIFIERS = {
  'extreme': {
    keywords: ['超级', '特别', '非常', '巨', '极', '死了', '疯了', '炸了', '爆了', '翻了'],
    multiplier: 1.5
  },
  'high': {
    keywords: ['很', '太', '好', '挺', '蛮', '相当', '真的'],
    multiplier: 1.2
  },
  'mild': {
    keywords: ['有点', '稍微', '还行', '一般', '不太', '略'],
    multiplier: 0.8
  }
};

class ContextEmotionCorrector {
  constructor() {
    this.debugMode = false;
  }

  /**
   * 对情绪识别结果进行上下文修正
   * @param {string} originalText - 原始文本
   * @param {Object} emotionResult - 原始情绪识别结果
   * @returns {Object} 修正后的情绪结果
   */
  correctWithContext(originalText, emotionResult) {
    const corrections = {
      timeWeight: 1.0,
      contextBonus: 0,
      intensityMultiplier: 1.0,
      appliedRules: []
    };

    // 1. 时间段修正
    const timeWeight = this._getTimeWeight(emotionResult.main);
    corrections.timeWeight = timeWeight;

    // 2. 上下文修正
    const contextCorrection = this._getContextCorrection(originalText, emotionResult.main);
    corrections.contextBonus = contextCorrection.bonus;
    corrections.appliedRules.push(...contextCorrection.rules);

    // 3. 强度修正
    const intensityMultiplier = this._getIntensityMultiplier(originalText);
    corrections.intensityMultiplier = intensityMultiplier;

    // 4. 重新计算所有情绪得分
    const correctedScores = {};
    Object.keys(emotionResult.scores).forEach(emotion => {
      let score = emotionResult.scores[emotion];
      
      // 应用时间权重
      const emotionTimeWeight = this._getTimeWeight(emotion);
      score *= emotionTimeWeight;
      
      // 应用上下文加成
      const emotionContext = this._getContextCorrection(originalText, emotion);
      score += emotionContext.bonus;
      
      // 应用强度修正
      score *= intensityMultiplier;
      
      correctedScores[emotion] = Math.max(0, score);
    });

    // 5. 重新确定主情绪
    const sortedEmotions = Object.keys(correctedScores)
      .sort((a, b) => correctedScores[b] - correctedScores[a]);
    const newMainEmotion = sortedEmotions[0];
    const newSecondaryEmotions = sortedEmotions.slice(1).filter(e => correctedScores[e] > 0);

    // 6. 重新计算置信度
    const maxScore = correctedScores[newMainEmotion];
    const totalScore = Object.values(correctedScores).reduce((sum, score) => sum + score, 0);
    const newConfidence = totalScore > 0 ? 
      Math.min(95, Math.max(15, Math.round((maxScore / totalScore) * 100))) : 
      emotionResult.confidence;

    return {
      ...emotionResult,
      main: newMainEmotion,
      secondary: newSecondaryEmotions.slice(0, 2),
      scores: correctedScores,
      confidence: newConfidence,
      corrections: corrections,
      _originalResult: emotionResult
    };
  }

  /**
   * 获取当前时间段的情绪权重
   * @private
   */
  _getTimeWeight(emotion) {
    const hour = new Date().getHours();
    let timeSlot;
    
    if (hour >= 6 && hour < 11) {
      timeSlot = 'morning';
    } else if (hour >= 11 && hour < 17) {
      timeSlot = 'afternoon';
    } else if (hour >= 17 && hour < 22) {
      timeSlot = 'evening';
    } else {
      timeSlot = 'night';
    }
    
    return TIME_EMOTION_WEIGHTS[timeSlot][emotion] || 1.0;
  }

  /**
   * 获取上下文修正
   * @private
   */
  _getContextCorrection(text, emotion) {
    let totalBonus = 0;
    const appliedRules = [];
    
    Object.entries(CONTEXT_CORRECTION_RULES).forEach(([contextType, rule]) => {
      const matchedKeywords = rule.keywords.filter(keyword => 
        text.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (matchedKeywords.length > 0) {
        const adjustment = rule.adjustments[emotion];
        if (adjustment) {
          // 匹配关键词越多，加成越大，但有上限
          const keywordBonus = Math.min(matchedKeywords.length * adjustment.bonus, adjustment.bonus * 2);
          totalBonus += keywordBonus;
          appliedRules.push({
            context: contextType,
            keywords: matchedKeywords,
            bonus: keywordBonus,
            reason: adjustment.reason
          });
        }
      }
    });
    
    return { bonus: totalBonus, rules: appliedRules };
  }

  /**
   * 获取强度修正倍数
   * @private
   */
  _getIntensityMultiplier(text) {
    const lowerText = text.toLowerCase();
    
    // 检查极强强度词汇
    for (const keyword of INTENSITY_MODIFIERS.extreme.keywords) {
      if (lowerText.includes(keyword)) {
        return INTENSITY_MODIFIERS.extreme.multiplier;
      }
    }
    
    // 检查高强度词汇
    for (const keyword of INTENSITY_MODIFIERS.high.keywords) {
      if (lowerText.includes(keyword)) {
        return INTENSITY_MODIFIERS.high.multiplier;
      }
    }
    
    // 检查轻度强度词汇
    for (const keyword of INTENSITY_MODIFIERS.mild.keywords) {
      if (lowerText.includes(keyword)) {
        return INTENSITY_MODIFIERS.mild.multiplier;
      }
    }
    
    return 1.0;
  }

  /**
   * 设置调试模式
   */
  setDebugMode(enabled) {
    this.debugMode = enabled;
  }

  /**
   * 获取当前时间段描述
   */
  getCurrentTimeSlot() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return '早晨';
    if (hour >= 11 && hour < 17) return '下午';
    if (hour >= 17 && hour < 22) return '傍晚';
    return '深夜';
  }
}

module.exports = ContextEmotionCorrector;