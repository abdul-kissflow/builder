import { useMemo, useRef, useState, memo, useDeferredValue } from "react";
import PropTypes from "prop-types";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners
} from "@dnd-kit/core";
import { InputNumber, Select } from "antd";

import styles from "./builder.module.css";

const INITIAL_CONFIG = {
  COLUMN_COUNT: 36,
  ROW_COUNT: 100,
  ROW_HEIGHT: 8,
  ROW_HEIGHT_UNIT: "px"
};

const WIDGETS_LIST = [
  {
    Name: "Input",
    Id: "input",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 4,
      colSpan: 4
    }
  },
  {
    Name: "Dropdown",
    Id: "dropdown",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 4,
      colSpan: 4
    }
  },
  {
    Name: "Icon",
    Id: "icon",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 3,
      colSpan: 1
    }
  },
  {
    Name: "Card",
    Id: "card",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 10,
      colSpan: 4
    }
  }
];

const INITIAL_LAYOUT_WIDGETS_META = {
  root: {
    Name: "Page Builder",
    Id: "page_builder_001",
    Widgets: ["card_1"]
  },
  card_1: {
    Name: "Card",
    Id: "card_1",
    WidgetId: "card",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 4,
      colSpan: 4
    }
  }
};

export function Builder() {
  const [configState, setConfigState] = useState(INITIAL_CONFIG);
  const config = useDeferredValue(configState);
  const [layoutModel, setLayoutModel] = useState(INITIAL_LAYOUT_WIDGETS_META);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverDetail, setHoverDetail] = useState({});
  const [activeWidget, setActiveWidget] = useState({});

  const tempWidgetColMap = useRef(null);
  const originLayoutModel = useRef(null);
  const isLayoutModelChanged = useRef(false);

  function getWidgetIds(model) {
    return model.root.Widgets;
  }

  function setWidget(model, widget) {
    let newModel = { ...model };
    newModel.root.Widgets = [...getWidgetIds(newModel), widget.Id];
    newModel[widget.Id] = widget;
    return newModel;
  }

  function getWidgets(model) {
    return getWidgetIds(model).map((compId) => {
      return model[compId];
    });
  }

  function deleteWidget(model, widgetId) {
    let newModel = { ...model };
    delete newModel[widgetId];
    newModel.root.Widgets = getWidgetIds(newModel).filter(
      (id) => id !== widgetId
    );
    return newModel;
  }

  function getWidgetsColMap(model) {
    let { COLUMN_COUNT, ROW_COUNT } = config;
    let colMap = Array.from({ length: COLUMN_COUNT }).map(() =>
      Array.from({ length: ROW_COUNT }).map(() => null)
    );
    getWidgets(model).forEach(({ Id, LayoutConfig }) => {
      let { col, row, rowSpan, colSpan } = LayoutConfig;

      if (colSpan > 1) {
        Array.from({ length: colSpan }).forEach((_, i) => {
          if (rowSpan > 1) {
            Array.from({ length: rowSpan }).forEach((_, j) => {
              colMap[col + i][row + j] = Id;
            });
          } else {
            colMap[col + i][row] = Id;
          }
        });
      }
      if (rowSpan > 1) {
        Array.from({ length: rowSpan }).forEach((_, i) => {
          if (colSpan > 1) {
            Array.from({ length: colSpan }).forEach((_, j) => {
              colMap[col + j][row + i] = Id;
            });
          } else {
            colMap[col][row + i] = Id;
          }
        });
      }
      if (colSpan === 1 && rowSpan === 1) {
        colMap[col][row] = Id;
      }
    });
    return colMap;
  }

  function handleDragStart(e) {
    setIsDragging(true);
    let widget = e.active.data.current.widget;
    let type = e.active?.data.current.type;
    setActiveWidget(widget);
    let newLayoutModel = { ...layoutModel };
    if (type === "DragWidgetCell") {
      newLayoutModel = deleteWidget(newLayoutModel, widget.Id);
      // let widgetMap = getWidgetsColMap(newLayoutWidgets);
      // let { col, row, rowSpan, colSpan } = widget.LayoutConfig;
      // widgetMap.slice(col, colSpan).for;

      setLayoutModel(newLayoutModel);
    }
    tempWidgetColMap.current = getWidgetsColMap(newLayoutModel);
    originLayoutModel.current = newLayoutModel;
  }

  function getFilledColMap(colMap) {
    let lastWidgetIndex = colMap.findLastIndex((item) => item !== null);
    let filledColMap =
      lastWidgetIndex !== -1 ? colMap.slice(0, lastWidgetIndex + 1) : [];
    return filledColMap;
  }

  function getMovableCell({ col, row, rowSpan, colSpan }) {
    let { COLUMN_COUNT, ROW_COUNT } = config;
    let movableRow = row + rowSpan > ROW_COUNT ? ROW_COUNT - rowSpan : row;
    let movableCol =
      col + colSpan > COLUMN_COUNT ? COLUMN_COUNT - colSpan : col;
    return { movableRow, movableCol };
  }

  function handleDragOver(e) {
    if (!e.over) {
      return;
    }
    if (e.over?.data.current.type === "AddCell") {
      let { rowSpan = 1, colSpan = 1 } = activeWidget?.LayoutConfig || {};
      let { col, row } = e.over.data.current.cell;
      let newLayoutModel = { ...originLayoutModel.current };
      if (isLayoutModelChanged.current) {
        setLayoutModel(newLayoutModel);
        isLayoutModelChanged.current = false;
        tempWidgetColMap.current = getWidgetsColMap(newLayoutModel);
      }
      let currentColMap = getFilledColMap(tempWidgetColMap.current[col]);
      let overWidgetId = tempWidgetColMap.current[col][row];

      if (overWidgetId || row < currentColMap.length) {
        // console.log("within filled", e.over.data.current.cell, currentColMap);
        let firstFreeIndex = currentColMap.findIndex((i) => i === null);
        if (firstFreeIndex !== -1) {
          const { movableRow, movableCol } = getMovableCell({
            row: firstFreeIndex,
            col,
            rowSpan,
            colSpan
          });
          setHoverDetail({
            row: movableRow,
            col: movableCol,
            rowSpan,
            colSpan
          });
        } else {
          let slideWidgetIndex = currentColMap.findIndex(
            (id) => id === overWidgetId
          );
          let movableRowIndex = slideWidgetIndex;

          let slideWidgets = currentColMap.slice(slideWidgetIndex);

          const { movableRow, movableCol } = getMovableCell({
            row: movableRowIndex,
            col,
            rowSpan,
            colSpan
          });
          // console.log("isOver widget", slideWidgets, movableRow, movableCol);
          let uniqueSlideWidgets = new Set(slideWidgets);

          uniqueSlideWidgets.forEach((widgetId) => {
            let widget = newLayoutModel[widgetId];
            newLayoutModel[widgetId] = {
              ...widget,
              LayoutConfig: {
                ...widget.LayoutConfig,
                row: widget.LayoutConfig.row + rowSpan
              }
            };
          });
          setHoverDetail({
            row: movableRow,
            col: movableCol,
            rowSpan,
            colSpan
          });
          // console.log(
          //   "isOverWidget layoutModel change",
          //   newLayoutModel,
          //   tempWidgetColMap.current[col]
          // );
          isLayoutModelChanged.current = true;
          tempWidgetColMap.current = getWidgetsColMap(newLayoutModel);
          setLayoutModel(newLayoutModel);
        }
      } else {
        let hoverRow = currentColMap.length;
        let otherColMaps = tempWidgetColMap.current
          .slice(col, col + colSpan)
          .map((colMap) => {
            return getFilledColMap(colMap);
          });
        if (colSpan) {
          hoverRow = Math.max(...otherColMaps.map((colMap) => colMap.length));
        }
        const { movableRow, movableCol } = getMovableCell({
          row: hoverRow,
          col,
          rowSpan,
          colSpan
        });
        setHoverDetail({
          row: movableRow,
          col: movableCol,
          rowSpan,
          colSpan
        });
        // console.log("hover", hoverRow);
      }
    }
  }

  function handleDragEnd(e) {
    // console.log("end", e);
    const { over, active } = e;
    if (over && over?.data.current.type === "AddCell") {
      let type = active?.data.current.type;
      let currentWidget = type ? active.data.current.widget : activeWidget;
      let { colSpan: widgetColSpan, rowSpan: widgetRowSpan } =
        activeWidget?.LayoutConfig || {};
      let { col, row, colSpan, rowSpan } = hoverDetail;
      let widget = {
        ...currentWidget,
        WidgetId: currentWidget.WidgetId || currentWidget.Id,
        Id: type
          ? `${currentWidget.Id}_${layoutWidgets.length + 1}`
          : currentWidget.Id,
        LayoutConfig: {
          col,
          colSpan: widgetColSpan || colSpan,
          rowSpan: widgetRowSpan || rowSpan,
          row: row
        }
      };
      let newLayoutModel = setWidget(layoutModel, widget);
      // const newLayoutWidgets = [
      //   ...layoutWidgets,
      //   {
      //     ...currentWidget,
      //     WidgetId: currentWidget.WidgetId || currentWidget.Id,
      //     Id: type
      //       ? `${currentWidget.Id}_${layoutWidgets.length + 1}`
      //       : currentWidget.Id,
      //     LayoutConfig: {
      //       col,
      //       colSpan: widgetColSpan || colSpan,
      //       rowSpan: widgetRowSpan || rowSpan,
      //       row: row
      //     }
      //   }
      // ];
      // console.log("DragEnd - layoutModel", newLayoutModel);

      setLayoutModel(newLayoutModel);
    }
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

  function handleDragCancel(e) {
    // console.log("cancel", e);
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

  const layoutWidgets = useMemo(
    function getLayoutWidgets() {
      return getWidgets(layoutModel);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layoutModel]
  );

  let dragStyle = { height: "50px", width: "100px" };
  // if (activeWidget.Id) {
  // const { rowSpan, colSpan } = activeWidget.LayoutConfig;
  // dragStyle.width = `calc(calc(100% / ${config.COLUMN_COUNT}) * ${colSpan})`;
  // dragStyle.height = `${rowSpan * config.ROW_HEIGHT}${
  //   config.ROW_HEIGHT_UNIT
  // }`;
  // }

  return (
    <div className={styles.mainLayout}>
      <DndContext
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCorners}
      >
        <div className={styles.mainContainer}>
          <LeftNav />
          <div
            className={`${styles.container} ${
              isDragging ? styles.isDragging : ""
            }`}
            style={{
              "--col-count": config.COLUMN_COUNT,
              "--row-height": `${config.ROW_HEIGHT}${config.ROW_HEIGHT_UNIT}`,
              gridTemplateRows:
                config.ROW_HEIGHT_UNIT === "fr"
                  ? `repeat(${config.ROW_COUNT}, ${config.ROW_HEIGHT}${config.ROW_HEIGHT_UNIT})`
                  : ""
            }}
          >
            <Cells colCount={config.COLUMN_COUNT} rowCount={config.ROW_COUNT} />
            <LayoutWidgets widgets={layoutWidgets} />
            <HoverCell {...hoverDetail} />
          </div>
        </div>
        <DragOverlay
          dropAnimation={null}
          style={{ ...dragStyle, cursor: "grabbing" }}
        >
          {activeWidget.Id
            ? // <DragWidget
              //   widget={activeWidget}
              //   hoverDetail={hoverDetail}
              //   config={config}
              // />
              null
            : null}
        </DragOverlay>
      </DndContext>
      <aside>
        <Config config={configState} setConfig={setConfigState} />
      </aside>
    </div>
  );
}

