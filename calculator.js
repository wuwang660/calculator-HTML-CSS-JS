class Calculator {
    constructor() {
        this.putoutInputChar = '0'; // 计算器输入框的值
        this.currentValue = 0; // 当前值
        this.currentOp = ''; // 当前操作符
        this.judgeOp = 0; // 判断是否需要清空计算器输入框的值

        this.elements = {
            putoutP: document.getElementById('putout_p'),
            putoutInput: document.getElementById('putout_input'),
            isHistory: document.getElementById('is_history'),
            history: document.getElementById('history'),
            historyP: document.getElementById('history_p'),
            historyUL: document.getElementById('history_ul'),
            clearHistoryBtn: document.getElementById('clear_history')
        };

        this.init();
    }

    /**
     * 初始化计算器
     */
    init() {
        // 设置初始值
        this.elements.putoutP.textContent = '';
        this.elements.putoutInput.value = '0';
        this.putoutInputChar = '0';
        this.currentValue = 0;
        this.currentOp = '';
        this.judgeOp = 0;

        // 绑定事件
        this.bindEvents();

        // 加载历史记录
        this.loadHistory();

        // 初始化历史记录面板
        this.elements.history.style.display = 'none';
    }

    /**
     * 绑定所有事件监听器
     */
    bindEvents() {
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        this.elements.isHistory.addEventListener('click', this.toggleHistoryPanel.bind(this));
        this.elements.clearHistoryBtn.addEventListener('click', this.clearHistoryList.bind(this));
    }

    /**
     * 向输入框追加数字
     * @param {string} appendNum - 要追加的数字
     */
    appendNumber(appendNum) {
        if (this.currentOp !== '' && this.judgeOp === 0) {
           this.putoutInputChar = '0';
           this.elements.putoutInput.value = this.putoutInputChar;
           this.judgeOp = 1;
        }

        if (this.currentOp === '' && this.judgeOp === 1) {
           this.putoutInputChar = '0';
           this.elements.putoutInput.value = this.putoutInputChar;
           this.judgeOp = 0;
        }

        if (this.putoutInputChar.length < 12) {
            if (this.putoutInputChar === '0') {
                this.putoutInputChar = appendNum;
                this.elements.putoutInput.value = this.putoutInputChar;
            } else {
                this.putoutInputChar += appendNum;
                this.elements.putoutInput.value = this.putoutInputChar;
            }
        } else {
            this.elements.putoutInput.value = this.putoutInputChar.slice(0, 11) + '...';
            this.putoutInputChar += appendNum;
        }
    }

    /**
     * 设置运算符并执行相应操作
     * @param {string} op - 运算符
     */
    setOperator(op) {
        const operations = {
            'AC': () => this.clearCalculator(),
            '⌫': () => this.handleBackspace(),
            '%': () => this.handlePercentage(),
            '.': () => this.handleDecimal(),
            '=': () => this.handleEquals(),

            'default': () => this.handleArithmeticOp(op)
        };

        const operation = operations[op] || operations['default'];
        operation();
    }

    /**
     * 清空计算器状态
     */
    clearCalculator() {
        this.elements.putoutP.textContent = '';
        this.putoutInputChar = '0';
        this.elements.putoutInput.value = this.putoutInputChar;
        this.currentValue = 0;
        this.currentOp = '';
        this.judgeOp = 0;
    }

    /**
     * 处理退格操作
     */
    handleBackspace() {
        if (this.putoutInputChar.length > 1) {
            this.putoutInputChar = this.putoutInputChar.slice(0, -1);
            this.elements.putoutInput.value = this.putoutInputChar;
        } else {
            this.putoutInputChar = '0';
            this.elements.putoutInput.value = this.putoutInputChar;
        }
    }

    /**
     * 处理百分比操作
     */
    handlePercentage() {
        if (this.elements.putoutInput.value !== '0') {
            this.putoutInputChar = (parseFloat(this.putoutInputChar) / 100).toString();
            this.elements.putoutInput.value = this.putoutInputChar;
        }
    }

    /**
     * 处理小数点添加
     */
    handleDecimal() {
        if (parseFloat(this.putoutInputChar) === this.currentValue) {
            this.putoutInputChar = '0';
        }

        if (!this.putoutInputChar.includes('.')) {
            this.putoutInputChar += '.';
            this.elements.putoutInput.value = this.putoutInputChar;
        }
    }

    /**
     * 处理算术运算符
     * @param {string} op - 算术运算符
     */
    handleArithmeticOp(op) {
        if (this.currentOp === '') {
            this.elements.putoutP.textContent = this.putoutInputChar + ' ' + op;
            this.currentValue = parseFloat(this.putoutInputChar);
            this.currentOp = op;
            this.judgeOp = 0;
        } else {
            this.elements.putoutP.textContent += ' ' + this.putoutInputChar + ' ' + op;
            this.performCalculation();
            this.currentOp = op;
            this.judgeOp = 0;
        }
    }

    /**
     * 执行当前运算
     */
    performCalculation() {
        const inputNum = parseFloat(this.putoutInputChar);

        const operations = {
            '÷': () => this.currentValue = precise(this.currentValue / inputNum),
            '×': () => this.currentValue = precise(this.currentValue * inputNum),
            '+': () => this.currentValue = precise(this.currentValue + inputNum),
            '-': () => this.currentValue = precise(this.currentValue - inputNum)
        };

        if (operations[this.currentOp]) {
            operations[this.currentOp]();
        }

        this.putoutInputChar = this.currentValue.toString();
        this.elements.putoutInput.value = this.putoutInputChar;
    }

    /**
     * 处理等于号操作
     */
    handleEquals() {
        if (this.currentOp) {
            const putoutPText = this.elements.putoutInput.value;
            this.performCalculation();
            this.computerHistory(this.elements.putoutP.textContent + ' ' + putoutPText, this.elements.putoutInput.value);
            this.currentOp = '';
        }
    }

    /**
     * 添加计算历史到本地存储和UI
     * @param {string} name - 计算式
     * @param {string} value - 结果
     */
    computerHistory(name, value) {
        this.elements.historyP.style.display = 'none';
        this.elements.historyUL.style.display = 'block';

        localStorage.setItem(name, value);

        const historyItem = document.createElement('li');
        let key = name;
        historyItem.innerHTML = `
            <p class="history_name">${key}</p>
            <p class="history_value">${value}</p>
        `;

        historyItem.onclick = () => {
            this.putoutInputChar = historyItem.querySelector('.history_value').textContent;
            this.elements.putoutInput.value = this.putoutInputChar;
        }

        this.elements.historyUL.insertBefore(historyItem, this.elements.historyUL.firstChild);
    }

    /**
     * 更新显示，处理长数字的显示
     */
    updateDisplay() {
        if (this.putoutInputChar.length >= 14) {
            this.elements.putoutInput.value = this.putoutInputChar.slice(0, 11) + '...';
        }

        if (this.elements.putoutP.textContent.length >= 60) {
            this.elements.putoutP.textContent = this.elements.putoutP.textContent.slice(0, 60) + '...';
        }
    }

    /**
     * 处理键盘按键事件
     * @param {KeyboardEvent} event - 键盘事件对象
     */
    handleKeydown(event) {
        const keyMap = {
            'Escape': 'AC',
            'Backspace': '⌫',
            '%': '%',
            '.': '.',
            '/': '÷',
            '*': '×',
            '-': '-',
            '+': '+',
            'Enter': '='
        };

        const key = event.key;

        if (!isNaN(key)) {
            this.appendNumber(key);
        } else if (keyMap[key]) {
            this.setOperator(keyMap[key]);
        }
    }

    /**
     * 切换历史记录面板的显示状态
     */
    toggleHistoryPanel() {
        if (this.elements.history.style.display === 'none') {
            this.elements.history.style.display = 'block';
        } else {
            this.elements.history.style.display = 'none';
        }
    }

    /**
     * 清空历史记录
     */
    clearHistoryList() {
        localStorage.clear();
        this.elements.historyUL.innerHTML = '';
        this.elements.historyP.style.display = 'block';
        this.elements.historyUL.style.display = 'none';
    }

    /**
     * 从本地存储加载历史记录
     */
    loadHistory() {
        if (localStorage.length === 0) {
            this.elements.historyP.style.display = 'block';
            this.elements.historyUL.style.display = 'none';
        } else {
            this.elements.historyP.style.display = 'none';
            this.elements.historyUL.style.display = 'block';

            for (let i = localStorage.length - 1; i >= 0; i--) {
                let key = localStorage.key(i);
                const historyItem = document.createElement('li');
                historyItem.innerHTML = `
                    <p class="history_name">${key}</p>
                    <p class="history_value">${localStorage.getItem(key)}</p>
                `;

                historyItem.onclick = () => {
                    this.putoutInputChar = historyItem.querySelector('.history_value').textContent;
                    this.elements.putoutInput.value = this.putoutInputChar;
                }

                this.elements.historyUL.insertBefore(historyItem, this.elements.historyUL.firstChild);
            }
        }
    }
}

