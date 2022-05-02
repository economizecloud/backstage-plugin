import React, { useEffect, useRef } from 'react';
import { ScrollTo, useScroll } from '../hooks/useScroll';

export interface ScrollAnchorProps extends ScrollIntoViewOptions {
  id: ScrollTo;
  top?: number;
  left?: number;
}

export const ScrollAnchor = ({ id }: ScrollAnchorProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [scroll, setScroll] = useScroll();

  useEffect(() => {
    function scrollIntoView() {
      if (divRef.current && scroll === id) {
        console.log(scroll, id, divRef.current);
        divRef.current.scrollIntoView({
          block: 'start',
          inline: 'start',
          behavior: 'smooth',
        });
        setScroll(null);
      }
    }

    scrollIntoView();
  }, [scroll, setScroll, id]);

  return <div ref={divRef} data-testid={`scroll-test-${id}`} />;
};
