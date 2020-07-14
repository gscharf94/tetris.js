canvas = document.getElementById("canv");
canv = canvas.getContext("2d");

let startTouch, endTouch;

function touchClassifier() {
    let xDiff = endTouch.x - startTouch.x;
    let yDiff = endTouch.y - startTouch.y;

    console.log(xDiff, yDiff);

    if(Math.abs(xDiff) > Math.abs(5*yDiff)) {
        if(xDiff < 0) {
            console.log('left');
        } else {
            console.log('right');
        }
    } else if(Math.abs(yDiff) > Math.abs(5*xDiff)) {
        if (yDiff < 0) {
            console.log('up');
        } else {
            console.log('down');
        }
    } else if(Math.abs(xDiff) < 35 && Math.abs(yDiff) < 35) {
        console.log('rotate');
    } else {
        console.log('who knows');
    }
}

function touchStart(event) {
    if(event.target.id !== "canv") {
        return;
    }
    let canvRect = canvas.getBoundingClientRect();
    let pos = {
        x: event.touches[0].clientX - canvRect.left,
        y: event.touches[0].clientY - canvRect.top
    };

    // console.log(`start: ${pos.x}, ${pos.y}`);
    startTouch = pos;
    
}

function touchEnd(event) {
    if(event.target.id !== "canv") {
        return;
    }
    let canvRect = canvas.getBoundingClientRect();
    let pos = {
        x: event.changedTouches[0].clientX - canvRect.left,
        y: event.changedTouches[0].clientY - canvRect.top
    };
    // console.log(pos);
    // console.log(`end: ${pos.x}, ${pos.y}`);
    endTouch = pos;

    touchClassifier();
}

// function touchMove(event) {
    // console.log(event);
// }

document.addEventListener('touchstart',this.touchStart);
// document.addEventListener('touchmove',this.touchMove);
document.addEventListener('touchend',this.touchEnd);