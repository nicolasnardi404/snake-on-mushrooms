function snakegame() {
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");

  // Adjust grid size based on device
  const isMobile =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  const gridSize = isMobile ? 25 : 35; // Smaller grid for mobile

  // Adjust canvas size for mobile
  function resizeCanvas() {
    const maxWidth = isMobile ? window.innerWidth - 20 : 800;
    const maxHeight = isMobile ? window.innerHeight * 0.6 : 600;

    // Make canvas size divisible by grid size
    canvas.width = Math.floor(maxWidth / gridSize) * gridSize;
    canvas.height = Math.floor(maxHeight / gridSize) * gridSize;
  }

  // Call resize on init
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

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
  let score = 0;
  let devMode = false;
  let touchControls;

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
    { background: "#001F3F", snake: "#7FDBFF" }, // Level 10 - Deep Navy with Cyan
    { background: "#004D40", snake: "#1DE9B6" }, // Level 11 - Teal with Mint
    { background: "#311B92", snake: "#B388FF" }, // Level 12 - Deep Purple with Light Purple
    { background: "#006064", snake: "#84FFFF" }, // Level 13 - Cyan Dark with Bright Cyan
    { background: "#1A237E", snake: "#536DFE" }, // Level 14 - Indigo with Electric Blue
    { background: "#263238", snake: "#90A4AE" }, // Level 15 - Blue Grey with Light Blue Grey
    { background: "plasma", snake: "neon" }, // Level 16
    { background: "tunnel", snake: "trail" }, // Level 17
    { background: "ripple", snake: "ghost" }, // Level 18
    { background: "nebula", snake: "starlight" }, // Level 19
    { background: "void", snake: "quantum" }, // Level 20
  ];

  function initGame() {
    snake = [{ x: 5, y: 5 }];
    mushroom = { x: 7, y: 7 };
    direction = { x: 0, y: 0 };
    mushroomsEaten = 0;
    effectLevel = 0;
    gameOver = false;
    glitchMushrooms = [];
    score = 0;
    updateScoreDisplay();

    if (!touchControls && isMobile) {
      createTouchControls();
    }
  }

  function createTouchControls() {
    touchControls = document.createElement("div");
    touchControls.className = "touch-controls";

    // Create touch control buttons in a grid layout
    const buttons = [
      { direction: "up", symbol: "↑", gridArea: "1 / 2 / 2 / 3" },
      { direction: "left", symbol: "←", gridArea: "2 / 1 / 3 / 2" },
      { direction: "right", symbol: "→", gridArea: "2 / 3 / 3 / 4" },
      { direction: "down", symbol: "↓", gridArea: "3 / 2 / 4 / 3" },
    ];

    buttons.forEach(({ direction, symbol, gridArea }) => {
      const button = document.createElement("button");
      button.textContent = symbol;
      button.className = `touch-button ${direction}`;
      button.style.gridArea = gridArea;

      // Add both touch and click handlers for better response
      const handleInput = (e) => {
        e.preventDefault();
        handleTouchControl(direction);
      };

      button.addEventListener("touchstart", handleInput);
      button.addEventListener("mousedown", handleInput);
      touchControls.appendChild(button);
    });

    document.body.appendChild(touchControls);

    // Only show touch controls on mobile devices
    touchControls.style.display = isMobile ? "grid" : "none";
  }

  function handleTouchControl(dir) {
    switch (dir) {
      case "left":
        if (direction.x === 0) direction = { x: -1, y: 0 };
        break;
      case "up":
        if (direction.y === 0) direction = { x: 0, y: -1 };
        break;
      case "right":
        if (direction.x === 0) direction = { x: 1, y: 0 };
        break;
      case "down":
        if (direction.y === 0) direction = { x: 0, y: 1 };
        break;
    }
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

  function applyEffectLevel16(ctx) {
    // Plasma wave effect with intense screen shake
    const time = Date.now() / 1000;
    const shakeX = Math.random() * 15 - 7.5;
    const shakeY = Math.random() * 15 - 7.5;

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Create plasma waves
    for (let i = 0; i < canvas.width; i += 20) {
      for (let j = 0; j < canvas.height; j += 20) {
        const hue = (time * 50 + i * 0.5 + j * 0.5) % 360;
        ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.2)`;
        const size = 20 + Math.sin(time + i * 0.1) * 10;
        ctx.fillRect(i, j, size, size);
      }
    }

    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel17(ctx) {
    // 3D tunnel effect with trailing copies
    const copies = 5;
    const time = Date.now() / 1000;

    ctx.save();
    for (let i = 0; i < copies; i++) {
      const scale = 1 + i * 0.2;
      const alpha = 1 - i * 0.2;
      const rotation = time + (i * Math.PI) / 8;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rotation);
      ctx.scale(scale, scale);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      drawGameElements(ctx);
      ctx.restore();
    }
    ctx.restore();
  }

  function applyEffectLevel18(ctx) {
    // Ripple distortion with ghost trails
    const time = Date.now() / 1000;

    // Create ripple effect
    ctx.save();
    for (let i = 0; i < canvas.height; i += 2) {
      const offset = Math.sin(time * 2 + i * 0.03) * 15;
      ctx.drawImage(canvas, 0, i, canvas.width, 2, offset, i, canvas.width, 2);
    }

    // Add ghost trails
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = 0.2;
      ctx.translate(Math.sin(time + i) * 10, Math.cos(time + i) * 10);
      drawGameElements(ctx);
    }
    ctx.restore();
  }

  function applyEffectLevel19(ctx) {
    // Nebula effect with starlight particles
    ctx.save();

    // Create nebula background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width
    );

    const time = Date.now() / 1000;
    gradient.addColorStop(0, `hsla(${(time * 50) % 360}, 100%, 50%, 0.2)`);
    gradient.addColorStop(
      0.5,
      `hsla(${(time * 50 + 120) % 360}, 100%, 50%, 0.2)`
    );
    gradient.addColorStop(
      1,
      `hsla(${(time * 50 + 240) % 360}, 100%, 50%, 0.2)`
    );

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add starlight particles
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * i) * canvas.width) / 2 + canvas.width / 2;
      const y = (Math.cos(time * i) * canvas.height) / 2 + canvas.height / 2;
      const size = Math.random() * 3;

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  function applyEffectLevel12(ctx) {
    // Digital wave effect
    const time = Date.now() / 1000;
    ctx.save();

    // Create digital-looking waves
    for (let i = 0; i < canvas.width; i += 10) {
      const height = Math.sin(time + i * 0.05) * 20;
      ctx.fillStyle = `rgba(0, 255, 0, 0.1)`;
      ctx.fillRect(i, canvas.height / 2 + height, 8, canvas.height / 2);
      ctx.fillRect(i, 0, 8, canvas.height / 2 + height - 20);
    }

    ctx.globalAlpha = 0.8;
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel13(ctx) {
    // Geometric mandala effect
    const time = Date.now() / 1000;
    ctx.save();

    // Create rotating geometric patterns
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(time + (i * Math.PI) / 4);

      // Draw geometric shapes
      ctx.beginPath();
      ctx.moveTo(-50, -50);
      ctx.lineTo(50, -50);
      ctx.lineTo(0, 50);
      ctx.closePath();
      ctx.fillStyle = `rgba(0, 255, 255, 0.1)`;
      ctx.fill();

      ctx.restore();
    }

    ctx.globalAlpha = 0.8;
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel14(ctx) {
    // Neon pulse rings
    const time = Date.now() / 1000;
    ctx.save();

    // Create expanding rings
    for (let i = 0; i < 5; i++) {
      const radius = (time * 50 + i * 50) % 200;
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${time * 50 + i * 30}, 100%, 50%, ${
        0.3 - radius / 600
      })`;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.globalAlpha = 0.8;
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel15(ctx) {
    // Prismatic shatter effect
    ctx.save();
    const time = Date.now() / 1000;

    // Create prismatic fragments
    for (let i = 0; i < 12; i++) {
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((i * Math.PI) / 6 + time);

      // Draw prismatic shards
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(100, 30);
      ctx.lineTo(100, -30);
      ctx.closePath();
      ctx.fillStyle = `hsla(${i * 30}, 70%, 50%, 0.1)`;
      ctx.fill();

      ctx.restore();
    }

    ctx.globalAlpha = 0.8;
    drawGameElements(ctx);
    ctx.restore();
  }

  function applyEffectLevel20(ctx) {
    // Void effect with black hole distortion
    ctx.save();
    const time = Date.now() / 1000;

    // Create void effect
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 1)");
    gradient.addColorStop(0.7, "rgba(75, 0, 130, 0.5)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add swirling effect
    for (let i = 0; i < 5; i++) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(time * (i + 1) * 0.5);
      ctx.scale(1 - i * 0.1, 1 - i * 0.1);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);
      drawGameElements(ctx);
      ctx.restore();
    }
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
      // Adjust font sizes for mobile
      const gameOverFontSize = isMobile ? "32px" : "48px";
      const scoreFontSize = isMobile ? "18px" : "24px";

      // Create gradient background for game over screen
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#1a0f3c");
      gradient.addColorStop(1, "#4b0082");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set up text shadow for glow effect
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Main "GAME OVER" text
      ctx.fillStyle = "#ff6f61";
      ctx.font = `${gameOverFontSize} "Press Start 2P", cursive`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);

      // Final score display
      ctx.font = `${scoreFontSize} "Press Start 2P", cursive`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);

      // Reset shadow properties
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";
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
    if (effectLevel >= 12) applyEffectLevel12(ctx);
    if (effectLevel >= 13) applyEffectLevel13(ctx);
    if (effectLevel >= 14) applyEffectLevel14(ctx);
    if (effectLevel >= 15) applyEffectLevel15(ctx);
    if (effectLevel >= 16) applyEffectLevel16(ctx);
    if (effectLevel >= 17) applyEffectLevel17(ctx);
    if (effectLevel >= 18) applyEffectLevel18(ctx);
    if (effectLevel >= 19) applyEffectLevel19(ctx);
    if (effectLevel >= 20) applyEffectLevel20(ctx);

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

      // Calculate score bonus based on current level
      const levelBonus = Math.floor(effectLevel / 2) * 5;
      score += 10 + levelBonus; // Base 10 points + bonus for higher levels

      effectLevel = Math.min(20, Math.floor(mushroomsEaten / 2));
      updateScoreDisplay();
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
    // Slower speed on mobile for better control
    setTimeout(gameLoop, isMobile ? 150 : 100);
  }

  function handleDevControls(event) {
    // Toggle dev mode with 'D' key
    if (event.key === "d" || event.key === "D") {
      devMode = !devMode;
      console.log(`Dev mode: ${devMode ? "ON" : "OFF"}`);
      toggleDevInstructions(devMode);
      return;
    }

    // Only process if dev mode is on
    if (devMode) {
      let level = null;

      // Handle number keys (0-9) for levels 0-9
      if (event.key >= "0" && event.key <= "9") {
        level = parseInt(event.key);
      }
      // Handle letters for levels 10-20
      else if (event.key === "q") level = 10;
      else if (event.key === "w") level = 11;
      else if (event.key === "e") level = 12;
      else if (event.key === "r") level = 13;
      else if (event.key === "t") level = 14;
      else if (event.key === "y") level = 15;
      else if (event.key === "u") level = 16;
      else if (event.key === "i") level = 17;
      else if (event.key === "o") level = 18;
      else if (event.key === "p") level = 19;
      else if (event.key === "a") level = 20;

      // Set the level if it's valid
      if (level !== null && level <= 20) {
        effectLevel = level;
        console.log(`Switched to level ${level}`);
        updateScoreDisplay();
      }
    }
  }

  document.addEventListener("keydown", handleDevControls);

  function updateScoreDisplay() {
    const scoreElement = document.getElementById("scoreValue");
    const levelElement = document.getElementById("levelValue");
    const highScoreElement = document.getElementById("highScoreValue");

    if (scoreElement) scoreElement.textContent = score;
    if (levelElement) {
      levelElement.textContent = `${effectLevel}${devMode ? " (DEV)" : ""}`;
    }

    const highScore = localStorage.getItem("highScore") || 0;
    if (score > highScore) {
      localStorage.setItem("highScore", score);
    }
    if (highScoreElement) {
      highScoreElement.textContent = Math.max(highScore, score);
    }
  }

  function toggleDevInstructions(show) {
    const instructions = document.getElementById("devInstructions");
    if (instructions) {
      instructions.style.display = show ? "block" : "none";
    }
  }

  initGame();
  gameLoop();
}

snakegame();
