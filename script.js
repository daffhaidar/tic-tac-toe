// Refactored Tic Tac Toe Game - Clean, Modular, Maintainable
class TicTacToe {
    constructor() {
        // State
        this.board = [];
        this.boardSize = 3;
        this.winLength = 3;
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isPlayerTurn = true;
        this.difficulty = 'easy';
        this.playerMode = 'X';
        this.winningConditions = [];
        this.userScore = 0;
        this.botScore = 0;
        this.targetScore = 3;
        this.lastScoredLines = new Set();
        // UI Elements
        this.initUIRefs();
        this.initializeGame();
    }
    // --- UI References ---
    initUIRefs() {
        this.modeScreen = document.getElementById('modeScreen');
        this.difficultyScreen = document.getElementById('difficultyScreen');
        this.sizeScreen = document.getElementById('sizeScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.boardElement = document.getElementById('board');
        this.statusElement = document.getElementById('status');
        this.restartButton = document.getElementById('restartButton');
        this.changeSettingsButton = document.getElementById('changeSettingsButton');
        this.playerBadge = document.getElementById('playerBadge');
        this.difficultyBadge = document.getElementById('difficultyBadge');
        this.sizeBadge = document.getElementById('sizeBadge');
        this.userScoreElement = document.getElementById('userScore');
        this.botScoreElement = document.getElementById('botScore');
        this.userLabel = document.getElementById('userLabel');
        this.botLabel = document.getElementById('botLabel');
        this.scoreTarget = document.getElementById('scoreTarget');
    }
    // --- Game Initialization ---
    initializeGame() {
        this.setupModeSelection();
        this.setupDifficultySelection();
        this.setupSizeSelection();
        this.setupGameEvents();
    }
    // --- Mode/Difficulty/Size Selection ---
    setupModeSelection() {
        document.querySelectorAll('.mode-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.playerMode = card.getAttribute('data-mode');
                setTimeout(() => this.showDifficultySelection(), 500);
            };
        });
    }
    setupDifficultySelection() {
        document.querySelectorAll('.difficulty-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.difficulty = card.getAttribute('data-difficulty');
                setTimeout(() => this.showSizeSelection(), 500);
            };
        });
    }
    setupSizeSelection() {
        document.querySelectorAll('.size-card').forEach(card => {
            card.onclick = () => {
                document.querySelectorAll('.size-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.boardSize = parseInt(card.getAttribute('data-size'));
                setTimeout(() => this.startGame(), 500);
            };
        });
    }
    // --- Game Start/Restart ---
    startGame() {
        this.setTargetScoreByDifficulty();
        this.winLength = (this.difficulty === 'god') ? 5 : 3;
        this.userScore = 0;
        this.botScore = 0;
        this.lastScoredLines = new Set();
        this.updateScoreUI();
        this.showScreen('game');
        this.initializeBoard();
        this.generateWinningConditions();
        this.updateBadges();
        this.updateStatus();
        if (this.playerMode === 'O') this.botFirstMove();
    }
    fullRestart() {
        this.userScore = 0;
        this.botScore = 0;
        this.lastScoredLines = new Set();
        this.initializeBoard();
        this.generateWinningConditions();
        this.updateBadges();
        this.updateScoreUI();
        this.updateStatus();
        if (this.playerMode === 'O') this.botFirstMove();
    }
    resetBoardOnly() {
        this.board = Array(this.boardSize * this.boardSize).fill('');
        this.lastScoredLines = new Set();
        this.renderBoard();
        this.setupCellEvents();
        if (this.playerMode === 'X') {
            this.isPlayerTurn = true;
            this.updateStatus("Your turn! 🎯");
        } else {
            this.isPlayerTurn = false;
            this.updateStatus("Bot is thinking... 🤖");
            setTimeout(() => this.botMove(), 500);
        }
    }
    botFirstMove() {
        this.isPlayerTurn = false;
        this.updateStatus("Bot is thinking... 🤖");
        setTimeout(() => this.botMove(), 500);
    }
    // --- UI Screen Management ---
    showScreen(screen) {
        this.modeScreen.style.display = (screen === 'mode') ? 'flex' : 'none';
        this.difficultyScreen.style.display = (screen === 'difficulty') ? 'flex' : 'none';
        this.sizeScreen.style.display = (screen === 'size') ? 'flex' : 'none';
        this.gameScreen.style.display = (screen === 'game') ? 'flex' : 'none';
    }
    showModeSelection() { this.showScreen('mode'); }
    showDifficultySelection() { this.showScreen('difficulty'); }
    showSizeSelection() { this.showScreen('size'); }
    // --- Board & Cell Logic ---
    initializeBoard() {
        this.board = Array(this.boardSize * this.boardSize).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.isPlayerTurn = this.playerMode === 'X';
        this.winningCombination = null;
        this.renderBoard();
        this.setupCellEvents();
    }
    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.className = `board size-${this.boardSize}`;
        for (let i = 0; i < this.board.length; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.setAttribute('data-cell', i);
            cell.textContent = this.board[i];
            if (this.board[i]) cell.classList.add(this.board[i].toLowerCase());
            this.boardElement.appendChild(cell);
        }
    }
    setupCellEvents() {
        this.cells = document.querySelectorAll('[data-cell]');
        this.cells.forEach((cell, idx) => {
            cell.onclick = () => this.handleCellClick(idx);
        });
    }
    // --- Badges, Status, Score UI ---
    updateBadges() {
        const names = { easy: 'Easy', mid: 'Medium', hard: 'Hard', god: 'GOD' };
        this.playerBadge.textContent = `You: ${this.playerMode}`;
        this.difficultyBadge.textContent = names[this.difficulty];
        this.sizeBadge.textContent = `${this.boardSize}×${this.boardSize}`;
        this.userLabel.textContent = this.playerMode === 'X' ? 'You (X)' : 'You (O)';
        this.botLabel.textContent = this.playerMode === 'X' ? 'Bot (O)' : 'Bot (X)';
        let t = '';
        if (this.difficulty === 'easy') t = 'First to <b>3</b> points wins!';
        else if (this.difficulty === 'mid') t = 'First to <b>5</b> points wins!';
        else if (this.difficulty === 'hard') t = 'First to <b>10</b> points wins!';
        else t = 'First to <b>21</b> points wins!';
        this.scoreTarget.innerHTML = t;
    }
    updateStatus(msg) {
        this.statusElement.textContent = msg || (this.isPlayerTurn ? "Your turn! 🎯" : "Bot is thinking... 🤖");
    }
    updateScoreUI() {
        this.userScoreElement.textContent = this.userScore;
        this.botScoreElement.textContent = this.botScore;
    }
    animateScore(who) {
        const el = who === 'user' ? this.userScoreElement : this.botScoreElement;
        el.classList.add('score-animate');
        setTimeout(() => el.classList.remove('score-animate'), 600);
    }
    highlightLine(indices) {
        indices.forEach(idx => {
            this.cells[idx].classList.add('winning');
            setTimeout(() => this.cells[idx].classList.remove('winning'), 900);
        });
    }
    // --- Game Logic ---
    setTargetScoreByDifficulty() {
        if (this.difficulty === 'easy') this.targetScore = 3;
        else if (this.difficulty === 'mid') this.targetScore = 5;
        else if (this.difficulty === 'hard') this.targetScore = 10;
        else this.targetScore = 21;
    }
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive || !this.isPlayerTurn) return;
        this.makeMove(index, this.playerMode);
        this.checkAndScore();
        if (this.checkWinByScore()) return;
        if (this.checkDraw()) {
            this.updateStatus("Board full! Resetting...");
            setTimeout(() => this.resetBoardOnly(), 1200);
            return;
        }
        this.isPlayerTurn = false;
        this.updateStatus("Bot is thinking... 🤖");
        setTimeout(() => this.botMove(), 500);
    }
    makeMove(index, player) {
        this.board[index] = player;
        this.cells[index].textContent = player;
        this.cells[index].classList.add(player.toLowerCase());
    }
    botMove() {
        const botSymbol = this.playerMode === 'X' ? 'O' : 'X';
        let botIndex = (this.difficulty === 'god') ? this.getGodAggressiveMove(botSymbol) : this.getBotMove(botSymbol);
        this.makeMove(botIndex, botSymbol);
        this.checkAndScore();
        if (this.checkWinByScore()) return;
        if (this.checkDraw()) {
            this.updateStatus("Board full! Resetting...");
            setTimeout(() => this.resetBoardOnly(), 1200);
            return;
        }
        this.isPlayerTurn = true;
        this.updateStatus("Your turn! 🎯");
    }
    checkAndScore() {
        for (let i = 0; i < this.winningConditions.length; i++) {
            const cond = this.winningConditions[i];
            const first = this.board[cond[0]];
            if (!first) continue;
            if (cond.every(idx => this.board[idx] === first)) {
                if (!this.lastScoredLines.has(i)) {
                    this.lastScoredLines.add(i);
                    if (first === this.playerMode) {
                        this.userScore++;
                        this.animateScore('user');
                    } else {
                        this.botScore++;
                        this.animateScore('bot');
                    }
                    this.updateScoreUI();
                    this.highlightLine(cond);
                }
            }
        }
    }
    checkWinByScore() {
        if (this.userScore >= this.targetScore) {
            this.updateStatus('You win the match! 🏆');
            this.gameActive = false;
            setTimeout(() => this.fullRestart(), 2500);
            return true;
        }
        if (this.botScore >= this.targetScore) {
            this.updateStatus('Bot wins the match! 🤖🏆');
            this.gameActive = false;
            setTimeout(() => this.fullRestart(), 2500);
            return true;
        }
        return false;
    }
    // --- Board/Win Logic ---
    checkDraw() {
        return this.board.every(cell => cell !== '');
    }
    generateWinningConditions() {
        this.winningConditions = [];
        // Rows
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col <= this.boardSize - this.winLength; col++) {
                const cond = [];
                for (let i = 0; i < this.winLength; i++) cond.push(row * this.boardSize + col + i);
                this.winningConditions.push(cond);
            }
        }
        // Columns
        for (let col = 0; col < this.boardSize; col++) {
            for (let row = 0; row <= this.boardSize - this.winLength; row++) {
                const cond = [];
                for (let i = 0; i < this.winLength; i++) cond.push((row + i) * this.boardSize + col);
                this.winningConditions.push(cond);
            }
        }
        // Diagonals (top-left to bottom-right)
        for (let row = 0; row <= this.boardSize - this.winLength; row++) {
            for (let col = 0; col <= this.boardSize - this.winLength; col++) {
                const cond = [];
                for (let i = 0; i < this.winLength; i++) cond.push((row + i) * this.boardSize + (col + i));
                this.winningConditions.push(cond);
            }
        }
        // Diagonals (top-right to bottom-left)
        for (let row = 0; row <= this.boardSize - this.winLength; row++) {
            for (let col = this.winLength - 1; col < this.boardSize; col++) {
                const cond = [];
                for (let i = 0; i < this.winLength; i++) cond.push((row + i) * this.boardSize + (col - i));
                this.winningConditions.push(cond);
            }
        }
    }
    // --- Bot Logic (Easy/Medium/Hard/GOD) ---
    getBotMove(botSymbol) {
        const random = Math.random();
        if (this.difficulty === 'easy') return this.getEasyMove(random, botSymbol);
        if (this.difficulty === 'mid') return this.getMediumMove(random, botSymbol);
        if (this.difficulty === 'hard') return this.getHardMove(random, botSymbol);
        return this.getEasyMove(random, botSymbol);
    }
    getEasyMove(random, botSymbol) {
        return (random < 0.6) ? this.getRandomMove() : this.getBestMove(botSymbol);
    }
    getMediumMove(random, botSymbol) {
        return (random < 0.5) ? this.getRandomMove() : this.getBestMove(botSymbol);
    }
    getHardMove(random, botSymbol) {
        return (random < 0.3) ? this.getRandomMove() : this.getBestMove(botSymbol);
    }
    getRandomMove() {
        const available = [];
        for (let i = 0; i < this.board.length; i++) if (this.board[i] === '') available.push(i);
        return available[Math.floor(Math.random() * available.length)];
    }
    getBestMove(botSymbol) {
        const playerSymbol = botSymbol === 'X' ? 'O' : 'X';
        // 1. Try to win
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = botSymbol;
                if (this.isNewLineFormed(botSymbol)) { this.board[i] = ''; return i; }
                this.board[i] = '';
            }
        }
        // 2. Block player
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = playerSymbol;
                if (this.isNewLineFormed(playerSymbol)) { this.board[i] = ''; return i; }
                this.board[i] = '';
            }
        }
        // 3. Center
        const center = Math.floor(this.board.length / 2);
        if (this.board[center] === '') return center;
        // 4. Corners
        const corners = this.getCornerIndices();
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        // 5. Edges
        const edges = this.getEdgeIndices();
        const availableEdges = edges.filter(i => this.board[i] === '');
        if (availableEdges.length > 0) return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        // Fallback
        for (let i = 0; i < this.board.length; i++) if (this.board[i] === '') return i;
    }
    // --- GOD Mode Bot ---
    getGodAggressiveMove(botSymbol) {
        // 1. Win now
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = botSymbol;
                if (this.isNewLineFormed(botSymbol)) { this.board[i] = ''; return i; }
                this.board[i] = '';
            }
        }
        // 2. Block user
        const playerSymbol = botSymbol === 'X' ? 'O' : 'X';
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = playerSymbol;
                if (this.isNewLineFormed(playerSymbol)) { this.board[i] = ''; return i; }
                this.board[i] = '';
            }
        }
        // 3. Double threat
        let bestMove = -1, maxThreats = 0;
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = botSymbol;
                let threats = this.countPotentialLines(botSymbol);
                if (threats > maxThreats) { maxThreats = threats; bestMove = i; }
                this.board[i] = '';
            }
        }
        if (maxThreats >= 2) return bestMove;
        // 4. Minimax depth-2
        let bestScore = -Infinity, bestIndices = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === '') {
                this.board[i] = botSymbol;
                let minUserScore = Infinity;
                for (let j = 0; j < this.board.length; j++) {
                    if (this.board[j] === '') {
                        this.board[j] = playerSymbol;
                        let score = this.evaluateBoard(botSymbol, playerSymbol);
                        if (score < minUserScore) minUserScore = score;
                        this.board[j] = '';
                    }
                }
                if (minUserScore > bestScore) { bestScore = minUserScore; bestIndices = [i]; }
                else if (minUserScore === bestScore) bestIndices.push(i);
                this.board[i] = '';
            }
        }
        if (bestIndices.length > 0) return bestIndices[Math.floor(Math.random() * bestIndices.length)];
        // 5. Fallback
        return this.getBestMove(botSymbol);
    }
    evaluateBoard(botSymbol, playerSymbol) {
        let score = 0;
        for (let i = 0; i < this.winningConditions.length; i++) {
            const cond = this.winningConditions[i];
            const botCount = cond.filter(idx => this.board[idx] === botSymbol).length;
            const userCount = cond.filter(idx => this.board[idx] === playerSymbol).length;
            const emptyCount = cond.filter(idx => this.board[idx] === '').length;
            if (botCount === this.winLength) score += 100;
            if (userCount === this.winLength) score -= 100;
            if (botCount === this.winLength - 1 && emptyCount === 1) score += 10;
            if (userCount === this.winLength - 1 && emptyCount === 1) score -= 10;
            if (botCount === this.winLength - 2 && emptyCount === 2) score += 2;
            if (userCount === this.winLength - 2 && emptyCount === 2) score -= 2;
        }
        return score;
    }
    isNewLineFormed(symbol) {
        for (let i = 0; i < this.winningConditions.length; i++) {
            const cond = this.winningConditions[i];
            if (cond.every(idx => this.board[idx] === symbol)) {
                if (!this.lastScoredLines.has(i)) return true;
            }
        }
        return false;
    }
    countPotentialLines(symbol) {
        let count = 0;
        for (let i = 0; i < this.winningConditions.length; i++) {
            const cond = this.winningConditions[i];
            if (cond.filter(idx => this.board[idx] === symbol).length === this.winLength - 1 &&
                cond.filter(idx => this.board[idx] === '').length === 1) count++;
        }
        return count;
    }
    getCornerIndices() {
        const n = this.boardSize;
        return [0, n - 1, (n - 1) * n, n * n - 1];
    }
    getEdgeIndices() {
        const n = this.boardSize, total = n * n, edges = [];
        for (let i = 0; i < total; i++) {
            const row = Math.floor(i / n), col = i % n;
            if ((row === 0 || row === n - 1 || col === 0 || col === n - 1) &&
                !this.getCornerIndices().includes(i) && i !== Math.floor(total / 2)) edges.push(i);
        }
        return edges;
    }
}
// --- Init ---
document.addEventListener('DOMContentLoaded', () => new TicTacToe()); 
    new TicTacToe();
}); 