import { BLOCK_WIDTH } from "./block.js";
import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./index.js";

class GridCell {
    constructor(x, y) {
        // cell location
        this.x = x;
        this.y = y;

        // cell properties
        this.filled = false;
        this.block = null;
    }

    toString() {
        return "I'm a grid cell!";
    }
}

export class Grid {
    constructor(width, height, cellWidth, cellHeight) {
        // grid dimensions
        this.width = width;
        this.height = height;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;

        this.numCols = Math.floor(width / cellWidth);
        this.numRows = Math.floor(height / cellHeight);

        // initialize rows matrix: row_i = [[i,j], [i, j+1], ...]
        this.rows = new Array(this.numRows);
        for (let i = 0; i < this.numRows; i++) {
            this.rows[i] = new Array(this.numCols);
            for (let j = 0; j < this.numCols; j++) {
                this.rows[i][j] = new GridCell(j * cellWidth, i * cellHeight);
            }
        }

    }

    // returns indices of a cell
    getCellIndices(block) {
        let row, col;

        if (typeof(block) !== 'object') {
            throw new Error("Not a block");
        } else {
            row = Math.floor(block.y / this.cellHeight);
            col = Math.floor(block.x / this.cellWidth);
        }

        return [row, col];
    }

    // returns reference to cell object that block is in
    getCell(block) {
        // get row and column of block
        let [row, col] = this.getCellIndices(block);

        return this.rows[row][col];
    }

    // inserts each block of a shape into the grid
    insertShape(shape) {
        shape.blocks.forEach(block => this.insertBlock(block));
    }

    // assign a block object to a grid cell
    insertBlock(block) {
        // get row and column of block
        let [row, col] = this.getCellIndices(block);

        try {
            // check that bounds are in the grid
            if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
                throw new Error(`Out of bounds: row=${row}, col=${col}`);
            }
            // check that cell is not full
            if (this.rows[row][col].filled) {
                throw new Error(`Cell[${row}][${col}] is already full!`);
            } 
            // insert block into cell
            else {
                this.rows[row][col].block = block;
                this.rows[row][col].filled = true;
            }
        } catch (error) {
            // console.log(error);
        }
    }

    // returns information about collisions adjacent to a block
    getBlockCollision(block, direction="down") {

        // check direction parameter
        let validDirections = ["left", "right", "down"];

        try{
            if (!validDirections.some(dir => direction === dir)) {
                throw new Error(`${direction} is not a valid direction!`);
            }
        } catch (error) {
            // console.log(error);
            return false;
        }


        // get cell row and column
        let [row, col] = this.getCellIndices(block);
        try {
            // check that bounds are in the grid
            if (row < 0 || row >= this.numRows || col < 0 || col >= this.numCols) {
                throw new Error(`Out of bounds: row=${row}, col=${col}`);
            }

            if (direction === "down") {
                if (row < this.numRows - 1 && this.rows[row + 1][col].filled) {
                    return true;
                }
            } else if (direction === "left") {
                let str = this.rows[row + 1][col - 1].filled ? "filled" : "empty";
            
                // check left
                if (row < this.numRows - 1 && this.rows[row][col - 1].filled) {
                    return true;
                }

                // check down left
                if (row + 1 < this.numRows - 1 && this.rows[row + 1][col - 1].filled) {
                    return true;
                }
            } else if (direction === "right") {
                // check right
                if (row < this.numRows - 1 && this.rows[row][col + 1].filled) {
                    return true;
                }

                // check down right
                if (row + 1 < this.numRows - 1 && this.rows[row + 1][col + 1].filled) {
                    return true;
                }
            }
        } catch (error) {
            // console.log(error);
            return false;
        }

        return false;
    }

    // returns a list of block references and collision data for each
    // block in shape
    getShapeCollision(shape) {
        return shape.blocks.some(
            block => this.getBlockCollision(block)
        );
    }

    // returns true if shape is not left-obstructed
    canMoveLeft(shape) {
        let leftBlocks = shape.blocks;
        // let leftBlocks = shape.getLeftBlocks();

        // Turns all left blocks GREEN for developer purposes
        // leftBlocks.forEach(block => block.color = "#00FF00");

        // check that shape is not too far left
        if (shape.x <= 0) {
            return false;
        }

        // check that every left block is not obstructed
        return leftBlocks.every(
            (block) => {
                return !this.getBlockCollision(block, "left");
            }
        );
    }

    // returns true if shape is not right-obstructed
    canMoveRight(shape) {
        let rightBlocks = shape.blocks;
        // let rightBlocks = shape.getRightBlocks();
        
        // Turns all right blocks GREEN for developer purposes
        // rightBlocks.forEach(block => block.color = "#00FF00");
        
        // check that shape is not too far right
        if (shape.x + shape.getState().width >= CANVAS_WIDTH) {
            return false;
        }

        // check that every right block is not obstructed
        return rightBlocks.every(
            (block) => {
                return !this.getBlockCollision(block, "right");
            }
        );
    }

    // render every cell in the grid
    render(context) {
        this.rows.forEach(row => 
            row.forEach(cell => {
                if (cell.filled) {
                    cell.block.render(context);
                }
            }));
    }

    // returns true if row is full
    rowIsFull(row_index) {
        return this.rows[row_index].every(
            cell => cell.filled);
    }

    // shifts all rows down above row_index
    shiftRowsDown(row_index) {
        // replace each row with row above from bottom to top
        for (let i = row_index; i > 1; i--) {
            for (let j = 0; j < this.numCols; j++) {
                let topCell = this.rows[i - 1][j];
                let bottomCell = this.rows[i][j];
                bottomCell.block = topCell.block;
                bottomCell.filled = topCell.filled;

                if (bottomCell.block !== null) {
                    bottomCell.block.y += this.cellHeight;
                }
            }
        }
        // erase top row
        for (let j = 0; j < this.numCols; j++) {
            let cell = this.rows[0][j];
            cell.block = null;
            cell.filled = false;
        }
    }

    // removes row
    removeRow(row_index) {
        this.rows[row_index].forEach(
            cell => {
                cell.filled = false;
                cell.block = null;
            }
        );
    }

    // returns true if the top row of the game has a block
    gameIsFinished() {
        return this.rows[0].some(
            cell => cell.filled 
        );
    }

    // print which indices are filled
    toString() {
        let result = "Filled Cells:";
        this.rows.forEach(row => {
            row.forEach(cell => {
                if (cell.filled) {
                    result += `\nrow=${cell.x} col=${cell.y}`;
                }
            });
        });
        return result;
    }
}