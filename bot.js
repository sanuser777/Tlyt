const TelegramBot = require('node-telegram-bot-api');
const { execFile } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ytdlp = require('yt-dlp-exec').raw;
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

  const args = [
    '-f', 'bestaudio',
    '--extract-audio',
    '--audio-format', 'mp3',
    '--cookies', 'cookies.txt',
    '-o', filePath,
    url
  ];

  execFile(ytdlp, args, (error) => {
    if (error) {
      bot.sendMessage(chatId, `⚠️ പിഴവ്: ${error.message}`);
      return;
    }

    bot.sendAudio(chatId, fs.createReadStream(filePath)).then(() => {
      fs.unlinkSync(filePath);
    }).catch(err => {
      bot.sendMessage(chatId, `⚠️ അയക്കുന്നതിൽ പിഴവ്: ${err.message}`);
    });
  });
});