/**
 * NTUSD情绪词典集成器
 * 将NTUSD词典与现有alias词典智能融合
 */

const fs = require('fs');
const path = require('path');

class NTUSDIntegrator {
  constructor() {
    this.ntusdPath = path.join(__dirname, '../../data/ntusd/ntusd-processed.json');
    this.aliasPath = path.join(__dirname, 'zh-alias-improved.json');
    this.outputPath = path.join(__dirname, 'zh-alias-enhanced.json');
    
    this.ntusdData = null;
    this.aliasData = null;
    this.integratedData = {};
    
    this.config = {
      // 优先级配置
      aliasWeight: 1.0,      // alias词典权重
      ntusdWeight: 0.7,      // NTUSD词典权重
      
      // 强度阈值
      minIntensity: 0.3,     // 最小强度阈值
      maxWordsPerEmotion: 1000, // 每个情绪类别最大词数
      
      // 去重策略
      enableDeduplication: true,
      similarityThreshold: 0.8,
      
      // 现代化过滤
      filterTraditional: true,
      modernBonus: 0.2       // 现代用语加成
    };
  }
  
  /**
   * 加载词典数据
   */
  loadData() {
    try {
      // 加载NTUSD数据
      if (fs.existsSync(this.ntusdPath)) {
        this.ntusdData = JSON.parse(fs.readFileSync(this.ntusdPath, 'utf8'));
        console.log(`✅ 已加载NTUSD词典: ${this.ntusdData.metadata.totalWords}个词`);
      } else {
        console.log('⚠️ NTUSD词典文件不存在，请先运行ntusd-processor.js');
        return false;
      }
      
      // 加载alias数据
      if (fs.existsSync(this.aliasPath)) {
        this.aliasData = JSON.parse(fs.readFileSync(this.aliasPath, 'utf8'));
        const totalAlias = Object.values(this.aliasData).reduce((sum, arr) => sum + arr.length, 0);
        console.log(`✅ 已加载alias词典: ${totalAlias}个词`);
      } else {
        console.log('❌ alias词典文件不存在');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ 加载词典数据失败:', error.message);
      return false;
    }
  }
  
  /**
   * 检测现代用语
   */
  isModernExpression(word) {
    const modernPatterns = [
      /[a-zA-Z]/, // 包含英文字母
      /\d/, // 包含数字
      /[\u{1F600}-\u{1F64F}]/u, // 包含emoji表情
      /[\u{1F300}-\u{1F5FF}]/u, // 包含emoji符号
      /[\u{1F680}-\u{1F6FF}]/u, // 包含emoji交通
      /了$/, // 以"了"结尾的口语
      /死了$/, // 强化表达
      /爆了$/, // 网络用语
      /翻了$/, // 网络用语
      /yyds/, // 网络流行语
      /emo/, // 英文缩写
      /wtf/, // 英文缩写
      /high/, // 英文词汇
    ];
    
    return modernPatterns.some(pattern => pattern.test(word));
  }
  
  /**
   * 计算词汇相似度
   */
  calculateSimilarity(word1, word2) {
    if (word1 === word2) return 1.0;
    if (word1.includes(word2) || word2.includes(word1)) return 0.8;
    
    // 计算编辑距离相似度
    const distance = this.levenshteinDistance(word1, word2);
    const maxLength = Math.max(word1.length, word2.length);
    return 1 - (distance / maxLength);
  }
  
  /**
   * 编辑距离算法
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * 去重处理
   */
  deduplicateWords(wordList) {
    if (!this.config.enableDeduplication) return wordList;
    
    const deduplicated = [];
    const seen = new Set();
    
    for (const wordObj of wordList) {
      const word = typeof wordObj === 'string' ? wordObj : wordObj.word;
      
      let isDuplicate = false;
      if (seen.has(word)) {
        isDuplicate = true;
      } else {
        // 检查相似词汇
        for (const seenWord of seen) {
          if (this.calculateSimilarity(word, seenWord) > this.config.similarityThreshold) {
            isDuplicate = true;
            break;
          }
        }
      }
      
      if (!isDuplicate) {
        seen.add(word);
        deduplicated.push(wordObj);
      }
    }
    
    return deduplicated;
  }
  
  /**
   * 合并单个情绪类别
   */
  mergeEmotionCategory(emotion) {
    const aliasWords = this.aliasData[emotion] || [];
    const ntusdWords = this.ntusdData.emotions[emotion] || [];
    
    // 转换alias词汇为标准格式
    const aliasFormatted = aliasWords.map(word => ({
      word: word,
      intensity: this.isModernExpression(word) ? 
        Math.min(1.0, 0.6 + this.config.modernBonus) : 0.6,
      source: 'alias',
      priority: this.config.aliasWeight
    }));
    
    // 处理NTUSD词汇
    const ntusdFormatted = ntusdWords.map(wordObj => ({
      word: wordObj.word,
      intensity: Math.max(this.config.minIntensity, wordObj.intensity * this.config.ntusdWeight),
      source: 'NTUSD',
      priority: this.config.ntusdWeight
    }));
    
    // 合并并去重
    const combined = [...aliasFormatted, ...ntusdFormatted];
    const deduplicated = this.deduplicateWords(combined);
    
    // 按优先级和强度排序
    deduplicated.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.intensity - a.intensity;
    });
    
    // 限制词汇数量
    const limited = deduplicated.slice(0, this.config.maxWordsPerEmotion);
    
