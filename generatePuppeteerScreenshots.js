const puppeteer = require("puppeteer");

const port = 3000; // 8080 for http-server

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:${port}/?workerId=z1r&assignmentId=test`);

  async function pageClickWait(sel) {
    console.log("page click wait", sel);
    return Promise.all([page.waitForNavigation(), page.click(sel)]);
  }

  async function checkboxValue(name, value) {
    console.log("checkbox value", name, value);
    let sel = `input[name="${name}"]`;
    let checkbox = await page.$(sel);
    let cbValue = await (await checkbox.getProperty("checked")).jsonValue();
    if (cbValue !== value) {
      await pageClickWait(sel);
    }
    await checkbox.dispose();
    return Promise.resolve();
  }

  async function takeScreenshot(
    stage,
    dataCond,
    attn1,
    attn2,
    attn3,
    attn4,
    dropFirst
  ) {
    console.log();
    console.log("stage", stage);
    console.log("dataCond", dataCond);
    console.log("attn1", attn1);
    console.log("attn2", attn2);
    console.log("attn3", attn3);
    console.log("attn4", attn4);
    console.log("dropFirst", dropFirst);

    // ensure the correct data condition
    await checkboxValue(dataCond, true);

    await checkboxValue("ATTN1_COUNTERBALANCE", attn1);
    await checkboxValue("ATTN2_COUNTERBALANCE", attn2);
    await checkboxValue("ATTN3_COUNTERBALANCE", attn3);
    await checkboxValue("ATTN4_COUNTERBALANCE", attn4);
    await checkboxValue("QUESTION_DROPOUT_FIRST", dropFirst);

    // navigate to the correct experiment page
    await page.click(`span.ChoiceList input[name=${stage}]`);

    if (stage === "EXPERIMENT") {
      await page.click(".agreeRandTrue");
      await page.click("input[value='graduate']");
      await page.click(".slider");
    } else if (stage === "ATTENTION_CHECK") {
      await page.click(".attn1 input.AttnCheckOption");
      if (dataCond !== "No data") {
        await page.click(".attn2 input.AttnCheckOption");
      }
      await page.click(".attn3 input.AttnCheckOption");
      if (dataCond !== "No data") {
        await page.click(".attn4 input.AttnCheckOption");
      }
    }

    // generate a filename for the screenshot
    let filenameParts = [stage];
    if (dataCond === "Garbage ++") filenameParts.push("SawDropouts");
    if (dataCond === "Garbage --") filenameParts.push("SawGrads");
    if (dataCond === "No data") filenameParts.push("SawNothing");
    filenameParts.push(attn1 ? "A1true" : "A1false");
    filenameParts.push(attn2 ? "A2true" : "A2false");
    filenameParts.push(attn3 ? "A3true" : "A3false");
    filenameParts.push(attn4 ? "A4true" : "A4false");
    filenameParts.push(dropFirst ? "DropFirst" : "GradFirst");
    let filename = filenameParts.join("_");

    await page.screenshot({
      path: `./allscreenshots/${filename}.png`,
      fullPage: true
    });
  }

  let CONDS = ["No data", "Garbage ++", "Garbage --"];
  let TF = [true, false];
  let stage;

  stage = "ATTENTION_CHECK";
  for (let dataCond of CONDS) {
    for (let a1 of TF) {
      for (let a2 of TF) {
        for (let a3 of TF) {
          for (let a4 of TF) {
            await takeScreenshot(stage, dataCond, a1, a2, a3, a4, true);
          }
        }
      }
    }
  }

  stage = "EXPERIMENT";
  for (let dataCond of CONDS) {
    for (let dropFirst of TF) {
      await takeScreenshot(stage, dataCond, true, true, true, true, dropFirst);
    }
  }
  console.log("\ndone");

  await browser.close();
})();
