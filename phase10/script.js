let curLang = localStorage.getItem('gamesnight_lang') || 'fr';
let gameState = {
    players: [],
    scores: [], // Array. [{phase: 1, points: 0}, ...]
    round: 1
};

const PHASES = {
    fr: [
        "1. 2 brelans (2 sets of 3)",
        "2. 1 brelan + 1 suite de 4",
        "3. 1 carré + 1 suite de 4",
        "4. 1 suite de 7",
        "5. 1 suite de 8",
        "6. 1 suite de 9",
        "7. 2 carrés (2 sets of 4)",
        "8. 7 cartes d'une couleur",
        "9. 1 set de 5 + 1 paire",
        "10. 1 set de 5 + 1 brelan"
    ],
    en: [
        "1. 2 sets of 3",
        "2. 1 set of 3 + 1 run of 4",
        "3. 1 set of 4 + 1 run of 4",
        "4. 1 run of 7",
        "5. 1 run of 8",
        "6. 1 run of 9",
        "7. 2 sets of 4",
        "8. 7 cards of one color",
        "9. 1 set of 5 + 1 set of 2",
        "10. 1 set of 5 + 1 set of 3"
    ]
};

const I18N = {
    fr: {
        players: "Joueurs",
        add_player: "+ Ajouter Joueur",
        start_game: "Commencer",
        player_col: "Joueur",
        phase_col: "Phase",
        score_col: "Score",
        enter_score: "Noter les points",
        round_res: "Résultats du Round",
        phase_done: "Phase réussie ?",
        score_gained: "Points pris",
        validate: "Valider",
        cancel: "Annuler",
        final_res: "🏆 Résultats Finaux",
        share: "📸 Partager",
        valid_same_players: "Rejouer (Mêmes Joueurs)",
        new_game_players: "Nouvelle Partie (Nouveaux Joueurs)",
        rules_title: "Règles",
        close: "Fermer",
        player: "Joueur",
        unique_err: "Les noms doivent être uniques !",
        min_players: "2 joueurs minimum",
        confirm_reset: "Réinitialiser la partie ?",
        round: "Manche",
        winner: "🏆 Vainqueur: # !",
        game_over: "Partie Terminée",
        rules: `
            <p><strong>But du jeu :</strong> Être le premier joueur à terminer les 10 phases. En cas d'égalité, le joueur avec le score le plus bas l'emporte.</p>
            <ul style="padding-left: 20px;">
                ${PHASES.fr.map(p => `<li>${p}</li>`).join('')}
            </ul>
        `
    },
    en: {
        players: "Players",
        add_player: "+ Add Player",
        start_game: "Start Game",
        player_col: "Player",
        phase_col: "Phase",
        score_col: "Score",
        enter_score: "Enter scores",
        round_res: "Round Results",
        phase_done: "Phase done?",
        score_gained: "Points",
        validate: "Validate",
        cancel: "Cancel",
        final_res: "🏆 Final Results",
        share: "📸 Share",
        valid_same_players: "Play Again (Same Players)",
        new_game_players: "New Game (New Players)",
        rules_title: "Rules",
        close: "Close",
        player: "Player",
        unique_err: "Unique names required!",
        min_players: "Min 2 players",
        confirm_reset: "Reset Game?",
        round: "Round",
        winner: "🏆 Winner: # !",
        game_over: "Game Over",
        rules: `
            <p><strong>Goal:</strong> Be the first to complete all 10 phases. In case of a tie, the lowest score wins.</p>
            <ul style="padding-left: 20px;">
                ${PHASES.en.map(p => `<li>${p}</li>`).join('')}
            </ul>
        `
    }
};

function t(key) { return I18N[curLang][key] || key; }

function toggleLang() {
    curLang = curLang === 'fr' ? 'en' : 'fr';
    localStorage.setItem('gamesnight_lang', curLang);
    document.getElementById('btn-lang').innerText = curLang === 'fr' ? '🇬🇧' : '🇫🇷';
    updateText();
}

