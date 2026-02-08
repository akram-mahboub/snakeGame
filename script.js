const gameBoard = document.querySelector("#gameBoard");
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText");
const bestScoreText = document.querySelector("#bestScore");
const resetBtn = document.querySelector("#resetBtn");
const startGame = document.querySelector("#startGame");
const gameWidth = gameBoard.width;
const gameHeight = gameBoard.height;

const eatSound = new Audio("sounds/eat.mp3");
const gameOverSound = new Audio("sounds/FinalCredits.mp3");
const bg = new Audio("sounds/bg.mp3");

const boardBackground = "#000000";
const snakeColor = "#679499";
const snakeBorder = "#D7A278";
const foodColor = "#C33740";
const goldFoodColor = "#E3D5B8";
const gridColor = "rgba(103, 148, 153, 0.15)";
const unitSize = 25;

let running = false;
let xVelocity = unitSize;
let yVelocity = 0;
let foodX;
let foodY;
let score = 0;
let bestScore = 0;
let gameSpeed = 75; // Starting speed in milliseconds
let baseSpeed = 75;
let minSpeed = 30; // Fastest possible speed
let speedIncreaseInterval = 5; // Increase speed every 5 points
let snake = [
  { x: unitSize * 4, y: 0 },
  { x: unitSize * 3, y: 0 },
  { x: unitSize * 2, y: 0 },
  { x: unitSize, y: 0 },
  { x: 0, y: 0 },
];
let isBigFood = false;
let bigFoodTimer = null;

// Load best score from localStorage
function loadBestScore() {
  const saved = localStorage.getItem("snakeBestScore");
  if (saved) {
    bestScore = parseInt(saved);
    bestScoreText.textContent = bestScore;
  }
}

// Save best score to localStorage
function saveBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("snakeBestScore", bestScore);
    bestScoreText.textContent = bestScore;
    // Add animation class for new best score
    bestScoreText.parentElement.style.animation = "scoreUpdate 0.5s ease";
    setTimeout(() => {
      bestScoreText.parentElement.style.animation = "";
    }, 500);
  }
}

// Initialize game
window.addEventListener("keydown", changeDirection);
window.onload = () => {
  loadBestScore();
  clearBoard();
};

// Reset button event
resetBtn.addEventListener("click", () => {
  // Stop current game if running
  running = false;
  
  if (gameOverSound) {
    gameOverSound.pause();
    gameOverSound.currentTime = 0;
  }
  
  // Reset game state
  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;
  gameSpeed = baseSpeed; // Reset speed to starting speed
  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 },
  ];
  
  if (bigFoodTimer) {
    clearTimeout(bigFoodTimer);
    bigFoodTimer = null;
  }
  isBigFood = false;
  
  // Re-enable start button
  startGame.disabled = false;
  startGame.style.opacity = "1";
  startGame.style.cursor = "pointer";
  
  // Clear board and show ready state
  clearBoard();
  
  if (bg) {
    bg.volume = 0.2;
    bg.currentTime = 0;
    bg.play().catch(e => console.log("Audio play failed:", e));
  }
  
  // Start the game immediately
  gameStart();
});

// Start button event
startGame.addEventListener("click", () => {
  if (!running) {
    resetGame();
    startGame.disabled = true;
    startGame.style.opacity = "0.5";
    startGame.style.cursor = "not-allowed";
    
    if (bg) {
      bg.volume = 0.2;
      bg.currentTime = 0;
      bg.play().catch(e => console.log("Audio play failed:", e));
    }
  }
});

// Arrow button controls
document.getElementById("up").addEventListener("click", () => {
  if (yVelocity === 0) {
    xVelocity = 0;
    yVelocity = -unitSize;
  }
});

document.getElementById("down").addEventListener("click", () => {
  if (yVelocity === 0) {
    xVelocity = 0;
    yVelocity = unitSize;
  }
});

document.getElementById("left").addEventListener("click", () => {
  if (xVelocity === 0) {
    xVelocity = -unitSize;
    yVelocity = 0;
  }
});

document.getElementById("right").addEventListener("click", () => {
  if (xVelocity === 0) {
    xVelocity = unitSize;
    yVelocity = 0;
  }
});

function gameStart() {
  running = true;
  scoreText.textContent = score;
  createFood();
  drawFood();
  nextTick();
}

function nextTick() {
  if (running) {
    setTimeout(() => {
      clearBoard();
      drawFood();
      moveSnake();
      drawSnake();
      checkGameOver();
      nextTick();
    }, gameSpeed);
  } else {
    displayGameOver();
  }
}

