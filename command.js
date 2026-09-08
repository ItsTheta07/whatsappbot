// command.js - ESM Version
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const commands = [];

function cmd(info, func) {
    var data = { ...info };
    data.function = func;
    if (!data.dontAddCommandList) data.dontAddCommandList = false;
    if (!info.desc) data.desc = '';
    if (!data.fromMe) data.fromMe = false;
    if (!info.category) data.category = 'misc';
    if (!info.filename) data.filename = "Not Provided";
    
    // Support pattern as string or array
    if (info.pattern) data.pattern = info.pattern;
    if (info.alias) data.alias = Array.isArray(info.alias) ? info.alias : [info.alias];
    else data.alias = [];

    // Deduplicate commands
    const existingIdx = commands.findIndex(c => c.pattern === data.pattern);
    if (existingIdx !== -1) {
        commands[existingIdx] = data;
    } else {
        commands.push(data);
    }
    return data;
}

export {
    cmd,
    cmd as AddCommand,
    cmd as Function,
    cmd as Module,
    commands
};
