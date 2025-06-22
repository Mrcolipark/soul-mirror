#!/usr/bin/env node
/**
 * NTUSD中文情绪词典处理脚本
 * 功能：
 * 1. 解析NTUSD正向和负向词典文件
 * 2. 转换为JSON格式
 * 3. 分类到8大情绪类别
 * 4. 计算统计信息和五行属性
 * 5. 估算压缩后大小
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

class NTUSDProcessor {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/ntusd');
    this.positiveFile = path.join(this.dataDir, 'positive.txt');
    this.negativeFile = path.join(this.dataDir, 'negative.txt');
    
    // 8大情绪类别映射
    this.emotionCategories = {
      '高兴': [],
      '愤怒': [],
      '悲伤': [],
      '焦虑': [],
      '疲惫': [],
      '平静': [],
      '惊讶': [],
      '无聊': []
    };
    
    // 五行属性映射
    this.wuxingMapping = {
      '木': '高兴',    // 木主生发，对应积极情绪
      '火': '愤怒',    // 火主升发，对应激烈情绪
      '土': '悲伤',    // 土主沉重，对应悲伤情绪
      '金': '平静',    // 金主收敛，对应平静情绪
      '水': '焦虑'     // 水主流动，对应不安情绪
    };
    
    // 情绪分类关键词
    this.classificationKeywords = {
      '高兴': ['开心', '快乐', '愉快', '喜悦', '兴奋', '激动', '欢乐', '幸福', '美好', '满足', '舒心', '惬意', '畅快', '舒畅', '愉悦', '庆祝', '狂欢', '欣喜', '喜', '乐', '爽', '棒', '好', '赞'],
      '愤怒': ['愤怒', '生气', '发火', '发怒', '恼火', '恼怒', '愤恨', '仇恨', '憎恨', '讨厌', '烦', '烦躁', '恼', '怒', '气', '恨', '厌', '怼', '骂', '怨'],
      '悲伤': ['悲伤', '难过', '伤心', '痛苦', '沮丧', '失落', '低落', '抑郁', '郁闷', '哭', '流泪', '眼泪', '心痛', '心碎', '绝望', '失望', '孤独', '寂寞', '凄', '哀', '苦', '痛', '悲'],
      '焦虑': ['焦虑', '紧张', '担心', '不安', '忧虑', '心慌', '惶恐', '恐慌', '惊慌', '慌张', '压力', '急', '躁', '慌', '忧', '虑', '怕', '恐', '惧'],
      '疲惫': ['累', '疲惫', '疲倦', '疲劳', '疲乏', '乏力', '无力', '虚弱', '困倦', '倦怠', '困', '乏', '虚', '弱', '懒', '疲'],
      '平静': ['平静', '冷静', '淡定', '从容', '安静', '宁静', '安详', '放松', '轻松', '舒缓', '和谐', '和睦', '温和', '柔和', '平和', '静', '安', '稳', '和', '缓'],
      '惊讶': ['惊讶', '吃惊', '震惊', '惊奇', '诧异', '意外', '震撼', '震动', '惊', '震', '奇', '异'],
      '无聊': ['无聊', '乏味', '枯燥', '单调', '闷', '空虚', '无趣', '没劲', '没意思', '闲', '空', '呆']
    };
    
    this.stats = {
      positive: 0,
      negative: 0,
      total: 0,
      classified: 0,
      unclassified: 0
    };
  }
  
  /**
   * 读取并解析文件
   */
  readFile(filePath) {
    try {
      // 首先检测文件编码
      const buffer = fs.readFileSync(filePath);
      
      // 检测UTF-16 BOM
      if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        // UTF-16 LE BOM
        const content = buffer.toString('utf16le');
        console.log(`✅ 成功使用 utf16le 编码读取: ${path.basename(filePath)}`);
        return content;
      } else if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
        // UTF-16 BE BOM
        const content = buffer.toString('utf16be');
        console.log(`✅ 成功使用 utf16be 编码读取: ${path.basename(filePath)}`);
        return content;
      }
      
      // 尝试其他编码格式
      const encodings = ['utf8', 'utf16le', 'gbk', 'gb2312', 'big5'];
      
      for (const encoding of encodings) {
        try {
          const content = buffer.toString(encoding);
          // 检查是否包含合理的中文字符
          if (/[\u4e00-\u9fa5]/.test(content) && content.split(/[\u4e00-\u9fa5]/).length > 10) {
            console.log(`✅ 成功使用 ${encoding} 编码读取: ${path.basename(filePath)}`);
            return content;
          }
        } catch (err) {
          continue;
        }
      }
      
      // 最后尝试UTF-8
      const content = buffer.toString('utf8').replace(/\uFFFD/g, '');
      console.log(`⚠️ 使用UTF-8兜底模式读取: ${path.basename(filePath)}`);
      return content;
      
    } catch (error) {
      console.error(`❌ 读取文件失败: ${filePath}`, error.message);
      return '';
    }
  }
  
  /**
   * 解析词典文件内容
   */
  parseContent(content) {
    if (!content) return [];
    
    // 分行并清理
    const lines = content.split(/[\r\n]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .filter(line => !line.startsWith('#')); // 过滤注释行
    
    const words = [];
    
    for (const line of lines) {
      // 处理可能的格式：word 或 word\tvalue
      const parts = line.split(/[\s\t]+/);
      const word = parts[0];
      
      // 验证是否为有效中文词汇
      if (word && /[\u4e00-\u9fa5]/.test(word) && word.length >= 1 && word.length <= 10) {
        words.push(word);
      }
    }
    
    return [...new Set(words)]; // 去重
  }
  
  /**
   * 根据关键词分类情绪
   */
  classifyEmotion(word) {
    let bestMatch = null;
    let maxScore = 0;
    
    for (const [emotion, keywords] of Object.entries(this.classificationKeywords)) {
      let score = 0;
      
      // 完全匹配得分最高
      if (keywords.includes(word)) {
        score = 10;
      } else {
        // 部分匹配计分
        for (const keyword of keywords) {
          if (word.includes(keyword)) {
            score += keyword.length;
          } else if (keyword.includes(word)) {
            score += word.length;
          }
        }
      }
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = emotion;
      }
    }
    
    return bestMatch;
  }
  
  /**
   * 智能情绪分类（正向词汇）
   */
  classifyPositiveWords(words) {
    for (const word of words) {
      const emotion = this.classifyEmotion(word);
      
      if (emotion) {
        this.emotionCategories[emotion].push(word);
        this.stats.classified++;
      } else {
        // 正向词汇默认归类为高兴或平静
        if (word.length === 1 || /[静安稳和]/.test(word)) {
          this.emotionCategories['平静'].push(word);
        } else {
          this.emotionCategories['高兴'].push(word);
        }
        this.stats.unclassified++;
      }
    }
  }
  
  /**
   * 智能情绪分类（负向词汇）
   */
  classifyNegativeWords(words) {
    for (const word of words) {
      const emotion = this.classifyEmotion(word);
      
      if (emotion && ['愤怒', '悲伤', '焦虑', '疲惫', '无聊'].includes(emotion)) {
        this.emotionCategories[emotion].push(word);
        this.stats.classified++;
      } else {
        // 负向词汇智能分类
        if (/[怒气恼恨厌烦]/.test(word)) {
          this.emotionCategories['愤怒'].push(word);
        } else if (/[悲哀苦痛伤心哭]/.test(word)) {
          this.emotionCategories['悲伤'].push(word);
        } else if (/[急慌忧虑恐怕担]/.test(word)) {
          this.emotionCategories['焦虑'].push(word);
        } else if (/[累困乏倦疲]/.test(word)) {
          this.emotionCategories['疲惫'].push(word);
        } else if (/[闷无聊乏味]/.test(word)) {
          this.emotionCategories['无聊'].push(word);
        } else {
          // 默认归类为悲伤
          this.emotionCategories['悲伤'].push(word);
        }
        this.stats.unclassified++;
      }
    }
  }
  
  /**
   * 为每个词汇计算情绪强度值
   */
  calculateIntensity(word, emotion) {
    let intensity = 0.5; // 默认强度
    
    // 基于词长度调整
    if (word.length >= 3) intensity += 0.1;
    if (word.length >= 4) intensity += 0.1;
    
    // 基于特殊字符调整
    const intensifiers = ['很', '非常', '极', '特别', '超', '巨', '超级', '十分', '万分'];
    const hasIntensifier = intensifiers.some(i => word.includes(i));
    if (hasIntensifier) intensity += 0.2;
    
    // 基于重复字符
    if (/(.)\1/.test(word)) intensity += 0.1;
    
    // 确保在0.1-1.0范围内
    return Math.max(0.1, Math.min(1.0, intensity));
  }
  
  /**
   * 处理主函数
   */
  async process() {
    console.log('🚀 开始处理NTUSD中文情绪词典...\n');
    
    // 1. 读取文件
    console.log('📖 读取词典文件...');
    const positiveContent = this.readFile(this.positiveFile);
    const negativeContent = this.readFile(this.negativeFile);
    
    // 2. 解析内容
    console.log('🔍 解析词典内容...');
    const positiveWords = this.parseContent(positiveContent);
    const negativeWords = this.parseContent(negativeContent);
    
    this.stats.positive = positiveWords.length;
    this.stats.negative = negativeWords.length;
    this.stats.total = this.stats.positive + this.stats.negative;
    
    console.log(`  正向词汇: ${this.stats.positive}个`);
    console.log(`  负向词汇: ${this.stats.negative}个`);
    console.log(`  总词汇: ${this.stats.total}个\n`);
    
    // 3. 分类情绪
    console.log('🎭 分类情绪...');
    this.classifyPositiveWords(positiveWords);
    this.classifyNegativeWords(negativeWords);
    
    // 4. 计算情绪强度
    console.log('⚡ 计算情绪强度...');
    const emotionDictionary = {};
    
    for (const [emotion, words] of Object.entries(this.emotionCategories)) {
      emotionDictionary[emotion] = words.map(word => ({
        word: word,
        intensity: this.calculateIntensity(word, emotion),
        source: 'NTUSD'
      }));
    }
    
    // 5. 生成输出
    const output = {
      metadata: {
        source: 'NTUSD (National Taiwan University Sentiment Dictionary)',
        version: '2024-enhanced',
        description: '台湾大学情感词典简体中文版，经AI增强分类',
        totalWords: this.stats.total,
        positiveWords: this.stats.positive,
        negativeWords: this.stats.negative,
        classifiedWords: this.stats.classified,
        unclassifiedWords: this.stats.unclassified,
        categories: Object.keys(this.emotionCategories).length,
        processedDate: new Date().toISOString(),
        wuxingMapping: this.wuxingMapping
      },
      emotions: emotionDictionary,
      statistics: this.generateStatistics(),
      wuxingAnalysis: this.generateWuxingAnalysis()
    };
    
    // 6. 保存文件
    const outputPath = path.join(this.dataDir, 'ntusd-processed.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`💾 已保存到: ${outputPath}\n`);
    
    // 7. 生成压缩版本和估算大小
    await this.generateCompressedVersions(output);
    
    // 8. 显示详细统计
    this.printDetailedStats();
    
    // 9. 生成集成建议
    this.generateIntegrationAdvice();
    
    return output;
  }
  
  /**
   * 生成统计信息
   */
  generateStatistics() {
    const stats = {};
    
    for (const [emotion, words] of Object.entries(this.emotionCategories)) {
      stats[emotion] = {
        count: words.length,
        percentage: ((words.length / this.stats.total) * 100).toFixed(2),
        avgIntensity: words.length > 0 ? 
          (words.reduce((sum, word) => sum + this.calculateIntensity(word, emotion), 0) / words.length).toFixed(3) : 0,
        samples: words.slice(0, 5) // 前5个示例
      };
    }
    
    return stats;
  }
  
  /**
   * 生成五行分析
   */
  generateWuxingAnalysis() {
    const analysis = {};
    
    for (const [wuxing, emotion] of Object.entries(this.wuxingMapping)) {
      const words = this.emotionCategories[emotion];
      analysis[wuxing] = {
        emotion: emotion,
        wordCount: words.length,
        percentage: ((words.length / this.stats.total) * 100).toFixed(2),
        characteristic: this.getWuxingCharacteristic(wuxing),
        samples: words.slice(0, 3)
      };
    }
    
    return analysis;
  }
  
  /**
   * 获取五行特征描述
   */
  getWuxingCharacteristic(wuxing) {
    const characteristics = {
      '木': '生发向上，积极成长，代表希望和活力',
      '火': '热烈奔放，情绪激烈，代表激情和冲动', 
      '土': '沉稳厚重，情绪深沉，代表稳定和忧郁',
      '金': '收敛内敛，理性平静，代表冷静和节制',
      '水': '流动变化，情绪不定，代表灵活和不安'
    };
    
    return characteristics[wuxing] || '';
  }
  
  /**
   * 生成压缩版本和估算大小
   */
  async generateCompressedVersions(data) {
    console.log('📦 生成压缩版本...');
    
    const jsonString = JSON.stringify(data);
    const minifiedString = JSON.stringify(data);
    
    // 计算原始大小
    const originalSize = Buffer.byteLength(jsonString, 'utf8');
    console.log(`  原始JSON大小: ${(originalSize / 1024).toFixed(2)} KB`);
    
    // Gzip压缩
    const gzipped = zlib.gzipSync(jsonString);
    const gzipSize = gzipped.length;
    console.log(`  Gzip压缩后: ${(gzipSize / 1024).toFixed(2)} KB (压缩率: ${(100 - gzipSize/originalSize*100).toFixed(1)}%)`);
    
    // 保存压缩文件
    fs.writeFileSync(path.join(this.dataDir, 'ntusd-processed.json.gz'), gzipped);
    
    // 生成轻量版（只包含词汇，不含元数据）
    const lightweightData = { emotions: data.emotions };
    const lightweightString = JSON.stringify(lightweightData);
    const lightweightSize = Buffer.byteLength(lightweightString, 'utf8');
    const lightweightGzipped = zlib.gzipSync(lightweightString);
    const lightweightGzipSize = lightweightGzipped.length;
    
    console.log(`  轻量版大小: ${(lightweightSize / 1024).toFixed(2)} KB`);
    console.log(`  轻量版Gzip: ${(lightweightGzipSize / 1024).toFixed(2)} KB\n`);
    
    fs.writeFileSync(path.join(this.dataDir, 'ntusd-lightweight.json'), lightweightString);
    fs.writeFileSync(path.join(this.dataDir, 'ntusd-lightweight.json.gz'), lightweightGzipped);
  }
  
  /**
   * 打印详细统计信息
   */
  printDetailedStats() {
    console.log('📊 详细统计信息:');
    console.log('='.repeat(50));
    
    for (const [emotion, words] of Object.entries(this.emotionCategories)) {
      const count = words.length;
      const percentage = ((count / this.stats.total) * 100).toFixed(1);
      const wuxing = Object.keys(this.wuxingMapping).find(k => this.wuxingMapping[k] === emotion) || '未映射';
      
      console.log(`${emotion} (${wuxing}): ${count}个词 (${percentage}%)`);
      console.log(`  示例: ${words.slice(0, 10).join('、')}`);
      console.log('');
    }
  }
  
  /**
   * 生成集成建议
   */
  generateIntegrationAdvice() {
    console.log('💡 集成建议:');
    console.log('='.repeat(50));
    
    console.log('1. 🔄 融合方式建议:');
    console.log('   - 与现有alias词典并行使用，NTUSD作为基础词典，alias作为现代化补充');
    console.log('   - 优先级：alias词典 > NTUSD词典（现代用语优先）');
    console.log('   - 使用双层匹配：先匹配alias，未命中再匹配NTUSD');
    
    console.log('\n2. ⚡ 性能优化建议:');
    console.log('   - 使用轻量版词典（约30KB压缩）适合CLI离线集成');
    console.log('   - 实现词典索引和缓存机制');
    console.log('   - 按词长度预排序，优先匹配长词组');
    
    console.log('\n3. 🎯 置信度改进建议:');
    console.log('   - 为每个词附带情绪强度值（0.1-1.0）');
    console.log('   - 结合词频和情绪强度计算最终置信度');
    console.log('   - 实现上下文权重调整');
    
    console.log('\n4. 📈 扩展功能建议:');
    console.log('   - 支持词性标注（形容词、动词、名词等）');
    console.log('   - 添加情绪极性强度（正向强度、负向强度）');
    console.log('   - 实现情绪词组合匹配（如"不开心"="不"+"开心"）');
    
    console.log('\n5. 🔮 五行映射应用:');
    console.log('   - 根据用户五行属性调整情绪识别权重');
    console.log('   - 提供五行相生相克的情绪调节建议');
    console.log('   - 实现个性化情绪分析模型');
  }
}

// 如果直接运行脚本
if (require.main === module) {
  const processor = new NTUSDProcessor();
  processor.process().catch(console.error);
}

module.exports = NTUSDProcessor;