/**
 * VideoView view component.
 * @module components/theme/View/VideoView
 *
 * Customizations:
 * - il file video caricato è renderizzato con AgidVideoPlayer (video.js,
 *   come <it-video> di dev-kit-italia)
 */
import React from 'react';
import { PagePlaceholderTitle } from 'design-comuni-plone-theme/components/ItaliaTheme/View';
import VideoViewer from '@plone/volto/components/manage/Blocks/Video/Body';
import { defineMessages, useIntl } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers';
import { AgidVideoPlayer } from '@redturtle/volto-agid-video/components/AgidVideoPlayer';

/**
 * VideoView view component class.
 * @function VideoView
 * @params {object} content object.
 * @returns {string} Markup of the view.
 */

const messages = defineMessages({
  transcript_label: {
    id: 'transcript_label',
    defaultMessage: 'Trascrizione',
  },
});

const VideoView = ({ content }) => {
  const intl = useIntl();

  return (
    <div id="page-document" className="ui container px-4">
      {/* Header */}
      <div className="PageHeaderWrapper mb-4">
        <div className="row">
          <div className="title-description-wrapper col-lg-12">
            <PagePlaceholderTitle content={content}>
              <h1 className="mb-3" data-element="page-name">
                {content?.title}
              </h1>
            </PagePlaceholderTitle>
            <p className="description">{content?.description}</p>
          </div>
        </div>
      </div>

      {/* Embedd video */}
      {content?.video_url ? (
        <div className="block video">
          <VideoViewer data={{ url: content.video_url }} />
        </div>
      ) : content?.video_file?.download ? (
        <div className="block video mb-4">
          <AgidVideoPlayer
            src={flattenToAppURL(content.video_file.download)}
            type={content.video_file['content-type']}
            poster={
              content.preview_image?.download
                ? flattenToAppURL(content.preview_image.download)
                : undefined
            }
            title={content.title}
            options={
              content.width && content.height
                ? { aspectRatio: `${content.width}:${content.height}` }
                : {}
            }
          />
        </div>
      ) : (
        <></>
      )}

      {/* Transcript */}
      {content?.transcript?.data &&
        content?.transcript?.data !== '<p><br></p>' && (
          <div className="mb-2">
            <p className="mb-0">
              <strong>{intl.formatMessage(messages.transcript_label)}</strong>
            </p>
            <span
              dangerouslySetInnerHTML={{ __html: content.transcript.data }}
            ></span>
          </div>
        )}
    </div>
  );
};

export default VideoView;
