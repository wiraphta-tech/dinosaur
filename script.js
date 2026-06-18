const firebaseConfig = {
    apiKey: "AIzaSyCjh8yCOUTAG85vRKdjx7w8umXyJJKgW74",
    authDomain: "dinosaur-4884d.firebaseapp.com",
    databaseURL: "https://dinosaur-4884d-default-rtdb.firebaseio.com",
    projectId: "dinosaur-4884d",
    storageBucket: "dinosaur-4884d.firebasestorage.app",
    messagingSenderId: "683392133974",
    appId: "1:683392133974:web:de779bc3b49920ffe3c4f7",
    measurementId: "G-KGXHQ2ZKNV"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const lobby = document.getElementById("lobby");
const waitingScreen = document.getElementById("waitingScreen");
const gameContainer = document.getElementById("gameContainer");

const playerNameInput = document.getElementById("playerName");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");

const roomInput = document.getElementById("roomInput");

const roomInfo = document.getElementById("roomInfo");

const roomCodeDisplay =
document.getElementById("roomCodeDisplay");

const playerList =
document.getElementById("playerList");

const readyBtn =
document.getElementById("readyBtn");

const shareBox =
document.getElementById("shareBox");

const shareLink =
document.getElementById("shareLink");

const copyLinkBtn =
document.getElementById("copyLinkBtn");

const loading =
document.getElementById("loading");

let selectedAnimal = "🐶";

let roomId = null;

let playerId =
"p_" + Math.random().toString(36).substring(2, 10);

let playerName = "";

let roomRef = null;

let playerRef = null;

/* ==========================================
   Animal Select
========================================== */

document
.querySelectorAll(".animalBtn")
.forEach(btn => {

    btn.addEventListener("click", () => {

        document
        .querySelectorAll(".animalBtn")
        .forEach(b => b.classList.remove("selected"));

        btn.classList.add("selected");

        selectedAnimal =
        btn.dataset.animal;

    });

});

function generateRoomCode() {

    const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZ123456789";

    let code = "";

    for(let i = 0; i < 6; i++){

        code += chars[
            Math.floor(
                Math.random() * chars.length
            )
        ];

    }

    return code;

}

function getPlayerName() {

    const value =
    playerNameInput.value.trim();

    if(value.length < 2){

        alert("กรุณากรอกชื่อ");

        return null;
    }

    return value;

}

/* ==========================================
   Create Room
========================================== */

createRoomBtn.addEventListener("click", () => {

    playerName = getPlayerName();

    if(!playerName) return;

    roomId = generateRoomCode();

    roomRef =
    db.ref("rooms/" + roomId);

    roomRef.set({

        createdAt: Date.now(),

        status: "waiting",

        host: playerId,

        countdown: 0

    });

    joinRoom(roomId);

});

/* ==========================================
   Join Room Button
========================================== */

joinRoomBtn.addEventListener("click", () => {

    playerName = getPlayerName();

    if(!playerName) return;

    const code =
    roomInput.value
    .trim()
    .toUpperCase();

    if(code === ""){

        alert("กรุณากรอก Room");

        return;
    }

    joinRoom(code);

});

/* ==========================================
   Join Room Function
========================================== */

function joinRoom(code){

    roomId = code;

    roomRef =
    db.ref("rooms/" + roomId);

    roomRef.once("value")

    .then(snapshot => {

        if(!snapshot.exists()){

            alert("ไม่พบห้อง");

            return;
        }

        const playersRef =
        db.ref(
            "rooms/" +
            roomId +
            "/players"
        );

        playersRef.once("value")

        .then(playersSnap => {

            let total = 0;

            if(playersSnap.exists()){

                total =
                Object.keys(
                    playersSnap.val()
                ).length;

            }

            if(total >= 3){

                alert(
                    "ห้องเต็ม (สูงสุด 3 คน)"
                );

                return;
            }

            addPlayer();

        });

    });

}

/* ==========================================
   Add Player
========================================== */

function addPlayer(){

    playerRef = db.ref(
        "rooms/" +
        roomId +
        "/players/" +
        playerId
    );

    playerRef.set({

        id: playerId,

        name: playerName,

        animal: selectedAnimal,

        score: 0,

        time: 0,

        alive: true,

        ready: false,

        joinedAt: Date.now()

    });

    playerRef.onDisconnect().remove();

    enterWaitingRoom();

}

/* ==========================================
   Waiting Screen
========================================== */

function enterWaitingRoom(){

    lobby.classList.add("hidden");

    waitingScreen.classList.remove("hidden");

    roomCodeDisplay.innerHTML =
    "ROOM : " + roomId;

    const url =
    location.origin +
    location.pathname +
    "?room=" +
    roomId;

    shareLink.value = url;

    shareBox.classList.remove("hidden");

    listenPlayers();

}

/* ==========================================
   Copy Link
========================================== */

copyLinkBtn.addEventListener("click", () => {

    shareLink.select();

    document.execCommand("copy");

    alert("คัดลอกลิงก์แล้ว");

});

/* ==========================================
   Player List
========================================== */

function listenPlayers(){

    const playersRef =
    db.ref(
        "rooms/" +
        roomId +
        "/players"
    );

    playersRef.on("value", snapshot => {

        playerList.innerHTML = "";

        if(!snapshot.exists()) return;

        const players =
        snapshot.val();

        Object.values(players)

        .forEach(player => {

            const div =
            document.createElement("div");

            div.style.padding = "10px";

            div.style.marginBottom = "8px";

            div.style.borderRadius = "8px";

            div.style.background =
            player.ready
            ? "#b7efc5"
            : "#eeeeee";

            div.innerHTML = `
                ${player.animal}
                ${player.name}
                ${
                    player.ready
                    ? "✅ READY"
                    : "⌛ WAIT"
                }
            `;

            playerList.appendChild(div);

        });

        checkReadyStatus(players);

    });

}

/* ==========================================
   Ready Button
========================================== */

readyBtn.addEventListener("click", () => {

    if(!playerRef) return;

    playerRef.update({

        ready: true

    });

    readyBtn.disabled = true;

    readyBtn.innerHTML =
    "✅ READY";

});

/* ==========================================
   Auto Join From URL
========================================== */

window.addEventListener("load", () => {

    loading.style.display = "none";

    const params =
    new URLSearchParams(
        location.search
    );

    const room =
    params.get("room");

    if(room){

        roomInput.value =
        room.toUpperCase();

    }

});

/* ==========================================
   Start Game Trigger
   (Part 2 จะทำต่อ)
========================================== */

function checkReadyStatus(players){

    const list =
    Object.values(players);

    if(list.length < 2)
        return;

    const allReady =
    list.every(
        p => p.ready === true
    );

    if(allReady){

        roomRef.update({

            status: "countdown"

        });

    }

}

roomRefListener();

/* ==========================================
   Room Listener
========================================== */

function roomRefListener(){

    const interval =
    setInterval(() => {

        if(!roomId) return;

        clearInterval(interval);

        db.ref("rooms/" + roomId)

        .on("value", snapshot => {

            if(!snapshot.exists())
                return;

            const room =
            snapshot.val();

            if(
                room.status ===
                "countdown"
            ){

                if(
                    typeof startCountdown
                    === "function"
                ){

                    startCountdown();

                }

            }

        });

    },500);

}
const canvas =
document.getElementById("gameCanvas");

const ctx =
canvas.getContext("2d");

canvas.width = 1200;
canvas.height = 500;

/* ==========================================
   UI
========================================== */

const countdownEl =
document.getElementById("countdown");

const scoreEl =
document.getElementById("score");

const timeEl =
document.getElementById("time");

const mobileJump =
document.getElementById("mobileJump");

const jumpSound =
document.getElementById("jumpSound");

const gameOverSound =
document.getElementById("gameOverSound");

/* ==========================================
   Game Variables
========================================== */

let gameStarted = false;
let gameRunning = false;

let score = 0;
let survivalTime = 0;

let scoreTimer = null;
let timeTimer = null;

const gravity = 0.4;


let obstacles = [];

let obstacleSpeed = 3;

let obstacleSpawnTimer = 0;

/* ==========================================
   Countdown
========================================== */

function startCountdown(){

    if(gameStarted)
        return;

    gameStarted = true;

    waitingScreen.classList.add("hidden");

    countdownEl.style.display =
    "block";

    let count = 3;

    countdownEl.innerHTML = count;

    const timer =
    setInterval(() => {

        count--;

        if(count > 0){

            countdownEl.innerHTML =
            count;

        }
        else if(count === 0){

            countdownEl.innerHTML =
            "GO!";

        }
        else{

            clearInterval(timer);

            countdownEl.style.display =
            "none";

            startGame();

        }

    },1000);

}

/* ==========================================
   Start Game
========================================== */

function startGame(){

    gameContainer.classList
    .remove("hidden");

    gameRunning = true;

    score = 0;

    survivalTime = 0;

    obstacles = [];

    player.y = 350;

    player.velocityY = 0;

    scoreTimer =
    setInterval(() => {

        score++;

        scoreEl.innerHTML =
        score;

    },100);

    timeTimer =
    setInterval(() => {

        survivalTime++;

        timeEl.innerHTML =
        survivalTime;

    },1000);

    gameLoop();

}

/* ==========================================
   Jump
========================================== */

function jump(){

    if(!gameRunning)
        return;

    if(player.jumping)
        return;

    player.jumping = true;

    player.velocityY = -14;

    jumpSound.currentTime = 0;

    jumpSound.play();

}

/* ==========================================
   Controls
========================================== */

document.addEventListener(
"keydown",
e => {

    if(e.code === "Space"){

        e.preventDefault();

        jump();

    }

});

mobileJump.addEventListener(
"touchstart",
jump
);

mobileJump.addEventListener(
"click",
jump
);

/* ==========================================
   Spawn Obstacle
========================================== */

function spawnObstacle(){

    const size =
    40 + Math.random() * 25;

    obstacles.push({

        x: canvas.width + 50,

        y: 410,

        width: size,

        height: size

    });

}

/* ==========================================
   Draw Background
========================================== */

function drawGround(){

    ctx.fillStyle =
    "#8ecf5e";

    ctx.fillRect(
        0,
        450,
        canvas.width,
        50
    );

    ctx.fillStyle =
    "#6a994e";

    for(
        let i = 0;
        i < canvas.width;
        i += 40
    ){

        ctx.fillRect(
            i,
            450,
            20,
            8
        );

    }

}

/* ==========================================
   Draw Player
========================================== */

function drawPlayer(){

    ctx.font =
    "50px Arial";

    ctx.textAlign =
    "center";

    ctx.textBaseline =
    "middle";

    let animal =
    selectedAnimal || "🐶";

    ctx.fillText(

        animal,

        player.x +
        player.width / 2,

        player.y +
        player.height / 2

    );

}

/* ==========================================
   Draw Obstacles
========================================== */

function drawObstacles(){

    obstacles.forEach(obs => {

        ctx.font =
        "42px Arial";

        ctx.fillText(
            "🪨",
            obs.x,
            obs.y
        );

    });

}

/* ==========================================
   Update Physics
========================================== */

const groundY = 390;

const player = {

    x: 120,

    y: groundY,

    width: 60,

    height: 60,

    velocityY: 0,

    jumping: false

};

function updatePlayer(){

    if(player.velocityY < 0){
        player.velocityY += 0.35;
    }else{
        player.velocityY += 0.20;
    }

    if(player.velocityY > 4){
        player.velocityY = 4;
    }

    player.y += player.velocityY;

    if(player.y >= groundY){

        player.y = groundY;

        player.velocityY = 0;

        player.jumping = false;

    }

}


/* ==========================================
   Update Obstacles
========================================== */

function updateObstacles(){

    obstacleSpawnTimer++;

    if(
        obstacleSpawnTimer >
        150
    ){

        obstacleSpawnTimer = 0;

        spawnObstacle();

    }

    obstacles.forEach(obs => {

        obs.x -=
        obstacleSpeed;

    });

    obstacles =
    obstacles.filter(
        obs => obs.x > -100
    );

}

/* ==========================================
   Collision
========================================== */

function checkCollision(){

for(let obs of obstacles){

    const playerBox = {

        x: player.x + 10,
        y: player.y + 10,
        width: 40,
        height: 40

    };

    const rockBox = {

        x: obs.x,
        y: obs.y - 35,
        width: 35,
        height: 35

    };

    const hit =

        playerBox.x < rockBox.x + rockBox.width &&
        playerBox.x + playerBox.width > rockBox.x &&
        playerBox.y < rockBox.y + rockBox.height &&
        playerBox.y + playerBox.height > rockBox.y;

    if(hit){

        console.log("GAME OVER");

        gameOver();

        return;

    }

}


}


/* ==========================================
   Game Over
========================================== */

function gameOver(){

    gameRunning = false;

    clearInterval(scoreTimer);

    clearInterval(timeTimer);

    gameOverSound.currentTime = 0;

    gameOverSound.play();

    if(playerRef){

        playerRef.update({

            alive: false,

            score: score,

            time: survivalTime

        });

    }

    setTimeout(() => {

        gameContainer.classList
        .add("hidden");

        if(
            typeof showLeaderboard
            === "function"
        ){

            showLeaderboard();

        }

    },1500);

}

/* ==========================================
   Main Loop
========================================== */

function gameLoop(){

    if(!gameRunning)
        return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    drawGround();

    updatePlayer();

    updateObstacles();

    drawPlayer();

    drawObstacles();

    checkCollision();

    requestAnimationFrame(
        gameLoop
    );

}

/* ==========================================
   Leaderboard Elements
========================================== */

const leaderboard =
document.getElementById("leaderboard");

const resultList =
document.getElementById("resultList");

const playAgainBtn =
document.getElementById("playAgainBtn");

/* ==========================================
   Listen Players Realtime
========================================== */

function startRealtimeSync(){

    if(!roomId) return;

    const playersRef =
    db.ref(
        "rooms/" +
        roomId +
        "/players"
    );

    playersRef.on(
        "value",
        snapshot => {

        if(!snapshot.exists())
            return;

        const players =
        snapshot.val();

        updateRemoteScores(players);

        checkRoomFinished(players);

    });

}

/* ==========================================
   Update Score Realtime
========================================== */

function updateRemoteScores(players){

    let boardHTML = "";

    Object.values(players)

    .sort((a,b)=>
        (b.score || 0) -
        (a.score || 0)
    )

    .forEach(player => {

        boardHTML += `
        <div class="result-player">

            <b>
                ${player.animal}
                ${player.name}
            </b>

            <br>

            Score :
            ${player.score || 0}

            <br>

            Time :
            ${player.time || 0}s

            <br>

            ${
                player.alive
                ? "🟢 Alive"
                : "🔴 Dead"
            }

        </div>
        `;

    });

    resultList.innerHTML =
    boardHTML;

}

/* ==========================================
   Check All Dead
========================================== */

function checkRoomFinished(players){

    const list =
    Object.values(players);

    const alivePlayers =
    list.filter(
        p => p.alive === true
    );

    if(
        alivePlayers.length === 0
    ){

        setTimeout(() => {

            showLeaderboard();

        },1000);

    }

}

/* ==========================================
   Show Leaderboard
========================================== */

function showLeaderboard(){

    leaderboard.classList
    .remove("hidden");

    loadLeaderboard();

}

/* ==========================================
   Load Ranking
========================================== */

function loadLeaderboard(){

    const playersRef =
    db.ref(
        "rooms/" +
        roomId +
        "/players"
    );

    playersRef.once(
        "value"
    )

    .then(snapshot => {

        if(!snapshot.exists())
            return;

        const players =
        Object.values(
            snapshot.val()
        );

        players.sort(
            (a,b) =>
            (b.score || 0) -
            (a.score || 0)
        );

        resultList.innerHTML = "";

        players.forEach(
        (player,index) => {

            let medal = "🎖️";

            if(index === 0)
                medal = "🥇";

            if(index === 1)
                medal = "🥈";

            if(index === 2)
                medal = "🥉";

            const div =
            document.createElement(
                "div"
            );

            div.className =
            "result-player";

            div.innerHTML = `

                <h3>
                    ${medal}
                    #${index+1}
                </h3>

                <p>
                    ${player.animal}
                    ${player.name}
                </p>

                <p>
                    Score :
                    ${player.score}
                </p>

                <p>
                    Time :
                    ${player.time}s
                </p>

            `;

            resultList
            .appendChild(div);

        });

        saveHighScore(players);

    });

}

/* ==========================================
   Save High Score
========================================== */

function saveHighScore(players){

    if(players.length === 0)
        return;

    const winner =
    players[0];

    db.ref("highscores")
    .push({

        name:
        winner.name,

        animal:
        winner.animal,

        score:
        winner.score,

        time:
        winner.time,

        createdAt:
        Date.now()

    });

}

/* ==========================================
   Play Again
========================================== */

playAgainBtn.addEventListener(
"click",
() => {

    resetCurrentPlayer();

});

/* ==========================================
   Reset Current Player
========================================== */

function resetCurrentPlayer(){

    if(!playerRef)
        return;

    playerRef.update({

        score: 0,

        time: 0,

        alive: true,

        ready: false

    });

    leaderboard.classList
    .add("hidden");

    readyBtn.disabled =
    false;

    readyBtn.innerHTML =
    "✅ READY";

    gameStarted =
    false;

    roomRef.update({

        status:
        "waiting"

    });

    waitingScreen.classList
    .remove("hidden");

}

/* ==========================================
   Sync Score During Game
========================================== */

setInterval(() => {

    if(
        !gameRunning ||
        !playerRef
    )
        return;

    playerRef.update({

        score:
        score,

        time:
        survivalTime

    });

},1000);

/* ==========================================
   Host Auto Start
========================================== */

function startRoomListeners(){

    if(!roomId)
        return;

    roomRef =
    db.ref(
        "rooms/" +
        roomId
    );

    roomRef.on(
        "value",
        snapshot => {

        if(!snapshot.exists())
            return;

        const room =
        snapshot.val();

        if(
            room.status ===
            "countdown"
        ){

            if(
                !gameStarted
            ){

                startCountdown();

            }

        }

    });

}

/* ==========================================
   Highscore Listener
========================================== */

function loadGlobalHighscores(){

    db.ref("highscores")

    .limitToLast(20)

    .once("value")

    .then(snapshot => {

        if(!snapshot.exists())
            return;

        console.log(
            "Highscores",
            snapshot.val()
        );

    });

}

/* ==========================================
   Auto Start
========================================== */

window.addEventListener(
"load",
() => {

    startRealtimeSync();

    startRoomListeners();

    loadGlobalHighscores();

});

/* ==========================================
   Clean Disconnect
========================================== */

window.addEventListener(
"beforeunload",
() => {

    if(playerRef){

        playerRef.remove();

    }

});

/* ==========================================
   Optional:
   Remove Empty Rooms
========================================== */

function cleanupRoom(){

    const playersRef =
    db.ref(
        "rooms/" +
        roomId +
        "/players"
    );

    playersRef.once(
        "value"
    )

    .then(snapshot => {

        if(
            !snapshot.exists()
        ){

            db.ref(
                "rooms/" +
                roomId
            ).remove();

        }

    });

}
setTimeout(() => {

    if(roomId){

        startRealtimeSync();

        startRoomListeners();

    }

},2000);