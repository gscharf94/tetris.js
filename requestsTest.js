const Http = new XMLHttpRequest();
const displayURL = "https://blooming-reaches-62726.herokuapp.com/update/display"
const updateURL =  "https://blooming-reaches-62726.herokuapp.com/update/update"

function updateScore(user, score) {
    Http.open("POST", updateURL);
    Http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    Http.send(`username=${user}&score=${score}`);

    Http.onreadystatechange=(e)=>{
        console.log(Http.responseText);
        writeToTable(Http.responseText);
    }
}

function printToConsole(text) {
    text = text.slice(0,text.length-1);
    let split = text.split(",");
    console.log(split);
}

function writeToTable(text) {
    let split = text.slice(0,text.length-1).split(",");
    let i;

    for(i=0; i<split.length; i++) {
        let curRow = document.getElementById("table"+i);
        let split2 = split[i].split(":");
        let user = split2[0].toUpperCase();
        let score = split2[1];

        let firstStr = `<th>${user}</th>`;
        let secondStr = `<th>${score}</th>`;

        curRow.innerHTML = firstStr + secondStr;
    }
}

function getDisplayRawData() {
    Http.open("GET", displayURL);
    Http.send();

    let records = [];

    Http.onreadystatechange=(e)=>{
        // printToConsole(Http.responseText);
        writeToTable(Http.responseText);
    }
    return records;
}

let recs = getDisplayRawData();
// updateScore('baby',42);

