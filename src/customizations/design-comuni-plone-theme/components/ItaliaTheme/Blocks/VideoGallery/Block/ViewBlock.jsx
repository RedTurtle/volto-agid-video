/**
 * ViewBlock.
 * @module components/ItaliaTheme/Blocks/VideoGallery/Block/ViewBlock
 *
 * Customizations:
 * - i video (YouTube, file interni ed esterni) sono renderizzati con
 *   AgidVideoPlayer (video.js, come <it-video> di dev-kit-italia)
 * - il consenso ai cookie resta gestito da ConditionalEmbed
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ConditionalEmbed } from 'volto-gdpr-privacy';
import { videoUrlHelper } from 'design-comuni-plone-theme/helpers';
import { useIntl, defineMessages } from 'react-intl';
import {
  VideoEmbed,
  getVideoSource,
} from '@redturtle/volto-agid-video/components/AgidVideoPlayer';

const messages = defineMessages({
  externalVideo: {
    id: 'agid_video_external_title',
    defaultMessage: 'Video',
  },
});

/**
 * ViewBlock class.
 * @class ViewBlock
 * @extends Component
 */
const ViewBlock = ({ data, index, isEditMode = false }) => {
  const intl = useIntl();

  if (!data?.url) {
    return null;
  }

  const [, placeholder] = videoUrlHelper(data.url, data?.preview_image);
  const source = getVideoSource(data.url);

  return (
    <div className="video-wrapper">
      <ConditionalEmbed url={!isEditMode ? data.url : null}>
        {source ? (
          <VideoEmbed source={source} poster={placeholder} title={data.title} />
        ) : data.allowExternals ? (
          // url esterno che non è un file video: lo incorporiamo come prima
          <div className="ratio ratio-16x9">
            <iframe
              src={data.url}
              title={data.title || intl.formatMessage(messages.externalVideo)}
              allowFullScreen
              loading="lazy"
            />
          </div>
        ) : (
          <div className="invalidVideoFormat" />
        )}
      </ConditionalEmbed>
    </div>
  );
};

/**
 * Property types.
 * @property {Object} propTypes Property types.
 * @static
 */
ViewBlock.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
};

export default ViewBlock;
