// index.js - WhatsApp Research Bot Core
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import express from 'express';
import pino from 'pino';
import qrcode from 'qrcode-terminal';
import makeWASocket, {
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    Browsers
} from '@whiskeysockets/baileys';

import config from './config.js';
import { commands } from './command.js';
import { sms } from './lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Express Health Monitor Server
const app = express();
app.get('/', (req, res) => {
    res.json({
        status: 'online',
        bot: config.BOT_NAME,
        mode: config.ONLY_ME ? 'self-only (only you)' : config.MODE,
        totalCommands: commands.length,
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
    });
});

app.listen(config.PORT, () => {
    console.log(`📡 [Server] Web monitor running on http://localhost:${config.PORT}`);
});

// Dynamically Load All Plugin Modules
async function loadPlugins() {
    const pluginsDir = path.join(__dirname, 'plugins');
    if (!fs.existsSync(pluginsDir)) return;

    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'));
    let loadedCount = 0;

    for (const file of files) {
        try {
            const filePath = path.join(pluginsDir, file);
            await import(pathToFileURL(filePath).href);
            loadedCount++;
        } catch (err) {
            console.error(`❌ [Plugin Error] ${file}:`, err.message);
        }
    }
    console.log(`✅ [Plugins] Loaded ${loadedCount}/${files.length} plugin files.`);
    console.log(`⚡ [Commands] Registered ${commands.length} total commands.`);
}

