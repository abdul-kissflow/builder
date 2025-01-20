export function getSpanCount(startCell, endCell) {
  return endCell - startCell;
}

function isColumnCollided(updatedWidgetConfig, widgetConfig) {
  return (
    (updatedWidgetConfig.rowEnd < widgetConfig.rowStart &&
      updatedWidgetConfig.colStart <= widgetConfig.colStart &&
      updatedWidgetConfig.colEnd >= widgetConfig.colStart) ||
    (updatedWidgetConfig.rowEnd < widgetConfig.rowStart &&
      updatedWidgetConfig.colStart <= widgetConfig.colEnd &&
      updatedWidgetConfig.colEnd >= widgetConfig.colEnd)
  );
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
              rowEnd: updatedWidgetConfig.rowEnd,
              colStart: colRangeStart,
              colEnd: colRangeEnd
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
    dispatch({ type: "STOP", updatedRowCount: 0, isAutoResize: false });
  }

  return oldWidgetList;
}
