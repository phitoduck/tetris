import { Block, BLOCK_WIDTH, FALL_DISTANCE } from './block.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './index.js'; 

export const NUM_SHAPES = 7; // Number if implemented shapes

function Location(x, y) {
    this.x = x;
    this.y = y;
}

function State(name, width) {
    this.name = name;  // title of state, i.e. 'VERTICAL'
    this.offsets = []; // list of locations as offsets 
    this.width = width;
}

// shape (should be abstract)
class Shape {

    constructor(x, y) {
        // shape made up of blocks
        this.blocks = [];
        this.offsets = [];
        this.height = null;
        this.width = null;

        // location of bottom-left corner of shape
        this.x = x;
        this.y = y;
        this.landed = false;

        // prevents movement if obstructed
        this.canMoveLeft = true;
        this.canMoveRight = true;

        // handle rotation of shape
        this.states = [];     // list of all states
        this.stateIndex = 0; // index of current state
    }

    setFallDistance(fallDistance) {
        this.blocks.forEach(
            block => block.setFallDistance(fallDistance) 
            );
    }

    getState() {
        return this.states[this.stateIndex];
    }

    // rotates shape to the right
    rotateRight() {
        // update game state
        this.stateIndex = (this.stateIndex + 1) % this.states.length;
        let state = this.getState();

        // don't rotate if out of screen
        if (this.y <= 2 * BLOCK_WIDTH) {
            return;
        }

        // keep on screen
        if (this.x + state.width >= CANVAS_WIDTH) {
            this.moveTo(CANVAS_WIDTH - state.width, this.y);
        } else {
            this.moveTo(this.x, this.y);
        }
    }

    // rotates shape to the left
    rotateLeft() {
        this.stateIndex = (this.stateIndex - 1) % this.states.length;
        if (this.stateIndex < 0) {
            this.stateIndex = this.states.length - 1;
        }

        // don't rotate if out of screen
        if (this.y <= 2 * BLOCK_WIDTH) {
            return;
        }

        // keep on screen
        if (this.x <= 0) {
            this.moveTo(0, this.y);
        } else {
            this.moveTo(this.x, this.y);
        }

        this.moveTo(this.x, this.y);
    }

    // moves shape to the right by 1 BLOCK_WIDTH
    rightMove() {
        // keep within right edge
        if (this.x + this.getState().width >= CANVAS_WIDTH) {
            this.moveTo(CANVAS_WIDTH - this.getState().width, this.y);
        } 
        // move shape right
        else if (this.canMoveRight) { 
            this.moveTo(this.x + BLOCK_WIDTH, this.y);
        }
    }

    // moves shape to the right by 1 BLOCK_WIDTH
    leftMove() {
        // keep within left edge
        if (this.x <= 0) {
            this.moveTo(0, this.y);
        } 

        // move shape left
        else if (this.canMoveLeft) { 
            this.moveTo(this.x - BLOCK_WIDTH, this.y);
        }
    }

    // move shape to a certain location
    moveTo(x, y) {
        this.x = x;
        this.y = y;

        // move each block according to state
        let state = this.getState();

        state.offsets.forEach((offset, index) => {
            this.blocks[index].x = this.x + offset.x;
            this.blocks[index].y = this.y + offset.y;
        });
    }

    // update all blocks
    tick() {
        if (!this.landed) {
            // update shape y
            this.y += FALL_DISTANCE;

            // update each block in shape
            this.blocks.forEach(block => block.tick());
        }
    }

    // draw shape on canvas
    render(context) {
        this.blocks.forEach(block => {
            block.render(context);
        });
    }

    // change to landed state
    land() {
        this.landed = true;

        this.blocks.forEach(block => {
            block.setLanded(true);
        });
    };

}

/////////////////////////
//        Shapes       //
/////////////////////////

export class Square extends Shape {
    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // square state
        let square = new State("SQUARE", 2 * BLOCK_WIDTH);
        square.offsets.push(new Location(0, -BLOCK_WIDTH)); // down-left
        square.offsets.push(new Location(0, -2*BLOCK_WIDTH)); // up-left
        square.offsets.push(new Location(BLOCK_WIDTH, -BLOCK_WIDTH)); // down-right
        square.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); // up-right
        this.states.push(square);

        // make square out of blocks
        square.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // make a square
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    // returns blocks relevant for left movement
    getLeftBlocks() {
        // always return left blocks
        return [
            this.blocks[0],
            this.blocks[1]
        ];
    }

    // returns relevant blocks for right movement
    getRightBlocks() {
        // always return right blocks
        return [
            this.blocks[2],
            this.blocks[3]
        ];
    }
}

