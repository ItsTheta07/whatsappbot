// plugins/system.js
import { cmd } from '../command.js';
import config from '../config.js';

cmd({
    pattern: 'restart',
    desc: 'Restart bot process',
    category: 'system',
    fromMe: true
}, async ({ reply }) => {
    await reply('🔄 Restarting bot process...');
    setTimeout(() => {
        process.exit(0);
    }, 1000);
});

cmd({
    pattern: 'eval',
    alias: ['>'],
    desc: 'Execute JavaScript code for debugging',
    category: 'system',
    fromMe: true
}, async ({ text, reply, sock, m }) => {
    if (!text) return await reply('⚠️ Provide code to evaluate.');
    try {
        let result = await eval(`(async () => { ${text} })()`);
        if (typeof result !== 'string') {
            result = (await import('util')).inspect(result, { depth: 2 });
        }
        await reply(`💻 *Result:*\n\`\`\`${result}\`\`\``);
    } catch (err) {
        await reply(`❌ *Error:*\n\`\`\`${err.message}\`\`\``);
    }
});
