var canvas = document.getElementById("chase");
var ctx = canvas.getContext("2d"); //context of canvas 'chase'
var info = document.getElementById("info");
var context = info.getContext("2d"); //context of canvas 'info'
var l = canvas.width; //width of the canvas
var paths = []; //array of traversable paths
var circles = [[25, 25]]; //array of green dots
var cx = 25, cy = 25; //co-ordinates of the chaser(red dot)
var dx = -25, dy = -25; //co-ordinates of the dodger(blue dot)

var level = 1; //level
var lives = Math.round(level * 1.5); //number of lives left
var score = 0; //current score
var hscore = 0; //high-score

//checking for stored cookies
if(getCookie("level") != "" && getCookie("level") != null)
    level = getCookie("level");

if(getCookie("lives") != "" && getCookie("lives") != null)
    lives = getCookie("lives");

if(getCookie("score") != "" && getCookie("score") != null)
    score = getCookie("score");

if(getCookie("hscore") != "" && getCookie("hscore") != null)
    hscore = getCookie("hscore");

var duration = 100; //decides how often the red dot changes its position
var death = true; //decides whether the player loses a life when caught
var play = false; //playing/pausing the game
var chase = false; //decides if the red dot can chase the blue dot

//sounds
var blop = new Audio(), level_up = new Audio(), game_over = new Audio(), bgmusic = new Audio();

//initializing the 'paths' array
for (var i = 25; i <= l - 25; i += 25) {
    paths.push([i, 25, i, l- 25]);
    paths.push([25, i, l - 25, i]);
}

window.onload = function () {
    blop = new Audio("assets/audio/blop.mp3");
    level_up = new Audio("assets/audio/level_up.mp3");
    game_over = new Audio("assets/audio/game_over.mp3");
    bgmusic = new Audio("assets/audio/background_music.mp3");
    init();
    playGame(); //starts the game
};

//pauses the game automatically when the document is not in focus
document.body.onblur = function() {
    if(play == false) {
        play = false;
        play_pause();
    }
};

//initializes the game
function init() {
    clear();
    background();
    bgmusic.play();
    dx = -25;
    dy = -25;
    chase = false;

    //draws the information on the 'info' canvas
    context.textAlign = "center";
    context.font = "25px Arial";
    context.strokeStyle = "dodgerblue";
    context.fillStyle = "lightblue";
    context.strokeText("SCORE", 100, 25);
    context.strokeText("LEVEL", l / 2, 25);
    context.strokeText("LIVES", l - 100, 25);
    context.textAlign = "left";
    drawText(score, 160);
    drawText(level, l / 2 + 60);
    drawText(lives, l - 40);
}

//draws the background
function background() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, l, l);
    ctx.strokeStyle = "dimgray";
    for (var i = 0; i < paths.length; i++) {
        ctx.moveTo(paths[i][0], paths[i][1]);
        ctx.lineTo(paths[i][2], paths[i][3]);
    }
    ctx.stroke();
    ctx.closePath();
}

//clears the canvas
function clear() {
    ctx.clearRect(0, 0, l, l);
    ctx.beginPath();
}

//draws a circles of the specified color at (x, y)
function drawCircle(x, y, color) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, 10, 0, 2 * Math.PI);
    ctx.strokeStyle = "black";
    ctx.fillStyle = color;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

//draws text on the 'info' canvas
function drawText(text, start_pt) {
    context.clearRect(start_pt - 10, 0, context.measureText(99999999).width, 50);
    context.fillText(text, start_pt, 25);
}

//sets a cookie with a name 'cname' to a value 'cvalue', expiring in 'exdays' days
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

//returns the value of a cookie with the name 'cname'
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1);

        if (c.indexOf(name) == 0)
            return c.substring(name.length, c.length);
    }
    return "";
}


//returns true if there are no duplicates of an element 'elem' in the array 'array'
function noDuplicates(array, elem) {
    var no_dup = true;
    for(var i = 0; i < array.length; i++) {
        if(array[i][0] == elem[0] && array[i][1] == elem[1]) {
                no_dup = false;
                break;
        }
    }
    return no_dup;
}

//checks if a point (x, y), moving in the direction 'dir' is on track
function isOnTrack(x, y, dir) {
    switch(dir) {
        case "l": x -= 25;
            break;
        case "r": x += 25;
            break;
        case "u": y -= 25;
            break;
        case "d": y += 25;
            break;
    }

    var onTrack = false;

    for(var i = 0; i < paths.length; i++) {
        if(onLine(x, y, paths[i][0], paths[i][1], paths[i][2], paths[i][3]))
            onTrack = true;
    }

    return onTrack;
}

//returns the distance between two points (x1, y1) and (x2, y2)
function distance(x1, y1, x2, y2) {
    return (Math.sqrt( Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
}

//checks if a given point (a, b) is on a line passing from (x1, y1) to (x2, y2)
function onLine(a, b, x1, y1, x2, y2) {
    return (distance(x1, y1, x2, y2) == distance(a, b, x2, y2) + distance(a, b, x1, y1));
}

//returns the move that will take a point (x, y) closest to another point (a, b)
function bestMove(x, y, a, b) {
    var dx = x - a; //distance along the x-axis
    var dy = y - b; //distance along the y-axis
    var move; //the best move

    //if the distance along the y-axis is shorter
    if ((Math.abs(dx) > Math.abs(dy) && dy != 0) || dx == 0) {
        if (dy > 0) {
            move = "u"; //move up
        }
        else if (dy < 0) {
            move = "d"; //move down
        }
    }

    //is the distance along the x-axis is shorter
    if ((Math.abs(dy) > Math.abs(dx) && dx != 0) || dy == 0) {
        if (dx > 0) {
            move = "l"; //move left
        }
        else if (dx < 0) {
            move = "r"; //move right
        }
    }

    //if the distances along both axes are equal
    if (dx == dy) {
        if (dx == 0 && dy == 0 && death == true) {
            lose();
            if(lives == 1)
                return[25, 25, "u"]; //reset the position of the chaser
        }
        else if (dx > 0)
            move = "l";
        else if (dy > 0)
            move = "u";
        else if (dx < 0)
            move = "r";
        else if (dy < 0)
            move = "d";
    }

    switch (move) {
        case "u":
            y -= 25;
            break;
        case "d":
            y += 25;
            break;
        case "l":
            x -= 25;
            break;
        case "r":
            x += 25;
            break;
    }
    return [x, y, move];
}