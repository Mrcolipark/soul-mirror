const chalk = require('chalk');
const TerminalCapabilities = require('./utils/TerminalCapabilities');
const { WuxingInteractionAnalyzer } = require('./wuxing/interactionAnalyzer');

class OutputFormatter {
  constructor() {
    this.terminal = new TerminalCapabilities();
    this.charset = this.terminal.getCharacterSet();
    this.colors = this.terminal.getColorFunctions(chalk);
    this.interactionAnalyzer = new WuxingInteractionAnalyzer();
    
    // 使用适配的字符集
    this.boxDrawing = this.charset.box;
    this.progressChars = this.charset.progress;
    this.icons = this.charset.icons;
  }

  /**
   * 格式化完整输出
   */
  formatOutput(data) {
    const output = [];
    
    // 标题
    output.push('\n🔮 Soul Mirror v1.0\n');
    
    // 八字命盘
    output.push(this.formatBaziSection(data.bazi));
    
    // 五行分析
    output.push(this.formatWuxingSection(data.wuxing));
    
    // 五行关系分析
    output.push(this.formatWuxingRelationSection(data.wuxing));
    
    // 今日卦象
    output.push(this.formatGuaSection(data.gua));
    
    // 情绪分析（如果有）
    if (data.mood) {
      output.push(this.formatMoodSection(data.mood));
    }
    
    // 今日建议（基于情绪动态生成）
    output.push(this.formatAdvice(data.wuxing, data.mood));
    
    return output.join('\n');
  }

  /**
   * 格式化八字命盘部分
   */
  formatBaziSection(bazi) {
    const lines = [];
    const width = 37;
    const title = '🎯 八字命盘';
    
    lines.push(this.createBox(
      title,
      [`  年柱: ${bazi.year}  月柱: ${bazi.month}`,
       `  日柱: ${bazi.day}  时柱: ${bazi.hour}`],
      width
    ));
    
    return lines.join('\n');
  }

  /**
   * 格式化五行分析部分（专业版）
   */
  formatWuxingSection(wuxing) {
    const lines = [];
    const width = 39;
    const title = '🌈 五行分析';
    
    const content = [];
    
    // 五行进度条和分数
    const elements = ['木', '火', '土', '金', '水'];
    elements.forEach(element => {
      const score = wuxing.scores[element];
      const percentage = wuxing.percentages[element];
      const bar = this.createProgressBar(percentage);
      const scoreStr = score.toFixed(1);
      const line = `  ${element}: ${bar} ${scoreStr}分 (${percentage.toString().padStart(2)}%)`;
      content.push(line);
    });
    
    content.push('');
    content.push(`  主导元素: ${wuxing.dominant} (${wuxing.scores[wuxing.dominant].toFixed(1)}分)`);
    content.push(`  程序员类型: ${wuxing.programmerType.name}`);
    
    // 显示当前系统时间的季节，增加信任感
    const currentDate = new Date();
    const timeStr = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
    content.push(`  当前季节: ${wuxing.season}季 (${timeStr}节气调节)`);
    content.push('');
    content.push('  详细统计:');
    
    // 天干统计
    const tianganSummary = this._formatElementSummary(wuxing.tianganCount);
    if (tianganSummary) {
      content.push(`  天干: ${tianganSummary}`);
    }
    
    // 地支统计
    const dizhiSummary = this._formatElementSummary(wuxing.dizhiCount);
    if (dizhiSummary) {
      content.push(`  地支: ${dizhiSummary}`);
    }
    
    lines.push(this.createBox(title, content, width));
    
    return lines.join('\n');
  }
  
  /**
   * 格式化元素统计摘要
   * @private
   */
  _formatElementSummary(elementCount) {
    const summary = [];
    Object.entries(elementCount).forEach(([element, count]) => {
      if (count > 0) {
        const countStr = Number.isInteger(count) ? count.toString() : count.toFixed(1);
        summary.push(`${element}${countStr}`);
      }
    });
    return summary.join(' ');
  }

