import {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext
} from "react";
import PropTypes from "prop-types";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import styles from "./builder.module.css";
import { RESIZE_DIRECTION, WIDGET_ALIGNEMNT_TYPE } from "./constant";
import { BuilderContext } from "./context";

export function LayoutWidgets({
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
  const { widgetsConfig, selectedWidget } = useContext(BuilderContext);
  const isAuto = widgetsConfig[widget.Id]?.heightType === "auto";

  const [widgetLayoutConfig, setWidgetLayoutConfig] = useState(
    widget.LayoutConfig
  );

  const { colStart, rowStart } = widgetLayoutConfig;

  const widgetColspan = widgetLayoutConfig.colSpan();
  const widgetRowSpan = widgetLayoutConfig.rowSpan();

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef
  } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidgetCell",
      ...widgetLayoutConfig
    }
  });

  const { setNodeRef: setDroppableNodeRef } = useDroppable({
    id: widget.Id,
    data: {
      id: widget.Id,
      type: "AddCell",
      ...widgetLayoutConfig
    }
  });

  const setCombinedRef = (node) => {
    setDraggableNodeRef(node);
    setDroppableNodeRef(node);
  };

  useEffect(() => {
    setWidgetLayoutConfig(widget.LayoutConfig);
  }, [widget]);

  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${rowStart * cellHeight}px`,
        left: `${colStart * cellWidth}px`,
        width: `${widgetColspan * cellWidth}px`,
        height: !isAuto ? `${widgetRowSpan * cellHeight}px` : "auto"
      };
    },
    [
      isAuto,
      rowStart,
      cellHeight,
      colStart,
      cellWidth,
      widgetColspan,
      widgetRowSpan
    ]
  );

  return (
    <div
      id={`${widget.Id}-alignerWrapper`}
      className={`${styles.widgetCell} ${selected ? styles.selected : ""} ${
        marginType === "default" ? styles.defaultMargin : ""
      }`}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties
      }}
      ref={setCombinedRef}
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
      {...listeners}
      {...attributes}
    >
      <WidgetHandler
        selectedWidget={selectedWidget}
        isAuto={isAuto}
        selected={selected}
        rowCount={rowCount}
        cellHeight={cellHeight}
        colCount={colCount}
        cellWidth={cellWidth}
        onResize={onResize}
        widget={widget}
        widgetLayoutConfig={widgetLayoutConfig}
        setWidgetLayoutConfig={setWidgetLayoutConfig}
      />
    </div>
  );
}

WidgetCell.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    Type: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      colStart: PropTypes.number,
      colEnd: PropTypes.number,
      rowStart: PropTypes.number,
      rowEnd: PropTypes.number,
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

WidgetHandler.propTypes = {
  isAuto: PropTypes.bool,
  selectedWidget: PropTypes.string,
  widgetLayoutConfig: PropTypes.shape({
    colStart: PropTypes.number,
    colEnd: PropTypes.number,
    rowStart: PropTypes.number,
    rowEnd: PropTypes.number,
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number
  }),
  widget: PropTypes.shape({
    Id: PropTypes.string
  }),
  cellHeight: PropTypes.number
};

function WidgetHandler(props) {
  const { widgetLayoutConfig, widget, cellHeight, isAuto, selectedWidget } =
    props;

  if (isAuto) {
    return (
      <AutogrowWidget
        cellHeight={cellHeight}
        widget={widget}
        widgetLayoutConfig={widgetLayoutConfig}
        widgetId={selectedWidget}
      >
        <WidgetRenderer {...props} />
      </AutogrowWidget>
    );
  }

  return <WidgetRenderer {...props} />;
}

AutogrowWidget.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string
  }),
  widgetId: PropTypes.string,
  children: PropTypes.node,
  widgetLayoutConfig: PropTypes.shape({
    colStart: PropTypes.number,
    colEnd: PropTypes.number,
    rowStart: PropTypes.number,
    rowEnd: PropTypes.number,
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number
  }),
  cellHeight: PropTypes.number
};

function AutogrowWidget({
  widgetId,
  children,
  widget,
  widgetLayoutConfig,
  cellHeight
}) {
  const resizeObserverRef = useRef(null);
  const resizeTimeout = useRef(null);

  const { rowEnd, colStart, colEnd } = widgetLayoutConfig;

  const widgetHeightRef = useRef(null);

  const { dispatch } = useContext(BuilderContext);

  function calculateRowCountByHeight(prevHeight, newHeight) {
    let heightDiff = newHeight - prevHeight;
    return Math.round(heightDiff / cellHeight);
  }

  function widgetResizing(prevHeight, newHeight) {
    if (prevHeight !== newHeight) {
      let rowCount = calculateRowCountByHeight(prevHeight, newHeight);
      if (rowCount !== 0) {
        dispatch({
          type: WIDGET_ALIGNEMNT_TYPE.AUTO_GROW,
          colStart,
          colEnd,
          isAutoResize: true,
          rowEnd: rowEnd,
          widgetId: widget.Id,
          updatedRowCount: rowCount
        });
      }
    }
  }

  useEffect(function onMount() {
    dispatch({
      colStart,
      colEnd
    });
  }, []);

  useEffect(() => {
    if (resizeObserverRef.current) {
      widgetHeightRef.current = resizeObserverRef.current.clientHeight;
    }
  }, []);

  useEffect(function resizeObserver() {
    let resizeTimeoutRef = resizeTimeout.current;

    function handleResize(entries) {
      if (resizeTimeoutRef) {
        clearTimeout(resizeTimeoutRef);
      }

      resizeTimeout.current = setTimeout(() => {
        let _height = entries[0].target.clientHeight;

        if (
          widgetHeightRef.current !== 0 &&
          widgetHeightRef.current !== _height
        ) {
          // setWidgetHeight(_height);
          widgetResizing(widgetHeightRef.current, _height);
          widgetHeightRef.current = _height;
        }
      }, 200);
    }

    const observer = new ResizeObserver((entries) => handleResize(entries));
    if (resizeObserverRef.current) {
      observer.observe(resizeObserverRef.current);
    }

    // Cleanup function
    return () => {
      if (resizeTimeoutRef) {
        clearTimeout(resizeTimeoutRef);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div
      style={{ height: "100%" }}
      ref={resizeObserverRef}
      id={`${widgetId}-autogrow`}
    >
      {children}
    </div>
  );
}

WidgetRenderer.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    Type: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      colStart: PropTypes.number,
      colEnd: PropTypes.number,
      rowStart: PropTypes.number,
      rowEnd: PropTypes.number,
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
  marginType: PropTypes.string,
  widgetLayoutConfig: PropTypes.shape({
    colStart: PropTypes.number,
    colEnd: PropTypes.number,
    rowStart: PropTypes.number,
    rowEnd: PropTypes.number,
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number
  }),
  setWidgetLayoutConfig: PropTypes.func
};

function WidgetRenderer({
  selected,
  rowCount,
  cellHeight,
  colCount,
  cellWidth,
  onResize,
  widget,
  widgetLayoutConfig,
  setWidgetLayoutConfig
}) {
  const [isResizing, setIsResizing] = useState(false);

  const resizeDirection = useRef(null);
  const resizeStarting = useRef(null);

  const updatedRowCount = useRef(0);

  const { dispatch } = useContext(BuilderContext);

  const onWindowMouseUp = useCallback(
    function onWindowMouseUp() {
      let { colStart, colEnd } = widget.LayoutConfig;

      if (isResizing) {
        if (
          resizeDirection.current === RESIZE_DIRECTION.BOTTOM &&
          updatedRowCount.current !== 0
        ) {
          dispatch({
            isAutoResize: true,
            type: WIDGET_ALIGNEMNT_TYPE.RESIZING,
            colStart: colStart,
            colEnd: colEnd,
            updatedRowCount: updatedRowCount.current,
            widgetId: widget.Id
          });
        }

        onResize(widget.Id, widgetLayoutConfig, resizeDirection.current);
        setIsResizing(false);
        resizeStarting.current = null;
        resizeDirection.current = null;
      }
    },
    [dispatch, isResizing, onResize, widget.Id, widgetLayoutConfig]
  );

  const onWindowMouseMove = useCallback(
    function onWindowMouseMoveFunction(e) {
      if (isResizing) {
        let { colStart, colEnd, rowStart, rowEnd, colSpan, rowSpan } =
          widget.LayoutConfig;
        // let { minColSpan, minRowSpan } = WIDGETS_CONFIG[widget.Type];
        switch (resizeDirection.current) {
          case RESIZE_DIRECTION.LEFT:
            {
              let widgetStartCol = colStart;
              const diff =
                (window.isRTL ? -1 : 1) * (e.screenX - resizeStarting.current);
              let noOfCol = Math.round(Math.abs(diff) / cellWidth);
              let isLeft = Math.sign(diff) < 0;

              if (isLeft) {
                widgetStartCol = colStart - noOfCol;
                // widget.LayoutConfig.colSpan =
                //   widget.LayoutConfig.colSpan + noOfCol;
              } else {
                widgetStartCol = colStart + noOfCol;
                // widget.LayoutConfig.colSpan =
                //   widget.LayoutConfig.colSpan - noOfCol;
              }

              if (widgetStartCol < 0 || colSpan > colCount || colSpan < 2) {
                return;
              }

              setWidgetLayoutConfig((prevState) => {
                // console.log({ widgetStartCol, prevState });
                let updatedLayout = { ...prevState, colStart: widgetStartCol };
                // console.log(updatedLayout, "updatedLayout");
                return updatedLayout;

                // colSpan: widget.LayoutConfig.colSpan
              });
              dispatch({
                type: WIDGET_ALIGNEMNT_TYPE.RESIZING,
                colStart: widgetStartCol
              });
            }
            break;
          case RESIZE_DIRECTION.TOP:
            {
              let widgetRowStart = rowStart;
              const diff = e.screenY - resizeStarting.current;
              let noOfRow = Math.round(Math.abs(diff) / cellHeight);
              let isTop = Math.sign(diff) < 0;

              if (isTop) {
                widgetRowStart = rowStart - noOfRow;
                // rowSpan = rowSpan + noOfRow;
              } else {
                widgetRowStart = rowStart + noOfRow;
                // rowSpan = rowSpan - noOfRow;
              }

              if (rowStart < 0 || rowSpan > rowCount || rowSpan < 2) {
                return;
              }
              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                rowStart: widgetRowStart
              }));
            }
            break;
          case RESIZE_DIRECTION.RIGHT:
            {
              let widgetColEnd = colEnd;
              const diff =
                (window.isRTL ? -1 : 1) * (e.screenX - resizeStarting.current);
              let noOfCol = Math.round(Math.abs(diff) / cellWidth);
              let isRight = Math.sign(diff) > 0;

              if (isRight) {
                widgetColEnd = colEnd + noOfCol;
                // colSpan = colSpan + noOfCol;
              } else {
                widgetColEnd = colEnd - noOfCol;
                // colSpan = colSpan - noOfCol;
              }

              if (colEnd > colCount || colEnd < colStart) {
                return;
              }

              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                colEnd: widgetColEnd
              }));
              dispatch({
                type: WIDGET_ALIGNEMNT_TYPE.RESIZING,
                colEnd: widgetColEnd
              });
            }
            break;
          case RESIZE_DIRECTION.BOTTOM:
            {
              let widgetRowEnd = rowEnd;

              const diff = e.screenY - resizeStarting.current;
              let noOfRow = Math.round(Math.abs(diff) / cellHeight);
              let isBottom = Math.sign(diff) > 0;

              if (isBottom) {
                widgetRowEnd = rowEnd + noOfRow;
              } else {
                widgetRowEnd = rowEnd - noOfRow;
              }

              if (rowEnd > rowCount || rowEnd < rowStart) {
                return;
              }

              setWidgetLayoutConfig((prevState) => ({
                ...prevState,
                rowEnd: widgetRowEnd
              }));

              updatedRowCount.current = noOfRow;
            }
            break;
          default:
            null;
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cellHeight, cellWidth, colCount, isResizing, rowCount, widget.LayoutConfig]
  );

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

  const { widgetsConfig } = useContext(BuilderContext);

  return (
    <>
      <div className={styles.content} id={widget.Id}>
        <span
          className={styles.widgetTextField}
          style={{ fontSize: "x-small" }}
        >
          {widgetsConfig[widget.Id]?.content
            ? widgetsConfig[widget.Id]?.content
            : ""}
        </span>
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
    </>
  );
}
