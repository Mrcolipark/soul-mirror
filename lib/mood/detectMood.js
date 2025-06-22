const fs = require('fs');
const path = require('path');
const { learningEngine } = require('./learningEngine');
const ContextEmotionCorrector = require('./contextEmotionCorrector');
const { EmotionGroupAnalyzer } = require('./emotionGroups');

class ChineseMoodDetector {
  constructor() {
    this.aliases = null;
    this.categories = null;
    this.contextCorrector = new ContextEmotionCorrector();
    this.emotionGroupAnalyzer = new EmotionGroupAnalyzer();
    this.loadData();
  }

  loadData() {
    try {
      // 优先使用改进版词典
      const improvedAliasPath = path.join(__dirname, 'zh-alias-improved.json');
      const aliasPath = path.join(__dirname, 'zh-alias.json');
      const categoryPath = path.join(__dirname, 'zh-categories.json');
      
      // 尝试加载改进版，失败则回退到原版
      try {
        this.aliases = JSON.parse(fs.readFileSync(improvedAliasPath, 'utf8'));
        console.log('✅ 已加载改进版情绪词典');
      } catch {
        this.aliases = JSON.parse(fs.readFileSync(aliasPath, 'utf8'));
        console.log('⚠️ 回退使用原版情绪词典');
      }
      
      this.categories = JSON.parse(fs.readFileSync(categoryPath, 'utf8'));
    } catch (error) {
      console.error('Failed to load mood data:', error.message);
      this.aliases = {};
      this.categories = {};
    }
  }

  preprocessText(text) {
    if (!text || typeof text !== 'string') return '';
    
    return text
      .toLowerCase()                    // 转换为小写
      .replace(/[,.!?;。，！？；：]/g, ' ')  // 替换标点符号为空格
      .replace(/\s+/g, ' ')            // 合并多个空格
      .trim();                         // 去除首尾空格
  }

  /**
   * 计算关键词匹配得分（优化版：优先词组匹配，避免字符误判）
   * @param {string} text - 输入文本
   * @param {string[]} keywords - 关键词列表
   * @returns {Object} 匹配结果
   */
  calculateScore(text, keywords) {
    let score = 0;
    const hits = [];
    const matchedPositions = new Set(); // 记录已匹配位置，避免重复计分
    
    // 按长度排序关键词：优先匹配长词组，避免被短词覆盖
    const sortedKeywords = keywords.sort((a, b) => b.length - a.length);
    
    sortedKeywords.forEach(keyword => {
      const lowerKeyword = keyword.toLowerCase();
      
      // 查找所有匹配位置
      let index = 0;
      while ((index = text.indexOf(lowerKeyword, index)) !== -1) {
        // 检查是否与已匹配区域重叠
        const endIndex = index + lowerKeyword.length;
        let hasOverlap = false;
        
        for (let i = index; i < endIndex; i++) {
          if (matchedPositions.has(i)) {
            hasOverlap = true;
            break;
          }
        }
        
        if (!hasOverlap) {
          // 标记已匹配位置
          for (let i = index; i < endIndex; i++) {
            matchedPositions.add(i);
          }
          
          // 根据关键词长度给予不同权重
          let matchWeight = 1;
          if (lowerKeyword.length >= 4) {
            matchWeight = 3; // 长词组权重最高
          } else if (lowerKeyword.length >= 2) {
            matchWeight = 2; // 中等词组
          } else {
            matchWeight = 0.5; // 单字权重最低，减少误判
          }
          
          score += matchWeight;
          hits.push(keyword);
        }
        
        index += 1; // 继续查找下一个匹配
      }
    });
    
    return { score, hits };
  }

  /**
   * 转义正则表达式特殊字符
   * @param {string} string - 输入字符串
   * @returns {string} 转义后的字符串
   */
  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 智能判断默认情绪（当没有明确匹配时）
   * @param {string} processedText - 处理后的文本
   * @param {number} textLength - 文本长度
   * @returns {string} 推测的情绪类别
   */
  getDefaultMood(processedText, textLength) {
    // 适配新词典的情绪类别
    const moodMapping = {
      '无奈': '平静',
      '兴奋': '高兴', 
      '困惑': '焦虑',
      '疲惫': '疲惫'
    };
    
    // 基于文本特征的智能判断
    if (textLength <= 3) {
      // 极短文本，基于字符特征判断
      const shortExpressions = {
        '呵': '平静', '哈': '高兴', '唉': '悲伤', '嗯': '平静',
        '累': '疲惫', '困': '疲惫', '烦': '愤怒', '爽': '高兴',
        '6': '平静', 'gg': '平静', 'ok': '平静'
      };
      
      for (const [char, mood] of Object.entries(shortExpressions)) {
        if (processedText.includes(char)) return mood;
      }
    }
    
    // 基于标点符号和特殊表达判断
    if (processedText.includes('...') || processedText.includes('。。。')) {
      return '悲伤';
    }
    
    if (processedText.includes('!!!') || processedText.includes('！！！')) {
      return '高兴';
    }
    
    if (processedText.includes('???') || processedText.includes('？？？')) {
      return '焦虑';
    }
    
    // 基于文本长度判断
    if (textLength > 50) {
      // 长文本通常包含复杂情绪，可能是倾诉
      return '焦虑';
    }
    
    if (textLength < 5) {
      // 非常短的文本，可能是敷衍回应
      return '无聊';
    }
    
    // 默认返回平静
    return '平静';
  }

