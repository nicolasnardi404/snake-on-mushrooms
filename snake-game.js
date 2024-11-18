function snakegame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gridSize = 40;
  let snake, mushroom, direction, mushroomsEaten, gameOver;
  let effectLevel = 0;
  let currentHue = 0;
  let rainbowSnake = false;
  let trailEffect = false;
  let trails = [];
  let shakeIntensity = 0;
  let lastBackgroundColor = "#000000";
  let lastSnakeColor = "#33cc33";
  let colorChangeTimer = 0;

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
    { background: "#800080", snake: "#FFD700" }, // Level 6
    { background: "#000000", snake: "rainbow" }, // Level 7
    { background: "pulse", snake: "#FF1493" }, // Level 8
    { background: "#4B0082", snake: "strobe" }, // Level 9
    { background: "rainbow", snake: "rainbow" }, // Level 10
    { background: "spiral", snake: "rainbow" }, // Level 11
    { background: "vortex", snake: "rainbow" }, // Level 12
    { background: "matrix", snake: "glitch" }, // Level 13
    { background: "fractal", snake: "plasma" }, // Level 14
    { background: "chaos", snake: "chaos" }, // Level 15
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

  function applyEffectLevel6(ctx) {
    // Mirror effect
    ctx.save();

    // Horizontal mirror
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
    ctx.globalAlpha = 0.3;
    drawGameElements(ctx);

    // Vertical mirror
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.globalAlpha = 0.3;
    drawGameElements(ctx);

    ctx.restore();
  }

  function applyEffectLevel7(ctx) {
    // Rainbow trails
    ctx.save();
    trails.forEach((trail, index) => {
      const alpha = ((trails.length - index) / trails.length) * 0.3;
      ctx.fillStyle = `hsla(${
        (currentHue + index * 10) % 360
      }, 100%, 50%, ${alpha})`;
      ctx.fillRect(trail.x * gridSize, trail.y * gridSize, gridSize, gridSize);
    });
    ctx.restore();
  }

  function applyEffectLevel8(ctx) {
    // Screen shake effect
    const shakeX = Math.random() * shakeIntensity - shakeIntensity / 2;
    const shakeY = Math.random() * shakeIntensity - shakeIntensity / 2;
    ctx.save();
    ctx.translate(shakeX, shakeY);
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel9(ctx) {
    // Strobe/pulse effect
    const pulseScale = 1 + Math.sin(Date.now() / 200) * 0.1;
    ctx.save();
    ctx.scale(pulseScale, pulseScale);
    ctx.translate(
      (canvas.width * (1 - pulseScale)) / 2,
      (canvas.height * (1 - pulseScale)) / 2
    );
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel10(ctx) {
    // Spiral warp effect
    const time = Date.now() / 1000;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(time);
    ctx.scale(Math.sin(time) * 0.2 + 1, Math.cos(time) * 0.2 + 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel11(ctx) {
    // Vortex effect
    const time = Date.now() / 1000;
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(time + (i * Math.PI) / 2.5);
      ctx.scale(1 + i * 0.1, 1 + i * 0.1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      drawGameElements(ctx);
      ctx.restore();
    }
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
    if (colorSchemes[effectLevel].background === "pulse") {
      ctx.fillStyle = `hsl(${(Date.now() / 20) % 360}, 70%, 50%)`;
    } else if (colorSchemes[effectLevel].background === "rainbow") {
      ctx.fillStyle = `hsl(${currentHue}, 70%, 50%)`;
    } else {
      ctx.fillStyle = colorSchemes[effectLevel].background;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Base layer
    drawGameElements(ctx);

    // Apply effects based on level
    if (effectLevel >= 1) applyEffectLevel1(ctx);
    if (effectLevel >= 2) applyEffectLevel2(ctx);
    if (effectLevel >= 3) applyEffectLevel3(ctx);
    if (effectLevel >= 4) applyEffectLevel4(ctx);
    if (effectLevel >= 5) applyEffectLevel5(ctx);
    if (effectLevel >= 6) applyEffectLevel6(ctx);
    if (effectLevel >= 7) applyEffectLevel7(ctx);
    if (effectLevel >= 8) applyEffectLevel8(ctx);
    if (effectLevel >= 9) applyEffectLevel9(ctx);
    if (effectLevel >= 10) applyEffectLevel10(ctx);
    if (effectLevel >= 11) applyEffectLevel11(ctx);

    // Update shake intensity
    if (effectLevel >= 8) {
      shakeIntensity = 5 + (effectLevel - 8) * 2;
    }
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
      effectLevel = Math.min(15, Math.floor(mushroomsEaten / 2));
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