export class Bar extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // horizontal state
        let horizontal = new State("HORIZONTAL", 4 * BLOCK_WIDTH);
        horizontal.offsets.push(new Location(0, -BLOCK_WIDTH)); // left
        horizontal.offsets.push(new Location(1*BLOCK_WIDTH, -BLOCK_WIDTH)); // 2nd
        horizontal.offsets.push(new Location(2*BLOCK_WIDTH, -BLOCK_WIDTH)); // 3rd
        horizontal.offsets.push(new Location(3*BLOCK_WIDTH, -BLOCK_WIDTH)); // right
        this.states.push(horizontal);

        // vertical state
        let vertical = new State("VERTICAL", BLOCK_WIDTH);
        vertical.offsets.push(new Location(0, -BLOCK_WIDTH)); // left
        vertical.offsets.push(new Location(0, -2*BLOCK_WIDTH)); // 2nd
        vertical.offsets.push(new Location(0, -3*BLOCK_WIDTH)); // 3rd
        vertical.offsets.push(new Location(0, -4*BLOCK_WIDTH)); // right
        this.states.push(vertical);

        // make bar out of blocks
        horizontal.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return this.blocks;
        } 
        // return left block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[0]
            ];
        }
    }

    getRightBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return this.blocks;
        } 
        // return right block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[3]
            ];
        }
    }

}

export class S extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // horizontal state
        let horizontal = new State("HORIZONTAL", 3 * BLOCK_WIDTH);
        horizontal.offsets.push(new Location(0, -BLOCK_WIDTH));
        horizontal.offsets.push(new Location(1*BLOCK_WIDTH, -BLOCK_WIDTH)); 
        horizontal.offsets.push(new Location(1*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        horizontal.offsets.push(new Location(2*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        this.states.push(horizontal);

        // vertical state
        let vertical = new State("VERTICAL", 2 * BLOCK_WIDTH);
        vertical.offsets.push(new Location(BLOCK_WIDTH, -BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(0, -3*BLOCK_WIDTH)); 
        this.states.push(vertical);

        // make shape out of blocks
        horizontal.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return [
                this.blocks[2],
                this.blocks[3]
            ];
        } 
        // return left block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[0]
            ];
        }
    }

    getRightBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return [
                this.blocks[0],
                this.blocks[1]
            ];
        } 
        // return right block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[1],
                this.blocks[3]
            ];
        }
    }

}

export class Z extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // horizontal state
        let horizontal = new State("HORIZONTAL", 3 * BLOCK_WIDTH);
        horizontal.offsets.push(new Location(0, -2*BLOCK_WIDTH));
        horizontal.offsets.push(new Location(1*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        horizontal.offsets.push(new Location(1*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        horizontal.offsets.push(new Location(2*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(horizontal);

        // vertical state
        let vertical = new State("VERTICAL", 2 * BLOCK_WIDTH);
        vertical.offsets.push(new Location(0, -BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        vertical.offsets.push(new Location(BLOCK_WIDTH, -3*BLOCK_WIDTH)); 
        this.states.push(vertical);

        // make shape out of blocks
        horizontal.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return [
                this.blocks[2],
                this.blocks[3]
            ];
        } 
        // return left block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[0]
            ];
        }
    }

    getRightBlocks() {
        let state = this.getState();

        // return all blocks when vertical
        if (state.name === "VERTICAL") {
            return [
                this.blocks[0],
                this.blocks[1]
            ];
        } 
        // return right block when horizontal
        else if (state.name === "HORIZONTAL") {
            return [
                this.blocks[3]
            ];
        }
    }

}

export class L extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // bottom right state
        let bottomRight = new State("BOTTOM-RIGHT", 3 * BLOCK_WIDTH);
        bottomRight.offsets.push(new Location(0, -1*BLOCK_WIDTH));
        bottomRight.offsets.push(new Location(1*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(2*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(2*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        this.states.push(bottomRight);

        // bottom down state
        let bottomDown = new State("BOTTOM-DOWN", 2 * BLOCK_WIDTH);
        bottomDown.offsets.push(new Location(0, -3*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(0, -1*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomDown);

        // bottom left state
        let bottomLeft = new State("BOTTOM-LEFT", 3 * BLOCK_WIDTH);
        bottomLeft.offsets.push(new Location(0, -1*BLOCK_WIDTH));
        bottomLeft.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(1*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(2*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        this.states.push(bottomLeft);

        // bottom up state
        let bottomUp = new State("BOTTOM-UP", 2 * BLOCK_WIDTH);
        bottomUp.offsets.push(new Location(0, -3*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -3*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomUp);

        // make shape out of blocks
        bottomRight.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[0]
            ];
        } 
        else if (state.name === "BOTTOM-DOWN") {
            return [
                this.blocks[0],
                this.blocks[1],
                this.blocks[2]
            ];
        }
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[0],
                this.blocks[1]
            ];
        }
        else if (state.name === "BOTTOM-UP") {
            return [
                this.blocks[0]
            ];
        }

    }

    getRightBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[2],
                this.blocks[3]
            ];
        } 
        else if (state.name === "BOTTOM-DOWN") {
            return [
                this.blocks[3]
            ];
        }
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[3]
            ];
        }
        else if (state.name === "BOTTOM-UP") {
            return [
                this.blocks[1],
                this.blocks[2],
                this.blocks[3]
            ];
        }
    }

}

export class J extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // bottom left state
        let bottomLeft = new State("BOTTOM-LEFT", 3 * BLOCK_WIDTH);
        bottomLeft.offsets.push(new Location(0, -1*BLOCK_WIDTH));
        bottomLeft.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(1*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(2*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomLeft);

        // bottom down state
        let bottomDown = new State("BOTTOM-DOWN", 2 * BLOCK_WIDTH);
        bottomDown.offsets.push(new Location(0, -3*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(0, -2*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(0, -1*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomDown);

        // bottom right state
        let bottomRight = new State("BOTTOM-RIGHT", 3 * BLOCK_WIDTH);
        bottomRight.offsets.push(new Location(0, -2*BLOCK_WIDTH));
        bottomRight.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(2*BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(2*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomRight);

        // bottom up state
        let bottomUp = new State("BOTTOM-UP", 2 * BLOCK_WIDTH);
        bottomUp.offsets.push(new Location(0, -3*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -3*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomUp);

        // make shape out of blocks
        bottomRight.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[0]
            ];
        } 
        else if (state.name === "BOTTOM-DOWN") {
            return [
                this.blocks[0],
                this.blocks[1],
                this.blocks[2]
            ];
        }
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[0],
                this.blocks[1]
            ];
        }
        else if (state.name === "BOTTOM-UP") {
            return [
                this.blocks[0]
            ];
        }

    }

    getRightBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[2],
                this.blocks[3]
            ];
        } 
        else if (state.name === "BOTTOM-DOWN") {
            return [
                this.blocks[3]
            ];
        }
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[3]
            ];
        }
        else if (state.name === "BOTTOM-UP") {
            return [
                this.blocks[1],
                this.blocks[2],
                this.blocks[3]
            ];
        }
    }

}