function updateText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = t(el.getAttribute('data-i18n'));
    });

    document.querySelectorAll('.p-name').forEach((input, index) => {
        input.placeholder = `${t('player')} ${index + 1}`;
    });

    document.getElementById('rules-text').innerHTML = t('rules');

    if (gameState.players.length > 0) {
        document.getElementById('round-info').innerText = `${t('round')} ${gameState.round}`;
    }
}

function init() {
    const saved = localStorage.getItem('phase10_state');
    if (saved) {
        gameState = JSON.parse(saved);
        if (gameState.players.length > 0) setupBoard();
        else renderSetup();
    } else {
        renderSetup();
    }
    document.getElementById('btn-lang').innerText = curLang === 'fr' ? '🇬🇧' : '🇫🇷';
    updateText();
}

function showWarnUI(msg) {
    document.getElementById('warning-msg').innerText = msg;
    document.getElementById('warning-modal').classList.add('visible');
}

function renderSetup() {
    document.getElementById('setup-screen').style.display = 'block';
    document.getElementById('game-board').style.display = 'none';

    const list = document.getElementById('players-list');
    list.innerHTML = '';

    // Provide a default list based on history if available
    let past = CommonGame.getStoredPlayers();
    let initialCount = past.length >= 2 ? past.length : 4;

    for (let i = 0; i < initialCount; i++) {
        addPlayerInput(past[i] || '');
    }
}

function addPlayerInput(val = '') {
    const list = document.getElementById('players-list');
    const div = document.createElement('div');
    div.className = 'input-row';
    const idx = list.children.length;
    div.innerHTML = `
        <input type="text" class="p-name" value="${val}" placeholder="${t('player')} ${idx + 1}" list="player-history">
    `;
    list.appendChild(div);
}

function startGame() {
    const inputs = document.querySelectorAll('.p-name');
    const names = Array.from(inputs).map(i => i.value.trim()).filter(n => n);

    if (new Set(names).size !== names.length) return showWarnUI(t('unique_err'));
    if (names.length < 2) return showWarnUI(t('min_players'));

    gameState.players = names.map(n => n.charAt(0).toUpperCase() + n.slice(1));
    gameState.players.forEach(n => CommonGame.savePlayerName(n));

    gameState.scores = gameState.players.map(() => ({ phase: 1, points: 0 }));
    gameState.round = 1;

    saveState();
    setupBoard();
}

function saveState() {
    localStorage.setItem('phase10_state', JSON.stringify(gameState));
}

