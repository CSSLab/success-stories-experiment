import React from "react";
import { css } from "emotion";

export default function Table({ className, ...props }) {
  let tableCSS = css`
    border-collapse: collapse;
    border-spacing: 0;

    thead tr {
      border-bottom: 1px solid black;
    }

    th,
    td {
      padding: 4px 10px;
    }

    td {
      text-align: center;
    }
  `;
  return <table className={css([tableCSS, className])} {...props} />;
}
