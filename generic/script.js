let gameState = {
    players: [],
    rounds: [],
    mode: 'score', // 'score' or 'rounds'
    limit: 100,
    winType: 'high', // 'high' (Most Points) or 'low' (Least Points)
    dealerIdx: 0
};

let curLang = 'fr';
const I18N = {
    fr: {
        game_mode: "Mode de Jeu",
        score_limit: "Limite Score",
        round_limit: "Limite Manches",
        end_condition: "Fin de Partie",
        win_condition: "Qui Gagne ?",
        win_high: "Plus Haut Score",
        win_low: "Plus Bas Score",
        players: "Joueurs",
        add_player: "+ Ajouter Joueur",
        start_game: "Commencer",
        enter_score: "Noter les points",
        home: "Accueil",
        round_res: "Résultats",
        validate: "Valider",
        cancel: "Annuler",
        total: "Total",
        winner: "🏆 Vainqueur : # !",
        game_over: "Partie Terminée",
        round: "Manche",
        place_score: "Max Score",
        place_round: "Max Manches",
        final_res: "🏆 Résultats Finaux",
        share: "📸 Partager",
        new_game: "Nouvelle Partie",
        rules_text_1: "Ce modèle sert à suivre les points de n'importe quel jeu.",
        rules_text_2: "Le maître du jeu choisit le mécanisme de comptage et entre les scores tour après tour jusqu'à ce que la limite soit atteinte.",
        rules_text_3: "Le classement final s'affichera alors, selon la condition de victoire choisie.",
        close: "Fermer"
    },
    en: {
        game_mode: "Game Mode",
        score_limit: "Score Limit",
        round_limit: "Round Limit",
        end_condition: "End Condition",
        win_condition: "Win Condition",
        win_high: "Highest Score Wins",
        win_low: "Lowest Score Wins",
        players: "Players",
        add_player: "+ Add Player",
        start_game: "Start Game",
        enter_score: "Enter Scores",
        home: "Home",
        round_res: "Results",
        validate: "Validate",
        cancel: "Cancel",
        total: "Total",
        winner: "🏆 Winner: # !",
        game_over: "Game Over",
        round: "Round",
        place_score: "Max Score",
        place_round: "Max Rounds",
        final_res: "🏆 Final Results",
        share: "📸 Share",
        new_game: "New Game",
        rules_text_1: "This template tracks points for any game.",
        rules_text_2: "The game master selects the counting mechanism and enters scores round by round until the limit is reached.",
        rules_text_3: "The final ranking will display based on the selected win condition (Highest or Lowest score).",
        close: "Close"
    }
};

function t(key) { return I18N[curLang][key] || key; }

function toggleLang() {
    curLang = curLang === 'fr' ? 'en' : 'fr';
    document.getElementById('btn-lang').innerText = curLang === 'fr' ? '🇬🇧' : '🇫🇷';
    updateText();
}

function updateText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });
    const limitInput = document.getElementById('limit-value');
    if (limitInput) {
        limitInput.placeholder = gameState.mode === 'score' ? t('place_score') : t('place_round');
    }
    renderTable();
}

function init() {
    const saved = localStorage.getItem('generic_state');
    if (saved) {
        gameState = JSON.parse(saved);
        // Default winType backward compatibility if strictly needed (though new file)
        if (!gameState.winType) gameState.winType = 'high';

        if (gameState.players.length > 0) setupBoard();
        else renderSetup();
    } else {
        renderSetup();
    }
}

function renderSetup() {
    const list = document.getElementById('players-list');
    list.innerHTML = '';
    const count = Math.max(gameState.players.length || 4, 4);
    for (let i = 0; i < count; i++) {
        addPlayerInput(gameState.players[i] || '');
    }
    updateText();
}

function addPlayerInput(val = '') {
    const list = document.getElementById('players-list');
    const div = document.createElement('div');
    div.className = 'input-row';
    const idx = list.children.length;
    div.innerHTML = `
        <div class="dealer-select ${idx === 0 ? 'selected' : ''}" onclick="selectDealer(${idx})">D</div>
        <input type="text" class="p-name" value="${val}" placeholder="Player ${idx + 1}" list="player-history">
    `;
    list.appendChild(div);
}

function selectDealer(idx) {
    gameState.dealerIdx = idx;
    document.querySelectorAll('.dealer-select').forEach((el, i) => {
        el.classList.toggle('selected', i === idx);
    });
}

function setMode(m) {
    gameState.mode = m;
    document.getElementById('btn-mode-score').classList.toggle('selected', m === 'score');
    document.getElementById('btn-mode-rounds').classList.toggle('selected', m === 'rounds');

    const inp = document.getElementById('limit-value');
    if (m === 'score') {
        inp.value = 100;
        inp.placeholder = t('place_score');
    } else {
        inp.value = 10;
        inp.placeholder = t('place_round');
    }
}

function setWinType(type) {
    gameState.winType = type;
    document.getElementById('btn-win-high').classList.toggle('selected', type === 'high');
    document.getElementById('btn-win-low').classList.toggle('selected', type === 'low');
}

let editingRoundIndex = -1;

function startGame() {
    const inputs = document.querySelectorAll('.p-name');
    const names = Array.from(inputs).map(i => i.value.trim()).filter(n => n);

    if (new Set(names).size !== names.length) return alert(t('unique_err') || "Unique names required!");
    if (names.length < 2) return alert("Min 2 players");

    gameState.players = names.map(n => n.charAt(0).toUpperCase() + n.slice(1));
    gameState.players.forEach(n => CommonGame.savePlayerName(n));
    gameState.limit = Number(document.getElementById('limit-value').value);

    // WinType is set by setWinType during setup
    if (!gameState.winType) gameState.winType = 'high';

    gameState.rounds = [];

    saveState();
    setupBoard();
}

