import {
  isInternalURL,
  flattenToAppURL,
  getParentUrl,
} from '@plone/volto/helpers/Url/Url';
import config from '@plone/volto/registry';

/*
 Rileva se l'url passato corrisponde a un video di YouTube
 (stessa regex di dev-kit-italia/packages/video, estesa a youtube-nocookie)
*/
const youtubeRegex =
  /^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/|live\/|playlist\?list=|embed\/videoseries\?list=)|youtu\.be\/)([a-zA-Z0-9_-]{11}|[a-zA-Z0-9_-]{34})(?:[&?][^\s]*)?$/;

// Vimeo IDs sono solo numerici
const vimeoRegex =
  // eslint-disable-next-line no-useless-escape
  /(?:http|https)?:?\/?\/?(?:www\.)?(?:player\.)?vimeo\.com\/(?:(?:channels\/(?:[\w*\/]*\/))|(?:groups\/(?:[\w*\/]*\/))|(?:videos\/|video\/|albums\/))?(\d+)/i;

const mimeTypes = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  m3u8: 'application/x-mpegURL',
  mpd: 'application/dash+xml',
};

export const DEFAULT_VIDEO_TYPE = 'video/mp4';

export const isYouTubeUrl = (url) =>
  !!url && (youtubeRegex.test(url) || /youtu\.?be/.test(url));

export const isVimeoUrl = (url) =>
  !!url && url.includes('vimeo') && vimeoRegex.test(url);

export const getVimeoId = (url) => url?.match(vimeoRegex)?.[1] ?? null;

/*
 Picture-in-Picture needs a <video> element of the page: it can't work with
 the YouTube tech (the video lives in a cross-origin iframe) nor in browsers
 without the PiP API (e.g. Firefox, which has its own native toggle).
*/
export const canUsePictureInPicture = (isYoutube) =>
  !isYoutube &&
  typeof document !== 'undefined' &&
  !!document.pictureInPictureEnabled;

/*
 Ricava il mime-type dall'estensione del file, se riconosciuta
*/
export const getVideoMimeType = (url) => {
  const ext = url
    ?.split(/[?#]/)[0]
    ?.replace(/\/@@download\/.*$/, '')
    ?.split('.')
    ?.pop()
    ?.toLowerCase();
  return mimeTypes[ext] ?? null;
};

/*
 Normalizza un url YouTube in un formato che il tech YouTube di video.js sa
 interpretare (watch?v=ID e/o list=ID).
*/
export const getYouTubeSrc = (url) => {
  const videoId = url.match(
    // eslint-disable-next-line no-useless-escape
    /^(?:http|https?:)?(?:\/\/)?(?:(?:www\.|m\.)?youtube(?:-nocookie)?\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|embed\/|vi?\/|e\/|shorts\/|live\/)|youtu\.be\/)([\w\-]{11})/i,
  )?.[1];
  // eslint-disable-next-line no-useless-escape
  const listId = url.match(/[?&]list=([^#\&\?]+)/)?.[1];

  if (videoId) {
    return `https://www.youtube.com/watch?v=${videoId}${
      listId ? `&list=${listId}` : ''
    }`;
  }
  if (listId) {
    return `https://www.youtube.com/playlist?list=${listId}`;
  }
  return url;
};

const isInternalVideoUrl = (url) => {
  let apiPath = config.settings.apiPath ?? '';
  if (!apiPath.endsWith('/')) {
    apiPath += '/';
  }
  return (
    isInternalURL(url) || isInternalURL(url.replace(getParentUrl(apiPath), ''))
  );
};

/*
 Dato l'url di un video restituisce la sorgente da passare al player:
  - { kind: 'youtube', src }
  - { kind: 'vimeo', id, src }
  - { kind: 'file', src, type }
 oppure null se l'url non è un video riproducibile.
*/
export const getVideoSource = (url, { allowExternals = false } = {}) => {
  if (!url) {
    return null;
  }
  if (isYouTubeUrl(url)) {
    return { kind: 'youtube', src: getYouTubeSrc(url) };
  }
  if (isVimeoUrl(url)) {
    return { kind: 'vimeo', id: getVimeoId(url), src: url };
  }
  if (isInternalVideoUrl(url)) {
    // file caricato su Plone: lo scarichiamo tramite @@download/file
    const appUrl = flattenToAppURL(url);
    return {
      kind: 'file',
      src:
        appUrl.indexOf('@@download') < 0
          ? `${appUrl.replace(/\/$/, '')}/@@download/file`
          : appUrl,
      type: getVideoMimeType(url) ?? DEFAULT_VIDEO_TYPE,
    };
  }
  const type = getVideoMimeType(url);
  if (type || allowExternals) {
    return { kind: 'file', src: url, type: type ?? DEFAULT_VIDEO_TYPE };
  }
  return null;
};
