// plugins/delete.js - Delete Quoted Message
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "delete",
    alias: ["del"],
    desc: "Delete a quoted message",
    react: "🗑️",
    category: "admin",
    filename: __filename
}, async (conn, mek, m, { reply, isCreator, isOwner }) => {
    try {
        if (!m.quoted) {
            return reply("❌ Please reply to a message to delete it!");
        }

        const quotedKey = {
            remoteJid: mek.chat,
            fromMe: m.quoted.fromMe || false,
            id: m.quoted.id,
            participant: m.quoted.sender
        };

        await conn.sendMessage(mek.chat, { delete: quotedKey });

        // Also delete the command trigger message
        try {
            await conn.sendMessage(mek.chat, { delete: mek.key });
        } catch (_) {}

    } catch (err) {
        console.error("Delete command error:", err);
        reply("❌ Failed to delete message. Bot may need admin privileges in groups.");
    }
});