function setupBoard() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    renderTable();
}

function openRoundInput() {
    editingRoundIndex = -1;
    openModalForInput();
}

function editRound(idx) {
    editingRoundIndex = idx;
    openModalForInput(gameState.rounds[idx]);
}

function openModalForInput(data = null) {
    const modal = document.getElementById('round-modal');
    const container = document.getElementById('modal-inputs');
    container.innerHTML = '';

    gameState.players.forEach((p, i) => {
        // Values
        let val = '';
        if (data) {
            val = data[i]; // Generic game stores simple array of scores per round
        }

        const div = document.createElement('div');
        div.className = 'score-row';
        div.innerHTML = `
            <div style="flex:1; text-align:left;">
                <label style="font-weight:bold;">${p}</label>
            </div>
            <input type="number" class="score-input" value="${val}" placeholder="0" style="width:80px; text-align:center; padding:8px; font-size:1.1rem;">
        `;
        container.appendChild(div);
    });

    modal.classList.add('visible');
}


function saveRound() {
    let scores = [];
    let inputs = document.querySelectorAll('.score-input');
    inputs.forEach((inp) => {
        scores.push(Number(inp.value) || 0);
    });

    if (editingRoundIndex > -1) {
        gameState.rounds[editingRoundIndex] = scores;
    } else {
        gameState.rounds.push(scores);
        gameState.dealerIdx = (gameState.dealerIdx + 1) % gameState.players.length;
    }

    saveState();
    closeModal();
    renderTable();
    checkGameEnd();
}

function renderTable() {
    const thead = document.getElementById('table-head');
    const tbody = document.getElementById('table-body');
    const tfoot = document.getElementById('table-foot');

    thead.innerHTML = '<th>#</th>';
    gameState.players.forEach((p, i) => {
        const th = document.createElement('th');
        th.innerText = p;
        if (i === gameState.dealerIdx) th.style.color = 'var(--secondary)';
        thead.appendChild(th);
    });

    tbody.innerHTML = '';
    let totals = new Array(gameState.players.length).fill(0);

    gameState.rounds.forEach((scores, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx + 1} <i class="fas fa-edit" style="font-size:0.8rem; color:#aaa; cursor:pointer; margin-left:4px;" onclick="editRound(${idx})"></i></td>`;

        scores.forEach((s, i) => {
            totals[i] += s;
            const td = document.createElement('td');
            td.innerHTML = `<span>${s}</span>`;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    tfoot.innerHTML = `<td>${t('total')}</td>`;
    totals.forEach(tot => {
        const td = document.createElement('td');
        td.innerText = tot;
        tfoot.appendChild(td);
    });

    document.getElementById('round-info').innerText = `${t('round')} ${gameState.rounds.length + 1}`;

    return totals;
}

function checkGameEnd() {
    const totals = renderTable();
    let ended = false;

    if (gameState.mode === 'score') {
        if (totals.some(t => t >= gameState.limit)) ended = true;
    } else {
        if (gameState.rounds.length >= gameState.limit) ended = true;
    }

    if (ended) {
        showFinalRanking(totals);
    }
}

function showFinalRanking(totals) {
    const rankings = gameState.players.map((p, i) => ({ name: p, score: totals[i] }));

    // Sort based on winType
    if (gameState.winType === 'low') {
        rankings.sort((a, b) => a.score - b.score);
    } else {
        rankings.sort((a, b) => b.score - a.score);
    }

    const list = document.getElementById('ranking-list');
    list.innerHTML = '';

    rankings.forEach((r, i) => {
        const div = document.createElement('div');
        div.style.fontSize = "1.2rem";
        div.style.borderBottom = "1px solid #ddd";
        div.style.padding = "10px";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";

        if (i === 0) {
            div.style.color = "var(--primary)";
            div.style.fontWeight = "bold";
            div.innerHTML = `<span>🏆 ${r.name}</span> <span>${r.score}</span>`;
        } else {
            div.innerHTML = `<span>${i + 1}. ${r.name}</span> <span>${r.score}</span>`;
        }

        list.appendChild(div);
    });

    document.getElementById('ranking-modal').classList.add('visible');
}

function closeFinalModal() {
    document.getElementById('ranking-modal').classList.remove('visible');
}

function shareResults() {
    const area = document.getElementById('rank-capture-area');
    html2canvas(area).then(canvas => {
        canvas.toBlob(blob => {
            const files = [new File([blob], 'generic-score.png', { type: 'image/png' })];
            // ... sharing logic consistent with other games ...
            if (navigator.share && navigator.canShare && navigator.canShare({ files })) {
                navigator.share({
                    files: files,
                    title: 'Game Results',
                    text: 'Great game!'
                });
            } else {
                const link = document.createElement('a');
                link.download = 'generic-score.png';
                link.href = canvas.toDataURL();
                link.click();
            }
        });
    });
}

function closeModal() {
    document.getElementById('round-modal').classList.remove('visible');
}

function showRules() {
    document.getElementById('rules-modal').classList.add('visible');
}

function resetGame() {
    if (confirm("Reset Game?")) {
        localStorage.removeItem('generic_state');
        location.reload();
    }
}

function saveState() {
    localStorage.setItem('generic_state', JSON.stringify(gameState));
}

document.addEventListener('DOMContentLoaded', () => {
    const history = CommonGame.getStoredPlayers();
    const dl = document.createElement('datalist');
    dl.id = 'player-history';
    history.forEach(n => {
        const op = document.createElement('option');
        op.value = n;
        dl.appendChild(op);
    });
    document.body.appendChild(dl);

    init();
});