  /**
   * 优化长文本情绪识别
   * @param {Object} scores - 情绪得分对象
   * @param {Object} allHits - 匹配词汇对象
   * @param {string} processedText - 处理后的文本
   */
  optimizeLongTextDetection(scores, allHits, processedText) {
    // 长文本中的情绪强度增强
    const sentences = processedText.split(/[。！？.!?]+/).filter(s => s.length > 3);
    
    // 分析情绪词汇的分布密度
    Object.keys(scores).forEach(mood => {
      const hits = allHits[mood] || [];
      if (hits.length > 0) {
        // 计算情绪词汇在文本中的分布密度
        const density = hits.length / Math.max(1, sentences.length);
        
        // 密度加成：在长文本中多次出现同一情绪词汇
        if (density > 0.3) {
          scores[mood] += 2; // 高密度加成
        } else if (density > 0.1) {
          scores[mood] += 1; // 中密度加成
        }
        
        // 情绪词汇的多样性加成
        const uniqueHits = [...new Set(hits)];
        if (uniqueHits.length > 2) {
          scores[mood] += uniqueHits.length * 0.5; // 多样性加成
        }
      }
    });

    // 长文本中的情绪转折识别
    this.detectEmotionalTransitions(scores, processedText);
  }

  /**
   * 检测情绪转折
   * @param {Object} scores - 情绪得分对象
   * @param {string} text - 文本内容
   */
  detectEmotionalTransitions(scores, text) {
    const transitionWords = ['但是', '不过', '然而', '可是', '只是', '虽然', '尽管'];
    
    transitionWords.forEach(word => {
      if (text.includes(word)) {
        // 检测转折前后的情绪变化
        const parts = text.split(word);
        if (parts.length === 2) {
          const [before, after] = parts;
          
          // 分析转折后的情绪，给予更高权重
          const afterScores = {};
          Object.keys(this.aliases).forEach(mood => {
            const keywords = this.aliases[mood];
            const result = this.calculateScore(after, keywords);
            afterScores[mood] = result.score;
          });
          
          // 转折后的情绪得分加权
          Object.keys(afterScores).forEach(mood => {
            if (afterScores[mood] > 0) {
              scores[mood] += afterScores[mood] * 1.5; // 转折后情绪权重增加
            }
          });
        }
      }
    });
  }

