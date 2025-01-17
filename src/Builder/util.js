export function getSpanCount(startCell, endCell) {
  return endCell - startCell;
}

function isColumnCollided(updatedWidgetConfig, widgetConfig) {
  return (
    (updatedWidgetConfig.colStart <= widgetConfig.colStart &&
      updatedWidgetConfig.colEnd >= widgetConfig.colStart) ||
    (updatedWidgetConfig.colStart <= widgetConfig.colEnd &&
      updatedWidgetConfig.colEnd >= widgetConfig.colEnd)
  );
}

export function layoutRevalidateAndUpdate(widgetsList, updatedWidgetConfig) {
  let oldWidgetList = [...widgetsList];
  console.log({ widgetsList, updatedWidgetConfig });
  if (updatedWidgetConfig.isAutoResize) {
    oldWidgetList.forEach((widgetInfo) => {
      const { LayoutConfig: widgetConfig } = widgetInfo;
      if (widgetInfo.Id !== updatedWidgetConfig.widgetId) {
        if (isColumnCollided(updatedWidgetConfig, widgetConfig)) {
          console.log("same col widget", widgetInfo.Id);
          widgetInfo.LayoutConfig["rowStart"] =
            widgetInfo.LayoutConfig["rowStart"] +
            updatedWidgetConfig.increasedRowCount;

          widgetInfo.LayoutConfig["rowEnd"] =
            widgetInfo.LayoutConfig["rowEnd"] +
            updatedWidgetConfig.increasedRowCount;
        } else {
          console.log("diff col widget", widgetInfo.Id);
        }
      }
    });
  }

  return oldWidgetList;
}
