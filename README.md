# WhatsApp Research Bot

A clean, modular WhatsApp bot built with Node.js and [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys). Configured specifically for research and testing on temporary or secondary WhatsApp accounts, with built-in self-only command security.

---

## Key Features

- **Built-in Session Authentication:** Link directly in your terminal using either:
  - **8-Digit Pairing Code** (no phone camera / QR scan needed), or
  - **Terminal QR Code**
- **Strict Self-Only Execution:** Commands can be locked so that **only your messages** can trigger actions (`ONLY_ME=true`).
- **Modular Plugin Engine:** Simple command registration in `./plugins/` loaded dynamically at startup.
- **Built-in Web Monitor:** Embedded Express server on port `9090` for status and uptime pings.
- **Clean Architecture:** No third-party redirect portals, telemetry, or external pairing servers.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18 or higher (v20+ recommended)
- **WhatsApp Account**: Recommended to use a temporary / test account for research.

### 2. Configuration
Copy the example environment file:
```bash
cp config.env.example config.env
```
Or create a `config.env` file in the project root:

```env
# Bot Settings
BOT_NAME=Research-Bot
PREFIX=.
MODE=self
ONLY_ME=true

# Pairing Options:
# Option A: Put your phone number here to get an 8-digit code in the terminal
PAIRING_NUMBER=15551234567

# Option B: Leave PAIRING_NUMBER empty if you want to scan a QR code in the terminal
# PAIRING_NUMBER=

# Owner WhatsApp Number (country code + number, no + or spaces)
OWNER_NUMBER=15551234567
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Bot
```bash
npm start
```

### 5. Link Your WhatsApp Account

#### Method A: Using Pairing Code (Recommended)
1. Set `PAIRING_NUMBER=your_number` in `config.env` (e.g. `15551234567`).
2. Run `npm start`.
3. The terminal will output an 8-digit code (e.g. `1234-5678`).
4. On your phone: Open **WhatsApp** > **Settings** > **Linked Devices** > **Link with phone number instead**.
5. Type the 8-digit code shown in the terminal.
6. The bot will authenticate, save your session to `./session/`, and come online!

#### Method B: Using QR Code
1. Leave `PAIRING_NUMBER` empty in `config.env`.
2. Run `npm start`.
3. A QR code will display directly in your terminal.
4. On your phone: Open **WhatsApp** > **Settings** > **Linked Devices** > **Link a Device** and scan the terminal QR.

---

## Available Commands

All commands use the prefix defined in `config.env` (default is `.`):

| Command | Alias | Description |
|---|---|---|
| `.ping` | | Measures bot response latency in milliseconds |
| `.alive` | `.status`, `.uptime` | Shows bot uptime, RAM usage, and connection status |
| `.menu` | `.help` | Displays all registered commands by category |
| `.sticker` | `.s` | Converts replied image or short video into a sticker |
| `.tts <lang> <text>` | | Converts text to speech voice note (e.g. `.tts en Hello world`) |
| `.tr <lang> <text>` | `.translate` | Translates text into target language (e.g. `.tr es Good morning`) |
| `.restart` | | Restarts the bot process |
| `.eval <code>` | `>` | Evaluates JavaScript expression for research and debugging |

---

## Strict Self-Only Security (`ONLY_ME`)

When `ONLY_ME=true` in `config.env`:
- The bot **only** processes commands sent by **you** (`fromMe: true` or matching `OWNER_NUMBER`).
- Messages from other people in private chats or groups are completely ignored.

---

## Disclaimer
This project is intended strictly for educational and research purposes using temporary/disposable accounts. Automation on WhatsApp accounts without the official WhatsApp Business Cloud API violates WhatsApp's Terms of Service.
