import { useEffect } from "react";

export let strNonEmpty = v => v !== undefined && v !== null && v !== "";

export let strToNum = str =>
  strNonEmpty(str) ? Number(str.replace(/,/g, "")) : NaN;

export let isNumber = str => !Number.isNaN(strToNum(str));

export let randomString = () =>
  Math.random()
    .toString(36)
    .slice(2);

export function now() {
  return new Date().getTime();
}

// thanks https://codepen.io/rebosante/pen/eENYBv
let easeInOutQuad = function(t, b, c, d) {
  // t = current time
  // b = start value
  // c = change in value
  // d = duration
  t /= d / 2;
  if (t < 1) return (c / 2) * t * t + b;
  t--;
  return (-c / 2) * (t * (t - 2) - 1) + b;
};

export function smoothScrollTo(elementID) {
  let el = document.getElementById(elementID);
  let { y } = el.getBoundingClientRect();
  // if element top is outside top of window
  if (y < 0) {
    let yOffset = window.pageYOffset;
    let frame = 0;
    let FRAMES = 20;

    let animateScroll = function() {
      let newY = easeInOutQuad(frame++, yOffset, y - 10, FRAMES);
      window.scrollTo(0, newY);
      if (frame < FRAMES) {
        window.requestAnimationFrame(animateScroll);
      }
    };
    animateScroll();
  }
}

export function useSmoothScrollTo(elID) {
  useEffect(() => smoothScrollTo(elID), []);
}

export function oneWayHash(str) {
  // https://stackoverflow.com/a/7616484/818492
  var hash = 0,
    i,
    chr;
  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}
