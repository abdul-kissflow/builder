export const DELAY_TO_DRAG = 5;

export const INITIAL_CONFIG = {
  COLUMN_COUNT: 36,
  ROW_COUNT: 100,
  ROW_HEIGHT: 8,
  ROW_HEIGHT_UNIT: "px",
  //to-do: margin type ?
  MARGIN_TYPE: "default"
};

export const WIDGETS_TYPE = {
  INPUT: "input",
  DROPDOWN: "dropdown",
  ICON: "icon",
  CARD: "card"
};

export const WIDGETS_CONFIG = {
  [WIDGETS_TYPE.INPUT]: {
    minRowSpan: 4,
    minColSpan: 4
  },
  [WIDGETS_TYPE.DROPDOWN]: {
    minRowSpan: 4,
    minColSpan: 4
  },
  [WIDGETS_TYPE.ICON]: {
    minRowSpan: 3,
    minColSpan: 2
  },
  [WIDGETS_TYPE.CARD]: {
    minRowSpan: 10,
    minColSpan: 4
  }
};

export const WIDGETS_LIST = [
  {
    Name: "Input",
    Id: "input",
    Type: WIDGETS_TYPE.INPUT,
    LayoutConfig: {
      col: 0,
      row: 0,
      colSpan: WIDGETS_CONFIG[WIDGETS_TYPE.INPUT].minColSpan,
      rowSpan: WIDGETS_CONFIG[WIDGETS_TYPE.INPUT].minRowSpan
    }
  },
  {
    Name: "Dropdown",
    Id: "dropdown",
    Type: WIDGETS_TYPE.DROPDOWN,
    LayoutConfig: {
      col: 0,
      row: 0,
      colSpan: WIDGETS_CONFIG[WIDGETS_TYPE.DROPDOWN].minColSpan,
      rowSpan: WIDGETS_CONFIG[WIDGETS_TYPE.DROPDOWN].minRowSpan
    }
  },
  {
    Name: "Icon",
    Id: "icon",
    Type: WIDGETS_TYPE.ICON,
    LayoutConfig: {
      col: 0,
      row: 0,
      colSpan: WIDGETS_CONFIG[WIDGETS_TYPE.ICON].minColSpan,
      rowSpan: WIDGETS_CONFIG[WIDGETS_TYPE.ICON].minRowSpan
    }
  },
  {
    Name: "Card",
    Id: "card",
    Type: WIDGETS_TYPE.CARD,
    LayoutConfig: {
      col: 0,
      row: 0,
      colSpan: WIDGETS_CONFIG[WIDGETS_TYPE.CARD].minColSpan,
      rowSpan: WIDGETS_CONFIG[WIDGETS_TYPE.CARD].minRowSpan
    }
  }
];

export const INITIAL_LAYOUT_WIDGETS_META = {
  root: {
    Name: "Page Builder",
    Id: "page_builder_001",
    Widgets: ["card_1"]
  },
  card_1: {
    ...WIDGETS_LIST[3],
    Id: "card_1"
  }
};

export const CONTROL_TYPE = {
  NUMBER: "number",
  NUMBER_UNIT: "number_unit",
  TOGGLE: "toggle"
};

export const CONTROL_UNIT_OPTION = [
  { value: "px", label: "px" },
  { value: "fr", label: "fr" }
];

export const CONTROL_MARGIN_OPTION = [
  { value: "default", label: "Default" },
  { value: "none", label: "None" }
];

export const RESIZE_DIRECTION = {
  LEFT: "left",
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom"
};
