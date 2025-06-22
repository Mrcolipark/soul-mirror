/**
 * 情绪分组系统
 * 将单一情绪升级为「主情绪 + 情绪组」模式
 */

// 情绪组定义
const EMOTION_GROUPS = {
  // 活力型情绪组
  'energy': {
    name: '活力型',
    description: '充满动力和行动力的情绪状态',
    emotions: ['高兴', '惊讶'],
    characteristics: ['主动性强', '执行力高', '创造力旺盛'],
    icon: '⚡',
    color: 'yellow'
  },
  
  // 平和型情绪组
  'calm': {
    name: '平和型',
    description: '内心平静安稳的情绪状态',
    emotions: ['平静'],
    characteristics: ['思维清晰', '决策理性', '稳定可靠'],
    icon: '🧘',
    color: 'blue'
  },
  
  // 压力型情绪组
  'stress': {
    name: '压力型',
    description: '承受压力和挑战的情绪状态',
    emotions: ['焦虑', '愤怒'],
    characteristics: ['紧张感强', '需要释放', '容易激动'],
    icon: '💢',
    color: 'red'
  },
  
  // 低沉型情绪组
  'low': {
    name: '低沉型',
    description: '情绪低落需要关怀的状态',
    emotions: ['悲伤', '疲惫'],
    characteristics: ['能量不足', '需要休息', '需要支持'],
    icon: '😔',
    color: 'gray'
  },
  
  // 消极型情绪组
  'passive': {
    name: '消极型',
    description: '缺乏动力的被动情绪状态',
    emotions: ['无聊'],
    characteristics: ['缺乏兴趣', '需要刺激', '寻求改变'],
    icon: '😴',
    color: 'purple'
  }
};

// 反向映射：从情绪到情绪组
const EMOTION_TO_GROUP = {};
Object.entries(EMOTION_GROUPS).forEach(([groupId, group]) => {
  group.emotions.forEach(emotion => {
    EMOTION_TO_GROUP[emotion] = {
      id: groupId,
      ...group
    };
  });
});

// 情绪强度等级
const EMOTION_INTENSITY_LEVELS = {
  'low': {
    name: '轻微',
    range: [0, 30],
    description: '情绪表现较为温和',
    modifier: 0.8
  },
  'moderate': {
    name: '中等',
    range: [30, 60],
    description: '情绪表现明显',
    modifier: 1.0
  },
  'high': {
    name: '强烈',
    range: [60, 80],
    description: '情绪表现激烈',
    modifier: 1.2
  },
  'extreme': {
    name: '极度',
    range: [80, 100],
    description: '情绪表现非常强烈',
    modifier: 1.5
  }
};

// 情绪组合建议
const EMOTION_GROUP_ADVICE = {
  'energy': {
    'high': {
      programming: '适合攻克技术难题，实现创新突破',
      lifestyle: '保持这种状态，但注意适度休息',
      caution: '避免过度承诺，量力而行'
    },
    'moderate': {
      programming: '适合推进新功能开发，学习新技术',
      lifestyle: '是展现才华的好时机',
      caution: '保持专注，避免分散注意力'
    },
    'low': {
      programming: '适合处理日常开发任务',
      lifestyle: '可以尝试一些轻松的活动',
      caution: '不要勉强自己做复杂工作'
    }
  },
  
  'calm': {
    'high': {
      programming: '最佳的架构设计和重要决策时机',
      lifestyle: '深度思考和长期规划的好时候',
      caution: '不要被外界干扰打破平静'
    },
    'moderate': {
      programming: '适合代码重构和文档整理',
      lifestyle: '保持这种良好状态',
      caution: '避免过于被动，需要适度主动'
    }
  },
  
  'stress': {
    'high': {
      programming: '暂缓重要技术决策，专注简单任务',
      lifestyle: '需要立即减压，离开压力源',
      caution: '避免做重要决定，避免人际冲突'
    },
    'moderate': {
      programming: '可以处理熟悉的工作，避免新挑战',
      lifestyle: '适度运动或冥想来缓解压力',
      caution: '注意情绪管理，避免传染给他人'
    },
    'low': {
      programming: '正常工作，但要注意压力预防',
      lifestyle: '适当放松，做喜欢的事情',
      caution: '提前识别压力源头'
    }
  },
  
  'low': {
    'high': {
      programming: '建议暂停工作，优先休息恢复',
      lifestyle: '寻求支持，给自己时间和空间',
      caution: '不要强撑，及时寻求帮助'
    },
    'moderate': {
      programming: '选择简单熟悉的任务，降低难度',
      lifestyle: '做一些让自己舒服的事情',
      caution: '避免重大决定，注意身心健康'
    }
  },
  
  'passive': {
    'high': {
      programming: '尝试新技术或有趣的项目来激发兴趣',
      lifestyle: '改变环境，尝试新活动',
      caution: '避免完全消极，寻找小的成就感'
    },
    'moderate': {
      programming: '可以做些常规工作，但要寻找乐趣',
      lifestyle: '适度社交，寻找新刺激',
      caution: '不要让无聊状态持续太久'
    }
  }
};

