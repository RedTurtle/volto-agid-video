import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import VideoEmbed from './VideoEmbed';

jest.mock('video.js', () => {
  const videojs = () => ({ isDisposed: () => false, dispose: () => {} });
  videojs.getTech = () => true;
  return { __esModule: true, default: videojs };
});

const renderWithIntl = (ui) =>
  render(
    <IntlProvider locale="it" messages={{}} onError={() => {}}>
      {ui}
    </IntlProvider>,
  );

describe('VideoEmbed', () => {
  it('shows only the preview for YouTube until play is pressed', () => {
    const { container, getByRole } = renderWithIntl(
      <VideoEmbed
        source={{
          kind: 'youtube',
          src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        }}
        poster="https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
        title="Titolo"
      />,
    );

    expect(container.querySelector('.agid-video-preview img').src).toBe(
      'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    );
    expect(container.querySelector('.videoplayer-wrapper')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();

    fireEvent.click(
      getByRole('button', { name: 'Riproduci il video: Titolo' }),
    );

    expect(container.querySelector('.agid-video-preview')).toBeNull();
    expect(container.querySelector('.videoplayer-wrapper')).not.toBeNull();
  });

  it('adds the Vimeo iframe only after play is pressed', () => {
    const { container, getByRole } = renderWithIntl(
      <VideoEmbed
        source={{
          kind: 'vimeo',
          id: '76979871',
          src: 'https://vimeo.com/76979871',
        }}
        poster="https://vumbnail.com/76979871.jpg"
      />,
    );

    expect(container.querySelector('iframe')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Riproduci il video' }));

    expect(container.querySelector('iframe').src).toContain(
      'https://player.vimeo.com/video/76979871?autoplay=1',
    );
  });

  it('renders file videos directly, without preview', () => {
    const { container } = renderWithIntl(
      <VideoEmbed
        source={{
          kind: 'file',
          src: '/video.mp4/@@download/file',
          type: 'video/mp4',
        }}
      />,
    );

    expect(container.querySelector('.agid-video-preview')).toBeNull();
    expect(container.querySelector('.videoplayer-wrapper')).not.toBeNull();
  });
});
