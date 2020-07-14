canvas = document.getElementById("canv");
canv = canvas.getContext("2d");

const Http = new XMLHttpRequest();
const displayURL = "https://blooming-reaches-62726.herokuapp.com/update/display"
const updateURL =  "https://blooming-reaches-62726.herokuapp.com/update/update"

function sortArray(arr) {
    let i, j;
    for(i = 0; i < arr.length; i++) {
        let smallest = arr[i].split(":")[1];
        let smallestIndex = i;
        for(j = i + 1; j < arr.length; j++) {
            let test = arr[j].split(":")[1];
            if(parseInt(test) > parseInt(smallest)) {
                smallest = test;
                smallestIndex = j;
            }
        }
        let itemCopy = arr[smallestIndex];
        arr.splice(smallestIndex,1);
        arr.splice(i, 0, itemCopy);
    }
    return arr;
}


function updateScore(user, score) {
    Http.open("POST", updateURL);
    Http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    Http.send(`username=${user}&score=${score}`);

    Http.onreadystatechange=(e)=>{
        console.log(Http.responseText);
        writeToTable(Http.responseText);
    }
}

function writeToTable(text) {
    let split = text.slice(0,text.length-1).split(",");
    let i;

    if(split[0] === "") {
        return;
    }

    split = sortArray(split).slice(0,10);
    console.log(`OVER HERE: ${split}`);

    console.log(split);
    console.log(split.length);
    for(i=0; i<split.length; i++) {
        let curRow = document.getElementById("table"+i);
        let split2 = split[i].split(":");
        let user = split2[0].toUpperCase();
        let score = split2[1];

        let firstStr = `<td>${user}</td>`;
        let secondStr = `<td>${score}</td>`;

        curRow.innerHTML = firstStr + secondStr;
    }
}

function getDisplayRawData() {
    Http.open("GET", displayURL);
    Http.send();

    let records = [];

    Http.onreadystatechange=(e)=>{
        writeToTable(Http.responseText);
    }
    return records;
}


