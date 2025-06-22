const fs = require('fs');
const path = require('path');

/**
 * 情绪学习引擎
 * 通过用户交互不断学习和改进情绪识别准确性
 */
class MoodLearningEngine {
  constructor() {
    this.learningDataPath = path.join(__dirname, 'learning-data.json');
    this.userPatternsPath = path.join(__dirname, 'user-patterns.json');
    this.loadLearningData();
  }

  /**
   * 加载学习数据
   */
  loadLearningData() {
    try {
      // 加载全局学习数据
      if (fs.existsSync(this.learningDataPath)) {
        this.learningData = JSON.parse(fs.readFileSync(this.learningDataPath, 'utf8'));
      } else {
        this.learningData = {
          textPatterns: {},      // 文本模式 -> 情绪映射
          confidenceAdjustments: {}, // 置信度调整规则
          userFeedback: []       // 用户反馈记录
        };
      }

      // 加载用户个人模式
      if (fs.existsSync(this.userPatternsPath)) {
        this.userPatterns = JSON.parse(fs.readFileSync(this.userPatternsPath, 'utf8'));
      } else {
        this.userPatterns = {
          personalVocabulary: {},  // 个人词汇习惯
          emotionHistory: [],      // 情绪历史
          contextPreferences: {}   // 上下文偏好
        };
      }
    } catch (error) {
      console.warn('Failed to load learning data:', error.message);
      this.initializeDefault();
    }
  }

  /**
   * 初始化默认学习数据
   */
  initializeDefault() {
    this.learningData = {
      textPatterns: {},
      confidenceAdjustments: {},
      userFeedback: []
    };
    
    this.userPatterns = {
      personalVocabulary: {},
      emotionHistory: [],
      contextPreferences: {}
    };
  }

  /**
   * 学习用户的表达习惯
   * @param {string} text - 用户输入文本
   * @param {Object} detectedMood - 检测到的情绪结果
   * @param {Object} context - 上下文信息（时间、八字等）
   */
  learnFromInput(text, detectedMood, context = {}) {
    const pattern = this.extractPattern(text);
    const timestamp = new Date().toISOString();

    // 记录文本模式
    if (!this.learningData.textPatterns[pattern]) {
      this.learningData.textPatterns[pattern] = [];
    }
    
    this.learningData.textPatterns[pattern].push({
      mood: detectedMood.main,
      confidence: detectedMood.confidence,
      timestamp: timestamp,
      textLength: text.length
    });

    // 更新个人词汇习惯
    this.updatePersonalVocabulary(text, detectedMood.main);

    // 记录情绪历史
    this.userPatterns.emotionHistory.push({
      mood: detectedMood.main,
      element: detectedMood.element,
      confidence: detectedMood.confidence,
      timestamp: timestamp,
      context: context
    });

    // 保持历史记录在合理范围内
    if (this.userPatterns.emotionHistory.length > 100) {
      this.userPatterns.emotionHistory = this.userPatterns.emotionHistory.slice(-50);
    }

    this.saveLearningData();
  }

