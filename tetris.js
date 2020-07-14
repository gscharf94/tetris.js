function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function isIn(sObj, arr) {
    let i;
    for(i=0; i<arr.length; i++) {
        if(arrEqual(sObj,arr[i])) {
            return true;
        }
    }
    return false;
}

function arrEqual(arr1, arr2) {
    if (arr1 === arr2) {
        return true;
    }
    if (arr1 == null || arr2 == null) {
        return false;
    }
    if (arr1.length !== arr2.length) {
        return false;
    }

    for(let i=0; i<arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }
    return true;
}


class GameGrid {
    constructor() {
        this.grid = [];
        for(let i=0;i<20;i++) {
            let row = [];
            for(let j=0;j<10;j++) {
                row.push(0);
            }
            this.grid.push(row);
        }
        this.spawnBlock();
    }
    spawnBlock() {
        this.activeBlock = new Block(0, 1, 4);
        for(let i=0; i<this.activeBlock.coords.length; i++) {
            let coords = this.activeBlock.coords[i];
            this.grid[coords[0]][coords[1]] = 1;
        }
    }
    checkCollision() {
        let coords = this.activeBlock.coords;
        for(let i=0; i<coords.length; i++) {
            let x = coords[i][1];
            let y = coords[i][0];
            if(y==19) {
                return true;
            }
            if(this.grid[y+1][x] != 0) {
                if(isIn([y+1,x],coords)) {
                    continue;
                }
                return true;
            }
        }
        return false;
    }
    moveDownActive() {
        if(this.checkCollision()) {
            this.spawnBlock();
            return false;
        }
        let oldCoords = this.activeBlock.coords;
        for(let i=0; i<oldCoords.length; i++) {
            this.grid[oldCoords[i][0]][oldCoords[i][1]] = 0;
            oldCoords[i][0]++;
        }
        for(let i=0; i<oldCoords.length; i++) {
            this.grid[oldCoords[i][0]][oldCoords[i][1]] = 1;
        }
    }
}

class Block {
    constructor(blockType, xPos, yPos) {
        let blockTypes = [
            [[1,0],[2,0],[2,1]]
        ];
        let bType = blockTypes[blockType];
        this.coords = [[xPos, yPos]];
        for(let i=0;i<bType.length;i++) {
            let x = this.coords[0][0] + bType[i][0];
            let y = this.coords[0][1] + bType[i][1];
            this.coords.push([x,y]);
        }
    }

}


class GameController {
    constructor() {
        this.gameGrid = new GameGrid();
        this.canvas = document.getElementById("canv");
        this.canv = this.canvas.getContext("2d");
    }
    drawCell(row, col) {
        let xPos = col*60;
        let yPos = row*50;
        let width = 60;
        let height = 50;
        this.canv.beginPath();
        this.canv.rect(xPos, yPos, width, height);
        // this.canv.strokeStyle = 'black';
        this.canv.fillStyle = 'blue'
        // this.canv.stroke();
        this.canv.fill();
    }
    drawGrid() {
        let row, col;
        for(row=0; row<20; row++) {
            for(col=0; col<10; col++) {
                if(this.gameGrid.grid[row][col] != 0) {
                    this.drawCell(row,col);
                }
            }
        }
    }
    gameTick() {
        this.canv.clearRect(0,0,600,1000);
        this.gameGrid.moveDownActive();
        this.drawGrid();
    }

    getFullSpots() {
        let results = [];
        for(let row=0; row<20; row++) {
            for(let col=0; col<10; col++) {
                if(this.gameGrid.grid[row][col] != 0) {
                    results.push([row,col]);
                }
            }
        }
        let activeSpots = this.gameGrid.activeBlock.coords;
        let finalSpots = [];
        for(let i=0; i<results.length; i++) {
            if(isIn(results[i],activeSpots)) {
                
            } else {
                finalSpots.push(results[i])
            }
        }
        return finalSpots;
    }

    checkHorizontalCollision(coords, amount) {
        let newCoords = coords.slice();
        let takenSpots = this.getFullSpots();
        for(let i=0; i<newCoords.length; i++) {
            newCoords[i][1] += amount;
            if(isIn(newCoords[i], takenSpots)) {
                return true;
            }
        }

    }


    horizontalMove(amount) {


        for(let i=0; i<this.gameGrid.activeBlock.coords.length; i++) {
            let x = this.gameGrid.activeBlock.coords[i][1];
            let y = this.gameGrid.activeBlock.coords[i][0];
            this.gameGrid.grid[y][x] = 0;
            this.gameGrid.activeBlock.coords[i][1] += amount;
        }
        for(let i=0; i<this.gameGrid.activeBlock.coords.length; i++) {
            let x = this.gameGrid.activeBlock.coords[i][1];
            let y = this.gameGrid.activeBlock.coords[i][0];
            this.gameGrid.grid[y][x] = 1;
        }

        this.canv.clearRect(0,0,600,1000);
        this.drawGrid();
    }


}

game = new GameController();
game.drawGrid();

function keyPress(event) {
    if(event.keyCode == 65) {
        game.horizontalMove(-1);
    } else if(event.keyCode == 68) {
        game.horizontalMove(1);
    } else if(event.keyCode == 87) {
        console.log('up');
    } else if(event.keyCode == 83) {
        console.log('down');
    }
}

document.addEventListener('keydown',keyPress);



window.setInterval("game.gameTick()", 200);