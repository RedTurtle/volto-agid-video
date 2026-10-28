/**
 * ModalPreview
 *
 * Customizations:
 * - il file video caricato è renderizzato con AgidVideoPlayer (video.js,
 *   come <it-video> di dev-kit-italia)
 */
import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import cx from 'classnames';

import PropTypes from 'prop-types';
import { Modal, ModalBody, Button, ModalHeader } from 'design-react-kit';
import { Icon } from 'design-comuni-plone-theme/components/ItaliaTheme';
import VideoViewer from '@plone/volto/components/manage/Blocks/Video/Body';
import { flattenToAppURL } from '@plone/volto/helpers';
import { AgidVideoPlayer } from '@redturtle/volto-agid-video/components/AgidVideoPlayer';
import 'volto-wildcard-media/components/ModalPreview/ModalPreview.scss';

const messages = defineMessages({
  view_prev: {
    id: 'video_view_prev',
    defaultMessage: 'Video precedente',
  },
  view_next: {
    id: 'video_view_next',
    defaultMessage: 'Video successivo',
  },
  close_preview: {
    id: 'video_close_preview',
    defaultMessage: "Chiudi l'anteprima",
  },
  transcript_label: {
    id: 'transcript_label',
    defaultMessage: 'Trascrizione',
  },
});

/**
 * ModalPreview view component class.
 * @function ModalPreview
 * @params {object} content Content object.
 * @params {string} folder name where to find images.
 * @returns {string} Markup of the component.
 */
const ModalPreview = ({ id, viewIndex, setViewIndex, items }) => {
  const intl = useIntl();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  // const dispatch = useDispatch();
  // const mediaURL = ['WildcardAudio', 'WildcardVideo'].includes(
  //   items[viewIndex]['@type'],
  // )
  //   ? items[viewIndex]['@id']
  //   : null;
  // const { loading, loaded, error, data } = useSelector(
  //   (state) => state.content.subrequests[flattenToAppURL(mediaURL)] ?? {},
  // );
  const data = items[viewIndex];

  const closeModal = () => {
    setViewIndex(null);
  };

  // useEffect(() => {
  //   if (!loading && !loaded && mediaURL) {
  //     dispatch(
  //       getContent(flattenToAppURL(mediaURL), null, flattenToAppURL(mediaURL)),
  //     );
  //   }
  // }, [dispatch, mediaURL, loading, loaded]);

  useEffect(() => {
    if (viewIndex != null) {
      setModalIsOpen(true);
    } else {
      setModalIsOpen(false);
    }
  }, [viewIndex]);

  return items?.length > 0 ? (
    <Modal
      isOpen={modalIsOpen}
      wrapClassName="public-ui"
      id={`gallery-preview-${id}`}
      size="xl"
      className="gallery-preview wildcard-media-gallery"
      onExit={() => {
        setViewIndex(null);
        setModalIsOpen(false);
      }}
      backdrop="static"
      centered={true}
      toggle={closeModal}
      scrollable={false}
    >
      {viewIndex != null && (
        <>
          <ModalHeader
            closeButton={true}
            closeAriaLabel={intl.formatMessage(messages.close_preview)}
            toggle={closeModal}
          >
            {items[viewIndex].title}
          </ModalHeader>
          <ModalBody>
            {items[viewIndex].description && (
              <p className="pb-3">{items[viewIndex].description}</p>
            )}
            <div
              className={cx('item-preview', {
                'audio-preview': items[viewIndex]['@type'] === 'WildcardAudio',
                'video-preview': items[viewIndex]['@type'] === 'WildcardVideo',
              })}
            >
              {items.length > 1 && (
                <Button
                  color="white"
                  size="xs"
                  title={intl.formatMessage(messages.view_prev)}
                  onClick={() => {
                    setViewIndex(
                      viewIndex - 1 >= 0 ? viewIndex - 1 : items.length - 1,
                    );
                  }}
                  className="prev"
                >
                  <Icon color="" icon="it-arrow-left" padding={false} />
                </Button>
              )}

              {data && data['@type'] === 'WildcardVideo' ? (
                data.video_url ? (
                  <div className="block video">
                    <VideoViewer data={{ url: data.video_url }} />
                  </div>
                ) : (
                  data.video_file?.download && (
                    <div className="block video">
                      <AgidVideoPlayer
                        key={data['@id']}
                        src={flattenToAppURL(data.video_file.download)}
                        type={data.video_file['content-type']}
                        poster={
                          data.preview_image?.download
                            ? flattenToAppURL(data.preview_image.download)
                            : undefined
                        }
                        title={data.title}
                        options={
                          data.width && data.height
                            ? { aspectRatio: `${data.width}:${data.height}` }
                            : {}
                        }
                      />
                    </div>
                  )
                )
              ) : (
                <>novideo</>
              )}

              {items[viewIndex]['@type'] === 'WildcardAudio' &&
                data?.audio_file?.download && (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <audio
                    className="mb-4"
                    controls
                    src={data.audio_file.download}
                  ></audio>
                )}

              {items.length > 1 && (
                <Button
                  color="white"
                  size="xs"
                  title={intl.formatMessage(messages.view_next)}
                  onClick={() => {
                    setViewIndex(
                      viewIndex + 1 < items.length ? viewIndex + 1 : 0,
                    );
                  }}
                  className="next"
                >
                  <Icon color="" icon="it-arrow-right" padding={false} />
                </Button>
              )}
            </div>

            {items[viewIndex].transcript && (
              <div className="transcript mt-3">
                <p className="mb-0">
                  <strong>
                    {intl.formatMessage(messages.transcript_label)}
                  </strong>
                </p>
                <span
                  dangerouslySetInnerHTML={{
                    __html: items[viewIndex].transcript.data,
                  }}
                ></span>
              </div>
            )}
          </ModalBody>
        </>
      )}
    </Modal>
  ) : null;
};

export default ModalPreview;

ModalPreview.propTypes = {
  id: PropTypes.string,
  viewIndex: PropTypes.number,
  setViewIndex: PropTypes.func,
  items: PropTypes.array,
};
