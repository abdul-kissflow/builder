import { useMemo } from "react";

import PropTypes from "prop-types";

import styles from "./builder.module.css";

export function HoverCell({
  colStart,
  rowStart,
  colEnd,
  rowEnd,
  rowSpan,
  colSpan,
  cellHeight,
  cellWidth
}) {
  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${rowStart * cellHeight}px`,
        left: `${colStart * cellWidth}px`,
        width: `${colSpan * cellWidth}px`,
        height: `${rowSpan * cellHeight}px`
      };
    },
    [cellHeight, cellWidth, colSpan, colStart, rowSpan, rowStart]
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
    >
      hai
    </span>
  );
}

HoverCell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number,
  cellHeight: PropTypes.number,
  cellWidth: PropTypes.number
};
