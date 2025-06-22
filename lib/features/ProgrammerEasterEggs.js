/**
 * 程序员专属彩蛋功能
 * 增加工具的趣味性和专业感
 */

class ProgrammerEasterEggs {
  /**
   * 获取程序员护符格言
   * @param {string} wuxing - 五行属性
   * @param {string} emotion - 情绪状态
   * @returns {Object} 护符信息
   */
  static getProgrammerTalisman(wuxing, emotion) {
    const talismans = {
      '木': {
        'high': {
          symbol: '🌲🚀',
          mantra: 'console.log("创新无界限");',
          blessing: '愿你的代码如森林般茂盛，创意如春风般不竭',
          protection: '守护创新灵感，避免思维僵化'
        },
        'low': {
          symbol: '🌱💚',
          mantra: 'git reset --hard HEAD~1; // 重新开始',
          blessing: '种子在等待，创意在积蓄，突破就在下一次提交',
          protection: '守护成长空间，驱散自我怀疑'
        }
      },
      '火': {
        'high': {
          symbol: '🔥⚡',
          mantra: 'while(passion) { code(); }',
          blessing: '愿你的激情永不熄灭，代码永远高效',
          protection: '守护执行力，避免过度燃烧'
        },
        'low': {
          symbol: '🕯️🔋',
          mantra: 'setTimeout(() => motivation++, 1000);',
          blessing: '休息是为了更好的冲刺，低谷是为了更高的峰值',
          protection: '守护内心火种，驱散疲惫迷茫'
        }
      },
      '土': {
        'high': {
          symbol: '🏔️🛡️',
          mantra: 'const stability = true;',
          blessing: '愿你的架构稳如磐石，系统运行如山不移',
          protection: '守护稳定性，避免急躁冒进'
        },
        'low': {
          symbol: '🌋🔧',
          mantra: 'npm rebuild; // 重建根基',
          blessing: '真正的强者在低谷中重建，在困境中成长',
          protection: '守护坚韧意志，驱散动摇不安'
        }
      },
      '金': {
        'high': {
          symbol: '⚔️💎',
          mantra: 'if (logic.isPerfect()) return success;',
          blessing: '愿你的逻辑锋利如剑，代码精美如钻石',
          protection: '守护理性思维，避免过度完美主义'
        },
        'low': {
          symbol: '🔍🛠️',
          mantra: 'debugger; // 真相在细节中',
          blessing: '最锋利的剑在磨砺中诞生，最完美的逻辑在调试中显现',
          protection: '守护分析能力，驱散困惑迷雾'
        }
      },
      '水': {
        'high': {
          symbol: '🌊🔮',
          mantra: 'const wisdom = experience.flow();',
          blessing: '愿你的智慧如水般深邃，适应力如海般广阔',
          protection: '守护灵活性，避免方向迷失'
        },
        'low': {
          symbol: '💧⭐',
          mantra: 'return await patience.promise();',
          blessing: '水滴石穿非一日之功，智慧积累需时间沉淀',
          protection: '守护内在智慧，驱散急躁焦虑'
        }
      }
    };
    
    const intensity = this._getEmotionIntensity(emotion);
    const talisman = talismans[wuxing]?.[intensity] || talismans[wuxing]?.['low'];
    
    return {
      ...talisman,
      wuxing: wuxing,
      emotion: emotion,
      timestamp: new Date().toISOString(),
      serialNumber: this._generateSerialNumber(wuxing, emotion)
    };
  }
  
