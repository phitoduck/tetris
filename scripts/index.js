import { Controller } from './controller.js';
import { Grid } from './grid.js';
import { Block, BLOCK_WIDTH } from './block.js';

// get canvas context to draw on
let canvas = document.getElementById('tetris');
let context = canvas.getContext("2d");
canvas.focus();

// game constants
export const CANVAS_HEIGHT = canvas.height;
export const CANVAS_WIDTH = canvas.width;
export const NORMAL_FALL_DISTANCE = 2;
const FAST_FALL_DISTANCE = 5;
const LEFT_KEY = 37;
const RIGHT_KEY = 39;
const DOWN_KEY = 40;
const UP_KEY = 38;
const SPACE_BAR = 32;
const GAME_REFRESH_RATE = 20; // in milliseconds
const NORMAL_GAME_SPEED = 20; // in milliseconds
const FAST_GAME_SPEED = 0;
const MOVE_SPEED = 60;
let gameSpeed = NORMAL_GAME_SPEED;

// ids of game intervals
let stateID = 0;
let renderID = 0;

// handles game state
let controller = new Controller(CANVAS_HEIGHT, CANVAS_WIDTH);

// grid representation for landed shapes
let grid = controller.getGrid();

// shape currently in motion
let activeShape = controller.getActiveShape();

// add listeners to buttons
document.addEventListener("keydown", onKeyPressed, false);
document.addEventListener("keyup", onKeyReleased, false);
let keyPressed = false;
let movingRight = false;
let movingLeft = false;

// press a key
function onKeyPressed(event) {
  if (event.keyCode === LEFT_KEY) {
    if (grid.canMoveLeft(activeShape)) {
        // activeShape.leftMove();
        movingLeft = true;
        movingRight = false;
    }
  } else if (event.keyCode === RIGHT_KEY) {
    if (grid.canMoveRight(activeShape)) {
    //   activeShape.rightMove();
      movingRight = true;
      movingLeft = false;
    }
  }

  if (!keyPressed) {
    if (event.keyCode === UP_KEY) {
      activeShape.rotateRight();
    } else if (event.keyCode === DOWN_KEY) {
      changeSpeed(FAST_GAME_SPEED);
        // activeShape.setFallDistance(FAST_FALL_DISTANCE);
    } else if (event.keyCode === SPACE_BAR) {
      while (!activeShape.landed) {
        controller.tick();
      }
    }
  }
  keyPressed = true;
}

// release a key
function onKeyReleased(event) {
  if (event.keyCode === DOWN_KEY) {
    changeSpeed(NORMAL_GAME_SPEED);
    // activeShape.setFallDistance(NORMAL_FALL_DISTANCE);
  } else if (event.keyCode === LEFT_KEY) {
    movingLeft = false;
  } else if (event.keyCode === RIGHT_KEY) {
    movingRight = false;
  }
  
  keyPressed = false;
}

// render as much as possible
let lastGameTime = performance.now();
let lastMoveTime = performance.now();

// game loop function : uses requestAnimationFrame() to 
// call itself as many times as the browser will allow.
// Updates and renders all game objects.
function draw() {
  let currentGameTime = performance.now();
  let currentMoveTime = performance.now();

  // clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height);

  // move shape
  if ((currentMoveTime - lastMoveTime) > MOVE_SPEED) {
    lastMoveTime = currentMoveTime;
    if (movingLeft && controller.grid.canMoveLeft(activeShape)) {
        activeShape.leftMove();
    } else if (movingRight && controller.grid.canMoveRight(activeShape)) {
        activeShape.rightMove();
    }
  }

  // update game state
  if ((currentGameTime - lastGameTime) > gameSpeed) {
    // console.log("current: ", currentTime, " last ", lastTime, " difference ", currentTime - lastTime);
    lastGameTime = currentGameTime;
    controller.tick();
    activeShape = controller.getActiveShape();
  }

  // render updated objects
  controller.render(context);
  controller.grid.render(context);

  // did we win?
  if (grid.gameIsFinished()) {
      alert(`You lost! \n Score: ${controller.getScore()}`);
      document.location.reload();
      return;
  }

  requestAnimationFrame(draw);
}

function changeSpeed(speed) {
    gameSpeed = speed;
}

///////////////////////////
//      Game Code        //
///////////////////////////

draw();