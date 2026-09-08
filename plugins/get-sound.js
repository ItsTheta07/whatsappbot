// plugins/get-sound.js - Sound Effects
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

const soundUrls = [
    'https://files.catbox.moe/pw4yuu.mp3',
    'https://files.catbox.moe/tuueyw.mp3',
    'https://files.catbox.moe/q56rza.mp3',
    'https://files.catbox.moe/ldrebe.mp3',
    'https://files.catbox.moe/cpjqjd.mp3',
    'https://files.catbox.moe/v5c4fd.mp3',
    'https://files.catbox.moe/naub62.mp3',
    'https://files.catbox.moe/ez7wvh.mp3',
    'https://files.catbox.moe/3ruryr.mp3',
    'https://files.catbox.moe/vxfry5.mp3',
    'https://files.catbox.moe/hk2fjw.mp3',
    'https://files.catbox.moe/pvymqf.mp3',
    'https://files.catbox.moe/md2jm5.mp3',
    'https://files.catbox.moe/ypx92a.mp3',
    'https://files.catbox.moe/7tv2do.mp3',
    'https://files.catbox.moe/sr8k3y.mp3'
];

cmd({
    pattern: "sound",
    alias: ["soundeffect", "sfx"],
    desc: "Play sound effect (1-16)",
    category: "sound",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        let index = 0;
        if (args[0] && !isNaN(args[0])) {
            const num = parseInt(args[0], 10);
            if (num >= 1 && num <= soundUrls.length) {
                index = num - 1;
            } else {
                return reply(`🎵 Available sound effects: 1 to ${soundUrls.length}\n*Example:* .sound 3`);
            }
        } else {
            // Pick random sound if not specified
            index = Math.floor(Math.random() * soundUrls.length);
        }

        await conn.sendMessage(from, { 
            audio: { url: soundUrls[index] }, 
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: mek });
    } catch (e) {
        console.error("Error in sound command:", e);
        await reply("❌ Failed to play sound. Please try again.");
    }
});
