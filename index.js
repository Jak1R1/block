const express = require('express');
const { Telegraf } = require('telegraf');
const app = express();
const bot = new Telegraf('7887192763:AAGahyvWj3JAVZMjUjZEyVs9rUnG_SoIMHU');

// Раздаём статику (HTML/JS)
app.use(express.static('public'));

// Команда /start для запуска игры
bot.command('start', (ctx) => {
  ctx.reply('🎮 Игра Block Blast!', {
    reply_markup: {
      inline_keyboard: [[
        { text: 'Играть', url: 't.me/blockbla_bot' }
      ]]
    }
  });
});

// Запуск сервера
app.listen(3000, () => console.log('Сервер запущен на порту 3000'));
bot.launch();