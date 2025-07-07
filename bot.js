const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ytdlp = require('yt-dlp-exec');
const TOKEN = process.env.BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 നമസ്കാരം ${msg.from.first_name}! YouTube ലിങ്ക് അയച്ചാൽ ഞങ്ങൾ അതിന്റെ MP3 audio തരാം.`);
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const url = msg.text?.trim();

  if (!url || !url.startsWith('http')) return;

  const fileName = `audio_${Date.now()}.mp3`;
  const filePath = path.join(DOWNLOAD_DIR, fileName);

  bot.sendMessage(chatId, '⏬ ഡൗൺലോഡ് ആരംഭിക്കുന്നു...');

  ytdlp(url, {
    format: 'bestaudio',
    extractAudio: true,
    audioFormat: 'mp3',
    cookies: 'cookies.txt',
    output: filePath
  }).then(() => {
    bot.sendAudio(chatId, fs.createReadStream(filePath)).then(() => {
      fs.unlinkSync(filePath);
    });
  }).catch((error) => {
    bot.sendMessage(chatId, `⚠️ പിഴവ്: ${error.message}`);
  });
});