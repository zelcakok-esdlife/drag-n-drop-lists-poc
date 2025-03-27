import * as jsonData from "../src/aboutUsEN.json";
import { PropertyJson, SequenceListElement } from "../src/types";
import {
  addChildElement,
  addElement,
  combineLists,
  extractToLists,
  promoteChildElement,
  removeChildElement,
  removeElement,
  reorderChildElement,
  reorderElement,
} from "../src/utils";

describe("Extract & Reconstuct", () => {
  const extractResult = extractToLists(jsonData as PropertyJson[]);
  const clonedExtractResult = { ...extractResult };
  const { componentList, sequenceList, propertyList } = extractResult;

  it("componentList shouldn't have id and value fields", () => {
    componentList.forEach((element: PropertyJson) => {
      expect(element.id).toBeUndefined();
      expect(element.value).toBeUndefined();
    });
  });

  it("sequenceList should have id and children fields", () => {
    sequenceList.forEach((sequenceListElement: SequenceListElement) => {
      expect(sequenceListElement).toHaveProperty("id");
      expect(sequenceListElement).toHaveProperty("elementType");
      if (sequenceListElement.children) {
        expect(sequenceListElement.children).toBeInstanceOf(Array);
      }
    });
  });

  const reconstructed = combineLists(clonedExtractResult);
  it("reconstructed should be the same as the json data", () => {
    reconstructed.forEach((element: PropertyJson, index: number) => {
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

  const newElementA: PropertyJson = {
    id: "newElementAID",
    element: "text",
    type: "text",
    properties: [
      {
        element_id: "text_label",
        label: "Label",
        placeholder: "Input here ...",
        type: "text",
        value: "This is another new element",
      },
    ],
  };

  it("should be able to add the new element to the top", () => {
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addElement(newElement, 0, sequenceList, propertyList);

    expect(updatedPropertyList).not.toEqual(propertyList);
    expect(updatedPropertyList).toHaveProperty("newElementID");
    expect(updatedPropertyList["newElementID"]).toEqual({
      text_label: "This is the new element",
    });

    expect(updatedSequenceList).not.toEqual(sequenceList);
    expect(updatedSequenceList.length - sequenceList.length).toBe(1);
    expect(updatedSequenceList[0]).toEqual({ id: "newElementID" });
  });

  it("should be able to add two child elements to the first element", () => {
    const parentElementId = "9d349591-0d3c-40fe-a36b-89c67660e0c0";

    // This should create a child element
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addChildElement(
      newElement,
      0,
      parentElementId,
      sequenceList,
      propertyList
    );

    // Property list should add a new entry
    expect(updatedPropertyList).toHaveProperty("newElementID");
    expect(updatedPropertyList["newElementID"]).toEqual({
      text_label: "This is the new element",
    });

    // The parent sequence list should have a child element
    const parentSequenceListElement = updatedSequenceList.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === parentElementId
    );
    expect(parentSequenceListElement).toHaveProperty("children");
    expect(parentSequenceListElement.children).toEqual([
      { id: "newElementID" },
    ]);

    // This should add a new child element before the first one
    const {
      propertyList: updatedPropertyListSecond,
      sequenceList: updatedSequenceListSecond,
    } = addChildElement(
      newElementA,
      0,
      parentElementId,
      updatedSequenceList,
      updatedPropertyList
    );

    // Property list should add a new entry
    expect(updatedPropertyListSecond).toHaveProperty("newElementAID");
    expect(updatedPropertyListSecond["newElementAID"]).toEqual({
      text_label: "This is another new element",
    });

    // The parent sequence list should have a child element
    const parentSequenceListElementSecond = updatedSequenceListSecond.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === parentElementId
    );
    expect(parentSequenceListElementSecond).toHaveProperty("children");
    expect(parentSequenceListElementSecond.children).toEqual([
      { id: "newElementAID" },
      { id: "newElementID" },
    ]);
  });

  it("should be able to add the new element to the middle", () => {
    const positionToAdd = Math.floor(sequenceList.length / 2);
    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = addElement(newElement, positionToAdd, sequenceList, propertyList);

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
    } = addElement(newElement, positionToAdd, sequenceList, propertyList);

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
    } = removeElement(targetElement.id, sequenceList, propertyList);

    expect(updatedPropertyList).not.toHaveProperty(targetElement.id);
    expect(updatedSequenceList.length - sequenceList.length).toBe(-1);
    const searchResult = updatedSequenceList.filter(
      (element: SequenceListElement) => element.id === targetElement.id
    );
    expect(searchResult).toEqual([]);
  });

  it("should be able to remove a child element", () => {
    const parentElementId = "c9a2ecac-d19f-4bc0-ae6c-607fb8190810";
    const targetElementId = "f461e1eb-c530-4f90-80f2-fa9e1d977021";

    const {
      propertyList: updatedPropertyList,
      sequenceList: updatedSequenceList,
    } = removeChildElement(
      targetElementId,
      parentElementId,
      sequenceList,
      propertyList
    );

    expect(updatedPropertyList).not.toHaveProperty(targetElementId);
    expect(updatedSequenceList.length).toBe(sequenceList.length);

    const parentSequenceListElement = updatedSequenceList.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === parentElementId
    );
    expect(parentSequenceListElement).toHaveProperty("children");
    expect(parentSequenceListElement.children.length).toBe(1);
    const childElement = parentSequenceListElement.children.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === targetElementId
    );
    expect(childElement).toBeUndefined();
  });

  it("should be able to reorder the first element to the middle", () => {
    const moveToPosition = Math.floor(sequenceList.length / 2);
    const targetElement = sequenceList[0];
    const secondElement = sequenceList[1];
    const lastElement = sequenceList.at(-1);
    const fromPosition = 0;
    const { sequenceList: updatedSequenceList } = reorderElement(
      fromPosition,
      moveToPosition,
      sequenceList
    );
    expect(updatedSequenceList.length).toBe(sequenceList.length);
    expect(updatedSequenceList.at(moveToPosition)).toEqual(targetElement);
    expect(updatedSequenceList[0]).toEqual(secondElement);
    expect(updatedSequenceList.at(-1)).toEqual(lastElement);
  });

  it("should be able to reorder child element", () => {
    const parentElementId = "c9a2ecac-d19f-4bc0-ae6c-607fb8190810";
    const expectedResult = [
      { id: "9b808807-1056-44c0-a3b1-280cc00c2c8d", elementType: "text" },
      { id: "f461e1eb-c530-4f90-80f2-fa9e1d977021", elementType: "text" },
    ];
    const childElementPositionFrom = 0;
    const childElementPositionTo = 1;

    const { sequenceList: updatedSequenceList } = reorderChildElement(
      childElementPositionFrom,
      childElementPositionTo,
      parentElementId,
      sequenceList
    );

    const parentSequenceListElement = updatedSequenceList.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === parentElementId
    );

    expect(updatedSequenceList.length).toBe(sequenceList.length);
    expect(parentSequenceListElement.children).toEqual(expectedResult);
  });

  it("should be able to pick out a child element and add back to the upper level", () => {
    const parentElementId = "c9a2ecac-d19f-4bc0-ae6c-607fb8190810";
    const childElementId = "9b808807-1056-44c0-a3b1-280cc00c2c8d";
    const expectedResult = [
      { id: "f461e1eb-c530-4f90-80f2-fa9e1d977021", elementType: "text" },
    ];
    const clonedPropertyList = structuredClone(propertyList);

    const positionToBeAddBack = Math.floor(sequenceList.length / 2);
    const { sequenceList: updatedSequenceList } = promoteChildElement(
      childElementId,
      parentElementId,
      positionToBeAddBack,
      {
        componentList,
        sequenceList,
        propertyList,
      }
    );

    expect(updatedSequenceList.length).toBe(sequenceList.length + 1);
    expect(updatedSequenceList[positionToBeAddBack]).toEqual({
      id: childElementId,
    });

    const parentSequenceListElement = updatedSequenceList.find(
      (sequenceListElement: SequenceListElement) =>
        sequenceListElement.id === parentElementId
    );
    expect(parentSequenceListElement.children).toEqual(expectedResult);
    expect(clonedPropertyList).toEqual(propertyList);
  });
});
