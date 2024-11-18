function snakegame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const gridSize = 40;
  let snake, mushroom, direction, glitchLevel, gameOver;

  const mushroomImage = new Image();
  mushroomImage.src = "mushroom.png";

  function initGame() {
    snake = [{ x: 5, y: 5 }];
    mushroom = { x: 7, y: 7 };
    direction = { x: 0, y: 0 };
    glitchLevel = 0;
    gameOver = false;
  }

  function draw() {
    if (gameOver) {
      ctx.fillStyle = "#ff6f61";
      ctx.font = "48px sans-serif";
      ctx.fillText("Game Over", canvas.width / 4, canvas.height / 2);
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (glitchLevel > 0) {
      const shakeIntensity = glitchLevel * 2;
      const offsetX = Math.random() * shakeIntensity - shakeIntensity / 2;
      const offsetY = Math.random() * shakeIntensity - shakeIntensity / 2;
      ctx.save();
      ctx.translate(offsetX, offsetY);
    }

    ctx.fillStyle = "#33cc33";
    snake.forEach((segment) => {
      ctx.fillRect(
        segment.x * gridSize,
        segment.y * gridSize,
        gridSize,
        gridSize
      );
    });

    ctx.drawImage(
      mushroomImage,
      mushroom.x * gridSize,
      mushroom.y * gridSize,
      gridSize,
      gridSize
    );

    if (glitchLevel > 0) {
      ctx.globalAlpha = 0.5;
      for (let i = 0; i < glitchLevel * 10; i++) {
        const randomR = Math.floor(Math.random() * 255);
        const randomG = Math.floor(Math.random() * 255);
        const randomB = Math.floor(Math.random() * 255);
        ctx.fillStyle = `rgba(${randomR}, ${randomG}, ${randomB}, 0.1)`;
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          gridSize,
          gridSize
        );
      }
      ctx.globalAlpha = 1.0;
    }

    if (glitchLevel > 0) {
      ctx.restore();
    }
  }

  function update() {
    if (gameOver) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

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

    if (head.x === mushroom.x && head.y === mushroom.y) {
      mushroom = {
        x: Math.floor((Math.random() * canvas.width) / gridSize),
        y: Math.floor((Math.random() * canvas.height) / gridSize),
      };
      glitchLevel++;
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
