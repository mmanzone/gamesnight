const SHARED_HISTORY_KEY = 'skullKing_Names';

const CommonGame = {
    getStoredPlayers: function () {
        try {
            return JSON.parse(localStorage.getItem(SHARED_HISTORY_KEY) || '[]');
        } catch (e) {
            return [];
        }
    },

    savePlayerName: function (name) {
        if (!name) return;
        let history = this.getStoredPlayers();
        name = name.trim();
        // Capitalize first letter
        name = name.charAt(0).toUpperCase() + name.slice(1);

        if (name && !history.includes(name)) {
            history.push(name);
            localStorage.setItem(SHARED_HISTORY_KEY, JSON.stringify(history));
        }
    },

    goHome: function () {
        // Simple language detection from document lang or default to FR if not set/managed elsewhere
        // But the requirement says "Prompt to confirm".
        // I'll try to detect language from specific game variable if available, else default to dual msg.

        let msg = "Confirmer : Retour à l'accueil ? La partie en cours sera perdue.\n\nConfirm: Return to Home? Current game progress will be lost.";

        // Try to respect active language if widely available, but for simplicity/robustness dual language is safer here
        // or check if global 'curLang' exists
        if (typeof curLang !== 'undefined') {
            if (curLang === 'fr') msg = "Confirmer : Retour à l'accueil ? La partie en cours sera perdue.";
            else msg = "Confirm: Return to Home? Current game progress will be lost.";
        }

        if (confirm(msg)) {
            if (window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('skullking/index.html').replace('skullking/', '')) {
                window.location.href = '../index.html';
            } else {
                window.location.href = '../index.html';
            }
        }
    }
};
