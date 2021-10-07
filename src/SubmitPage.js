import React, { useContext, useRef, useEffect } from "react";
import { css } from "emotion";
import omit from "lodash/omit";
import flatten from "flat";
import queryString from "query-string";
import {
  DATA_CONDITION,
  DATA_GARBAGE_PP,
  DATA_GARBAGE_MM,
  ORDERING_DATA_GARBAGE_MM,
  ORDERING_DATA_GARBAGE_PP
} from "./conditions";
import { now } from "./utils";
import { AppContext, useContextState } from "./AppContext";
import { useSmoothScrollTo } from "./utils";

export default function SubmitPage() {
  let { appState, getExperiment, tracking } = useContext(AppContext);
  let submitInputRef = useRef(null);
  let experiment = getExperiment();
  let [text, setText] = useContextState("FinalComments", "");
  useSmoothScrollTo("SubmitPage");

  useEffect(() => {
    let iv = setInterval(() => {
      submitInputRef.current.value = now();
    }, 500);
    return () => clearInterval(iv);
  }, []);

  let { initialStep, turkSubmitTo, ...parsed } = queryString.parse(
    window.location.search
  );
  let formAction = `${turkSubmitTo}/mturk/externalSubmit`;

  // the total allowable number of typed input characters
  // this is shared between the "explanation stage"
  // and this "final comment" stage.
  // these are the two uncertain length strings which risk creating
  // a request size that's too large for MTurk
  const totalMaxLength = 4000;
  let maxLength = totalMaxLength - (appState["ExplanationStage"] || "").length;

  let expConditions = experiment.getParams();
  let dataCondition = experiment.get(DATA_CONDITION);
  let conditions = omit(expConditions, [
    ORDERING_DATA_GARBAGE_MM,
    ORDERING_DATA_GARBAGE_PP
  ]);
  let order;
  if (dataCondition === DATA_GARBAGE_PP) {
    order = expConditions[ORDERING_DATA_GARBAGE_PP];
  } else if (dataCondition === DATA_GARBAGE_MM) {
    order = expConditions[ORDERING_DATA_GARBAGE_MM];
  } /* DATA_NONE */ else {
    order = [];
  }
  let companies = order.map(founderInfo => founderInfo.company);
  conditions["ComputedDataOrdering"] = companies.join(",") || "[none]";

  let allSubmitData = flatten({
    ...parsed, // it is important that the `assignmentId` key exists!
    e: conditions,
    s: appState,
    t: tracking
  });

  let finishText = "Submit";

  function handleSubmit(e) {
    e.preventDefault();
    submitInputRef.current.value = now();
    e.target.submit();
  }

  return (
    <div id="SubmitPage">
      <h2>Thank you!</h2>
      <p>You must click "{finishText}" below to complete the HIT.</p>
      <p>
        If you have any comments on this experiment, please leave them below.
      </p>
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
      {text.length > maxLength * 0.9 ? (
        <div>
          <small>
            {text.length} / {maxLength}
          </small>
        </div>
      ) : null}
      <form action={formAction} onSubmit={handleSubmit}>
        {Object.entries(allSubmitData).map(([name, val]) => (
          <input
            key={name}
            type="hidden"
            name={name}
            value={val === null ? "null" : val}
          />
        ))}
        <input ref={submitInputRef} type="hidden" name="t.Submit" value="" />
        <input type="submit" value={finishText} disabled={!turkSubmitTo} />
      </form>
      {process.env.REACT_APP_DEV === "true" ? (
        <div
          className={css`
            margin: 1em 0;
          `}
        >
          <b>Submit data</b>
          <pre>{JSON.stringify(allSubmitData, null, 2)}</pre>{" "}
        </div>
      ) : null}
    </div>
  );
}