function setupBoard() {
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-board').style.display = 'flex';
    document.getElementById('round-info').innerText = `${t('round')} ${gameState.round}`;
    renderTable();
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';

    gameState.players.forEach((p, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p}</td>
            <td class="phase-cell">${gameState.scores[i].phase}</td>
            <td class="score-cell">${gameState.scores[i].points}</td>
        `;
        tbody.appendChild(tr);
    });
}

function openRoundInput() {
    const container = document.getElementById('modal-inputs');
    container.innerHTML = '';

    gameState.players.forEach((p, i) => {
        const currentPhase = gameState.scores[i].phase;
        const disabled = currentPhase > 10 ? 'disabled' : '';
        const phaseLabel = currentPhase > 10 ? 'DONE' : currentPhase;

        const div = document.createElement('div');
        div.className = 'round-input-row';
        div.innerHTML = `
            <div class="name-label">${p} <span style="font-size:0.8rem; color:#aaa;">(P${phaseLabel})</span></div>
            <input type="checkbox" id="chk-${i}" ${disabled}>
            <input type="number" id="pts-${i}" min="0" value="0">
        `;
        container.appendChild(div);
    });

    document.getElementById('round-modal').classList.add('visible');
}

function closeModal() {
    document.getElementById('round-modal').classList.remove('visible');
}

function saveRound() {
    let someOneFinished = false;

    gameState.players.forEach((p, i) => {
        const chk = document.getElementById(`chk-${i}`);
        const pts = document.getElementById(`pts-${i}`);

        const points = parseInt(pts.value) || 0;
        gameState.scores[i].points += points;

        if (chk && chk.checked && gameState.scores[i].phase <= 10) {
            gameState.scores[i].phase += 1;
        }

        if (gameState.scores[i].phase > 10) {
            someOneFinished = true;
        }
    });

    gameState.round++;
    saveState();
    closeModal();
    renderTable();

    if (someOneFinished) {
        openFinalModal();
    } else {
        document.getElementById('round-info').innerText = `${t('round')} ${gameState.round}`;
    }
}

function openFinalModal() {
    document.getElementById('round-info').innerText = t('game_over');

    // Sort logic
    let ranked = gameState.players.map((p, i) => ({
        name: p,
        phase: gameState.scores[i].phase,
        points: gameState.scores[i].points,
        idx: i
    })).sort((a, b) => {
        if (b.phase !== a.phase) return b.phase - a.phase; // higher phase first
        return a.points - b.points; // lower points first
    });

    const list = document.getElementById('ranking-list');
    list.innerHTML = '';

    ranked.forEach((r, idx) => {
        const div = document.createElement('div');
        div.style.padding = '10px';
        div.style.borderBottom = '1px solid #ddd';
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';

        let medal = '';
        if (idx === 0) medal = '🥇 ';
        else if (idx === 1) medal = '🥈 ';
        else if (idx === 2) medal = '🥉 ';
        else medal = `${idx + 1}. `;

        div.innerHTML = `
            <strong>${medal}${r.name}</strong>
            <span>Phase ${r.phase > 10 ? 10 : r.phase} | ${r.points} pts</span>
        `;
        list.appendChild(div);
    });

    // Update Winner title
    const wt = document.querySelector('#ranking-modal h2');
    if (wt) wt.innerText = t('winner').replace('#', ranked[0].name);

    document.getElementById('ranking-modal').classList.add('visible');
}

function closeFinalModal() {
    document.getElementById('ranking-modal').classList.remove('visible');
}

async function shareResults() {
    const el = document.getElementById('rank-capture-area');
    try {
        const canvas = await html2canvas(el, { backgroundColor: '#E3F2FD' });
        canvas.toBlob(async (blob) => {
            const file = new File([blob], "phase10_results.png", { type: "image/png" });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Phase 10 Results',
                    files: [file]
                });
            } else {
                const link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'phase10_results.png';
                link.click();
            }
        });
    } catch (e) {
        alert("Error sharing picture");
    }
}

function showRules() {
    document.getElementById('rules-modal').classList.add('visible');
}

function resetGame() {
    if (confirm(t('confirm_reset'))) {
        localStorage.removeItem('phase10_state');
        location.reload();
    }
}

function restartSamePlayers() {
    gameState.scores = gameState.players.map(() => ({ phase: 1, points: 0 }));
    gameState.round = 1;
    saveState();
    closeFinalModal();
    setupBoard();
}

function announceScores() {
    if (!ScoreAnnouncer) return;

    // Get table body
    const tbody = document.getElementById('table-body');
    if (!tbody || tbody.children.length === 0) return; // game not started

    // Sort logic depends on phase and score
    let ranked = gameState.players.map((p, i) => ({
        name: p,
        phase: gameState.scores[i].phase,
        points: gameState.scores[i].points,
        idx: i
    })).sort((a, b) => {
        if (a.phase !== b.phase) return a.phase - b.phase; // ascending phase
        return a.points - b.points; // ascending points on tie
    });

    const lines = ranked.map(r => `${r.name}, Phase ${r.phase > 10 ? 10 : r.phase}, ${r.points} points`);
    ScoreAnnouncer.announce(lines);
}

document.addEventListener('DOMContentLoaded', init);
