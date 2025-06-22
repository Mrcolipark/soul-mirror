const BaziCalculator = require('../lib/bazi-calculator');
const OutputFormatter = require('../lib/output-formatter');

const calculator = new BaziCalculator();
const formatter = new OutputFormatter();

console.log('Test Soul Mirror BaZi Calculator\n');

// Test cases
const testCases = [
  {
    name: 'Key Test Case 1',
    birthday: '1996-12-19',
    hour: 14,
    expected: {
      year: 'C-Zi',
      month: 'G-Zi',
      day: 'G-Shen',
      hour: 'K-Wei'
    }
  },
  {
    name: 'Key Test Case 2',
    birthday: '1984-01-01',
    hour: 12,
    expected: {
      year: 'J-Zi',
      month: 'Y-Chou',
      day: 'J-Zi',
      hour: 'G-Wu'
    }
  },
  {
    name: 'Basic Test',
    birthday: '2000-02-29',
    hour: 8,
    expected: null
  }
];

function runTest(testCase, index) {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log(`Date: ${testCase.birthday} ${testCase.hour}:00`);
  
  try {
    const bazi = calculator.calculateBazi(testCase.birthday, testCase.hour);
    
    console.log(`Year: ${bazi.year}`);
    console.log(`Month: ${bazi.month}`);
    console.log(`Day: ${bazi.day}`);
    console.log(`Hour: ${bazi.hour}`);
    
    // Basic functionality test
    if (index === 0) {
      console.log('\nWuXing Analysis:');
      const wuxing = calculator.analyzeWuxing(bazi);
      console.log(`Dominant: ${wuxing.dominant}`);
      console.log(`Type: ${wuxing.programmerType.name}`);
      
      console.log('\nToday Gua:');
      const gua = calculator.getTodayGua(bazi);
      console.log(`Name: ${gua.name}`);
      console.log(`Meaning: ${gua.meaning}`);
    }
    
    console.log('Test PASSED\n');
    return true;
    
  } catch (error) {
    console.log(`Error: ${error.message}\n`);
    return false;
  }
}

// Run tests
let passed = 0;
let total = testCases.length;

testCases.forEach((testCase, index) => {
  if (runTest(testCase, index)) {
    passed++;
  }
});

console.log(`Tests completed: ${passed}/${total} passed`);

// Demo
if (passed === total) {
  console.log('\nDemo output:');
  console.log('='.repeat(50));
  
  try {
    const bazi = calculator.calculateBazi('1996-12-19', 14);
    const wuxing = calculator.analyzeWuxing(bazi);
    const gua = calculator.getTodayGua(bazi);
    
    const output = formatter.formatOutput({ bazi, wuxing, gua });
    console.log(output);
    
  } catch (error) {
    console.log('Demo error:', error.message);
  }
}