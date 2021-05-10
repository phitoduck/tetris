/*
    Controller

    Handles movement and collision of game objects.
    Causes filled rows to disappear: implemented with grid pattern.
*/

import { NUM_SHAPES, Square, Bar, S, Z, L, J, T } from './shape.js';
import { BLOCK_WIDTH, Block } from './block.js';
import { Grid } from './grid.js';

// #id of each shape type
const SQUARE_ID = 0;
const BAR_ID = 1;
const S_ID = 2;
const Z_ID = 3;
const L_ID = 4;
const J_ID = 5;
const T_ID = 6;

// start position of queued shape
const QUEUED_SHAPE_X = 10;
const QUEUED_SHAPE_Y = -30;

const SCORE_X = 8;
const SCORE_Y = 20;
const SCORE_INCREASE = 10;

const TEAL = "#0095DD";

export class Controller {

    // start with active shape and a shape in the queue
    constructor(canvasHeight, canvasWidth) {
        // use canvas data
        this.CANVAS_HEIGHT = canvasHeight;
        this.CANVAS_WIDTH = canvasWidth;
        this.ACTIVE_START_X = (this.CANVAS_WIDTH / 2) - BLOCK_WIDTH;
        this.ACTIVE_START_Y = BLOCK_WIDTH;

        // set an active shape
        this.activeShape = this.getShape();
        this.activeShape.moveTo(
            this.ACTIVE_START_X,
            this.ACTIVE_START_Y
        );

        // prepare first queued shape
        this.queuedShape = this.getShape();
        this.queuedShape.moveTo(
            QUEUED_SHAPE_X,
            QUEUED_SHAPE_Y
        );

        // get cell grid
        this.grid = new Grid(
            this.CANVAS_WIDTH,
            this.CANVAS_HEIGHT,
            BLOCK_WIDTH,
            BLOCK_WIDTH
        );

        // keep score
        this.score = 0;
    }

    // update all shapesInPlay
    tick() {
        // tick each shape
        this.activeShape.tick();

        // correct queued shape position
        this.queuedShape.moveTo(QUEUED_SHAPE_X, QUEUED_SHAPE_Y);

        // check for collision
        let collision = this.grid.getShapeCollision(this.activeShape);
        
        // on collision land shape
        if (collision) {
            this.landShape(this.activeShape);
        }

        // land if at bottom
        if (this.activeShape.y >= this.CANVAS_HEIGHT) {
            this.landShape(this.activeShape);
        }

        // remove full rows
        for (let row_index = 0; row_index < this.grid.numRows; row_index++) {
            if (this.grid.rowIsFull(row_index)) {
                this.grid.removeRow(row_index);
                this.grid.shiftRowsDown(row_index);

                // update score
                this.score += SCORE_INCREASE;
            }
        }

        // check if active landed
        if (this.activeShape.landed) {
            this.nextShape();
        }

    }

    // render score and active shape
    render(context) {
        // render score
        context.font = "16px Arial";
        context.fillStyle = TEAL;
        context.fillText("Score: " + this.score, SCORE_X, SCORE_Y);

        // render shapes
        this.activeShape.render(context);
        this.queuedShape.render(context);
    }

    // put the queued shape in play
    nextShape() {
        this.activeShape = this.queuedShape;
        this.activeShape.moveTo(
            this.ACTIVE_START_X,
            this.ACTIVE_START_Y
        );
        this.queuedShape = this.getShape();
        this.queuedShape.moveTo(
            this.QUEUED_SHAPE_X,
            this.QUEUED_SHAPE_Y
        );
    }

    // get a random shape in the queue at (-1, -1)
    getShape() {
        let randomID = Math.floor(Math.random() * NUM_SHAPES);
        let shape = null;

        if (randomID == SQUARE_ID) {
            shape = new Square(-1, -1);
        } else if (randomID === BAR_ID) {
            shape = new Bar(-1, -1);
        } else if (randomID === S_ID) {
            shape = new S(-1, -1);
        } else if (randomID === Z_ID)  {
            shape = new Z(-1, -1);
        } else if (randomID === L_ID) {
            shape = new L(-1, -1);
        } else if (randomID === J_ID) {
            shape = new J(-1, -1);
        } else if (randomID === T_ID) {
            shape = new T(-1, -1);
        }

        return shape;
    }

    // change shape state to landed
    landShape(shape) {
        // place on bottom if nothing underneath
        if (!this.grid.getShapeCollision(this.activeShape, "down")) {
            this.activeShape.moveTo(this.activeShape.x, this.CANVAS_HEIGHT);
        }

        shape.land();                       // set state to "landed"
        this.grid.insertShape(shape);       // add blocks to grid
    }

    // return currently active shape
    getActiveShape() {
        return this.activeShape;
    }

    // return block grid
    getGrid() {
        return this.grid;
    }

    getScore() {
        return this.score;
    }

}