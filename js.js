// ---------- 常量与辅助函数 ----------
const KEYBOARD_ROWS = [
    ['a', 'z', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'î', 'â', 'ä'],
    ['q', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'ù', 'û', 'œ', 'ô'],
    ['w', 'x', 'c', 'v', 'b', 'n', 'é', 'ê', 'è', 'ç', 'ë', 'ï', 'ö', 'ü', 'ÿ']
];
const SPECIAL_KEYS = [
    { label: 'Suppr', action: 'delete' },
    { label: 'Fixer', action: 'submit' }
];

function isAccentEquivalent(aimChar, guessChar) {
    const map = {
        'a': ['â', 'ä'], 'e': ['é', 'ê', 'è', 'ë'], 'i': ['î', 'ï'],
        'o': ['ô', 'ö'], 'u': ['ù', 'û', 'ü']
    };
    if (!map[guessChar]) return false;
    return map[guessChar].includes(aimChar);
}

// ---------- 游戏状态 ----------
let wordLength = 5;
let targetWord = '';
let currentRow = 0;
let currentTilePos = 0;
let gameActive = true;
let win = false;
let fullDictionary = [];
let validationSet = new Set();
let keyState = new Map();
let currentGuessLetters = [];
let submittedHistory = [];

// DOM 元素
let gridContainer = document.getElementById('wordGrid');
let keyboardContainer = document.getElementById('virtualKeyboard');
let modal = document.getElementById('globalModal');
let modalTitle = document.getElementById('modalTitle');
let modalBody = document.getElementById('modalBody');
let modalExtra = document.getElementById('modalExtra');

// ---------- 加载词典 ----------
function loadDictionary() {
    if (typeof dic !== 'undefined' && Array.isArray(dic)) {
        fullDictionary = dic.map(w => w.toLowerCase());
        validationSet = new Set(fullDictionary);
        console.log(`✅ Dictionnaire chargé : ${fullDictionary.length} mots`);
        initGame();
    } else {
        console.error('❌ Erreur : la variable dic n\'est pas définie ou n\'est pas un tableau');
        showModal('Erreur', 'Impossible de charger le dictionnaire. Vérifiez dictionary.js', false);
    }
}

// 随机选择目标词（长度 4-8）
function selectRandomWord() {
    wordLength = Math.floor(Math.random() * 5) + 4;
    const candidates = fullDictionary.filter(w => w.length === wordLength);
    if (candidates.length === 0) {
        targetWord = fullDictionary[Math.floor(Math.random() * fullDictionary.length)];
        wordLength = targetWord.length;
    } else {
        targetWord = candidates[Math.floor(Math.random() * candidates.length)];
    }
    console.log(`[DEBUG] longueur=${wordLength}, cible=${targetWord}`);
}

function initGame(resetGame = true) {
    if (fullDictionary.length === 0) return;
    selectRandomWord();
    if (resetGame) {
        currentRow = 0;
        currentTilePos = 0;
        gameActive = true;
        win = false;
        keyState.clear();
        currentGuessLetters = new Array(wordLength).fill('');
        submittedHistory = [];
        buildGrid();
        renderKeyboard();
    }
}

// ---------- 网格构建（一次性构建6行） ----------
function buildGrid() {
    gridContainer.innerHTML = '';
    for (let r = 0; r < 6; r++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'grid-row';
        rowDiv.setAttribute('data-row', r);
        for (let c = 0; c < wordLength; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile empty';
            tile.setAttribute('data-col', c);
            tile.textContent = '';
            rowDiv.appendChild(tile);
        }
        gridContainer.appendChild(rowDiv);
    }
}

function updateTileLetter(row, col, letter) {
    const rowDiv = gridContainer.children[row];
    if (rowDiv && rowDiv.children[col]) {
        rowDiv.children[col].textContent = letter || '';
    }
}

