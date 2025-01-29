import { useDraggable } from "@dnd-kit/core";

import { WIDGETS_LIST } from "./constant";

import PropTypes from "prop-types";
import styles from "./builder.module.css";

export function LeftNav() {
  return (
    <div className={styles.leftNav}>
      {WIDGETS_LIST.map((widget) => (
        <Widget key={widget.Id} widget={widget} />
      ))}
    </div>
  );
}

function Widget({ widget, isOverlay }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidget"
    }
  });

  return (
    <div
      className={`${styles.widget} 
          ${isDragging ? styles.isDragActive : ""}
          ${isOverlay ? styles.isOverlay : ""}`}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      id={widget.Id}
    >
      <label>Widget</label>
      <label>{widget.Name}</label>
    </div>
  );
}

Widget.propTypes = {
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
  isOverlay: PropTypes.bool
};