  /**
   * 格式化五行关系分析部分
   */
  formatWuxingRelationSection(wuxing) {
    const lines = [];
    const width = 45;
    const title = '⚡ 五行关系分析';
    
    const content = [];
    const dominant = wuxing.dominant;
    
    // 获取关系网络
    const network = this.interactionAnalyzer.getRelationshipNetwork(dominant);
    
    // 基本关系显示
    content.push(`  主导五行: ${dominant}型`);
    content.push('');
    content.push('  相生相克关系:');
    content.push(`  🌱 我生: ${network.generates || '无'} | 生我: ${network.generatedBy || '无'}`);
    content.push(`  ⚔️ 我克: ${network.restrains || '无'} | 克我: ${network.restrainedBy || '无'}`);
    content.push('');
    
    // 今日时势影响
    const todayInfluence = this.interactionAnalyzer.getTodayInfluence(dominant);
    content.push('  今日时势:');
    content.push(`  🌸 ${todayInfluence.seasonal.season}季(${todayInfluence.seasonal.element}性) | 当前时辰(${todayInfluence.hourly}性)`);
    
    // 季节影响
    if (todayInfluence.seasonalEffect.type === 'same') {
      content.push(`  🌟 ${todayInfluence.seasonal.season}季${dominant}性当令，发挥天赋的好时机！`);
    } else if (todayInfluence.seasonalEffect.type === 'sheng') {
      const relationship = todayInfluence.seasonalEffect.role === 'passive' ? '有利' : '支持';
      content.push(`  🌱 ${todayInfluence.seasonal.season}季对${dominant}型${relationship}，要积极把握`);
    } else if (todayInfluence.seasonalEffect.type === 'ke') {
      const relationship = todayInfluence.seasonalEffect.role === 'passive' ? '有挑战' : '需克制';
      content.push(`  ⚠️ ${todayInfluence.seasonal.season}季对${dominant}型${relationship}，需小心应对`);
    }
    
    // 时辰建议
    if (todayInfluence.hourlyEffect.type === 'sheng' && todayInfluence.hourlyEffect.role === 'passive') {
      content.push(`  💫 当前时辰有利，适合重要决策和关键任务`);
    } else if (todayInfluence.hourlyEffect.type === 'ke' && todayInfluence.hourlyEffect.role === 'passive') {
      content.push(`  🕐 当前时辰需谨慎，避免冲动决策`);
    } else {
      content.push(`  ⚖️ 当前时辰保持${dominant}型本色，稳步推进`);
    }
    
    lines.push(this.createBox(title, content, width));
    
    return lines.join('\n');
  }

