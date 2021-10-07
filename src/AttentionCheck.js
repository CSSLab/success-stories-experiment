import React, { useEffect } from "react";
import isNull from "lodash/isNull";
import {
  DATA_CONDITION,
  DATA_NONE,
  DATA_GARBAGE_PP,
  DATA_GARBAGE_MM,
  ATTN1_COUNTERBALANCE,
  ATTN2_COUNTERBALANCE,
  ATTN3_COUNTERBALANCE,
  ATTN4_COUNTERBALANCE
} from "./conditions";
import { useContextState } from "./AppContext";
import { useSmoothScrollTo } from "./utils";
import { calloutBoxStyle } from "./DecisionExperiment";
import TimeoutButton from "./TimeoutButton";

function AttentionChecks({ experiment, onFinish }) {
  let [attn1, setAttn1] = useContextState("Attn1", null);
  let [attn2, setAttn2] = useContextState("Attn2", null);
  let [attn3, setAttn3] = useContextState("Attn3", null);
  let [attn4, setAttn4] = useContextState("Attn4", null);
  let setAllCorrect = useContextState("AllAttnCorrect", null)[1];
  let dataCondition = experiment.get(DATA_CONDITION);
  let didSeeData = dataCondition !== DATA_NONE;
  let showedFounders = {
    [DATA_GARBAGE_PP]: "dropouts",
    [DATA_GARBAGE_MM]: "graduates"
  }[dataCondition];
  let showedFounderType = {
    [DATA_GARBAGE_PP]: "dropout",
    [DATA_GARBAGE_MM]: "graduate"
  }[dataCondition];
  let foundersWhoDidWhat = {
    // this is the OPPOSITE of what data they saw
    [DATA_GARBAGE_MM]: "dropped out of",
    [DATA_GARBAGE_PP]: "graduated from"
  }[dataCondition];

  let readyToContinue = didSeeData ? !isNull(attn4) : !isNull(attn3);

  useSmoothScrollTo("AttentionCheck");

  useEffect(() => {
    let attnChecks = didSeeData ? [attn1, attn2, attn3, attn4] : [attn1, attn3];
    let areAllCorrect = attnChecks.every(a => a && a.isCorrect);
    setAllCorrect(areAllCorrect);
  }, [attn1, attn2, attn3, attn4]);

  //
  // computing attention check counterbalances
  //

  function swapPair(arr) {
    return [arr[1], arr[0]];
  }

  // attn1

  let attn1Options = [
    { text: "a valuation of $100,000 or more", isCorrect: false },
    { text: "a valuation of $1 billion or more", isCorrect: true }
  ];
  if (experiment.get(ATTN1_COUNTERBALANCE)) {
    attn1Options = swapPair(attn1Options);
  }

  // attn2

  let attn2Options = [
    {
      text: "Dropped out of college",
      isCorrect: dataCondition === DATA_GARBAGE_PP
    },
    {
      text: "Graduated from college",
      isCorrect: dataCondition === DATA_GARBAGE_MM
    }
  ];
  if (experiment.get(ATTN2_COUNTERBALANCE)) {
    attn2Options = swapPair(attn2Options);
  }

  // attn3

  let attn3CorrectOption;
  let attn3IncorrectOption;
  if (didSeeData) {
    attn3CorrectOption = `Not everyone believes that companies with
        ${showedFounderType} founders are more likely to become unicorns,
        and there have been unicorns with founders who
        ${foundersWhoDidWhat} college.`;
    attn3IncorrectOption = `Everyone believes that companies with
        ${showedFounderType} founders are more likely to become unicorns,
        and there have not been unicorns with founders who
        ${foundersWhoDidWhat} college.`;
  } else {
    // did not see data
    attn3CorrectOption = `Most people are not sure whether
        founders who dropped out of college or
        founders who graduated college are more likely to
        become founders of unicorn startups.`;
    attn3IncorrectOption = `It is quite certain to many people that
        either founders who dropped out of college or
        founders who graduated college are
        more likely to become founders of unicorn startups.`;
  }

  let attn3Options = [
    { text: attn3CorrectOption, isCorrect: true },
    { text: attn3IncorrectOption, isCorrect: false }
  ];
  if (experiment.get(ATTN3_COUNTERBALANCE)) {
    attn3Options = swapPair(attn3Options);
  }

  // attn4

  let attn4Options = [
    { text: "True", isCorrect: true },
    { text: "False", isCorrect: false }
  ];
  if (experiment.get(ATTN4_COUNTERBALANCE)) {
    attn4Options = swapPair(attn4Options);
  }

  return (
    <>
      <p id="AttentionCheck">
        On the next page we are going to give you information about two other
        startups and ask you to predict which startup is more likely to be a
        unicorn. But first we have a few questions for you.
      </p>
      <AttentionCheck
        className="attn1"
        value={attn1}
        setter={setAttn1}
        question={<>A unicorn is a startup that achieves:</>}
        options={attn1Options}
      />
      {!isNull(attn1) && didSeeData && (
        <AttentionCheck
          className="attn2"
          value={attn2}
          setter={setAttn2}
          question={
            <>
              We showed you a table in which each row had a unicorn and a
              founder who:
            </>
          }
          options={attn2Options}
        />
      )}
      {(didSeeData ? !isNull(attn2) : !isNull(attn1)) && (
        <AttentionCheck
          className="attn3"
          value={attn3}
          setter={setAttn3}
          question={
            <>
              Which of the following statements is <b>true</b>?
            </>
          }
          options={attn3Options}
        />
      )}
      {didSeeData && !isNull(attn3) && (
        <AttentionCheck
          className="attn4"
          value={attn4}
          setter={setAttn4}
          question={
            <>
              The companies shown in the table above were selected because they
              are unicorns founded by college {showedFounders}:
            </>
          }
          options={attn4Options}
        />
      )}
      <TimeoutButton
        onClick={onFinish}
        timeout={500}
        disabled={!readyToContinue}
      >
        Continue
      </TimeoutButton>
    </>
  );
}

function AttentionCheck({ question, className, options, value, setter }) {
  return (
    <div className={`${className} ${calloutBoxStyle}`}>
      <div className="msg">{question}</div>
      {options.map((option, idx) => (
        <div
          key={idx}
          className={value && value.text === option.text ? "selected" : null}
        >
          <label>
            <input
              type="radio"
              className="AttnCheckOption"
              value={option.text}
              onChange={e => setter(option)}
              checked={(value && value.text === option.text) || false}
            />
            <span>{option.text}</span>
          </label>
        </div>
      ))}
    </div>
  );
}

export default AttentionChecks;