function applyRowColorsFromResult(rowIndex, resultColors, guessWord) {
    const rowDiv = gridContainer.children[rowIndex];
    if (!rowDiv) return;
    for (let i = 0; i < wordLength; i++) {
        const tile = rowDiv.children[i];
        tile.classList.remove('correct', 'present', 'accent-mismatch', 'absent', 'empty');
        if (resultColors[i] === 'correct') tile.classList.add('correct');
        else if (resultColors[i] === 'present') tile.classList.add('present');
        else if (resultColors[i] === 'accent-mismatch') tile.classList.add('accent-mismatch');
        else tile.classList.add('absent');
        const letter = guessWord[i];
        const newState = resultColors[i];
        const priority = { 'correct': 3, 'present': 2, 'accent-mismatch': 1, 'absent': 0 };
        const cur = keyState.get(letter);
        if (!cur || priority[newState] > priority[cur]) keyState.set(letter, newState);
    }
    renderKeyboardColors();
}

// 修复后的提交猜测逻辑 —— 正确处理重复字母计数
function submitGuess() {
    if (!gameActive || win) return;
    let guess = currentGuessLetters.join('');
    if (guess.length !== wordLength) {
        showModal('Mot incomplet', `Veuillez saisir ${wordLength} lettres.`, false);
        return;
    }
    if (!validationSet.has(guess.toLowerCase())) {
        showModal('Mot invalide', `"${guess}" n'existe pas dans le dictionnaire.`, false);
        return;
    }

    const targetArr = targetWord.split('');
    const guessArr = guess.split('');
    const result = new Array(wordLength).fill('absent');

    // 第一步：标记正确位置 (correct)，并记录哪些位置已被正确匹配
    for (let i = 0; i < wordLength; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = 'correct';
            targetArr[i] = null;      // 占位，表示已使用
            guessArr[i] = null;
        }
    }

    // 构建剩余字母计数表 (排除已正确匹配的字母)
    const remainingCount = new Map();
    for (let i = 0; i < wordLength; i++) {
        const ch = targetArr[i];
        if (ch !== null) {
            remainingCount.set(ch, (remainingCount.get(ch) || 0) + 1);
        }
    }

    // 第二步：标记存在但位置错误 (present) —— 精确字母匹配
    for (let i = 0; i < wordLength; i++) {
        const ch = guessArr[i];
        if (ch === null) continue;           // 已经是正确位置，跳过
        if (remainingCount.has(ch) && remainingCount.get(ch) > 0) {
            result[i] = 'present';
            remainingCount.set(ch, remainingCount.get(ch) - 1);
            guessArr[i] = null;              // 标记已处理
        }
    }

    // 第三步：处理重音等价 (accent-mismatch)
    for (let i = 0; i < wordLength; i++) {
        const ch = guessArr[i];
        if (ch === null) continue;           // 已正确或已标记为 present，跳过
        // 寻找是否有重音等价字母剩余
        let found = false;
        for (let [targetCh, count] of remainingCount.entries()) {
            if (count > 0 && isAccentEquivalent(targetCh, ch)) {
                result[i] = 'accent-mismatch';
                remainingCount.set(targetCh, count - 1);
                found = true;
                break;
            }
        }
        if (!found) {
            result[i] = 'absent';
        }
    }

    // 应用颜色到网格并更新键盘状态
    applyRowColorsFromResult(currentRow, result, guess);
    submittedHistory.push({ guess, target: targetWord });

    if (guess === targetWord) {
        win = true;
        gameActive = false;
        showModal('🎉 Bravo !', `Vous avez trouvé le mot « ${targetWord} » en ${currentRow + 1} essai(s).`, true);
        return;
    }
    currentRow++;
    if (currentRow >= 6) {
        gameActive = false;
        showModal('Fin de partie', `Le mot était « ${targetWord} ». Rejouez pour progresser.`, true);
        return;
    }
    currentTilePos = 0;
    currentGuessLetters = new Array(wordLength).fill('');
    for (let i = 0; i < wordLength; i++) updateTileLetter(currentRow, i, '');
}

