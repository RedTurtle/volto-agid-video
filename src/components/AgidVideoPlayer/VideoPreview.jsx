/**
 * VideoPreview
 *
 * Anteprima statica di un video di terze parti (YouTube, Vimeo): mostra solo
 * l'immagine di anteprima e il pulsante play, senza caricare l'iframe, che
 * viene messo in pagina solo quando l'utente preme play (onPlay).
 *
 * Usa lo stesso markup e le stesse classi di video.js, così l'anteprima ha lo
 * stesso aspetto del player (tema 'vjs-theme-bootstrap-italia').
 */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';

const messages = defineMessages({
  playVideo: {
    id: 'agid_video_play',
    defaultMessage: 'Riproduci il video',
  },
  playVideoTitle: {
    id: 'agid_video_play_title',
    defaultMessage: 'Riproduci il video: {title}',
  },
});

const VideoPreview = ({ poster, title, onPlay }) => {
  const intl = useIntl();
  const label = title
    ? intl.formatMessage(messages.playVideoTitle, { title })
    : intl.formatMessage(messages.playVideo);

  return (
    <div className="video-js vjs-16-9 vjs-theme-bootstrap-italia vjs-big-play-centered agid-video-preview">
      {poster && (
        // anche l'immagine avvia il video; da tastiera si usa il pulsante
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className="vjs-poster" onClick={onPlay}>
          <img src={poster} alt="" loading="lazy" />
        </div>
      )}
      <button
        type="button"
        className="vjs-big-play-button"
        title={label}
        onClick={onPlay}
      >
        <span className="vjs-icon-placeholder" aria-hidden="true" />
        <span className="vjs-control-text">{label}</span>
      </button>
    </div>
  );
};

VideoPreview.propTypes = {
  poster: PropTypes.string,
  title: PropTypes.string,
  onPlay: PropTypes.func.isRequired,
};

export default VideoPreview;
