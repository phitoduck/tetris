/*
    Block - fundamental unit of any shape

    - Red while falling
    - Blue when landed
*/

import { NORMAL_FALL_DISTANCE } from './index.js';

export const BLOCK_WIDTH = 16;
export const FALL_DISTANCE = 2;
const RED = "#FF0000";
const BLUE = "#0000FF";
const BLACK = "#000000";

// block class
export class Block {

    constructor(x, y) {
        // game location
        this.x = x;
        this.y = y;

        // should not move if landed
        this.landed = false;
        this.color = RED;

        // handles falling speed
        this.fallDistance = NORMAL_FALL_DISTANCE;
    }

    setFallDistance(fallDistance) {
        this.fallDistance = fallDistance;
    }

    // update block state
    tick() {
        // if not on the ground, move down
        if (!this.landed) {
            this.y += this.fallDistance;
        }
    }

    // render block with correct color
    render(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, BLOCK_WIDTH, BLOCK_WIDTH);
        context.fillStyle = BLACK; // black outline
        context.strokeRect(this.x, this.y, BLOCK_WIDTH, BLOCK_WIDTH);
    }

    setLanded(landed) {
        this.landed = landed;
        this.color = BLUE;
    } 

};