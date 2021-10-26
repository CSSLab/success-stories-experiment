import React, { useState, useEffect } from "react";
import { css } from "emotion";
import queryString from "query-string";
import omit from "lodash/omit";
import UnicornExperiment from "./PlanOut";
import IntroView from "./IntroView";
import ExperimentView from "./ExperimentView";
import AttentionCheck from "./AttentionCheck";
import ExplanationStage from "./ExplanationStage";
import SubmitPage from "./SubmitPage";
import DecisionExperiment from "./DecisionExperiment";
import DataNarrativeView from "./DataNarrativeView";
import TimeoutButton from "./TimeoutButton";
import {
  // names
  DATA_CONDITION,
  // data conditions
  DATA_GARBAGE_MM,
  DATA_GARBAGE_PP,
  DATA_NONE,
  ORDERING_DATA_GARBAGE_MM,
  ORDERING_DATA_GARBAGE_PP,
  // other
  QUESTION_DROPOUT_FIRST,
  ATTN1_COUNTERBALANCE,
  ATTN2_COUNTERBALANCE,
  ATTN3_COUNTERBALANCE,
  ATTN4_COUNTERBALANCE,
  AGREERAND_COUNTERBALANCE
} from "./conditions";
import { AppContextProvider } from "./AppContext";
import { randomString, oneWayHash } from "./utils";

const STEP_INTRO = "INTRO";
const STEP_PRE_EXPERIMENT_DATA = "PRE_EXPERIMENT_DATA";
const STEP_ATTENTION_CHECK = "ATTENTION_CHECK";
const STEP_EXPERIMENT = "EXPERIMENT";
const STEP_EXPLANATION = "EXPLANATION";
const STEP_FINAL = "FINAL";

let addRandomHITParams = () => {
  let workerId = randomString().slice(0, 3);
  window.location.search = queryString.stringify({
    workerId,
    assignmentId: "test"
  });
};

export default function App() {
  let [appState, setAppState] = useState({});
  let [tracking, setTracking] = useState({});
  let [showDebug, setShowDebug] = useState(
    process.env.REACT_APP_DEV === "true"
  );
  let [step, setStep] = useState(STEP_INTRO);

  let parsed = queryString.parse(window.location.search);
  let hitNotAccepted = parsed.assignmentId === "ASSIGNMENT_ID_NOT_AVAILABLE";
  let hitAccepted =
    parsed.assignmentId !== undefined &&
    parsed.workerId !== undefined &&
    !hitNotAccepted;

  // This useEffect was added after the paper was accepted.
  // It sets random HIT parameters for people who land on the app
  // with no parameters set so they can easily test the app.
  useEffect(() => {
    if (!hitAccepted) {
      addRandomHITParams();
    }
  }, [hitAccepted]);

  let WORKER_ID = parsed.workerId || "none";

  let hashedWorkerId = oneWayHash(WORKER_ID);

  let exp = new UnicornExperiment({ userId: hashedWorkerId });
  function getExperiment() {
    return exp;
  }

  useEffect(() => {
    setAppState({ ...appState, UA: btoa(navigator.userAgent), hashedWorkerId });
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_DEV === "true" && parsed.initialStep) {
      setStep(parsed.initialStep);
    }
  }, []);

  let appStage;
  switch (step) {
    case STEP_INTRO:
      appStage = (
        <IntroView
          hitAccepted={hitAccepted}
          onComplete={e => setStep(STEP_PRE_EXPERIMENT_DATA)}
        />
      );
      break;
    case STEP_PRE_EXPERIMENT_DATA:
      appStage = (
        <ExperimentView>
          <DataNarrativeView experiment={exp} />
          <TimeoutButton
            onClick={e => setStep(STEP_ATTENTION_CHECK)}
            timeout={process.env.REACT_APP_DEV === "true" ? 500 : 3000}
          >
            Continue
          </TimeoutButton>
        </ExperimentView>
      );
      break;
    case STEP_ATTENTION_CHECK:
      appStage = (
        <ExperimentView>
          <DataNarrativeView experiment={exp} />
          <AttentionCheck
            experiment={exp}
            onFinish={e => setStep(STEP_EXPERIMENT)}
          />
        </ExperimentView>
      );
      break;
    case STEP_EXPERIMENT:
      appStage = (
        <ExperimentView>
          <DataNarrativeView experiment={exp} />
          <DecisionExperiment
            experiment={exp}
            onContinue={e => setStep(STEP_EXPLANATION)}
          />
        </ExperimentView>
      );
      break;
    case STEP_EXPLANATION:
      appStage = <ExplanationStage onFinish={e => setStep(STEP_FINAL)} />;
      break;
    case STEP_FINAL:
      appStage = <SubmitPage />;
      break;
    default:
      appStage = (
        <div>
          <h2>Error</h2>
        </div>
      );
  }

  const setExperiment = (condName, desiredValue) => {
    if (process.env.REACT_APP_DEV !== "true") {
      return null;
    }
    let userId;
    let randChar = () => randomString().slice(0, 3);
    let attempts = 1000;

    let allConditions = new Set(Object.keys(exp.getParams()));
    // ignore the condition we're trying to change
    allConditions.delete(condName);
    // ignore the ordering conditions
    allConditions.delete(ORDERING_DATA_GARBAGE_MM);
    allConditions.delete(ORDERING_DATA_GARBAGE_PP);
    // these are the "old conditions" we want to preserve
    let oldConditions = [...allConditions];

    let newCondMatches = newExp => newExp.get(condName) === desiredValue;

    let oldCondsMatch = newExp => {
      let ret = oldConditions.map(c => {
        let oldCondValue = exp.get(c);
        let newCondValue = newExp.get(c);
        return oldCondValue === newCondValue;
      });
      return ret.every(Boolean);
    };

    while (attempts >= 0) {
      userId = randChar();
      let ex = new UnicornExperiment({ userId: oneWayHash(userId) });
      let newMatches = newCondMatches(ex);
      let oldMatches = oldCondsMatch(ex);
      if (newMatches && oldMatches) {
        let newParams = {
          ...parsed,
          workerId: userId,
          initialStep: step
        };
        let newQS = queryString.stringify(newParams);
        window.location.search = newQS;
        attempts = 0;
      }
      attempts--;
    }
  };

  return (
    <AppContextProvider
      value={{ appState, setAppState, getExperiment, tracking, setTracking }}
    >
      <div className={AppCSS}>
        <h1>Predicting unicorns</h1>
        {process.env.REACT_APP_DEV === "true" && showDebug ? (
          <div className={debugPanel}>
            <DebugSkipState step={step} setStep={setStep} />
            <DebugShowConditions exp={exp} setExperiment={setExperiment} />
            <button
              className="hideDebugPanel"
              onClick={() => setShowDebug(false)}
            >
              Hide debug panels
            </button>
          </div>
        ) : null}
        {appStage}
        {process.env.REACT_APP_DEV === "true" && showDebug ? (
          <>
            <pre className={debugPanel}>
              <b>Parameters</b> {JSON.stringify(parsed, null, 2)}
              <br />
              <b>Conditions</b> (excludes data ordering){" "}
              {JSON.stringify(expParams(exp), null, 2)}
              <br />
              <b>User state</b> {JSON.stringify(omit(appState, "UA"), null, 2)}
              <br />
              <b>Tracking state</b> {JSON.stringify(tracking, null, 2)}
            </pre>
          </>
        ) : null}
      </div>
    </AppContextProvider>
  );
}