  /**
   * 提取文本模式
   * @param {string} text - 输入文本
   * @returns {string} 文本模式标识
   */
  extractPattern(text) {
    const processed = text.toLowerCase()
      .replace(/[0-9]+/g, '#NUM#')  // 数字替换
      .replace(/[a-zA-Z]+/g, '#ENG#') // 英文替换
      .replace(/[^\u4e00-\u9fa5#]/g, '') // 只保留中文和标记
      .slice(0, 20); // 限制长度

    return processed || '#EMPTY#';
  }

  /**
   * 更新个人词汇习惯
   * @param {string} text - 输入文本
   * @param {string} mood - 检测到的情绪
   */
  updatePersonalVocabulary(text, mood) {
    const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
    
    words.forEach(word => {
      if (word.length >= 2) { // 只记录2个字符以上的词
        if (!this.userPatterns.personalVocabulary[word]) {
          this.userPatterns.personalVocabulary[word] = {};
        }
        
        if (!this.userPatterns.personalVocabulary[word][mood]) {
          this.userPatterns.personalVocabulary[word][mood] = 0;
        }
        
        this.userPatterns.personalVocabulary[word][mood]++;
      }
    });
  }

  /**
   * 基于学习数据调整情绪识别结果
   * @param {string} text - 输入文本
   * @param {Object} originalResult - 原始识别结果
   * @returns {Object} 调整后的识别结果
   */
  adjustWithLearning(text, originalResult) {
    const adjustedResult = { ...originalResult };
    
    // 基于个人词汇习惯调整
    this.adjustWithPersonalVocabulary(text, adjustedResult);
    
    // 基于历史模式调整
    this.adjustWithHistoricalPatterns(text, adjustedResult);
    
    // 基于情绪历史趋势调整
    this.adjustWithEmotionTrends(adjustedResult);

    return adjustedResult;
  }

  /**
   * 基于个人词汇习惯调整
   */
  adjustWithPersonalVocabulary(text, result) {
    const words = text.match(/[\u4e00-\u9fa5]+/g) || [];
    const moodScores = {};
    
    words.forEach(word => {
      if (this.userPatterns.personalVocabulary[word]) {
        Object.entries(this.userPatterns.personalVocabulary[word]).forEach(([mood, count]) => {
          if (!moodScores[mood]) moodScores[mood] = 0;
          moodScores[mood] += count;
        });
      }
    });

    // 如果个人习惯指向不同情绪，适当调整
    const personalPreference = Object.entries(moodScores)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (personalPreference && personalPreference[1] > 3) {
      const [preferredMood, score] = personalPreference;
      if (preferredMood !== result.main && score > 5) {
        // 提升置信度或调整主情绪
        result.confidence = Math.min(95, result.confidence + 10);
        result.personalLearning = `基于您的表达习惯，倾向于识别为"${preferredMood}"`;
      }
    }
  }

  /**
   * 基于历史模式调整
   */
  adjustWithHistoricalPatterns(text, result) {
    const pattern = this.extractPattern(text);
    const historicalData = this.learningData.textPatterns[pattern];
    
    if (historicalData && historicalData.length > 2) {
      // 计算历史模式的主导情绪
      const moodCounts = {};
      historicalData.forEach(entry => {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      });

      const dominantMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (dominantMood && dominantMood[1] >= 2) {
        const [historicalMood] = dominantMood;
        if (historicalMood !== result.main) {
          result.confidence = Math.min(95, result.confidence + 5);
          result.historicalPattern = `相似表达历史上多为"${historicalMood}"情绪`;
        }
      }
    }
  }

  /**
   * 基于情绪历史趋势调整
   */
  adjustWithEmotionTrends(result) {
    const recentHistory = this.userPatterns.emotionHistory.slice(-10);
    
    if (recentHistory.length >= 3) {
      // 分析近期情绪趋势
      const recentMoods = recentHistory.map(entry => entry.mood);
      const moodCounts = {};
      
      recentMoods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });

      const dominantRecentMood = Object.entries(moodCounts)
        .sort(([,a], [,b]) => b - a)[0];

      if (dominantRecentMood && dominantRecentMood[1] >= 3) {
        const [trendMood] = dominantRecentMood;
        result.emotionTrend = `近期您的情绪主要偏向"${trendMood}"`;
        
        // 如果当前情绪与趋势一致，提升置信度
        if (trendMood === result.main) {
          result.confidence = Math.min(95, result.confidence + 8);
        }
      }
    }
  }

  /**
   * 获取情绪分析洞察
   * @returns {Object} 个人情绪模式分析
   */
  getPersonalInsights() {
    const history = this.userPatterns.emotionHistory;
    
    if (history.length < 5) {
      return {
        message: '继续使用，我将学习您的情绪表达模式，提供更准确的分析。'
      };
    }

    // 分析情绪分布
    const moodDistribution = {};
    const elementDistribution = {};
    
    history.forEach(entry => {
      moodDistribution[entry.mood] = (moodDistribution[entry.mood] || 0) + 1;
      elementDistribution[entry.element] = (elementDistribution[entry.element] || 0) + 1;
    });

    const topMood = Object.entries(moodDistribution)
      .sort(([,a], [,b]) => b - a)[0];
    
    const topElement = Object.entries(elementDistribution)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalAnalyzes: history.length,
      dominantMood: topMood[0],
      dominantElement: topElement[0],
      moodDistribution: moodDistribution,
      personalizedTip: this.generatePersonalizedTip(topMood[0], topElement[0])
    };
  }

  /**
   * 生成个性化提示
   */
  generatePersonalizedTip(dominantMood, dominantElement) {
    const tips = {
      '高兴': '您富有正能量，这种积极状态很珍贵，继续保持并感染他人。',
      '愤怒': '您的情绪比较激烈，适合通过运动来调节，化怒火为动力。',
      '焦虑': '您经常感到焦虑，建议建立规律的放松习惯，学会与压力共处。',
      '悲伤': '您偶尔低落，记住这些都是成长的一部分，困难会让你更强大。',
      '平静': '您心态平和，这是很好的心理状态，适合深度思考和学习。',
      '期待': '您充满期待，这种正向能量很棒，记得将期待转化为行动。',
      '迷茫': '您善于思考，迷茫往往是成长的开始，保持探索精神。',
      '空泛': '您观察冷静，这种客观理性很有价值，适合做分析和决策。'
    };

    return tips[dominantMood] || '继续保持自我觉察，这对个人成长很有帮助。';
  }

  /**
   * 保存学习数据
   */
  saveLearningData() {
    try {
      fs.writeFileSync(this.learningDataPath, JSON.stringify(this.learningData, null, 2));
      fs.writeFileSync(this.userPatternsPath, JSON.stringify(this.userPatterns, null, 2));
    } catch (error) {
      console.warn('Failed to save learning data:', error.message);
    }
  }

  /**
   * 重置学习数据（调试用）
   */
  resetLearningData() {
    this.initializeDefault();
    this.saveLearningData();
  }
}

// 创建单例实例
const learningEngine = new MoodLearningEngine();

module.exports = {
  MoodLearningEngine,
  learningEngine
};