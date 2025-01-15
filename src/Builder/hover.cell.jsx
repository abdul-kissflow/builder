import { useMemo } from "react";

import PropTypes from "prop-types";

import styles from "./builder.module.css";

export function HoverCell({
  col,
  row,
  rowSpan = 1,
  colSpan = 1,
  cellHeight,
  cellWidth
}) {
  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      return {
        top: `${row * cellHeight}px`,
        left: `${col * cellWidth}px`,
        width: `${colSpan * cellWidth}px`,
        height: `${rowSpan * cellHeight}px`
      };
    },
    [row, cellHeight, col, cellWidth, colSpan, rowSpan]
  );

  if (isNaN(col) || isNaN(row)) {
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
    />
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
