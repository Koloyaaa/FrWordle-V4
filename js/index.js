document.addEventListener('DOMContentLoaded', () => {
    const typingArea = document.getElementById('typing-area'),charCount = document.getElementById('char-count'),keys = document.querySelectorAll('.key-data');
    var letterTick = 0, wordTick = 0, gameOver = false,aimWord = 'opéra';
    globalThis.chooseLevel = 4;//选择的难度
    var booknum = Math.round(Math.random() * 3 + 1);//法语书册数
    const regex = /[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ]+(?!\S)/g;
    //const regex = /\b[a-zA-ZàâäèéêëîïôöùûüÿæœçÀÂÄÈÉÊËÎÏÔÖÙÛÜŸÆŒÇ'-]+\b/g;
    var list = [],wordLength = Math.round(4 + Math.random() * 4);//定义要猜的单词的长度

    //输出猜词区域
    document.getElementById("wordTable").innerHTML = ``;//初始化
    var wordleTableDetail = ``;//有待插入的详细代码
    for (var i = 0; i <= 5; i++) {
        wordleTableDetail += `<div id="wordTableLine">`;
        for (var j = 0; j < wordLength; j++) {
            wordleTableDetail += `<div id="letterContainer"><p></p></div>`;
        }
        wordleTableDetail += `</div>`;
    }
    document.getElementById("wordTable").innerHTML = wordleTableDetail;//显示猜词区域

    switch (chooseLevel) {
        case 1:
            list = BFSUFrancais_1.concat(BFSUFrancais_1);//合并所有项
            break;
        case 2:
            list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3);//合并所有项
            break;
        case 3:
            list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3, BFSUFrancais_4);//合并所有项
            break;
        case 4:
            list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3, BFSUFrancais_4, BFSUFrancais_5);//合并所有项
            break;
        case 5:
            list = dictionnaire;//合并所有项
            break;
    }
    //var words = (list.match(regex)).filter((item, index) => (list.match(regex)).indexOf(item) === index);//找出单词并去除重复词
    var words = [...new Set(list.match(regex))];
    console.log(words.length)
    var wordlist = [];//5字母单词表
    for (var i = 0; i < words.length; i++) {
        if (words[i].length == wordLength) {
            wordlist.push(words[i].toLowerCase());
        }
    }
    aimWord = wordlist[Math.round(wordlist.length * Math.random())];//定义目标词汇
    console.log(wordlist.length)
    console.log(aimWord)

    // Mapping of special characters
    const specialChars = {
        'Shift': '⇧',
        'Control': 'Ctrl',
        'Alt': '⌥',
        'Meta': '⌘',
        'Tab': 'Tab',
        'CapsLock': 'Maj',
        'Backspace': 'Suppr',
        'Enter': 'Fixer',
        'Space': 'Espace',
        'ArrowLeft': '←',
        'ArrowUp': '↑',
        'ArrowDown': '↓',
        'ArrowRight': '→',
        'Escape': 'Échap',
    };

    // Handle keyboard press
    document.addEventListener('keydown', (e) => {
        let key = e.key;
        let keyElement;

        try {
            // Handle special keys
            if (e.key == 'Backspace') {
                insertText(0, 1);//删除字母
                return;
            } else if (e.key == 'Enter') {//提交
                sumbit();
                return;
            }
            if (specialChars[key]) {
                keyElement = document.querySelector(`.key:contains('${specialChars[key]}')`);
            } else {
                // Handle regular keys
                keyElement = document.querySelector(`.key-data[data-key="${key.toLowerCase()}"]`);
            }
        } catch (err) {
            console.warn(err);
        }


        // Highlight the key
        if (keyElement) {
            e.preventDefault();
            keyElement.classList.add('key-active', 'key-press');
            // Handle character input
            const char = keyElement.getAttribute('data-char') || key;
            insertText(char);
        }
    });

    // Handle keyboard release
    document.addEventListener('keyup', (e) => {
        let key = e.key;
        let keyElement;

        try {
            // Handle special keys
            if (specialChars[key]) {
                keyElement = document.querySelector(`.key:contains('${specialChars[key]}')`);
            } else {
                // Handle regular keys
                keyElement = document.querySelector(`.key-data[data-key="${key.toLowerCase()}"]`);
            }
        } catch (err) {
            console.warn(err);
        }
        // Unhighlight the key
        if (keyElement) {
            keyElement.classList.remove('key-active', 'key-press');
        }
    });

    // Handle click on virtual keyboard
    keys.forEach(key => {
        key.addEventListener('mousedown', () => {
            key.classList.add('key-active', 'key-press');
            // Get the character to insert
            const char = key.getAttribute('data-char') || key.textContent.trim().charAt(0);
            insertText(char);
        });

        // Mouse up anywhere to release the key
        document.addEventListener('mouseup', () => {
            key.classList.remove('key-active', 'key-press');
        });
    });

    // Insert text at the current cursor position
    function insertText(text, dlt = 0) {
        // Get current cursor position
        const start = typingArea.selectionStart;
        const end = typingArea.selectionEnd;

        // Insert text
        typingArea.value = typingArea.value.substring(0, start) + text + typingArea.value.substring(end);

        // Move cursor after the inserted text
        typingArea.selectionStart = typingArea.selectionEnd = start + text.length;

        // Update character count
        updateCharCount();

        // Focus on the textarea
        typingArea.focus();

        if (!dlt) {//dlt为0，无需删除字母
            if (letterTick == wordLength) { return; }
            document.querySelectorAll('#letterContainer p')[wordTick * wordLength + letterTick].textContent = text.toLowerCase();//输入字母
            letterTick++;
        } else {//否则说明字母要删
            letterTick--;
            if (letterTick < 0) { letterTick = 0; }
            document.querySelectorAll('#letterContainer p')[wordTick * wordLength + letterTick].textContent = '';//输入字母
        }
    }
    globalThis.insertText = insertText;//转为全局，不然按键调用函数的时候用不了

    // Update character count
    function updateCharCount() {
        charCount.textContent = typingArea.value.length;
    }

    // Initial character count update
    updateCharCount();

    // Add smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add animation to the keyboard container on hover
    const keyboardContainer = document.querySelector('#keyboard');
    keyboardContainer.addEventListener('mouseenter', () => {
        keyboardContainer.classList.add('scale-[1.01]');
        keyboardContainer.style.transition = 'transform 0.3s ease';
    });

    keyboardContainer.addEventListener('mouseleave', () => {
        keyboardContainer.classList.remove('scale-[1.01]');
    });

    // Add responsive behavior
    function adjustKeyboardSize() {
        const container = document.querySelector('#keyboard');
        if (window.innerWidth < 768) {
            container.classList.add('text-xs');
            document.querySelectorAll('.key').forEach(key => {
                key.classList.add('h-10');
                key.classList.remove('h-12');
            });
        } else {
            container.classList.remove('text-xs');
            document.querySelectorAll('.key').forEach(key => {
                key.classList.remove('h-10');
                key.classList.add('h-12');
            });
        }
    }

    // Initial adjustment and on resize
    adjustKeyboardSize();
    window.addEventListener('resize', adjustKeyboardSize);
    function sumbit() {//提交单词
        var allword = dictionnaire;
        if (chooseLevel != 5) {//不是最难
            allword = allword.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3, BFSUFrancais_4, BFSUFrancais_5, dictionnaire);
        }//临时代码：accent可以被屏蔽
        var word = '', correctLetters = [];//正确的字母
        //录入这个词
        for (var i = 0; i < wordLength; i++) {//逐个字母校对
            word += document.querySelectorAll('#letterContainer p')[wordTick * wordLength + i].textContent;
        }
        if (word.length < wordLength) { return; }//字母数不够，不符合要求
        //校对单词的合法性
        if (!([...new Set(allword.match(regex))].filter(x => x == word)[0])) {
            showUI('Pardon', `Il n'y a pas ce mot dans la dictionnaire.`);
            return;
        }
        //先假设所有字母都不对，先上色
        for (var i = 0; i < word.length; i++) {
            for (var j = 0; j < word.length; j++) {
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.color = '#874ea6';
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.background = 'white';
                for (var k = 0; k < document.querySelectorAll('#keyboard_id div span').length; k++) {
                    //修改键盘上对应字母颜色
                    if (document.querySelectorAll('#keyboard_id div span')[k].textContent.toLowerCase() == word[i]) {
                        document.querySelectorAll('#keyboard_id div')[k].style.background = 'lightgrey';
                    }
                }
            }
        }

        //校对是否有位置不对但目标单词含有的字母
        for (var i = 0; i < word.length; i++) {//逐个字母校对
            for (var j = 0; j < word.length; j++) {
                if (aimWord[j] == word[i]) {
                    document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.color = 'white';
                    document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.background = 'rgb(137,30,82)';
                    for (var k = 0; k < document.querySelectorAll('#keyboard_id div span').length; k++) {
                        //修改键盘上对应字母颜色
                        if (document.querySelectorAll('#keyboard_id div span')[k].textContent.toLowerCase() == word[i] && document.querySelectorAll('#keyboard_id div')[k].style.background != '#99cbea' && !correctLetters.filter(x => x == word[i])[0]) {
                            document.querySelectorAll('#keyboard_id div')[k].style.color = 'white';
                            document.querySelectorAll('#keyboard_id div')[k].style.background = 'rgb(137,30,82)';
                        }
                    }
                }
            }
        }
        //校对是否有accent类型不对但单词中含有且位置正确的元音
        for (var i = 0; i < word.length; i++) {//逐个字母校对
            var factor = (('âä').match(aimWord[i]) && word[i] == 'a') || (('éêèë').match(aimWord[i]) && word[i] == 'e') || (('îï').match(aimWord[i]) && word[i] == 'i') || (('ôö').match(aimWord[i]) && word[i] == 'o') || (('ùûü').match(aimWord[i]) && word[i] == 'u');
            console.log('1');
            if (factor) {
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.color = 'white';
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.background = '#874ea6';
                for (var k = 0; k < document.querySelectorAll('#keyboard_id div span').length; k++) {
                    if (document.querySelectorAll('#keyboard_id div span')[k].textContent.toLowerCase() == word[i]) {
                        document.querySelectorAll('#keyboard_id div')[k].style.color = 'white';
                        document.querySelectorAll('#keyboard_id div')[k].style.background = '#874ea6';
                        correctLetterTick++;//字母正确，数量累加
                        correctLetters.push(word[i]);//添加到正确字母的清单中
                    }
                }
            }
        }
        //校对是否有位置和名称均一致的字母
        var correctLetterTick = 0;//正确的字母的计数
        for (var i = 0; i < word.length; i++) {//逐个字母校对
            if (aimWord[i] == word[i]) {
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.color = 'white';
                document.querySelectorAll('#letterContainer')[wordTick * wordLength + i].style.background = '#99cbea';
                for (var k = 0; k < document.querySelectorAll('#keyboard_id div span').length; k++) {
                    if (document.querySelectorAll('#keyboard_id div span')[k].textContent.toLowerCase() == word[i]) {
                        document.querySelectorAll('#keyboard_id div')[k].style.color = 'white';
                        document.querySelectorAll('#keyboard_id div')[k].style.background = '#99cbea';
                        correctLetterTick++;//字母正确，数量累加
                        correctLetters.push(word[i]);//添加到正确字母的清单中
                    }
                }
            }
        }
        if (correctLetterTick == wordLength) {//正确字母数对得上，说明游戏胜利
            showUI(`Bravo`, `Vous avez gagné la partie !<br><button onclick="window.location.reload();">Recommencer</button>`, true);
            return;//游戏结束
        }
        //修改数据，开始下一次猜测
        wordTick++;
        if (wordTick == 6) {//游戏结束了，输了
            showUI(`Fin du jeu`, `Nous avons le regret de vous informer que vous n’avez pas remporté la victoire du jeu.
                    <br>La bonne réponse pour ce jeu est :<strong> ${aimWord} </strong>
                    <br>Continuez votre bon travail ! 
                    <br><button onclick="window.location.reload();">Recommencer</button>`, true);
        }
        letterTick = 0;
        correctLetterTick = 0;
    }
    globalThis.sumbit = sumbit;
    function choose_Level() {
        console.log(chooseLevel);
        if (wordTick >= 1) { return; }//游戏进行中，无法更改难度
        switch (chooseLevel) {
            case 1:
                list = BFSUFrancais_1.concat(BFSUFrancais_1);//合并所有项
                break;
            case 2:
                list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3);//合并所有项
                break;
            case 3:
                list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3, BFSUFrancais_4);//合并所有项
                break;
            case 4:
                list = BFSUFrancais_1.concat(BFSUFrancais_1, BFSUFrancais_2, BFSUFrancais_3, BFSUFrancais_4, BFSUFrancais_5);//合并所有项
                break;
            case 5:
                list = dictionnaire;//合并所有项
                break;
        }
        var words = [...new Set(list.match(regex))];
        console.log(words.length)
        var wordlist = [];//5字母单词表
        for (var i = 0; i < words.length; i++) {
            if (words[i].length == wordLength) {
                wordlist.push(words[i].toLowerCase());
            }
        }
        aimWord = wordlist[Math.round(wordlist.length * Math.random())];//定义目标词汇
        console.log(aimWord);
    }
    globalThis.choose_Level = choose_Level;
});
function showUI(title, text, text_align) {
    document.getElementById('uibg').style.display = 'block';
    document.getElementById('ui_title').innerHTML = title;
    document.getElementById('ui_text').innerHTML = text;
    if (text_align) {
        document.getElementById('ui_text').style.textAlign = 'center';
    }
}
var introduction = `　FrWordle est un jeu de mots inspiré de Wordle, conçu spécialement pour les francophones. Chaque tour, un mot de cinq lettres est proposé, et les joueurs disposent de six tentatives pour le deviner . 
        <br>　<strong>Les cases colorées indiquent les indices : </strong>
        <br>* bleu pour la bonne lettre à la bonne place,
        <br>* rouge pour une lettre présente mais mal positionnée,
        <br>* violet signifie que la voyelle est présente dans le mot, mais qu’elle est phonétiquement et mal positionnée,
        <br>* et blanc pour une lettre absente. 
        <br>Le jeu utilise une bibliothèque de mots français, offrant une expérience adaptée aux apprenants de la langue et aux passionnés de lettres.`;
