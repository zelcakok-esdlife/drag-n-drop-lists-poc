import {
  DragDropStruct,
  PropertyList,
  PropertyJson,
  SequenceListElement,
  WidgetPropertiesProps,
} from "./types";

export const constructFromLists = ({
  componentList,
  sequenceList,
  propertyList,
}: DragDropStruct) => {
  const result = structuredClone(componentList);
  result.forEach((element: PropertyJson, index: number) => {
    const { id, children } = sequenceList[index];
    const properties = propertyList[id];
    element.id = id;
    if (properties["value"]) {
      element.value = properties["value"];
    }
    element.properties.map(
      (property: WidgetPropertiesProps) =>
        (property.value = properties[property.element_id])
    );
    if (children && children.length > 0) {
      element.children.map((child: PropertyJson, childIndex: number) => {
        child.id = children[childIndex].id;
        const childProperties = propertyList[child.id];
        if (child.properties && child.properties.length > 0) {
          child.properties.map(
            (property: PropertyJson) =>
              (property.value = childProperties[property.element_id])
          );
        }
      });
    } else {
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
        properties.map(
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
) => {
  const updatedPropertyList = structuredClone(propertyList);
  const updatedSequenceList = structuredClone(sequenceList);
  const { id, value, properties, children } = element;
  if (id === undefined || id === null) {
    throw Error("Error: id must be provided");
  }
  const newPropertyListElement: PropertyList = {};
  properties.map((property: WidgetPropertiesProps) => {
    newPropertyListElement[property.element_id] = property.value;
  });
  if (value !== undefined) {
    newPropertyListElement.value = value;
  }
  updatedPropertyList[id] = newPropertyListElement;

  const newSequenceListElement: SequenceListElement = { id };
  if (children && children.length > 0) {
    newSequenceListElement.children = children.map(
      (child: PropertyJson, childIndex: number) => ({ id: child.id })
    );
  }
  updatedSequenceList.splice(index, 0, newSequenceListElement);

  return {
    propertyList: updatedPropertyList,
    sequenceList: updatedSequenceList,
  };
};

export const removeElement = (
  elementIdToBeRemoved: string,
  propertyList: PropertyList,
  sequenceList: SequenceListElement[],
  parentElementId: string = null
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const updatedPropertyList = structuredClone(propertyList);
  const clonedSequenceList = structuredClone(sequenceList);
  let resultSequenceList: SequenceListElement[] = [];

  delete updatedPropertyList[elementIdToBeRemoved];

  if (parentElementId !== null) {
    resultSequenceList = clonedSequenceList.map((item) => {
      if (item.id === parentElementId && item.children) {
        return {
          ...item,
          children: item.children.filter(
            (child) => child.id !== elementIdToBeRemoved
          ),
        };
      }
      return item;
    });
  } else {
    resultSequenceList = clonedSequenceList.filter(
      (item) => item.id !== elementIdToBeRemoved
    );
  }

  return {
    propertyList: updatedPropertyList,
    sequenceList: resultSequenceList,
  };
};

export const reorderElement = (
  fromElementIndex: number,
  toElementIndex: number,
  sequenceList: SequenceListElement[]
) => {
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