const CONTROL_TYPE = {
  NUMBER: "number",
  NUMBER_UNIT: "number_unit"
};

const CONTROL_UNIT_OPTION = [
  { value: "px", label: "px" },
  { value: "fr", label: "fr" }
];

function Config({ config: localConfig, setConfig }) {
  const { COLUMN_COUNT, ROW_COUNT, ROW_HEIGHT, ROW_HEIGHT_UNIT } = localConfig;

  function onChange(id, value) {
    setConfig((prevState) => {
      return { ...prevState, [id]: value };
    });
  }

  return (
    <div className={styles.rightNav}>
      <Control
        id="COLUMN_COUNT"
        type={CONTROL_TYPE.NUMBER}
        label="Column Count"
        value={COLUMN_COUNT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.COLUMN_COUNT}
      />
      <Control
        id="ROW_COUNT"
        type={CONTROL_TYPE.NUMBER}
        label="Row Count"
        value={ROW_COUNT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.ROW_COUNT}
      />
      <Control
        id="ROW_HEIGHT"
        label="Row Height"
        type={CONTROL_TYPE.NUMBER_UNIT}
        value={ROW_HEIGHT}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.ROW_HEIGHT}
        unit={ROW_HEIGHT_UNIT}
        defaultUnit={INITIAL_CONFIG.ROW_HEIGHT_UNIT}
        options={CONTROL_UNIT_OPTION}
      />
    </div>
  );
}

