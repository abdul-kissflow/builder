import { useMemo, useRef, useState, useDeferredValue, useEffect } from "react";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  useSensor,
  MouseSensor,
  useSensors
} from "@dnd-kit/core";

import styles from "./builder.module.css";
import {
  DELAY_TO_DRAG,
  INITIAL_CONFIG,
  INITIAL_LAYOUT_WIDGETS_META
} from "./constant";
import { LeftNav } from "./leftnav";
import { DroppableArea } from "./dropable.area";
import { LayoutWidgets } from "./widget.renderer";
import { HoverCell } from "./hover.cell";
import { Config } from "./config";
import { InputNumber, Select } from "antd";
import { getSpanCount } from "./util";

export function Builder() {
  const [configState, setConfigState] = useState(INITIAL_CONFIG);
  const config = useDeferredValue(configState);
  const [layoutModel, setLayoutModel] = useState(INITIAL_LAYOUT_WIDGETS_META);
  const [selectedWidget, setSelectedWidget] = useState(
    INITIAL_LAYOUT_WIDGETS_META.root.Widgets[0]
  );

  const [cardChildHeight, setCardChildHeight] = useState(50);

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

    // console.dir(dragWidget);

    const { left: containerLeftOffset, top: containerTopOffset } =
      containerRef.current.getBoundingClientRect();
    const { left: dragWidgetLeftOffset, top: dragWidgetTopOffset } =
      dragWidget.getBoundingClientRect();

    // need to understand this
    widgetPosRef.current.x = containerLeftOffset - dragWidgetLeftOffset;
    widgetPosRef.current.y = containerTopOffset - dragWidgetTopOffset;

    // console.log("start", widgetPosRef.current, e, e.active.rect.current);
    setIsDragging(true);
    setActiveWidget(widget);
    let newLayoutModel = { ...layoutModel };
    let type = e.active?.data.current.type;
    if (type === "DragWidgetCell") {
      newLayoutModel = deleteWidget(newLayoutModel, widget.Id);
      setLayoutModel(newLayoutModel);
      let { colEnd, colStart, rowEnd, rowStart } = widget?.LayoutConfig || {};
      setHoverDetail({
        colEnd,
        colStart,
        rowEnd,
        rowStart
      });
    }
    originLayoutModel.current = newLayoutModel;
  }

  function handleDragMove(e) {
    const { x: activeWidgetX, y: activeWidgetY } = widgetPosRef.current;
    const relative = {
      x: e.delta.x - activeWidgetX,
      y: e.delta.y - activeWidgetY
    };
    mousePosRef.current.x = relative.x;
    mousePosRef.current.y = relative.y;

    if (e.over?.data.current.type === "AddCell") {
      let containerWidth = containerRef.current.clientWidth;
      let containerHeight = containerRef.current.clientHeight;

      let { colEnd = 1, rowEnd = 1 } = activeWidget?.LayoutConfig || {};
      let cellWidth = containerWidth / COLUMN_COUNT;
      let cellHeight =
        ROW_HEIGHT_UNIT === "px" ? ROW_HEIGHT : containerHeight / ROW_COUNT;

      let colStart = Math.floor(mousePosRef.current.y / cellHeight);
      let rowStart = Math.floor(mousePosRef.current.x / cellWidth);
      console.log("handleDragMove", e, mousePosRef.current);
      if (mousePosRef.current.x < 0) {
        colStart = 0;
      }
      if (mousePosRef.current.x > containerWidth) {
        colStart = COLUMN_COUNT - 1;
      }
      if (mousePosRef.current.y < 0) {
        rowStart = 0;
      }
      if (mousePosRef.current.y > containerHeight) {
        rowStart = ROW_COUNT - 1;
      }

      let rowSpan = getSpanCount(rowStart, rowEnd);
      let colSpan = getSpanCount(colStart, colEnd);

      if (rowEnd >= ROW_COUNT) {
        rowStart = ROW_COUNT - rowSpan;
      }

      if (colEnd >= COLUMN_COUNT) {
        colStart = COLUMN_COUNT - colSpan;
      }

      setHoverDetail({
        rowStart,
        colStart,
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

      let { rowEnd: widgetRowEnd, colEnd: WidgetColEnd } =
        activeWidget?.LayoutConfig || {};

      let { rowStart, rowEnd, colStart, colEnd } = hoverDetail;

      let widget = {
        ...currentWidget,
        Type: currentWidget.Type,
        Id: type
          ? `${currentWidget.Id}_${layoutWidgets.length + 1}`
          : currentWidget.Id,
        LayoutConfig: {
          // col,
          // colSpan: widgetColSpan || colSpan,
          // rowSpan: widgetRowSpan || rowSpan,
          // row: row
          rowStart: rowStart,
          rowEnd: widgetRowEnd || rowEnd,
          colStart: colStart,
          colEnd: WidgetColEnd || colEnd
        }
      };
      let newLayoutModel = setWidget(layoutModel, widget);
      // // console.log("DragEnd - layoutModel", newLayoutModel);
      setLayoutModel(newLayoutModel);
      setSelectedWidget(widget.Id);
      if (ROW_HEIGHT_UNIT === "px" && ROW_COUNT - rowEnd < 10) {
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

  useEffect(function takeRef() {}, []);

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
              position: "relative",
              height: "100%",
              width: "100%"
              // paddingBlock: "20px",
              // paddingInline: "12px"
            }}
          >
            <div
              data-name="ref-check"
              ref={containerRef}
              className={`${styles.container} ${
                isDragging ? styles.isDragging : ""
              }`}
              style={{
                position: "absolute",
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
                cardChildHeight={cardChildHeight}
                widgets={layoutWidgets}
                selectedWidget={selectedWidget}
                onSelectWidget={setSelectedWidget}
                cellWidth={800 / COLUMN_COUNT}
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
        <GeneralConfig
          height={cardChildHeight}
          setHeight={setCardChildHeight}
        />
      </aside>
    </div>
  );
}

function GeneralConfig({ height, setHeight }) {
  return (
    <div>
      <div>Card chidren height</div>
      <InputNumber value={height} onChange={(value) => setHeight(value)} />
      <Select value={"px"} size="small">
        <Select.Option key={"px"} value={"px"}>
          px
        </Select.Option>
      </Select>
    </div>
  );
}
