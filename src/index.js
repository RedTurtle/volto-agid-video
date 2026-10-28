export {
  AgidVideoPlayer,
  VideoEmbed,
  getVideoSource,
  getVideoMimeType,
  getYouTubeSrc,
  isYouTubeUrl,
  isVimeoUrl,
} from '@redturtle/volto-agid-video/components/AgidVideoPlayer';

const applyConfig = (config) => {
  config.settings.agidVideo = {
    // opzioni di video.js applicate a tutti i player
    // https://videojs.com/guides/options/
    options: {},
    // traduzioni aggiuntive di video.js, { [lang]: { 'Play': '...', ... } }
    translations: {},
    // funzione di init di plugin aggiuntivi di video.js, riceve videojs
    initPlugins: null,
    ...(config.settings.agidVideo ?? {}),
  };

  return config;
};

export default applyConfig;
