canvas = document.getElementById("canv");
canv = canvas.getContext("2d");

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

class GameApp {
    constructor() {
        this.canvasDrawer = new CanvasDrawer();
        this.gameGrid = new GameGrid(this.canvasDrawer);
        this.inputHandler = new InputHandler(this.gameGrid)

        let currentTime = new Date();
        this.currentTime = currentTime.getTime();

        this.currentSpeed = .5;

        this.paused = false;

    }

    speedUp() {
        this.currentSpeed *= .95;
        // console.log(`speeding up to: ${this.currentSpeed}`);
    }

    pause() {
        if(this.paused === false) {
            clearInterval(pauseButton);
            this.paused = true;
        } else {
            pauseButton = window.setInterval("game.gameTick()", 50);
            this.paused = false;
        }
    }

    gameTick() {
        let checkTime = new Date();
        checkTime = checkTime.getTime();
        let diff = (checkTime - this.currentTime)/1000;
        if(diff > this.currentSpeed) {
            this.gameGrid.moveActiveDown();
            let currentTime = new Date();
            this.currentTime = currentTime.getTime();

        }
        // this.canvasDrawer.drawGrid(this.gameGrid.grid);
        
    }

}

class GameGrid {
    constructor(canvasDrawer) {
        this.canvasDrawer = canvasDrawer;
        
        this.initGrid();
        this.spawnBlock();

        this.canvasDrawer.drawGrid(this.grid);

    }

    initGrid() {
        this.grid = [];

        let row, col;
        for(row = 0; row < 20; row++) {
            let tmpRow = [];
            for(col = 0; col < 10; col++) {
                tmpRow.push(-1);
            }
            this.grid.push(tmpRow);
        }
    }

    getGrid() {
        // returns copy of the grid
        return this.grid.slice();
    }

    spawnBlock() {
        let blockType = getRandomInt(7);
        // let blockType = 0;
        this.activeBlock = new Block(1,4,blockType);
        let blockCoords = this.activeBlock.getCurrentCoords();
        this.addCoords(blockCoords, blockType);
        this.canvasDrawer.drawGrid(this.grid);
    }

    addCoords(coords, blockType) {
        // adds coords to this.grid AFTER it has been checked
        let i, row, col;

        for(i = 0; i < coords.length; i++) {
            row = coords[i][0];
            col = coords[i][1];

            this.grid[row][col] = blockType;
        }
    }
    
    testCollision(newCoords) {
        let i, row, col, gridVal;

        for(i = 0; i < newCoords.length; i++) {
            row = newCoords[i][0];
            col = newCoords[i][1];
            if(row > 19 || row < 0) {
                return false;
            }
            if(col > 9 || col < 0) {
                return false;
            }

            gridVal = this.grid[row][col];
            if(gridVal !== -1) {
                return false;
            }
        }
        return true;

    }

    checkRow(row) {
        let col;

        for(col = 0; col < 10; col++) {
            if(this.grid[row][col] == -1) {
                return false;
            }
        }
        return true;
    }

    checkRows() {
        let row;

        for(row = 0; row < 20; row++) {
            if(this.checkRow(row) == true) {
                this.removeLine(row);
            }
        }
    }
    
    removeLine(row) {
        this.grid.splice(row,1);
        this.grid.unshift([-1,-1,-1,-1,-1,-1,-1,-1,-1,-1])
        this.activeBlock.shiftDown();

    }

    printGrid() {
        let row, col, rowStr;
        for(row = 0; row < 20; row++) {
            rowStr = "";
            for(col = 0; col < 10; col++) {
                rowStr += `${this.grid[row][col]} `;
            }
        }

    }

    moveActiveDown() {
        let currentCoords = this.activeBlock.getCurrentCoords();
        let potentialCoords = this.activeBlock.downMove();

        this.addCoords(currentCoords, -1);

        let noCollision = this.testCollision(potentialCoords);

        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type);
            this.activeBlock.updatePos(potentialCoords);
            this.canvasDrawer.drawGrid(this.grid);
        } else {
            this.addCoords(currentCoords, this.activeBlock.type);
            this.spawnBlock();
            this.checkRows();
        }    

    }

    moveActiveHorizontal(dir) {
        // -1 = left | 1 = right
        let currentCoords = this.activeBlock.getCurrentCoords();
        let potentialCoords = this.activeBlock.horizontalMove(dir);

        this.addCoords(currentCoords, -1);

        let noCollision = this.testCollision(potentialCoords);

        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type);
            this.activeBlock.updatePos(potentialCoords);
            this.canvasDrawer.drawGrid(this.grid);
        } else {
            // console.log('illegal move');
        }

    }

    rotateActiveBlock() {
        
        let currentCoords = this.activeBlock.getCurrentCoords();
        this.activeBlock.rotate();
        let potentialCoords = this.activeBlock.getCurrentCoords();

        this.addCoords(currentCoords, -1);

        let noCollision = this.testCollision(potentialCoords);


        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type);
            this.canvasDrawer.drawGrid(this.grid);
        } else {
            this.activeBlock.rotateBack();
        }

    }

}

class Block {
    constructor(row, col, type) {

        this.row = row;
        this.col = col;
        this.type = type;

        this.orientation = 0;
        let types = [
            [[[1,0],[2,0],[2,1]] , [[1,0],[0,1],[0,2]] , [[0,1],[1,1],[2,1]] , [[0,1],[0,2],[-1,2]]],
            [[[1,0],[2,0],[2,-1]] , [[1,0],[1,1],[1,2]] , [[0,1],[1,0],[2,0]] , [[0,1],[0,2],[1,2]]],
            [[[0,1],[1,0],[1,1]]],
            [[[1,0],[2,0],[3,0]] , [[0,1],[0,2],[0,3]]],
            [[[0,1],[1,1],[1,2]] , [[1,0],[1,-1],[2,-1]]],
            [[[0,1],[1,0],[1,-1]] , [[1,0],[1,1],[2,1]]],
            [[[1,-1],[1,0],[1,1]] , [[1,0],[1,1],[2,0]] , [[0,1],[0,2],[1,1]] , [[1,-1],[1,0],[2,0]]]
        ]
        this.template = types[type];
        this.currentTemplate = this.template[this.orientation];

    }

