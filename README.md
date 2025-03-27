# Drag and Drop form update

## Combine lists

```typescript
const reconstructed = combineLists({
  componentList,
  sequenceList,
  propertyList,
});
```

## Extract to lists

```typescript
const data: PropertyJson[];
const { componentList, sequenceList, propertyList } = extractToLists(data);
```

## Add element

```typescript
const element: PropertyJson;
const positionToAdd: number;
const sequenceList: SequenceListElement[];
const propertyList: PropertyList | null;

const result: {
  sequenceList: SequenceListElement[];
  propertyList: PropertyJson | null;
} = addElement(element, positionToAdd, sequenceList, propertyList);
```

## Add child element

```typescript
const element: PropertyJson;
const parentElementId: string;
const positionToAdd: number;
const sequenceList: SequenceListElement[];
const propertyList: PropertyList | null;

const result: {
  sequenceList: SequenceListElement[];
  propertyList: PropertyJson | null;
} = addChildElement(
  element,
  positionToAdd,
  parentElementId,
  sequenceList,
  propertyList
);
```

## Remove element

```typescript
const elementIdToBeRemoved: string;
const sequenceList: SequenceListElement[];
const propertyList: PropertyList | null;

const result: {
  sequenceList: SequenceListElement[];
  propertyList: PropertyJson | null;
} = removeElement(elementIdToBeRemoved, sequenceList, propertyList);
```

## Remove child element

```typescript
const elementIdToBeRemoved: string;
const parentElementId: string;
const sequenceList: SequenceListElement[];
const propertyList: PropertyList | null;

const result: {
  sequenceList: SequenceListElement[];
  propertyList: PropertyJson | null;
} = removeChildElement(
  elementIdToBeRemoved,
  parentElementId,
  sequenceList,
  propertyList
);
```

## Reorder element

```typescript
const fromPosition: number;
const toPosition: number;
const sequenceList: SequenceListElement[];

const { sequenceList: updatedSequenceList } = reorderElement(
  fromPosition,
  toPosition,
  sequenceList
);
```

## Reorder child element

```typescript
const fromPosition: number;
const toPosition: number;
const parentElementId: string;
const sequenceList: SequenceListElement[];

const { sequenceList: updatedSequenceList } = reorderElement(
  fromPosition,
  toPosition,
  parentElementId,
  sequenceList
);
```

## Promote child element

```typescript
const childElementId: string;
const parentElementId: string;
const toUpperPosition: number;
const { componentList, sequenceList, propertyList }: DragDropStruct;

const { sequenceList: updatedSequenceList } = promoteChildElement(
  childElementId,
  parentElementId,
  toUpperPosition,
  {
    componentList,
    sequenceList,
    propertyList,
  }
);
```
