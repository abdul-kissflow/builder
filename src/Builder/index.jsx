import {
  useMemo,
  useRef,
  useState,
  memo,
  useDeferredValue,
  useEffect,
  useCallback
} from "react";
import PropTypes from "prop-types";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners,
  useSensor,
  MouseSensor,
  useSensors
} from "@dnd-kit/core";
import { InputNumber, Segmented, Select } from "antd";

import styles from "./builder.module.css";

const DELAY_TO_DRAG = 5;

const INITIAL_CONFIG = {
  COLUMN_COUNT: 36,
  ROW_COUNT: 100,
  ROW_HEIGHT: 8,
  ROW_HEIGHT_UNIT: "px",
  //to-do: margin type ?
  MARGIN_TYPE: "default"
};

const WIDGETS_TYPE = {
  INPUT: "input",
  DROPDOWN: "dropdown",
  ICON: "icon",
  CARD: "card"
};

const WIDGETS_CONFIG = {
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

const WIDGETS_LIST = [
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

const INITIAL_LAYOUT_WIDGETS_META = {
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

const CONTROL_TYPE = {
  NUMBER: "number",
  NUMBER_UNIT: "number_unit",
  TOGGLE: "toggle"
};

const CONTROL_UNIT_OPTION = [
  { value: "px", label: "px" },
  { value: "fr", label: "fr" }
];

const CONTROL_MARGIN_OPTION = [
  { value: "default", label: "Default" },
  { value: "none", label: "None" }
];

const RESIZE_DIRECTION = {
  LEFT: "left",
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom"
};

export function Builder() {
  const [configState, setConfigState] = useState(INITIAL_CONFIG);
  const config = useDeferredValue(configState);
  const [layoutModel, setLayoutModel] = useState(INITIAL_LAYOUT_WIDGETS_META);
  const [selectedWidget, setSelectedWidget] = useState(
    INITIAL_LAYOUT_WIDGETS_META.root.Widgets[0]
  );

  const [isDragging, setIsDragging] = useState(false);
  const [hoverDetail, setHoverDetail] = useState({});
  const [activeWidget, setActiveWidget] = useState({});

  const originLayoutModel = useRef(null);
  let containerRef = useRef(null);
  let widgetPosRef = useRef({
    x: 0,
    y: 0
  });
  let mousePosRef = useRef({
    x: 0,
    y: 0
  });

  const { COLUMN_COUNT, ROW_COUNT, ROW_HEIGHT, ROW_HEIGHT_UNIT, MARGIN_TYPE } =
    config;

  function getWidgetIds(model) {
    return model.root.Widgets;
  }

  function getWidgets(model) {
    return getWidgetIds(model).map((compId) => {
      return model[compId];
    });
  }

  function setWidget(model, widget) {
    let newModel = { ...model };
    newModel.root.Widgets = [...getWidgetIds(newModel), widget.Id];
    newModel[widget.Id] = widget;
    return newModel;
  }

  function deleteWidget(model, widgetId) {
    let newModel = { ...model };
    delete newModel[widgetId];
    newModel.root.Widgets = getWidgetIds(newModel).filter(
      (id) => id !== widgetId
    );
    return newModel;
  }

  function onResizeWidget(widgetId, layoutConfig) {
    let newLayoutModel = { ...layoutModel };
    newLayoutModel[widgetId] = {
      ...newLayoutModel[widgetId],
      LayoutConfig: layoutConfig
    };
    setLayoutModel(newLayoutModel);
    setSelectedWidget(widgetId);
  }

  function onDeleteWidget(widgetId) {
    let newLayoutModel = { ...layoutModel };
    setLayoutModel(deleteWidget(newLayoutModel, widgetId));
    setSelectedWidget("");
  }

  function handleDragStart(e) {
    console.log(e, " ******** handleDragStart ********");
    let widget = e.active.data.current.widget;
    const dragWidget = document.querySelector(`[id=${widget.Id}]`);
    const containerLeft = containerRef.current.offsetLeft;
    const containerTop = containerRef.current.offsetTop;
    // console.dir(dragWidget);

    // need to understand this
    widgetPosRef.current.x = containerLeft - dragWidget.offsetLeft;
    widgetPosRef.current.y = containerTop - dragWidget.offsetTop;

    // console.log("start", widgetPosRef.current, e, e.active.rect.current);
    setIsDragging(true);
    setActiveWidget(widget);
    let newLayoutModel = { ...layoutModel };
    let type = e.active?.data.current.type;
    if (type === "DragWidgetCell") {
      newLayoutModel = deleteWidget(newLayoutModel, widget.Id);
      setLayoutModel(newLayoutModel);
      let { row, col, rowSpan = 1, colSpan = 1 } = widget?.LayoutConfig || {};
      setHoverDetail({
        row,
        col,
        rowSpan,
        colSpan
      });
    }
    originLayoutModel.current = newLayoutModel;
  }

  function handleDragMove(e) {
    const relative = {
      x: e.delta.x,
      y: e.delta.y
    };
    mousePosRef.current.x = relative.x;
    mousePosRef.current.y = relative.y;

    if (e.over?.data.current.type === "AddCell") {
      let containerWidth = containerRef.current.clientWidth;
      let containerHeight = containerRef.current.clientHeight;

      let { rowSpan = 1, colSpan = 1 } = activeWidget?.LayoutConfig || {};
      let cellWidth = containerWidth / COLUMN_COUNT;
      let cellHeight =
        ROW_HEIGHT_UNIT === "px" ? ROW_HEIGHT : containerHeight / ROW_COUNT;

      let col = Math.floor(mousePosRef.current.x / cellWidth);
      let row = Math.floor(mousePosRef.current.y / cellHeight);
      console.log("handleDragMove", e, mousePosRef.current);
      if (mousePosRef.current.x < 0) {
        col = 0;
      }
      if (mousePosRef.current.x > containerWidth) {
        col = COLUMN_COUNT - 1;
      }
      if (mousePosRef.current.y < 0) {
        row = 0;
      }
      if (mousePosRef.current.y > containerHeight) {
        row = ROW_COUNT - 1;
      }

      if (row + rowSpan >= ROW_COUNT) {
        row = ROW_COUNT - rowSpan;
      }

      if (col + colSpan >= COLUMN_COUNT) {
        col = COLUMN_COUNT - colSpan;
      }

      setHoverDetail({
        row,
        col,
        rowSpan,
        colSpan
      });
    }
  }

  function handleDragOver(e) {
    // // console.log("over", e);
    if (!e.over) {
      return;
    }
  }

  function handleDragEnd(e) {
    // // console.log("end", e);
    const { over, active } = e;
    if (over && over?.data.current.type === "AddCell") {
      let type = active?.data.current.type;
      let currentWidget = type ? active.data.current.widget : activeWidget;
      let { colSpan: widgetColSpan, rowSpan: widgetRowSpan } =
        activeWidget?.LayoutConfig || {};
      let { col, row, colSpan, rowSpan } = hoverDetail;
      let widget = {
        ...currentWidget,
        Type: currentWidget.Type,
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
      // // console.log("DragEnd - layoutModel", newLayoutModel);
      setLayoutModel(newLayoutModel);
      setSelectedWidget(widget.Id);
      if (ROW_HEIGHT_UNIT === "px" && ROW_COUNT - (row + rowSpan) < 10) {
        // // console.log("adding rows");
        setConfigState((prevState) => ({
          ...prevState,
          ROW_COUNT: ROW_COUNT + 20
        }));
      }
    }
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

  function handleDragCancel(e) {
    // // console.log("cancel", e);
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

  // // console.log("hover", hoverDetail, selectedWidget, config);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: DELAY_TO_DRAG
    }
  });
  const sensors = useSensors(mouseSensor);

  const cellHeight =
    ROW_HEIGHT_UNIT === "px"
      ? ROW_HEIGHT
      : containerRef.current?.clientHeight / ROW_COUNT;

  const cellWidth = containerRef.current?.clientWidth / COLUMN_COUNT;

  return (
    <div className={styles.mainLayout}>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={closestCorners}
      >
        <div className={styles.mainContainer}>
          <LeftNav />
          <div
            style={{
              height: "100%",
              width: "100%",
              paddingBlock: "20px",
              paddingInline: "12px"
            }}
          >
            <div
              ref={containerRef}
              className={`${styles.container} ${
                isDragging ? styles.isDragging : ""
              }`}
              style={{
                position: "relative",
                height: "100%",
                width: "100%",
                "--col-count": COLUMN_COUNT,
                "--row-height": `${ROW_HEIGHT}${ROW_HEIGHT_UNIT}`,
                gridTemplateRows:
                  ROW_HEIGHT_UNIT === "fr"
                    ? `repeat(${ROW_COUNT}, ${ROW_HEIGHT}${ROW_HEIGHT_UNIT})`
                    : ""
              }}
              onMouseDown={() => {
                // // console.log("selected none");
                setSelectedWidget("");
              }}
            >
              <DroppableArea
                colCount={COLUMN_COUNT}
                rowCount={ROW_COUNT}
                rowHeight={
                  ROW_HEIGHT_UNIT === "px"
                    ? ROW_HEIGHT
                    : containerRef.current?.clientHeight / ROW_COUNT
                }
              />
              <LayoutWidgets
                widgets={layoutWidgets}
                selectedWidget={selectedWidget}
                onSelectWidget={setSelectedWidget}
                cellWidth={cellWidth}
                cellHeight={cellHeight}
                colCount={COLUMN_COUNT}
                rowCount={ROW_COUNT}
                marginType={MARGIN_TYPE}
                onResizeWidget={onResizeWidget}
                onDeleteWidget={onDeleteWidget}
              />
              <HoverCell
                cellHeight={cellHeight}
                cellWidth={cellWidth}
                {...hoverDetail}
              />
            </div>
          </div>
        </div>
        <DragOverlay dropAnimation={null} style={{ cursor: "grabbing" }}>
          {/* {activeWidget.Id ? (
            <DragWidget
              widget={activeWidget}
              hoverDetail={hoverDetail}
              config={config}
            />
          ) : null} */}
        </DragOverlay>
      </DndContext>
      <aside>
        <Config config={configState} setConfig={setConfigState} />
      </aside>
    </div>
  );
}

function Config({ config: localConfig, setConfig }) {
  const { COLUMN_COUNT, ROW_COUNT, ROW_HEIGHT, ROW_HEIGHT_UNIT, MARGIN_TYPE } =
    localConfig;

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
      <Control
        id="MARGIN_TYPE"
        type={CONTROL_TYPE.TOGGLE}
        label="Margin"
        value={MARGIN_TYPE}
        onChange={onChange}
        onReset={onChange}
        defaultValue={INITIAL_CONFIG.MARGIN_TYPE}
        options={CONTROL_MARGIN_OPTION}
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
        {[CONTROL_TYPE.NUMBER, CONTROL_TYPE.NUMBER_UNIT].includes(type) && (
          <InputNumber
            value={value}
            onChange={(value) => {
              onChange(id, Number(value));
            }}
            size="small"
            className={styles.inputNumber}
            changeOnBlur={false}
          />
        )}
        {[CONTROL_TYPE.TOGGLE].includes(type) && (
          <Segmented
            value={value}
            onChange={(value) => {
              onChange(id, value);
            }}
            options={options}
          />
        )}
        {unit && (
          <Select
            value={unit}
            onChange={(e) => {
              let { value } = JSON.parse(e);
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

const DroppableArea = memo(DroppableAreaComponent);

function DroppableAreaComponent({ colCount, rowCount, rowHeight }) {
  const { setNodeRef } = useDroppable({
    id: `container001`,
    data: {
      id: "container001",
      type: "AddCell"
    }
  });

  return (
    <div
      ref={setNodeRef}
      id={"container001"}
      style={{
        height: "100%",
        width: "100%",
        backgroundImage: `linear-gradient(rgb(220 229 234), rgb(220 229 234)), linear-gradient(0deg, rgb(220 229 234) 1px, transparent 1px, transparent 100%), linear-gradient(rgb(220 229 234), rgb(220 229 234)), linear-gradient(90deg, rgb(220 229 234) 1px, transparent 1px, transparent 100%)`,
        backgroundPosition: `0px 0px, 0px 0px, 100% 0px, 0px 0px`,
        backgroundSize: `100% 1px, 100% ${rowHeight}px, 1px 100%, calc(100% / ${colCount}) 100%`,
        backgroundRepeat: `no-repeat, repeat-y, no-repeat, repeat-x`,
        gridArea: `1 / 1 / span ${rowCount} / span ${colCount}`
      }}
    ></div>
  );
}

DroppableAreaComponent.propTypes = {
  colCount: PropTypes.number,
  rowCount: PropTypes.number,
  rowHeight: PropTypes.number
};

function HoverCell({
  col,
  row,
  rowSpan = 1,
  colSpan = 1,
  cellHeight,
  cellWidth
}) {
  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${row * cellHeight}px`,
        left: `${col * cellWidth}px`,
        width: `${colSpan * cellWidth}px`,
        height: `${rowSpan * cellHeight}px`
      };
    },
    [row, cellHeight, col, cellWidth, colSpan, rowSpan]
  );

  if (isNaN(col) || isNaN(row)) {
    return null;
  }

  return (
    <span
      className={styles.hoverCell}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties
        // gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      id="hoverCell"
    />
  );
}

HoverCell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number,
  cellHeight: PropTypes.number,
  cellWidth: PropTypes.number
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
      id={widget.Id}
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
    Type: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  }),
  isOverlay: PropTypes.bool
};

function LayoutWidgets({
  widgets,
  cellWidth,
  cellHeight,
  selectedWidget,
  onSelectWidget,
  onResizeWidget,
  onDeleteWidget,
  colCount,
  rowCount,
  marginType
}) {
  return widgets.map((widget) => {
    return (
      <WidgetCell
        key={widget.Id}
        widget={widget}
        cellWidth={cellWidth}
        cellHeight={cellHeight}
        selected={selectedWidget === widget.Id}
        onSelect={onSelectWidget}
        onResize={onResizeWidget}
        onDelete={onDeleteWidget}
        colCount={colCount}
        rowCount={rowCount}
        marginType={marginType}
      />
    );
  });
}

function WidgetCell({
  widget,
  selected,
  onSelect,
  onResize,
  onDelete,
  cellWidth,
  cellHeight,
  colCount,
  rowCount,
  marginType
}) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidgetCell"
    }
  });

  const [widgetLayoutConfig, setWidgetLayoutConfig] = useState(
    widget.LayoutConfig
  );
  const [isResizing, setIsResizing] = useState(false);

  const resizeDirection = useRef(null);
  const resizeStarting = useRef(null);

  const { col, row, colSpan, rowSpan } = widgetLayoutConfig;

  useEffect(() => {
    setWidgetLayoutConfig(widget.LayoutConfig);
  }, [widget]);

  const onMouseDown = useCallback(function onHeaderMouseDownFunction(e) {
    if (e.target.dataset.resizer) {
      e.stopPropagation();
      switch (e.target.dataset.resizer) {
        case RESIZE_DIRECTION.LEFT:
        case RESIZE_DIRECTION.RIGHT:
          resizeStarting.current = e.screenX;
          break;
        case RESIZE_DIRECTION.TOP:
        case RESIZE_DIRECTION.BOTTOM:
          resizeStarting.current = e.screenY;
          break;
        default:
          null;
      }
      resizeDirection.current = e.target.dataset.resizer;
      // console.log(
      //   "mouse down",
      //   resizeDirection.current,
      //   resizeStarting.current
      // );
      setIsResizing(true);
    }
  }, []);

  const onWindowMouseMove = useCallback(
    function onWindowMouseMoveFunction(e) {
      if (isResizing) {
        let { col, row, colSpan, rowSpan } = widget.LayoutConfig;
        let { minColSpan, minRowSpan } = WIDGETS_CONFIG[widget.Type];
        switch (resizeDirection.current) {
          case RESIZE_DIRECTION.LEFT:
            {
              const diff =
                (window.isRTL ? -1 : 1) * (e.screenX - resizeStarting.current);
              let noOfCol = Math.round(Math.abs(diff) / cellWidth);
              let isLeft = Math.sign(diff) < 0;

              if (isLeft) {
                col = col - noOfCol;
                colSpan = colSpan + noOfCol;
              } else {
                col = col + noOfCol;
                colSpan = colSpan - noOfCol;
              }

              if (col < 0 || colSpan > colCount || colSpan < minColSpan) {
                return;
              }

              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                col: col,
                colSpan: colSpan
              }));
              // console.log(
              //   "move left",
              //   diff,
              //   noOfCol,
              //   isLeft,
              //   col,
              //   colSpan,
              //   minColSpan
              // );
            }
            break;
          case RESIZE_DIRECTION.TOP:
            {
              const diff = e.screenY - resizeStarting.current;
              let noOfRow = Math.round(Math.abs(diff) / cellHeight);
              let isTop = Math.sign(diff) < 0;

              if (isTop) {
                row = row - noOfRow;
                rowSpan = rowSpan + noOfRow;
              } else {
                row = row + noOfRow;
                rowSpan = rowSpan - noOfRow;
              }

              if (row < 0 || rowSpan > rowCount || rowSpan < minRowSpan) {
                return;
              }
              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                row,
                rowSpan
              }));
              // console.log("move left", diff, noOfRow, isTop);
            }
            break;
          case RESIZE_DIRECTION.RIGHT:
            {
              const diff =
                (window.isRTL ? -1 : 1) * (e.screenX - resizeStarting.current);
              let noOfCol = Math.round(Math.abs(diff) / cellWidth);
              let isRight = Math.sign(diff) > 0;

              if (isRight) {
                colSpan = colSpan + noOfCol;
              } else {
                colSpan = colSpan - noOfCol;
              }

              if (colSpan > colCount || colSpan < minColSpan) {
                return;
              }

              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                colSpan
              }));
              // console.log("move right", diff, noOfCol, isRight);
            }
            break;
          case RESIZE_DIRECTION.BOTTOM:
            {
              const diff = e.screenY - resizeStarting.current;
              let noOfRow = Math.round(Math.abs(diff) / cellHeight);
              let isBottom = Math.sign(diff) > 0;

              if (isBottom) {
                rowSpan = rowSpan + noOfRow;
              } else {
                rowSpan = rowSpan - noOfRow;
              }

              if (rowSpan > rowCount || rowSpan < minRowSpan) {
                return;
              }

              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                rowSpan
              }));
              // console.log("move bottom", diff, noOfRow, isBottom);
            }
            break;
          default:
            null;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cellHeight,
      cellWidth,
      colCount,
      isResizing,
      rowCount,
      widget.LayoutConfig,
      widget.Type,
      widgetLayoutConfig
    ]
  );

  const onWindowMouseUp = useCallback(
    function onWindowMouseUp() {
      if (isResizing) {
        setIsResizing(false);
        onResize(widget.Id, widgetLayoutConfig, resizeDirection.current);
        resizeStarting.current = null;
        resizeDirection.current = null;
      }
    },
    [isResizing, onResize, widget.Id, widgetLayoutConfig]
  );

  useEffect(
    function onWindowMouseChange() {
      window.addEventListener("mousemove", onWindowMouseMove);
      window.addEventListener("mouseup", onWindowMouseUp);
      return () => {
        window.removeEventListener("mousemove", onWindowMouseMove);
        window.removeEventListener("mouseup", onWindowMouseUp);
      };
    },
    [onWindowMouseMove, onWindowMouseUp]
  );

  // console.log("pos", widgetLayoutConfig);

  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${row * cellHeight}px`,
        left: `${col * cellWidth}px`,
        width: `${colSpan * cellWidth}px`,
        height: `${rowSpan * cellHeight}px`
      };
    },
    [row, col, colSpan, cellWidth, rowSpan, cellHeight]
  );

  return (
    <div
      className={`${styles.widgetCell} ${selected ? styles.selected : ""} ${
        marginType === "default" ? styles.defaultMargin : ""
      }`}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties
        // gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(widget.Id);
      }}
      onKeyDown={(e) => {
        // console.log("delete", e);
        if (e.key === "Backspace") {
          onDelete(widget.Id);
        }
      }}
      id={widget.Id}
      {...listeners}
      {...attributes}
    >
      <div className={styles.content}>
        <label>{widget.Id}</label>
      </div>
      <div
        className={`${styles.overlayContainer} ${
          isResizing ? styles.resizing : ""
        }`}
        onMouseDown={onMouseDown}
      >
        {selected && (
          <>
            <div
              className={`${styles.resizer} ${styles.left}`}
              data-resizer={RESIZE_DIRECTION.LEFT}
              data-active={resizeDirection.current === RESIZE_DIRECTION.LEFT}
            />
            <div
              className={`${styles.resizer} ${styles.top}`}
              data-resizer={RESIZE_DIRECTION.TOP}
              data-active={resizeDirection.current === RESIZE_DIRECTION.TOP}
            />
            <div
              className={`${styles.resizer} ${styles.right}`}
              data-resizer={RESIZE_DIRECTION.RIGHT}
              data-active={resizeDirection.current === RESIZE_DIRECTION.RIGHT}
            />
            <div
              className={`${styles.resizer} ${styles.bottom}`}
              data-resizer={RESIZE_DIRECTION.BOTTOM}
              data-active={resizeDirection.current === RESIZE_DIRECTION.BOTTOM}
            />
          </>
        )}
      </div>
    </div>
  );
}

WidgetCell.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    Type: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  }),
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onResize: PropTypes.func,
  onDelete: PropTypes.func,
  cellWidth: PropTypes.number,
  cellHeight: PropTypes.number,
  colCount: PropTypes.number,
  rowCount: PropTypes.number,
  marginType: PropTypes.string
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
    Type: PropTypes.string,
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
