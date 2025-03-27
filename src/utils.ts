import {
  DragDropStruct,
  PropertyList,
  PropertyJson,
  SequenceListElement,
  WidgetPropertiesProps,
} from "./types";

const getSequenceListElementById = (
  elementId: string,
  sequenceList: SequenceListElement[],
  allowNotFound: boolean = false
): { sequenceListElement: SequenceListElement; index: number } => {
  const clonedSequenceList = structuredClone(sequenceList);
  const sequenceListElement = clonedSequenceList.find(
    (element: SequenceListElement) => element.id === elementId
  );
  if (allowNotFound === false && sequenceListElement === undefined) {
    throw Error("Error: Sequence element is not found");
  }
  const index = clonedSequenceList.indexOf(sequenceListElement);
  return { sequenceListElement, index };
};

const getHydratedElement = (
  elementId: string,
  index: number,
  { componentList, sequenceList, propertyList }: DragDropStruct
): PropertyJson => {
  const element: PropertyJson = structuredClone(componentList[index]);
  const { id, children }: SequenceListElement = structuredClone(
    sequenceList[index]
  );
  const properties: PropertyList = structuredClone(
    propertyList[elementId]
  ) as PropertyList;

  element.id = id;
  element.properties.forEach((property: WidgetPropertiesProps) => {
    property.value = properties[property.element_id] as string;
  });
  if (properties.value !== undefined) {
    element.value = properties.value as string;
  }
  if (children && children.length > 0) {
    element.children.forEach((child: PropertyJson, childIndex: number) => {
      child.id = children[childIndex].id;
      const childProperties = propertyList[child.id];
      if (child.properties && child.properties.length > 0) {
        child.properties.forEach(
          (property: WidgetPropertiesProps) =>
            (property.value = childProperties[property.element_id])
        );
      }
    });
  } else {
    element.children = [];
  }
  return element;
};

export const combineLists = ({
  componentList,
  sequenceList,
  propertyList,
}: DragDropStruct): PropertyJson[] => {
  return sequenceList.map((element: SequenceListElement, index: number) =>
    getHydratedElement(element.id, index, {
      componentList,
      sequenceList,
      propertyList,
    })
  );
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
      const sequence: SequenceListElement = {
        id: element.id ?? "",
        elementType: element.element,
      };
      if (children && children.length > 0) {
        sequence.children = children.map((child: PropertyJson) => ({
          id: child.id ?? "",
          elementType: child.element,
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
  sequenceList: SequenceListElement[],
  propertyList: PropertyList | null = null
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  let clonedPropertyList = null;
  const clonedSequenceList = structuredClone(sequenceList ?? []);
  const { id, value, properties } = element;
  if (id === undefined || id === null) {
    throw Error("Error: id must be provided");
  }

  // Update property list
  if (propertyList !== null) {
    clonedPropertyList = structuredClone(propertyList);
    const newPropertyListElement: PropertyList = {};
    properties.forEach((property: WidgetPropertiesProps) => {
      newPropertyListElement[property.element_id] = property.value;
    });
    if (value !== undefined) {
      newPropertyListElement.value = value;
    }
    clonedPropertyList[id] = newPropertyListElement;
  }

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
  sequenceList: SequenceListElement[],
  propertyList: PropertyList | null = null
): { propertyList: PropertyList; sequenceList: SequenceListElement[] } => {
  const clonedSequenceList = structuredClone(sequenceList);
  const { sequenceListElement: parentElement, index } =
    getSequenceListElementById(parentElementId, sequenceList);

  const {
    propertyList: updatedPropertyList,
    sequenceList: updatedChildSequenceList,
  } = addElement(element, childIndex, parentElement.children, propertyList);

  clonedSequenceList[index].children = updatedChildSequenceList;
  return {
    propertyList: updatedPropertyList,
    sequenceList: clonedSequenceList,
  };
};

export const removeElement = (
  elementIdToBeRemoved: string,
  sequenceList: SequenceListElement[],
  propertyList: PropertyList | null = null
): {
  sequenceList: SequenceListElement[];
  propertyList: PropertyList | null;
} => {
  let updatedPropertyList = null;
  const clonedSequenceList = structuredClone(sequenceList);
  const resultSequenceList = clonedSequenceList.filter(
    (item) => item.id !== elementIdToBeRemoved
  );

  if (propertyList !== null) {
    updatedPropertyList = structuredClone(propertyList);
    delete updatedPropertyList[elementIdToBeRemoved];
  }
  return {
    propertyList: updatedPropertyList,
    sequenceList: resultSequenceList,
  };
};

export const removeChildElement = (
  elementIdToBeRemoved: string,
  parentElementId: string,
  sequenceList: SequenceListElement[],
  propertyList: PropertyList | null = null
): {
  sequenceList: SequenceListElement[];
  propertyList: PropertyList | null;
} => {
  const clonedSequenceList = structuredClone(sequenceList);
  const { sequenceListElement: parentElement, index } =
    getSequenceListElementById(parentElementId, sequenceList);

  const {
    propertyList: updatedPropertyList,
    sequenceList: updatedChildSequenceList,
  } = removeElement(elementIdToBeRemoved, parentElement.children, propertyList);
  clonedSequenceList[index].children = updatedChildSequenceList;

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
  const { sequenceListElement: parentElement, index } =
    getSequenceListElementById(parentElementId, sequenceList);

  const { sequenceList: updatedChildSequenceList } = reorderElement(
    fromElementIndex,
    toElementIndex,
    parentElement.children
  );
  clonedSequenceList[index].children = updatedChildSequenceList;
  return { sequenceList: clonedSequenceList };
};

export const promoteChildElement = (
  elementIdToBePickedOut: string,
  parentElementId: string,
  toUpperLevelPosition: number,
  { componentList, sequenceList, propertyList }: DragDropStruct
): { sequenceList: SequenceListElement[] } => {
  const { sequenceListElement: parentElement } = getSequenceListElementById(
    parentElementId,
    sequenceList
  );
  const { sequenceListElement: childSequenceListElement, index: childIndex } =
    getSequenceListElementById(elementIdToBePickedOut, parentElement.children);
  const childElement = getHydratedElement(
    childSequenceListElement.id,
    childIndex,
    { componentList, sequenceList: parentElement.children, propertyList }
  );
  const { sequenceList: sequenceListWithoutChild } = removeChildElement(
    elementIdToBePickedOut,
    parentElementId,
    sequenceList
  );
  const { sequenceList: reassignedSequenceList } = addElement(
    childElement,
    toUpperLevelPosition,
    sequenceListWithoutChild
  );
  return { sequenceList: reassignedSequenceList };
};