globalThis.introduction = introduction;
var versionInfo_ = `* v1.0.1 - Résolution d'un problème d'incompatibilité de format
        <br>* v1.0.2 - Résolution d'un problème de décalage en casse;Probabilité ajustée
        <br>* v1.1.0 - Correction d'une vulnérabilité dans la répétition à haute fréquence de certains mots; Extension de quelques mots
        <br>* v2.0.0 - Ajout d’un mécanisme de sélection de la difficulté,
Corriger tous les bugs,
Ajout de la page d’interface utilisateur Game Over,
Élargissez le vocabulaire de votre thésaurus,
Optimiser la typographie
<br>* v2.0.1 - Corriger les nouveaux bugs.
<br>* v2.1.0 - Ajouer des selectionneurs contre des mots qu'ils n'existent pas.
        <br>* v2.0.1 - Corriger tous les bugs.
        <br>* v2.1.0 - Améliorer les selectionneurs.
        <br>* v2.1.1 - Je pense que j'ai corrigé tous les bugs, mais au contraire, je fais diminuer le quantité des mots.
        <br>* v2.2.0 - Corriger tous les bugs. Bravo!
        <br>* v3.0.0 - Ajouter la diversité des quantité des lettres de chaque mot.
        <br>* v3.0.1 - Améliorer la diversité des quantité des lettres de chaque mot.
        <br>* v3.0.2 - Changer l'apparence du clavier.
        <br>* v3.1.0 - Ajouter le nouveau couleur pour les accents.
        <br>* v3.1.1 - Corriger tous les bugs.
        <br>* v3.1.2 - Ranger des documents.`;
