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

const ScoreAnnouncer = {
    isSpeaking: false,
    voicesReady: false,

    initVoices: function () {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => {
            this.voicesReady = true;
        };
        if (window.speechSynthesis.getVoices().length > 0) {
            this.voicesReady = true;
        }
    },

    announce: function (lines) {
        if (!window.speechSynthesis) return;

        if (this.isSpeaking) {
            window.speechSynthesis.cancel();
            this.isSpeaking = false;
            return;
        }

        this.isSpeaking = true;

        let targetLang = 'fr-FR';
        if (typeof curLang !== 'undefined' && curLang === 'en') {
            targetLang = 'en-US';
        }

        // Handle negative numbers for French "moins"
        if (targetLang.startsWith('fr')) {
            lines = lines.map(line => line.replace(/-(\d+)/g, "moins $1"));
        }

        const utterance = new SpeechSynthesisUtterance(lines.join(". "));
        utterance.lang = targetLang;

        // Voice adjustments
        if (targetLang.startsWith('en')) {
            utterance.rate = 1.3; // faster
            utterance.pitch = 1.4; // higher pitch
            utterance.volume = 1.0; // max volume
        } else {
            utterance.rate = 1.15; // slightly faster for French too
        }

        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
            let preferredVoices = voices.filter(v =>
                v.lang.startsWith(targetLang.split('-')[0]) &&
                (v.name.includes("Premium") || v.name.includes("Enhanced") || v.name.includes("Google") || v.name.includes("Siri") || v.name.includes("Natural"))
            );
            if (preferredVoices.length === 0) {
                preferredVoices = voices.filter(v => v.lang.startsWith(targetLang.split('-')[0]));
            }
            if (preferredVoices.length > 0) {
                utterance.voice = preferredVoices[0];
            }
        }

        utterance.onend = () => {
            this.isSpeaking = false;
        };

        utterance.onerror = () => {
            this.isSpeaking = false;
        };

        window.speechSynthesis.speak(utterance);
    }
};

ScoreAnnouncer.initVoices();
