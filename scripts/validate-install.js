#!/usr/bin/env node
/**
 * 安装验证脚本
 * 检查 Soul Mirror CLI 的安装完整性和运行环境
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class InstallationValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.projectRoot = path.join(__dirname, '..');
  }
  
  /**
   * 运行完整验证
   */
  async validate() {
    console.log('🔍 Soul Mirror 安装验证开始...\n');
    
    // 基础环境检查
    this.checkNodeVersion();
    this.checkNpmVersion();
    
    // 文件完整性检查
    this.checkRequiredFiles();
    this.checkDependencies();
    
    // 功能性检查
    await this.checkCoreFunctionality();
    
    // 终端兼容性检查
    this.checkTerminalCompatibility();
    
    // 输出结果
    this.outputResults();
    
    // 返回验证状态
    return this.errors.length === 0;
  }
  
  /**
   * 检查 Node.js 版本
   */
  checkNodeVersion() {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 14) {
      this.errors.push(`Node.js 版本过低: ${nodeVersion}, 需要 >= 14.0.0`);
    } else {
      console.log(`✅ Node.js 版本: ${nodeVersion}`);
    }
  }
  
  /**
   * 检查 npm 版本
   */
  checkNpmVersion() {
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      const majorVersion = parseInt(npmVersion.split('.')[0]);
      
      if (majorVersion < 6) {
        this.warnings.push(`npm 版本较低: ${npmVersion}, 建议 >= 6.0.0`);
      } else {
        console.log(`✅ npm 版本: ${npmVersion}`);
      }
    } catch (error) {
      this.errors.push('无法检测 npm 版本');
    }
  }
  
  /**
   * 检查必需文件
   */
  checkRequiredFiles() {
    const requiredFiles = [
      'bin/cli.js',
      'lib/bazi-calculator.js',
      'lib/output-formatter.js',
      'lib/mood/detectMood.js',
      'lib/mood/zh-alias-improved.json',
      'package.json',
      'README.md',
      'LICENSE'
    ];
    
    console.log('📁 检查必需文件...');
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      if (fs.existsSync(filePath)) {
        console.log(`  ✅ ${file}`);
      } else {
        this.errors.push(`缺失必需文件: ${file}`);
      }
    }
  }
  
  /**
   * 检查依赖
   */
  checkDependencies() {
    console.log('📦 检查依赖...');
    
    try {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
      );
      
      const dependencies = packageJson.dependencies || {};
      
      for (const [dep, version] of Object.entries(dependencies)) {
        try {
          require.resolve(path.join(this.projectRoot, 'node_modules', dep));
          console.log(`  ✅ ${dep}@${version}`);
        } catch (error) {
          this.errors.push(`缺失依赖: ${dep}@${version}`);
        }
      }
    } catch (error) {
      this.errors.push('无法读取 package.json');
    }
  }
  
  /**
   * 检查核心功能
   */
  async checkCoreFunctionality() {
    console.log('⚙️ 检查核心功能...');
    
    try {
      // 测试八字计算
      const BaziCalculator = require(path.join(this.projectRoot, 'lib/bazi-calculator'));
      const calculator = new BaziCalculator();
      const bazi = calculator.calculateBazi('1996-12-19', 14);
      
      if (bazi && bazi.year && bazi.month && bazi.day && bazi.hour) {
        console.log('  ✅ 八字计算功能');
      } else {
        this.errors.push('八字计算功能异常');
      }
      
      // 测试情绪分析
      const { analyzeMood } = require(path.join(this.projectRoot, 'lib/mood/detectMood'));
      const moodResult = analyzeMood('今天心情不错');
      
      if (moodResult && moodResult.main && typeof moodResult.confidence === 'number') {
        console.log('  ✅ 情绪分析功能');
      } else {
        this.errors.push('情绪分析功能异常');
      }
      
      // 测试输出格式化
      const OutputFormatter = require(path.join(this.projectRoot, 'lib/output-formatter'));
      const formatter = new OutputFormatter();
      const testData = {
        bazi: bazi,
        wuxing: calculator.analyzeWuxing(bazi),
        gua: calculator.getTodayGua(bazi)
      };
      
      const output = formatter.formatOutput(testData);
      if (typeof output === 'string' && output.length > 100) {
        console.log('  ✅ 输出格式化功能');
      } else {
        this.errors.push('输出格式化功能异常');
      }
      
    } catch (error) {
      this.errors.push(`核心功能测试失败: ${error.message}`);
    }
  }
  
  /**
   * 检查终端兼容性
   */
  checkTerminalCompatibility() {
    console.log('🖥️ 检查终端兼容性...');
    
    try {
      const TerminalCapabilities = require(path.join(this.projectRoot, 'lib/utils/TerminalCapabilities'));
      const terminal = new TerminalCapabilities();
      const capabilities = terminal.capabilities;
      
      console.log(`  📱 终端类型: ${capabilities.terminalType}`);
      console.log(`  🎨 颜色支持: ${capabilities.supportsColor ? '是' : '否'}`);
      console.log(`  📝 Unicode支持: ${capabilities.supportsUnicode ? '是' : '否'}`);
      console.log(`  😀 Emoji支持: ${capabilities.supportsEmoji ? '是' : '否'}`);
      
      if (!capabilities.supportsColor) {
        this.warnings.push('终端不支持颜色显示，将使用纯文本模式');
      }
      
      if (!capabilities.supportsUnicode) {
        this.warnings.push('终端不支持Unicode字符，将使用ASCII字符');
      }
      
    } catch (error) {
      this.warnings.push(`终端兼容性检查失败: ${error.message}`);
    }
  }
  
  /**
   * 输出验证结果
   */
  outputResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📋 验证结果汇总');
    console.log('='.repeat(50));
    
    if (this.errors.length === 0) {
      console.log('🎉 恭喜！Soul Mirror 安装验证通过');
      console.log('   可以开始使用了！');
      
      console.log('\n💡 快速开始:');
      console.log('   soul-mirror --birthday 1996-12-19 --time 14');
      console.log('   soul-mirror --birthday 1996-12-19 --time 14 --mood "今天心情不错"');
      
    } else {
      console.log('❌ 发现问题，需要修复:');
      this.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 警告信息:');
      this.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    console.log('='.repeat(50));
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const validator = new InstallationValidator();
  validator.validate().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('验证过程出错:', error);
    process.exit(1);
  });
}

module.exports = InstallationValidator;