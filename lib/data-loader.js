const fs = require('fs');
const path = require('path');

/**
 * 数据加载器 - 负责加载和验证基础数据
 */
class DataLoader {
  constructor() {
    this.dataPath = path.join(__dirname, '../data');
    this.ganzhiData = null;
    this.jieqiData = null;
  }

  /**
   * 加载干支数据
   */
  loadGanzhiData() {
    if (!this.ganzhiData) {
      try {
        const filePath = path.join(this.dataPath, 'ganzhi.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        this.ganzhiData = JSON.parse(rawData);
      } catch (error) {
        throw new Error(`无法加载干支数据: ${error.message}`);
      }
    }
    return this.ganzhiData;
  }

  /**
   * 加载节气数据
   */
  loadJieqiData() {
    if (!this.jieqiData) {
      try {
        const filePath = path.join(this.dataPath, 'jieqi.json');
        const rawData = fs.readFileSync(filePath, 'utf8');
        this.jieqiData = JSON.parse(rawData);
      } catch (error) {
        throw new Error(`无法加载节气数据: ${error.message}`);
      }
    }
    return this.jieqiData;
  }

  /**
   * 验证数据完整性
   */
  validateData() {
    console.log('🔍 验证基础数据...\n');
    
    try {
      const ganzhi = this.loadGanzhiData();
      const jieqi = this.loadJieqiData();
      
      // 验证干支数据
      console.log('📊 干支数据验证:');
      console.log(`   天干数量: ${ganzhi.heavenlyStems.length} (预期: 10)`);
      console.log(`   地支数量: ${ganzhi.earthlyBranches.length} (预期: 12)`);
      console.log(`   六十甲子数量: ${ganzhi.sixtyGanzhi.length} (预期: 60)`);
      console.log(`   五行映射数量: ${Object.keys(ganzhi.wuxingMap).length} (预期: 22)`);
      console.log(`   时辰映射数量: ${Object.keys(ganzhi.timeMapping).length} (预期: 12)`);
      
      // 验证节气数据
      console.log('\n📅 节气数据验证:');
      console.log(`   节气数量: ${Object.keys(jieqi.solarTerms).length} (预期: 24)`);
      console.log(`   月份映射数量: ${Object.keys(jieqi.monthMapping).length} (预期: 12)`);
      console.log(`   月令节气数量: ${jieqi.monthTerms.length} (预期: 12)`);
      
      // 检查数据一致性
      console.log('\n✅ 数据一致性检查:');
      
      // 检查六十甲子的正确性
      const isValidGanzhi = this.validateSixtyGanzhi(ganzhi);
      console.log(`   六十甲子顺序: ${isValidGanzhi ? '✅ 正确' : '❌ 错误'}`);
      
      // 检查五行映射的完整性
      const isValidWuxing = this.validateWuxingMapping(ganzhi);
      console.log(`   五行映射完整性: ${isValidWuxing ? '✅ 完整' : '❌ 不完整'}`);
      
      console.log('\n🎉 数据验证完成!');
      return true;
      
    } catch (error) {
      console.error('❌ 数据验证失败:', error.message);
      return false;
    }
  }

  /**
   * 验证六十甲子的正确性
   */
  validateSixtyGanzhi(ganzhi) {
    const { heavenlyStems, earthlyBranches, sixtyGanzhi } = ganzhi;
    
    for (let i = 0; i < 60; i++) {
      const expectedStem = heavenlyStems[i % 10];
      const expectedBranch = earthlyBranches[i % 12];
      const expected = expectedStem + expectedBranch;
      
      if (sixtyGanzhi[i] !== expected) {
        console.log(`❌ 第${i + 1}个甲子错误: 期望 ${expected}, 实际 ${sixtyGanzhi[i]}`);
        return false;
      }
    }
    return true;
  }

  /**
   * 验证五行映射的完整性
   */
  validateWuxingMapping(ganzhi) {
    const { heavenlyStems, earthlyBranches, wuxingMap } = ganzhi;
    
    // 检查所有天干都有五行映射
    for (const stem of heavenlyStems) {
      if (!wuxingMap[stem]) {
        console.log(`❌ 天干 ${stem} 缺少五行映射`);
        return false;
      }
    }
    
    // 检查所有地支都有五行映射
    for (const branch of earthlyBranches) {
      if (!wuxingMap[branch]) {
        console.log(`❌ 地支 ${branch} 缺少五行映射`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * 获取指定天干地支的五行属性
   */
  getWuxing(ganOrZhi) {
    const ganzhi = this.loadGanzhiData();
    return ganzhi.wuxingMap[ganOrZhi] || null;
  }

  /**
   * 根据日期判断是否已过节气（用于月柱计算）
   * 使用范围日期来适应年度变化
   */
  hasPassedSolarTerm(month, day, termName) {
    const jieqi = this.loadJieqiData();
    const term = jieqi.solarTerms[termName];
    
    if (!term) return false;
    
    // 使用范围中间值作为判断基准
    const termDay = term.days[1]; // 使用中间值
    
    return day >= termDay;
  }

  /**
   * 获取指定月份的节气信息
   */
  getMonthTerm(month) {
    const jieqi = this.loadJieqiData();
    return jieqi.monthTerms[month - 1] || null;
  }
  getTimeZhi(hour) {
    const ganzhi = this.loadGanzhiData();
    
    for (const [zhi, timeRange] of Object.entries(ganzhi.timeMapping)) {
      const { start, end } = timeRange;
      
      // 处理跨天的子时 (23:00-01:00)
      if (start > end) {
        if (hour >= start || hour < end) {
          return zhi;
        }
      } else {
        if (hour >= start && hour < end) {
          return zhi;
        }
      }
    }
    
    return '午'; // 默认返回午时
  }
}

module.exports = DataLoader;
