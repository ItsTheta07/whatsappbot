// plugins/anti-once.js - Retrieve View Once Media
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "vv",
    alias: ["viewonce", "retrieve", "antiviewonce"],
    react: '👁️',
    desc: "Retrieve quoted view-once media (Owner Only)",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isOwner, reply, args }) => {
    try {
        if (!isOwner) {
            return reply("*👑 This command is restricted to the bot owner.*");
        }

        const quotedMsg = m.quoted;
        if (!quotedMsg) {
            return reply("*🍁 Please reply to a view once message!*");
        }

        if (!quotedMsg.viewOnce) {
            return reply("*❌ Quoted message is not a view-once message!*");
        }

        const buffer = await quotedMsg.download();
        const mtype = quotedMsg.mtype;
        const originalCaption = quotedMsg.text || '';
        const caption = originalCaption ? `${originalCaption}\n\n> ${config.BOT_NAME}` : `> ${config.BOT_NAME}`;

        let messageContent = {};
        switch (mtype) {
            case "imageMessage":
                messageContent = {
                    image: buffer,
                    caption: caption,
                    mimetype: quotedMsg.mimetype || "image/jpeg"
                };
                break;
            case "videoMessage":
                messageContent = {
                    video: buffer,
                    caption: caption,
                    mimetype: quotedMsg.mimetype || "video/mp4"
                };
                break;
            case "audioMessage":
                messageContent = {
                    audio: buffer,
                    mimetype: "audio/mp4",
                    ptt: quotedMsg.ptt || false
                };
                break;
            default:
                return reply("❌ Only image, video, and audio view-once messages are supported.");
        }

        // Send to current chat or to DM if "dm" argument passed
        const targetChat = (args[0] === 'dm') ? m.sender : from;
        await conn.sendMessage(targetChat, messageContent, { quoted: mek });
    } catch (error) {
        console.error("View-Once Retrieval Error:", error);
        reply(`❌ Error retrieving view-once media: ${error.message}`);
    }
});
