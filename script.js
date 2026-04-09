const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next');
const nextContext = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const gameOverElement = document.getElementById('game-over');
const startScreen = document.getElementById('start-screen');
const restartBtn = document.getElementById('restart-btn');
const startBtn = document.getElementById('start-btn');
const quitBtn = document.getElementById('quit-btn');
const muteBtn = document.getElementById('mute-btn');

const COLS = 10;
const ROWS = 20;
const BLOCK_SIZE = 30;

canvas.width = COLS * BLOCK_SIZE;
canvas.height = ROWS * BLOCK_SIZE;
nextCanvas.width = 4 * BLOCK_SIZE;
nextCanvas.height = 4 * BLOCK_SIZE;
nextContext.scale(0.8, 0.8);

const COLORS = {
    'I': '#00f3ff', 'J': '#0033ff', 'L': '#ff6700', 'O': '#fff01f',
    'S': '#39ff14', 'T': '#9d00ff', 'Z': '#ff3131'
};

const SHAPES = {
    'I': [[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],
    'J': [[0,1,0],[0,1,0],[1,1,0]],
    'L': [[0,1,0],[0,1,0],[0,1,1]],
    'O': [[1,1],[1,1]],
    'S': [[0,1,1],[1,1,0],[0,0,0]],
    'T': [[0,1,0],[1,1,1],[0,0,0]],
    'Z': [[1,1,0],[0,1,1],[0,0,0]]
};

class AudioManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.muted = false;
        this.isPlayingMusic = false;
        this.musicOsc = null;
    }

    playTone(freq, type, duration, volume = 0.1) {
        if (this.muted) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playMove() { this.playTone(200, 'square', 0.1, 0.05); }
    playRotate() { this.playTone(300, 'triangle', 0.1, 0.05); }
    playClear() { 
        this.playTone(400, 'sine', 0.2, 0.1);
        setTimeout(() => this.playTone(600, 'sine', 0.2, 0.1), 100);
    }
    playGameOver() {
        this.playTone(150, 'sawtooth', 0.5, 0.1);
        setTimeout(() => this.playTone(100, 'sawtooth', 0.5, 0.1), 200);
    }

    toggleMute() {
        this.muted = !this.muted;
        muteBtn.innerText = this.muted ? '🔇' : '🔊';
        if (this.muted) this.stopMusic(); else if (this.isPlayingMusic) this.playMusic();
    }

    playMusic() {
        if (this.muted || this.musicOsc) return;
        this.isPlayingMusic = true;
        
        // Semplice melodia Tetris (Korobeiniki) sintetizzata
        const notes = [
            [659, 4], [493, 8], [523, 8], [587, 4], [523, 8], [493, 8],
            [440, 4], [440, 8], [523, 8], [659, 4], [587, 8], [523, 8],
            [493, 4.5], [523, 8], [587, 4], [659, 4], [523, 4], [440, 4], [440, 4]
        ];
        
        let currentNote = 0;
        const playNextNote = () => {
            if (!this.isPlayingMusic || this.muted) return;
            const [freq, div] = notes[currentNote];
            const duration = (60 / 120) * (4 / div);
            
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration * 0.9);
            
            currentNote = (currentNote + 1) % notes.length;
            this.musicTimeout = setTimeout(playNextNote, duration * 1000);
        };
        playNextNote();
    }

    stopMusic() {
        this.isPlayingMusic = false;
        clearTimeout(this.musicTimeout);
    }
}

const audio = new AudioManager();

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

class Tetris {
    constructor() {
        this.arena = createMatrix(COLS, ROWS);
        this.gameOver = true; // Inizia in pausa
        this.bindEvents();
    }

    start() {
        this.reset();
        this.gameOver = false;
        startScreen.classList.add('hidden');
        gameOverElement.classList.add('hidden');
        audio.playMusic();
        this.update();
    }

    reset() {
        this.arena = createMatrix(COLS, ROWS);
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropCounter = 0;
        this.dropInterval = 1000;
        this.lastTime = 0;
        this.nextPiece = this.createPiece();
        this.resetPlayer();
        this.updateScore();
    }

    resetPlayer() {
        this.player = {
            pos: {x: 0, y: 0},
            matrix: this.nextPiece.matrix,
            type: this.nextPiece.type,
            color: COLORS[this.nextPiece.type]
        };
        this.nextPiece = this.createPiece();
        this.player.pos.y = 0;
        this.player.pos.x = (COLS / 2 | 0) - (this.player.matrix[0].length / 2 | 0);
        
        if (this.collide()) {
            this.gameOver = true;
            audio.playGameOver();
            audio.stopMusic();
            gameOverElement.classList.remove('hidden');
        }
        this.drawNext();
    }

    createPiece() {
        const types = 'IJLOSTZ';
        const type = types[types.length * Math.random() | 0];
        return { type: type, matrix: SHAPES[type] };
    }

