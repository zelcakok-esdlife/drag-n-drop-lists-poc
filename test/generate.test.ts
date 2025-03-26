import * as jsonData from "../src/aboutUsEN.json";
// import * as jsonData from "../src/testingDemo.json";
// import * as jsonData from "../src/homepage.json";
import { PropertyJson, SequenceListElement } from "../src/types";
import {
  addElement,
  constructFromLists,
  extractToLists,
  removeElement,
  reorderElement,
} from "../src/utils";

describe("Extract & Reconstuct", () => {
  const extractResult = extractToLists(jsonData as PropertyJson[]);
  const clonedExtractResult = { ...extractResult };
  const { componentList, sequenceList, propertyList } = extractResult;

  it("componentList shouldn't have id and value fields", () => {
    componentList.map((element: PropertyJson) => {
      expect(element.id).toBeUndefined();
      expect(element.value).toBeUndefined();
    });
  });

  it("sequenceList should have id and children fields", () => {
    sequenceList.map((sequenceListElement: SequenceListElement) => {
      expect(sequenceListElement).toHaveProperty("id");
      if (sequenceListElement.children) {
        expect(sequenceListElement.children).toBeInstanceOf(Array);
      }
    });
  });

  const reconstructed = constructFromLists(clonedExtractResult);
  it("reconstructed should be the same as the json data", () => {
    reconstructed.map((element: PropertyJson, index: number) => {
      expect(element).toEqual(jsonData[index]);
    });
  });

  const newElement: PropertyJson = {
    id: "newElementID",
    element: "text",
    type: "text",
    properties: [
      {
        element_id: "text_label",
        label: "Label",
        placeholder: "Input here ...",
        type: "text",
        value: "This is the new element",
      },
    ],
  };

  it("should be able to add the new element to the top", () => {
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addElement(newElement, 0, propertyList, sequenceList);

    expect(updatedPropertyList).not.toEqual(propertyList);
    expect(updatedPropertyList).toHaveProperty("newElementID");
    expect(updatedPropertyList["newElementID"]).toEqual({
      text_label: "This is the new element",
    });

    expect(updatedSequenceList).not.toEqual(sequenceList);
    expect(updatedSequenceList.length - sequenceList.length).toBe(1);
    expect(updatedSequenceList[0]).toEqual({ id: "newElementID" });
  });

  it("should be able to add the new element to the middle", () => {
    const positionToAdd = Math.floor(sequenceList.length / 2);
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addElement(newElement, positionToAdd, propertyList, sequenceList);

    expect(updatedPropertyList).not.toEqual(propertyList);
    expect(updatedPropertyList).toHaveProperty("newElementID");
    expect(updatedPropertyList["newElementID"]).toEqual({
      text_label: "This is the new element",
    });

    expect(updatedSequenceList).not.toEqual(sequenceList);
    expect(updatedSequenceList.length - sequenceList.length).toBe(1);
    expect(updatedSequenceList[positionToAdd]).toEqual({ id: "newElementID" });
    expect(updatedSequenceList.slice(0, positionToAdd)).toEqual(
      sequenceList.slice(0, positionToAdd)
    );
    expect(updatedSequenceList.slice(positionToAdd + 1)).toEqual(
      sequenceList.slice(positionToAdd)
    );
  });

  it("should be able to add the new element to the last", () => {
    const positionToAdd = sequenceList.length;
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addElement(newElement, positionToAdd, propertyList, sequenceList);

    expect(updatedPropertyList).not.toEqual(propertyList);
    expect(updatedPropertyList).toHaveProperty("newElementID");
    expect(updatedPropertyList["newElementID"]).toEqual({
      text_label: "This is the new element",
    });

    expect(updatedSequenceList).not.toEqual(sequenceList);
    expect(updatedSequenceList.length - sequenceList.length).toBe(1);
    expect(updatedSequenceList[positionToAdd]).toEqual({ id: "newElementID" });
    expect(updatedSequenceList.slice(positionToAdd + 1)).toEqual([]);
  });

  it("should be able to remove the element at the middle", () => {
    const positionToRemove = Math.floor(sequenceList.length / 2);
    const targetElement = sequenceList[positionToRemove];

    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = removeElement(targetElement.id, propertyList, sequenceList);

    expect(updatedPropertyList).not.toHaveProperty(targetElement.id);
    expect(updatedSequenceList.length - sequenceList.length).toBe(-1);
    const searchResult = updatedSequenceList.filter(
      (element: SequenceListElement) => element.id === targetElement.id
    );
    expect(searchResult).toEqual([]);
  });

  it("should be able to remove the child element at the middle", () => {
    const parentElementId = "c9a2ecac-d19f-4bc0-ae6c-607fb8190810";
    const targetElementId = "9b808807-1056-44c0-a3b1-280cc00c2c8d";

    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = removeElement(
      targetElementId,
      propertyList,
      sequenceList,
      parentElementId
    );

    expect(updatedPropertyList).not.toHaveProperty(targetElementId);
    expect(updatedSequenceList.length).toBe(sequenceList.length);
    const searchResult = updatedSequenceList.some(
      (element: SequenceListElement) => {
        if (element.children === undefined) {
          return false;
        }
        const parentMatch = element.id === parentElementId;
        const childMatched = element.children.some(
          (child: SequenceListElement) => child.id === targetElementId
        );
        return parentMatch && childMatched;
      }
    );
    expect(searchResult).toBe(false);
  });

  it("should be able to reorder the first element to the middle", () => {
    const moveToPosition = Math.floor(sequenceList.length / 2);
    const targetElement = sequenceList[0];
    const secondElement = sequenceList[1];
    const lastElement = sequenceList.at(-1);
    const { sequenceList: updatedSequenceList } = reorderElement(
      0,
      moveToPosition,
      sequenceList
    );
    expect(updatedSequenceList.length).toBe(sequenceList.length);
    expect(updatedSequenceList.at(moveToPosition)).toEqual(targetElement);
    expect(updatedSequenceList[0]).toEqual(secondElement);
    expect(updatedSequenceList.at(-1)).toEqual(lastElement);
  });
});
