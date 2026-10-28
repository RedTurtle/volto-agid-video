import config from '@plone/volto/registry';
import {
  getVideoSource,
  getVideoMimeType,
  getYouTubeSrc,
  isYouTubeUrl,
  isVimeoUrl,
} from './helpers';

beforeAll(() => {
  config.settings.apiPath = 'http://localhost:8080/Plone';
  config.settings.publicURL = 'http://localhost:3000';
});

describe('volto-agid-video helpers', () => {
  it('detects youtube urls', () => {
    expect(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isYouTubeUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(isYouTubeUrl('https://vimeo.com/76979871')).toBe(false);
    expect(isYouTubeUrl('/video.mp4')).toBe(false);
  });

  it('detects vimeo urls', () => {
    expect(isVimeoUrl('https://vimeo.com/76979871')).toBe(true);
    expect(isVimeoUrl('https://player.vimeo.com/video/76979871')).toBe(true);
    expect(isVimeoUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(false);
  });

  it('normalizes youtube urls', () => {
    expect(getYouTubeSrc('https://youtu.be/dQw4w9WgXcQ?t=10')).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    );
    expect(
      getYouTubeSrc('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'),
    ).toBe('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(
      getYouTubeSrc(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',
      ),
    ).toBe(
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',
    );
    expect(
      getYouTubeSrc(
        'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',
      ),
    ).toBe(
      'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',
    );
  });

  it('guesses mime types', () => {
    expect(getVideoMimeType('https://example.com/a.webm')).toBe('video/webm');
    expect(getVideoMimeType('/folder/a.mp4/@@download/file')).toBe('video/mp4');
    expect(getVideoMimeType('https://example.com/live.m3u8?x=1')).toBe(
      'application/x-mpegURL',
    );
    expect(getVideoMimeType('https://example.com/page')).toBe(null);
  });

  it('computes the video source', () => {
    expect(getVideoSource('https://youtu.be/dQw4w9WgXcQ')).toEqual({
      kind: 'youtube',
      src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    expect(getVideoSource('https://vimeo.com/76979871')).toEqual({
      kind: 'vimeo',
      id: '76979871',
      src: 'https://vimeo.com/76979871',
    });
    expect(
      getVideoSource('http://localhost:8080/Plone/folder/video.mp4'),
    ).toEqual({
      kind: 'file',
      src: '/folder/video.mp4/@@download/file',
      type: 'video/mp4',
    });
    expect(getVideoSource('https://example.com/a.mp4')).toEqual({
      kind: 'file',
      src: 'https://example.com/a.mp4',
      type: 'video/mp4',
    });
    expect(getVideoSource('https://example.com/page')).toBe(null);
    expect(
      getVideoSource('https://example.com/page', { allowExternals: true }),
    ).toEqual({
      kind: 'file',
      src: 'https://example.com/page',
      type: 'video/mp4',
    });
    expect(getVideoSource(null)).toBe(null);
  });
});
