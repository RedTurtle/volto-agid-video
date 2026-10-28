/**
 * EmbeddedVideo
 *
 * Customizations:
 * - i video sono renderizzati con AgidVideoPlayer (video.js, come <it-video>
 *   di dev-kit-italia)
 * - il consenso ai cookie resta gestito da ConditionalEmbed
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalEmbed } from 'volto-gdpr-privacy';
import { defineMessages, injectIntl, useIntl } from 'react-intl';
import { videoUrlHelper } from 'design-comuni-plone-theme/helpers';
import {
  VideoEmbed,
  getVideoSource,
} from '@redturtle/volto-agid-video/components/AgidVideoPlayer';

const messages = defineMessages({
  embedVideo: {
    id: 'embedVideo',
    defaultMessage: 'YouTube Video {id}',
  },
});

const EmbeddedVideo = ({ video_url, title, id }) => {
  const intl = useIntl();

  if (!video_url) {
    return null;
  }

  const [, placeholder] = videoUrlHelper(video_url);
  const source = getVideoSource(video_url, { allowExternals: true });

  return (
    <div key={id} className="embedded-video my4" id={`embedded-video-${id}`}>
      <ConditionalEmbed url={video_url} key={'embedvideo' + id}>
        <VideoEmbed
          source={source}
          poster={placeholder}
          title={
            title || intl.formatMessage(messages.embedVideo, { id: `${id}` })
          }
        />
      </ConditionalEmbed>
    </div>
  );
};

EmbeddedVideo.propTypes = {
  video_url: PropTypes.string.isRequired,
  title: PropTypes.string,
  id: PropTypes.any,
};

export default injectIntl(EmbeddedVideo);
