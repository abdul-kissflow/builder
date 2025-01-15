import { memo } from "react";

import { useDroppable } from "@dnd-kit/core";
import PropTypes from "prop-types";

export const DroppableArea = memo(DroppableAreaComponent);

function DroppableAreaComponent({ colCount, rowCount, rowHeight }) {
  const { setNodeRef } = useDroppable({
    id: `container001`,
    data: {
      id: "container001",
      type: "AddCell"
    }
  });

  return (
    <div
      ref={setNodeRef}
      id={"container001"}
      style={{
        height: "100%",
        width: "100%",
        backgroundImage: `linear-gradient(rgb(220 229 234), rgb(220 229 234)), linear-gradient(0deg, rgb(220 229 234) 1px, transparent 1px, transparent 100%), linear-gradient(rgb(220 229 234), rgb(220 229 234)), linear-gradient(90deg, rgb(220 229 234) 1px, transparent 1px, transparent 100%)`,
        backgroundPosition: `0px 0px, 0px 0px, 100% 0px, 0px 0px`,
        backgroundSize: `100% 1px, 100% ${rowHeight}px, 1px 100%, calc(100% / ${colCount}) 100%`,
        backgroundRepeat: `no-repeat, repeat-y, no-repeat, repeat-x`,
        gridArea: `1 / 1 / span ${rowCount} / span ${colCount}`
      }}
    ></div>
  );
}

DroppableAreaComponent.propTypes = {
  colCount: PropTypes.number,
  rowCount: PropTypes.number,
  rowHeight: PropTypes.number
};
