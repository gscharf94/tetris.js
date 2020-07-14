function sortArray(arr) {
    let i, j;
    for(i = 0; i < arr.length; i++) {
        let smallest = arr[i].split(":")[1];
        let smallestIndex = i;
        for(j = i + 1; j < arr.length; j++) {
            let test = arr[j].split(":")[1];
            if(parseInt(test) < parseInt(smallest)) {
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