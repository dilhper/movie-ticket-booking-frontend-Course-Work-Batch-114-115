import { useState, type ImgHTMLAttributes } from 'react';

interface PosterImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  title: string;
}

/** Poster image that degrades to a branded gradient tile if the URL is missing/broken. */
export function PosterImage({ src, title, className = '', style, ...rest }: PosterImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`${className} d-flex align-items-center justify-content-center text-center p-2`}
        style={{ background: 'linear-gradient(135deg,#2a1530,#141428 60%,#1d1430)', color: '#ffb3c5', ...style }}
        role="img"
        aria-label={title}
      >
        <div>
          <i className="bi bi-film d-block fs-3 mb-1 opacity-75" aria-hidden />
          <span className="small fw-semibold">{title}</span>
        </div>
      </div>
    );
  }

  return <img src={src} alt={`${title} poster`} loading="lazy" className={className} style={style} onError={() => setFailed(true)} {...rest} />;
}
