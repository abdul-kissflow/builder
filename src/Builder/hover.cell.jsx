import { useContext, useMemo } from "react";

import PropTypes from "prop-types";

import styles from "./builder.module.css";
import { BuilderContext } from "./context";

export function HoverCell({
  colStart,
  rowStart,
  rowSpan,
  colSpan,
  cellHeight,
  cellWidth
}) {
  const { widgetsConfig, selectedWidget } = useContext(BuilderContext);
  const isAuto = widgetsConfig[selectedWidget.Id]?.heightType === "auto";

  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${rowStart * cellHeight}px`,
        left: `${colStart * cellWidth}px`,
        width: `${colSpan * cellWidth}px`,
        height: !isAuto ? `${rowSpan * cellHeight}px` : "auto"
      };
    },
    [cellHeight, cellWidth, colSpan, colStart, isAuto, rowSpan, rowStart]
  );

  if (isNaN(colStart) || isNaN(rowStart) || isNaN(colSpan) || isNaN(rowSpan)) {
    return null;
  }

  return (
    <span
      className={styles.hoverCell}
      style={{
        position: "absolute",
        ...widgetAlignmentProperties
        // gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      id="hoverCell"
    ></span>
  );
}

HoverCell.propTypes = {
  colStart: PropTypes.number,
  rowStart: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number,
  cellHeight: PropTypes.number,
  cellWidth: PropTypes.number
};
