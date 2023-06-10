'use strict';

import util from 'util';

export default {
  views: ['sendvideo'], // view for message in  menu
  command: /^send(video|vidio)$/i, //another command.
  description: 'Send Video from Url valid',
  query: true,
  url: true,
  video: true,
  usage: '%cmd% url valid video',
  execute: async (tools, { isVideoUrl }) => {
    const { xcoders, waitingMessage, errorMessage, m, x, response, query } = tools;
    try {
      if (!await isVideoUrl(query)) throw _.sample(response.error.url);
      await waitingMessage(m.chat);
      return xcoders.sendFileFromUrl(m.chat, query, response.success, x);
    } catch (error) {
      return errorMessage(m.chat, error);
    }
  }
};