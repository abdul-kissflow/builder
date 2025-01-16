import { useMemo } from "react";

import PropTypes from "prop-types";

import styles from "./builder.module.css";

export function HoverCell({
  colStart,
  rowStart,
  colEnd,
  rowEnd,
  cellHeight,
  cellWidth
}) {
  const widgetAlignmentProperties = useMemo(
    function getWidgetAlignemntProperties() {
      let totalColumnOccupied = rowEnd - rowStart;
      let totalRowOccupied = colEnd - colStart;
      return {
        top: `${colStart * cellHeight}px`,
        left: `${rowStart * cellWidth}px`,
        width: `${totalColumnOccupied * cellWidth}px`,
        height: `${totalRowOccupied * cellHeight}px`
      };
    },
    [cellHeight, cellWidth, colEnd, colStart, rowEnd, rowStart]
  );

  if (isNaN(colStart) || isNaN(rowStart)) {
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
