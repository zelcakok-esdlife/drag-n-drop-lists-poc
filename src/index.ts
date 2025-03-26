import * as jsonData from "./aboutUsEN.json";
// import * as jsonData from "./testingDemo.json";
// import * as jsonData from "./homepage.json";
import { PropertyJson } from "./types";
import { writeFileSync } from "fs";
import { constructFromLists, extractToLists } from "./utils";


const { componentList, sequenceList, propertyList } = extractToLists(jsonData as PropertyJson[])

writeFileSync("output/sequenceList.json", JSON.stringify(sequenceList, null, 2));
writeFileSync("output/componentList.json", JSON.stringify(componentList, null, 2));
writeFileSync("output/propertyList.json", JSON.stringify(propertyList, null, 2));

const result = constructFromLists({ componentList, sequenceList, propertyList });
writeFileSync("output/reconsturct.json", JSON.stringify(result, null, 2));