function lose() {
    stopGame();
    bgmusic.pause();
    drawCircle(cx, cy, "red");
    lives--;
    if (lives == 0) {
        if (level > 1) {
            if(score > level * 100)
                score -= level * 100;
            alert("You lost level " + level);
			drawCircle(cx, cy, "green");
            level--; //demotes the player to the previous level
        }
        else if (level == 1) {
            alert("Game Over.");
			drawCircle(cx, cy, "green");
            level = 1;
            score = 0; //restarts level 1
        }

        lives = Math.round(level * 1.5); //re-initializes the number of lives left
        circles = [[25, 25]]; //re-initializes the number of green dots
        cx = 25; cy = 25; //resets the position of the chaser
    }
    else {
        if(score > 50)
            score -= 50;
        alert("Caught!");
    }

    game_over.play();
    //resets the cookies
    setCookie("level", level, 1);
    setCookie("lives", lives, 1);
    setCookie("score", score, 1);
    //redraws the data
    drawText(score, 160);
    drawText(level, l / 2 + 60);
    drawText(lives, l - 40);
    document.getElementById("hscore").innerHTML = "HIGH-SCORE: " + hscore;

    init();
    //draws the green dots
    for (var i = 0; i < circles.length; i++) {
        drawCircle(circles[i][0], circles[i][1], "green");
    }
    drawCircle(cx, cy, "red");
    play = false;
    play_pause(); //pauses the game
}

function win() {
    alert("You won level " + level + "!");

    level++;
    lives = Math.round(level * 1.5); //sets the values

    setCookie("level", level, 1);
    setCookie("lives", lives, 1); //stores the values as cookies

    drawText(level, l / 2 + 60);
    drawText(lives, l - 40); //displays the values

    level_up.play();
    circles = [[25, 25]]; //resets the array of green dots
    init();
    cx = 25; cy = 25; //resets the position of the chaser(red dot)
    drawCircle(cx, cy, "red");
    play = false;
    play_pause();
}

var mx = -25, my = -25; //co-ordinates of the mouse-pointer
function mouseMove(evt) {
    var rect = canvas.getBoundingClientRect(); //rectangle bounding the canvas
    mx = evt.clientX - rect.left; //x co-ordinate of the mouse-pointer
    my = evt.clientY - rect.top;  //y co-ordinate of the mouse-pointer

    if ((mx >= 25 && mx <= l - 25) && (my >= 25 && my <= l - 25)) {
        if(chase == false)
            chase = true; //allows the chaser(red dot) to start chasing the dodger(blue dot)

        drawCircle(dx, dy, "green"); //re-draws the dodger in green

        //adjusts the co-ordinates to join the nearest intersection
        if (mx % 25 != 0) {
            (mx % 25 <= 12)  ? mx -= mx % 25 : mx += 25 - (mx % 25);

        }
        if (my % 25 != 0) {
            if (my % 25 <= 12) my -= my % 25;
            else my += 25 - (my % 25);
        }

        dx = mx;
        dy = my;
        drawCircle(dx, dy, "blue");

        if (noDuplicates(circles, [dx, dy])) {
            //adds the co-ordinates of the blue dot(dodger) to the array of green dots
            circles.push([dx, dy]);
            blop.play();
            //increases the score
            score = Number(score);
            score = Number(score) + Number(Math.round(lives / 2));

            //displays and stores the score data
            drawText(score, 160);
            setCookie("score", score, 1);
            if(hscore < score) {
                hscore = score;
                document.getElementById("hscore").innerHTML = "HIGH-SCORE: " + hscore;
                setCookie("hscore", hscore, 9999999999);
            }
        }
    }
}

init();
function game() {
    drawCircle(cx, cy, "green"); //re-draws the chaser in green

    for(var i = 0; i < level; i++) {
        if(chase == true) {
            var move = bestMove(cx, cy, dx, dy);
            if (isOnTrack(cx, cy, move[2])) {
                cx = move[0];
                cy = move[1];
            }
        }
    }
    drawCircle(cx, cy,"red");

    if(noDuplicates(circles, [cx, cy])) {
        //adds the co-ordinates of the red dot(chaser) to the array of green dots
        circles.push([cx, cy]);
        blop.play();
    }

    if(circles.length >= 576) {
        //proceeds to the next level
        bgmusic.pause();
        win();
    }
}

var play_game; //stores the interval
function  playGame() {
    clear();
    background();
    for(var i = 0; i < circles.length; i++) {
        drawCircle(circles[i][0], circles[i][1], "green");
    } //places the green dots

    drawCircle(cx, cy, "red");
    drawCircle(dx, dy, "blue"); //draws the chaser and dodger

    bgmusic.play();
    level_up.play();

    //listens for event mouse-movement
    canvas.addEventListener("mousemove", mouseMove, false);

    play_game = setInterval(function() {
		game();
	}, duration);
}

function stopGame() {
    clearInterval(play_game);
    //stops listening for mouse-movement
    canvas.removeEventListener("mousemove", mouseMove, false);
    bgmusic.pause();
}

function pauseGame() {
    stopGame();
    ctx.globalAlpha = 0.5; //reduces opacity to 50%
    ctx.fillStyle = "gray";
    ctx.fillRect(0, 0, l, l);
    ctx.globalAlpha = 1; //changes opacity back to 100%
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Game Paused", l / 2, l / 2);
    bgmusic.pause();
}

//plays/pauses the game
function play_pause() {
    stopGame();
    play ? playGame() : pauseGame();
    play = !play;
    document.getElementById("button").innerHTML = play ? "PLAY" : "PAUSE";
}