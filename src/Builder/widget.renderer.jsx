import {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
  useContext
} from "react";
import PropTypes from "prop-types";
import { useDraggable } from "@dnd-kit/core";

import styles from "./builder.module.css";
import { RESIZE_DIRECTION } from "./constant";
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
  marginType,
  cardChildHeight
}) {
  return widgets.map((widget) => {
    return (
      <WidgetCell
        cardChildHeight={cardChildHeight}
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
  marginType,
  cardChildHeight
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

  const { colEnd, colStart, rowEnd, rowStart } = widgetLayoutConfig;

  const widgetColspan = widgetLayoutConfig.colSpan();
  const widgetRowSpan = widgetLayoutConfig.rowSpan();

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
              // console.log("move left", diff, noOfRow, isTop);
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
              // console.log("move right", diff, noOfCol, isRight);
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
              // console.log("move bottom", diff, noOfRow, isBottom);
            }
            break;
          default:
            null;
        }
      }
    },
    [cellHeight, cellWidth, colCount, isResizing, rowCount, widget.LayoutConfig]
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

  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      let check = {
        top: `${rowStart * cellHeight}px`,
        left: `${colStart * cellWidth}px`,
        width: `${widgetColspan * cellWidth}px`,
        height: `${widgetRowSpan * cellHeight}px`
      };
      return check;
    },
    [rowStart, cellHeight, colStart, cellWidth, widgetColspan, widgetRowSpan]
  );

  const resizeObserverRef = useRef(null);
  const resizeTimeout = useRef(null);

  const widgetHeightRef = useRef(null);

  const { state, dispatch } = useContext(BuilderContext);

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
      }, 2000);
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

  function calculateRowCountByHeight(prevHeight, newHeight) {
    let heightDiff = Math.abs(newHeight - prevHeight);
    return heightDiff / cellHeight;
  }

  function widgetResizing(prevHeight, newHeight) {
    let increasedRowCount = calculateRowCountByHeight(prevHeight, newHeight);

    dispatch({
      isAutoResize: true,
      colStart,
      colEnd,
      widgetId: widget.Id,
      increasedRowCount: increasedRowCount
    });
  }

  return (
    <div
      className={`${styles.widgetCell} ${selected ? styles.selected : ""} ${
        marginType === "default" ? styles.defaultMargin : ""
      }`}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties

        /* auto grow poc */
        // height: "auto"
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
        {`H: ${widgetHeightRef ? widgetHeightRef.current : ""}`}
        {/* /* auto grow poc */}
        {/* {widget.Type === WIDGETS_TYPE.CARD && (
          <div className={styles.growableChildrenWrapper}>
            <input value={value} onChange={(e) => setValue(e.target.value)} />
            <div
              style={{ height: cardChildHeight }}
              className={styles.growableChildren}
            />
          </div>
        )} */}

        {/* /* auto grow poc */}
      </div>
      <div
        className={`${styles.overlayContainer} ${
          isResizing ? styles.resizing : ""
        }`}
        ref={resizeObserverRef}
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
