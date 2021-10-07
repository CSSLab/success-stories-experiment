import React, { useState } from "react";
import classNames from "classnames";
import { css } from "emotion";

function Slider({ value, setValue, min = 0, max = 100 }) {
  let [internalSliderValue, setInternalValue] = useState(value);
  let [prevValue, setPrevValue] = useState(null);
  if (prevValue !== value) {
    setInternalValue(value); // derived state from props
    setPrevValue(value);
  }

  function computeSliderValueFromMouse(e) {
    let bcr = e.target.getBoundingClientRect();
    //
    //           |<---------bcr.width-------->|
    //            ____________________________
    //           |                            |
    // |<-bcr.x->|     + e.clientX            |
    //           |____________________________|
    //
    let x = bcr.x || bcr.left;
    let sliderPct = (e.clientX - x) / bcr.width;
    let range = max - min;
    let sliderValue = (min + range * sliderPct).toFixed(0);
    return sliderValue;
  }

  let sliderClassName = classNames(
    "slider",
    value === null ? "null" : "value-set"
  );

  return (
    <div className={style}>
      <input
        type="range"
        value={internalSliderValue || "0"}
        className={sliderClassName}
        min={min}
        max={max}
        onMouseMove={e => {
          if (value === null) {
            let sliderValue = computeSliderValueFromMouse(e);
            // set the internal value to set hover position
            setInternalValue(sliderValue);
          }
        }}
        onMouseDown={e => {
          if (value === null) {
            let sliderValue = computeSliderValueFromMouse(e);
            // set the actual slider value
            setValue(sliderValue);
          }
        }}
        onChange={e => setValue(e.target.value)}
      />
    </div>
  );
}

// thanks https://www.quirksmode.org/blog/archives/2015/11/styling_and_scr.html
let sliderStyle = css`
  width: 99%;
  outline: none;
`;
let thumbStyle = css`
  width: 16px;
  height: 16px;
  margin-top: -7px;
  border-radius: 50%;
  &:hover {
    cursor: pointer;
  }
`;
let nullThumbStyle = css`
  border: 2px dotted black;
  background-color: rgba(255, 255, 255, 0.8);
`;
let actualThumbStyle = css`
  border: 2px solid black;
  background-color: #f6f6f6;
`;
let trackStyle = css`
  width: 100%;
  height: 6px;
  background: #999999;
  border-radius: 6px;
  &:hover {
    cursor: pointer;
  }
`;

let style = css`
  input[type="range"] {
    -webkit-appearance: none;
    height: 25px; /* pick your own value */
    padding: 0;
    background: none;
    ${sliderStyle};

    &.null {
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        box-sizing: content-box;
      }
      &::-moz-range-thumb {
        opacity: 0;
      }
      &::-ms-thumb {
        opacity: 0;
      }
      /* IE11 blue infill to the left of the thumb, hide until set */
      &::-ms-fill-lower {
        background-color: #999999; /* colour of the track */
      }
      &:hover {
        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          box-sizing: content-box;
          ${thumbStyle};
          ${nullThumbStyle};
        }
        &::-moz-range-thumb {
          opacity: 1;
          ${thumbStyle};
          ${nullThumbStyle};
        }
        &::-ms-thumb {
          /* should come after -webkit- */
          opacity: 1;
          ${thumbStyle};
          ${nullThumbStyle};
          /* may require different margins */
        }
      }
    }
    &.value-set {
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        box-sizing: content-box;
        ${thumbStyle};
        ${actualThumbStyle};
      }
      &::-moz-range-thumb {
        ${thumbStyle};
        ${actualThumbStyle};
      }
      &::-ms-thumb {
        /* should come after -webkit- */
        ${thumbStyle};
        ${actualThumbStyle};
        /* may require different margins */
      }
    }

    &::-webkit-slider-runnable-track {
      ${trackStyle};
    }

    &::-moz-range-track {
      ${trackStyle};
    }

    &::-ms-track {
      /* should come after -webkit- */
      border-color: transparent;
      color: transparent;
      ${trackStyle};
    }

    /* prevent tooltips which show the numeric slider value on old windows */
    &::-ms-tooltip {
      display: none;
    }
  }
`;

export default Slider;