    draw() {
        context.fillStyle = '#0b0e14';
        context.fillRect(0, 0, canvas.width, canvas.height);
        this.drawMatrix(this.arena, {x: 0, y: 0}, context);
        this.drawGhost();
        this.drawMatrix(this.player.matrix, this.player.pos, context, this.player.color);
    }

    drawNext() {
        nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        const m = this.nextPiece.matrix;
        const offset = { x: (4 - m[0].length) / 2, y: (4 - m.length) / 2 };
        this.drawMatrix(m, offset, nextContext, COLORS[this.nextPiece.type]);
    }

    drawMatrix(matrix, offset, ctx, colorOverride = null) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    const color = colorOverride || value;
                    const posX = (x + offset.x) * BLOCK_SIZE;
                    const posY = (y + offset.y) * BLOCK_SIZE;
                    ctx.shadowBlur = 10; ctx.shadowColor = color;
                    ctx.fillStyle = color;
                    ctx.fillRect(posX + 1, posY + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                    ctx.shadowBlur = 0;
                }
            });
        });
    }

    drawGhost() {
        const ghostPos = { x: this.player.pos.x, y: this.player.pos.y };
        while (!this.collide(ghostPos)) ghostPos.y++;
        ghostPos.y--;
        this.player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.strokeStyle = this.player.color;
                    context.strokeRect((x + ghostPos.x) * BLOCK_SIZE + 2, (y + ghostPos.y) * BLOCK_SIZE + 2, BLOCK_SIZE - 4, BLOCK_SIZE - 4);
                }
            });
        });
    }

    collide(pos = this.player.pos) {
        const m = this.player.matrix;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 && (this.arena[y + pos.y] === undefined || this.arena[y + pos.y][x + pos.x] === undefined || this.arena[y + pos.y][x + pos.x] !== 0)) return true;
            }
        }
        return false;
    }

    rotate(dir) {
        const pos = this.player.pos.x;
        let offset = 1;
        this._rotateMatrix(this.player.matrix, dir);
        while (this.collide()) {
            this.player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > this.player.matrix[0].length) {
                this._rotateMatrix(this.player.matrix, -dir);
                this.player.pos.x = pos;
                return;
            }
        }
        audio.playRotate();
    }

    _rotateMatrix(matrix, dir) {
        for (let y = 0; y < matrix.length; ++y) for (let x = 0; x < y; ++x) [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        if (dir > 0) matrix.forEach(row => row.reverse()); else matrix.reverse();
    }

    playerDrop() {
        this.player.pos.y++;
        if (this.collide()) {
            this.player.pos.y--;
            this.merge();
            this.resetPlayer();
            this.arenaSweep();
            this.updateScore();
        }
        this.dropCounter = 0;
    }

    playerMove(dir) {
        this.player.pos.x += dir;
        if (this.collide()) this.player.pos.x -= dir; else audio.playMove();
    }

    merge() {
        this.player.matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) this.arena[y + this.player.pos.y][x + this.player.pos.x] = this.player.color;
            });
        });
    }

    arenaSweep() {
        let rowsCleared = 0;
        outer: for (let y = this.arena.length - 1; y > 0; --y) {
            for (let x = 0; x < this.arena[y].length; ++x) if (this.arena[y][x] === 0) continue outer;
            const row = this.arena.splice(y, 1)[0].fill(0);
            this.arena.unshift(row);
            ++y; rowsCleared++;
        }
        if (rowsCleared > 0) {
            this.score += [0, 100, 300, 500, 800][rowsCleared] * this.level;
            this.lines += rowsCleared;
            audio.playClear();
            if (this.lines >= this.level * 10) {
                this.level++;
                this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            }
        }
    }

    updateScore() {
        scoreElement.innerText = this.score;
        levelElement.innerText = this.level;
        linesElement.innerText = this.lines;
    }

    update(time = 0) {
        if (this.gameOver) return;
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.dropCounter += deltaTime;
        if (this.dropCounter > this.dropInterval) this.playerDrop();
        this.draw();
        requestAnimationFrame(this.update.bind(this));
    }

    quit() {
        this.gameOver = true;
        audio.stopMusic();
        startScreen.classList.remove('hidden');
        gameOverElement.classList.add('hidden');
    }

    bindEvents() {
        document.addEventListener('keydown', event => {
            if (this.gameOver) return;
            if (event.keyCode === 37) this.playerMove(-1);
            else if (event.keyCode === 39) this.playerMove(1);
            else if (event.keyCode === 40) this.playerDrop();
            else if (event.keyCode === 38) this.rotate(1);
            else if (event.keyCode === 32) { while(!this.collide()){this.player.pos.y++;} this.player.pos.y--; this.playerDrop(); }
        });
        startBtn.addEventListener('click', () => this.start());
        restartBtn.addEventListener('click', () => this.start());
        quitBtn.addEventListener('click', () => this.quit());
        muteBtn.addEventListener('click', () => audio.toggleMute());
    }
}

const game = new Tetris();