// Connect to WhatsApp
async function startBot() {
    if (!fs.existsSync(config.SESSION_DIR)) {
        fs.mkdirSync(config.SESSION_DIR, { recursive: true });
    }

    const credsPath = path.join(config.SESSION_DIR, 'creds.json');

    // 1. Restore from SESSION_ID environment variable if provided (for cloud deployments)
    if (config.SESSION_ID && !fs.existsSync(credsPath)) {
        try {
            let sessionJson = config.SESSION_ID.trim();
            if (!sessionJson.startsWith('{')) {
                sessionJson = Buffer.from(sessionJson, 'base64').toString('utf8');
            }
            if (sessionJson.startsWith('{')) {
                fs.writeFileSync(credsPath, sessionJson, 'utf8');
                console.log('🔑 [Session] Restored credentials from SESSION_ID env variable.');
            }
        } catch (e) {
            console.error('❌ [Session] Failed to restore SESSION_ID:', e.message);
        }
    }

    // 2. Detect and wipe incomplete/unregistered sessions to prevent 401 error loops
    if (fs.existsSync(credsPath)) {
        try {
            const rawCreds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
            if (!rawCreds.registered) {
                console.log('🧹 [Session] Cleaning up unverified/interrupted pairing credentials...');
                fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
                fs.mkdirSync(config.SESSION_DIR, { recursive: true });
            }
        } catch (_) {
            fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
            fs.mkdirSync(config.SESSION_DIR, { recursive: true });
        }
    }

    const { state, saveCreds } = await useMultiFileAuthState(config.SESSION_DIR);
    const { version } = await fetchLatestBaileysVersion();

    console.log(`🤖 Starting ${config.BOT_NAME} (Baileys v${version.join('.')})...`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: !config.PAIRING_NUMBER,
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        generateHighQualityLinkPreview: true,
    });

    // Request 8-Digit Pairing Code if configured and not yet registered
    if (config.PAIRING_NUMBER && !sock.authState.creds.registered) {
        const cleanNumber = config.PAIRING_NUMBER.replace(/[^0-9]/g, '');
        console.log(`⏳ Requesting fresh pairing code for +${cleanNumber}...`);
        setTimeout(async () => {
            try {
                const code = await sock.requestPairingCode(cleanNumber);
                const formattedCode = code?.match(/.{1,4}/g)?.join('-') || code;
                console.log(`\n=================================================`);
                console.log(`🔑 YOUR WHATSAPP PAIRING CODE: ${formattedCode}`);
                console.log(`Enter this code in: WhatsApp > Linked Devices > Link with Phone Number`);
                console.log(`=================================================\n`);
            } catch (err) {
                console.error('❌ Failed to retrieve pairing code:', err.message);
            }
        }, 3000);
    }

    // Save session credentials
    sock.ev.on('creds.update', saveCreds);

    // Connection Lifecycle
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !config.PAIRING_NUMBER) {
            console.log('\n📲 Scan the QR code below in WhatsApp (Linked Devices > Link a Device):\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            console.log(`\n=================================================`);
            console.log(`🎉 ${config.BOT_NAME} is ONLINE!`);
            console.log(`🛡️  Command Mode: ${config.ONLY_ME ? 'Self-Only (Only your messages trigger commands)' : config.MODE}`);
            console.log(`⌨️  Prefix: "${config.PREFIX}"`);
            console.log(`📦 Loaded Commands: ${commands.length}`);
            console.log(`=================================================`);

            // Print Cloud Deploy Export Key
            try {
                if (fs.existsSync(credsPath)) {
                    const raw = fs.readFileSync(credsPath, 'utf8');
                    const b64 = Buffer.from(raw).toString('base64');
                    console.log(`\n💡 [24/7 Free Cloud Hosting Key]`);
                    console.log(`To run 24/7 on Render / Koyeb without keeping your PC on:`);
                    console.log(`Set environment variable: SESSION_ID=${b64}\n`);
                }
            } catch (_) {}

            try {
                const userJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                await sock.sendMessage(userJid, {
                    text: `🤖 *${config.BOT_NAME} Connected!*\n\n• Mode: *${config.ONLY_ME ? 'Self-Only (Only you)' : config.MODE}*\n• Total Commands: *${commands.length}*\n• Prefix: *${config.PREFIX}*\n\nType *${config.PREFIX}menu* to view commands.`
                });
            } catch (e) {}
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            console.log(`⚠️ Connection closed. Status code: ${statusCode}. Reconnecting: ${shouldReconnect}`);

            if (statusCode === DisconnectReason.loggedOut) {
                console.log('❌ [Session] 401 Unauthorized / Pairing Timed Out.');
                if (fs.existsSync(config.SESSION_DIR)) {
                    try {
                        fs.rmSync(config.SESSION_DIR, { recursive: true, force: true });
                        console.log('🧹 [Session] Stale session files cleaned. You can now restart `npm start` to generate a fresh pairing code.');
                    } catch (_) {}
                }
            } else if (shouldReconnect) {
                console.log('🔄 Reconnecting in 5 seconds...');
                setTimeout(() => startBot(), 5000);
            }
        }
    });

    // Handle Incoming Messages & Command Dispatching
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const rawMsg of messages) {
            try {
                if (!rawMsg.message) continue;

                const from = rawMsg.key.remoteJid;
                if (from === 'status@broadcast') {
                    if (config.AUTO_VIEW_STATUS || config.AUTO_STATUS_SEEN) {
                        await sock.readMessages([rawMsg.key]);
                    }
                    continue;
                }

                // Format message using standard sms() serializer
                const m = sms(sock, rawMsg);
                if (!m.body) continue;

                if (config.READ_MESSAGE) {
                    await sock.readMessages([rawMsg.key]);
                }

                const isGroup = from.endsWith('@g.us');
                const sender = rawMsg.key.fromMe 
                    ? (sock.user.id.split(':')[0] + '@s.whatsapp.net') 
                    : (isGroup ? (rawMsg.key.participant || from) : from);
                const senderNumber = (sender || '').split('@')[0].replace(/[^0-9]/g, '');
                const cleanOwnerNumber = (config.OWNER_NUMBER || '').replace(/[^0-9]/g, '');
                const isOwner = rawMsg.key.fromMe || 
                    (cleanOwnerNumber && senderNumber === cleanOwnerNumber) || 
                    config.SUDO.includes(senderNumber);

                // STRICT USER REQUIREMENT: Only my messages trigger commands
                if (config.ONLY_ME && !isOwner) {
                    continue;
                }

                // Check Command Prefix
                const prefix = config.PREFIX;
                if (!m.body.startsWith(prefix)) continue;

                const bodyWithoutPrefix = m.body.slice(prefix.length).trim();
                const [rawCmdName, ...args] = bodyWithoutPrefix.split(/\s+/);
                const commandName = (rawCmdName || '').toLowerCase();
                const text = args.join(' ');

                // Match registered command or alias
                const command = commands.find(c => 
                    (c.pattern && c.pattern.toLowerCase() === commandName) || 
                    (c.alias && c.alias.map(a => a.toLowerCase()).includes(commandName))
                );

                if (!command) continue;

                // Owner permission check
                if (command.fromMe && !isOwner) {
                    continue;
                }

                // Send Reaction if defined
                if (command.react) {
                    try {
                        await sock.sendMessage(from, { react: { text: command.react, key: rawMsg.key } });
                    } catch(e) {}
                }

                // Gather group context if in group
                let groupMetadata = null;
                let groupName = '';
                let participants = [];
                let groupAdmins = [];
                let isBotAdmins = false;
                let isAdmins = false;

                if (isGroup) {
                    try {
                        groupMetadata = await sock.groupMetadata(from);
                        groupName = groupMetadata.subject;
                        participants = groupMetadata.participants || [];
                        groupAdmins = participants.filter(p => p.admin).map(p => p.id);
                        const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net';
                        isBotAdmins = groupAdmins.includes(botId);
                        isAdmins = groupAdmins.includes(sender);
                    } catch(e) {}
                }

                // Contextual reply helper
                const reply = async (content, options = {}) => {
                    if (typeof content === 'string') {
                        return await sock.sendMessage(from, { text: content }, { quoted: rawMsg, ...options });
                    }
                    return await sock.sendMessage(from, content, { quoted: rawMsg, ...options });
                };

                // Full context passed to plugins
                const context = {
                    from,
                    l: bodyWithoutPrefix,
                    quoted: m.quoted,
                    body: m.body,
                    isCmd: true,
                    command: commandName,
                    args,
                    q: text,
                    text,
                    isGroup,
                    sender,
                    senderNumber,
                    botNumber2: sock.user.id,
                    botNumber: sock.user.id.split(':')[0],
                    pushname: rawMsg.pushName || 'User',
                    isMe: rawMsg.key.fromMe,
                    isOwner,
                    isCreator: isOwner,
                    groupMetadata,
                    groupName,
                    participants,
                    groupAdmins,
                    isBotAdmins,
                    isAdmins,
                    reply,
                    sock,
                    conn: sock,
                    m,
                    mek: rawMsg
                };

                console.log(`⚡ [Command] "${command.pattern || commandName}" executed by ${senderNumber}`);

                // Execute function supporting both function signatures
                if (command.function.length <= 1) {
                    await command.function(context);
                } else {
                    await command.function(sock, rawMsg, m, context);
                }

            } catch (err) {
                console.error(`❌ [Command Execution Error]:`, err);
            }
        }
    });
}

// Initialize
(async () => {
    try {
        await loadPlugins();
        await startBot();
    } catch (err) {
        console.error('Fatal initialization error:', err);
    }
})();

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));
