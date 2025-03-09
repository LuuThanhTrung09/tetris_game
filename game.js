const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

const board = [];
const bgm = document.createElement('audio');
const breakSound = document.createElement('audio');
const drop = document.createElement('audio');
let rotatedShape;

bgm.setAttribute("src", "background.mp3");
bgm.muted = true;

bgm.setAttribute("src", "break.mp3");
bgm.muted = true;

for(let row = 0; row < BOARD_HEIGHT; row++) {
    board[row]=[];
    for(let col = 0; col < BOARD_WIDTH; col++){
        board[row][col] = 0;
    }
}

const tetrominoes = [
    {
        shape :[
            [1,1],
            [1,1]
        ],
        color: "#ffd800",
    },
    {
        shape: [
            [0,2,0],
            [2,2,2]
        ],
        color: "#7925dd",
    },
    {
        shape: [
            [0,3,3],
            [3,3,0]
        ],
        color: "orange"
    },
    {
        shape: [
            [4,4,0],
            [0,4,4]
        ],
        color: "red"
    },
    {
        shape: [
            [5,0,0],
            [5,5,5]
        ],
        color: "green"
    },
    {
        shape: [
            [0,0,6],
            [6,6,6]
        ],
        color: "#ff6400"
    },
    {
        shape: [[7,7,7,7]],
        color: "#00b5ff"
    },
];

function randomTetromino() {
    
    const index = Math.floor(Math.random() * tetrominoes.length);
    const tetromino = tetrominoes[index];
    
    return {
        row: 0,
        col: Math.floor(Math.random() * (BOARD_WIDTH - tetromino.shape[0].length + 1)),
        shape: tetromino.shape,
        color: tetromino.color
    };
}

let variableName = [];
let currentTetromino = randomTetromino();
let currentGhostTetromino;

function drawTetromino() {
    if (currentTetromino && currentTetromino.shape && currentTetromino.shape.length) {
        const shape = currentTetromino.shape;
        const color = currentTetromino.color;
        const row = currentTetromino.row;
        const col = currentTetromino.col;
        
        for(let r = 0; r < shape.length; r++) {
            for(let c = 0; c < shape[r].length; c++) {
                if(shape[r][c]) {
                    const block = document.createElement('div');
                    block.classList.add('block');
                    block.style.backgroundColor = color;
                    block.style.top = (row + r) * 24 + 'px';
                    block.style.left = (col + c) * 24 + 'px';
                    // Ensure consistent ID format
                    const blockId = `block-${row + r}-${col + c}`;
                    block.setAttribute('id', blockId);
                    document.getElementById('game_board').appendChild(block);
                }
            }
        }
    } else {
        console.log('currentTetromino is undefined or has no shape');
    }
}

//erase tetromino from board
function eraseTetromino() {
    if (currentTetromino && currentTetromino.shape && currentTetromino.shape.length) {
        for(let i = 0; i < currentTetromino.shape.length; i++){
            for(let j = 0; j < currentTetromino.shape[i].length; j++){
                if(currentTetromino.shape[i][j] !== 0){
                    let row = currentTetromino.row + i;
                    let col = currentTetromino.col + j;
                    let block = document.getElementById(`block-${row}-${col}`);
                    if(block) {
                        document.getElementById("game_board").removeChild(block);
                    }
                }
            }
        }
    } else {
        console.log('currentTetromino is undefined or has no shape');
    }
}

// Update spawnNewTetromino to set the active tetromino
function spawnNewTetromino() {
    if (!activeTetromino) { // Only spawn if no active tetromino exists
        activeTetromino = randomTetromino();
        currentTetromino = activeTetromino;
        if (!isValidMove(currentTetromino.row, currentTetromino.col, currentTetromino.shape)) {
            console.log("Game Over!");
            clearInterval(gameLoop);
            alert("Game Over!");
            return;
        }
        drawTetromino();
    }
}

// Add a helper function to check if a move is valid
function isValidMove(newRow, newCol, shape) {
    for(let i = 0; i < shape.length; i++) {
        for(let j = 0; j < shape[i].length; j++) {
            if(shape[i][j] !== 0) {
                const row = newRow + i;
                const col = newCol + j;
                
                // Check boundaries
                if(row >= BOARD_HEIGHT || col < 0 || col >= BOARD_WIDTH) {
                    return false;
                }
                
                // Check if position is already occupied in the board array
                if(board[row][col] !== 0) {
                    return false;
                }
            }
        }  
    }
    return true;
}

// Helper function to rotate a 2D array clockwise
function rotateShape(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = Array(cols).fill().map(() => Array(rows).fill(0));
    
    for(let r = 0; r < rows; r++) {
        for(let c = 0; c < cols; c++) {
            rotated[c][rows - 1 - r] = shape[r][c];
        }
    }
    return rotated;
}

// Update rotateTetromino to use activeTetromino
function rotateTetromino() {
    if (!activeTetromino || isKeyPressed) return;
    isKeyPressed = true;

    const currentShape = activeTetromino.shape;
    const rotatedShape = rotateShape(currentShape);

    if (isValidMove(activeTetromino.row, activeTetromino.col, rotatedShape)) {
        eraseTetromino();
        activeTetromino.shape = rotatedShape;
        currentTetromino = activeTetromino;
        drawTetromino();
    } else {
        const kicks = [[0, 1], [0, -1], [-1, 0], [1, 0]];
        for (let [kickRow, kickCol] of kicks) {
            const newRow = activeTetromino.row + kickRow;
            const newCol = activeTetromino.col + kickCol;
            if (isValidMove(newRow, newCol, rotatedShape)) {
                eraseTetromino();
                activeTetromino.row = newRow;
                activeTetromino.col = newCol;
                activeTetromino.shape = rotatedShape;
                currentTetromino = activeTetromino;
                drawTetromino();
                break;
            }
        }
    }

    setTimeout(() => { isKeyPressed = false; }, 100);
}

