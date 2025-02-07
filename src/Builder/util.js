import { WIDGET_ALIGNEMNT_TYPE } from "./constant";

export function getSpanCount(startCell, endCell) {
  return endCell - startCell;
}

function isColumnCollided(updatedWidgetConfig, widgetConfig) {
  let isAbove = updatedWidgetConfig.rowStart >= widgetConfig.rowEnd;

  let isLeft = widgetConfig.colEnd <= updatedWidgetConfig.colStart;

  let isRight = widgetConfig.colStart >= updatedWidgetConfig.colEnd;

  if (isAbove || isLeft || isRight) {
    return false;
  }

  return true;
}

function updateColumnRange(prevColRange, widgetColRange) {
  let { colRangeStart, colRangeEnd } = prevColRange;
  let { widgetColRangeStart, widgetColRangeEnd } = widgetColRange;

  let colStart = colRangeStart;
  let colEnd = colRangeEnd;

  let newColStart = widgetColRangeStart;
  let newColEnd = widgetColRangeEnd;

  if (newColStart < colStart) {
    colStart = newColStart;
  }

  if (newColEnd > colEnd) {
    colEnd = newColEnd;
  }

  return {
    colStart,
    colEnd
  };
}

export function layoutRevalidateAndUpdate(
  widgetsList,
  realignedWidgetConfig,
  dispatch
) {
  let oldWidgetList = [...widgetsList];

  let updatedWidgetConfig = { ...realignedWidgetConfig };

  let colRangeStart = updatedWidgetConfig.colStart;
  let colRangeEnd = updatedWidgetConfig.colEnd;
  let rowCount = updatedWidgetConfig.updatedRowCount;

  if (updatedWidgetConfig.isAutoResize) {
    oldWidgetList.forEach((widgetInfo) => {
      const { LayoutConfig: widgetConfig } = widgetInfo;

      if (widgetInfo.Id !== updatedWidgetConfig.widgetId) {
        if (
          isColumnCollided(
            {
              ...updatedWidgetConfig,
              colStart: colRangeStart,
              colEnd: colRangeEnd
            },
            { ...widgetConfig, id: widgetInfo.Id },
            updatedWidgetConfig.type === WIDGET_ALIGNEMNT_TYPE.BELOW_MIDPOINT &&
              updatedWidgetConfig.rowEnd < widgetConfig.rowStart
          )
        ) {
          let { colStart, colEnd } = updateColumnRange(
            { colRangeStart, colRangeEnd },
            {
              widgetColRangeStart: widgetConfig.colStart,
              widgetColRangeEnd: widgetConfig.colEnd
            }
          );

          colRangeStart = colStart;
          colRangeEnd = colEnd;

          if (
            updatedWidgetConfig.type === WIDGET_ALIGNEMNT_TYPE.CROSS_RESIZING ||
            updatedWidgetConfig.type === WIDGET_ALIGNEMNT_TYPE.RESIZING ||
            updatedWidgetConfig.type === WIDGET_ALIGNEMNT_TYPE.WIDGET_DROPPED ||
            updatedWidgetConfig.type === WIDGET_ALIGNEMNT_TYPE.BELOW_MIDPOINT
          ) {
            let shouldMove = shouldMoveCollideddWidget(
              updatedWidgetConfig,
              widgetInfo.LayoutConfig
            );

            if (shouldMove) {
              let rowValueToMove = updatedWidgetConfig.rowEnd;

              let noOfRows = rowValueToMove - widgetInfo.LayoutConfig.rowStart;

              rowCount = noOfRows;
              colRangeEnd = widgetInfo.LayoutConfig.colEnd;
              colRangeStart = widgetInfo.LayoutConfig.colStart;
              updatedWidgetConfig.type = "UPDATE_REMAINING_WIDGETS";
            }
          }

          widgetInfo.LayoutConfig["rowStart"] =
            widgetInfo.LayoutConfig["rowStart"] + rowCount;

          widgetInfo.LayoutConfig["rowEnd"] =
            widgetInfo.LayoutConfig["rowEnd"] + rowCount;
        } else {
          // console.log("diff col widget", widgetInfo.Id);
        }
      }
    });
    dispatch({ type: "STOP" });
  }

  return oldWidgetList;
}

// COMMON UTILS

function shouldMoveCollideddWidget(resizingWidget, collidedWidget) {
  return (
    (resizingWidget.rowStart <= collidedWidget.rowStart &&
      resizingWidget.rowEnd >= collidedWidget.rowStart) ||
    (resizingWidget.rowStart <= collidedWidget.rowEnd &&
      resizingWidget.rowEnd >= collidedWidget.rowEnd) ||
    (resizingWidget.rowStart > collidedWidget.rowStart &&
      resizingWidget.rowEnd < collidedWidget.rowEnd)
  );
}

export function getCollisionRowCountFromBottom(
  intersectedWidgetPosition,
  draggingWidgetPosition,
  rowHeight
) {
  const { bottom: intersectedWidgetBottom } = intersectedWidgetPosition;
  const { top: draggingWidgetTop } = draggingWidgetPosition;

  let updatedRowCount = 0;

  if (intersectedWidgetBottom > draggingWidgetTop) {
    updatedRowCount = Math.ceil(
      (intersectedWidgetBottom - draggingWidgetTop) / rowHeight
    );
  }

  return updatedRowCount;
}

export function getCollisionRowCountFromTop(
  intersectedWidgetPosition,
  draggingWidgetPosition,
  rowHeight
) {
  const { top: intersectedWidgetTop } = intersectedWidgetPosition;
  const { bottom: draggingWidgetBottom } = draggingWidgetPosition;

  let updatedRowCount = 0;

  if (intersectedWidgetTop < draggingWidgetBottom) {
    updatedRowCount = Math.ceil(
      (draggingWidgetBottom - intersectedWidgetTop) / rowHeight
    );
  }

  return updatedRowCount;
}
