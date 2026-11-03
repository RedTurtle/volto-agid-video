/**
 * AgidVideoPlayer
 *
 * Porting React del web component <it-video> di dev-kit-italia
 * (https://github.com/italia/dev-kit-italia/tree/main/packages/video):
 * stessa libreria (video.js + tech YouTube), stesse opzioni di default e
 * stesso layout (tema 'vjs-theme-bootstrap-italia' di bootstrap-italia).
 *
 * La gestione del consenso ai cookie NON è inclusa: resta in carico a
 * ConditionalEmbed di volto-gdpr-privacy, che deve avvolgere il player.
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { useIntl } from 'react-intl';
import config from '@plone/volto/registry';

import itLang from './locales/it';
import { initYoutubePlugin } from './youtube-video';
import {
  isYouTubeUrl,
  canUsePictureInPicture,
  DEFAULT_VIDEO_TYPE,
} from './helpers';
import VideoPreview from './VideoPreview';

const AgidVideoPlayer = ({
  src,
  type = DEFAULT_VIDEO_TYPE,
  poster,
  title,
  options = {},
  language,
  translations = {},
  track = [],
  initPlugins,
  lazy,
  className,
  children,
}) => {
  const intl = useIntl();
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const lang = language ?? intl.locale ?? 'it';
  const isYoutube = isYouTubeUrl(src);

  // Per i video di terze parti (YouTube) mostriamo solo l'anteprima: il
  // player, e quindi l'iframe, viene creato solo quando l'utente preme play.
  // Lo stato è legato a src, così cambiando video si torna all'anteprima.
  const isLazy = lazy ?? isYoutube;
  const [activatedSrc, setActivatedSrc] = useState(null);
  const active = !isLazy || activatedSrc === src;
  const activatedByUser = isLazy && active;

  // le prop non primitive sono lette da ref, per non reinizializzare il
  // player ad ogni render del componente padre
  const propsRef = useRef();
  propsRef.current = { options, translations, track, initPlugins, title };

  useEffect(() => {
    if (!src || !active || !containerRef.current) {
      return;
    }
    let cancelled = false;

    import('video.js').then((mod) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const videojs = mod.default || mod;
      const settings = config.settings.agidVideo ?? {};
      const { options, translations, track, initPlugins, title } =
        propsRef.current;

      if (isYoutube && !videojs.getTech('Youtube')) {
        initYoutubePlugin(videojs);
      }
      // se passata una funzione di init di ulteriori plugin, la chiama.
      settings.initPlugins?.(videojs);
      initPlugins?.(videojs);

      const _options = isYoutube
        ? {
            techOrder: ['youtube'],
            sources: [{ type: 'video/youtube', src }],
            youtube: {
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
            },
          }
        : {
            sources: [{ type, src }],
          };

      // le traduzioni sono unite per lingua, così si possono sovrascrivere
      // anche singole stringhe di quelle italiane preimpostate
      const languages = { it: itLang };
      [settings.translations, translations].forEach((t) =>
        Object.entries(t ?? {}).forEach(([l, strings]) => {
          languages[l] = { ...(languages[l] ?? {}), ...strings };
        }),
      );

      const mergedOptions = {
        fluid: true,
        language: lang,
        languages,
        controls: true,
        autoplay: false,
        muted: false,
        preload: 'auto',
        techOrder: ['html5'],
        poster,
        // crossorigin è necessario per caricare tracce di sottotitoli da
        // altri domini, ma impedisce la riproduzione di video esterni senza
        // header CORS: lo impostiamo solo se ci sono tracce
        ...(track?.length > 0 ? { crossOrigin: 'anonymous' } : {}),
        ...(settings.options ?? {}),
        ...options,
        // l'utente ha già premuto play sull'anteprima: il video deve partire
        ...(activatedByUser ? { autoplay: true } : {}),
        ..._options,
      };

      // where PiP can't work video.js would show an always disabled button:
      // don't create it, keeping any controlBar option set above
      if (!canUsePictureInPicture(isYoutube)) {
        mergedOptions.controlBar = {
          ...mergedOptions.controlBar,
          pictureInPictureToggle: false,
        };
      }

      // video.js modifica il DOM dell'elemento: lo creiamo fuori da React
      const videoElement = document.createElement('video-js');
      videoElement.classList.add(
        'vjs-theme-bootstrap-italia',
        'vjs-big-play-centered',
      );
      containerRef.current.appendChild(videoElement);

      playerRef.current = videojs(
        videoElement,
        mergedOptions,
        function onPlayerReady() {
          if (title) {
            this.el().setAttribute(
              'aria-label',
              `${this.localize('Video Player')}: ${title}`,
            );
          }

          // Aggiungi i track manualmente
          (track ?? []).forEach((t) => {
            this.addRemoteTextTrack(
              {
                kind: t.kind,
                src: t.src,
                srclang: t.srclang || lang,
                label: t.label,
                default: !!t.default,
              },
              false,
            );
          });

          // il pulsante play dell'anteprima è stato sostituito dal player:
          // spostiamo il focus sul controllo play/pausa, per non perderlo
          if (activatedByUser) {
            this.el().querySelector('.vjs-play-control')?.focus();
          }
        },
      );
    });

    return () => {
      cancelled = true;
      const player = playerRef.current;
      if (player && !player.isDisposed()) {
        player.dispose();
      }
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, type, poster, isYoutube, active]);

  useEffect(() => {
    const player = playerRef.current;
    if (player && !player.isDisposed()) {
      player.language(lang);
    }
  }, [lang]);

  if (!src) {
    return null;
  }

  return (
    <div className={cx('agid-video-player', className)}>
      {active ? (
        <div
          className="videoplayer-wrapper"
          data-vjs-player
          ref={containerRef}
        />
      ) : (
        <VideoPreview
          poster={poster}
          title={title}
          onPlay={() => setActivatedSrc(src)}
        />
      )}
      {children}
    </div>
  );
};

AgidVideoPlayer.propTypes = {
  /** url del video (file o YouTube) */
  src: PropTypes.string,
  /** mime-type del video, ignorato per YouTube */
  type: PropTypes.string,
  /** immagine di anteprima */
  poster: PropTypes.string,
  title: PropTypes.string,
  /** opzioni di video.js: https://videojs.com/guides/options/ */
  options: PropTypes.object,
  /** lingua del player, di default quella del sito */
  language: PropTypes.string,
  /** traduzioni di video.js, { [lang]: { 'Play': '...', ... } } */
  translations: PropTypes.object,
  /** sottotitoli, didascalie, capitoli e descrizioni (WebVTT) */
  track: PropTypes.arrayOf(
    PropTypes.shape({
      kind: PropTypes.oneOf([
        'captions',
        'subtitles',
        'descriptions',
        'chapters',
        'metadata',
      ]),
      src: PropTypes.string.isRequired,
      srclang: PropTypes.string,
      label: PropTypes.string,
      default: PropTypes.bool,
    }),
  ),
  /** funzione di init di plugin aggiuntivi di video.js, riceve videojs */
  initPlugins: PropTypes.func,
  /**
   * mostra solo l'anteprima e crea il player al click su play,
   * di default attivo per YouTube
   */
  lazy: PropTypes.bool,
  className: PropTypes.string,
  /** contenuto mostrato sotto al player (es. trascrizione) */
  children: PropTypes.node,
};

export default AgidVideoPlayer;
