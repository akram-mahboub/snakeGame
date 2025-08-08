const gameBoard = document.querySelector("#gameBoard") ;
const ctx = gameBoard.getContext("2d");
const scoreText = document.querySelector("#scoreText") ;
const resetBtn = document.querySelector("#resetBtn");
const startGame = document.querySelector("#startGame");
const gameWidth = gameBoard.width ;
const gameHeight = gameBoard.height ;

const eatSound = new Audio("sounds/eat.mp3");
const gameOverSound = new Audio("sounds/FinalCredits.mp3");
const bg = new Audio("sounds/bg.mp3");


const boardBackground = "white";
const snakeColor = "lightgreen";
const snakeBorder = "black";
const foodColor = "red";
const unitSize = 25;
let running = "false";
let xVelocity = unitSize;
let yVelocity = 0 ;
let foodX ;
let foodY ;
let score = 0 ;
let snake = [ 
  {x:unitSize * 4 , y:0},
  {x:unitSize * 3 , y:0},
  {x:unitSize * 2 , y:0},
  {x:unitSize , y:0},
  {x:0 , y:0},

]
let isBigFood = false ;
let bigFoodTimer = null ;


window.addEventListener("keydown", changeDirection);
window.onload = () => {
  clearBoard(); // draw the grid and background
};

resetBtn.addEventListener("click", () => {
  resetGame();
  gameOverSound.volume = 0;
  bg.volume = 0.2;
  bg.currentTime = 0;
  bg.play();
})

startGame.addEventListener("click", () => {
  resetGame();
  startGame.disabled = true;         // Disable the button forever
  startGame.style.pointerEvents = "none"; // Optional: ignore any further interaction
  startGame.style.opacity = "0.5";
  startGame.textContent = "G S";
  bg.volume = 0.2;
  bg.currentTime = 0;
  bg.play();

});

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


function gameStart(){
  
  running = true;
  scoreText.textContent = score ;
  createFood();
  drawFood();
  nextTick();
};

function nextTick(){
  if(running){
    setTimeout(()=>{
      clearBoard();
      drawFood();
      moveSnake();
      drawsnake();
      checkGameOver();
      nextTick();
    },50);
  }
  else {
    displayGameOver();
  }
};

function clearBoard(){
  ctx.fillStyle = boardBackground;
  ctx.fillRect(0, 0, gameWidth , gameHeight);

  // Loop over the canvas and draw grid squares
for (let y = 0; y < gameBoard.height; y += unitSize) {
  for (let x = 0; x < gameBoard.width; x += unitSize) {
    ctx.strokeStyle = "lightgray"; // grid line color
    ctx.strokeRect(x, y, unitSize, unitSize); // draw one square
  }
}
};

function createFood(){

  function randomFood(min , max){
    const randNum = Math.round((Math.random() * (max - min) + min) / unitSize) * unitSize ;
    return randNum ;
  }
  
  if(bigFoodTimer){
    clearTimeout(bigFoodTimer);
    bigFoodTimer = null ;
  }

  const chance = Math.random();
  isBigFood = chance < 0.3; 

  if(isBigFood){
    foodX = randomFood(0 , gameWidth - 2 * unitSize);
    foodY = randomFood(0 , gameWidth - 2 * unitSize);

    bigFoodTimer = setTimeout (()=>{ // Set a timer to remove big food after 3 seconds
      isBigFood = false ;
      createFood();
    },3000);
  }
  else{
    foodX = randomFood(0 , gameWidth - unitSize);
    foodY = randomFood(0 , gameWidth - unitSize);
  }
}

function drawFood(){
  if(isBigFood){
    ctx.fillStyle = "gold";
    ctx.fillRect(foodX, foodY, 2 * unitSize ,2 * unitSize)
  }
  else {
  ctx.fillStyle = foodColor;
  ctx.fillRect(foodX, foodY, unitSize , unitSize)
  }
  

};

