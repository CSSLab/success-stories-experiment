import React, { useEffect } from "react";
import { css } from "emotion";
import { smoothScrollTo } from "./utils";

export default function ExperimentView({ children }) {
  useEffect(() => smoothScrollTo("ExperimentView"), []);
  return (
    <div id="ExperimentView">
      <p>Welcome to this HIT about predicting the success of startups.</p>
      <p>
        A startup is a small, young company that is intended to grow rapidly and
        to become large and influential. They are typically backed by venture
        capital (V.C.) firms. The people who create startups are called
        founders. A "unicorn" is a startup that has achieved a valuation of 1
        billion dollars or more.
      </p>
      <div
        className={css`
          margin: 1.5em 0;
          padding: 0.5em 0;
          border-top: 1px solid #ccc;
        `}
      >
        {children}
      </div>
    </div>
  );
}