  /**
   * 检测情绪
   * @param {string} text - 输入文本
   * @returns {Object} 情绪分析结果
   */
  detectMood(text) {
    const processedText = this.preprocessText(text);
    const textLength = processedText.length;
    
    if (!processedText) {
      return {
        main: '平静',
        secondary: [],
        element: '金',
        tone: '维持型',
        hits: [],
        scores: {},
        confidence: 0
      };
    }

    const scores = {};
    const allHits = {};
    
    // 对每个情绪类别计算得分
    Object.keys(this.aliases).forEach(mood => {
      const keywords = this.aliases[mood];
      const result = this.calculateScore(processedText, keywords);
      
      scores[mood] = result.score;
      allHits[mood] = result.hits;
    });

    // 长文本情绪识别优化
    if (textLength > 30) {
      this.optimizeLongTextDetection(scores, allHits, processedText);
    }

    // 找出得分最高的情绪（主情绪）
    const sortedMoods = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
    const mainMood = sortedMoods[0];
    const mainScore = scores[mainMood];

    // 确定次情绪（得分大于0且不是主情绪）
    const secondaryMoods = sortedMoods.slice(1).filter(mood => scores[mood] > 0);

    // 如果没有匹配到任何情绪，智能判断默认情绪
    if (mainScore === 0) {
      const defaultMood = this.getDefaultMood(processedText, textLength);
      
      return {
        main: defaultMood,
        secondary: [],
        element: this.categories[defaultMood]?.element || '金',
        tone: this.categories[defaultMood]?.tone || '维持型',
        emoji: this.categories[defaultMood]?.emoji || '😐',
        hits: [],
        scores: scores,
        confidence: Math.max(20, Math.min(40, textLength * 5)) // 智能置信度
      };
    }

    // 计算置信度（优化版本，确保合理的最小值）
    const hitCount = allHits[mainMood]?.length || 0;
    
    const confidence = (() => {
      // 如果没有任何匹配，返回智能推测的最小置信度
      if (mainScore === 0) {
        // 基于文本长度和内容复杂度的智能推测
        const intelligentGuess = Math.min(35, Math.max(15, textLength * 2));
        return intelligentGuess;
      }
      
      // 基础置信度：基于匹配强度（更合理的映射）
      let baseConfidence = Math.min(80, mainScore * 15 + 20);
      
      // 文本长度调节：短文本不过度惩罚，长文本适度加成
      const lengthFactor = Math.min(1.2, Math.max(0.6, Math.sqrt(textLength) / 4));
      
      // 匹配词汇数量和质量加成
      const hitBonus = Math.min(20, hitCount * 5);
      
      // 匹配词汇多样性加成
      const uniqueHits = [...new Set(allHits[mainMood] || [])];
      const diversityBonus = Math.min(10, uniqueHits.length * 2);
      
      // 最终置信度计算
      let finalConfidence = Math.round(
        baseConfidence * lengthFactor + hitBonus + diversityBonus
      );
      
      // 确保置信度在合理范围内（最低20%，最高95%）
      finalConfidence = Math.max(20, Math.min(95, finalConfidence));
      
      return finalConfidence;
    })();

    const originalResult = {
      main: mainMood,
      secondary: secondaryMoods.slice(0, 2), // 最多返回2个次情绪
      element: this.categories[mainMood]?.element || '土',
      tone: this.categories[mainMood]?.tone || '安抚型',
      emoji: this.categories[mainMood]?.emoji || '😐',
      hits: allHits[mainMood] || [],
      scores: scores,
      confidence: confidence,
      details: {
        intensity: this.categories[mainMood]?.intensity || '中',
        tags: this.categories[mainMood]?.tags || [],
        description: this.categories[mainMood]?.description || ''
      }
    };

    // 使用学习引擎调整结果
    const adjustedResult = learningEngine.adjustWithLearning(text, originalResult);
    
    // 应用上下文情绪修正
    const contextCorrectedResult = this.contextCorrector.correctWithContext(text, adjustedResult);
    
    // 分析情绪组
    const emotionGroupResult = this.emotionGroupAnalyzer.analyzeEmotionGroup(
      contextCorrectedResult.main,
      contextCorrectedResult.confidence,
      contextCorrectedResult.secondary
    );
    
    // 整合最终结果
    const finalResult = {
      ...contextCorrectedResult,
      emotionGroup: emotionGroupResult,
      analysis: {
        ...contextCorrectedResult,
        groupSummary: emotionGroupResult.summary
      }
    };
    
    // 记录学习数据
    learningEngine.learnFromInput(text, finalResult);

    return finalResult;
  }

  /**
   * 批量检测情绪（用于测试）
   * @param {string[]} texts - 文本数组
   * @returns {Object[]} 情绪分析结果数组
   */
  batchDetect(texts) {
    return texts.map(text => this.detectMood(text));
  }

  /**
   * 获取支持的情绪类别
   * @returns {string[]} 情绪类别列表
   */
  getSupportedMoods() {
    return Object.keys(this.aliases);
  }

  /**
   * 获取情绪类别详细信息
   * @param {string} mood - 情绪类别
   * @returns {Object|null} 情绪详细信息
   */
  getMoodInfo(mood) {
    return this.categories[mood] || null;
  }
}

// 创建单例实例
const detector = new ChineseMoodDetector();

/**
 * 主要导出函数
 * @param {string} text - 输入文本
 * @returns {Object} 情绪分析结果
 */
function analyzeMood(text) {
  return detector.detectMood(text);
}

/**
 * 批量分析
 * @param {string[]} texts - 文本数组
 * @returns {Object[]} 分析结果数组
 */
function batchAnalyzeMood(texts) {
  return detector.batchDetect(texts);
}

/**
 * 获取支持的情绪类别
 * @returns {string[]} 情绪类别列表
 */
function getSupportedMoods() {
  return detector.getSupportedMoods();
}

/**
 * 获取情绪详细信息
 * @param {string} mood - 情绪类别
 * @returns {Object|null} 情绪详细信息
 */
function getMoodInfo(mood) {
  return detector.getMoodInfo(mood);
}

module.exports = {
  analyzeMood,
  batchAnalyzeMood,
  getSupportedMoods,
  getMoodInfo,
  ChineseMoodDetector
};