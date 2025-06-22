/**
 * 情绪分析功能测试
 * 测试情绪识别的准确性和边界情况
 */

const { analyzeMood } = require('../lib/mood/detectMood');

class EmotionTester {
  constructor() {
    this.testCases = [
      // 高兴情绪测试
      { input: '今天代码写得high爆了', expected: '高兴', description: '网络用语-高兴' },
      { input: '太开心了', expected: '高兴', description: '基础表达-高兴' },
      { input: 'yyds真香', expected: '高兴', description: '网络流行语-高兴' },
      
      // 愤怒情绪测试
      { input: '又出现新bug了，气死了', expected: '愤怒', description: '编程场景-愤怒' },
      { input: 'wtf这是什么鬼', expected: '愤怒', description: '英文表达-愤怒' },
      { input: '离谱', expected: '愤怒', description: '简短表达-愤怒' },
      
      // 悲伤情绪测试
      { input: 'emo了，心情很糟', expected: '悲伤', description: '网络用语-悲伤' },
      { input: '破防了', expected: '悲伤', description: '流行语-悲伤' },
      
      // 焦虑情绪测试
      { input: 'deadline快到了，压力山大', expected: '焦虑', description: '工作压力-焦虑' },
      { input: '有点慌', expected: '焦虑', description: '简单表达-焦虑' },
      
      // 疲惫情绪测试
      { input: '累成狗了', expected: '疲惫', description: '网络用语-疲惫' },
      { input: '电量不足', expected: '疲惫', description: '比喻表达-疲惫' },
      
      // 平静情绪测试
      { input: '佛系', expected: '平静', description: '网络用语-平静' },
      { input: '心如止水', expected: '平静', description: '文雅表达-平静' },
      
      // 边界情况测试
      { input: '', expected: '平静', description: '空字符串' },
      { input: '哈', expected: '高兴', description: '单字符' },
      { input: '今天天气不错，心情也还可以，代码写得顺利，团队合作愉快', expected: '高兴', description: '长文本' }
    ];
    
    this.passCount = 0;
    this.failCount = 0;
    this.results = [];
  }
  
  /**
   * 运行所有测试
   */
  runAllTests() {
    console.log('🧪 开始情绪分析测试...\n');
    
    this.testCases.forEach((testCase, index) => {
      this.runSingleTest(testCase, index + 1);
    });
    
    this.printSummary();
    return this.failCount === 0;
  }
  
  /**
   * 运行单个测试
   */
  runSingleTest(testCase, testNumber) {
    try {
      const result = analyzeMood(testCase.input);
      const detected = result.main;
      const confidence = result.confidence;
      
      const passed = detected === testCase.expected;
      
      if (passed) {
        this.passCount++;
        console.log(`✅ 测试 ${testNumber}: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        console.log(`   期望: ${testCase.expected} | 实际: ${detected} | 置信度: ${confidence}%`);
      } else {
        this.failCount++;
        console.log(`❌ 测试 ${testNumber}: ${testCase.description}`);
        console.log(`   输入: "${testCase.input}"`);
        console.log(`   期望: ${testCase.expected} | 实际: ${detected} | 置信度: ${confidence}%`);
        
        // 显示详细分析信息
        if (result.hits && result.hits.length > 0) {
          console.log(`   匹配词汇: ${result.hits.join(', ')}`);
        }
      }
      
      this.results.push({
        testNumber,
        input: testCase.input,
        expected: testCase.expected,
        actual: detected,
        confidence: confidence,
        passed: passed,
        description: testCase.description
      });
      
      console.log('');
      
    } catch (error) {
      this.failCount++;
      console.log(`💥 测试 ${testNumber} 异常: ${testCase.description}`);
      console.log(`   错误: ${error.message}`);
      console.log('');
    }
  }
  
  /**
   * 打印测试总结
   */
  printSummary() {
    console.log('='.repeat(50));
    console.log('📊 测试结果总结');
    console.log('='.repeat(50));
    
    const totalTests = this.testCases.length;
    const passRate = ((this.passCount / totalTests) * 100).toFixed(1);
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${this.passCount}`);
    console.log(`失败: ${this.failCount}`);
    console.log(`通过率: ${passRate}%`);
    
    if (this.failCount === 0) {
      console.log('\n🎉 所有测试通过！情绪分析功能运行正常');
    } else {
      console.log('\n⚠️ 部分测试失败，需要优化情绪识别算法');
      
      // 显示失败的测试
      console.log('\n失败的测试:');
      this.results
        .filter(r => !r.passed)
        .forEach(r => {
          console.log(`  - ${r.description}: 期望 ${r.expected}, 实际 ${r.actual}`);
        });
    }
    
    // 置信度分析
    const avgConfidence = this.results.reduce((sum, r) => sum + r.confidence, 0) / this.results.length;
    console.log(`\n平均置信度: ${avgConfidence.toFixed(1)}%`);
    
    const lowConfidenceTests = this.results.filter(r => r.confidence < 30);
    if (lowConfidenceTests.length > 0) {
      console.log(`低置信度测试 (<30%): ${lowConfidenceTests.length}个`);
    }
    
    console.log('='.repeat(50));
  }
  
  /**
   * 测试置信度计算
   */
  testConfidenceLevels() {
    console.log('\n🎯 置信度测试...');
    
    const confidenceTests = [
      '今天心情很好',           // 应该有中等置信度
      'high爆了爽翻天开心死了', // 应该有高置信度
      '嗯',                     // 应该有低置信度
      '不知道怎么说',           // 应该有低置信度
    ];
    
    confidenceTests.forEach(text => {
      const result = analyzeMood(text);
      console.log(`"${text}" -> ${result.main} (${result.confidence}%)`);
    });
  }
  
  /**
   * 测试边界情况
   */
  testEdgeCases() {
    console.log('\n🚨 边界情况测试...');
    
    const edgeCases = [
      '',                           // 空字符串
      '   ',                        // 空白字符
      '123456',                     // 纯数字
      'abcdef',                     // 纯英文
      '。。。',                     // 纯标点
      'A'.repeat(1000),             // 超长字符串
      '😀😊😂',                     // 纯emoji
    ];
    
    edgeCases.forEach(text => {
      try {
        const result = analyzeMood(text);
        console.log(`✅ "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}" -> ${result.main} (${result.confidence}%)`);
      } catch (error) {
        console.log(`❌ "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}" -> 错误: ${error.message}`);
      }
    });
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const tester = new EmotionTester();
  
  const success = tester.runAllTests();
  tester.testConfidenceLevels();
  tester.testEdgeCases();
  
  process.exit(success ? 0 : 1);
}

module.exports = EmotionTester;