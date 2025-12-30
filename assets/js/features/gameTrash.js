// Trash Game functionality
class Paper {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'paper';
        this.element.innerHTML = '📄';
        this.element.style.position = 'absolute';
        this.element.style.fontSize = '24px';
        this.element.style.cursor = 'move';
        this.element.style.userSelect = 'none';
        this.element.style.zIndex = '1000';
        
        // Random position at the top
        this.x = Math.random() * (window.innerWidth - 50);
        this.y = -50;
        this.speed = 1 + Math.random() * 2; // Random speed between 1-3
        
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        
        // Make draggable
        this.isDragging = false;
        this.element.addEventListener('mousedown', (e) => this.startDrag(e));
        
        document.body.appendChild(this.element);
    }
    
    startDrag(e) {
        this.isDragging = true;
        const rect = this.element.getBoundingClientRect();
        this.offsetX = e.clientX - rect.left;
        this.offsetY = e.clientY - rect.top;
        
        const onMouseMove = (e) => {
            if (this.isDragging) {
                this.x = e.clientX - this.offsetX;
                this.y = e.clientY - this.offsetY;
                this.element.style.left = this.x + 'px';
                this.element.style.top = this.y + 'px';
                
                // Check if dropped on trash
                this.checkTrashCollision();
            }
        };
        
        const onMouseUp = () => {
            this.isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        
        e.preventDefault();
    }
    
    update() {
        if (!this.isDragging) {
            this.y += this.speed;
            this.element.style.top = this.y + 'px';
        }
        
        // Remove if off screen
        if (this.y > window.innerHeight) {
            this.remove();
            gameState.lives--;
            updateGameUI();
            if (gameState.lives <= 0) {
                endGame();
            }
        }
    }
    
    checkTrashCollision() {
        const trashIcon = document.querySelector('[data-modal="trash"]');
        if (!trashIcon) return;
        
        const trashRect = trashIcon.getBoundingClientRect();
        const paperRect = this.element.getBoundingClientRect();
        
        // Check collision
        if (paperRect.left < trashRect.right &&
            paperRect.right > trashRect.left &&
            paperRect.top < trashRect.bottom &&
            paperRect.bottom > trashRect.top) {
            
            // Collision detected
            this.remove();
            gameState.score += 10;
            playSuccessSound();
            updateGameUI();
            
            // Show points animation
            showPointsAnimation(this.x, this.y, '+10');
        }
    }
    
    remove() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        const index = gameState.papers.indexOf(this);
        if (index > -1) {
            gameState.papers.splice(index, 1);
        }
    }
}

function startGame() {
    playClickSound();
    
    // Reset game state
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.level = 1;
    gameState.papers = [];
    gameState.spawnRate = 2000; // 2 seconds initially
    
    // Clear any existing papers
    document.querySelectorAll('.paper').forEach(paper => paper.remove());
    document.querySelectorAll('.points-animation').forEach(anim => anim.remove());
    
    // Update UI
    updateGameUI();
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('gameControls').style.display = 'block';
    
    // Start spawning papers
    gameState.gameInterval = setInterval(spawnPaper, gameState.spawnRate);
    gameState.updateInterval = setInterval(updateGame, 16); // ~60 FPS
}

function pauseGame() {
    playClickSound();
    gameState.isPlaying = !gameState.isPlaying;
    
    if (gameState.isPlaying) {
        gameState.gameInterval = setInterval(spawnPaper, gameState.spawnRate);
        gameState.updateInterval = setInterval(updateGame, 16);
        document.getElementById('pauseBtn').textContent = 'Pause';
    } else {
        clearInterval(gameState.gameInterval);
        clearInterval(gameState.updateInterval);
        document.getElementById('pauseBtn').textContent = 'Reprendre';
    }
}

function endGame() {
    gameState.isPlaying = false;
    clearInterval(gameState.gameInterval);
    clearInterval(gameState.updateInterval);
    
    // Clear papers
    gameState.papers.forEach(paper => paper.remove());
    gameState.papers = [];
    
    // Show game over
    document.getElementById('gameOver').style.display = 'block';
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameControls').style.display = 'none';
    
    playErrorSound();
}

function spawnPaper() {
    if (!gameState.isPlaying) return;
    
    const paper = new Paper();
    gameState.papers.push(paper);
    
    // Increase difficulty over time
    if (gameState.score > 0 && gameState.score % 50 === 0 && gameState.spawnRate > 500) {
        gameState.level++;
        gameState.spawnRate -= 200; // Faster spawning
        clearInterval(gameState.gameInterval);
        gameState.gameInterval = setInterval(spawnPaper, gameState.spawnRate);
        updateGameUI();
    }
}

function updateGame() {
    if (!gameState.isPlaying) return;
    
    gameState.papers.forEach(paper => paper.update());
}

function updateGameUI() {
    const scoreElement = document.getElementById('gameScore');
    const livesElement = document.getElementById('gameLives');
    const levelElement = document.getElementById('gameLevel');
    
    if (scoreElement) scoreElement.textContent = gameState.score;
    if (livesElement) livesElement.textContent = gameState.lives;
    if (levelElement) levelElement.textContent = gameState.level;
}

function showPointsAnimation(x, y, text) {
    const anim = document.createElement('div');
    anim.className = 'points-animation';
    anim.textContent = text;
    anim.style.position = 'absolute';
    anim.style.left = x + 'px';
    anim.style.top = y + 'px';
    anim.style.color = '#00ff00';
    anim.style.fontWeight = 'bold';
    anim.style.fontSize = '20px';
    anim.style.pointerEvents = 'none';
    anim.style.zIndex = '2000';
    anim.style.transition = 'all 1s ease-out';
    
    document.body.appendChild(anim);
    
    // Animate
    setTimeout(() => {
        anim.style.transform = 'translateY(-50px)';
        anim.style.opacity = '0';
    }, 100);
    
    // Remove
    setTimeout(() => {
        if (anim.parentNode) {
            anim.parentNode.removeChild(anim);
        }
    }, 1100);
}