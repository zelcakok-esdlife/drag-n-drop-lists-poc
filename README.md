## Combine componentList, propertyList and seqeunceList into render object

```typescript
const reconstructed = combineLists({ componentList, sequenceList, propertyList });
```

## Extract render object into componentList, propertyList and seqeunceList

```typescript
const { componentList, sequenceList, propertyList } = extractToLists(
  jsonData as PropertyJson[]
);
```

## Add element to propertyList and sequenceList

```typescript
// No side effect to the propertyList and sequenceList

const { propertyList: updatedPropertyList, sequenceList: updatedSequenceList } =
  addElement(newElement, 0, propertyList, sequenceList);
```

## Remove element from propertyList and sequenceList

```typescript
// No side effect to the propertyList and sequenceList
const { propertyList: updatedPropertyList, sequenceList: updatedSequenceList } =
  removeElement(targetElement.id, propertyList, sequenceList);
```

## Reorder element within propertyList and sequenceList

```typescript
// No side effect to the sequenceList
const { sequenceList: updatedSequenceList } = reorderElement(
  fromPosition,
  moveToPosition,
  sequenceList
);
```
