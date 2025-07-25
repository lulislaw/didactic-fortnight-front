import React, { useRef, useEffect } from 'react';
import Hls from 'hls.js';
import PropTypes from 'prop-types';

/**
 * <HlsPlayer url="https://your/stream.m3u8" />
 */
export default function HlsPlayer({ url, controls = true, style }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      return () => {
        hls.destroy();
      };
    } else {
      console.error('HLS не поддерживается в этом браузере');
    }
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls={controls}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        ...style,
      }}
    />
  );
}

HlsPlayer.propTypes = {
  url: PropTypes.string.isRequired,
  controls: PropTypes.bool,
  style: PropTypes.object,
};
