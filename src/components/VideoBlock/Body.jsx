/**
 * Body video block.
 * @module components/manage/Blocks/Video/Body
 *
 * Basato sulla customization di design-comuni-plone-theme:
 * - i video (YouTube, file interni ed esterni) sono renderizzati con
 *   AgidVideoPlayer (video.js, come <it-video> di dev-kit-italia)
 * - il consenso ai cookie resta gestito da ConditionalEmbed
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Message } from 'semantic-ui-react';
import cx from 'classnames';
import { videoUrlHelper } from 'design-comuni-plone-theme/helpers';
import { ConditionalEmbed } from 'volto-gdpr-privacy';
import config from '@plone/volto/registry';
import {
  VideoEmbed,
  getVideoSource,
} from '@redturtle/volto-agid-video/components/AgidVideoPlayer';

const Body = ({ data, isEditMode }) => {
  const allowsExternals =
    data.allowExternals !== undefined
      ? !!data.allowExternals
      : !!config.settings.videoAllowExternalsDefault;

  if (!data.url) {
    return null;
  }

  const [, placeholder] = videoUrlHelper(data.url, data?.preview_image);
  const source = getVideoSource(data.url, { allowExternals: allowsExternals });

  return (
    <div
      className={cx('video-inner', {
        'full-width': data.align === 'full',
      })}
    >
      <ConditionalEmbed url={data.url}>
        {source ? (
          <VideoEmbed source={source} poster={placeholder} title={data.title} />
        ) : isEditMode ? (
          <div>
            <Message>
              <center>
                <FormattedMessage
                  id="Please enter a valid URL by deleting the block and adding a new video block."
                  defaultMessage="Please enter a valid URL by deleting the block and adding a new video block."
                />
              </center>
            </Message>
          </div>
        ) : (
          <div className="invalidVideoFormat" />
        )}
      </ConditionalEmbed>
    </div>
  );
};

Body.propTypes = {
  data: PropTypes.objectOf(PropTypes.any).isRequired,
  isEditMode: PropTypes.bool,
};

export default Body;