// 使用方式
document.addEventListener('DOMContentLoaded', function() {
    const calculator = new Calculator();

    // 为按钮绑定事件（假设按钮有相应的类或ID）
    document.querySelectorAll('.number-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            calculator.appendNumber(btn.textContent);
        });
    });

    document.querySelectorAll('.operator-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            calculator.setOperator(btn.textContent);
        });
    });

    document.getElementById('close_history').addEventListener('click', () => {
        calculator.toggleHistoryPanel();
    });

    document.getElementById('clear_history').addEventListener('click', () => {
        calculator.clearHistoryList();
    });
});

/**
 * 添加精确计算方法
 * @param {*} value
 * @param {*} decimals
 * @returns
 */
function precise(value, decimals = 14) {

    // 如果不是数字，直接返回
    if (typeof value !== 'number') return value;

    // 将数字放大为整数进行计算，避免浮点误差
    const factor = Math.pow(10, decimals);
    const adjustedValue = Math.round(value * factor) / factor;

    // 检查是否需要修正
    const stringValue = value.toString();
    const hasDecimal = stringValue.includes('.');

    if (hasDecimal) {
        const decimalPlaces = stringValue.split('.')[1].length;
        if (decimalPlaces > decimals) {
            return adjustedValue;
        }
    }

    return value;
}