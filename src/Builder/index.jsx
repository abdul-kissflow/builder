import {
  useMemo,
  useRef,
  useState,
  useDeferredValue,
  useEffect,
  useReducer
} from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  MouseSensor,
  useSensors
} from "@dnd-kit/core";
import PropTypes from "prop-types";

import styles from "./builder.module.css";
import {
  DELAY_TO_DRAG,
  GENERAL_CONFIG,
  INITIAL_CONFIG,
  INITIAL_LAYOUT_WIDGETS_META,
  WIDGET_ALIGNEMNT_TYPE
} from "./constant";
import { LeftNav } from "./leftnav";
import { DroppableArea } from "./dropable.area";
import { LayoutWidgets } from "./widget.renderer";
import { HoverCell } from "./hover.cell";
import { Config } from "./config";
import { BuilderContext } from "./context";
import { layoutRevalidateAndUpdate } from "./util";
import { HeightInput, TextInput } from "./general.config.widgets";

const DEFAULT_CONFIG = {
  isAutoResize: false,
  colStart: -1,
  colEnd: -1,
  widgetId: "",
  updatedRowCount: 0
};

const reducer = (state, action) => {
  switch (action.type) {
    case WIDGET_ALIGNEMNT_TYPE.WIDGET_DROPPED ||
      WIDGET_ALIGNEMNT_TYPE.AUTO_GROW ||
      WIDGET_ALIGNEMNT_TYPE.RESIZING ||
      WIDGET_ALIGNEMNT_TYPE.CROSS_RESIZING:
      return { ...state, ...action };
    case "STOP":
      return { ...DEFAULT_CONFIG };
    default:
      return { ...DEFAULT_CONFIG, ...action };
  }
};

