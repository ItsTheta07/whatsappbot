// plugins/ai-models.js - Clean AI Suite
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// Copilot AI
cmd({
    pattern: "copilot",
    alias: ["bing", "msai"],
    desc: "Chat with Microsoft Copilot AI",
    category: "ai",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ *Usage:* .copilot Your question");
    try {
        const res = await axios.get(`https://eliteprotech-apis.zone.id/copilot?q=${encodeURIComponent(q)}`);
        if (res.data && res.data.success) reply(res.data.text);
        else reply("❌ AI Service Error. Please try again.");
    } catch (e) { reply("❌ Failed to connect to AI API."); }
});

// ChatGPT / AI Chat
cmd({
    pattern: "ai",
    alias: ["chatgpt", "gpt", "ask", "chatgptelite"],
    desc: "Ask AI a question",
    category: "ai",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ *Usage:* .ai Your question");
    try {
        const res = await axios.get(`https://eliteprotech-apis.zone.id/chatgpt?prompt=${encodeURIComponent(q)}`);
        if (res.data && res.data.success) reply(res.data.response);
        else reply("❌ AI Service Error. Please try again.");
    } catch (e) { reply("❌ Failed to connect to AI API."); }
});

// Talk AI
cmd({
    pattern: "talkai",
    alias: ["chat", "talk"],
    desc: "Conversational AI chat",
    category: "ai",
    react: "💬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ *Usage:* .talkai Your question");
    try {
        const res = await axios.get(`https://eliteprotech-apis.zone.id/talk-ai?q=${encodeURIComponent(q)}`);
        if (res.data && res.data.success) reply(res.data.response);
        else reply("❌ AI Service Error. Please try again.");
    } catch (e) { reply("❌ Failed to connect to AI API."); }
});

// Brain / Reasoning AI
cmd({
    pattern: "brain",
    alias: ["think", "reason"],
    desc: "Complex reasoning AI",
    category: "ai",
    react: "💡",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    if (!q) return reply("❌ *Usage:* .brain Your question");
    try {
        const res = await axios.get(`https://eliteprotech-apis.zone.id/chatgpt?prompt=${encodeURIComponent(q)}`);
        if (res.data && res.data.success) reply(res.data.response);
        else reply("❌ AI Service Error. Please try again.");
    } catch (e) { reply("❌ Failed to connect to AI API."); }
});
