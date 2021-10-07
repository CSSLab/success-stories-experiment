import React from "react";
import { css } from "emotion";
import Table from "./Table";
import {
  DATA_CONDITION,
  // data ordering
  DATA_GARBAGE_PP,
  DATA_GARBAGE_MM,
  DATA_NONE,
  ORDERING_DATA_GARBAGE_PP,
  ORDERING_DATA_GARBAGE_MM
} from "./conditions";

export default function DataNarrativeView({ experiment }) {
  const dataCondition = experiment.get(DATA_CONDITION);

  let tableClass = css`
    margin: 1em 2em;
  `;

  let narrative;
  let dataTable;
  if (dataCondition === DATA_GARBAGE_PP) {
    let data = experiment.get(ORDERING_DATA_GARBAGE_PP);
    dataTable = (
      <Table className={tableClass}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Co-founder</th>
            <th>Dropped out?</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.company}</td>
              <td>{row.founder}</td>
              <td>Yes</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    narrative = (
      <>
        Some people believe that a startup is more likely to become a unicorn if
        it is founded by someone who has dropped out of college (that is, they
        did not graduate). Not everyone believes this, of course, and there are
        plenty of examples of unicorn startups whose founders graduated from
        college. But here are some companies that we chose to show you because
        they are unicorns founded by college dropouts.
      </>
    );
  } else if (dataCondition === DATA_GARBAGE_MM) {
    let data = experiment.get(ORDERING_DATA_GARBAGE_MM);
    dataTable = (
      <Table className={tableClass}>
        <thead>
          <tr>
            <th>Company</th>
            <th>Co-founder</th>
            <th>Graduated?</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              <td>{row.company}</td>
              <td>{row.founder}</td>
              <td>Yes</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
    narrative = (
      <>
        Some people believe that a startup is more likely to become a unicorn if
        it is founded by someone who has graduated from college (that is, they
        did not drop out). Not everyone believes this, of course, and there are
        plenty of examples of unicorn startups whose founders dropped out of
        college. But here are some companies that we chose to show you because
        they are unicorns founded by college graduates.
      </>
    );
  } else if (dataCondition === DATA_NONE) {
    narrative = (
      <>
        People debate whether startup companies whose founders dropped out of
        college (that is, did not graduate) are more or less likely to become
        unicorns.
      </>
    );
  }
  return (
    <>
      <p>{narrative}</p>
      {dataTable}
    </>
  );
}