function expParams(exp) {
  return omit(exp.getParams(), [
    "ORDERING_DATA_GARBAGE_PP",
    "ORDERING_DATA_GARBAGE_MM"
  ]);
}

let AppCSS = css`
  max-width: 1000px;
  padding: 0 10px;
  margin: 0 auto;
  h1 {
    margin-bottom: 0.4em;
  }
`;

let debugPanel = css`
  margin: 1em 0;
  padding: 1em;
  background-color: #efefef;
`;

function DebugSkipState({ step, setStep }) {
  let steps = [
    STEP_INTRO,
    STEP_PRE_EXPERIMENT_DATA,
    STEP_ATTENTION_CHECK,
    STEP_EXPERIMENT,
    STEP_EXPLANATION,
    STEP_FINAL
  ];
  return (
    <div className={styleMultiSelect}>
      <b>Skip to stage:</b>
      <span className="ChoiceList">
        {steps.map(s => (
          <label key={s}>
            <input
              type="radio"
              name={s}
              onChange={e => setStep(s)}
              checked={step === s}
            />
            {s}
          </label>
        ))}
      </span>
    </div>
  );
}

function DebugShowConditions({ exp, setExperiment }) {
  let RadioChoices = ({ cond, choices }) => {
    let state = exp.get(cond);
    return (
      <span className="ChoiceList">
        {choices.map(([label, value], i) => (
          <label key={i}>
            <input
              type="radio"
              name={label}
              onChange={e => setExperiment(cond, value)}
              checked={state === value}
            />
            {label}
          </label>
        ))}
      </span>
    );
  };

  let BinaryChoice = ({ cond }) => {
    let isChecked = exp.get(cond);
    return (
      <label>
        <input
          name={cond}
          type="checkbox"
          checked={isChecked}
          onChange={e => setExperiment(cond, !isChecked)}
        />
      </label>
    );
  };

  // the addRandomHITParams func was previously defined here

  return (
    <>
      <div className={styleMultiSelect}>
        <b>Data conditions:</b>
        <RadioChoices
          cond={DATA_CONDITION}
          choices={[
            ["Garbage ++", DATA_GARBAGE_PP],
            ["No data", DATA_NONE],
            ["Garbage --", DATA_GARBAGE_MM]
          ]}
        />
      </div>
      <div className={styleMultiSelect}>
        <b>Attention 1 counterbalance:</b>
        <BinaryChoice cond={ATTN1_COUNTERBALANCE} />
      </div>
      <div className={styleMultiSelect}>
        <b>Attention 2 counterbalance:</b>
        <BinaryChoice cond={ATTN2_COUNTERBALANCE} />
      </div>
      <div className={styleMultiSelect}>
        <b>Attention 3 counterbalance:</b>
        <BinaryChoice cond={ATTN3_COUNTERBALANCE} />
      </div>
      <div className={styleMultiSelect}>
        <b>Attention 4 counterbalance:</b>
        <BinaryChoice cond={ATTN4_COUNTERBALANCE} />
      </div>
      <div className={styleMultiSelect}>
        <b>Ask dropout first:</b>
        <BinaryChoice cond={QUESTION_DROPOUT_FIRST} />
      </div>
      <div className={styleMultiSelect}>
        <b>Agree random counterbalance:</b>
        <BinaryChoice cond={AGREERAND_COUNTERBALANCE} />
      </div>
      <div>
        <button onClick={addRandomHITParams}>Add random HIT parameters</button>
      </div>
    </>
  );
}

let styleMultiSelect = css`
  b:first-of-type {
    display: inline-block;
    min-width: 160px;
  }
  label {
    display: inline-block;
    padding: 2px 3px;
  }
  button {
    margin: 1em 0;
  }
`;
