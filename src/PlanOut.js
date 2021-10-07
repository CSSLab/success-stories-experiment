import PlanOut from "planout";
import {
  // condition names
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
import unicorns from "./unicorns.json";

export default class UnicornExperiment extends PlanOut.Experiment {
  setup() {
    this.setName("PredictingUnicorns");
  }

  assign(params, args) {
    let UniformChoice = choices =>
      new PlanOut.Ops.Random.UniformChoice({
        choices,
        unit: args.userId
      });

    params.set(
      DATA_CONDITION,
      UniformChoice([DATA_GARBAGE_PP, DATA_NONE, DATA_GARBAGE_MM])
    );
    params.set(
      ORDERING_DATA_GARBAGE_PP,
      new PlanOut.Ops.Random.Sample({
        choices: unicorns.filter(u => u.dropout === true),
        draws: 5,
        unit: args.userId
      })
    );
    params.set(
      ORDERING_DATA_GARBAGE_MM,
      new PlanOut.Ops.Random.Sample({
        choices: unicorns.filter(u => u.dropout === false),
        draws: 5,
        unit: args.userId
      })
    );
    params.set(
      QUESTION_DROPOUT_FIRST,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
    params.set(
      ATTN1_COUNTERBALANCE,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
    params.set(
      ATTN2_COUNTERBALANCE,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
    params.set(
      ATTN3_COUNTERBALANCE,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
    params.set(
      ATTN4_COUNTERBALANCE,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
    params.set(
      AGREERAND_COUNTERBALANCE,
      new PlanOut.Ops.Random.UniformChoice({
        choices: [true, false],
        unit: args.userId
      })
    );
  }

  // boilerplate

  configureLogger() {
    return;
  }

  log(event) {
    // console.log(event);
  }

  getParamNames() {
    return this.getDefaultParamNames();
  }

  previouslyLogged() {
    return this._exposureLogged;
  }
}

export function randomExperiment() {
  return new UnicornExperiment({ userId: randomString() });
}

function findExperiment(desiredDataCondition) {
  for (let i = 0; i < 100; i++) {
    let exp = randomExperiment();
    if (exp.get(DATA_CONDITION) === desiredDataCondition) {
      return exp;
    }
  }
  throw new Error("no experiment found");
}

export let ExperimentFixtures = {
  // data conditions
  [DATA_GARBAGE_PP]: findExperiment(DATA_GARBAGE_PP),
  [DATA_GARBAGE_MM]: findExperiment(DATA_GARBAGE_MM),
  [DATA_NONE]: findExperiment(DATA_NONE),
  ANY: randomExperiment()
};
