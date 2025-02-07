export const DELAY_TO_DRAG = 5;

export const INITIAL_CONFIG = {
  COLUMN_COUNT: 36,
  ROW_COUNT: 200,
  ROW_HEIGHT: 4,
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

export let WIDGET_CONFIG = {
  [WIDGETS_TYPE.INPUT]: {
    rowStart: 2,
    rowEnd: 10,
    colStart: 2,
    colEnd: 7,
    rowSpan: function () {
      let diff = this.rowEnd - this.rowStart;
      return diff;
    },
    colSpan: function () {
      let diff = this.colEnd - this.colStart;
      return diff;
    }
  },
  [WIDGETS_TYPE.DROPDOWN]: {
    rowStart: 0,
    rowEnd: 8,
    colStart: 0,
    colEnd: 4,
    rowSpan: function () {
      let diff = this.rowEnd - this.rowStart;
      return diff;
    },
    colSpan: function () {
      let diff = this.colEnd - this.colStart;
      return diff;
    }
  },
  [WIDGETS_TYPE.ICON]: {
    rowStart: 0,
    rowEnd: 9,
    colStart: 0,
    colEnd: 2,
    rowSpan: function () {
      let diff = this.rowEnd - this.rowStart;
      return diff;
    },
    colSpan: function () {
      let diff = this.colEnd - this.colStart;
      return diff;
    }
  },
  [WIDGETS_TYPE.CARD]: {
    rowStart: 2,
    rowEnd: 15,
    colStart: 2,
    colEnd: 8,
    rowSpan: function () {
      let diff = this.rowEnd - this.rowStart;
      return diff;
    },
    colSpan: function () {
      let diff = this.colEnd - this.colStart;
      return diff;
    }
  }
};

// export const WIDGETS_CONFIG = {
//   [WIDGETS_TYPE.INPUT]: {
//     minRowSpan: 4,
//     minColSpan: 4
//   },
//   [WIDGETS_TYPE.DROPDOWN]: {
//     minRowSpan: 4,
//     minColSpan: 4
//   },
//   [WIDGETS_TYPE.ICON]: {
//     minRowSpan: 3,
//     minColSpan: 2
//   },
//   [WIDGETS_TYPE.CARD]: {
//     minRowSpan: 10,
//     minColSpan: 4
//   }
// };

export const GENERAL_CONFIG = {
  HEIGHT: "Height",
  TEXT_INPUT: "TextInput"
};

const heightConfiguration = {
  type: GENERAL_CONFIG.HEIGHT,
  source: [
    { label: "Fixed", value: "fixed" },
    { label: "Auto", value: "auto" }
  ]
};

const textInputConfig = {
  type: GENERAL_CONFIG.TEXT_INPUT
};

const generalConfigList = [heightConfiguration, textInputConfig];

export const WIDGETS_LIST = [
  {
    Name: "Input",
    Id: "input",
    Type: WIDGETS_TYPE.INPUT,
    LayoutConfig: {
      rowStart: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].rowStart,
      rowEnd: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].rowEnd,
      colStart: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].colStart,
      colEnd: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].colEnd,
      colSpan: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].colSpan,
      rowSpan: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].rowSpan
      // row: WIDGET_CONFIG[WIDGETS_TYPE.INPUT].rowStart
      // colSpan: WIDGETS_CONFIG[WIDGETS_TYPE.INPUT].minColSpan,
      // rowSpan: WIDGETS_CONFIG[WIDGETS_TYPE.INPUT].minRowSpan
    },
    GeneralConfig: [...generalConfigList]
  },
  {
    Name: "Dropdown",
    Id: "dropdown",
    Type: WIDGETS_TYPE.DROPDOWN,
    LayoutConfig: {
      rowStart: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].rowStart,
      rowEnd: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].rowEnd,
      colStart: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].colStart,
      colEnd: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].colEnd,
      colSpan: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].colSpan,
      rowSpan: WIDGET_CONFIG[WIDGETS_TYPE.DROPDOWN].rowSpan
    },
    GeneralConfig: [...generalConfigList]
  },
  {
    Name: "Icon",
    Id: "icon",
    Type: WIDGETS_TYPE.ICON,
    LayoutConfig: {
      rowStart: WIDGET_CONFIG[WIDGETS_TYPE.ICON].rowStart,
      rowEnd: WIDGET_CONFIG[WIDGETS_TYPE.ICON].rowEnd,
      colStart: WIDGET_CONFIG[WIDGETS_TYPE.ICON].colStart,
      colEnd: WIDGET_CONFIG[WIDGETS_TYPE.ICON].colEnd,
      colSpan: WIDGET_CONFIG[WIDGETS_TYPE.ICON].colSpan,
      rowSpan: WIDGET_CONFIG[WIDGETS_TYPE.ICON].rowSpan
    },
    GeneralConfig: [...generalConfigList]
  },
  {
    Name: "Card",
    Id: "card",
    Type: WIDGETS_TYPE.CARD,
    LayoutConfig: {
      rowStart: WIDGET_CONFIG[WIDGETS_TYPE.CARD].rowStart,
      rowEnd: WIDGET_CONFIG[WIDGETS_TYPE.CARD].rowEnd,
      colStart: WIDGET_CONFIG[WIDGETS_TYPE.CARD].colStart,
      colEnd: WIDGET_CONFIG[WIDGETS_TYPE.CARD].colEnd,
      colSpan: WIDGET_CONFIG[WIDGETS_TYPE.CARD].colSpan,
      rowSpan: WIDGET_CONFIG[WIDGETS_TYPE.CARD].rowSpan
    },
    GeneralConfig: [...generalConfigList]
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

export const WIDGET_ALIGNEMNT_TYPE = {
  CROSS_RESIZING: "CROSS_RESIZING",
  RESIZING: "RESIZING",
  AUTO_GROW: "AUTO_GROW",
  WIDGET_DROPPED: "WIDGET_DROPPED",
  STOP: "STOP",
  BELOW_MIDPOINT: "BELOW_MIDPOINT"
};
