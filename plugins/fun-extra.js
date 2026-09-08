// plugins/fun-extra.js - Clean Fun & Entertainment Commands
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import { fetchGif, gifToVideo } from '../lib/fetchgif.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== SHIP COMMAND ====================
cmd({
  pattern: "ship",
  alias: ["match"],
  desc: "Randomly pairs two members from the group.",
  react: "❤️",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups.");

    const groupMetadata = await conn.groupMetadata(from);
    const participants = groupMetadata.participants.map(user => user.id);
    const otherParticipants = participants.filter(id => id !== sender);
    
    if (otherParticipants.length === 0) return reply("❌ Not enough participants to make a pair.");

    const randomPair = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
    const user1 = sender.split("@")[0];
    const user2 = randomPair.split("@")[0];
    const message = `💘 *Match Found!* 💘\n❤️ @${user1} + @${user2}\n💖 Congratulations! 🎉`;

    await conn.sendMessage(from, {
      text: message,
      contextInfo: { mentionedJid: [sender, randomPair] }
    }, { quoted: m });

  } catch (error) {
    console.error("❌ Error in ship command:", error);
    reply("⚠️ An error occurred while processing the command.");
  }
});

// ==================== FLIRT COMMAND ====================
cmd({
    pattern: "flirt",
    alias: ["line"],
    desc: "Get a random flirty message",
    react: "😘",
    category: "fun",
    use: '.flirt',
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const apiUrl = 'https://shizoapi.onrender.com/api/texts/flirt?apikey=shizo';
        const { data } = await axios.get(apiUrl);
        if (!data.result) return reply("❌ Couldn't fetch a flirty message. Try again later!");
        await reply(`${data.result}`.trim());
    } catch (error) {
        console.error('Flirt Error:', error);
        reply("❌ Failed to fetch a flirty message.");
    }
});

// ==================== QUOTE COMMAND ====================
cmd({
  pattern: "quote",
  desc: "Get a random inspiring quote.",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (conn, m, store, { reply }) => {
  try {
    const response = await axios.get("https://api.quotable.io/random");
    const { content, author } = response.data;
    const message = `💬 *"${content}"*\n- ${author}`;
    reply(message);
  } catch (error) {
    console.error("Error fetching quote:", error);
    reply("⚠️ Failed to fetch quote.");
  }
});

// ==================== MARIGE COMMAND ====================
cmd({
  pattern: "marige",
  alias: ["shadi", "marriage", "wedding"],
  desc: "Randomly pairs two users for marriage with a wedding GIF",
  react: "💍",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { isGroup, groupMetadata, reply, sender }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups!");
    const participants = groupMetadata.participants.map(user => user.id);
    const eligibleParticipants = participants.filter(id => id !== sender && !id.includes(conn.user.id.split('@')[0]));
    if (eligibleParticipants.length < 1) return reply("❌ Not enough participants to perform a marriage!");
    const randomIndex = Math.floor(Math.random() * eligibleParticipants.length);
    const randomPair = eligibleParticipants[randomIndex];
    const apiUrl = "https://api.waifu.pics/sfw/hug";
    let res = await axios.get(apiUrl);
    let gifUrl = res.data.url;
    let gifBuffer = await fetchGif(gifUrl);
    let videoBuffer = await gifToVideo(gifBuffer);
    const message = `💍 *Shadi Mubarak!* 💒\n\n👰 @${sender.split("@")[0]} + 🤵 @${randomPair.split("@")[0]}\n\nMay you both live happily ever after! 💖`;
    await conn.sendMessage(mek.chat, { video: videoBuffer, caption: message, gifPlayback: true, mentions: [sender, randomPair] }, { quoted: mek });
  } catch (error) {
    console.error("❌ Error in .marige command:", error);
    reply(`❌ Error in .marige command: ${error.message}`);
  }
});

// ==================== COSPLAY COMMAND ====================
cmd({
  pattern: "cosplay",
  alias: ["cosplayimg", "cos"],
  react: '📸',
  desc: "Get random cosplay image",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
    const apiUrl = "https://rynekoo-api.hf.space/random/cosplay";
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const imageBuffer = await response.buffer();
    if (!imageBuffer || imageBuffer.length === 0) throw new Error("No image data received");
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    await conn.sendMessage(from, { image: imageBuffer, caption: `*📸 Random Cosplay Image*`, mimetype: "image/jpeg" }, { quoted: mek });
  } catch (error) {
    console.error("Cosplay Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await reply(`❌ Error fetching cosplay image: ${error.message}`);
  }
});

// ==================== JOKE COMMAND ====================
cmd({
  pattern: "joke",
  desc: "Get a random joke",
  react: "🤣",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { reply }) => {
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    const joke = response.data;
    if (!joke || !joke.setup || !joke.punchline) return reply("❌ Failed to fetch a joke. Try again!");
    const jokeMessage = `🤣 *Random Joke:*\n\n*${joke.setup}*\n\n${joke.punchline} 😆`;
    return reply(jokeMessage);
  } catch (error) {
    console.error("❌ Error in joke command:", error);
    return reply("⚠️ Failed to fetch a joke.");
  }
});

// ==================== PICKUP COMMAND ====================
cmd({
    pattern: "pickup",
    alias: ["pickupline", "flirtline"],
    desc: "Get a random pickup line",
    react: "💘",
    category: "fun",
    use: '.pickup',
    filename: __filename
}, async (conn, mek, m, { reply }) => {
    try {
        const { data } = await axios.get('https://apis.davidcyriltech.my.id/pickupline');
        if (!data.success) return reply("❌ Failed to get a pickup line. Try again!");
        await reply(`💝 *Pickup Line* 💝\n\n"${data.pickupline}"\n\n_Use wisely!_`);
    } catch (error) {
        console.error('Pickup Error:', error);
        reply("❌ My charm isn't working right now. Try again later!");
    }
});
