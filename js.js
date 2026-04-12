// ---------- 常量与辅助函数 ----------
const regexWord = /[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ]+(?!\S)/g;
const LEVELS = {
    1: { name: 'Bleu (débutant)', sources: ['BFSUFrancais_1'] },
    2: { name: 'DELF-B', sources: ['BFSUFrancais_1', 'BFSUFrancais_2', 'BFSUFrancais_3'] },
    3: { name: 'DELF-B(+)', sources: ['BFSUFrancais_1', 'BFSUFrancais_2', 'BFSUFrancais_3', 'BFSUFrancais_4'] },
    4: { name: 'DALF-C', sources: ['BFSUFrancais_1', 'BFSUFrancais_2', 'BFSUFrancais_3', 'BFSUFrancais_4', 'BFSUFrancais_5'] },
    5: { name: 'DALF-C(+)', sources: ['dictionnaire'] }
};
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
let currentLevel = 4;
let wordLength = 5;
let targetWord = '';
let currentRow = 0;
let currentTilePos = 0;
let gameActive = true;
let win = false;
let validationDictionary = [];
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

// ---------- 字典工具 ----------
function buildDictionaryFromLevel(level) {
    let combined = [];
    for (let src of LEVELS[level].sources) {
        if (src === 'BFSUFrancais_1') combined = combined.concat(window.BFSUFrancais_1 || []);
        else if (src === 'BFSUFrancais_2') combined = combined.concat(window.BFSUFrancais_2 || []);
        else if (src === 'BFSUFrancais_3') combined = combined.concat(window.BFSUFrancais_3 || []);
        else if (src === 'BFSUFrancais_4') combined = combined.concat(window.BFSUFrancais_4 || []);
        else if (src === 'BFSUFrancais_5') combined = combined.concat(window.BFSUFrancais_5 || []);
        else if (src === 'dictionnaire') combined = combined.concat(window.dictionnaire || []);
    }
    const textBlob = combined.join(' ');
    const words = [...new Set(textBlob.match(regexWord) || [])];
    return words.map(w => w.toLowerCase());
}

function rebuildWordListAndTarget() {
    const fullDict = buildDictionaryFromLevel(currentLevel);
    validationDictionary = [...fullDict];
    const filtered = fullDict.filter(w => w.length === wordLength);
    if (filtered.length === 0) {
        targetWord = 'motif';
        wordLength = 5;
        const fallback = fullDict.filter(w => w.length === 5);
        targetWord = (fallback.length ? fallback[0] : 'amour');
    } else {
        targetWord = filtered[Math.floor(Math.random() * filtered.length)];
    }
    console.log(`[DEBUG] niveau ${currentLevel}, longueur=${wordLength}, cible=${targetWord}`);
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

// 提交猜测
function submitGuess() {
    if (!gameActive || win) return;
    let guess = currentGuessLetters.join('');
    if (guess.length !== wordLength) {
        showModal('Mot incomplet', `Veuillez saisir ${wordLength} lettres.`, false);
        return;
    }
    if (!validationDictionary.includes(guess.toLowerCase())) {
        showModal('Mot invalide', `"${guess}" n'existe pas dans le dictionnaire.`, false);
        return;
    }

    let result = new Array(wordLength).fill('absent');
    let targetArr = targetWord.split('');
    let guessArr = guess.split('');
    for (let i = 0; i < wordLength; i++) {
        if (guessArr[i] === targetArr[i]) {
            result[i] = 'correct';
            targetArr[i] = null;
            guessArr[i] = null;
        }
    }
    for (let i = 0; i < wordLength; i++) {
        if (guessArr[i] === null) continue;
        let foundIndex = targetArr.indexOf(guessArr[i]);
        if (foundIndex !== -1) {
            result[i] = 'present';
            targetArr[foundIndex] = null;
        } else {
            let isAccent = false;
            for (let j = 0; j < wordLength; j++) {
                if (targetArr[j] && isAccentEquivalent(targetArr[j], guessArr[i])) {
                    isAccent = true;
                    targetArr[j] = null;
                    break;
                }
            }
            result[i] = isAccent ? 'accent-mismatch' : 'absent';
        }
    }
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
    modalTitle.innerText = title;
    modalBody.innerHTML = content;
    modalExtra.innerHTML = '';
    if (withRestart) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = '🔄 Nouvelle partie';
        btn.onclick = () => { closeModal(); resetFullGame(); };
        modalExtra.appendChild(btn);
    } else {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.textContent = 'Fermer';
        btn.onclick = closeModal;
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
    wordLength = Math.floor(Math.random() * 5) + 4;
    rebuildWordListAndTarget();
    buildGrid();
    for (let i = 0; i < wordLength; i++) updateTileLetter(currentRow, i, '');
    renderKeyboard();
    renderKeyboardColors();
}

function setLevel(levelId) {
    currentLevel = levelId;
    submittedHistory = [];
    currentRow = 0;
    currentTilePos = 0;
    win = false;
    gameActive = true;
    currentGuessLetters = [];
    keyState.clear();
    wordLength = Math.floor(Math.random() * 5) + 4;
    rebuildWordListAndTarget();
    buildGrid();
    renderKeyboard();
    closeModal();
}

// 介绍/难度/版本
function showIntroduction() {
    showModal('📖 FrWordle', `
            <div style="text-align:left; font-size:0.9rem">
            <strong>Règles :</strong><br>
            • Devinez le mot en 6 essais.<br>
            • <span style="color:#3b82f6">■ Bleu</span> : lettre correcte et bien placée.<br>
            • <span style="color:#e11d48">■ Rouge</span> : lettre présente mais mal placée.<br>
            • <span style="color:#9b59b6">■ Violet</span> : voyelle avec bon accent (mauvais emplacement).<br>
            • <span style="color:#94a3b8">■ Gris</span> : lettre absente.<br>
            <strong>Niveaux :</strong> débutant → expert.<br>
            </div>`, false);
}

function showDifficultyModal() {
    const btns = Object.keys(LEVELS).map(lvl => `<button class="btn" data-level="${lvl}">${LEVELS[lvl].name}</button>`).join('');
    showModal('🎚️ Niveau', `<div class="btn-group" id="difficultyChoices">${btns}</div><p style="font-size:0.8rem">Actuel : ${LEVELS[currentLevel].name}</p>`, false);
    setTimeout(() => {
        document.querySelectorAll('[data-level]').forEach(btn => {
            btn.addEventListener('click', (e) => setLevel(parseInt(e.target.getAttribute('data-level'))));
        });
    }, 10);
}

function showVersion() {
    showModal('Versions', `v3.2 — Interface minimaliste, accents, dictionnaire complet.<br>© DornGames`, false);
}

function showLegal() {
    showModal('Mentions légales', `
                <div style="text-align:left; font-size:0.85rem">
                <strong>FrWordle</strong> — jeu éducatif indépendant.<br>
                Dictionnaires : BFSU Français 1~5 + Dictionnaire étendu (source libre).<br>
                Conçu par DornGames. Aucune donnée personnelle collectée.<br>
                Pour toute question : dorngames@163.com
                </div>
            `, false);
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

    wordLength = Math.floor(Math.random() * 5) + 4;
    rebuildWordListAndTarget();
    buildGrid();
    currentGuessLetters = new Array(wordLength).fill('');
    renderKeyboard();
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('introBtn').addEventListener('click', showIntroduction);
    document.getElementById('difficultyBtn').addEventListener('click', showDifficultyModal);
    document.getElementById('versionBtn').addEventListener('click', showVersion);
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // 页脚交互（确保元素存在且绑定正确）
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