function moveSnake(){
  const head = {x: snake[0].x + xVelocity,
                y: snake[0].y + yVelocity};

  snake.unshift(head);
  // if food is eaten 

  if ( // If the snake's head is anywhere on the big food, it counts as a hit.
    snake[0].x >= foodX &&
    snake[0].x < foodX + (isBigFood ? 2 * unitSize : unitSize) &&
    snake[0].y >= foodY &&
    snake[0].y < foodY + (isBigFood ? 2 * unitSize : unitSize)
  )
  {
      eatSound.currentTime = 0; // reset sound to start
      eatSound.play();
      eatSound.volume = 0.2

    if(isBigFood){
      score+= 2 ;
      clearTimeout(bigFoodTimer);
      bigFoodTimer = null ;
    }
    else{
      score++;
    }

    scoreText.textContent = score ;
    createFood();
  }
  else{
    snake.pop();//everymove it add a haid and remove a tail if i don't eat !
  }
};

function drawsnake(){
  ctx.fillStyle = snakeColor ;
  ctx.strokeStyle = snakeBorder ;
  snake.forEach(snakePart => {
    ctx.fillRect(snakePart.x , snakePart.y , unitSize , unitSize);
    ctx.strokeRect(snakePart.x, snakePart.y, unitSize, unitSize);  
  })
  
};

function changeDirection(event){
  const keyPressed = event.keyCode ;
  console.log(keyPressed);  
  const LEFT = 37
  const UP = 38 ;
  const RIGHT = 39 ;
  const DOWN = 40 ;

  const goingUp = (yVelocity == -unitSize);
  const goingDown = (yVelocity == unitSize);
  const goingRight = (xVelocity == unitSize);
  const goingleft = (xVelocity == -unitSize);

  switch(true){
    case(keyPressed == LEFT && !goingRight):
      xVelocity = -unitSize;
      yVelocity = 0 ;
      break;
    case(keyPressed == RIGHT && !goingleft): 
      xVelocity = unitSize;
      yVelocity = 0 ;
      break;
    case(keyPressed == DOWN && !goingUp):
      xVelocity = 0 ;
      yVelocity = unitSize ;
      break;
    case(keyPressed == UP && !goingDown):
      xVelocity = 0 ;
      yVelocity = -unitSize ;
      break;
  }

 };

function checkGameOver(){
  switch(true){
    case(snake[0].x < 0):
      running = false ;
      break;
    case(snake[0].x >= gameWidth):
      running = false ;
      break;
    case(snake[0].y < 0):
      running = false ;
      break;
    case(snake[0].y >= gameHeight):
      running = false ;
      break;
  }
  
  for (i = 1 ; i < snake.length ; i+=1){
    if(snake[i].x == snake[0].x && snake[i].y == snake[0].y){
      running = false ;
    }
  }
   
};

function displayGameOver(){
  gameOverSound.volume = 0.2;
  gameOverSound.currentTime = 0;
  gameOverSound.play();
  bg.volume = 0;


  ctx.font = "21px MV Boli";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.fillText("iwaa adwi allah yarda elik ya abni ,", gameWidth / 2 , gameHeight / 2 - 60 );
/*   ctx.fillText("zzzz", gameWidth / 2 - 10, gameHeight / 2 - 30 );
 */
  // Draw the image
  const img = document.getElementById("gameOverImg");
  ctx.fillRect(gameWidth / 2 - 104, gameHeight / 2 - 4, 208, 208); // border box slightly bigger than image

  img.onload = () => {
    ctx.drawImage(img, gameWidth / 2 - 100, gameHeight / 2 , 200, 200); // Adjust size and position as needed
  };
  // If already loaded (cached), draw immediately
  if (img.complete) {
    ctx.drawImage(img, gameWidth / 2 - 100, gameHeight / 2 , 200, 200);
  }

  running = false;
}

function resetGame(){
  score = 0 ;
  xVelocity = unitSize;
  yVelocity = 0 ;
  snake = [ 
  {x:unitSize * 4 , y:0},
  {x:unitSize * 3 , y:0},
  {x:unitSize * 2 , y:0},
  {x:unitSize , y:0},
  {x:0 , y:0},
];

gameStart();
};