function clearBoard() {
  // Background
  ctx.fillStyle = boardBackground;
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // Draw retro grid
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  for (let y = 0; y < gameBoard.height; y += unitSize) {
    for (let x = 0; x < gameBoard.width; x += unitSize) {
      ctx.strokeRect(x, y, unitSize, unitSize);
    }
  }
}

function createFood() {
  function randomFood(min, max) {
    const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize;
    return randNum;
  }

  if (bigFoodTimer) {
    clearTimeout(bigFoodTimer);
    bigFoodTimer = null;
  }

  const chance = Math.random();
  isBigFood = chance < 0.3;

  if (isBigFood) {
    foodX = randomFood(0, gameWidth - 2 * unitSize);
    foodY = randomFood(0, gameHeight - 2 * unitSize);

    bigFoodTimer = setTimeout(() => {
      isBigFood = false;
      createFood();
    }, 3000);
  } else {
    foodX = randomFood(0, gameWidth - unitSize);
    foodY = randomFood(0, gameHeight - unitSize);
  }
}

function drawFood() {
  if (isBigFood) {
    // Gold food
    ctx.fillStyle = goldFoodColor;
    ctx.fillRect(foodX, foodY, 2 * unitSize, 2 * unitSize);
    
    // Add star effect in center
    ctx.fillStyle = "#69433A";
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", foodX + unitSize, foodY + unitSize);
  } else {
    // Regular food
    ctx.fillStyle = foodColor;
    ctx.fillRect(foodX, foodY, unitSize, unitSize);
    
    // Add apple emoji
    ctx.fillStyle = "#fff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🍎", foodX + unitSize / 2, foodY + unitSize / 2);
  }
}

function moveSnake() {
  const head = { 
    x: snake[0].x + xVelocity, 
    y: snake[0].y + yVelocity 
  };

  snake.unshift(head);

  // Check if food is eaten
  if (
    snake[0].x >= foodX &&
    snake[0].x < foodX + (isBigFood ? 2 * unitSize : unitSize) &&
    snake[0].y >= foodY &&
    snake[0].y < foodY + (isBigFood ? 2 * unitSize : unitSize)
  ) {
    if (eatSound) {
      eatSound.currentTime = 0;
      eatSound.volume = 0.2;
      eatSound.play().catch(e => console.log("Audio play failed:", e));
    }

    if (isBigFood) {
      score += 2;
      clearTimeout(bigFoodTimer);
      bigFoodTimer = null;
    } else {
      score++;
    }

    scoreText.textContent = score;
    
    // Increase game speed every speedIncreaseInterval points
    if (score % speedIncreaseInterval === 0 && gameSpeed > minSpeed) {
      gameSpeed = Math.max(minSpeed, gameSpeed - 3); // Decrease delay by 3ms
    }
    
    // Animate score update
    scoreText.parentElement.style.animation = "scoreUpdate 0.3s ease";
    setTimeout(() => {
      scoreText.parentElement.style.animation = "";
    }, 300);
    
    createFood();
  } else {
    snake.pop();
  }
}

function drawSnake() {
  snake.forEach((snakePart, index) => {
    // Head gets special treatment
    if (index === 0) {
      ctx.fillStyle = snakeColor;
    } else {
      // Gradient effect for body
      const gradient = ctx.createLinearGradient(
        snakePart.x, 
        snakePart.y, 
        snakePart.x + unitSize, 
        snakePart.y + unitSize
      );
      gradient.addColorStop(0, snakeColor);
      gradient.addColorStop(1, "rgba(103, 148, 153, 0.6)");
      ctx.fillStyle = gradient;
    }
    
    ctx.fillRect(snakePart.x, snakePart.y, unitSize, unitSize);
    
    // Border
    ctx.strokeStyle = snakeBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);
    
    // Add eyes to head
    if (index === 0) {
      ctx.fillStyle = "#000";
      const eyeSize = 4;
      const eyeOffset = 8;
      
      // Determine eye position based on direction
      if (xVelocity > 0) { // Moving right
        ctx.fillRect(snakePart.x + unitSize - eyeOffset, snakePart.y + 6, eyeSize, eyeSize);
        ctx.fillRect(snakePart.x + unitSize - eyeOffset, snakePart.y + unitSize - 10, eyeSize, eyeSize);
      } else if (xVelocity < 0) { // Moving left
        ctx.fillRect(snakePart.x + eyeOffset - eyeSize, snakePart.y + 6, eyeSize, eyeSize);
        ctx.fillRect(snakePart.x + eyeOffset - eyeSize, snakePart.y + unitSize - 10, eyeSize, eyeSize);
      } else if (yVelocity > 0) { // Moving down
        ctx.fillRect(snakePart.x + 6, snakePart.y + unitSize - eyeOffset, eyeSize, eyeSize);
        ctx.fillRect(snakePart.x + unitSize - 10, snakePart.y + unitSize - eyeOffset, eyeSize, eyeSize);
      } else if (yVelocity < 0) { // Moving up
        ctx.fillRect(snakePart.x + 6, snakePart.y + eyeOffset - eyeSize, eyeSize, eyeSize);
        ctx.fillRect(snakePart.x + unitSize - 10, snakePart.y + eyeOffset - eyeSize, eyeSize, eyeSize);
      }
    }
  });
}

