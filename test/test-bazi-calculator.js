/**
 * 八字计算器测试文件
 * 运行方式: 在项目根目录执行 node test/test-bazi-calculator.js
 */
const BaziCalculator = require('../lib/bazi-calculator');

console.log('🔮 开始测试八字计算器...\n');

try {
  const calculator = new BaziCalculator();
  
  // 运行内置测试套件
  calculator.runTests();
  
  console.log('\n🔥 进行额外验证测试...\n');
  
  // 测试你的生日
  console.log('🎯 计算你的八字 (1996-12-19 下午2点):');
  const myBazi = calculator.calculateBazi('1996-12-19', 14);
  console.log('四柱八字:', `${myBazi.year} ${myBazi.month} ${myBazi.day} ${myBazi.hour}`);
  
  const myWuxing = calculator.analyzeWuxing(myBazi);
  console.log('五行分布:', myWuxing.count);
  console.log('主导元素:', myWuxing.dominant);
  console.log('五行详情:');
  myWuxing.details.forEach(detail => {
    console.log(`  ${detail.pillar}柱${detail.position}: ${detail.char} -> ${detail.wuxing}`);
  });
  
  console.log('\n⚡ 性能测试:');
  const startTime = Date.now();
  for (let i = 0; i < 1000; i++) {
    calculator.calculateBazi('1996-12-19', 14);
  }
  const endTime = Date.now();
  console.log(`1000次计算耗时: ${endTime - startTime}ms`);
  console.log(`平均每次: ${(endTime - startTime) / 1000}ms`);
  
  console.log('\n✅ 八字计算器测试完成！核心功能正常工作');
  
} catch (error) {
  console.error('💥 测试失败:', error.message);
  console.log('请检查数据文件是否正确创建');
  process.exit(1);
}
