import {
  oneWayHash,
  randomString,
  strNonEmpty,
  strToNum,
  isNumber
} from "./utils";

it("strNonEmpty is true for non-empty strings and false otherwise", () => {
  // non-empty examples
  expect(strNonEmpty("1")).toBe(true);
  expect(strNonEmpty("sdf")).toBe(true);
  // some undefined/edge cases - expect these to be non-empty
  expect(strNonEmpty(NaN)).toBe(true);
  expect(strNonEmpty(false)).toBe(true);
  expect(strNonEmpty(true)).toBe(true);
  expect(strNonEmpty(Boolean)).toBe(true);
  // false
  expect(strNonEmpty("")).toBe(false);
  expect(strNonEmpty(null)).toBe(false);
  expect(strNonEmpty(undefined)).toBe(false);
});

it("strToNum converts numeric strings to numbers", () => {
  expect(strToNum("1")).toBe(1);
  expect(strToNum("0")).toBe(0);
  expect(strToNum("-1")).toBe(-1);
  expect(strToNum("1,000,000")).toBe(1e6);
  expect(strToNum("1,0,000")).toBe(1e4);
  expect(strToNum("-100001214124")).toBe(-100001214124);
  expect(strToNum("1.2e9")).toBe(1.2e9);
  expect(strToNum("12e9")).toBe(12e9);
  // NaN cases (still requires a string as input)
  expect(strToNum("")).toBe(NaN);
  expect(strToNum("true")).toBe(NaN);
  expect(strToNum("false")).toBe(NaN);
});

it("isNumber is true for numeric strings and false for non-numeric strings", () => {
  expect(isNumber("1")).toBe(true);
  expect(isNumber("12")).toBe(true);
  expect(isNumber("hi")).toBe(false);
});

it("oneWayHash is deterministic", () => {
  let hash1 = oneWayHash("1");
  let hash2 = oneWayHash("2");
  let hash3shouldbe1 = oneWayHash("1");
  expect(hash1).toBe(hash3shouldbe1);
  expect(hash1).not.toBe(hash2);
});

it("oneWayHash works for MTurk looking IDs", () => {
  expect(oneWayHash("Annncccnnccncc")).toBe(oneWayHash("Annncccnnccncc"));
  // made this up randomly
  expect(oneWayHash("A194XND19CK0XK")).toBe(oneWayHash("A194XND19CK0XK"));

  // try a hundred random Mturk ID-like strings
  for (let i = 0; i < 100; i++) {
    let id = `A${randomString()}`.toUpperCase();
    expect(oneWayHash(id)).toBe(oneWayHash(id));
  }
});