Config.propTypes = {
  config: PropTypes.object,
  setConfig: PropTypes.func
};

function Control({
  id,
  type,
  label,
  value,
  unit,
  options,
  defaultValue,
  defaultUnit,
  onChange,
  onReset
}) {
  return (
    <div className={styles.control}>
      <label>
        {label}
        {(defaultValue !== value || (unit && unit !== defaultUnit)) && (
          <a
            className={styles.link}
            onClick={() => {
              if (type === CONTROL_TYPE.NUMBER_UNIT) {
                onReset(id + "_UNIT", defaultUnit);
              }
              onReset(id, defaultValue);
            }}
          >
            reset
          </a>
        )}
      </label>
      <div className={styles.inputContainer}>
        <InputNumber
          value={value}
          onChange={(value) => {
            onChange(id, Number(value));
          }}
          size="small"
          className={styles.inputNumber}
          changeOnBlur={false}
        />
        {unit && (
          <Select
            value={unit}
            onChange={(e) => {
              let { value } = JSON.parse(e);
              // onChange(id, defaultUnitValue);
              onChange(id + "_UNIT", value);
            }}
            size="small"
          >
            {options.map((opt) => (
              <Select.Option key={opt.value} value={JSON.stringify(opt)}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}

Control.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  type: PropTypes.string,
  unit: PropTypes.string,
  defaultUnit: PropTypes.string,
  options: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  prefix: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func
};

const Cells = memo(CellsComponent);

function CellsComponent({ colCount, rowCount }) {
  let cells = rowCount * colCount;
  let currRow = 0;
  return Array.from({ length: cells }).map((_, index) => {
    let cellCol = index % colCount;
    let cellRow = currRow;
    if (cellCol === colCount - 1) {
      currRow++;
    }
    return <Cell key={index} col={cellCol} row={cellRow} />;
  });
}

function Cell({ col, row, rowSpan = 1, colSpan = 1 }) {
  const { setNodeRef } = useDroppable({
    id: `${col}_${row}`,
    data: {
      cell: {
        col,
        row,
        rowSpan,
        colSpan
      },
      type: "AddCell"
    }
  });

  return (
    <span
      ref={setNodeRef}
      className={styles.cell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
    >
      {/* <label>c:{col}</label>
      <label>r:{row}</label> */}
    </span>
  );
}

Cell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number
};

function HoverCell({ col, row, rowSpan = 1, colSpan = 1 }) {
  if (isNaN(col) || isNaN(row)) {
    return null;
  }
  return (
    <span
      className={styles.hoverCell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      id="hoverCell"
    >
      {/* <label>c:{col}</label>
      <label>r:{row}</label> */}
    </span>
  );
}

HoverCell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number
};

function LeftNav() {
  return (
    <div className={styles.leftNav}>
      {WIDGETS_LIST.map((widget) => (
        <Widget key={widget.Id} widget={widget} />
      ))}
    </div>
  );
}

function Widget({ widget, isOverlay }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidget"
    }
  });

  return (
    <div
      className={`${styles.widget} 
        ${isDragging ? styles.isDragActive : ""}
        ${isOverlay ? styles.isOverlay : ""}`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <label>Widget</label>
      <label>{widget.Name}</label>
    </div>
  );
}

Widget.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  }),
  isOverlay: PropTypes.bool
};

function LayoutWidgets({ widgets }) {
  return widgets.map((widget) => {
    return <WidgetCell key={widget.Id} widget={widget} />;
  });
}

function WidgetCell({ widget }) {
  const { col, row, rowSpan, colSpan } = widget.LayoutConfig;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidgetCell"
    }
  });

  return (
    <div
      className={styles.widgetCell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <div className={styles.content}>
        <label>{widget.Id}</label>
      </div>
    </div>
  );
}

WidgetCell.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  })
};

function DragWidget({ widget }) {
  return (
    <div
      className={styles.widgetCell}
      style={{
        width: "100%",
        height: " 100%"
      }}
    >
      <div className={styles.content}>
        <label>{widget.Id}</label>
      </div>
    </div>
  );
}

DragWidget.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  }),
  hoverDetail: PropTypes.shape({
    col: PropTypes.number,
    row: PropTypes.number,
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number
  }),
  config: PropTypes.object
};
