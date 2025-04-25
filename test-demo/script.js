/**
 * JP Transliterator テスト用スクリプト
 */

// タブ切り替え機能
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`.tab-button[onclick="showTab('${tabId}')"]`).classList.add('active');
}

// 結果表示用ヘルパー関数
function displayResult(elementId, result) {
    const resultElement = document.getElementById(elementId);
    
    if (typeof result === 'object') {
        resultElement.textContent = JSON.stringify(result, (key, value) => {
            if (value instanceof Map) {
                return {
                    dataType: 'Map',
                    value: Array.from(value.entries())
                };
            } else {
                return value;
            }
        }, 2);
    } else {
        resultElement.textContent = result;
    }
}

// 基本変換関数
function convertToRomaji() {
    const input = document.getElementById('input-text').value;
    if (!input) return;
    
    try {
        // ライブラリの関数を呼び出し
        const result = window.jpTransliterator.toRomaji(input);
        displayResult('basic-result', result);
    } catch (error) {
        displayResult('basic-result', `エラー: ${error.message}`);
    }
}

function convertToKana() {
    const input = document.getElementById('input-text').value;
    if (!input) return;
    
    try {
        // ライブラリの関数を呼び出し
        const result = window.jpTransliterator.toKana(input);
        displayResult('basic-result', result);
    } catch (error) {
        displayResult('basic-result', `エラー: ${error.message}`);
    }
}

// 詳細パターン関数
function getAllPatterns() {
    const input = document.getElementById('pattern-input').value;
    if (!input) return;
    
    try {
        const result = window.jpTransliterator.getAllInputPatterns(input);
        displayResult('pattern-result', result);
    } catch (error) {
        displayResult('pattern-result', `エラー: ${error.message}`);
    }
}

function getSegmented() {
    const input = document.getElementById('pattern-input').value;
    if (!input) return;
    
    try {
        const result = window.jpTransliterator.getSegmentedPatterns(input);
        displayResult('pattern-result', result);
    } catch (error) {
        displayResult('pattern-result', `エラー: ${error.message}`);
    }
}

function getComplete() {
    const input = document.getElementById('pattern-input').value;
    if (!input) return;
    
    try {
        const result = window.jpTransliterator.getCompletePatterns(input);
        displayResult('pattern-result', result);
    } catch (error) {
        displayResult('pattern-result', `エラー: ${error.message}`);
    }
}

function getPatternSet() {
    const input = document.getElementById('pattern-input').value;
    if (!input) return;
    
    try {
        const result = window.jpTransliterator.getPatternSets(input);
        displayResult('pattern-result', result);
    } catch (error) {
        displayResult('pattern-result', `エラー: ${error.message}`);
    }
}

// ライブラリの初期化を確認
window.addEventListener('DOMContentLoaded', () => {
    if (!window.jpTransliterator) {
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 50px;">
                <h2>エラー: JP Transliteratorライブラリが読み込まれていません</h2>
                <p>このテストページを使用する前に、まずライブラリをビルドして、以下のスクリプトタグで読み込んでください。</p>
                <pre style="text-align: left; max-width: 600px; margin: 20px auto; padding: 15px; background: #f5f5f5;">
&lt;script src="../dist/jp-transliterator.js"&gt;&lt;/script&gt;
                </pre>
                <p>または、ライブラリをグローバル変数として公開するようにしてください：</p>
                <pre style="text-align: left; max-width: 600px; margin: 20px auto; padding: 15px; background: #f5f5f5;">
window.jpTransliterator = {
    toRomaji: function(text) { ... },
    toKana: function(text) { ... },
    getAllInputPatterns: function(text) { ... },
    getSegmentedPatterns: function(text) { ... },
    getCompletePatterns: function(text) { ... },
    getPatternSets: function(text) { ... }
};
                </pre>
            </div>
        `;
    }
}); 