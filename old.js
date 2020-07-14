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

class Block {
    constructor(type) {
        let blockTypes = [
            [[1,0],[2,0],[2,1]]
        ];
        this.type = blockTypes[type];
        this.initCoords();
    }

    initCoords() {
        let baseX = 2;
        let baseY = 0;
        this.coords = [[baseY,baseX]];
        for(let i=0; i<this.type.length; i++) {
            let curX = baseX + this.type[i][1];
            let curY = baseY + this.type[i][0];
            this.coords.push([curY,curX]);
        }
    }
}

class GameGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.createGrid();
    }

    createGrid() {
        this.grid = [];
        for(let row=0; row<this.height; row++) {
            let tmp = [];
            for(let col=0; col<this.width; col++) {
                tmp.push(0);
            }
            this.grid.push(tmp);
        }
    }

    printGrid() {
        for(let row=0; row<this.height; row++) {
            let outputStr = `${String(row).padStart(2,'0')} | `;
            for(let col=0; col<this.width; col++) {
                outputStr += this.grid[row][col] + " ";
            }
            console.log(outputStr);
        }
        console.log("    "+"_".repeat(this.width*2));
        let finalStr = "     ";
        for(let i=0; i<this.width; i++) {
            finalStr += i + " ";
        }
        console.log(finalStr);
    }

    spawnBlock() {
        this.activeBlock = new Block(0);
        this.addToGrid();
    }

    addToGrid() {
        for(let i=0; i<this.activeBlock.coords.length; i++) {
            let col = this.activeBlock.coords[i][1];
            let row = this.activeBlock.coords[i][0];
            this.grid[row][col] = 1;
        }
    }

    getTakenSpaces() {
        let results = [];
        for(let row=0; row<this.height; row++) {
            for(let col=0; col<this.width; col++) {
                if(this.grid[row][col] !== 0) {
                    if(isIn([row,col], this.activeBlock.coords)) {
                        console.log("it's in the active block.. we can ignore");
                    } else {
                        results.push([row,col]);
                    }
                }
            }
        }
        return results;
    }

    checkCollision(newCoords) {
        let takenSpaces = this.getTakenSpaces();
        console.log(takenSpaces);
        return true;
    }

    removeFromGrid() {
        let activeCoords = this.activeBlock.coords.slice();
        for(let i=0; i<activeCoords.length; i++) {
            let x = activeCoords[i][1];
            let y = activeCoords[i][0];
            this.grid[y][x] = 0;
        }
    }

    moveDown() {
        let activeCoords = this.activeBlock.coords.slice();
        let newCoords = [];
        for(let i=0; i<activeCoords.length; i++) {
            let x = activeCoords[i][1];
            let y = activeCoords[i][0];
            newCoords.push([y+1,x]);
        }
        let collisionTest = this.checkCollision(newCoords);
        if(collisionTest === true) {
            console.log('we should not move');
        } else {
            console.log('we are free to move');
            this.removeFromGrid();
            this.activeBlock.coords = newCoords;
            console.log(this.activeBlock.coords);
            this.addToGrid();
        }

    }

}

grid = new GameGrid(6,12);
grid.spawnBlock();
grid.printGrid();
grid.moveDown();
grid.printGrid();