export class T extends Shape {

    constructor(x, y) {
        super(x, y);

        // dimensions
        this.height = BLOCK_WIDTH * 2;
        this.width = this.height;

        // bottom down state
        let bottomDown = new State("BOTTOM-DOWN", 3 * BLOCK_WIDTH);
        bottomDown.offsets.push(new Location(0,             -1*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(BLOCK_WIDTH,   -1*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(BLOCK_WIDTH,   -2*BLOCK_WIDTH)); 
        bottomDown.offsets.push(new Location(2*BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomDown);

        // bottom left state
        let bottomLeft = new State("BOTTOM-LEFT", 2 * BLOCK_WIDTH);
        bottomLeft.offsets.push(new Location(0,           -1*BLOCK_WIDTH));
        bottomLeft.offsets.push(new Location(0,           -2*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomLeft.offsets.push(new Location(0,           -3*BLOCK_WIDTH)); 
        this.states.push(bottomLeft);

        // bottom up state
        let bottomUp = new State("BOTTOM-UP", 3 * BLOCK_WIDTH);
        bottomUp.offsets.push(new Location(0,              -2*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH,    -2*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(BLOCK_WIDTH,    -1*BLOCK_WIDTH)); 
        bottomUp.offsets.push(new Location(2*BLOCK_WIDTH,  -2*BLOCK_WIDTH)); 
        this.states.push(bottomUp);

        // bottom right state
        let bottomRight = new State("BOTTOM-RIGHT", 2 * BLOCK_WIDTH);
        bottomRight.offsets.push(new Location(0,           -2*BLOCK_WIDTH));
        bottomRight.offsets.push(new Location(BLOCK_WIDTH, -3*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(BLOCK_WIDTH, -2*BLOCK_WIDTH)); 
        bottomRight.offsets.push(new Location(BLOCK_WIDTH, -1*BLOCK_WIDTH)); 
        this.states.push(bottomRight);

        // make shape out of blocks
        bottomRight.offsets.forEach(
            (offset, index) => {
                this.blocks.push(new Block(this.x + offset.x, this.y + offset.y));
            }
        );

        // position blocks
        this.offsets.forEach(offset => 
            this.blocks.push(new Block(
                this.x + offset.x,
                this.y + offset.y
                )
            )
        );
    }

    getLeftBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-DOWN" || state.name === "BOTTOM-UP") {
            return [
                this.blocks[0]
            ];
        } 
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[0],
                this.blocks[1],
                this.blocks[3]
            ];
        }
        else if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[0]
            ];
        }

    }

    getRightBlocks() {
        let state = this.getState();

        if (state.name === "BOTTOM-DOWN" || state.name === "BOTTOM-UP") {
            return [
                this.blocks[3]
            ];
        } 
        else if (state.name === "BOTTOM-LEFT") {
            return [
                this.blocks[2]
            ];
        }
        else if (state.name === "BOTTOM-RIGHT") {
            return [
                this.blocks[1],
                this.blocks[2],
                this.blocks[3]
            ];
        }
    }

}