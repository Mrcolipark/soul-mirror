/**
 * 终端兼容性检测
 * 检测终端的显示能力并提供适配方案
 */

const os = require('os');

class TerminalCapabilities {
  constructor() {
    this.capabilities = this.detectCapabilities();
  }
  
  /**
   * 检测终端能力
   * @returns {Object} 终端能力对象
   */
  detectCapabilities() {
    const capabilities = {
      supportsColor: false,
      supportsUnicode: false,
      supportsEmoji: false,
      terminalType: 'basic',
      platform: os.platform(),
      columns: process.stdout.columns || 80,
      rows: process.stdout.rows || 24
    };
    
    // 检测颜色支持
    capabilities.supportsColor = this.detectColorSupport();
    
    // 检测Unicode支持
    capabilities.supportsUnicode = this.detectUnicodeSupport();
    
    // 检测Emoji支持
    capabilities.supportsEmoji = this.detectEmojiSupport();
    
    // 确定终端类型
    capabilities.terminalType = this.getTerminalType();
    
    return capabilities;
  }
  
  /**
   * 检测颜色支持
   * @returns {boolean} 是否支持颜色
   */
  detectColorSupport() {
    // 检查环境变量
    if (process.env.NO_COLOR || process.env.NODE_DISABLE_COLORS) {
      return false;
    }
    
    if (process.env.FORCE_COLOR) {
      return true;
    }
    
    // 检查标准输出
    if (!process.stdout.isTTY) {
      return false;
    }
    
    // 检查TERM环境变量
    const term = process.env.TERM || '';
    if (term === 'dumb') {
      return false;
    }
    
    // 支持颜色的终端类型
    const colorTerms = [
      'xterm', 'xterm-256color', 'screen', 'screen-256color',
      'tmux', 'tmux-256color', 'rxvt', 'ansi', 'cygwin'
    ];
    
    return colorTerms.some(colorTerm => term.includes(colorTerm)) || 
           process.env.COLORTERM || 
           process.platform === 'win32';
  }
  
  /**
   * 检测Unicode支持
   * @returns {boolean} 是否支持Unicode
   */
  detectUnicodeSupport() {
    // Windows Command Prompt 通常不支持Unicode box drawing
    if (process.platform === 'win32' && process.env.TERM !== 'xterm') {
      const isWindowsTerminal = process.env.WT_SESSION || 
                               process.env.ConEmuANSI || 
                               process.env.TERM_PROGRAM === 'vscode';
      if (!isWindowsTerminal) {
        return false;
      }
    }
    
    // 检查编码支持
    const encoding = process.stdout.encoding || process.env.LANG || '';
    if (encoding.toLowerCase().includes('utf')) {
      return true;
    }
    
    // 现代终端通常支持Unicode
    const modernTerminals = [
      'iTerm', 'Terminal', 'Hyper', 'Alacritty', 'kitty', 
      'Windows Terminal', 'PowerShell', 'VSCode'
    ];
    
    const termProgram = process.env.TERM_PROGRAM || '';
    return modernTerminals.some(terminal => 
      termProgram.toLowerCase().includes(terminal.toLowerCase())
    );
  }
  
  /**
   * 检测Emoji支持
   * @returns {boolean} 是否支持Emoji
   */
  detectEmojiSupport() {
    // 基本上与Unicode支持相同，但更保守
    if (process.platform === 'win32') {
      return process.env.WT_SESSION || process.env.TERM_PROGRAM === 'vscode';
    }
    
    return this.detectUnicodeSupport();
  }
  
  /**
   * 获取终端类型
   * @returns {string} 终端类型
   */
  getTerminalType() {
    const termProgram = process.env.TERM_PROGRAM || '';
    const term = process.env.TERM || '';
    
    if (termProgram.includes('iTerm')) return 'iterm';
    if (termProgram.includes('Terminal')) return 'macos-terminal';
    if (termProgram.includes('Hyper')) return 'hyper';
    if (termProgram.includes('vscode')) return 'vscode';
    if (process.env.WT_SESSION) return 'windows-terminal';
    if (process.platform === 'win32') return 'windows-cmd';
    if (term.includes('xterm')) return 'xterm';
    if (term.includes('screen')) return 'screen';
    
    return 'generic';
  }
  
  /**
   * 获取适配的字符集
   * @returns {Object} 字符集对象
   */
  getCharacterSet() {
    if (this.capabilities.supportsUnicode) {
      return {
        // Unicode box drawing characters
        box: {
          topLeft: '╭', topRight: '╮', bottomLeft: '╰', bottomRight: '╯',
          horizontal: '─', vertical: '│', 
          dividerLeft: '├', dividerRight: '┤'
        },
        progress: {
          filled: '█', empty: '░', partial: ['▏', '▎', '▍', '▌', '▋', '▊', '▉']
        },
        icons: this.capabilities.supportsEmoji ? {
          success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
          star: '⭐', heart: '❤️', fire: '🔥', crystal: '🔮'
        } : {
          success: '[OK]', error: '[ERR]', warning: '[WARN]', info: '[INFO]',
          star: '*', heart: '<3', fire: '!', crystal: 'o'
        }
      };
    } else {
      return {
        // ASCII fallback characters
        box: {
          topLeft: '+', topRight: '+', bottomLeft: '+', bottomRight: '+',
          horizontal: '-', vertical: '|',
          dividerLeft: '+', dividerRight: '+'
        },
        progress: {
          filled: '#', empty: '.', partial: ['#']
        },
        icons: {
          success: '[OK]', error: '[ERR]', warning: '[WARN]', info: '[INFO]',
          star: '*', heart: '<3', fire: '!', crystal: 'o'
        }
      };
    }
  }
  
  /**
   * 获取适配的颜色函数
   * @param {Object} chalk - chalk实例
   * @returns {Object} 颜色函数对象
   */
  getColorFunctions(chalk) {
    if (this.capabilities.supportsColor && chalk) {
      return {
        primary: chalk.cyan,
        secondary: chalk.yellow,
        success: chalk.green,
        error: chalk.red,
        warning: chalk.yellow,
        muted: chalk.gray,
        highlight: chalk.bold.white,
        emphasis: chalk.bold
      };
    } else {
      // 无颜色的fallback
      const identity = (text) => text;
      return {
        primary: identity,
        secondary: identity,
        success: identity,
        error: identity,
        warning: identity,
        muted: identity,
        highlight: identity,
        emphasis: identity
      };
    }
  }
  
  /**
   * 调整内容宽度以适应终端
   * @param {number} desiredWidth - 期望宽度
   * @returns {number} 实际可用宽度
   */
  getAdaptedWidth(desiredWidth) {
    const maxWidth = this.capabilities.columns - 4; // 留出边距
    return Math.min(desiredWidth, Math.max(40, maxWidth)); // 最小40字符
  }
  
  /**
   * 获取能力报告
   * @returns {string} 能力报告
   */
  getCapabilityReport() {
    const cap = this.capabilities;
    return [
      `Terminal Type: ${cap.terminalType}`,
      `Platform: ${cap.platform}`,
      `Size: ${cap.columns}x${cap.rows}`,
      `Colors: ${cap.supportsColor ? 'Yes' : 'No'}`,
      `Unicode: ${cap.supportsUnicode ? 'Yes' : 'No'}`,
      `Emoji: ${cap.supportsEmoji ? 'Yes' : 'No'}`
    ].join('\n');
  }
}

module.exports = TerminalCapabilities;