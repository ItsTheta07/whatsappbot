// lib/serialize.js
import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';

/**
 * Serialize and enhance a Baileys message object for clean handling
 * @param {import('@whiskeysockets/baileys').WASocket} sock 
 * @param {import('@whiskeysockets/baileys').proto.IWebMessageInfo} msg 
 */
export function serializeMessage(sock, msg) {
    if (!msg.message) return msg;

    const m = { ...msg };
    m.id = m.key.id;
    m.isBaileys = m.id.startsWith('BAE5') && m.id.length === 16;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith('@g.us');
    m.sender = m.fromMe 
        ? sock.user.id.split(':')[0] + '@s.whatsapp.net' 
        : (m.isGroup ? m.key.participant : m.chat);

    m.type = getContentType(m.message);
    m.msg = (m.type === 'viewOnceMessage' 
        ? m.message[m.type].message[getContentType(m.message[m.type].message)] 
        : m.message[m.type]);

    // Extract body text
    m.body = m.message.conversation 
        || m.message[m.type]?.text 
        || m.message[m.type]?.caption 
        || m.message[m.type]?.selectedId 
        || (m.type === 'extendedTextMessage' ? m.message.extendedTextMessage?.text : '')
        || '';

    // Handle quoted messages
    const contextInfo = m.msg?.contextInfo;
    if (contextInfo && contextInfo.quotedMessage) {
        m.quoted = {
            key: {
                remoteJid: m.chat,
                fromMe: contextInfo.participant === sock.user?.id?.split(':')[0] + '@s.whatsapp.net',
                id: contextInfo.stanzaId,
                participant: contextInfo.participant
            },
            message: contextInfo.quotedMessage,
            type: getContentType(contextInfo.quotedMessage),
            sender: contextInfo.participant
        };
        m.quoted.msg = m.quoted.message[m.quoted.type];
        m.quoted.body = m.quoted.message.conversation 
            || m.quoted.msg?.text 
            || m.quoted.msg?.caption 
            || '';
        
        m.quoted.download = async () => {
            return await downloadMediaMessage(
                { key: m.quoted.key, message: m.quoted.message },
                'buffer',
                {}
            );
        };
    } else {
        m.quoted = null;
    }

    // Media download helper on current message
    m.download = async () => {
        return await downloadMediaMessage(m, 'buffer', {});
    };

    // Easy reply helper
    m.reply = async (content, options = {}) => {
        if (typeof content === 'string') {
            return await sock.sendMessage(m.chat, { text: content }, { quoted: m, ...options });
        }
        return await sock.sendMessage(m.chat, content, { quoted: m, ...options });
    };

    return m;
}
