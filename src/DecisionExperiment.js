import React, { useEffect } from "react";
import { css } from "emotion";
import {
  DATA_CONDITION,
  DATA_NONE,
  QUESTION_DROPOUT_FIRST,
  AGREERAND_COUNTERBALANCE
} from "./conditions";
import TimeoutButton from "./TimeoutButton";
import { useContextState } from "./AppContext";
import { useSmoothScrollTo } from "./utils";
import Slider from "./Slider";

const DROPOUT = "dropout";
const GRAD = "graduate";

const UNSURE = "unsure";
const SOMEWHAT = "somewhat";
const FAIRLY = "fairly";
const VERY = "very";
const CERTAIN = "certain";

export default function DecisionExperiment({ experiment, onContinue }) {
  let [bet, setBet] = useContextState("DecisionBet", null);
  let [confidence, setConfidence] = useContextState("DecisionConfidence", null);
  let [confirmed, setConfirmed] = useContextState("DecisionConfirmed", false);
  let [agreeRand, setAgreeRand] = useContextState("DecisionAgreeRand", null);
  let setConfLevel = useContextState("DecisionConfidenceLevel")[1];
  let dataCondition = experiment.get(DATA_CONDITION);
  let didSeeData = dataCondition !== DATA_NONE;
  let didNotSeeData = !didSeeData;

  useSmoothScrollTo("DecisionExperiment");

  useEffect(() => setConfLevel(confidenceLevel(confidence)), [confidence]);

  function setAgreeRandReset(newAgree) {
    setAgreeRand(newAgree);
    setBet(null);
    setConfidence(null);
    setConfirmed(false);
  }
  function setBetReset(newBet) {
    setBet(newBet);
    setConfidence(null);
    setConfirmed(false);
  }
  function setConfidenceReset(newConf) {
    setConfidence(newConf);
    setConfirmed(false);
  }

  let investValid = bet !== null;
  let confidenceValid = confidenceIsValid(confidence);
  let allowContinue = investValid && confidenceValid && confirmed;

  let startups = "two other startups";
  if (didNotSeeData) {
    startups = "two startups";
  }

  let agreeRandOptions = [
    <div className={agreeRand === true ? "selected" : null} key="true">
      <label>
        <input
          className="agreeRandTrue"
          type="radio"
          onChange={e => setAgreeRandReset(true)}
          checked={agreeRand === true}
        />
        True
      </label>
    </div>,
    <div className={agreeRand === false ? "selected" : null} key="false">
      <label>
        <input
          type="radio"
          onChange={e => setAgreeRandReset(false)}
          checked={agreeRand === false}
        />
        False
      </label>
    </div>
  ];
  if (experiment.get(AGREERAND_COUNTERBALANCE)) {
    agreeRandOptions = [agreeRandOptions[1], agreeRandOptions[0]];
  }

  return (
    <div id="DecisionExperiment">
      <p>
        Now we are going to give you information about {startups} and ask you to
        predict which startup is more likely to be a unicorn. You may receive a
        HIT bonus of $1.00 based on your decision.
      </p>
      <p>
        We have a database of all types of startup companies, with data about
        many features of the companies, and whether they became unicorns or not.
        We also have data on the founders of these companies, and whether or not
        these founders graduated or dropped out of college.
      </p>
      <p>
        Now, completely at random, we will pick a company with a dropout founder
        from our database, and a company with a graduate founder from our
        database
        {didSeeData ? " (excluding the companies in the table above)." : "."}
      </p>
      <p>
        You must decide to bet on one of these two companies. If the company you
        bet on is a unicorn then in addition to your HIT payment, you’ll get a{" "}
        <b>bonus of $1.00</b> — if it is not a unicorn, you won’t get a bonus.
      </p>
      <div className={calloutBoxStyle}>
        <div className="msg">
          {didSeeData ? (
            <>
              These two companies will be randomly sampled from our database,
              and do not include any of the companies we showed in the table
              above:
            </>
          ) : (
            <>These two companies will be randomly sampled from our database:</>
          )}
          {agreeRandOptions}
        </div>
      </div>
      {agreeRand !== null ? (
        <>
          <p>
            <b>Which startup is more likely to be a unicorn?</b>
          </p>
          <DecisionExperimentInput
            bet={bet}
            setBet={setBetReset}
            experiment={experiment}
          />
        </>
      ) : null}
      {investValid ? (
        <>
          <p>
            <b>How confident are you in this decision?</b>
          </p>
          <DecisionExperimentConfidence
            confidence={confidence}
            setConfidence={setConfidenceReset}
            bet={bet}
          />
        </>
      ) : null}
      {confidenceValid ? (
        <>
          <Message bet={bet} confidence={confidence} />
          <DecisionConfirm
            msg={
              <i>
                Click “Confirm” below if this is what you want, or update your
                answer.
              </i>
            }
            confirmed={confirmed}
            setConfirmed={setConfirmed}
          />
        </>
      ) : null}
      {allowContinue && (
        <p>
          Within a few days of completing this HIT, you will be paid a bonus if
          the company you chose becomes successful based on a random draw.
        </p>
      )}
      <p>
        <TimeoutButton
          onClick={onContinue}
          disabled={!allowContinue}
          timeout={process.env.REACT_APP_DEV === "true" ? 500 : 3000}
        >
          Continue
        </TimeoutButton>
      </p>
    </div>
  );
}

