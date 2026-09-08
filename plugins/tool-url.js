// plugins/tool-url.js - Image Enhancement Tools
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to upload to Uguu
async function uploadToUguu(buffer, mimeType) {
    let extension = '.jpg';
    if (mimeType.includes('image/png')) extension = '.png';
    else if (mimeType.includes('image/webp')) extension = '.webp';

    const fileName = `image${extension}`;
    const form = new FormData();
    form.append('files[]', buffer, fileName);

    const response = await axios.post("https://uguu.se/upload", form, {
        headers: {
            ...form.getHeaders(),
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; Mobile)"
        },
        timeout: 60000
    });

    if (response.data && response.data.files && response.data.files[0]) {
        return response.data.files[0].url;
    }
    throw new Error("Failed to upload image to temporary hosting");
}

// Unified Upscale Command
cmd({
    pattern: "upscale",
    alias: ["hd", "scale"],
    desc: "Upscale image resolution (1-16)",
    category: "tools",
    react: "🔼",
    filename: __filename,
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image. Example: .upscale 2");

        let resolusi = 2;
        if (args[0] && !isNaN(args[0])) {
            resolusi = Math.min(Math.max(parseInt(args[0]), 1), 16);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);

        const apiUrl = `https://api.nexray.web.id/tools/upscale?url=${encodedUrl}&resolusi=${resolusi}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: `*✅ Image Upscaled (Resolution ${resolusi}x)*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Upscale Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Unified Enhance Command
cmd({
    pattern: "enhance",
    alias: ["enh", "remini", "hdquality"],
    desc: "Enhance image quality (1, 4, 8, 16)",
    category: "tools",
    react: "🔆",
    filename: __filename,
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image. Example: .enhance 4");

        let resolusi = 4;
        if (args[0] && [1, 4, 8, 16].includes(parseInt(args[0]))) {
            resolusi = parseInt(args[0]);
        }

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);

        const apiUrl = `https://api.nexray.web.id/tools/enhancer?url=${encodedUrl}&resolusi=${resolusi}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: `*✅ Image Enhanced (Resolution ${resolusi}x)*`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Enhance Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Unblur Command
cmd({
    pattern: "unblur",
    alias: ["sharpen"],
    desc: "Remove blur from image",
    category: "tools",
    react: "✨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);

        const apiUrl = `https://api.nexray.web.id/tools/unblur?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: "*✅ Image Unblurred Successfully*"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Unblur Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Remove Background Command
cmd({
    pattern: "removebg",
    alias: ["nobg", "rmbg"],
    desc: "Remove background from image",
    category: "tools",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);

        const apiUrl = `https://api.nexray.web.id/tools/removebg?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: "*✅ Background Removed*"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('RemoveBG Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});

// Colorize Command
cmd({
    pattern: "colorize",
    alias: ["color", "addcolor"],
    desc: "Add color to black and white images",
    category: "tools",
    react: "🌈",
    filename: __filename,
}, async (conn, mek, m, { from, reply }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        if (!/image/.test(mime)) return reply("📸 Please reply to an image");

        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const mediaBuffer = await q.download();
        const imageUrl = await uploadToUguu(mediaBuffer, mime);
        const encodedUrl = encodeURIComponent(imageUrl);

        const apiUrl = `https://api.nexray.web.id/tools/colorize?url=${encodedUrl}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });

        await conn.sendMessage(from, { 
            image: Buffer.from(response.data), 
            caption: "*✅ Image Colorized Successfully*"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        console.error('Colorize Error:', e);
        reply(`❌ Error: ${e.message}`);
    }
});