    return limited;
  }
  
  /**
   * 执行集成
   */
  integrate() {
    console.log('🔄 开始集成NTUSD与alias词典...\n');
    
    if (!this.loadData()) {
      return false;
    }
    
    // 获取所有情绪类别
    const emotions = Object.keys(this.aliasData);
    console.log(`📊 处理 ${emotions.length} 个情绪类别...`);
    
    const statistics = {};
    
    for (const emotion of emotions) {
      console.log(`\n🎭 处理情绪类别: ${emotion}`);
      
      const aliasCount = (this.aliasData[emotion] || []).length;
      const ntusdCount = (this.ntusdData.emotions[emotion] || []).length;
      
      console.log(`  alias词汇: ${aliasCount}个`);
      console.log(`  NTUSD词汇: ${ntusdCount}个`);
      
      const merged = this.mergeEmotionCategory(emotion);
      const finalWords = merged.map(item => item.word); // 转换为字符串数组以兼容现有系统
      
      this.integratedData[emotion] = finalWords;
      
      statistics[emotion] = {
        original: aliasCount,
        ntusd: ntusdCount,
        merged: merged.length,
        final: finalWords.length,
        modernWords: merged.filter(item => this.isModernExpression(item.word)).length,
        traditionalWords: merged.filter(item => !this.isModernExpression(item.word)).length
      };
      
      console.log(`  合并后: ${merged.length}个`);
      console.log(`  最终: ${finalWords.length}个`);
      console.log(`  现代用语: ${statistics[emotion].modernWords}个`);
      console.log(`  传统词汇: ${statistics[emotion].traditionalWords}个`);
    }
    
    // 保存集成结果
    this.saveResults(statistics);
    
    return true;
  }
  
  /**
   * 保存集成结果
   */
  saveResults(statistics) {
    console.log('\n💾 保存集成结果...');
    
    // 保存增强版词典
    fs.writeFileSync(this.outputPath, JSON.stringify(this.integratedData, null, 2), 'utf8');
    console.log(`✅ 增强版词典已保存: ${this.outputPath}`);
    
    // 保存统计报告
    const report = {
      timestamp: new Date().toISOString(),
      config: this.config,
      statistics: statistics,
      summary: {
        totalEmotions: Object.keys(this.integratedData).length,
        totalWords: Object.values(this.integratedData).reduce((sum, arr) => sum + arr.length, 0),
        avgWordsPerEmotion: Math.round(Object.values(this.integratedData).reduce((sum, arr) => sum + arr.length, 0) / Object.keys(this.integratedData).length),
        modernWordsTotal: Object.values(statistics).reduce((sum, stat) => sum + stat.modernWords, 0),
        traditionalWordsTotal: Object.values(statistics).reduce((sum, stat) => sum + stat.traditionalWords, 0)
      }
    };
    
    const reportPath = path.join(__dirname, '../../data/ntusd/integration-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`📊 集成报告已保存: ${reportPath}`);
    
    // 打印总结
    this.printSummary(report.summary);
  }
  
  /**
   * 打印集成总结
   */
  printSummary(summary) {
    console.log('\n🎯 集成总结:');
    console.log('='.repeat(50));
    console.log(`总情绪类别: ${summary.totalEmotions}个`);
    console.log(`总词汇数量: ${summary.totalWords}个`);
    console.log(`平均每类: ${summary.avgWordsPerEmotion}个词`);
    console.log(`现代用语: ${summary.modernWordsTotal}个 (${(summary.modernWordsTotal/summary.totalWords*100).toFixed(1)}%)`);
    console.log(`传统词汇: ${summary.traditionalWordsTotal}个 (${(summary.traditionalWordsTotal/summary.totalWords*100).toFixed(1)}%)`);
    
    console.log('\n💡 使用建议:');
    console.log('1. 将 zh-alias-enhanced.json 替换原有的 zh-alias-improved.json');
    console.log('2. 增强后的词典保持了现代用语优先级');
    console.log('3. 传统词汇作为补充，提高覆盖率');
    console.log('4. 建议定期更新以保持现代化');
  }
  
  /**
   * 创建使用示例
   */
  createUsageExample() {
    const examplePath = path.join(__dirname, 'enhanced-usage-example.js');
    
    const exampleCode = `
/**
 * 增强版情绪词典使用示例
 */

const enhancedDict = require('./zh-alias-enhanced.json');

// 检查词典状态
console.log('📊 增强版词典统计:');
Object.entries(enhancedDict).forEach(([emotion, words]) => {
  console.log(\`\${emotion}: \${words.length}个词\`);
});

// 测试现代用语识别
const testCases = [
  'emo了', 'yyds', 'high爆了', '破防了', 
  '开心', '愤怒', '悲伤', '焦虑'
];

console.log('\\n🧪 测试用例:');
testCases.forEach(testWord => {
  const matchedEmotions = [];
  
  Object.entries(enhancedDict).forEach(([emotion, words]) => {
    if (words.includes(testWord)) {
      matchedEmotions.push(emotion);
    }
  });
  
  console.log(\`"\${testWord}" -> \${matchedEmotions.join(', ') || '未匹配'}\`);
});
`;
    
    fs.writeFileSync(examplePath, exampleCode.trim(), 'utf8');
    console.log(`\n📝 使用示例已创建: ${examplePath}`);
  }
}

// 如果直接运行脚本
if (require.main === module) {
  const integrator = new NTUSDIntegrator();
  integrator.integrate();
  integrator.createUsageExample();
}

module.exports = NTUSDIntegrator;