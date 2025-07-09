const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade' },
  scene: {
    preload() {
      // 1. Шарик (3D с бликом)
      const ballTexture = this.textures.createCanvas('ball', 32, 32);
      const ballCtx = ballTexture.getContext();
      const ballGradient = ballCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
      ballGradient.addColorStop(0, '#FF5E5E');
      ballGradient.addColorStop(1, '#CC0000');
      ballCtx.fillStyle = ballGradient;
      ballCtx.beginPath();
      ballCtx.arc(16, 16, 16, 0, Math.PI * 2);
      ballCtx.fill();

      // Блик
      ballCtx.fillStyle = 'rgba(255,255,255,0.4)';
      ballCtx.beginPath();
      ballCtx.arc(10, 10, 5, 0, Math.PI * 1.5);
      ballCtx.fill();
      ballTexture.refresh();

      // 2. Платформа (неоновая)
      const paddleTexture = this.textures.createCanvas('paddle', 100, 20);
      const paddleCtx = paddleTexture.getContext();
      paddleCtx.fillStyle = '#00B4D8';
      paddleCtx.fillRect(0, 0, 100, 20);

      // Свечение
      paddleCtx.strokeStyle = '#90E0EF';
      paddleCtx.lineWidth = 3;
      paddleCtx.strokeRect(0, 0, 100, 20);
      paddleTexture.refresh();

      // 3. Блоки (3 уровня сложности)
      const blockStyles = [
        { fill: '#4CC9F0', stroke: '#3A86FF', text: '1' }, // Легкий
        { fill: '#4361EE', stroke: '#3F37C9', text: '2' }, // Средний
        { fill: '#3A0CA3', stroke: '#240046', text: '3' }  // Тяжелый
      ];

      blockStyles.forEach((style, index) => {
        const blockTexture = this.textures.createCanvas(`block_${index}`, 70, 30);
        const ctx = blockTexture.getContext();

        // Основной цвет
        ctx.fillStyle = style.fill;
        ctx.fillRect(0, 0, 70, 30);

        // Эффект объема
        ctx.strokeStyle = style.stroke;
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, 70, 30);

        // Номер уровня
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(style.text, 35, 20);

        blockTexture.refresh();
      });

      // 4. Частицы для эффектов
      const particleTexture = this.textures.createCanvas('particle', 16, 16);
      const particleCtx = particleTexture.getContext();
      particleCtx.fillStyle = '#FF5555';
      particleCtx.beginPath();
      particleCtx.arc(8, 8, 8, 0, Math.PI * 2);
      particleCtx.fill();
      particleTexture.refresh();
    },
    create() {
      
      // Платформа
      this.paddle = this.physics.add.sprite(400, 550, 'paddle')
        .setImmovable(true)
        .setCollideWorldBounds(true)
        .setSize(100, 20);

      // Шарик - ОСНОВНЫЕ ИЗМЕНЕНИЯ ЗДЕСЬ
      this.ball = this.physics.add.sprite(400, 300, 'ball')
        .setCollideWorldBounds(true, 1, 1) // Добавил упругость стенок
        .setBounce(1) // Упругость при столкновениях
        .setCircle(16) // Форма коллайдера
        .setVelocity(150, -300); // Стартовая скорость (x, y)

      // Блоки (объемные кирпичики)
      // Блоки
      this.blocks = this.physics.add.staticGroup();
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
          const level = Phaser.Math.Between(0, 2);
          this.blocks.create(80 * x + 40, 50 * y + 30, `block_${level}`)
            .setData('health', level + 1)
            .setSize(70, 30, true);
        }
      }

this.physics.add.collider(this.ball, this.paddle, () => {
    // Случайное отклонение при ударе о платформу
    const newVelocityX = Phaser.Math.Between(-30, 30); // Уменьшил разброс
    this.ball.setVelocityX(this.ball.body.velocity.x + newVelocityX);
});

this.physics.add.collider(this.ball, this.blocks, (ball, block) => {
    const currentHealth = block.getData('health') - 1;
    block.setData('health', currentHealth);

    // Быстрая анимация удара (почти незаметная)
    this.tweens.add({
        targets: block,
        scaleX: 1.05,  // Уменьшил эффект масштабирования
        scaleY: 0.95,
        duration: 10,  // Укоротил длительность
        yoyo: true
    });

    if (currentHealth <= 0) {
        // Минималистичный эффект разрушения
        const particles = this.add.particles('particle');
        particles.createEmitter({
            x: block.x,
            y: block.y,
            quantity: 3,  // Меньше частиц
            speed: 100,   // Меньше скорость
            scale: { start: 0.5, end: 0 },
            lifespan: 10, // Короче жизнь
            blendMode: 'ADD'
        });

        // Мгновенное исчезновение блока
        block.setVisible(false);
        block.body.enable = false;

        // Удаление через короткое время (чтобы не мешало физике)
        this.time.delayedCall(50, () => {
            block.destroy();
        });

        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        if (this.blocks.countActive() === 0) {
            this.nextLevel();
        }
    }
});

      // Управление
      // Управление платформой
      this.input.on('pointermove', (pointer) => {
        this.paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
      });
      // Счет
      this.score = 0;
      this.scoreText = this.add.text(20, 20, 'Score: 0', {
        font: '24px Arial',
        fill: '#FFFFFF'
      }); 
    },
    hitBlock(block) {
      const health = block.getData('health') - 1;
      block.setData('health', health);

      // Эффект удара
      this.tweens.add({
        targets: block,
        scaleX: 1.2,
        scaleY: 0.8,
        yoyo: true,
        duration: 100
      });

      if (health <= 0) {
        // Эффект разрушения
        this.add.particles('particle').createEmitter({
          x: block.x,
          y: block.y,
          speed: { min: -300, max: 300 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          quantity: 10,
          lifespan: 500
        });

        block.destroy();
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);

        // Проверка завершения уровня
        if (this.blocks.countActive() === 0) {
          this.nextLevel();
        }
      }
    },

    nextLevel() {
      // Пауза перед новым уровнем
      this.ball.setVelocity(0, 0);

      this.time.delayedCall(1000, () => {
        // Возвращаем шарик в центр
        this.ball.setPosition(400, 300);

        // Увеличиваем скорость с каждым уровнем
        const speed = 200 + (this.currentLevel * 50);
        this.ball.setVelocity(
          Phaser.Math.Between(-speed, speed),
          Phaser.Math.Between(-speed, -speed/2)
        );

        // Генерация новых блоков
        for (let y = 0; y < 5; y++) {
          for (let x = 0; x < 10; x++) {
            const level = Phaser.Math.Between(0, 2);
            this.blocks.create(80 * x + 40, 50 * y + 30, `block_${level}`)
              .setData('health', level + 1)
              .setSize(70, 30, true);
          }
        }
      });
    }
  }
};

new Phaser.Game(config);
