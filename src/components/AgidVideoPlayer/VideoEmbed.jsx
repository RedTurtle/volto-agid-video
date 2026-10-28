/**
 * VideoEmbed
 *
 * Renderizza un video a partire da una sorgente calcolata con getVideoSource:
 *  - YouTube e file video (interni o esterni) con AgidVideoPlayer (video.js)
 *  - Vimeo con un iframe, perché video.js non ha un tech Vimeo nativo
 *    (dev-kit-italia lo demanda a un plugin esterno)
 *
 * Per i video di terze parti viene mostrata solo l'anteprima: l'iframe è
 * messo in pagina solo quando l'utente preme play.
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import AgidVideoPlayer from './AgidVideoPlayer';
import VideoPreview from './VideoPreview';

const messages = defineMessages({
  vimeoVideo: {
    id: 'agid_video_vimeo_title',
    defaultMessage: 'Video Vimeo {id}',
  },
});

const VimeoEmbed = ({ id, poster, title, children }) => {
  const intl = useIntl();
  const iframeRef = useRef(null);
  // lo stato è legato all'id, così cambiando video si torna all'anteprima
  const [activatedId, setActivatedId] = useState(null);
  const active = activatedId === id;

  useEffect(() => {
    // il pulsante play dell'anteprima è stato sostituito: spostiamo il focus
    // sull'iframe, per non perderlo
    if (active) {
      iframeRef.current?.focus();
    }
  }, [active]);

  return (
    <div className="agid-video-player">
      {active ? (
        <div className="ratio ratio-16x9">
          <iframe
            ref={iframeRef}
            src={`https://player.vimeo.com/video/${id}?autoplay=1&badge=0&byline=1&portrait=1&title=1`}
            title={title || intl.formatMessage(messages.vimeoVideo, { id })}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <VideoPreview
          poster={poster}
          title={title}
          onPlay={() => setActivatedId(id)}
        />
      )}
      {children}
    </div>
  );
};

const VideoEmbed = ({ source, poster, title, ...playerProps }) => {
  if (!source) {
    return null;
  }

  if (source.kind === 'vimeo') {
    return (
      <VimeoEmbed id={source.id} poster={poster} title={title}>
        {playerProps.children}
      </VimeoEmbed>
    );
  }

  return (
    <AgidVideoPlayer
      src={source.src}
      type={source.type}
      poster={poster || undefined}
      title={title}
      {...playerProps}
    />
  );
};

VideoEmbed.propTypes = {
  source: PropTypes.shape({
    kind: PropTypes.oneOf(['youtube', 'vimeo', 'file']).isRequired,
    src: PropTypes.string,
    id: PropTypes.string,
    type: PropTypes.string,
  }),
  poster: PropTypes.string,
  title: PropTypes.string,
};

export default VideoEmbed;
