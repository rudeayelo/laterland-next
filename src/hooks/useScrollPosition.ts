import { useState, useEffect } from "react";

interface ScrollPosition {
  x: number;
  y: number;
}

const isBrowser = typeof window !== `undefined`;

function getScrollPosition(): ScrollPosition {
  return isBrowser
    ? { x: window.pageXOffset, y: window.pageYOffset }
    : { x: 0, y: 0 };
}

const useScrollPosition = (): ScrollPosition => {
  const [position, setScrollPosition] = useState<ScrollPosition>(
    getScrollPosition()
  );

  useEffect(() => {
    let requestRunning: number | null = null;
    const handleScroll = () => {
      if (isBrowser && requestRunning === null) {
        requestRunning = window.requestAnimationFrame(() => {
          setScrollPosition(getScrollPosition());
          requestRunning = null;
        });
      }
    };

    if (isBrowser) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, []);

  return position;
};

const useScrollXPosition = (): number => {
  const { x } = useScrollPosition();
  return x;
};

const useScrollYPosition = (): number => {
  const { y } = useScrollPosition();
  return y;
};

export { useScrollPosition, useScrollXPosition, useScrollYPosition };
