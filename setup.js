/// Dial stuff



// Maps the numbers to the display configuration of the 7 segment display
const DEFAULT_MAP = {
    0: [1, 1, 1, 1, 1, 1, 0],
    1: [0, 1, 1, 0, 0, 0, 0],
    2: [1, 1, 0, 1, 1, 0, 1],
    3: [1, 1, 1, 1, 0, 0, 1],
    4: [0, 1, 1, 0, 0, 1, 1],
    5: [1, 0, 1, 1, 0, 1, 1],
    6: [1, 0, 1, 1, 1, 1, 1],
    7: [1, 1, 1, 0, 0, 0, 0],
    8: [1, 1, 1, 1, 1, 1, 1],
    9: [1, 1, 1, 1, 0, 1, 1]
};

// Sets the segments of the dial corresponding to displayName with the 7 segments as above.
function setSegments(segments, displayName) {
    const segmentElems = document.querySelectorAll('#' + displayName + ' .segment');
    segmentElems.forEach((el, i) => {
        if (segments[i]) {
            el.classList.add('on');
        } else {
            el.classList.remove('on');
        }
    });
}


/// End of dial stuff

const NUM_DIALS = 4;

// Some RNG stuff
function splitmix32(a) {
    let t = a ^ a >>> 16;
    t = Math.imul(t, 0x21f0aaad);
    t = t ^ t >>> 15;
    t = Math.imul(t, 0x735a2d97);
    return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
}

// Gets the number of days since epoch. This is the random seed of today's puzzle
function getSeed() {
    var now = new Date();
    var fullDaysSinceEpoch = Math.floor(now) / 8.64e7;
    return fullDaysSinceEpoch;
}

function rng(seed) {
    const x = splitmix32(seed);
    const nextSeed = seed + 0x9e3779b9 | 0;

    return { value: x, nextSeed: nextSeed};
}

// Gets the segments which are broken
function getBrokenSegments(seed) {
    // Initialize a list with 7 zeros
    const brokenSegments = Array(7).fill(0);

    for (let i = 0; i < 7; i++) {
        const result = rng(seed);
        brokenSegments[i] = parseInt(result.value * NUM_DIALS); // Use the random value
        seed = result.nextSeed; // Update the seed locally
    }

    return {segments: brokenSegments, nextSeed: seed};
}

function getNewMap(dialNumber, randomState) {
    var newMap = structuredClone(DEFAULT_MAP);

    for (var i = 0; i < randomState.length; i++) {
        var num = randomState[i];

        // If this is the dial we are modifying then flip
        if (num == dialNumber) {
            for (var j = 0; j < 10; j++) {
                newMap[parseInt(j)][i] = newMap[parseInt(j)][i] === 1 ? 0 : 1;
            }
        }
    }

    return newMap;
}

function getDigits(num) {
    const digits = num.toString().split('').map(Number);
    while (digits.length < NUM_DIALS) {
        digits.unshift(0);
    }
    return digits;
}

function arrayToNumber(arr) {
    return parseInt(arr.join(''), 10);
}

function setUnbrokenDial(num) {
    const arr = getDigits(num)
    setSegments(DEFAULT_MAP[arr[0]], "unbroken0");
    setSegments(DEFAULT_MAP[arr[1]], "unbroken1");
    setSegments(DEFAULT_MAP[arr[2]], "unbroken2");
    setSegments(DEFAULT_MAP[arr[3]], "unbroken3");
}

function setBrokenDial(num, map) {
    const arr = getDigits(num);

    setSegments(map[0][arr[0]], "broken0");
    setSegments(map[1][arr[1]], "broken1");
    setSegments(map[2][arr[2]], "broken2");
    setSegments(map[3][arr[3]], "broken3");
}

function updateMoves() {
    moves += 1;
    const submitButton = document.getElementById("submit");
    submitButton.textContent = `Submit | Moves: ${moves}`;
  }

function increaseVal(currentVal, buttonNum, map=null) {
    var arr = getDigits(currentVal);

    arr[buttonNum] = (arr[buttonNum] + 1) % 10;

    var x = arrayToNumber(arr);

    if (map != null) {
        setBrokenDial(x, map);
        updateMoves();
    } else {
        setUnbrokenDial(x);
    }
    return x;
}


function decreaseVal(currentVal, buttonNum, map=null) {
    var arr = getDigits(currentVal);

    arr[buttonNum] = arr[buttonNum] - 1;

    if (arr[buttonNum] === -1) {
        arr[buttonNum] = 9;
    } else {
        arr[buttonNum] = Math.abs(arr[buttonNum]) % 10;
    }

    var x = arrayToNumber(arr);

    if (map != null) {
        setBrokenDial(x, map);
        updateMoves();
    } else {
        setUnbrokenDial(x);
    }
    
    return x; 
}

function submit(broken, unbroken) {
    if (broken === unbroken) {
        alert("Solved in " + moves + " moves!");
    } else {
        alert("Incorrect - 5 added to move counter!");
        for (var i = 0; i < 5; i++) {
            updateMoves();
        }
    }
}