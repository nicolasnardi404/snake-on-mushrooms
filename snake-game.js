function snakegame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gridSize = 40;
  let snake, mushroom, direction, mushroomsEaten, gameOver;
  let effectLevel = 0;

  const mushroomImage = new Image();
  mushroomImage.src = "mushroom.png";
  let glitchMushrooms = [];

  // Color schemes for different levels
  const colorSchemes = [
    { background: "#000000", snake: "#33cc33" }, // Default
    { background: "#2E0854", snake: "#FF00FF" }, // Level 1
    { background: "#541414", snake: "#FF4444" }, // Level 2
    { background: "#164B1E", snake: "#00FF00" }, // Level 3
    { background: "#2B1B81", snake: "#00FFFF" }, // Level 4
    { background: "#4B0082", snake: "#FF69B4" }, // Level 5
  ];

  function initGame() {
    snake = [{ x: 5, y: 5 }];
    mushroom = { x: 7, y: 7 };
    direction = { x: 0, y: 0 };
    mushroomsEaten = 0;
    effectLevel = 0;
    gameOver = false;
    glitchMushrooms = [];
  }

  function applyEffectLevel1(ctx) {
    // Double vision effect
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.translate(5, 5);
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel2(ctx) {
    // Wave distortion
    const time = Date.now() / 1000;
    ctx.save();
    for (let i = 0; i < canvas.height; i += 4) {
      const offset = Math.sin(time + i * 0.01) * 3;
      ctx.drawImage(canvas, 0, i, canvas.width, 2, offset, i, canvas.width, 2);
    }
    ctx.restore();
  }

  function applyEffectLevel3(ctx) {
    // Rotating background
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Date.now() / 4000);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.globalAlpha = 0.2;
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel4(ctx) {
    // Kaleidoscope effect
    ctx.save();
    const segments = 8;
    for (let i = 0; i < segments; i++) {
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((Math.PI * 2) / segments);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      ctx.globalAlpha = 0.1;
      drawGameElements(ctx);
    }
    ctx.restore();
  }

  function applyEffectLevel5(ctx) {
    // RGB split effect
    ctx.save();
    ctx.globalCompositeOperation = "screen";

    // Red channel
    ctx.fillStyle = "rgba(255,0,0,0.5)";
    ctx.translate(-5, 0);
    drawGameElements(ctx);

    // Green channel
    ctx.fillStyle = "rgba(0,255,0,0.5)";
    ctx.translate(5, 0);
    drawGameElements(ctx);

    // Blue channel
    ctx.fillStyle = "rgba(0,0,255,0.5)";
    ctx.translate(5, 0);
    drawGameElements(ctx);

    ctx.restore();
  }

  function drawGameElements(ctx) {
    // Draw snake
    const currentScheme = colorSchemes[effectLevel];
    ctx.fillStyle = currentScheme.snake;
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize,
        gridSize
      );
    });

    // Draw mushroom
    ctx.drawImage(
      mushroomImage,
      mushroom.x * gridSize,
      mushroom.y * gridSize,
      gridSize,
      gridSize
    );
  }

  function draw() {
    if (gameOver) {
      ctx.fillStyle = "#ff6f61";
      ctx.font = "48px Press Start 2P";
      ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
      return;
    }

    // Clear and set background
    ctx.fillStyle = colorSchemes[effectLevel].background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Base layer
    drawGameElements(ctx);

    // Apply effects based on level
    if (effectLevel >= 1) applyEffectLevel1(ctx);
    if (effectLevel >= 2) applyEffectLevel2(ctx);
    if (effectLevel >= 3) applyEffectLevel3(ctx);
    if (effectLevel >= 4) applyEffectLevel4(ctx);
    if (effectLevel >= 5) applyEffectLevel5(ctx);
  }

  function update() {
    if (gameOver) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Check collisions
    if (
      head.x < 0 ||
      head.x >= canvas.width / gridSize ||
      head.y < 0 ||
      head.y >= canvas.height / gridSize
    ) {
      gameOver = true;
      return;
    }

    for (let i = 1; i < snake.length; i++) {
      if (snake[i].x === head.x && snake[i].y === head.y) {
        gameOver = true;
        return;
      }
    }

    snake.unshift(head);

    // Mushroom collection
    if (head.x === mushroom.x && head.y === mushroom.y) {
      mushroom = {
        x: Math.floor((Math.random() * canvas.width) / gridSize),
        y: Math.floor((Math.random() * canvas.height) / gridSize),
      };
      mushroomsEaten++;
      effectLevel = Math.min(5, Math.floor(mushroomsEaten / 3));
    } else {
      snake.pop();
    }
  }

  function changeDirection(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37,
      UP = 38,
      RIGHT = 39,
      DOWN = 40;

    if (keyPressed === LEFT && direction.x === 0) {
      direction = { x: -1, y: 0 };
    } else if (keyPressed === UP && direction.y === 0) {
      direction = { x: 0, y: -1 };
    } else if (keyPressed === RIGHT && direction.x === 0) {
      direction = { x: 1, y: 0 };
    } else if (keyPressed === DOWN && direction.y === 0) {
      direction = { x: 0, y: 1 };
    }
  }

  document.addEventListener("keydown", changeDirection);

  document.getElementById("restartButton").addEventListener("click", () => {
    initGame();
  });

  function gameLoop() {
    update();
    draw();
    setTimeout(gameLoop, 100);
  }

  initGame();
  gameLoop();
}

snakegame();
