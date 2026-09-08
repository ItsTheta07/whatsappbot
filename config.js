// config.js - ESM Version
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (fs.existsSync(path.resolve('config.env'))) {
  dotenv.config({ path: path.resolve('config.env') });
} else if (fs.existsSync(path.resolve('.env'))) {
  dotenv.config({ path: path.resolve('.env') });
}

function convertToBool(text, trueValue = 'true') {
  return String(text).toLowerCase() === String(trueValue).toLowerCase();
}

export default {
  // ===== BOT CORE SETTINGS =====
  SESSION_ID: process.env.SESSION_ID || "",
  PREFIX: process.env.PREFIX || ".",
  CHATBOT: process.env.CHATBOT || "off",
  BOT_NAME: process.env.BOT_NAME || "Research-Bot",
  MODE: process.env.MODE || "self", // "self", "private", "public"
  ONLY_ME: convertToBool(process.env.ONLY_ME ?? "true"), // Strict mode: ONLY your messages trigger commands
  REPO: process.env.REPO || "",
  WEBPAIR: process.env.WEBPAIR || "",
  NEWSLETTERID: process.env.NEWSLETTERID || "",
  SESSION_DIR: process.env.SESSION_DIR || path.join(__dirname, 'session'),
  PAIRING_NUMBER: process.env.PAIRING_NUMBER || "923187072713",
  PORT: process.env.PORT || 9090,

  // ===== OWNER SETTINGS =====
  OWNER_NUMBER: process.env.OWNER_NUMBER || "923187072713",
  OWNER_NAME: process.env.OWNER_NAME || "Admin",
  SUDO: process.env.SUDO 
    ? process.env.SUDO.split(',').map(s => s.trim().replace(/[^0-9]/g, '')) 
    : [],
  BANNED: process.env.BANNED 
    ? process.env.BANNED.split(',').map(s => s.trim()) 
    : [],
  STATUS_LIKE_EMOJIS: ["❤️", "🔥", "👍", "😍", "💯"],
  REACT_EMOJIS: ["❤️", "🔥", "👍", "😍", "😂", "😮", "😎", "🥰", "👋", "🤝", "💯", "✨", "⭐", "🎉", "⚡", "🎯"],
  OWNER_EMOJIS: ["👑", "💎", "⭐", "✨", "🔥", "💯", "✅", "🎉", "🤖", "⚡"],
  LINK_WARNINGS: [],

  // ===== AUTO-RESPONSE SETTINGS =====
  AUTO_REPLY: process.env.AUTO_REPLY || "false",
  AUTO_STATUS_REPLY: process.env.AUTO_STATUS_REPLY || "false",
  AUTO_STATUS_MSG: process.env.AUTO_STATUS_MSG || "*Viewed status*",
  READ_MESSAGE: process.env.READ_MESSAGE || "false",
  REJECT_MSG: process.env.REJECT_MSG || "*Calls not allowed*",

  // ===== REACTION & MEDIA SETTINGS =====
  AUTO_REACT: process.env.AUTO_REACT || "false",
  OWNER_REACT: process.env.OWNER_REACT || "false",
  STICKER_NAME: process.env.STICKER_NAME || "Research-Bot",
  AUTO_STICKER: process.env.AUTO_STICKER || "false",
  AUTO_VOICE: process.env.AUTO_VOICE || "false",
  STATUS_SENDER: process.env.STATUS_SENDER || "false",
  MENU_IMAGE_URL: process.env.MENU_IMAGE_URL || "",
  BOT_MEDIA_URL: process.env.BOT_MEDIA_URL || "",
  AUDIO_URL: process.env.AUDIO_URL || "",
  AUTO_DOWNLOADER: process.env.AUTO_DOWNLOADER || "false",

  // ===== AUTO PRESENCE SETTINGS =====
  ALWAYS_ONLINE: process.env.ALWAYS_ONLINE || "false",
  AUTO_TYPING: process.env.AUTO_TYPING || "false",
  AUTO_RECORDING: process.env.AUTO_RECORDING || "false",

  // ===== ANTI FEATURES SETTINGS =====
  ANTI_LINK: process.env.ANTI_LINK || "false",
  ANTI_STATUS: process.env.ANTI_STATUS || "false",
  ANTI_BAD_WORD: process.env.ANTI_BAD_WORD || "false",
  ANTI_DELETE: process.env.ANTI_DELETE || "false",
  ANTI_DELETE_PATH: process.env.ANTI_DELETE_PATH || "inbox",
  ANTI_CALL: process.env.ANTI_CALL || "false",
  ANTI_SPAM: process.env.ANTI_SPAM || "false",
  ANTI_VV: process.env.ANTI_VV || "false",
  ANTI_BOT: process.env.ANTI_BOT || "false",
  PM_BLOCKER: process.env.PM_BLOCKER || "false",
  ANTI_MENTION: process.env.ANTI_MENTION || "false",
  ANTI_STATUS_MENTION: process.env.ANTI_STATUS_MENTION || "false",
  ANTI_EDIT: process.env.ANTI_EDIT || "false",
  ANTIEDIT_PATH: process.env.ANTIEDIT_PATH || "inbox",

  // ===== BOT BEHAVIOR & APPEARANCE =====
  DESCRIPTION: process.env.DESCRIPTION || "WhatsApp Research Bot",
  AUTO_VIEW_STATUS: process.env.AUTO_VIEW_STATUS || "false",
  AUTO_LIKE_STATUS: process.env.AUTO_LIKE_STATUS || "false",
  AUTO_BIO: process.env.AUTO_BIO || "false",
  AUTO_LIKE_EMOJI: ["❤️", "🔥", "👍", "😍"],
  
  // ===== WELCOME & GOODBYE SETTINGS =====
  WELCOME: process.env.WELCOME || "false",
  GOODBYE: process.env.GOODBYE || "false",
  ADMIN_ACTION: process.env.ADMIN_ACTION || "false",
  WELCOME_MESSAGE: process.env.WELCOME_MESSAGE || "Welcome to the group!",
  GOODBYE_MESSAGE: process.env.GOODBYE_MESSAGE || "Goodbye!",

  VERSION: "1.0.0",
  TIMEZONE: process.env.TIMEZONE || "UTC",
};