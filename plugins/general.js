// plugins/general.js
import { cmd, commands } from '../command.js';
import config from '../config.js';
import os from 'os';

cmd({
    pattern: 'ping',
    desc: 'Check bot response latency',
    category: 'general'
}, async ({ sock, m, reply }) => {
    const start = Date.now();
    await reply('🏓 Pong!');
    const latency = Date.now() - start;
    await reply(`⚡ Latency: *${latency}ms*`);
});

cmd({
    pattern: 'alive',
    alias: ['status', 'uptime'],
    desc: 'Check bot status and system stats',
    category: 'general'
}, async ({ reply }) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const timeString = `${hours}h ${minutes}m ${seconds}s`;

    const freeMem = (os.freemem() / (1024 * 1024)).toFixed(0);
    const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(0);

    const message = [
        `🤖 *${config.BOT_NAME} Status*`,
        `━━━━━━━━━━━━━━━━━━`,
        `⏱ *Uptime:* ${timeString}`,
        `💻 *RAM:* ${totalMem - freeMem}MB / ${totalMem}MB`,
        `⚙️ *Node.js:* ${process.version}`,
        `🛡️ *Mode:* ${config.ONLY_ME ? 'Self-Only (Only You)' : config.MODE}`,
        `Prefix: *${config.PREFIX}*`,
        `━━━━━━━━━━━━━━━━━━`,
        `Status: *Active & Connected*`
    ].join('\n');

    await reply(message);
});

cmd({
    pattern: 'menu',
    alias: ['help', 'commands'],
    desc: 'Display available bot commands',
    category: 'general'
}, async ({ reply }) => {
    const categories = {};

    for (const command of commands) {
        if (command.dontAddCommandList) continue;
        const cat = command.category || 'general';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(command);
    }

    let menuText = `📋 *${config.BOT_NAME} - Command Menu*\n`;
    menuText += `🛡️ Mode: *${config.ONLY_ME ? 'Self-Only' : config.MODE}* | Prefix: *${config.PREFIX}*\n\n`;

    for (const [category, cmds] of Object.entries(categories)) {
        menuText += `*╭─「 ${category.toUpperCase()} 」*\n`;
        for (const c of cmds) {
            menuText += `│ ▫ *${config.PREFIX}${c.pattern}* ${c.desc ? `- ${c.desc}` : ''}\n`;
        }
        menuText += `*╰───────────────────*\n\n`;
    }

    menuText += `_Tip: Only authorized messages trigger these commands._`;

    await reply(menuText.trim());
});
