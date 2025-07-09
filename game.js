const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: { default: 'arcade' },
  scene: {
    preload() {
      this.load.image('ball', 'assets/ball.png');
      this.load.image('paddle', 'assets/paddle.png');
      this.load.image('block', 'assets/block.png');
    },
    create() {
      // Платформа
      this.paddle = this.physics.add.sprite(400, 550, 'paddle').setImmovable();
      
      // Шарик
      this.ball = this.physics.add.sprite(400, 300, 'ball').setCollideWorldBounds(true);
      this.ball.setBounce(1);
      this.ball.setVelocity(200, -200);

      // Блоки
      this.blocks = this.physics.add.staticGroup();
      for (let y = 0; y < 5; y++) {
        for (let x = 0; x < 10; x++) {
          this.blocks.create(80 * x + 40, 50 * y + 30, 'block');
        }
      }

      // Коллизии
      this.physics.add.collider(this.ball, this.paddle);
      this.physics.add.collider(this.ball, this.blocks, (ball, block) => block.destroy());

      // Управление касанием
      this.input.on('pointermove', (pointer) => {
        this.paddle.x = pointer.x;
      });
    }
  }
};

new Phaser.Game(config);