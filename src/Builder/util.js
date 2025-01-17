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
  }

  return oldWidgetList;
}
