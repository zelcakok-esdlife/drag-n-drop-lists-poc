import { PropertyJson } from "./types"

export const propertyTextJson: PropertyJson = {
    element: "text",
    type: "text",
    properties: [
        {
            element_id: "text_label",
            label: "Label",
            placeholder: "Input here ...",
            value: "Text Label",
            type: "text"
        },
        {
            element_id: "text_label_alignment",
            label: "Text Label Alignment",
            value: "start",
            type: "select",
            options: [
                { label: "Start", value: "start" },
                { label: "Center", value: "center" },
                { label: "End", value: "end" }
            ]
        },
        {
            element_id: "text_label_color",
            label: "Text Label Color",
            placeholder: "",
            value: "#000000",
            type: "color-picker"
        },
        {
            element_id: "text_value",
            label: "Value",
            placeholder: "Input here ...",
            value: "Morning World",
            type: "text"
        },
        {
            element_id: "text_value_alignment",
            label: "Text Value Alignment",
            value: "start",
            type: "select",
            options: [
                { label: "Start", value: "start" },
                { label: "Center", value: "center" },
                { label: "End", value: "end" }
            ]
        },
        {
            element_id: "text_value_color",
            label: "Text Value Color",
            placeholder: "",
            value: "#000000",
            type: "color-picker"
        }
    ]
}
