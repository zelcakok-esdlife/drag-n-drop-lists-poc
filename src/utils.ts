import {
  DragDropStruct,
  PropertyList,
  PropertyJson,
  SequenceListElement,
  WidgetPropertiesProps,
} from "./types";

export const combineLists = ({
  componentList,
  sequenceList,
  propertyList,
}: DragDropStruct) => {
  // Clone a copy
  const result = structuredClone(componentList);
  result.forEach((element: PropertyJson, index: number) => {
    const { id, children } = sequenceList[index];
    const properties = propertyList[id];
    // Fill the element id
    element.id = id;
    if (properties["value"]) {
      // Some element has value field
      element.value = properties["value"];
    }
    // Fill the properties from propertyList
    element.properties.map(
      (property: WidgetPropertiesProps) =>
        (property.value = properties[property.element_id])
    );
    // Fill its children if available
    if (children && children.length > 0) {
      element.children.map((child: PropertyJson, childIndex: number) => {
        // Fill the child id
        child.id = children[childIndex].id;
        const childProperties = propertyList[child.id];
        // Fill child's properties
        if (child.properties && child.properties.length > 0) {
          child.properties.map(
            (property: PropertyJson) =>
              (property.value = childProperties[property.element_id])
          );
        }
      });
    } else {
      // Set the empty children list
      element.children = [];
    }
  });
  return result;
};

export const extractToLists = (data: PropertyJson[]): DragDropStruct => {
  return data.reduceRight(
    (dragDropStructResult: DragDropStruct, element: PropertyJson) => {
      const { id, properties, children, value, ...rest } = element;

      // toComponentList
      const clonedElement: PropertyJson = rest;
      if (properties && properties.length > 0) {
        clonedElement.properties = properties.map(({ value, ...rest }) => rest);
      }
      if (children && children.length > 0) {
        clonedElement.children = extractToLists(children).componentList;
      }
      dragDropStructResult.componentList.unshift(clonedElement);

      // toSequenceList
      const sequence: SequenceListElement = { id: element.id ?? "" };
      if (children && children.length > 0) {
        sequence.children = children.map((child: PropertyJson) => ({
          id: child.id ?? "",
        }));
      }
      dragDropStructResult.sequenceList.unshift(sequence);

      // toPropertyList
      const elementProperty = {};
      if (element.value !== undefined) {
        elementProperty["value"] = element.value;
      }
      if (properties && properties.length > 0) {
        properties.forEach(
          ({ element_id, value }) => (elementProperty[element_id] = value)
        );
      }
      if (children && children.length > 0) {
        dragDropStructResult.propertyList = {
          ...dragDropStructResult.propertyList,
          ...extractToLists(children).propertyList,
        };
      }
      dragDropStructResult.propertyList[id] = elementProperty;

      return dragDropStructResult;
    },
    {
      componentList: [],
      sequenceList: [],
      propertyList: {},
    }
  );
};

export const addElement = (
  element: PropertyJson,
  index: number,
  propertyList: PropertyList,
  sequenceList: SequenceListElement[]
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const clonedPropertyList = structuredClone(propertyList ?? {});
  const clonedSequenceList = structuredClone(sequenceList ?? []);
  const { id, value, properties } = element;
  if (id === undefined || id === null) {
    throw Error("Error: id must be provided");
  }

  // Update property list
  const newPropertyListElement: PropertyList = {};
  properties.forEach((property: WidgetPropertiesProps) => {
    newPropertyListElement[property.element_id] = property.value;
  });
  if (value !== undefined) {
    newPropertyListElement.value = value;
  }
  clonedPropertyList[id] = newPropertyListElement;

  // Update sequence list
  const newSequenceListElement: SequenceListElement = { id };
  clonedSequenceList.splice(index, 0, newSequenceListElement);

  return {
    propertyList: clonedPropertyList,
    sequenceList: clonedSequenceList,
  };
};

export const addChildElement = (
  element: PropertyJson,
  childIndex: number,
  parentElementId: string,
  propertyList: PropertyList,
  sequenceList: SequenceListElement[]
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const clonedSequenceList = structuredClone(sequenceList);

  // Get the parent sequence list
  const parentSequenceListElement = clonedSequenceList.find(
    (sequenceListElement: SequenceListElement) =>
      sequenceListElement.id === parentElementId
  );
  if (parentSequenceListElement === undefined) {
    throw Error("Error: Parent sequence list element is not found");
  }

  const {
    propertyList: updatedPropertyList,
    sequenceList: updatedChildSequenceList,
  } = addElement(
    element,
    childIndex,
    propertyList,
    parentSequenceListElement.children
  );

  parentSequenceListElement.children = updatedChildSequenceList;
  return {
    propertyList: updatedPropertyList,
    sequenceList: clonedSequenceList,
  };
};

export const removeElement = (
  elementIdToBeRemoved: string,
  propertyList: PropertyList,
  sequenceList: SequenceListElement[]
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const updatedPropertyList = structuredClone(propertyList);
  const clonedSequenceList = structuredClone(sequenceList);
  let resultSequenceList: SequenceListElement[] = [];

  delete updatedPropertyList[elementIdToBeRemoved];

  resultSequenceList = clonedSequenceList.filter(
    (item) => item.id !== elementIdToBeRemoved
  );

  return {
    propertyList: updatedPropertyList,
    sequenceList: resultSequenceList,
  };
};

export const removeChildElement = (
  elementIdToBeRemoved: string,
  parentElementId: string,
  propertyList: PropertyList,
  sequenceList: SequenceListElement[]
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const clonedSequenceList = structuredClone(sequenceList);
  // Get the parent sequence list
  const parentSequenceListElement = clonedSequenceList.find(
    (sequenceListElement: SequenceListElement) =>
      sequenceListElement.id === parentElementId
  );
  if (parentSequenceListElement === undefined) {
    throw Error("Error: Parent sequence list element is not found");
  }

  const {
    propertyList: updatedPropertyList,
    sequenceList: updatedChildSequenceList,
  } = removeElement(
    elementIdToBeRemoved,
    propertyList,
    parentSequenceListElement.children
  );
  parentSequenceListElement.children = updatedChildSequenceList;

  return {
    propertyList: updatedPropertyList,
    sequenceList: clonedSequenceList,
  };
};

export const reorderElement = (
  fromElementIndex: number,
  toElementIndex: number,
  sequenceList: SequenceListElement[]
): { sequenceList: SequenceListElement[] } => {
  const clonedSequenceList = structuredClone(sequenceList);
  if (
    fromElementIndex < 0 ||
    fromElementIndex >= clonedSequenceList.length ||
    toElementIndex < 0 ||
    toElementIndex >= clonedSequenceList.length
  ) {
    throw new Error("Invalid index provided");
  }

  const elementToMove = clonedSequenceList.splice(fromElementIndex, 1)[0];
  clonedSequenceList.splice(toElementIndex, 0, elementToMove);

  return { sequenceList: clonedSequenceList };
};

export const reorderChildElement = (
  fromElementIndex: number,
  toElementIndex: number,
  parentElementId: string,
  sequenceList: SequenceListElement[]
): { sequenceList: SequenceListElement[] } => {
  const clonedSequenceList = structuredClone(sequenceList);
  const parentSequenceListElement = clonedSequenceList.find(
    (sequenceListElement: SequenceListElement) =>
      sequenceListElement.id === parentElementId
  );
  const { sequenceList: updatedChildSequenceList } = reorderElement(
    fromElementIndex,
    toElementIndex,
    parentSequenceListElement.children
  );
  parentSequenceListElement.children = updatedChildSequenceList;
  return { sequenceList: clonedSequenceList };
};