function changeDirection(event) {
  const keyPressed = event.keyCode;
  const LEFT = 37;
  const UP = 38;
  const RIGHT = 39;
  const DOWN = 40;

  const goingUp = yVelocity === -unitSize;
  const goingDown = yVelocity === unitSize;
  const goingRight = xVelocity === unitSize;
  const goingLeft = xVelocity === -unitSize;

  switch (true) {
    case keyPressed === LEFT && !goingRight:
      xVelocity = -unitSize;
      yVelocity = 0;
      break;
    case keyPressed === RIGHT && !goingLeft:
      xVelocity = unitSize;
      yVelocity = 0;
      break;
    case keyPressed === DOWN && !goingUp:
      xVelocity = 0;
      yVelocity = unitSize;
      break;
    case keyPressed === UP && !goingDown:
      xVelocity = 0;
      yVelocity = -unitSize;
      break;
  }
}

function checkGameOver() {
  // Wrap snake position if it crosses boundaries
  if (snake[0].x < 0) {
    snake[0].x = gameWidth - unitSize;
  } else if (snake[0].x >= gameWidth) {
    snake[0].x = 0;
  } else if (snake[0].y < 0) {
    snake[0].y = gameHeight - unitSize;
  } else if (snake[0].y >= gameHeight) {
    snake[0].y = 0;
  }

  // Check self collision
  for (let i = 1; i < snake.length; i++) {
    if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
      running = false;
    }
  }
}

function displayGameOver() {
  // Save best score
  saveBestScore();
  
  if (gameOverSound) {
    gameOverSound.volume = 0.2;
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(e => console.log("Audio play failed:", e));
  }
  
  if (bg) {
    bg.volume = 0;
  }

  // Draw game over screen
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(0, 0, gameWidth, gameHeight);

  // Game Over text
  ctx.font = "32px 'Press Start 2P'";
  ctx.fillStyle = "#C33740";
  ctx.textAlign = "center";
  ctx.fillText("GAME OVER", gameWidth / 2, gameHeight / 2 - 120);

  // Score display
  ctx.font = "20px 'Press Start 2P'";
  ctx.fillStyle = "#679499";
  ctx.fillText("SCORE: " + score, gameWidth / 2, gameHeight / 2 - 60);

  // Best score display
  if (score === bestScore && score > 0) {
    ctx.fillStyle = "#E3D5B8";
    ctx.font = "16px 'Press Start 2P'";
    ctx.fillText("NEW BEST!", gameWidth / 2, gameHeight / 2 - 30);
  }

  // Draw the image if available
  const img = document.getElementById("gameOverImg");
  if (img) {
    // Draw border
    ctx.fillStyle = "#D7A278";
    ctx.fillRect(gameWidth / 2 - 104, gameHeight / 2 + 10, 208, 208);

    const drawImage = () => {
      ctx.drawImage(img, gameWidth / 2 - 100, gameHeight / 2 + 14, 200, 200);
    };

    if (img.complete) {
      drawImage();
    } else {
      img.onload = drawImage;
    }
  }

  // Restart instruction
  ctx.font = "12px 'Press Start 2P'";
  ctx.fillStyle = "#E3D5B8";
  ctx.fillText("PRESS RESET", gameWidth / 2, gameHeight - 30);

  running = false;
  
  // Re-enable start button
  startGame.disabled = false;
  startGame.style.opacity = "1";
  startGame.style.cursor = "pointer";
}

function resetGame() {
  score = 0;
  xVelocity = unitSize;
  yVelocity = 0;
  gameSpeed = baseSpeed; // Reset speed to starting speed
  snake = [
    { x: unitSize * 4, y: 0 },
    { x: unitSize * 3, y: 0 },
    { x: unitSize * 2, y: 0 },
    { x: unitSize, y: 0 },
    { x: 0, y: 0 },
  ];

  if (bigFoodTimer) {
    clearTimeout(bigFoodTimer);
    bigFoodTimer = null;
  }
  isBigFood = false;

  gameStart();
}
