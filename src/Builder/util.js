export function getSpanCount(startCell, endCell) {
  return endCell - startCell;
}

function isColumnCollided(updatedWidgetConfig, widgetConfig) {
  let isAbove = widgetConfig.rowEnd <= updatedWidgetConfig.rowStart;

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
  updatedWidgetConfig,
  dispatch
) {
  let oldWidgetList = [...widgetsList];

  let colRangeStart = updatedWidgetConfig.colStart;
  let colRangeEnd = updatedWidgetConfig.colEnd;

  if (updatedWidgetConfig.isAutoResize) {
    oldWidgetList.forEach((widgetInfo) => {
      const { LayoutConfig: widgetConfig } = widgetInfo;

      if (widgetInfo.Id !== updatedWidgetConfig.widgetId) {
        if (
          isColumnCollided(
            {
              colStart: colRangeStart,
              colEnd: colRangeEnd,
              ...updatedWidgetConfig
            },
            widgetConfig
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

          widgetInfo.LayoutConfig["rowStart"] =
            widgetInfo.LayoutConfig["rowStart"] +
            updatedWidgetConfig.updatedRowCount;

          widgetInfo.LayoutConfig["rowEnd"] =
            widgetInfo.LayoutConfig["rowEnd"] +
            updatedWidgetConfig.updatedRowCount;
        } else {
          console.log("diff col widget", widgetInfo.Id);
        }
      }
    });
    dispatch({ type: "STOP" });
  }

  return oldWidgetList;
}
