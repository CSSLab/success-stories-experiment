import React, { useState, useEffect } from "react";
import NewWindow from "react-new-window";
import { css } from "emotion";
import { useContextState } from "./AppContext";

export default function IntroView({ hitAccepted, onComplete }) {
  let [consent, setConsent] = useContextState("IntroConsentObtained", null);
  let [showNextButton, setShowNextButton] = useState(false);
  let [windowOpen, setWindowOpen] = useState(false);
  useEffect(() => {
    let timeout;
    if (!showNextButton) {
      let showNextTimeout = process.env.REACT_APP_DEV === "true" ? 500 : 5000;
      timeout = setTimeout(() => setShowNextButton(true), showNextTimeout);
    }
    return () => clearTimeout(timeout);
  }, []);

  let showAgreeCSS = css`
    ${showNextButton ? `opacity: 1` : `opacity: 0; visibility: hidden`};
    transition: opacity 0.5s ease-in;
  `;

  let continueForm;
  if (hitAccepted) {
    let leadInText = showNextButton ? (
      <b>Do you understand and consent to these terms?</b>
    ) : (
      <i>Please read carefully before continuing.</i>
    );
    continueForm = (
      <div
        className={css`
          label {
            margin-right: 30px;
          }
        `}
      >
        {leadInText}
        <div className={showAgreeCSS}>
          <p>
            <label>
              <input
                type="checkbox"
                className={css`
                  margin-right: 5px;
                `}
                checked={consent === true}
                onChange={e => setConsent(true)}
              />
              I agree to this consent form
            </label>
            <label>
              <input
                type="checkbox"
                className={css`
                  margin-right: 5px;
                `}
                checked={consent === false}
                onChange={e => setConsent(false)}
              />
              No thanks, I do not want to do this task
            </label>
          </p>
          <div>
            <button onClick={onComplete} disabled={!consent}>
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    continueForm = (
      <p>
        <b>You must accept this HIT before you can continue.</b>
        {process.env.REACT_APP_DEV === "true" ? (
          <>
            {" "}
            (We are currently in debug mode: click the "Add random HIT
            parameters" to continue)
          </>
        ) : null}
      </p>
    );
  }

  return (
    <div>
      {windowOpen ? (
        <NewWindow onUnload={() => setWindowOpen(false)}>
          <ConsentReader fullscreen />
        </NewWindow>
      ) : null}
      <ConsentReader
        fullscreen={false}
        openFormInNewWindow={() => setWindowOpen(true)}
      />
      {continueForm}
    </div>
  );
}

function ConsentReader({ openFormInNewWindow, fullscreen }) {
  let defaultStyle = css`
    h2 {
      font-size: 21px;
      margin-bottom: 5px;
    }
    h3 {
      font-size: 16px;
      margin-bottom: 3px;
    }
    p {
      margin-top: 0;
    }
    button {
      border: none;
      background: none;
      text-decoration: underline;
      font-size: 100%;
      margin: 0;
      padding: 0;
      color: blue;
    }
  `;

  let displayCSS;
  if (!fullscreen) {
    // put most of the form in a scrollable window
    displayCSS = css`
      overflow-y: auto;
      max-height: 350px;
      border: 1px solid #999999;
      box-shadow: inset 0px 0px 4px 1px rgba(0, 0, 0, 0.2);
      padding: 5px;
      h2:first-child {
        margin-top: 0;
      }
    `;
  }
  return (
    <div
      className={css`
        ${defaultStyle} ${fullscreen ? "margin:1em" : null}
      `}
    >
      <h2>Introduction</h2>
      <p>
        Thank you for taking the time to consider volunteering in a Microsoft
        Corporation research project. This form explains what would happen if
        you join this research project. Please read it carefully and take as
        much time as you need. Email the study team to ask about anything that
        is not clear. Participation in this study is voluntary and you may
        withdraw at any time.
      </p>
      <div className={displayCSS}>
        <h2>Title of research project</h2>
        <p>Predicting Unicorns</p>
        <h3>Principal Investigator: Dan Goldstein</h3>
        <h2>Purpose</h2>
        The purpose of this project is to study decision making.
        <h2>Procedures</h2>
        <p>
          During this project, you will read some information about startup
          companies and be asked a few questions about investing in startup
          companies.
        </p>
        <p>
          Microsoft may document and collect information about your
          participation by recording your answers to multiple choice and free
          response questions.
        </p>
        <p>Approximately 1,000 participants will be involved in this study.</p>
        <h2>Personal information </h2>
        <div>
          <p>
            Aside from your Mechanical Turk ID, no personal information will be
            collected during this study. Your Mechanical Turk ID will not be
            shared outside of Microsoft Research and the confines of this study
            without your permission, and will be promptly deleted after
            compensation has been successfully provided (30 days or less).
            De-identified data may be used for future research or given to
            another investigator for future use without additional consent.
          </p>
          <ul>
            <li>
              Microsoft Research is ultimately responsible for determining the
              purposes and uses of data collected through this study.
            </li>
          </ul>
          <p>
            For additional information or concerns about how Microsoft handles
            your personal information, please see the{" "}
            <a href="https://privacy.microsoft.com/en-us/privacystatement">
              Microsoft Privacy Statement
            </a>{" "}
            (
            <a href="https://privacy.microsoft.com/en-us/privacystatement">
              https://privacy.microsoft.com/en-us/privacystatement
            </a>
            ).
          </p>
        </div>
        <h2>Benefits and risks</h2>
        <p>
          <b>Benefits:</b>
          {"  "}There are no direct benefits to you that might reasonably be
          expected as a result of being in this study. The research team expects
          to learn about human decision making from the results of this
          research, as well as any public benefit that may come from these
          research results being shared with the greater scientific community.
        </p>
        <p>
          <b>Risks:</b>
          {"  "}If you are unable to submit a HIT due to technical difficulties
          on your end there is a risk of loss of payment. To mitigate
          participants can reach out to the research team for input on resolving
          any difficulties encountered.
        </p>
        <h2>Payment for participation</h2>
        <p>
          You will receive $0.50 after completing the entire study, with the
          potential for a bonus of up to $1.00 on the basis of the outcome of a
          decision made in the experiment.
        </p>
        <p>
          Your data and/or samples may be used to make new products, tests or
          findings. These may have value and may be developed and owned by
          Microsoft and/or others. If this happens, there are no plans to pay
          you.
        </p>
        <h2>Contact information</h2>
        <p>
          Should you have any questions concerning this project, or if you are
          injured as a result of being in this study, please contact us at{" "}
          <a href="mailto:dgg@microsoft.com">dgg@microsoft.com</a>.
        </p>
        <p>
          Should you have any questions about your rights as a research subject,
          please contact Microsoft Research Ethics Program Feedback at{" "}
          <a href="mailto:MSRStudyfeedback@microsoft.com">
            MSRStudyfeedback@microsoft.com
          </a>
          .
        </p>
      </div>
      <h2>Consent</h2>
      <p>
        By clicking “I agree” below, you confirm that the study was explained to
        you, you had a chance to ask questions before beginning the study, and
        all your questions were answered satisfactorily. By clicking “I agree”
        below, you voluntarily consent to participate, and you do not give up
        any legal rights you have as a study participant.
      </p>
      {!fullscreen && (
        <p>
          <button onClick={openFormInNewWindow}>Clicking here</button> will open
          a separate window where you may print out or save this form.
        </p>
      )}
      <p>
        On behalf of Microsoft, we thank you for your contribution and look
        forward to your research session.
      </p>
    </div>
  );
}