globalThis.versionInfo_ = versionInfo_;
var chooseLevel_text = `<button onclick="chooseLevel = 1;document.getElementById('uibg').style.display = 'none';choose_Level();">Bleu</button>
        <button onclick="chooseLevel = 2;document.getElementById('uibg').style.display = 'none';choose_Level();">DELF-B </button>
        <button onclick="chooseLevel = 3;document.getElementById('uibg').style.display = 'none';choose_Level();">DELF-B(+)</button>
        <button onclick="chooseLevel = 4;document.getElementById('uibg').style.display = 'none';choose_Level();">DALF-C</button>
        <button onclick="chooseLevel = 5;document.getElementById('uibg').style.display = 'none';choose_Level();">DALF-C(+)</button><br><br>
        Le Bleu correspond à la difficulté de BFSU Français 1<br>
        Le DELF-B correspond à la difficulté du BFSU Français 3<br>
        Le DELF-B (+) correspond à la difficulté du BFSU Français 4<br>
        Le DALF-C correspond à la difficulté du locuteur natif français<br>
        Le DALF-C (+) correspond à la difficulté des savants français, avec un vocabulaire de plus de 65 000(le seul niveau exgère des accents)<br>
        <strong>La difficulté par défaut est DALF-C</strong>`;
globalThis.chooseLevel_text = chooseLevel_text;