function deleteLetter() {
    if (!gameActive || win) return;
    if (currentTilePos > 0) {
        currentTilePos--;
        currentGuessLetters[currentTilePos] = '';
        updateTileLetter(currentRow, currentTilePos, '');
    }
}

function addLetter(letter) {
    if (!gameActive || win) return;
    if (currentTilePos < wordLength) {
        currentGuessLetters[currentTilePos] = letter.toLowerCase();
        updateTileLetter(currentRow, currentTilePos, letter.toLowerCase());
        currentTilePos++;
    }
}

// ---------- 虚拟键盘渲染 ----------
function renderKeyboard() {
    keyboardContainer.innerHTML = '';
    for (let row of KEYBOARD_ROWS) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        for (let letter of row) {
            const keyDiv = document.createElement('div');
            keyDiv.className = 'key';
            keyDiv.textContent = letter.toUpperCase();
            keyDiv.setAttribute('data-letter', letter);
            keyDiv.addEventListener('mousedown', (e) => {
                e.preventDefault();
                keyDiv.classList.add('key-active');
                addLetter(letter);
            });
            keyDiv.addEventListener('mouseup', () => keyDiv.classList.remove('key-active'));
            keyDiv.addEventListener('mouseleave', () => keyDiv.classList.remove('key-active'));
            rowDiv.appendChild(keyDiv);
        }
        keyboardContainer.appendChild(rowDiv);
    }
    const specialRow = document.createElement('div');
    specialRow.className = 'key-row';
    for (let sp of SPECIAL_KEYS) {
        const btn = document.createElement('div');
        btn.className = 'key key-special';
        btn.textContent = sp.label;
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            btn.classList.add('key-active');
            if (sp.action === 'delete') deleteLetter();
            else if (sp.action === 'submit') submitGuess();
        });
        btn.addEventListener('mouseup', () => btn.classList.remove('key-active'));
        btn.addEventListener('mouseleave', () => btn.classList.remove('key-active'));
        specialRow.appendChild(btn);
    }
    keyboardContainer.appendChild(specialRow);
    renderKeyboardColors();
}

function renderKeyboardColors() {
    document.querySelectorAll('.key[data-letter]').forEach(k => {
        const letter = k.getAttribute('data-letter');
        const state = keyState.get(letter);
        k.classList.remove('correct-key', 'present-key', 'accent-key', 'absent-key');
        if (state === 'correct') k.classList.add('correct-key');
        else if (state === 'present') k.classList.add('present-key');
        else if (state === 'accent-mismatch') k.classList.add('accent-key');
        else if (state === 'absent') k.classList.add('absent-key');
    });
}

// ---------- 物理键盘支持 ----------
function getPhysicalKeyElement(keyChar) {
    const lower = keyChar.toLowerCase();
    const allKeys = document.querySelectorAll('.key[data-letter]');
    for (let k of allKeys) {
        if (k.getAttribute('data-letter') === lower) return k;
    }
    if (keyChar === 'Backspace') return document.querySelector('.key-special:first-child');
    if (keyChar === 'Enter') return document.querySelector('.key-special:last-child');
    return null;
}

function handleKeyDown(e) {
    if (!gameActive || win) return;
    const key = e.key;
    const keyElem = getPhysicalKeyElement(key);
    if (keyElem) {
        e.preventDefault();
        keyElem.classList.add('key-active');
    }
    if (key === 'Backspace') {
        deleteLetter();
    } else if (key === 'Enter') {
        submitGuess();
    } else if (key.length === 1) {
        const lowerKey = key.toLowerCase();
        const allLetters = KEYBOARD_ROWS.flat();
        if (allLetters.includes(lowerKey)) addLetter(lowerKey);
    }
}