// Update moveTetromino to ensure locking happens correctly
function moveTetromino(direction) {
    if (!activeTetromino || isKeyPressed) return;
    isKeyPressed = true;

    const currentRow = activeTetromino.row;
    const currentCol = activeTetromino.col;
    let newRow = currentRow;
    let newCol = currentCol;

    if (direction === "left") {
        newCol -= 1;
    } else if (direction === "right") {
        newCol += 1;
    } else if (direction === "down") {
        newRow += 1;
    }

    if (isValidMove(newRow, newCol, activeTetromino.shape)) {
        eraseTetromino();
        activeTetromino.row = newRow;
        activeTetromino.col = newCol;
        currentTetromino = activeTetromino;
        drawTetromino();
    } else if (direction === "down") {
        lockTetromino();
        activeTetromino = null;
        spawnNewTetromino();
    }

    setTimeout(() => { isKeyPressed = false; }, 100);
}

// Ensure lockTetromino triggers row clearing correctly
function lockTetromino() {
    if (!activeTetromino) return;
    
    for (let i = 0; i < activeTetromino.shape.length; i++) {
        for (let j = 0; j < activeTetromino.shape[i].length; j++) {
            if (activeTetromino.shape[i][j] !== 0) {
                let row = activeTetromino.row + i;
                let col = activeTetromino.col + j;
                board[row][col] = activeTetromino.shape[i][j];
            }
        }
    }
    
    // Clear rows immediately after locking
    const cleared = clearFullRows();
    if (cleared > 0) {
        console.log("Rows cleared after lock:", cleared);
    }
}

// Function to check and clear full rows
function clearFullRows() {
    let rowsCleared = 0;
    
    // Check each row from bottom to top
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        // Log the row contents for debugging
        console.log(`Checking row ${row}:`, board[row]);
        
        // Check if the row is full (no 0s)
        const isFull = board[row].every(cell => cell !== 0);
        if (isFull) {
            console.log(`Row ${row} is full, clearing...`);
            rowsCleared++;
            
            // Remove all blocks in this row from the DOM
            for (let col = 0; col < BOARD_WIDTH; col++) {
                const blockId = `block-${row}-${col}`;
                const block = document.getElementById(blockId);
                if (block) {
                    document.getElementById("game_board").removeChild(block);
                } else {
                    console.log(`Block not found in DOM: ${blockId}`);
                }
            }
            
            // Remove the row and shift everything down
            board.splice(row, 1);
            board.unshift(Array(BOARD_WIDTH).fill(0));
            row++; // Re-check the same position after shifting
        }
    }
    
    if (rowsCleared > 0) {
        console.log(`Cleared ${rowsCleared} rows`);
        redrawBoard();
    }
    return rowsCleared; // Useful for scoring if you add it later
}

// Function to redraw the entire board after clearing
function redrawBoard() {
    // Remove all existing blocks
    const gameBoard = document.getElementById("game_board");
    while(gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }
    
    // Redraw all locked blocks from the board array
    for(let row = 0; row < BOARD_HEIGHT; row++) {
        for(let col = 0; col < BOARD_WIDTH; col++) {
            if(board[row][col] !== 0) {
                const block = document.createElement('div');
                block.classList.add('block');
                // Use the color from the original tetromino (assuming numbers match tetromino index + 1)
                const tetrominoIndex = board[row][col] - 1;
                block.style.backgroundColor = tetrominoes[tetrominoIndex].color;
                block.style.top = row * 24 + 'px';
                block.style.left = col * 24 + 'px';
                block.setAttribute('id', `block-${row}-${col}`);
                gameBoard.appendChild(block);
            }
        }
    }
    
    // Redraw the current tetromino
    drawTetromino();
}


// Update the game loop to check if tetromino can move down
let gameLoop = setInterval(gameStep, 500);
let isKeyPressed = false; // Flag to debounce key presses
let activeTetromino = null; // Track the current active tetromino

// Update gameStep to check after locking
function gameStep() {
    if (!activeTetromino) {
        spawnNewTetromino();
        return;
    }
    
    const nextRow = activeTetromino.row + 1;
    if (isValidMove(nextRow, activeTetromino.col, activeTetromino.shape)) {
        moveTetromino("down");
    } else {
        lockTetromino();
        activeTetromino = null;
        spawnNewTetromino();
    }
}



function handleKeyPress(event) {
    
    switch(event.keyCode){
        case 37 : //left
            moveTetromino("left");
            break;
        case 39 : //rigt
            moveTetromino("right");
            break;
        case 40 : //down
            moveTetromino("down");
            break;
        case 32: //up
            rotateTetromino()
            break;
        // case 32 : //space bar 
        //     //rotate
        //     break;
    }
}

// Start the game
gameLoop = setInterval(gameStep, 500);
spawnNewTetromino();
document.addEventListener("keydown", handleKeyPress);
