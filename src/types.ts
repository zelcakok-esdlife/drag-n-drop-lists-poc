export type WidgetPropertiesProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  type?: string;
  element_id?: string;
  options?: { label: string; value: string }[];
};

export type WidgetProps = {
  properties?: WidgetPropertiesProps[];
  label?: string;
  value?: string;
  placeholder?: string;
  site?: string;
};

export type CorePropertyJson = WidgetProps & {
  element: string;
  type: string;
  id?: string;
  childType?: string;
  element_id?: string;
  options?: { label: string; value: string }[];
};

export type PropertyJson = CorePropertyJson & {
  children?: CorePropertyJson[];
};

export interface PropertyList {
  [key: string]: PropertyList | string;
}

export interface SequenceListElement {
  id: string;
  elementType?: string;
  children?: { id: string }[];
}

export interface DragDropStruct {
  componentList: PropertyJson[];
  sequenceList: SequenceListElement[];
  propertyList: PropertyList;
}
