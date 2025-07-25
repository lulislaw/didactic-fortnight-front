import React, { useEffect, useRef } from "react";
import Hls from "hls.js";

function HlsPreview({ url }) {
  const videoRef = useRef();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Всегда ставим muted, иначе большинство браузеров не даст автоплей
    video.muted = true;
    video.autoplay = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
      video
          .play()
          .catch(() => {
            /* ничего страшного, браузер мог заблокировать автоплей */
          });
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video
            .play()
            .catch(() => {
              /* автоплей мог быть заблокирован */
            });
      });
      return () => {
        hls.destroy();
      };
    }
  }, [url]);

  return (
      <video
          ref={videoRef}
          controls
          muted
          autoPlay
          style={{ width: "100%", height: "100%", backgroundColor: "black" }}
      />
  );
}

export default HlsPreview;