  /**
   * 格式化卦象部分（专业版）
   */
  formatGuaSection(gua) {
    const lines = [];
    const width = 39;
    
    // 动态显示当前日期，增加信任感
    const currentDate = new Date();
    const dateStr = `${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
    const title = `📿 今日卦象 (${dateStr})`;
    
    const content = [
      `  本卦: ${gua.name} (${gua.symbol})`,
      `  卦意: ${gua.meaning}`,
      ''
    ];
    
    // 显示今日主题
    if (gua.todayFocus) {
      content.push(`  🎯 ${gua.todayFocus}`);
    }
    
    // 显示代码建议
    if (gua.codeAdvice) {
      content.push(`  💻 代码建议: ${gua.codeAdvice}`);
    }
    
    // 显示团队建议
    if (gua.teamAdvice) {
      content.push(`  👥 团队建议: ${gua.teamAdvice}`);
    }
    
    // 显示注意事项
    if (gua.avoid) {
      content.push(`  ⚠️  注意事项: ${gua.avoid}`);
    }
    
    // 显示变爻信息
    if (gua.dongYao) {
      content.push('');
      const yaoNames = ['', '初', '二', '三', '四', '五', '上'];
      const yaoName = yaoNames[gua.dongYao] || gua.dongYao;
      content.push(`  变爻: ${yaoName}爻动`);
    }
    
    // 显示八卦信息（技术细节）
    if (gua.shangBagua && gua.xiaBagua) {
      content.push(`  构成: ${gua.shangBagua.name}${gua.shangBagua.nature}上，${gua.xiaBagua.name}${gua.xiaBagua.nature}下`);
    }
    
    lines.push(this.createBox(title, content, width));
    
    return lines.join('\n');
  }

  /**
   * 格式化情绪分析部分
   */
  formatMoodSection(moodResult) {
    const lines = [];
    const width = 55;
    const title = '🎭 情绪分析';
    
    const content = [];
    
    // 情绪识别结果
    const { analysis, suggestion, emotionalGuidance, personalizedAdvice, wuxingEmotionAdvice } = moodResult;
    
    // 渐进式置信度显示
    const confidenceDisplay = this.formatConfidenceLevel(analysis.confidence);
    content.push(`  ${confidenceDisplay}: ${analysis.main} ${analysis.emoji || ''}`);
    
    if (analysis.secondary && analysis.secondary.length > 0) {
      content.push(`  次要情绪: ${analysis.secondary.join('、')}`);
    }
    
    // 显示情绪组信息
    if (analysis.emotionGroup && analysis.emotionGroup.main) {
      const group = analysis.emotionGroup.main.group;
      content.push(`  ${group.icon} ${analysis.emotionGroup.summary}`);
    }
    
    content.push(`  五行属性: ${analysis.element} | 置信度: ${analysis.confidence}%`);
    content.push('');
    
    // 主要建议
    content.push(`  💡 ${suggestion}`);
    
    // 立即行动建议
    if (emotionalGuidance && emotionalGuidance.immediate && emotionalGuidance.immediate.length > 0) {
      content.push('');
      content.push(`  ⚡ 立即行动: ${emotionalGuidance.immediate.slice(0, 3).join(' | ')}`);
    }
    
    // 五行×情绪矩阵建议
    if (wuxingEmotionAdvice) {
      content.push('');
      content.push(`  ⚡ ${wuxingEmotionAdvice.energy}`);
      content.push(`  💻 代码建议: ${wuxingEmotionAdvice.code}`);
    }
    
    // 个性化建议
    if (personalizedAdvice) {
      content.push('');
      content.push(`  🎯 五行调和: ${personalizedAdvice}`);
    }
    
    lines.push(this.createBox(title, content, width));
    
    return lines.join('\n');
  }

  /**
   * 格式化今日建议（动态生成，基于主情绪）
   */
  formatAdvice(wuxing, moodResult = null) {
    const dominant = wuxing.dominant || '土';
    
    // 如果有情绪分析结果，基于主情绪生成动态建议
    if (moodResult && moodResult.analysis && moodResult.analysis.main) {
      const mainEmotion = moodResult.analysis.main;
      const emotionAdviceMap = {
        '高兴': {
          '木': '💡 今日建议: 创新能量爆棚，大胆尝试新技术突破',
          '火': '💡 今日建议: 激情正旺，适合攻克最难的技术难题',
          '土': '💡 今日建议: 稳中有喜，完善架构同时推进新功能',
          '金': '💡 今日建议: 逻辑清晰心情好，适合精密代码优化',
          '水': '💡 今日建议: 思路灵活状态佳，处理复杂业务逻辑'
        },
        '愤怒': {
          '木': '💡 今日建议: 将愤怒转化为创新动力，重构不满的代码',
          '火': '💡 今日建议: 情绪强烈需要发泄，通过高强度编码释放',
          '土': '💡 今日建议: 保持稳重，通过整理代码平息内心波澜',
          '金': '💡 今日建议: 用理性分析化解愤怒，制定系统解决方案',
          '水': '💡 今日建议: 让情绪如水般流动，寻找灵活的解决路径'
        },
        '焦虑': {
          '木': '💡 今日建议: 焦虑中藏着创新灵感，专注小目标突破',
          '火': '💡 今日建议: 降低强度避免过度燃烧，专注简单熟悉任务',
          '土': '💡 今日建议: 回归基础工作，通过稳定感缓解焦虑',
          '金': '💡 今日建议: 用详细计划对抗不确定性，逻辑梳理减压',
          '水': '💡 今日建议: 保持灵活应对，在变化中寻找稳定锚点'
        },
        '悲伤': {
          '木': '💡 今日建议: 通过学习新知识重新激发生命活力',
          '火': '💡 今日建议: 寻求团队支持，通过协作重燃内心火焰',
          '土': '💡 今日建议: 专注维护工作，在稳定中重建信心',
          '金': '💡 今日建议: 用逻辑分析理解情况，通过解决问题获得成就感',
          '水': '💡 今日建议: 允许情绪自然流淌，在适应中寻找新机会'
        },
        '平静': {
          '木': '💡 今日建议: 平静中蕴含创造力，适合制定长期技术规划',
          '火': '💡 今日建议: 稳定的火焰最持久，保持节奏稳步推进',
          '土': '💡 今日建议: 发挥稳定优势，承担团队核心支撑角色',
          '金': '💡 今日建议: 思维清晰的好时机，适合重要技术决策',
          '水': '💡 今日建议: 水面如镜显智慧，深入分析复杂问题'
        },
        '疲惫': {
          '木': '💡 今日建议: 木需要休息来重新生长，降低学习强度',
          '火': '💡 今日建议: 火焰微弱需要充电，强制休息避免过劳',
          '土': '💡 今日建议: 减少承担学会说不，专注核心功能开发',
          '金': '💡 今日建议: 停止过度思考，处理简单重复工作',
          '水': '💡 今日建议: 寻找能量源泉，可能是学习或轻松社交'
        },
        '惊讶': {
          '木': '💡 今日建议: 新发现激发创新，快速验证想法原型',
          '火': '💡 今日建议: 爆发式创造力，将灵感快速转化为成果',
          '土': '💡 今日建议: 稳中有变，谨慎分析新情况稳步适应',
          '金': '💡 今日建议: 洞察力增强，深入分析新现象发现规律',
          '水': '💡 今日建议: 直觉敏锐，相信感觉快速适应新情况'
        },
        '无聊': {
          '木': '💡 今日建议: 木气停滞需要刺激，寻找新技术挑战',
          '火': '💡 今日建议: 火缺乏燃料，主动寻找有挑战性的项目',
          '土': '💡 今日建议: 在稳定中寻找新乐趣，专注系统优化',
          '金': '💡 今日建议: 寻找有挑战的技术难题，挑战逻辑极限',
          '水': '💡 今日建议: 水需要流动渴望变化，尝试新技术领域'
        }
      };
      
      const emotionAdvice = emotionAdviceMap[mainEmotion];
      if (emotionAdvice && emotionAdvice[dominant]) {
        return '\n' + chalk.yellow(emotionAdvice[dominant]);
      }
    }
    
    // 回退到默认五行建议
    const defaultAdviceMap = {
      '木': '💡 今日建议: 适合创新开发，尝试新技术框架',
      '火': '💡 今日建议: 适合攻克技术难题，保持专注高效',
      '土': '💡 今日建议: 适合夯实基础架构，处理技术债务',
      '金': '💡 今日建议: 适合代码重构，优化系统性能',
      '水': '💡 今日建议: 适合处理复杂逻辑，灵活应对变化'
    };
    
    return '\n' + chalk.yellow(defaultAdviceMap[dominant] || '💡 今日建议: 保持学习，稳步前进');
  }

  /**
   * 创建进度条（兼容性版本）
   */
  createProgressBar(percentage) {
    const totalBars = 10;
    const filledBars = Math.round((percentage / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    
    return this.progressChars.filled.repeat(filledBars) + 
           this.progressChars.empty.repeat(emptyBars);
  }

  /**
   * 创建边框盒子
   */
  createBox(title, content, width) {
    const lines = [];
    const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, dividerLeft, dividerRight } = this.boxDrawing;
    
    // 顶部
    lines.push(topLeft + horizontal.repeat(width - 2) + topRight);
    
    // 标题
    const titlePadding = Math.floor((width - title.length - 2) / 2);
    const titleLine = vertical + ' '.repeat(titlePadding) + title + ' '.repeat(width - titlePadding - title.length - 2) + vertical;
    lines.push(titleLine);
    
    // 分隔线
    lines.push(dividerLeft + horizontal.repeat(width - 2) + dividerRight);
    
    // 内容
    content.forEach(line => {
      const displayLength = this.getDisplayLength(line);
      const paddingLength = Math.max(0, width - displayLength - 2);
      const paddedLine = line + ' '.repeat(paddingLength);
      lines.push(vertical + paddedLine + vertical);
    });
    
    // 底部
    lines.push(bottomLeft + horizontal.repeat(width - 2) + bottomRight);
    
    return lines.join('\n');
  }

  /**
   * 格式化置信度等级显示
   * @param {number} confidence - 置信度百分比
   * @returns {string} 格式化的置信度显示
   */
  formatConfidenceLevel(confidence) {
    if (confidence >= 80) {
      return '🎯 精准识别';
    } else if (confidence >= 60) {
      return '🔍 准确检测';
    } else if (confidence >= 40) {
      return '💭 较高可能';
    } else if (confidence >= 20) {
      return '🤔 推测判断';
    } else {
      return '💡 智能分析';
    }
  }

  /**
   * 计算字符串的显示长度（考虑中文和emoji）
   */
  getDisplayLength(str) {
    // 移除ANSI转义序列
    const stripped = str.replace(/\x1b\[[0-9;]*m/g, '');
    
    let length = 0;
    for (const char of stripped) {
      // 简单判断：emoji和中文算2个宽度
      if (char.match(/[\u4e00-\u9fa5]|[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]/u)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }

  /**
   * 格式化个人情绪洞察
   * @param {Object} insights - 个人洞察数据
   * @returns {string} 格式化的洞察信息
   */
  formatInsights(insights) {
    if (insights.message) {
      return `\n💭 个人情绪分析洞察\n\n${insights.message}\n`;
    }

    const lines = [];
    const width = 50;
    const title = '📊 个人情绪分析报告';
    
    const content = [];
    
    content.push(`  分析次数: ${insights.totalAnalyzes}次`);
    content.push(`  主导情绪: ${insights.dominantMood}`);
    content.push(`  主导元素: ${insights.dominantElement}`);
    content.push('');
    
    // 情绪分布
    content.push('  情绪分布:');
    Object.entries(insights.moodDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([mood, count]) => {
        const percentage = Math.round((count / insights.totalAnalyzes) * 100);
        const bar = this.createProgressBar(percentage);
        content.push(`  ${mood}: ${bar} ${count}次 (${percentage}%)`);
      });
    
    content.push('');
    content.push(`  💡 ${insights.personalizedTip}`);
    
    lines.push(this.createBox(title, content, width));
    
    return '\n' + lines.join('\n') + '\n';
  }

  /**
   * 格式化错误信息
   */
  formatError(error) {
    return chalk.red(`\n❌ 错误: ${error.message}\n`);
  }

  /**
   * 格式化帮助信息
   */
  formatHelp() {
    const help = `
🔮 Soul Mirror - 程序员的八字命理工具

使用方法:
  soul-mirror --birthday YYYY-MM-DD --time HH [选项]

参数:
  --birthday, -b         出生日期 (格式: YYYY-MM-DD)
  --time, -t             出生时辰 (格式: HH, 0-23)
  --mood, -m             当前情绪状态 (中文自然语言描述)
  --insights, -i         显示个人情绪分析洞察
  --debug                显示详细调试信息
  --verbose              详细模式：显示情绪分析过程和五行互动
  --verify               验证计算一致性
  --help, -h             显示帮助信息

示例:
  soul-mirror --birthday 1996-12-19 --time 14
  soul-mirror --birthday 1996-12-19 --time 14 --mood "今天心情不错"
  soul-mirror --birthday 1996-12-19 --time 14 --mood "代码写得很爽" --verbose
  soul-mirror --insights
  soul-mirror --birthday 1996-12-19 --time 16 --verify

说明:
  根据您的生辰八字，分析五行属性，计算今日卦象，
  为程序员提供专属的运势指导。支持情绪分析和个性化建议。
  使用lunar.js库进行专业的八字计算。
`;
    return help;
  }
}

module.exports = OutputFormatter;