function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function checkForSmallScreen() {
    let clientWidth = document.documentElement.clientWidth;
    let clientHeight = document.documentElement.clientHeight;
    
    let table = document.getElementById("scoreTable");
    let container = document.getElementById("flex_container")

    if(clientWidth < 580) {
        container.style.display = "block";
        canvas.style.marginRight = "auto";
        table.style.marginLeft = "auto";
        table.style.width = "75%";
    } else {
        container.style.display = "flex";
        canvas.style.marginRight = "1.5vw";
        table.style.marginLeft = "0";
        table.style.width = "25%";
    }
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

    saveHighScore() {
        if(this.gameGrid.score > 0) {
            let username = window.prompt("HIGH SCORE","Please enter name");
            updateScore(username, this.gameGrid.score);
        }
    }

    restartGame() {
        this.currentSpeed = .5;
        this.paused = false;

        this.gameGrid.initGrid();
        this.gameGrid.spawnBlock();
        this.gameGrid.score = 0;

        pauseButton = window.setInterval("game.gameTick()", 50);
    }

    speedUp() {
        this.currentSpeed *= .99;
    }

    pause() {
        if(this.paused === false) {
            clearInterval(pauseButton);
            this.paused = true;
            this.canvasDrawer.drawPause();
        } else {
            pauseButton = window.setInterval("game.gameTick()", 50);
            this.paused = false;
            // this.canvasDrawer.drawGrid(this.grid);
            // this.canvasDrawer.drawGhostBlocks(this.getBottomCoords(), this.activeBlock.type);
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
        this.first = true;
        
        this.initGrid();
        this.spawnBlock();

        this.score = 0;
        this.canvasDrawer.drawGrid(this.grid);
        this.canvasDrawer.drawScore(this.score);


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
        this.addCoords(blockCoords, blockType, this.grid);
        this.canvasDrawer.drawGrid(this.grid);
        this.canvasDrawer.drawGhostBlocks(this.getBottomCoords(), this.activeBlock.type);
        this.canvasDrawer.drawScore(this.score);

        this.checkLoseCondition();

        if(this.first === true) {
            this.first = false;
        } else {
            game.speedUp();
        }
    }

    checkLoseCondition() {
        let currentCoords = this.activeBlock.getCurrentCoords();
        let potentialCoords = this.activeBlock.downMove();

        this.addCoords(currentCoords, -1, this.grid);

        let noCollision = this.testCollision(potentialCoords, this.grid);

        if(noCollision === true) {
            return;
        } else {
            game.paused = true;
            this.gameOver();
        }    
    }

    gameOver() {
        clearInterval(pauseButton);
        this.canvasDrawer.drawGameOver();
        game.isGameOver = true;
        game.saveHighScore();
    }

    addCoords(coords, blockType, grid) {
        // adds coords to this.grid AFTER it has been checked
        let i, row, col;

        for(i = 0; i < coords.length; i++) {
            row = coords[i][0];
            col = coords[i][1];

            grid[row][col] = blockType;
        }
    }
    
    testCollision(newCoords, grid) {
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

            gridVal = grid[row][col];
            if(gridVal !== -1) {
                return false;
            }
        }
        return true;

    }

    addScore(c) {
        let speed = game.currentSpeed;
        let newScore = Math.round((c*150)/speed);
        this.score += newScore;
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
        let count = 0;

        for(row = 0; row < 20; row++) {
            if(this.checkRow(row) == true) {
                count++;
                this.removeLine(row);
            }
        }
        this.addScore(count);
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

    getBottomCoords() {
        let row = this.activeBlock.row;
        let col = this.activeBlock.col;

        while(true) {
            let currentCoords = this.activeBlock.getDiffCoords(row, col);
            let potentialCoords = this.activeBlock.downMoveDiffCoords(row, col);

            let gridCopy = this.grid.slice();
            this.addCoords(currentCoords, -1, gridCopy);

            let noCollision = this.testCollision(potentialCoords, gridCopy);

            if(noCollision === true) {
                row++;
                continue;
            } else {
                potentialCoords = this.activeBlock.getDiffCoords(row, col);
                return potentialCoords;
            }


        }
    }

    setActiveDown() {
        let bottomCoords = this.getBottomCoords();
        let currentCoords = this.activeBlock.getCurrentCoords();
        this.addCoords(currentCoords, -1, this.grid);
        this.addCoords(bottomCoords, this.activeBlock.type, this.grid);

        this.spawnBlock();
        this.checkRows();
    }

    moveActiveDown() {
        let currentCoords = this.activeBlock.getCurrentCoords();
        let potentialCoords = this.activeBlock.downMove();

        this.addCoords(currentCoords, -1, this.grid);

        let noCollision = this.testCollision(potentialCoords, this.grid);

        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type, this.grid);
            this.activeBlock.updatePos(potentialCoords);
            this.canvasDrawer.drawGrid(this.grid);
            this.canvasDrawer.drawGhostBlocks(this.getBottomCoords(), this.activeBlock.type);
            this.canvasDrawer.drawScore(this.score);
        } else {
            this.addCoords(currentCoords, this.activeBlock.type, this.grid);
            this.spawnBlock();
            this.checkRows();
        }    

    }

    moveActiveHorizontal(dir) {
        // -1 = left | 1 = right
        let currentCoords = this.activeBlock.getCurrentCoords();
        let potentialCoords = this.activeBlock.horizontalMove(dir);

        this.addCoords(currentCoords, -1, this.grid);

        let noCollision = this.testCollision(potentialCoords, this.grid);

        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type, this.grid);
            this.activeBlock.updatePos(potentialCoords);
            this.canvasDrawer.drawGrid(this.grid);
            this.canvasDrawer.drawGhostBlocks(this.getBottomCoords(), this.activeBlock.type);
            this.canvasDrawer.drawScore(this.score);
        } else {
            // console.log('illegal move');
        }

    }

    rotateActiveBlock() {
        let currentCoords = this.activeBlock.getCurrentCoords();
        this.activeBlock.rotate();
        let potentialCoords = this.activeBlock.getCurrentCoords();

        this.addCoords(currentCoords, -1, this.grid);

        let noCollision = this.testCollision(potentialCoords, this.grid);


        if(noCollision === true) {
            this.addCoords(potentialCoords, this.activeBlock.type, this.grid);
            this.canvasDrawer.drawGrid(this.grid);
            this.canvasDrawer.drawGhostBlocks(this.getBottomCoords(), this.activeBlock.type);
            this.canvasDrawer.drawScore(this.score);
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

    getDiffCoords(row, col) {
        let coords = [[row, col]];
        let i, cRow, cCol;
        for(i = 0; i < this.currentTemplate.length; i++) {
            cRow = this.currentTemplate[i][0] + row;
            cCol = this.currentTemplate[i][1] + col;
            coords.push([cRow, cCol]);
        }
        return coords;
    }

    downMoveDiffCoords(row, col) {
        // moves coords down with specific coords first
        let coords = this.getDiffCoords(row, col);
        let i;
        for(i = 0; i < coords.length; i++) {
            coords[i][0]++;
        }
        return coords;
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
            game.gameGrid.setActiveDown();
        } else if(event.keyCode == 80) {
            game.pause();
        } else if(event.keyCode == 78 && game.isGameOver == true) {
            game.restartGame();
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
                let obj = {keyCode:32}
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

    drawBlock(x, y, type, ghost) {
        const colors = ['rgba(40, 116, 166','rgba(125, 60, 152','rgba(146, 43, 33','rgba(144, 148, 151','rgba(183, 149, 11','rgba(34, 153, 84','rgba(52, 73, 94'];

        canv.beginPath();
        canv.rect(x,y,this.blockWidth,this.blockHeight);
        if(ghost) {
            canv.fillStyle = colors[type] + ", .25)";
        } else{
            canv.fillStyle = colors[type] + ", 1)";
        }
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
                    this.drawBlock(x, y, type, false);
                }
            }
        }
    }

    drawGhostBlocks(coords, type) {
        let i, row, col;
        let x, y;
        for(i= 0; i < coords.length; i++) {
            row = coords[i][0];
            col = coords[i][1];

            x = col * this.blockWidth;
            y = row * this.blockHeight;

            this.drawBlock(x, y, type, true);
        }
    }

    drawPause() {
        canv.font = "30px Arial";
        canv.fillStyle = "white";
        canv.fillText("GAME PAUSED", 18,100);
    }

    drawGameOver() {
        canv.font = "30px Arial";
        canv.fillStyle = "white";
        canv.fillText("GAME OVER", 33, 100);
        canv.font = "18px Arial";
        canv.fillText("Press n to play again...", 35, 125);
    }

    drawScore(score) {
        canv.font = "10px Arial";
        canv.fillStyle = "white";
        canv.fillText(`${score} pts`,2,10);
    }
}


game = new GameApp();

pauseButton = window.setInterval("game.gameTick()", 50);
window.setInterval("checkForSmallScreen()", 750);
getDisplayRawData();