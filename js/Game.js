class Game {
  constructor() {
    this.resetTitle = createElement("h2");
    this.resetButton = createButton("");

    this.leaderboardTitle = createElement("h2");

    this.leader1 = createElement("h2");
    this.leader2 = createElement("h2");

    this.movement = false;
  }

  getState() {
    var gameStateRef = database.ref("gameState");
    gameStateRef.on("value", function(data) {
      gameState = data.val();
    });
  }

  update(state){
    database.ref("/").update({
      gameState: state
    });
  }

  start() {
    player = new Player();
    playerCount = player.getCount();

    form = new Form();
    form.display();
    car1=createSprite(width/2-50, height-100);
    car2=createSprite(width/2+100, height-100);

    car1.addImage("car1", car1_img);
    car2.addImage("car2", car2_img);

    car1.scale= 0.07;
    car2.scale= 0.07;

    cars=[car1, car2];

    fuels = new Group();
    coins = new Group();
    obstacles = new Group();

    var obstaclesPositions = [
      { x: width / 2 + 250, y: height - 800, image: obstacle2 },
      { x: width / 2 - 150, y: height - 1300, image: obstacle1 },
      { x: width / 2 + 250, y: height - 1800, image: obstacle1 },
      { x: width / 2 - 180, y: height - 2300, image: obstacle2 },
      { x: width / 2, y: height - 2800, image: obstacle2 },
      { x: width / 2 - 180, y: height - 3300, image: obstacle1 },
      { x: width / 2 + 180, y: height - 3300, image: obstacle2 },
      { x: width / 2 + 250, y: height - 3800, image: obstacle2 },
      { x: width / 2 - 150, y: height - 4300, image: obstacle1 },
      { x: width / 2 + 250, y: height - 4800, image: obstacle2 },
      { x: width / 2, y: height - 5300, image: obstacle1 },
      { x: width / 2 - 180, y: height - 5500, image: obstacle2 }
    ];

    this.addSprites(fuels, 4, fuelImage, 0.02);
    this.addSprites(coins, 18, coinImage, 0.09);

    this.addSprites(
      obstacles,
      obstaclesPositions.length,
      obstacle1,
      0.04,
      obstaclesPositions
    );
  
  }

  addSprites(spriteGroup, numberOfSprites, spriteImage, scale, position = [])
    {
      for(var i = 0; i < numberOfSprites; i++){
        var x, y;
      

      if(position.lenght > 0){
        x = position[i].x;
        y = position[i].y;
        spriteImage = position[i].image;
      } else {
        x = random(width / 2 + 150, width / 2 - 150);
        y = random(-height * 4.5, height - 400);
      }
      var sprite = createSprite(x, y);
      sprite.addImage("sprite", spriteImage);
      sprite.scale = scale;
      spriteGroup.add(sprite);
    }
   }

  handleElements() {
    form.hide();
    form.titleImg.position(40, 50);
    form.titleImg.class("gameTitleAfterEffect");

    this.resetTitle.html("Reiniciar Jogo");
    this.resetTitle.class("resetText");
    this.resetTitle.position(width / 2 + 200, 40);

    this.resetButton.class("resetButton");
    this.resetButton.position(width / 2 + 230, 100);

    this.leader1.class("leadersText");
    this.leader1.position(width/ 3 -50, 80);

    this.leader2.class("leadersText");
    this.leader2.position(width/ 3 -50, 130);
  }

  play() {
    this.handleElements();
    this.handleResetButton();
    Player.getPlayersInfo();
    if(allPlayers !== undefined){
      image(track, 0, -height*5, width, height*6);

      this.showLeaderboard();
      this.showLife();
      this.showFuel();

      var index = 0;
      for(var plr in allPlayers){
        index = index + 1;

      var x = allPlayers[plr].positionX;
      var y = height - allPlayers[plr].positionY;

      cars[index - 1].position.x = x;
      cars[index - 1].position.y = y;

      if(index == player.index){
        stroke(10);
        fill("red");
        ellipse(x, y, 60, 60);

        this.handleFuel(index);
        this.handleCoin(index);
        this.handleObstacle(index);

        //camera.position.x = cars[index - 1].position.x;
        if(player.positionY < (height*6) - 368){ 
        camera.position.y = cars[index - 1].position.y;
        }
       }
      }
      this.handlePlayerControls();

      drawSprites();
      this.finishLine();
    }
  }

  handleResetButton(){
    this.resetButton.mousePressed(() => {
      database.ref("/").set({
        playerCount: 0,
        gameState: 0,
        players: {}
      })
      window.location.reload();
    })
  }

  handlePlayerControls(){
    //up
    if(keyIsDown(UP_ARROW)){
      player.positionY += 10;
      player.update();
      this.movement = true;
     }

    //down
    if(keyIsDown(DOWN_ARROW)){
      player.positionY -= 8;
      player.update();
      this.movement = true;
    }
    //right
    if(keyIsDown(RIGHT_ARROW) && player.positionX < width / 2 + 200){
      player.positionX += 6;
      player.update();
      this.movement = true;
    }

    //left
    if(keyIsDown(LEFT_ARROW) && player.positionX > width / 3 - 50){
      player.positionX -= 6;
      player.update();
      this.movement = true;
    }
  }
  showLeaderboard(){
    var leader1, leader2;
    var players = Object.values(allPlayers);

    if(
      (players[0].rank == 0 && players[1].rank == 0) || players[0].rank == 1
    ){
      leader1 =
        players[0].rank + "&emsp;" +
        players[0].name + "&emsp;" +
        players[0].score;

      leader2 =
        players[1].rank + "&emsp;" +
        players[1].name + "&emsp;" +
        players[1].score;
    }

    if(players[1].rank == 1){
      leader1 =
      players[1].rank + "&emsp;" +
      players[1].name + "&emsp;" +
      players[1].score;

      leader2 =
      players[0].rank + "&emsp;" +
      players[0].name + "&emsp;" +
      players[0].score;
    }

    this.leader1.html(leader1);
    this.leader2.html(leader2);

  }

  handleFuel(index){
    cars[index - 1].overlap(fuels, function(collector, collected){
      player.fuel = 200;
      collected.remove();
    });
    if(this.movement == true && player.fuel > 0){
      player.fuel -= 0.5;
    }

    if(player.fuel <= 0){
      this.gameOver();
    }

  }
    
  handleCoin(index){
    cars[index - 1].overlap(coins, function(collector, collected){
      player.score += 21;
      player.update();
      collected.remove();
    });
  }

  handleObstacle(index){
    cars[index - 1].overlap(obstacles, function(collector, collected){
      if(player.life > 0){
      player.life-=50;
      }
      player.update();
      collected.remove();
    })

    if(player.life <= 0){
      this.gameOver();
    }

  }

  showLife(){
    push();
    image(lifeImage, 25, height - player.positionY + 200, 30, 30);
    rect(65, height - player.positionY + 205, 200, 20);
    fill("red");
    rect(65, height - player.positionY + 205, player.life, 20);
    pop();
  }

  showFuel(){
    push();
    image( fuelImage, 20, height - player.positionY + 240, 30, 30);
    rect(65, height - player.positionY + 245, 200, 20);
    fill("yellow");
    rect(65, height - player.positionY + 245, player.fuel, 20);
    pop();
  }

  gameOver(){
    swal({
      title: "Vaza muleque",
      //text: ""
      imageUrl: "https://media.discordapp.net/attachments/765901623368876053/1036025354973892769/mairo.png?width=576&height=432",
      imageSize: "65x50",
      confirmButtonText: ";>"
    })

    gameState = 2;
  }

  aooooba(){
    swal({
      title: "Sagaz...",
      //text: ""
      imageUrl: "https://media.discordapp.net/attachments/765901623368876053/1036026444536614942/meryou.jpg?width=149&height=134",
      imageSize: "65x65",
      confirmButtonText: ";>"
    })

    gameState = 2;
  }

  finishLine(){
    const englishLive = (height*6) - 165;

    if(player.positionY >= englishLive){
      this.aooooba();
      gameState = 2;
    }
  }

}
