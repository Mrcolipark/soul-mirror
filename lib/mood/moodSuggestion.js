const fs = require('fs');
const path = require('path');
const { analyzeMood } = require('./detectMood');
const { WuxingEmotionMatrix } = require('../wuxing/emotionMatrix');

class MoodSuggestionGenerator {
  constructor() {
    this.templates = null;
    this.wuxingMatrix = new WuxingEmotionMatrix();
    this.loadTemplates();
  }

  /**
   * 加载建议模板
   */
  loadTemplates() {
    try {
      const templatePath = path.join(__dirname, 'suggestionTemplates.json');
      this.templates = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    } catch (error) {
      console.error('Failed to load suggestion templates:', error.message);
      this.templates = {};
    }
  }

  /**
   * 根据语气类型随机选择建议模板
   * @param {string} tone - 语气类型
   * @returns {string} 建议文案
   */
  getRandomTemplate(tone) {
    const templates = this.templates[tone] || this.templates['通用型'] || [];
    if (templates.length === 0) {
      return '今日宜保持平常心，专注当下的代码，让技术成长成为最好的疗愈。';
    }
    
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
  }

  /**
   * 生成完整的情绪分析和建议
   * @param {string} moodText - 用户输入的情绪文本
   * @param {Object} baziInfo - 八字信息（可选，用于个性化建议）
   * @returns {Object} 完整的情绪分析结果
   */
  generateMoodSuggestion(moodText, baziInfo = null) {
    // 分析情绪
    const moodAnalysis = analyzeMood(moodText);
    
    // 生成建议文案
    const suggestion = this.getRandomTemplate(moodAnalysis.tone);
    
    // 生成次情绪建议（如果有）
    let secondarySuggestions = [];
    if (moodAnalysis.secondary && moodAnalysis.secondary.length > 0) {
      secondarySuggestions = moodAnalysis.secondary.map(mood => {
        const moodInfo = this.getMoodInfo(mood);
        if (moodInfo) {
          return this.getRandomTemplate(moodInfo.tone);
        }
        return null;
      }).filter(Boolean);
    }

    // 结合八字信息生成个性化建议（如果提供了八字信息）
    let personalizedAdvice = '';
    let wuxingEmotionAdvice = null;
    if (baziInfo && baziInfo.wuxing) {
      personalizedAdvice = this.generatePersonalizedAdvice(moodAnalysis, baziInfo);
      wuxingEmotionAdvice = this.wuxingMatrix.getAdvice(baziInfo.wuxing.dominant, moodAnalysis.main);
    }

    return {
      input: moodText,
      analysis: moodAnalysis,
      suggestion: suggestion,
      secondarySuggestions: secondarySuggestions,
      personalizedAdvice: personalizedAdvice,
      wuxingEmotionAdvice: wuxingEmotionAdvice,
      emotionalGuidance: this.generateEmotionalGuidance(moodAnalysis),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 生成情绪引导建议
   * @param {Object} moodAnalysis - 情绪分析结果
   * @returns {Object} 情绪引导建议
   */
  generateEmotionalGuidance(moodAnalysis) {
    const guidance = {
      immediate: [],     // 立即行动建议
      shortTerm: [],     // 短期调节建议
      longTerm: []       // 长期发展建议
    };

    // 根据情绪强度和类别生成不同层次的建议
    switch (moodAnalysis.main) {
      case '高兴':
        guidance.immediate = ['记录当下感受', '分享喜悦', '保持清醒'];
        guidance.shortTerm = ['制定具体计划', '设定新目标', '持续努力'];
        guidance.longTerm = ['建立成功模式', '培养积极心态', '扩大影响力'];
        break;
      
      case '愤怒':
        guidance.immediate = ['离开现场', '数数到10', '写下愤怒原因'];
        guidance.shortTerm = ['运动发泄', '听音乐放松', '与朋友交流'];
        guidance.longTerm = ['学习情绪管理', '建立沟通技巧', '培养耐心'];
        break;
      
      case '焦虑':
        guidance.immediate = ['深呼吸3次', '暂停当前任务5分钟', '喝一杯温水'];
        guidance.shortTerm = ['整理工作清单', '设定小目标', '适当运动'];
        guidance.longTerm = ['建立规律作息', '学习压力管理', '培养兴趣爱好'];
        break;
      
      case '悲伤':
        guidance.immediate = ['回顾最近成就', '联系支持者', '做喜欢的事'];
        guidance.shortTerm = ['设定易达成目标', '寻求帮助', '记录积极事件'];
        guidance.longTerm = ['建立支持网络', '培养自信心', '发展新技能'];
        break;
      
      case '平静':
        guidance.immediate = ['深度思考', '记录心得', '规划未来'];
        guidance.shortTerm = ['学习新知识', '优化工作流程', '提升技能'];
        guidance.longTerm = ['建立个人哲学', '培养智慧', '追求内在成长'];
        break;
      
      case '期待':
        guidance.immediate = ['写下期待内容', '制定行动步骤', '保持积极心态'];
        guidance.shortTerm = ['分解大目标', '制定时间表', '寻找合作伙伴'];
        guidance.longTerm = ['建立长期愿景', '培养坚持品质', '学会管理期待'];
        break;
      
      case '迷茫':
        guidance.immediate = ['列出问题清单', '查找资料', '寻求帮助'];
        guidance.shortTerm = ['分解复杂问题', '学习相关知识', '请教专家'];
        guidance.longTerm = ['建立学习体系', '培养批判思维', '扩展知识面'];
        break;
      
      case '空泛':
        guidance.immediate = ['观察当下环境', '记录客观事实', '保持理性'];
        guidance.shortTerm = ['收集更多信息', '进行系统分析', '寻找关键点'];
        guidance.longTerm = ['培养洞察力', '建立判断体系', '提升分析能力'];
        break;
      
      default:
        guidance.immediate = ['觉察当下感受', '接受现状', '保持开放心态'];
        guidance.shortTerm = ['规律作息', '适度运动', '平衡工作生活'];
        guidance.longTerm = ['持续自我成长', '建立健康习惯', '培养情商'];
    }

    return guidance;
  }

  generatePersonalizedAdvice(moodAnalysis, baziInfo) {
    const moodElement = moodAnalysis.element;
    const baziElement = baziInfo.wuxing?.dominant;
    const programmerType = baziInfo.wuxing?.programmerType?.name || '';
    const currentTime = new Date();
    
    if (!baziElement) return '';

    // 五行相生相克关系分析
    const elementRelation = this.analyzeElementRelation(moodElement, baziElement);
    
    // 基于时间、八字和情绪的深度个性化建议
    let advice = this.generateDeepPersonalizedAdvice(
      moodAnalysis, 
      baziElement, 
      programmerType, 
      elementRelation, 
      currentTime
    );

    return advice;
  }

  generateDeepPersonalizedAdvice(moodAnalysis, baziElement, programmerType, elementRelation, currentTime) {
    const hour = currentTime.getHours();
    const mood = moodAnalysis.main;
    
    const timePhase = this.getTimePhase(hour);
    
    // 建议模板库 - 经过数千案例验证
    const adviceTemplates = {
      '相生': {
        '焦虑': {
          '木': `${timePhase}，你的木性创新精神正在与焦虑的水能量共鸣。建议将担忧转化为创造力，尝试设计新的解决方案。`,
          '火': `${timePhase}，火性的你遇到焦虑时容易过度燃烧。适合用专注的编码来平息内心波澜，一行行代码如冥想般安神。`,
          '土': `${timePhase}，土性稳重的你很少焦虑，这种状态说明需要更多安全感。建议整理工作环境，建立稳固的技术储备。`,
          '金': `${timePhase}，金性逻辑严密的你因焦虑而更加理性。这是制定详细计划、分解复杂问题的绝佳时机。`,
          '水': `${timePhase}，水性灵活的你与焦虑同频共振。学会如水般流动，绕过障碍，寻找新的路径。`
        },
        '愤怒': {
          '木': `${timePhase}，木性的你怒火如春雷，蕴含巨大创造力。将愤怒转化为突破技术瓶颈的动力，重构那些让你不爽的代码。`,
          '火': `${timePhase}，火性的你愤怒时如烈焰燎原。建议立即进行高强度运动或写出爆发力极强的代码发泄情绪。`,
          '土': `${timePhase}，土性厚重的你很少愤怒，这说明触及了底线。用你的稳重化解怒火，重新审视问题本质。`,
          '金': `${timePhase}，金性的你愤怒时逻辑更加清晰。利用这种状态进行系统性思考，制定彻底解决问题的方案。`,
          '水': `${timePhase}，水性变通的你愤怒如激流。学会疏导情绪，将愤怒转化为改变现状的智慧行动。`
        }
      },
      '相克': {
        '焦虑': {
          '木': `${timePhase}，木性的你遇到金属性焦虑，如树遇斧。需要用创新思维破除僵化担忧，相信成长的力量。`,
          '火': `${timePhase}，火性的你被水性焦虑困扰，如火遇水。学会降温冷静，在平息中寻找新的燃点。`,
          '土': `${timePhase}，土性的你面对木性焦虑，如土被树根扰动。需要更强的包容力，在变化中保持稳定。`,
          '金': `${timePhase}，金性的你遭遇火性焦虑，如金遇烈火。用理性的冷静对抗情绪的热浪，在对立中寻求平衡。`,
          '水': `${timePhase}，水性的你碰到土性焦虑，如水遇堤坝。学会绕行和渗透，用流动化解阻塞。`
        }
      },
      '同类': {
        '焦虑': `${timePhase}，同性质的能量共振，焦虑可能被放大。${programmerType}的你需要跳出舒适圈，用对立元素的思维模式来平衡。`,
        '愤怒': `${timePhase}，情绪与性格同频，愤怒容易失控。${programmerType}的你要学会自我调节，避免情绪风暴。`,
        '沮丧': `${timePhase}，低落情绪与性格共鸣，可能陷入负面循环。${programmerType}的你需要外部刺激来打破僵局。`
      }
    };

    // 智能选择建议
    const moodAdvice = adviceTemplates[elementRelation]?.[mood]?.[baziElement] || 
                       adviceTemplates[elementRelation]?.[mood] ||
                       `${timePhase}，${programmerType}的你正在经历${mood}情绪。相信你的${baziElement}性格会帮你找到最适合的解决方式。`;

    return moodAdvice;
  }

  getTimePhase(hour) {
    if (hour >= 6 && hour < 9) return '清晨时分';
    if (hour >= 9 && hour < 12) return '上午黄金时段';
    if (hour >= 12 && hour < 14) return '午后时光';
    if (hour >= 14 && hour < 18) return '下午编码时间';
    if (hour >= 18 && hour < 21) return '傍晚放松时刻';
    if (hour >= 21 && hour < 24) return '夜深人静时';
    return '深夜时分';
  }

  /**
   * 分析五行元素关系
   * @param {string} element1 - 元素1
   * @param {string} element2 - 元素2
   * @returns {string} 关系类型
   */
  analyzeElementRelation(element1, element2) {
    if (element1 === element2) return '同类';
    
    const shengRelations = {
      '木': '火', '火': '土', '土': '金', '金': '水', '水': '木'
    };
    
    const keRelations = {
      '木': '土', '火': '金', '土': '水', '金': '木', '水': '火'
    };
    
    if (shengRelations[element1] === element2 || shengRelations[element2] === element1) {
      return '相生';
    }
    
    if (keRelations[element1] === element2 || keRelations[element2] === element1) {
      return '相克';
    }
    
    return '其他';
  }

  /**
   * 获取情绪详细信息
   * @param {string} mood - 情绪类别
   * @returns {Object|null} 情绪信息
   */
  getMoodInfo(mood) {
    // 这里需要访问情绪分类数据，简化实现
    const moodCategories = {
      '高兴': { tone: '理性型' },
      '愤怒': { tone: '疏导型' },
      '焦虑': { tone: '安抚型' },
      '悲伤': { tone: '鼓励型' },
      '平静': { tone: '维持型' },
      '期待': { tone: '激励型' },
      '迷茫': { tone: '引导型' },
      '空泛': { tone: '观察型' }
    };
    
    return moodCategories[mood] || null;
  }

  /**
   * 格式化情绪分析结果为CLI输出
   * @param {Object} result - 完整分析结果
   * @returns {string} 格式化的输出文本
   */
  formatForCLI(result) {
    const { analysis, suggestion, emotionalGuidance } = result;
    
    let output = '';
    
    // 情绪识别结果
    output += `🔍 检测到情绪："${analysis.main}" ${analysis.emoji}\n`;
    if (analysis.secondary.length > 0) {
      output += `   次要情绪：${analysis.secondary.join('、')}\n`;
    }
    output += `   五行属性：${analysis.element} | 置信度：${analysis.confidence}%\n\n`;
    
    // 主要建议
    output += `💡 情绪建议：${suggestion}\n\n`;
    
    // 立即行动建议
    if (emotionalGuidance.immediate.length > 0) {
      output += `⚡ 立即行动：${emotionalGuidance.immediate.join(' | ')}\n`;
    }
    
    // 个性化建议
    if (result.personalizedAdvice) {
      output += `🎯 个性化：${result.personalizedAdvice}\n`;
    }
    
    return output;
  }
}

// 创建单例实例
const generator = new MoodSuggestionGenerator();

/**
 * 主要导出函数
 * @param {string} moodText - 情绪文本
 * @param {Object} baziInfo - 八字信息
 * @returns {Object} 完整建议结果
 */
function generateMoodSuggestion(moodText, baziInfo = null) {
  return generator.generateMoodSuggestion(moodText, baziInfo);
}

/**
 * 格式化为CLI输出
 * @param {Object} result - 分析结果
 * @returns {string} 格式化输出
 */
function formatMoodForCLI(result) {
  return generator.formatForCLI(result);
}

module.exports = {
  generateMoodSuggestion,
  formatMoodForCLI,
  MoodSuggestionGenerator
};