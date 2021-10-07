import UnicornExperiment from "./PlanOut";
import {
  DATA_CONDITION,
  DATA_GARBAGE_MM,
  DATA_GARBAGE_PP,
  DATA_NONE,
  ORDERING_DATA_GARBAGE_PP,
  ORDERING_DATA_GARBAGE_MM,
  QUESTION_DROPOUT_FIRST,
  ATTN1_COUNTERBALANCE,
  ATTN2_COUNTERBALANCE,
  ATTN3_COUNTERBALANCE,
  ATTN4_COUNTERBALANCE,
  AGREERAND_COUNTERBALANCE
} from "./conditions";
import { randomString } from "./utils";

function experiment(userId) {
  return new UnicornExperiment({ userId });
}

function randomExperiment() {
  return experiment(randomString());
}

it("assigns values to the conditions", () => {
  let exp = experiment("1");
  expect(exp.get(DATA_CONDITION)).toBeTruthy();
  expect(exp.get(ORDERING_DATA_GARBAGE_MM)).toBeTruthy();
  expect(exp.get(ORDERING_DATA_GARBAGE_PP)).toBeTruthy();
});

function testCondition(condition, outcomes, n = 1000) {
  // test helper function: for `condition`, will we obtain the `outcomes`?
  // if there is a failure, first check the `it(...)` tests later on
  let allCounts = {};
  for (let i = 0; i < n; i++) {
    let cond = randomExperiment().get(condition);
    if (!(cond in allCounts)) {
      allCounts[cond] = 0;
    }
    allCounts[cond]++;
  }

  let precision = Math.log10(n) - 2;
  for (let outcome of outcomes) {
    let outcomeCount = allCounts[outcome];
    // each outcome occurs at least once
    expect(outcomeCount).toBeGreaterThan(0);
    // each outcome is roughly uniformly distributed
    expect(outcomeCount / n).toBeCloseTo(1 / outcomes.length, precision);
  }

  // only the expected outcomes occurred
  let sum = outcomes.map(o => allCounts[o]).reduce((a, b) => a + b, 0);
  expect(sum).toBe(n);
}

it("uniformly distributes data condition", () => {
  testCondition(DATA_CONDITION, [DATA_GARBAGE_MM, DATA_GARBAGE_PP, DATA_NONE]);
});

it("assigns true/false to QUESTION_DROPOUT_FIRST", () => {
  testCondition(QUESTION_DROPOUT_FIRST, [true, false]);
});

it("assigns true/false to ATTN1_COUNTERBALANCE", () => {
  testCondition(ATTN1_COUNTERBALANCE, [true, false]);
});

it("assigns true/false to ATTN2_COUNTERBALANCE", () => {
  testCondition(ATTN2_COUNTERBALANCE, [true, false]);
});

it("assigns true/false to ATTN3_COUNTERBALANCE", () => {
  testCondition(ATTN3_COUNTERBALANCE, [true, false]);
});

it("assigns true/false to ATTN4_COUNTERBALANCE", () => {
  testCondition(ATTN4_COUNTERBALANCE, [true, false]);
});

it("assigns true/false to AGREERAND_COUNTERBALANCE", () => {
  testCondition(AGREERAND_COUNTERBALANCE, [true, false]);
});

it("does not always give boolean conditions the same assignment", () => {
  let outcomes = [];
  for (let i = 0; i < 1000; i++) {
    let exp = randomExperiment();
    outcomes.push([
      exp.get(QUESTION_DROPOUT_FIRST),
      exp.get(ATTN1_COUNTERBALANCE),
      exp.get(ATTN2_COUNTERBALANCE),
      exp.get(ATTN3_COUNTERBALANCE),
      exp.get(ATTN4_COUNTERBALANCE),
      exp.get(AGREERAND_COUNTERBALANCE)
    ]);
  }
  let allOutcomesAreSame = outcomes.every(([o1, o2]) => o1 === o2);
  expect(allOutcomesAreSame).toBe(false);
});

it("consistently assigns dropouts for the garbage++ ordering", () => {
  let exp = experiment("garbage++");
  let plusplus = exp.get(ORDERING_DATA_GARBAGE_PP);
  expect(plusplus.every(u => u.dropout === true)).toBe(true);
  expect(plusplus.length).toBe(5);

  let exp2 = experiment("garbage++");
  let plusplus2 = exp2.get(ORDERING_DATA_GARBAGE_PP);
  expect(plusplus2.length).toBe(5);

  let zipped = plusplus.map((u1, i) => [u1, plusplus2[i]]);
  let isSameCompany = (u1, u2) =>
    u1.company === u2.company && u1.founder === u2.founder;

  expect(zipped.every(([u1, u2]) => isSameCompany(u1, u2))).toBe(true);

  let exp3 = experiment("garbage++++++");
  let plusplus3 = exp3.get(ORDERING_DATA_GARBAGE_PP);
  expect(plusplus3.length).toBe(5);
  let zipped2 = plusplus.map((u1, i) => [u1, plusplus3[i]]);
  expect(zipped2.every(([u1, u2]) => isSameCompany(u1, u2))).toBe(false);
});

it("consistently assigns non-dropouts for the garbage-- ordering", () => {
  let exp = experiment("garbage--");
  let plusplus = exp.get(ORDERING_DATA_GARBAGE_MM);
  expect(plusplus.every(u => u.dropout === false)).toBe(true);
  expect(plusplus.length).toBe(5);

  let exp2 = experiment("garbage--");
  let plusplus2 = exp2.get(ORDERING_DATA_GARBAGE_MM);
  expect(plusplus2.length).toBe(5);

  let zipped = plusplus.map((u1, i) => [u1, plusplus2[i]]);
  let isSameCompany = (u1, u2) =>
    u1.company === u2.company && u1.founder === u2.founder;

  expect(zipped.every(([u1, u2]) => isSameCompany(u1, u2))).toBe(true);

  let exp3 = experiment("garbage-----------");
  let plusplus3 = exp3.get(ORDERING_DATA_GARBAGE_MM);
  expect(plusplus3.length).toBe(5);
  let zipped2 = plusplus.map((u1, i) => [u1, plusplus3[i]]);
  expect(zipped2.every(([u1, u2]) => isSameCompany(u1, u2))).toBe(false);
});
