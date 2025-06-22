#!/usr/bin/env node

const { program } = require('commander');
const BaziCalculator = require('../lib/bazi-calculator');
const OutputFormatter = require('../lib/output-formatter');
const { generateMoodSuggestion, formatMoodForCLI } = require('../lib/mood/moodSuggestion');
const { learningEngine } = require('../lib/mood/learningEngine');
const InputValidator = require('../lib/utils/InputValidator');
const ProgrammerEasterEggs = require('../lib/features/ProgrammerEasterEggs');

const calculator = new BaziCalculator();
const formatter = new OutputFormatter();

program
  .name('soul-mirror')
  .description('🔮 Soul Mirror - 程序员的八字命理工具')
  .version('1.0.0');

program
  .option('-b, --birthday <date>', '出生日期 (格式: YYYY-MM-DD)')
  .option('-t, --time <hour>', '出生时辰 (格式: HH, 0-23)', '12')
  .option('-m, --mood <text>', '当前情绪状态 (中文自然语言描述)')
  .option('-i, --insights', '显示个人情绪分析洞察')
  .option('--talisman', '获取程序员专属护符和运势')
  .option('--zen', '显示编程禅语')
  .option('--debug', '显示详细调试信息')
  .option('--verbose', '详细模式：显示情绪分析过程和五行互动')
  .option('--verify', '验证计算一致性(运行多次测试)')
  .action((options) => {
    // 特殊功能处理
    if (options.zen) {
      const zen = ProgrammerEasterEggs.getCodeZen();
      console.log(`\n✨ 编程禅语：\n${zen}\n`);
      return;
    }
    
    // 如果只是要查看情绪洞察，不需要生日
    if (options.insights && !options.birthday) {
      const insights = learningEngine.getPersonalInsights();
      console.log(formatter.formatInsights(insights));
      return;
    }

    if (!options.birthday) {
      console.log(formatter.formatError(new Error('请提供出生日期，使用 --birthday 参数')));
      console.log(formatter.formatHelp());
      process.exit(1);
    }

    // 使用增强的输入验证
    try {
      const validatedInput = InputValidator.validateFullInput({
        birthday: options.birthday,
        time: options.time,
        mood: options.mood
      });
      
      // 使用验证后的值
      options.birthday = validatedInput.birthday;
      if (validatedInput.time !== undefined) options.time = validatedInput.time;
      if (validatedInput.mood) options.mood = validatedInput.mood;
      
    } catch (validationError) {
      console.log(formatter.formatError(validationError));
      console.log(formatter.formatHelp());
      process.exit(1);
    }

    const hour = options.time;

    try {
      // 设置调试模式
      if (options.debug) {
        process.env.DEBUG_BAZI = 'true';
      }
      
      // 验证模式：运行多次计算检查一致性
      if (options.verify) {
        console.log('🔍 验证计算一致性...\n');
        const results = [];
        const iterations = 10;
        
        for (let i = 1; i <= iterations; i++) {
          const bazi = calculator.calculateBazi(options.birthday, hour);
          results.push(`${bazi.year} ${bazi.month} ${bazi.day} ${bazi.hour}`);
          console.log(`第${i}次: ${results[i-1]}`);
          
          // 小延迟以测试时间依赖性
          if (i < iterations) {
            const start = Date.now();
            while (Date.now() - start < 10) {} // 10ms delay
          }
        }
        
        // 检查一致性
        const unique = [...new Set(results)];
        if (unique.length === 1) {
          console.log('\n✅ 计算结果一致！');
          console.log(`统一结果: ${unique[0]}`);
        } else {
          console.log('\n❌ 发现不一致结果:');
          unique.forEach((result, index) => {
            const count = results.filter(r => r === result).length;
            console.log(`  ${result} (出现${count}次)`);
          });
        }
        
        if (options.debug) {
          console.log('\n调试信息:');
          const lastBazi = calculator.calculateBazi(options.birthday, hour);
          console.log(JSON.stringify(lastBazi._debug, null, 2));
        }
        
        return;
      }
      
      // 正常计算八字
      const bazi = calculator.calculateBazi(options.birthday, hour);
      
      // 调试信息输出
      if (options.debug) {
        console.log('🔧 调试信息:');
        console.log(JSON.stringify(bazi._debug, null, 2));
        console.log('');
      }
      
      // 分析五行
      const wuxing = calculator.analyzeWuxing(bazi);
      
      // 生成今日卦象
      const gua = calculator.getTodayGua(bazi);
      
      // 情绪分析（如果提供了情绪文本）
      let moodResult = null;
      if (options.mood) {
        moodResult = generateMoodSuggestion(options.mood, { wuxing });
        
        // 详细模式输出
        if (options.verbose && moodResult) {
          console.log('\n🔍 详细情绪分析过程:');
          console.log('━'.repeat(50));
          
          // 显示匹配的关键词
          if (moodResult.analysis.hits && moodResult.analysis.hits.length > 0) {
            console.log(`📝 匹配关键词: ${moodResult.analysis.hits.join(', ')}`);
          }
          
          // 显示所有情绪得分
          if (moodResult.analysis.scores) {
            console.log('📊 各情绪得分:');
            Object.entries(moodResult.analysis.scores)
              .sort(([,a], [,b]) => b - a)
              .forEach(([emotion, score]) => {
                const bar = '█'.repeat(Math.round(score)) + '░'.repeat(Math.max(0, 5 - Math.round(score)));
                console.log(`   ${emotion}: ${bar} ${score.toFixed(1)}分`);
              });
          }
          
          // 显示上下文修正信息
          if (moodResult.analysis.corrections) {
            const corrections = moodResult.analysis.corrections;
            console.log('🔧 上下文修正:');
            console.log(`   时间权重: ${corrections.timeWeight.toFixed(2)}x`);
            console.log(`   上下文加成: +${corrections.contextBonus.toFixed(2)}`);
            console.log(`   强度倍数: ${corrections.intensityMultiplier.toFixed(2)}x`);
            
            if (corrections.appliedRules && corrections.appliedRules.length > 0) {
              console.log('   应用规则:');
              corrections.appliedRules.forEach(rule => {
                console.log(`     - ${rule.context}: ${rule.reason} (+${rule.bonus.toFixed(2)})`);
              });
            }
          }
          
          // 显示情绪组分析
          if (moodResult.analysis.emotionGroup) {
            const group = moodResult.analysis.emotionGroup.main;
            console.log('🎭 情绪组分析:');
            console.log(`   组别: ${group.group.name} ${group.group.icon}`);
            console.log(`   强度: ${group.intensity.name} (${group.intensity.level}%)`);
            console.log(`   特征: ${group.group.characteristics.join('、')}`);
          }
          
          console.log('━'.repeat(50));
        }
      }
      
      // 格式化输出
      const output = formatter.formatOutput({
        bazi,
        wuxing,
        gua,
        mood: moodResult
      });
      
      console.log(output);
      
      // 护符功能
      if (options.talisman) {
        const talisman = ProgrammerEasterEggs.getProgrammerTalisman(
          wuxing.dominant, 
          moodResult?.analysis?.main || '平静'
        );
        const fortune = ProgrammerEasterEggs.getProgrammingFortune({ wuxing, gua });
        
        console.log('\n' + '🔮'.repeat(20));
        console.log('✨ 程序员专属护符 ✨');
        console.log('🔮'.repeat(20));
        console.log(`\n${talisman.symbol} 护符: ${talisman.wuxing}型 - ${talisman.emotion}态`);
        console.log(`🔮 咒语: ${talisman.mantra}`);
        console.log(`💫 祝福: ${talisman.blessing}`);
        console.log(`🛡️ 守护: ${talisman.protection}`);
        console.log(`📋 序列号: ${talisman.serialNumber}`);
        
        console.log(`\n${fortune.theme}`);
        console.log(`💰 今日幸运语言: ${fortune.luckyLanguage}`);
        console.log(`⏰ 幸运时段: ${fortune.luckyTime}`);
        console.log(`🎯 适合: ${fortune.lucky.join('、')}`);
        console.log(`⚠️ 避免: ${fortune.avoid.join('、')}`);
        console.log(`\n${fortune.zen}`);
      }
      
    } catch (error) {
      console.log(formatter.formatError(error));
      process.exit(1);
    }
  });

// 添加帮助命令
program
  .command('help')
  .description('显示帮助信息')
  .action(() => {
    console.log(formatter.formatHelp());
  });

// 如果没有参数，显示帮助
if (process.argv.length === 2) {
  console.log(formatter.formatHelp());
}

program.parse();
