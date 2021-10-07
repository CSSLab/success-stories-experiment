import React from "react";
import { css } from "emotion";
import { useContextState, useReadContext } from "./AppContext";
import { useSmoothScrollTo } from "./utils";

export default function ExplanationStage({ onFinish }) {
  let [text, setText] = useContextState("ExplanationStage", "");
  let decision = useReadContext("DecisionBet");
  useSmoothScrollTo("ExplanationStage");

  let pronounValidationError = validateExplanation(text);

  const maxLength = 2500;
  return (
    <div id="ExplanationStage">
      <p>
        You chose the startup that was <b>founded by a college {decision}</b>.
      </p>
      <p>Could you explain the reason(s) why you made this decision?</p>
      <textarea
        className={css`
          width: 500px;
          height: 100px;
          font-size: 16px;
        `}
        maxLength={maxLength}
        onChange={e => setText(e.target.value)}
        value={text}
      />
      {pronounValidationError !== null ? (
        <div className={validationCSS}>
          It looks like your response refers to{" "}
          <b>"{pronounValidationError}"</b> without making a reference to{" "}
          <b>graduates</b> or <b>dropouts</b>. Could you please clarify which
          you are talking about?
        </div>
      ) : null}
      {text.length > 0.9 * maxLength ? (
        <div>
          <small>
            {text.length} / {maxLength}
          </small>{" "}
        </div>
      ) : null}
      <div>
        <button onClick={onFinish}>Finish</button>
      </div>
    </div>
  );
}

let validationCSS = css`
  color: #af0000;
  max-width: 500px;
  margin: 10px 0;
`;

function validateExplanation(text) {
  if (text.length <= 20) return null;
  let triggers = ["they", "them", "their", "those", "person"];
  for (let trigger of triggers) {
    if (text.match(new RegExp(trigger, "gi"))) {
      if (text.match(/grad/gi) || text.match(/drop/gi)) {
        return null;
      } else {
        return trigger;
      }
    }
  }
  return null;
}