class EmotionGroupAnalyzer {
  constructor() {
    this.groups = EMOTION_GROUPS;
    this.emotionToGroup = EMOTION_TO_GROUP;
    this.intensityLevels = EMOTION_INTENSITY_LEVELS;
  }

  /**
   * 分析情绪并返回情绪组信息
   * @param {string} mainEmotion - 主情绪
   * @param {number} confidence - 置信度
   * @param {Array} secondaryEmotions - 次要情绪
   * @returns {Object} 情绪组分析结果
   */
  analyzeEmotionGroup(mainEmotion, confidence, secondaryEmotions = []) {
    const group = this.emotionToGroup[mainEmotion];
    if (!group) {
      return {
        group: null,
        intensity: 'moderate',
        advice: null,
        error: `未知情绪: ${mainEmotion}`
      };
    }

    // 确定情绪强度
    const intensity = this._getIntensityLevel(confidence);
    
    // 获取建议
    const advice = this._getGroupAdvice(group.id, intensity.id);
    
    // 分析次要情绪的情绪组分布
    const secondaryGroups = this._analyzeSecondaryGroups(secondaryEmotions);
    
    return {
      main: {
        emotion: mainEmotion,
        group: {
          id: group.id,
          name: group.name,
          description: group.description,
          icon: group.icon,
          color: group.color,
          characteristics: group.characteristics
        },
        intensity: {
          id: intensity.id,
          name: intensity.name,
          description: intensity.description,
          level: confidence
        }
      },
      secondary: secondaryGroups,
      advice: advice,
      summary: this._generateSummary(mainEmotion, group, intensity, secondaryGroups)
    };
  }

  /**
   * 获取情绪强度等级
   * @private
   */
  _getIntensityLevel(confidence) {
    for (const [levelId, level] of Object.entries(this.intensityLevels)) {
      if (confidence >= level.range[0] && confidence <= level.range[1]) {
        return { id: levelId, ...level };
      }
    }
    return { id: 'moderate', ...this.intensityLevels.moderate };
  }

  /**
   * 获取情绪组建议
   * @private
   */
  _getGroupAdvice(groupId, intensityId) {
    const groupAdvice = EMOTION_GROUP_ADVICE[groupId];
    if (!groupAdvice || !groupAdvice[intensityId]) {
      return {
        programming: '继续保持当前工作节奏',
        lifestyle: '照顾好自己的身心健康',
        caution: '注意情绪变化，适时调整'
      };
    }
    return groupAdvice[intensityId];
  }

  /**
   * 分析次要情绪的情绪组
   * @private
   */
  _analyzeSecondaryGroups(secondaryEmotions) {
    return secondaryEmotions
      .map(emotion => {
        const group = this.emotionToGroup[emotion];
        return group ? {
          emotion: emotion,
          groupId: group.id,
          groupName: group.name,
          icon: group.icon
        } : null;
      })
      .filter(item => item !== null);
  }

  /**
   * 生成情绪状态总结
   * @private
   */
  _generateSummary(mainEmotion, group, intensity, secondaryGroups) {
    let summary = `${group.icon} ${intensity.name}${group.name}`;
    
    if (secondaryGroups.length > 0) {
      const groupNames = [...new Set(secondaryGroups.map(sg => sg.groupName))];
      summary += `，伴有${groupNames.join('、')}倾向`;
    }
    
    return summary;
  }

  /**
   * 获取所有情绪组信息
   */
  getAllGroups() {
    return this.groups;
  }

  /**
   * 根据情绪组ID获取组信息
   */
  getGroupById(groupId) {
    return this.groups[groupId] || null;
  }
}

module.exports = {
  EmotionGroupAnalyzer,
  EMOTION_GROUPS,
  EMOTION_TO_GROUP,
  EMOTION_INTENSITY_LEVELS
};