function handleKeyUp(e) {
    const key = e.key;
    const keyElem = getPhysicalKeyElement(key);
    if (keyElem) keyElem.classList.remove('key-active');
}

// ---------- 模态框 ----------
function showModal(title, content, withRestart = false) {
    if (!modal) {
        modal = document.getElementById('globalModal');
        modalTitle = document.getElementById('modalTitle');
        modalBody = document.getElementById('modalBody');
        modalExtra = document.getElementById('modalExtra');
    }
    modalTitle.innerText = title;
    modalBody.innerHTML = content;
    modalExtra.innerHTML = '';
    if (withRestart) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '🔄 Nouvelle partie';
        btn.onclick = () => { closeModal(); resetFullGame(); };
        modalExtra.appendChild(btn);
    }
    modal.classList.add('active');
}

function closeModal() { modal.classList.remove('active'); }

function resetFullGame() {
    submittedHistory = [];
    currentRow = 0;
    currentTilePos = 0;
    win = false;
    gameActive = true;
    currentGuessLetters = new Array(wordLength).fill('');
    keyState.clear();
    selectRandomWord();
    buildGrid();
    for (let i = 0; i < wordLength; i++) updateTileLetter(currentRow, i, '');
    renderKeyboard();
    renderKeyboardColors();
}

// 介绍 / 版本 / 法律声明
function showIntroduction() {
    showModal('📖 FrWordle', `
        <div style="text-align:left; font-size:0.9rem">
        <strong>Règles :</strong><br>
        • Devinez le mot en 6 essais.<br>
        • <span style="color:#3b82f6">■ Bleu</span> : lettre correcte et bien placée.<br>
        • <span style="color:#e11d48">■ Rouge</span> : lettre présente mais mal placée.<br>
        • <span style="color:#9b59b6">■ Violet</span> : voyelle avec bon accent (mauvais emplacement).<br>
        • <span style="color:#94a3b8">■ Gris</span> : lettre absente.<br>
        <strong>Dictionnaire :</strong> ${fullDictionary.length} mots français filtrés.<br>
        </div>`, false);
}

function showVersion() {
    showModal('Versions', `V4 — Interface minimaliste, accents, dictionnaire unique.<br>© DornGames`, false);
}

function showLegal() {
    showModal('Mentions légales', `
        <div style="text-align:left; font-size:0.85rem">
        <strong>FrWordle</strong> — jeu éducatif indépendant.<br>
        Dictionnaire filtré (source libre).<br>
        Conçu par DornGames. Aucune donnée personnelle collectée.<br>
        Contact : dorngames@163.com
        </div>`, false);
}

function copyEmail() {
    navigator.clipboard.writeText('dorngames@163.com').then(() => {
        showModal('📧 Contact', 'Email copié : dorngames@163.com', false);
    }).catch(() => {
        alert('Impossible de copier, email : dorngames@163.com');
    });
}

// ---------- 初始化 ----------
window.addEventListener('DOMContentLoaded', () => {
    modal = document.getElementById('globalModal');
    modalTitle = document.getElementById('modalTitle');
    modalBody = document.getElementById('modalBody');
    modalExtra = document.getElementById('modalExtra');

    loadDictionary();

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('introBtn').addEventListener('click', showIntroduction);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    const footerIntro = document.getElementById('footerIntroBtn');
    const footerVersion = document.getElementById('footerVersionBtn');
    const footerContact = document.getElementById('footerContactBtn');
    const legalLink = document.getElementById('legalLink');

    if (footerIntro) footerIntro.addEventListener('click', (e) => { e.preventDefault(); showIntroduction(); });
    if (footerVersion) footerVersion.addEventListener('click', (e) => { e.preventDefault(); showVersion(); });
    if (footerContact) footerContact.addEventListener('click', (e) => { e.preventDefault(); copyEmail(); });
    if (legalLink) legalLink.addEventListener('click', (e) => { e.preventDefault(); showLegal(); });
});

window.resetFullGame = resetFullGame;