const ws = new WebSocket("wss://battleship-production-5a6e.up.railway.app");
const URL = "https://battleship-production-5a6e.up.railway.app/";
var canvas = document.getElementById("canvas");
var ctx;
ws.addEventListener("open", () => {
  console.log("client connected");
});

Vue.createApp({
  data() {
    return {
      debug: true,
      canvas: 0,
      page: 1,
      username: "",
      player_turn: 0,
      userRequired: false,
      backgroundAudio: new Audio("/sound/background.mp3"), // Replace with the path to your audio file
      isAudioPlaying: false,
      musicToggle: false,
      audioVolume: 0.05,
      UserChat: [],
      UserInput: "",
      player: "",
      GameIndex: -1,
      modal: false,
      gameObj: 0,
      GameOver: false,
      settingShips: true,
      game_Object: {},
      updated: false,
      status: "Place Your Ships",
      displayBoard: [this.player, [], "", true],
      cords: [],
      codeGameToggle: false,
      gameCode: "",
      win: false,
    };
  },
  mounted() {
    this.canvas = document.getElementById("canvas");
    document.addEventListener("keydown", (e) => {
      if (e.key == "r") {
        const draggingShip = this.gameObj.player.ships.find(
          (ship) => ship.isDragging
        );

        // If a dragging ship is found, toggle its rotation
        if (draggingShip) {
          draggingShip.changeXY(e);
          draggingShip.rotation = !draggingShip.rotation;
          this.gameObj.player.insertShips(); // Update the board with the new location after rotation change
          this.gameObj.drawGrid(); // Redraw the grid
          this.gameObj.player.draw();
        }
      }
    });

    document.addEventListener("mouseup", (e) => {
      if (
        this.game_Object.turn == this.player &&
        this.updated &&
        this.player != this.displayBoard[0]
      ) {
        this.attack(e);
      }
    });

    // Start playing the audio when the Vue instance is mounted
    if (this.page === 3) {
      this.loadCanvas();
    }
  },
  methods: {
    // Add this method inside the Vue component

    GameOver: function () {
      if (GameOver == true && player_turn == 1) {
      }
      if (GameOver == true && player_turn == 0) {
        // emit
      } else {
        console.log("thats invalid");
      }
    },
    loadCanvas: function () {
      var game;
      console.log(this.canvas);
      var canvas = this.canvas;
      // window.addEventListener("load", function () {
      canvas.width = 800;
      canvas.height = 500;
      canvas.style.border = "5px solid #743b16";
      var ctx = this.canvas.getContext("2d");
      var game_Object = this.game_Object;
      var displayBoard = this.displayBoard;

      window.onresize = function () {
        game.render();
      };

      class Game {
        constructor() {
          this.canvas = canvas;
          this.width = canvas.width;
          this.height = canvas.height;
          this.displayBoard = displayBoard;
          this.topMargin = 260;
          this.winner = null;
          this.debug = true;
          this.player = new Player(this, game_Object, displayBoard);
          this.mouse = {
            x: this.width * 0.5,
            y: this.height * 0.5,
            pressed: false,
          };
          this.gridHeight = canvas.height;
          this.gridSize = 10;
          this.cellSize = this.gridHeight / this.gridSize;
          this.gridWidth = this.cellSize * this.gridSize;
        }
        gridLines = () => {
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#743b16";
          for (var row = 0; row < this.gridSize; row++) {
            for (var col = 0; col < this.gridSize; col++) {
              ctx.beginPath();
              ctx.strokeRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
              );
              ctx.stroke();

              // Draw the player's board
              // 1 = miss(yellow), 2 = revealed(orange), 3 = hit(red), 4 = sunk(dark red)
              var board = [
                [1, 0, 0, 2, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 2, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 2, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 3, 3, 3, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [1, 0, 4, 4, 4, 4, 0, 0, 0, 0],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              ];
              if (!this.displayBoard[3]) {
                const cellStatus = this.displayBoard[1][row][col];
                if (cellStatus === 1) {
                  // Miss (yellow)
                  ctx.fillStyle = "yellow";
                  ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                  );
                } else if (cellStatus === 2) {
                  // Revealed (orange)
                  ctx.fillStyle = "orange";
                  ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                  );
                } else if (cellStatus === 3) {
                  // Hit (red)
                  ctx.fillStyle = "red";
                  ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                  );
                } else if (cellStatus === 4) {
                  // Sunk (dark red)
                  ctx.fillStyle = "darkred";
                  ctx.fillRect(
                    col * this.cellSize,
                    row * this.cellSize,
                    this.cellSize,
                    this.cellSize
                  );
                }
              }
            }
          }
        };

        drawGrid = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.gridLines();
          this.player.draw();

          canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const row = Math.floor(y / this.cellSize);
            const col = Math.floor(x / this.cellSize);

            // Clear previous highlight
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw grid
            this.gridLines();
            // console.log(this.displayBoard[1]);

            if (row < this.gridSize && col < this.gridSize) {
              ctx.fillStyle = "rgba(0, 0, 255, 0.2)";
              ctx.fillRect(
                col * this.cellSize,
                row * this.cellSize,
                this.cellSize,
                this.cellSize
              );
            }

            this.player.draw();
          });

          canvas.addEventListener("mousedown", (e) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.gridLines();
            this.player.draw();
          });

          canvas.addEventListener("mouseup", (e) => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.gridLines();
            this.player.draw();
          });
        };
        render() {
          this.player.draw();
          this.drawGrid();
        }
      }

      class Player {
        constructor(game, game_Object, displayBoard) {
          this.game_Object = game_Object;
          this.displayBoard = displayBoard;
          this.game = game;
          this.username = { username: "" };
          this.ships = [];
          this.parrot = true; //parrot sprite width and height 90, 65
          //kraken sprite width and height 95, 75
          this.board = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          ];
        }

        createShips() {
          //spriteX spriteY spriteWidth spriteHeight x y width height spriteXR SPRITEYR SPRITEWIDTHR SPRITEHEIGHTR WidthR HeightR
          let ship5 = new Ship(
            5,
            this,
            100,
            70,
            80,
            200,
            this.game.width - 90,
            this.game.height - 360,
            90,
            260,
            67,
            541,
            194,
            71,
            260,
            90
          );
          this.ships.push(ship5);

          let ship4 = new Ship(
            4,
            this,
            250,
            70,
            100,
            160,
            this.game.width - 170,
            this.game.height - 360,
            100,
            205,
            67,
            387,
            157,
            75,
            205,
            100
          );
          this.ships.push(ship4);

          let ship4_2 = new Ship(
            4,
            this,
            250,
            70,
            100,
            160,
            this.game.width - 250,
            this.game.height - 360,
            100,
            205,
            67,
            387,
            157,
            75,
            205,
            100
          );
          this.ships.push(ship4_2);

          let ship3 = new Ship(
            3,
            this,
            40,
            50,
            60,
            150,
            this.game.width - 160,
            0,
            100,
            170,
            50,
            623,
            134,
            58,
            170,
            100
          );
          this.ships.push(ship3);

          let ship3_2 = new Ship(
            3,
            this,
            40,
            50,
            60,
            150,
            this.game.width - 90,
            0,
            100,
            170,
            50,
            623,
            134,
            58,
            170,
            100
          );
          this.ships.push(ship3_2);

          let ship2 = new Ship(
            2,
            this,
            190,
            75,
            60,
            80,
            this.game.width - 240,
            40,
            90,
            125,
            77,
            477,
            66,
            50,
            125,
            90
          );
          this.ships.push(ship2);
        }

        draw() {
          if (
            this.game_Object.player == this.displayBoard[0] ||
            this.displayBoard[3]
          ) {
            for (let ship of this.ships) {
              ship.draw();
            }
          }
        }

        insertShips() {
          const gridSize = this.game.gridSize - 1;

          // Clear the board
          for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
              this.board[i][j] = 0;
            }
          }

          // Loop through each ship and update the board with its position
          for (let ship of this.ships) {
            // Calculate the starting grid coordinates based on the ship's position
            const startGridX = ship.col;
            const startGridY = ship.row;

            // Depending on the ship's orientation, set the corresponding cells on the board to the ship's type (e.g., 5 for ship5, 4 for ship4, etc.)
            if (ship.rotation) {
              for (let i = 0; i < ship.type; i++) {
                if (startGridX + i < gridSize && startGridY < gridSize) {
                  this.board[startGridY][startGridX + i] = 5;
                  ship.location.push([startGridY, startGridX + i]);
                }
              }
            } else {
              for (let i = 0; i < ship.type; i++) {
                if (startGridY + i < gridSize && startGridX < gridSize) {
                  this.board[startGridY + i][startGridX] = 5;
                  ship.location.push([startGridY + i, startGridX]);
                }
              }
            }
          }
        }

        insertParrot(coordinates) {
          if (this.parrot == true) {
            hover = [
              this.board[coordinates[0]][coordinates[1]],
              this.board[coordinates[0 + 1]][coordinates[1]],
              this.board[coordinates[0]][coordinates[1 + 1]],
              this.board[coordinates[0 + 1]][coordinates[1 + 1]],
            ];
            for (i in hover) {
              if (i == 5) {
                i = 2;
                i.classList.add(".hit");
              }
              if (i == 0) i = 1;
              i.classList.add(".revealed");
            }
          }
        }
        allSet() {
          for (let ship of this.ships) {
            if (!ship.set) return false;
          }
          return true;
        }

        setAllShips() {
          for (let ship of this.ships) {
            ship.allSet = true;
          }
        }
      }

      class Ship {
        constructor(
          type,
          player,
          spriteX,
          spriteY,
          spriteWidth,
          spriteHeight,
          x,
          y,
          width,
          height,
          spriteXR,
          spriteYR,
          spriteWidthR,
          spriteHeightR,
          widthR,
          heightR
        ) {
          //spriteX spriteY spriteWidth spriteHeight x y width height spriteXR SPRITEYR SPRITEWIDTHR SPRITEHEIGHTR WidthR HeightR
          this.player = player;
          this.rotation = false;
          this.location = [];
          this.sunk = false;
          this.type = type;
          this.image = document.getElementById("ship");
          this.imageR = document.getElementById("shipR");
          this.spriteX = spriteX;
          this.spriteY = spriteY;
          this.spriteWidth = spriteWidth;
          this.spriteHeight = spriteHeight;
          this.x = x;
          this.y = y;
          this.width = width;
          this.height = height;
          this.spriteXR = spriteXR;
          this.spriteYR = spriteYR;
          this.spriteWidthR = spriteWidthR;
          this.spriteHeightR = spriteHeightR;
          this.widthR = widthR;
          this.heightR = heightR;
          this.mX = x;
          this.mY = y;
          this.row;
          this.col;
          this.set = false;
          this.allSet = false;
          this.isDragging = false;
          this.startX = 0;
          this.startY = 0;
          this.shipStatus = false;
          this.mouseDownTimeout;

          canvas.addEventListener("mousedown", this.handleMouseDown.bind(this));
          canvas.addEventListener("mousemove", this.handleMouseMove.bind(this));
          canvas.addEventListener("mouseup", this.handleMouseUp.bind(this));
        }

        resetShip() {
          if (!this.allSet) {
            this.rotation = false;
            this.x = this.mX;
            this.y = this.mY;
            this.player.insertShips();
            this.draw();
            this.player.game.drawGrid();
          }
        }

        changeXY(e) {
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (this.rotation) {
            this.x = x;
            this.y = y - this.height / 2;
          } else {
            this.y = y;
            this.x = x - this.width / 2;
          }
        }

        // Handle drag and drop for ships
        handleMouseDown(e) {
          this.mouseDownTimeout = setTimeout(() => {
            if (this.allSet) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (this.rotation) {
              if (
                x >= this.x &&
                x < this.x + this.widthR &&
                y >= this.y &&
                y < this.y + this.heightR
              ) {
                this.x = x;
                this.y = y - this.heightR / 2;
                this.shipStatus = true;
                this.startX = x - this.x;
                this.startY = y - this.y;
                this.player.draw();
                this.draw();
                return;
              }
            } else {
              if (
                x >= this.x &&
                x < this.x + this.width &&
                y >= this.y &&
                y < this.y + this.height
              ) {
                this.y = y;
                this.x = x - this.width / 2;
                this.shipStatus = true;
                this.startX = x - this.x;
                this.startY = y - this.y;
                this.player.draw();
                this.draw();
                return;
              }
            }
          }, 200);
        }

        handleMouseMove(e) {
          if (this.allSet) return;
          const rect = canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (this.isDragging || this.shipStatus) {
            this.x = x - this.startX;
            this.y = y - this.startY;
            return;
          }
        }

        handleMouseUp(e) {
          clearTimeout(this.mouseDownTimeout);
          if (this.allSet) return;
          if (!this.isDragging && !this.shipStatus) {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            if (this.rotation) {
              if (
                x >= this.x &&
                x < this.x + this.widthR &&
                y >= this.y &&
                y < this.y + this.heightR
              ) {
                this.x = x;
                this.y = y - this.heightR / 2;
                this.isDragging = true;
                this.startX = x - this.x;
                this.startY = y - this.y;
                this.player.draw();
                this.draw();
                return;
              }
            } else {
              if (
                x >= this.x &&
                x < this.x + this.width &&
                y >= this.y &&
                y < this.y + this.height
              ) {
                this.y = y;
                this.x = x - this.width / 2;
                this.isDragging = true;
                this.startX = x - this.x;
                this.startY = y - this.y;
                this.player.draw();
                this.draw();
                return;
              }
            }
          }
          if (this.isDragging || this.shipStatus) {
            this.isDragging = false;
            this.shipStatus = false;
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            const gridX = Math.floor(mouseX / this.player.game.cellSize);
            const gridY = Math.floor(mouseY / this.player.game.cellSize);

            // Check if the ship is within the grid
            if (
              gridX >= 0 &&
              gridX < this.player.game.gridSize &&
              gridY >= 0 &&
              gridY < this.player.game.gridSize
            ) {
              if (this.rotation) {
                if (gridX + this.type <= this.player.game.gridSize) {
                  this.x = gridX * this.player.game.cellSize;
                  this.y =
                    gridY * this.player.game.cellSize -
                    this.player.game.cellSize / 2;
                  this.row = gridY;
                  this.col = gridX;

                  // Update the board with the new location
                  this.player.insertShips();

                  this.set = true;
                  this.player.game.drawGrid();
                  this.draw();
                } else {
                  this.set = false;
                  this.resetShip();
                  this.player.game.drawGrid();
                  this.draw();
                }
              } else if (!this.rotation) {
                if (gridY + this.type <= this.player.game.gridSize) {
                  this.x =
                    gridX * this.player.game.cellSize -
                    this.player.game.cellSize / 3;
                  this.y = gridY * this.player.game.cellSize;

                  this.row = gridY;
                  this.col = gridX;

                  // Update the board with the new location
                  this.player.insertShips();

                  this.set = true;
                  this.player.game.drawGrid();
                  this.draw();
                } else {
                  this.set = false;
                  this.resetShip();
                  this.player.game.drawGrid();
                  this.draw();
                }
              } else {
                this.set = false;
                this.resetShip();
                this.player.game.drawGrid();
                this.draw();
              }
              return;
            }
          }
        }

        draw() {
          //spriteX spriteY spriteWidth spriteHeight x y width height
          if (this.rotation) {
            ctx.drawImage(
              this.imageR,
              this.spriteXR,
              this.spriteYR,
              this.spriteWidthR,
              this.spriteHeightR,
              this.x,
              this.y,
              this.widthR,
              this.heightR
            );
          } else {
            ctx.drawImage(
              this.image,
              this.spriteX,
              this.spriteY,
              this.spriteWidth,
              this.spriteHeight,
              this.x,
              this.y,
              this.width,
              this.height
            );
          }
        }
      }

      game = new Game(this.canvas);
      game.player.createShips();
      game.render();
      console.log("game started");
      this.gameObj = game;
    },
    resetShips: function () {
      for (var i = 0; i <= 5; i++) {
        this.gameObj.player.ships[i].resetShip();
      }
    },

    modalClose: function () {
      this.modal = false;
    },
    modalOpen: function () {
      var h3 = document.createElement("h3");
      h3.classList.add(".modal");
      this.modal = true;
    },
    connect: function () {
      // 1: Connect to websocket
      const protocol = window.location.protocol.includes("https")
        ? "wss"
        : "ws";
       this.socket = new WebSocket(`${protocol}://battleship-production-5a6e.up.railway.app`);
      this.socket.onopen = function () {
        console.log("Connected to websocket");
      };
      this.socket.onmessage = (event) => {
        console.log(event.data);
        msg = JSON.parse(event.data);
        if (msg.EventType == "initialize") {
          console.log("success");
          console.log(msg.Data);
          this.game_Object = msg.Data;
          this.page = 3;
          this.loadCanvas();
          // call loadCanvas here!!
          this.player = msg.Data.player;
          this.GameIndex = msg.Data.index;
          this.displayBoard[1] = this.game_Object.player2.board;

          console.log(this.player);
        }
        if (msg.EventType == "Kraken") {
          console.log(msg.Data);
          this.Kraken(msg.Data.cords);
        }
        if (msg.EventType == "Win") {
          if (msg.Data.turn != this.player) {
            this.status = "You Win!";
            this.page = 5;
            this.win = true;
          } else {
            this.status = "You Lose!";
            this.page = 5;
            this.page = 5;
          }
        }
        if (msg.EventType == "playerDisconnect") {
          console.log("Player disconnected");
          console.log(msg.Data);
          this.page = 4;
        }
        if (msg.EventType == "SendMessage") {
          console.log(msg);
          this.UserChat.push(msg.Data.Username + ": " + msg.Data.Message);
          const chatLogContainer = this.$refs.chatLogContainer;
          chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
        }
        if (msg.EventType == "AttackMiss") {
          this.attackMiss(msg);
        }
        if (msg.EventType == "AttackHit") {
          this.attackHit(msg);
        }

        if (this.game_Object.turn == 1) {
          console.log("Player2 made attack");
          this.Attack(index);
          this.game_Object.turn = 0;
          console.log(this.game_Object.turn);
        }
        // if (this.game_Object.turn == 0) {
        //   console.log("Player2 made attack");
        //   this.Attack(index);
        //   this.game_Object.turn = 1;
        //   console.log(this.game_Object.turn);
        // }
        if (msg.EventType == "updateBoards") {
          this.gameObj.player.board = msg.Data.board;
          this.game_Object = msg.Data;
          this.updated = true;
          this.displayBoard[3] = false;
          console.log(msg.Data.player1);
          if (this.player == "player1") {
            this.status = "Attack";
            this.displayBoard[0] = "player2";
            this.displayBoard[2] = this.game_Object.player2.name;
            this.displayBoard[1] = this.game_Object.player2.board;
          } else {
            this.status = "Waiting for opponents turn";
            this.displayBoard[0] = "player2";
            this.displayBoard[2] = this.game_Object.player2.name;
            this.displayBoard[1] = this.game_Object.player2.board;
          }
        }
      };
    },
    attackMiss: function (msg) {
      this.cords = msg.Data.cords;
      this.game_Object = msg.Data;
      console.log("success");
      if (this.game_Object.turn == "player1") {
        console.log("test");
        this.status =
          this.game_Object.player2.name + " missed at " + this.cords;
      } else {
        this.status =
          this.game_Object.player1.name + " missed at " + this.cords;
        console.log(this.status);
      }
      setTimeout(this.nextAttack(msg.Data), 15000);
    },
    attackHit: function (msg) {
      this.cords = msg.Data.cords;
      this.game_Object = msg.Data;
      if (this.game_Object.turn == "player1") {
        this.status = this.game_Object.player2.name + "Hit at " + this.cords;
      } else {
        this.status = this.game_Object.player1.name + "Hit at " + this.cords;
      }
      setTimeout(this.nextAttack(msg.Data), 5000);
    },
    nextAttack: function (obj) {
      if (obj.turn == this.game_Object.player) {
        this.status = "Attack";
        if (this.displayBoard[0] == this.game_Object.player) {
          this.toggleBoard();
          //   this.displayBoard[0] = "player2";
          //   this.displayBoard[2] = obj.player2.name;
          //   this.displayBoard[1] = this.game_Object.player2.board;
          // } else {
          //   this.displayBoard[0] = "player1";
          //   this.displayBoard[2] = obj.player1.name;
          //   this.displayBoard[1] = this.game_Object.player1.board;
        }
      } else {
        this.status = "Waiting for opponents turn";
        if (this.displayBoard[0] != this.game_Object.player) {
          this.toggleBoard();
          //   this.displayBoard[0] = "player1";
          //   this.displayBoard[2] = obj.player1.name;
          //   this.displayBoard[1] = this.game_Object.player1.board;
          // } else {
          //   this.displayBoard[0] = "player2";
          //   this.displayBoard[2] = obj.player2.name;
          //   this.displayBoard[1] = this.game_Object.player2.board;
        }
      }
    },
    Kraken: function (coordinates) {
      this.socket.send(
        JSON.stringify({
          EventType: "Kraken",
          Data: {
            cord: coordinates,
          },
        })
      );
    },
    // checkWin: function () {
    //   for (ship in gameObj.player.ships) {
    //     // Change "gameObj" to "this.gameObj"
    //     for (location in ship) {
    //       if (location == 4) {
    //         GameOver = true; // Change "GameOver" to "this.GameOver"
    //       }
    //     }
    //   }
    // },

    load_screen: function () {
      // Send username through websocket
      if (this.username.trim() != "") {
        if (!this.isAudioPlaying) {
          this.toggleAudio();
        }
        if (this.gameCode == "") {
          this.page = 2;
          this.userRequired = false;
          this.socket.send(
            JSON.stringify({
              EventType: "username",
              Data: { user: this.username },
            })
          );
        } else {
          this.page = 2;
          this.userRequired = false;
          this.socket.send(
            JSON.stringify({
              EventType: "usernameCode",
              Data: { user: this.username, code: this.gameCode },
            })
          );
        }
      } else {
        this.userRequired = true;
      }
    },
    updateBoard: function () {
      if (this.gameObj.player.allSet() == true) {
        this.settingShips = false;
        this.canvas.width = 500;
        this.gameObj.render();
        this.gameObj.player.setAllShips();
        this.status = "Waiting for other player";
        this.socket.send(
          JSON.stringify({
            EventType: "UpdateBoard",
            Data: {
              board: this.gameObj.player.board,
              player: this.player,
              index: this.GameIndex,
            },
          })
        );
      } else {
        this.status = "Place all ships";
        console.log("not all ships are placed");
      }
    },

    toggleAudio() {
      this.backgroundAudio.loop = true;
      this.backgroundAudio.volume = this.audioVolume;
      this.isAudioPlaying = !this.isAudioPlaying;
      if (this.isAudioPlaying) {
        this.playAudio();
      } else {
        this.pauseAudio();
      }
    },
    toggleBoard() {
      this.gameObj.render();
      if (this.displayBoard[0] == "player1") {
        this.displayBoard[0] = "player2";
        this.displayBoard[1] = this.game_Object.player2.board;
        if (this.game_Object.player == "player2") {
          this.displayBoard[2] = "Your";
        } else {
          this.displayBoard[2] = this.game_Object.player2.name + "'s";
        }
      } else if (this.displayBoard[0] == "player2") {
        this.displayBoard[0] = "player1";
        this.displayBoard[1] = this.game_Object.player1.board;
        if (this.game_Object.player == "player1") {
          this.displayBoard[2] = "Your";
        } else {
          this.displayBoard[2] = this.game_Object.player1.name + "'s";
        }
      }
    },
    playAudio() {
      this.backgroundAudio.play();
    },
    pauseAudio() {
      this.backgroundAudio.pause();
    },
    setAudioVolume() {
      this.backgroundAudio.volume = this.audioVolume;
    },
    sendChat() {
      if (this.UserInput) {
        this.socket.send(
          JSON.stringify({
            EventType: "SendMessage",
            Data: {
              Message: this.UserInput,
              Index: this.GameIndex,
              Player: this.player,
              Username: this.username,
            },
          })
        );

        this.UserChat.push(this.username + ": " + this.UserInput);
        this.UserInput = "";
        const chatLogContainer = this.$refs.chatLogContainer;
        chatLogContainer.scrollTop = chatLogContainer.scrollHeight;
      }
    },

    attack(e) {
      const rect = this.gameObj.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const row = Math.floor(y / this.gameObj.cellSize);
      const col = Math.floor(x / this.gameObj.cellSize);
      console.log("test");

      if (
        col >= 0 &&
        col < this.gameObj.gridSize &&
        row >= 0 &&
        row < this.gameObj.gridSize
      ) {
        console.log(col, row);
        var attackCords = [row, col];
        this.socket.send(
          JSON.stringify({
            EventType: "attack",
            Data: {
              board: this.gameObj.player.board,
              player: this.player,
              index: this.GameIndex,
              cords: attackCords,
            },
          })
        );
      }
    },
  },
  created: function () {
    this.connect();
  },
}).mount("#app");
