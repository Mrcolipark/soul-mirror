/**
 * 输入验证与安全处理工具
 * 确保所有用户输入的安全性和有效性
 */

class InputValidator {
  /**
   * 验证生日格式和有效性
   * @param {string} birthday - 生日字符串
   * @returns {Object} 验证结果
   */
  static validateBirthday(birthday) {
    // 基础格式验证
    if (typeof birthday !== 'string') {
      throw new Error('生日必须是字符串格式');
    }
    
    // 去除潜在的恶意字符
    const sanitized = birthday.trim().replace(/[^\d-]/g, '');
    
    // 格式验证
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(sanitized)) {
      throw new Error('日期格式错误，请使用 YYYY-MM-DD 格式（例如：1996-12-19）');
    }
    
    const [year, month, day] = sanitized.split('-').map(Number);
    
    // 年份范围验证
    const currentYear = new Date().getFullYear();
    if (year < 1900 || year > currentYear) {
      throw new Error(`年份超出有效范围 (1900-${currentYear})`);
    }
    
    // 月份验证
    if (month < 1 || month > 12) {
      throw new Error('月份必须在 1-12 之间');
    }
    
    // 日期验证
    if (day < 1 || day > 31) {
      throw new Error('日期必须在 1-31 之间');
    }
    
    // 闰年和月份天数验证
    const daysInMonth = this.getDaysInMonth(year, month);
    if (day > daysInMonth) {
      throw new Error(`${year}年${month}月只有${daysInMonth}天`);
    }
    
    // 日期合理性验证
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || 
        date.getMonth() !== month - 1 || 
        date.getDate() !== day) {
      throw new Error('无效的日期');
    }
    
    return { year, month, day, sanitized };
  }
  
  /**
   * 验证时辰
   * @param {string|number} hour - 时辰
   * @returns {number} 验证后的时辰
   */
  static validateHour(hour) {
    // 类型转换和清理
    let numHour;
    if (typeof hour === 'string') {
      // 移除非数字字符
      const cleaned = hour.trim().replace(/[^\d]/g, '');
      numHour = parseInt(cleaned, 10);
    } else {
      numHour = Number(hour);
    }
    
    // 数值验证
    if (isNaN(numHour)) {
      throw new Error('时辰必须是 0-23 之间的数字');
    }
    
    // 范围验证
    if (numHour < 0 || numHour > 23) {
      throw new Error('时辰必须在 0-23 之间');
    }
    
    return Math.floor(numHour);
  }
  
  /**
   * 验证和清理情绪文本
   * @param {string} moodText - 情绪文本
   * @returns {string} 清理后的文本
   */
  static validateMoodText(moodText) {
    if (typeof moodText !== 'string') {
      throw new Error('情绪描述必须是文本格式');
    }
    
    // 长度限制
    if (moodText.length > 500) {
      throw new Error('情绪描述不能超过500个字符');
    }
    
    // 移除潜在危险字符，保留中文、英文、数字、常用标点
    const cleaned = moodText
      .replace(/[<>\"']/g, '') // 移除HTML相关字符
      .replace(/[\x00-\x1f\x7f]/g, '') // 移除控制字符
      .trim();
    
    if (cleaned.length === 0) {
      throw new Error('情绪描述不能为空');
    }
    
    // 检查是否包含有意义的内容
    const meaningfulChars = cleaned.replace(/[\s\.,!?;。，！？；：]/g, '');
    if (meaningfulChars.length < 2) {
      throw new Error('请提供更具体的情绪描述');
    }
    
    return cleaned;
  }
  
  /**
   * 获取指定年月的天数
   * @param {number} year - 年份
   * @param {number} month - 月份
   * @returns {number} 天数
   */
  static getDaysInMonth(year, month) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    // 闰年2月有29天
    if (month === 2 && this.isLeapYear(year)) {
      return 29;
    }
    
    return daysInMonth[month - 1];
  }
  
  /**
   * 判断是否为闰年
   * @param {number} year - 年份
   * @returns {boolean} 是否为闰年
   */
  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }
  
  /**
   * 验证并标准化时区输入
   * @param {string} timezone - 时区字符串
   * @returns {string} 标准化的时区
   */
  static validateTimezone(timezone = 'Asia/Shanghai') {
    const supportedTimezones = [
      'Asia/Shanghai',
      'Asia/Beijing',
      'Asia/Hong_Kong',
      'Asia/Taipei',
      'UTC',
      'America/New_York',
      'Europe/London'
    ];
    
    if (!supportedTimezones.includes(timezone)) {
      console.warn(`不支持的时区: ${timezone}，使用默认时区 Asia/Shanghai`);
      return 'Asia/Shanghai';
    }
    
    return timezone;
  }
  
  /**
   * 通用输入安全检查
   * @param {any} input - 输入值
   * @param {string} fieldName - 字段名称
   * @returns {boolean} 是否安全
   */
  static isSafeInput(input, fieldName = '输入') {
    if (input === null || input === undefined) {
      return true; // 空值是安全的
    }
    
    const inputStr = String(input);
    
    // 检查脚本注入
    const scriptPattern = /<script|javascript:|data:text\/html|vbscript:/i;
    if (scriptPattern.test(inputStr)) {
      throw new Error(`${fieldName}包含不安全的内容`);
    }
    
    // 检查路径遍历
    const pathTraversalPattern = /\.\.|\/\.\.|\.\/|\.\\|\|\||&&|;|\$\(|\`/;
    if (pathTraversalPattern.test(inputStr)) {
      throw new Error(`${fieldName}包含不安全的字符`);
    }
    
    return true;
  }
  
  /**
   * 验证完整的输入对象
   * @param {Object} input - 输入对象
   * @returns {Object} 验证和清理后的输入
   */
  static validateFullInput(input) {
    const result = {};
    
    // 验证生日
    if (input.birthday) {
      this.isSafeInput(input.birthday, '生日');
      const birthdayData = this.validateBirthday(input.birthday);
      result.birthday = birthdayData.sanitized;
      result.birthdayParsed = birthdayData;
    }
    
    // 验证时辰
    if (input.time !== undefined && input.time !== null) {
      this.isSafeInput(input.time, '时辰');
      result.time = this.validateHour(input.time);
    }
    
    // 验证情绪文本
    if (input.mood) {
      this.isSafeInput(input.mood, '情绪描述');
      result.mood = this.validateMoodText(input.mood);
    }
    
    // 验证时区
    if (input.timezone) {
      result.timezone = this.validateTimezone(input.timezone);
    }
    
    return result;
  }
}

module.exports = InputValidator;