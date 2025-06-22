/**
 * 数据加载器测试文件
 */
const DataLoader = require('../lib/data-loader');

console.log('🧪 开始测试数据加载器...\n');

try {
  const dataLoader = new DataLoader();
  
  // 测试数据验证
  const isValid = dataLoader.validateData();
  
  if (isValid) {
    console.log('\n🔥 进行功能测试...\n');
    
    // 测试五行查询
    console.log('🌈 五行查询测试:');
    const testChars = ['甲', '子', '丙', '午', '戊'];
    testChars.forEach(char => {
      const wuxing = dataLoader.getWuxing(char);
      console.log(`   ${char} -> ${wuxing}`);
    });
    
    // 测试时辰转换
    console.log('\n⏰ 时辰转换测试:');
    const testHours = [0, 6, 12, 18, 23];
    testHours.forEach(hour => {
      const zhi = dataLoader.getTimeZhi(hour);
      console.log(`   ${hour}点 -> ${zhi}时`);
    });
    
    console.log('\n✅ 所有测试通过! 数据加载器工作正常');
    
  } else {
    console.log('\n❌ 数据验证失败，请检查数据文件');
    process.exit(1);
  }
  
} catch (error) {
  console.error('💥 测试过程中发生错误:', error.message);
  console.log('\n🔧 请检查以下事项:');
  console.log('   1. data/ganzhi.json 文件是否存在且格式正确');
  console.log('   2. data/jieqi.json 文件是否存在且格式正确');
  console.log('   3. 文件路径是否正确');
  process.exit(1);
}