export function Builder() {
  const [state, dispatch] = useReducer(reducer, DEFAULT_CONFIG);

  const [configState, setConfigState] = useState(INITIAL_CONFIG);
  const config = useDeferredValue(configState);
  const [layoutModel, setLayoutModel] = useState(INITIAL_LAYOUT_WIDGETS_META);
  const [selectedWidget, setSelectedWidget] = useState(
    INITIAL_LAYOUT_WIDGETS_META.root.Widgets[0]
  );
  const [widgetsConfig, setWidgetConfig] = useState({});

  const [isDragging, setIsDragging] = useState(false);
  const [hoverDetail, setHoverDetail] = useState({});
  const [activeWidget, setActiveWidget] = useState({});

  const [layoutModelWidget, setLayoutModelWidget] = useState([]);

  useEffect(
    function updateLayoutModel() {
      let widgetsList = getWidgets(layoutModel);

      let result = layoutRevalidateAndUpdate(widgetsList, state, dispatch);
      setLayoutModelWidget(result);
    },
    [layoutModel, state]
  );

  // useEffect(
  //   function updateWhileAutoGrow() {
  //     if (state.isAutoResize) {
  //       let result = layoutRevalidateAndUpdate(
  //         layoutModelWidget,
  //         state,
  //         dispatch
  //       );
  //       setLayoutModelWidget(result);
  //     }
  //   },
  //   [state, layoutModelWidget.length]
  // );

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

  function updateWidgetsOrder(widgetsList) {
    return widgetsList.sort((primaryWidget, secondaryWidget) => {
      const {
        colStart: primaryWidgetColStart,
        rowStart: primaryWidgetRowStart
      } = primaryWidget.LayoutConfig;

      const { colStart: secondaryWidgetColStart, rowStart: secondaryRowStart } =
        secondaryWidget.LayoutConfig;

      if (primaryWidgetRowStart === secondaryRowStart) {
        return primaryWidgetColStart - secondaryWidgetColStart; // Sort by y if x values are the same
      }
      return primaryWidgetRowStart - secondaryRowStart; // Sort by x
    });
  }

  function getWidgets(model) {
    let list = getWidgetIds(model).map((compId) => {
      return model[compId];
    });
    return updateWidgetsOrder(list);
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
    let widget = e.active.data.current.widget;
    const dragWidget = document.querySelector(`[id=${widget.Id}]`);

    const { left: containerLeftOffset, top: containerTopOffset } =
      containerRef.current.getBoundingClientRect();
    const { left: dragWidgetLeftOffset, top: dragWidgetTopOffset } =
      dragWidget.getBoundingClientRect();

    // need to understand this
    widgetPosRef.current.x = containerLeftOffset - dragWidgetLeftOffset;
    widgetPosRef.current.y = containerTopOffset - dragWidgetTopOffset;

    setIsDragging(true);
    setActiveWidget(widget);

    let newLayoutModel = { ...layoutModel };
    let type = e.active?.data.current.type;
    if (type === "DragWidgetCell") {
      newLayoutModel = deleteWidget(newLayoutModel, widget.Id);
      setLayoutModel(newLayoutModel);
      // let { colEnd, colStart, rowEnd, rowStart, colSpan, rowSpan } =
      //   widget?.LayoutConfig || {};
      let config = widget?.LayoutConfig || {};

      setHoverDetail({
        colStart: config.colStart,
        colEnd: config.colEnd,
        rowEnd: config.rowEnd,
        rowStart: config.rowStart,
        colSpan: config.colSpan(),
        rowSpan: config.rowSpan()
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

      let activeWidgetConfig = activeWidget?.LayoutConfig || {};

      let cellWidth = containerWidth / COLUMN_COUNT;
      let cellHeight =
        ROW_HEIGHT_UNIT === "px" ? ROW_HEIGHT : containerHeight / ROW_COUNT;

      let rowStart = Math.floor(mousePosRef.current.y / cellHeight);
      let colStart = Math.floor(mousePosRef.current.x / cellWidth);

      let colEnd = colStart + activeWidgetConfig.colSpan();
      let rowEnd = rowStart + activeWidgetConfig.rowSpan();

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

      if (rowEnd >= ROW_COUNT) {
        rowStart = ROW_COUNT - activeWidgetConfig.rowSpan();
      }

      if (colEnd >= COLUMN_COUNT) {
        colStart = COLUMN_COUNT - activeWidgetConfig.colSpan();
      }

      setHoverDetail({
        rowStart,
        colStart,
        rowEnd,
        colEnd,
        colSpan: activeWidgetConfig.colSpan(),
        rowSpan: activeWidgetConfig.rowSpan()
      });
    }
  }

  function handleDragOver(e) {
    if (!e.over) {
      return;
    }
  }

  function handleDragEnd(e) {
    const { over, active } = e;
    if (over && over?.data.current.type === "AddCell") {
      let type = active?.data.current.type;
      let currentWidget = type ? active.data.current.widget : activeWidget;

      let activeWidgetConfig = activeWidget?.LayoutConfig || {};

      let { rowStart, rowEnd, colStart, colEnd } = hoverDetail;

      let widget = {
        ...currentWidget,
        Type: currentWidget.Type,
        Id: type
          ? `${currentWidget.Id}_${layoutModelWidget.length + 1}`
          : currentWidget.Id,
        LayoutConfig: {
          ...activeWidgetConfig,
          rowStart: rowStart,
          rowEnd: rowEnd,
          colStart: colStart,
          colEnd: colEnd
        }
      };

      if (over.id !== "container001") {
        let draggingWidgetPosition = active.rect.current.translated;
        let intersectedWidgetPosition = over.rect;

        let isIntersectedAboveMidPoint = checkIsIntersectedAboveMidPoint(
          draggingWidgetPosition,
          intersectedWidgetPosition
        );

        if (isIntersectedAboveMidPoint) {
          dispatch({
            widgetId: widget.Id,
            type: WIDGET_ALIGNEMNT_TYPE.WIDGET_DROPPED,
            isAutoResize: true,
            colEnd,
            colStart,
            rowStart,
            rowEnd
          });
        } else {
          let collisionRowCount = over.data.current.rowEnd - rowStart;

          if (collisionRowCount !== 0) {
            widget = {
              ...widget,
              LayoutConfig: {
                ...widget.LayoutConfig,
                rowStart: over.data.current.rowEnd,
                rowEnd: rowEnd + collisionRowCount
              }
            };

            dispatch({
              widgetId: widget.Id,
              type: WIDGET_ALIGNEMNT_TYPE.BELOW_MIDPOINT,
              isAutoResize: true,
              colEnd,
              colStart,
              rowStart: over.data.current.rowEnd,
              rowEnd: rowEnd + collisionRowCount
            });
          }
        }
      }

      let newLayoutModel = setWidget(layoutModel, widget);
      setLayoutModel(newLayoutModel);
      setSelectedWidget(widget.Id);
      if (ROW_HEIGHT_UNIT === "px" && ROW_COUNT - rowEnd < 10) {
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

  function checkIsIntersectedAboveMidPoint(
    draggingWidgetPosition,
    intersectedWidgetPosition
  ) {
    let draggingWidgetMidPoint =
      draggingWidgetPosition.top + draggingWidgetPosition.height / 2;
    let intersectedWidgetMidPoint =
      intersectedWidgetPosition.top + intersectedWidgetPosition.height / 2;

    return draggingWidgetMidPoint < intersectedWidgetMidPoint;
  }

  function handleDragCancel() {
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

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

  const storeObj = useMemo(
    function getStoreObj() {
      return {
        config,
        state,
        dispatch,
        selectedWidget,
        widgetsConfig,
        updateWidgetConfig: setWidgetConfig
      };
    },
    [widgetsConfig, selectedWidget, state, config]
  );

  return (
    <BuilderContext.Provider value={storeObj}>
      <div className={styles.mainLayout}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className={styles.mainContainer}>
            <LeftNav />
            <div
              style={{
                position: "relative",
                height: "100%",
                width: "100%"
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
                  widgets={layoutModelWidget}
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
        <aside style={{ width: "150px" }}>
          <Config config={configState} setConfig={setConfigState} />
          <GeneralConfig
            selectedWidget={selectedWidget}
            generalConfig={
              selectedWidget
                ? layoutModel[selectedWidget]?.["GeneralConfig"]
                : []
            }
          />
        </aside>
      </div>
    </BuilderContext.Provider>
  );
}

GeneralConfig.propTypes = {
  generalConfig: PropTypes.array
};

function GeneralConfig({ generalConfig }) {
  if (generalConfig.length < 0) {
    return null;
  }

  return (
    <div className={styles.generalWidgetWrapper}>
      <div>General config</div>
      <ConfigList generalConfig={generalConfig} />
      {/* <TextInput /> */}
    </div>
  );
}

function ConfigList({ generalConfig }) {
  return generalConfig.map((config, index) => (
    <GeneralConfigWidget key={index} generalConfig={config} />
  ));
}

GeneralConfigWidget.propTypes = {
  generalConfig: PropTypes.shape({
    type: PropTypes.string
  })
};

function GeneralConfigWidget({ generalConfig }) {
  switch (generalConfig.type) {
    case GENERAL_CONFIG.HEIGHT:
      return <HeightInput type={generalConfig.type} config={generalConfig} />;
    case GENERAL_CONFIG.TEXT_INPUT:
      return <TextInput />;
    default:
      return null;
  }
}