  /**
   * 获取代码禅语
   * @param {string} context - 上下文（如 debug, deploy, refactor）
   * @returns {string} 禅语
   */
  static getCodeZen(context = 'general') {
    const zenQuotes = {
      'debug': [
        '🐛 "Bug不是敌人，是代码想告诉你什么"',
        '🔍 "最难的Bug往往藏在最简单的地方"',
        '💡 "每一个Bug都是成长的机会"',
        '🎯 "耐心是Debug的第一要素"'
      ],
      'deploy': [
        '🚀 "部署如登月，准备决定成败"',
        '✅ "测试充分，部署无忧"',
        '📦 "好的部署是艺术，坏的部署是灾难"',
        '🔄 "回滚是智慧，不是失败"'
      ],
      'refactor': [
        '🔄 "重构是对过去的敬意，对未来的投资"',
        '✨ "简洁的代码胜过聪明的技巧"',
        '🏗️ "架构如建筑，根基决定高度"',
        '💎 "好代码如诗，既实用又优美"'
      ],
      'general': [
        '⚡ "代码如人生，简洁而深刻"',
        '🌟 "最好的代码是能删除的代码"',
        '🎨 "编程是逻辑与艺术的结合"',
        '🔮 "写代码是在与未来的自己对话"',
        '🌊 "优雅的解决方案往往最简单"',
        '🎯 "完成比完美更重要"'
      ]
    };
    
    const quotes = zenQuotes[context] || zenQuotes['general'];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
  /**
   * 获取编程运势签
   * @param {Object} baziData - 八字数据
   * @returns {Object} 运势签
   */
  static getProgrammingFortune(baziData) {
    const { wuxing, gua } = baziData;
    const today = new Date();
    const weekday = today.getDay();
    
    const fortunes = {
      0: { // 周日
        theme: '🧘 代码冥想日',
        advice: '适合思考架构，整理思路',
        lucky: ['重构', '设计', '学习'],
        avoid: ['新项目', '复杂调试']
      },
      1: { // 周一
        theme: '🚀 启动推进日',
        advice: '新的一周，开启新的可能',
        lucky: ['项目启动', '计划制定', '团队沟通'],
        avoid: ['拖延', '消极情绪']
      },
      2: { // 周二
        theme: '⚡ 效率爆发日',
        advice: '专注执行，追求效率',
        lucky: ['功能开发', 'Bug修复', '优化'],
        avoid: ['频繁切换', '完美主义']
      },
      3: { // 周三
        theme: '🤝 协作融合日',
        advice: '团队配合，共同进步',
        lucky: ['Code Review', '结对编程', '知识分享'],
        avoid: ['独自钻牛角尖', '埋头苦干']
      },
      4: { // 周四
        theme: '🔧 稳定优化日',
        advice: '夯实基础，稳步推进',
        lucky: ['测试', '文档', '性能优化'],
        avoid: ['激进变更', '实验性代码']
      },
      5: { // 周五
        theme: '🎉 收获总结日',
        advice: '总结成果，准备周末',
        lucky: ['部署', '总结', '庆祝'],
        avoid: ['大的重构', '复杂功能']
      },
      6: { // 周六
        theme: '💡 创意探索日',
        advice: '放松心情，探索可能',
        lucky: ['学习新技术', '个人项目', '创意实验'],
        avoid: ['工作压力', '严肃开发']
      }
    };
    
    const dailyFortune = fortunes[weekday];
    
    return {
      ...dailyFortune,
      wuxingBonus: this._getWuxingDailyBonus(wuxing.dominant, weekday),
      luckyLanguage: this._getLuckyProgrammingLanguage(wuxing.dominant),
      luckyTime: this._getLuckyTimeSlot(wuxing.dominant),
      zen: this.getCodeZen('general')
    };
  }
  
  /**
   * 获取调试护身符
   * @param {string} errorType - 错误类型
   * @returns {Object} 护身符
   */
  static getDebugTalisman(errorType = 'general') {
    const talismans = {
      'syntax': {
        symbol: '📝✨',
        incantation: 'ESLint --fix --save-soul',
        advice: '语法错误是最温柔的提醒，它只是想让你写得更好'
      },
      'logic': {
        symbol: '🧠💡',
        incantation: 'console.log("逻辑追踪中...");',
        advice: '逻辑错误是智慧的试金石，解决它你会更强大'
      },
      'runtime': {
        symbol: '⚡🛡️',
        incantation: 'try { code() } catch(wisdom) { grow() }',
        advice: '运行时错误是成长的催化剂，拥抱它，学习它'
      },
      'network': {
        symbol: '🌐🔧',
        incantation: 'await network.stabilize();',
        advice: '网络问题教会我们耐心，也提醒我们系统的复杂性'
      },
      'general': {
        symbol: '🔮⚔️',
        incantation: 'debugger; // 真理在源码中',
        advice: '每个Bug都是一个故事，耐心听它讲完'
      }
    };
    
    return talismans[errorType] || talismans['general'];
  }
  
  /**
   * 获取情绪强度
   * @private
   */
  static _getEmotionIntensity(emotion) {
    const highIntensityEmotions = ['高兴', '愤怒', '惊讶'];
    return highIntensityEmotions.includes(emotion) ? 'high' : 'low';
  }
  
  /**
   * 生成护符序列号
   * @private
   */
  static _generateSerialNumber(wuxing, emotion) {
    const timestamp = Date.now().toString(36);
    const hash = (wuxing + emotion).split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `SM-${wuxing}-${Math.abs(hash).toString(36).toUpperCase()}-${timestamp}`;
  }
  
  /**
   * 获取五行每日加成
   * @private
   */
  static _getWuxingDailyBonus(wuxing, weekday) {
    const bonuses = {
      '木': ['创新思维+20%', '学习能力+15%'],
      '火': ['执行效率+25%', '团队协作+10%'],
      '土': ['稳定性+30%', '架构能力+20%'],
      '金': ['逻辑分析+25%', '代码质量+15%'],
      '水': ['适应能力+20%', '问题解决+25%']
    };
    
    return bonuses[wuxing] || ['平衡发展+10%'];
  }
  
  /**
   * 获取幸运编程语言
   * @private
   */
  static _getLuckyProgrammingLanguage(wuxing) {
    const languages = {
      '木': ['JavaScript', 'Python', 'Go'],
      '火': ['Rust', 'C++', 'Assembly'],
      '土': ['Java', 'C#', 'TypeScript'],
      '金': ['Haskell', 'Scala', 'F#'],
      '水': ['Clojure', 'Lisp', 'Elixir']
    };
    
    const langList = languages[wuxing] || ['JavaScript'];
    return langList[Math.floor(Math.random() * langList.length)];
  }
  
  /**
   * 获取幸运时间段
   * @private
   */
  static _getLuckyTimeSlot(wuxing) {
    const timeSlots = {
      '木': '早晨 6-9点 (创意迸发时)',
      '火': '上午 9-12点 (效率巅峰时)',
      '土': '下午 13-17点 (稳定专注时)',
      '金': '晚上 19-22点 (逻辑思维时)',
      '水': '深夜 22-2点 (灵感涌现时)'
    };
    
    return timeSlots[wuxing] || '全天候 (平衡发展时)';
  }
}

module.exports = ProgrammerEasterEggs;