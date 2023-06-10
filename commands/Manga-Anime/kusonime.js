'use strict';

export default {
  views: ['kusonime'], // view for message in  menu
  command: /^kusonime/i, //another command.
  description: 'Get Result Search From kusonime Website',
  query: true,
  usage: '%cmd%',
  execute: async ({ xcoders, x, m, query, styleMessage, errorMessage, waitingMessage, apikeys, host }, { getMessage, getJson }, { addHitCommand }) => {
    try {
      const data = await getJson(`${host}/api/anime/kusonime?query=${query}&apikey=${apikeys}`);
      if (!data.status) return errorMessage(m.chat, getMessage(data), 'Kusonime Search');
      await waitingMessage(m.chat);
      const result = data.result.map(object => {
        let results = '';
        const keys = Object.keys(object);
        for (let key of keys) {
          results += `• ${key}: ${object[key]}\n`
        }
        return results;
      }).join('\n\n');
      const caption = styleMessage('Kusonime Search Result', result);
      addHitCommand('Kusonime Search', true);
      return xcoders.sendFileFromUrl(m.chat, data.result[0].thumbnail, caption, x);
    } catch (error) {
      addHitCommand('Kusonime Search', false);
      throw error;
    }
  }
};