import '../configs/global.js';
import _ from 'lodash';
import fs from 'fs';
import chalk from 'chalk';
import util from 'util';
import moment from 'moment-timezone';
import child from 'child_process';

import regex from '../configs/regex.js';
import Canvas from '../library/canvas.js';
import emojiRegex from '../library/emojiRegex.js';
import hitCommands from '../library/hitCommand.js';
import Similarity from '../library/similarity.js';
import functions from '../library/functions.js';

const delay = Baileys.delay;
const jidNormalizedUser = Baileys.jidNormalizedUser;
const plugins = global.plugins;
const owners = global.ownerNumber;
const apikeys = global.apikeys;
const watermark = global.watermark;
const thumbnail = global.thumbnail;
const response = global.response;

export default async (xcoders, x, m) => {
  try {
    const prefix = global.multiprefix ? (/^[+!#|÷?%^&./\\©^]/.test(m.body) ? (m.body).substr(0, 1) : '.') : global.nonprefix ? '' : global.prefix;
    const isCommand = m.body?.startsWith(prefix);
    const command = isCommand ? (global.nonprefix ? (m.body).trim() : (m.body).slice(1).trim()).split(/ +/).shift().toLowerCase() : null;
    const body = typeof m.text == 'string' ? m.text : '';
    const query = isCommand ? m.body?.slice((`${prefix}${command}`).length).trim() : '';
    const quoted = m.quoted ? m.quoted : m;
    const mimetype = quoted.coders ? quoted.coders.mimetype : quoted.mimetype;
    const isCreators = m.fromMe || owners && owners.includes(m.sender);
    const senderName = x.pushName || 'unknown';
    const groupId = m.isGroups ? m.chat : '';
    const metadataGroups = m.isGroups ? await xcoders.groupMetadata(groupId).catch((_) => null) : {};
    const getParticipants = m.isGroups ? metadataGroups?.participants : [];
    const getAdminsGroups = m.isGroups ? getParticipants?.filter(index => index.admin !== null) : [];
    const isAdminsGroups = m.isGroups ? getAdminsGroups?.includes(m.sender) : false;
    const isBotAdminsGroups = m.isGroups ? getAdminsGroups?.includes(jidNormalizedUser(xcoders.user.id)) : false;
    const getCurrentTime = moment.tz('Asia/Jakarta').locale('id').format('HH:mm');
    const host = original ? restApi[0] : restApi[1];

    const waitingMessage = async (jid) => {
      await xcoders.sendMessage(jid, { text: _.sample(response.process), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    };
    const errorMessage = async (jid, msg, title) => {
      if (title) hitCommands.addHitCommand(title, false);
      const serializeMessage = msg.message ? msg.message : typeof msg === 'string' ? msg : _.sample(response.error.request);
      await xcoders.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await xcoders.sendMessage(jid, { text: /\*/.test(serializeMessage) ? serializeMessage : `*${serializeMessage}*`, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
      console.error(msg);
    };
    const invalidUrlMessage = async (jid) => {
      await xcoders.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      await xcoders.sendMessage(jid, { text: _.sample(response.error.url), contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    };
    const replyMessage = async (text, type) => {
      if (type == 'info') await xcoders.sendMessage(m.chat, { react: { text: '❗', key: m.key } });
      if (type == 'error') await xcoders.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      await xcoders.sendMessage(m.chat, { text, contextInfo: { forwardingScore: 9999999, isForwarded: true } }, { quoted: x });
    };
    const styleMessage = (title, string) => {
      const content = string.replaceAll(': •', '').replace(/•/g, '*᛭').replace(/: /g, ':* ');
      return (title ? `\r \r \r \r \r ⋞ ${'```' + title + '```'} ⋟\n\n${content}\n\n${watermark}` : `\n\n${content}\n\n${watermark}`).trim();
    };

    if (isCommand) console.log(chalk.bgBlack.red.italic.bold(getCurrentTime), chalk.bold.italic.green(`[ EXEC ${command.toUpperCase()} ]`), chalk.italic.greenBright.bold('From'), chalk.bold.italic.yellow(senderName), m.isGroups ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(metadataGroups?.subject) : '');
    if (!isCommand) console.log(chalk.bgBlack.italic.red.bold(getCurrentTime), chalk.italic.red('[ MSG ]'), chalk.bold.italic.greenBright('From'), chalk.italic.bold.yellow(senderName), m.isGroups ? chalk.italic.bold.greenBright('in ') + chalk.italic.bold.yellow(metadataGroups?.subject) : '');
    if (isCommand && m.isBaileys) return;
    if (!global.public && isCommand && !isCreators) return;

    if (!m.isBaileys && body && body.startsWith('>')) {
      if (!isCreators) return;
      try {
        const evaling = await eval(`;(async () => {
          ${body.slice(2)}
          })();`);
        const utilites = util.format(evaling);
        return replyMessage(utilites);
      } catch (error) {
        return replyMessage(util.format(error));
      }
    }
    if (!m.isBaileys && body && body.startsWith('=>')) {
      if (!isCreators) return;
      try {
        const evaling = await eval(`;(async () => {
          return ${body.slice(3)}
          })();`);
        const utilites = util.format(evaling);
        return replyMessage(utilites);
      } catch (error) {
        return replyMessage(util.format(error));
      }
    }
    if (!m.isBaileys && body && body.startsWith('$')) {
      if (!isCreators) return;
      try {
        const commandExec = body.slice(2);
        if (!commandExec) return replyMessage('✖️ Command Execution not detected.', 'info');
        child.exec(commandExec, (error, stdout) => {
          if (error) return replyMessage(util.format(error));
          if (stdout) return replyMessage(util.format(stdout));
        });
      } catch (error) {
        return replyMessage(util.format(error));
      }
    }
    if (body.startsWith('tes') && isCreators && !m.isBaileys) {
      return replyMessage('```Online ' + functions.formatDuration(process.uptime()) + '```');
    }

    // reload server every 5 minutes
    setInterval(async () => {
      if (process.env.REPL_OWNER) {
        const url = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
        await fetch(url).then((response) => response.json()).then(() => console.log('sucessfully loaded server...')).catch((error) => console.error(error));
      }
    }, 300000)
    // save database every 1 minutes
    setInterval(function () {
      fs.writeFileSync('./database/allCommands.json', JSON.stringify(global.allCommands, null, 2));
      fs.writeFileSync('./database/hit.json', JSON.stringify(global.hitCommand, null, 2));
    }, 600000);

    if (!isCommand) return;
    for (let keys of Object.keys(plugins)) {
      const Functions = plugins[keys];
      const getCommand = Functions.command;
      const regexp = new RegExp(getCommand);
      if (regexp.test(command)) {
        await xcoders.readMessages([m.key]);
        await xcoders.sendMessage(m.chat, { react: { text: '🕛', key: m.key } });
        if (Functions.query && (query.includes('--usage') || !query)) {
          const caption = styleMessage(Functions.description, `• Usage: ${Functions.usage.replace('%cmd%', prefix + command)}`);
          return replyMessage(caption);
        } else {
          if (Functions.text && regex.isUrl(query)) return replyMessage('Query yang dibutuhkan adalah teks.', 'info');
          if (Functions.url) {
            if (!query.startsWith('http')) return errorMessage(m.chat, 'Invalid url query', 'info');
            if (!regex.isUrl(query)) {
              return replyMessage('Query yang dibutuhkan adalah URL.', 'info');
            } else if (Functions.image) {
              if (!(await functions.isImageUrl(query))) return replyMessage('Query yang dibutuhkan adalah URL gambar yang valid.', 'info');
            } else if (Functions.video) {
              if (!(await functions.isVideoUrl(query))) return replyMessage('Query yang dibutuhkan adalah URL video yang valid.', 'info');
            } else if (Functions.audio) {
              if (!(await functions.isAudioUrl(query))) return replyMessage('Query yang dibutuhkan adalah URL audio yang valid.', 'info');
            }
          }
        }
        if (Functions.owner && !isCreators) return replyMessage(response.isCreator);
        if (Functions.onlyGroup && !m.isGroups) return replyMessage('Fitur ini hanya bisa digunakan didalam group', 'info');
        if (Functions.media && !mimetype) return replyMessage('Reply atau kirim media image atau video untuk meneruskan command tersebut.', 'info');
        if (!allCommands.includes(command)) allCommands.push(command);
        const tools = { command, xcoders, m, x, prefix, owners, senderName, thumbnail, waitingMessage, query, replyMessage, styleMessage, invalidUrlMessage, errorMessage, response, isCreators, isBotAdminsGroups, isAdminsGroups, getParticipants, metadataGroups, apikeys, mimetype, quoted, regex, delay, host };
        return Functions.execute(Object.assign(tools, { ...functions, emojiRegex, canvas: Canvas, addHitCommand: hitCommands.addHitCommand }));
      }
    }

    if (!m.isGroups) {
      const checkCommand = Similarity.exec(allCommands, command, 0.4);
      if (!checkCommand || checkCommand.length === 0) {
        return replyMessage('*_perintah tidak ada yang cocok, coba periksa kembali command anda!_*', 'error');
      } else {
        const resultCommand = checkCommand.map((obj) => {
          return `➽ *${prefix + obj.index} ⋞ ${obj.score.toFixed(2)}% ⋟*\n`;
        }).join('');
        return replyMessage('```Mungkin command yang anda maksud adalah:\n\n```' + resultCommand.trim(), 'info');
      }
    }
  } catch (error) {
    console.error(chalk.redBright(`[ ERROR ] ${moment().format('HH:mm:ss')}`), error);
  }
};

const files = global.absoluteUrl(import.meta.url);
fs.watchFile(files, () => {
  fs.unwatchFile(files);
  logger.info('Update index.commands.js');
  import(`${files}?update=${Date.now()}`);
});