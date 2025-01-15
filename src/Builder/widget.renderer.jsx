import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useDraggable } from "@dnd-kit/core";

import styles from "./builder.module.css";
import { RESIZE_DIRECTION, WIDGETS_CONFIG, WIDGETS_TYPE } from "./constant";

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

  const [value, setValue] = useState("100px");

  return (
    <div
      className={`${styles.widgetCell} ${selected ? styles.selected : ""} ${
        marginType === "default" ? styles.defaultMargin : ""
      }`}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties,

        /* auto grow poc */
        height: "auto"
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

        {/* /* auto grow poc */}
        {widget.Type === WIDGETS_TYPE.CARD && (
          <div className={styles.growableChildrenWrapper}>
            <input value={value} onChange={(e) => setValue(e.target.value)} />
            <div
              style={{ height: cardChildHeight }}
              className={styles.growableChildren}
            />
          </div>
        )}

        {/* /* auto grow poc */}
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