export let calloutBoxStyle = css`
  margin: 10px 0;
  border: 1px solid #bfbfbf;
  border-radius: 10px;
  background: #f7f7f7;
  padding: 1em;
  div {
    margin: 5px 0;
    label {
      &:hover {
        cursor: pointer;
      }
      input {
        margin-right: 8px;
      }
    }
    &.selected {
      font-weight: bold;
    }
    &.msg {
      max-width: 70%;
    }
  }
`;

function DecisionExperimentInput({ bet, setBet, experiment }) {
  let dropout = (
    <div className={bet === DROPOUT ? "selected" : null}>
      <label>
        <input
          type="radio"
          value={DROPOUT}
          onChange={e => setBet(DROPOUT)}
          checked={bet === DROPOUT}
        />
        The startup with a dropout founder
      </label>
    </div>
  );

  let grad = (
    <div className={bet === GRAD ? "selected" : null}>
      <label>
        <input
          type="radio"
          value={GRAD}
          onChange={e => setBet(GRAD)}
          checked={bet === GRAD}
        />
        The startup with a graduate founder
      </label>
    </div>
  );

  let isDropoutFirst = experiment.get(QUESTION_DROPOUT_FIRST);
  return (
    <div className={calloutBoxStyle}>
      {isDropoutFirst ? (
        <>
          {dropout}
          {grad}
        </>
      ) : (
        <>
          {grad}
          {dropout}
        </>
      )}
    </div>
  );
}

function confidenceIsValid(confidence) {
  let nan = confidence === null || isNaN(confidence);
  if (nan) {
    return false;
  }
  let int = parseInt(confidence, 10);
  if (isNaN(int)) {
    return false;
  }
  return true;
}

function DecisionExperimentConfidence({ confidence, setConfidence, bet }) {
  return (
    <div className={calloutBoxStyle}>
      <p>
        {!confidenceIsValid(confidence) ? (
          <i>
            Please indicate your confidence by clicking on the slider below. You
            may click anywhere on the slider.
          </i>
        ) : (
          <i>You can change your response by dragging the slider.</i>
        )}
      </p>
      <Slider value={confidence} setValue={setConfidence} />
      <table
        className={css`
          table-layout: fixed;
          width: 100%;
          td.align {
            width: 35%;
            vertical-align: top;
          }
          td.align-right {
            text-align: right;
          }
        `}
      >
        <tbody>
          <tr>
            <td className="align align-left">&uarr;</td>
            <td />
            <td className="align align-right">&uarr;</td>
          </tr>
          <tr>
            <td className="align align-left">
              <b>Completely unsure</b> which startup is more likely to be a
              unicorn
            </td>
            <td> </td>
            <td className="align align-right">
              <b>Absolutely certain</b> that the startup with the{" "}
              <b>{bet} founder</b> is more likely to become a unicorn
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DecisionConfirm({ confirmed, setConfirmed, msg }) {
  return (
    <div className={calloutBoxStyle}>
      {msg ? <div className="msg">{msg}</div> : null}
      <div className={confirmed ? "selected" : null}>
        <label>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(!confirmed)}
          />{" "}
          Confirm
        </label>
      </div>
    </div>
  );
}

function confidenceLevel(conf) {
  if (conf === null) {
    return null;
  }
  let confidence = parseInt(conf, 10);
  if (confidence === 0) {
    return UNSURE;
  } else if (confidence < 33) {
    return SOMEWHAT;
  } else if (confidence < 67) {
    return FAIRLY;
  } else if (confidence <= 99) {
    return VERY;
  } else {
    return CERTAIN;
  }
}

function Message({ bet, confidence }) {
  let level = confidenceLevel(confidence);

  let msg;
  if (confidence === null) {
    msg = "you did not provide a confidence level";
  } else if (level === UNSURE) {
    msg = (
      <>
        <b>you are completely unsure</b> which startup is more likely to become
        a unicorn
      </>
    );
  } else if (level === CERTAIN) {
    msg = (
      <>
        <b>you are absolutely certain</b> that the startup with the {bet}{" "}
        founder is more likely to become a unicorn
      </>
    );
  } else {
    msg = (
      <>
        <b>you are {level} confident</b> that the startup with the {bet} founder
        is more likely to become a unicorn
      </>
    );
  }

  return (
    <p>
      Your responses indicate that you would bet on the startup with the {bet}{" "}
      founder and {msg}.
    </p>
  );
}
