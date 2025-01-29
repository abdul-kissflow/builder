import PropTypes from "prop-types";
import styles from "./builder.module.css";

export function DragWidget({ widget }) {
  return (
    <div
      className={styles.widgetCell}
      style={{
        width: "100%",
        height: " 100%"
      }}
    >
      <div className={styles.content}>
        <label>{widget.Id}</label>
      </div>
    </div>
  );
}

DragWidget.propTypes = {
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
  hoverDetail: PropTypes.shape({
    col: PropTypes.number,
    row: PropTypes.number,
    rowSpan: PropTypes.number,
    colSpan: PropTypes.number
  }),
  config: PropTypes.object
};