    rotate() {
        let endIndex = this.template.length;
        this.orientation++;
        if(this.orientation === endIndex) {
            this.orientation = 0;
        }
        this.currentTemplate = this.template[this.orientation];

    }

    rotateBack() {
        let endIndex = this.template.length-1;
        this.orientation--;
        if(this.orientation == -1) {
            this.orientation = endIndex;
        }
        this.currentTemplate = this.template[this.orientation];
    }

    updatePos(newCoords) {
        this.row = newCoords[0][0];
        this.col = newCoords[0][1];
    }

    shiftDown() {
        this.row += 1;
    }

    getCurrentCoords() {
        // returns copy of current coords
        let coords = [[this.row, this.col]];
        let i, row, col;
        for(i = 0; i < this.currentTemplate.length; i++) {
            row = this.currentTemplate[i][0] + this.row;
            col = this.currentTemplate[i][1] + this.col;
            coords.push([row, col]);
        }
        return coords;
    }

    downMove() {
        // moves this.coords down and returns wanted position for gamegrid to check
        let currentCoords = this.getCurrentCoords();
        let i;
        for(i = 0; i < currentCoords.length; i++) {
            currentCoords[i][0]++;
        }
        return currentCoords;    
    }

    horizontalMove(dir) {
        // moves left or right and returns wanted position
        // -1 left | 1 right
        let currentCoords = this.getCurrentCoords();
        let i;
        for(i = 0; i < currentCoords.length; i++) {
            currentCoords[i][1] += dir;
        }
        return currentCoords;
    }
    
}

class InputHandler {
    constructor() {
        document.addEventListener('keydown',this.keydownInput);
        document.addEventListener('touchstart',this.touchStart);
        document.addEventListener('touchend',this.touchEnd);

        this.startTouch = 0;
        this.endTouch = 0;

    }
    
    keydownInput(event) {
        // console.log(event.keyCode);
        if(event.keyCode == 87 && game.paused == false) {
            game.gameGrid.rotateActiveBlock();
        } else if(event.keyCode == 65 && game.paused == false) {
            game.gameGrid.moveActiveHorizontal(-1);
        } else if(event.keyCode == 68 && game.paused == false) {
            game.gameGrid.moveActiveHorizontal(1);
        } else if(event.keyCode == 83 && game.paused == false) {
            game.gameGrid.moveActiveDown();
        } else if(event.keyCode == 32 && game.paused == false) {
            game.gameGrid.spawnBlock();
        } else if(event.keyCode == 80) {
            game.pause();
        }
    }

    touchInput() {
        let xDiff = game.inputHandler.endTouch.x - game.inputHandler.startTouch.x;
        let yDiff = game.inputHandler.endTouch.y - game.inputHandler.startTouch.y;

        // console.log(xDiff, yDiff);

        if(Math.abs(xDiff) > Math.abs(yDiff*1.5)) {
            if(xDiff < 0) {
                let obj = {keyCode:65};
                game.inputHandler.keydownInput(obj);
            } else {
                let obj = {keyCode:68};
                game.inputHandler.keydownInput(obj);
            }
        } else if(Math.abs(yDiff) > Math.abs(4*xDiff)) {
            if (yDiff < 0) {
                console.log('up');
            } else {
                let obj = {keyCode:83}
                game.inputHandler.keydownInput(obj);
            }
        } else if(Math.abs(xDiff) < 35 && Math.abs(yDiff) < 35) {
            let obj = {keyCode:87};
            game.inputHandler.keydownInput(obj);
        } else {
            console.log('who knows');
        }
    }

    touchStart(event) {
        if(event.target.id !== "canv") {
            return;
        }

        let canvRect = canvas.getBoundingClientRect();
        let pos = {
            x: event.touches[0].clientX - canvRect.left,
            y: event.touches[0].clientY - canvRect.top
        };

        game.inputHandler.startTouch = pos;
    }

    touchEnd(event) {
        if(event.target.id !== "canv") {
            return;
        }

        let canvRect = canvas.getBoundingClientRect();
        let pos = {
            x: event.changedTouches[0].clientX - canvRect.left,
            y: event.changedTouches[0].clientY - canvRect.top
        };

        game.inputHandler.endTouch = pos;
        game.inputHandler.touchInput();

    }

}


class CanvasDrawer {
    constructor() {
        this.blockHeight = canvas.height/20;
        this.blockWidth = canvas.width/10;

    }

    drawBlock(x, y, type) {
        const colors = ['blue','green','red','purple','yellow','orange','pink'];

        canv.beginPath();
        canv.rect(x,y,this.blockWidth,this.blockHeight);
        canv.fillStyle = colors[type];
        canv.fill();
    }

    drawGrid(grid) {
        let row, col;
        let x, y;
        let type;

        canv.clearRect(0,0,canvas.width,canvas.height);

        for(row = 0; row < 20; row++) {
            for(col = 0; col < 10; col++) {
                x = col * this.blockWidth;
                y = row * this.blockHeight;
                type = grid[row][col];

                if(grid[row][col] != -1) {
                    this.drawBlock(x, y, type);
                }
            }
        }

    }
}


game = new GameApp();

pauseButton = window.setInterval("game.gameTick()", 10);