import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  closestCorners
} from "@dnd-kit/core";
import styles from "./builder.module.css";

const COLUMN_COUNT = 12;
const ROW_COUNT = 12;

const WIDGETS_LIST = [
  {
    Name: "Input",
    Id: "input"
  },
  {
    Name: "Dropdown",
    Id: "dropdown"
  },
  {
    Name: "Icon",
    Id: "icon"
  }
];

const INITIAL_LAYOUT_WIDGETS = [
  {
    Name: "Input",
    Id: "input_1",
    WidgetId: "input",
    LayoutConfig: {
      col: 0,
      row: 0,
      rowSpan: 2,
      colSpan: 2
    }
  }
];

// let WIDGET_MAP = Array.from({ length: COLUMN_COUNT * ROW_COUNT }).reduce(
//   (arr, _, index) => {
//     let cellCol = index % COLUMN_COUNT;
//     let cellRow = Math.floor(index / ROW_COUNT);
//     arr[`${cellCol}_${cellRow}`] = "";
//     return arr;
//   },
//   {}
// );

export function Builder() {
  const [layoutWidgets, setLayoutWidgets] = useState(INITIAL_LAYOUT_WIDGETS);

  const [isDragging, setIsDragging] = useState(false);
  const [hoverDetail, setHoverDetail] = useState({});
  const [activeWidget, setActiveWidget] = useState({});

  // const widgetCellMap = useMemo(
  //   function getWidgetCellMap() {
  //     layoutWidgets.forEach(({ Id, LayoutConfig }) => {
  //       let { col, row, rowSpan, colSpan } = LayoutConfig;

  //       let keys = [];
  //       if (colSpan > 1) {
  //         Array.from({ length: colSpan }).forEach((_, index) => {
  //           keys.push(`${col + index}_${row}`);
  //         });
  //       }
  //       if (rowSpan > 1) {
  //         Array.from({ length: rowSpan }).forEach((_, index) => {
  //           keys.push(`${col}_${row + index}`);
  //         });
  //       }
  //       if (colSpan === 1 && rowSpan === 1) {
  //         keys.push(`${col}_${row}`);
  //       }
  //       keys.forEach((key) => (WIDGET_MAP[key] = Id));
  //     });
  //     console.log("WIDGET_MAP", WIDGET_MAP);
  //     return WIDGET_MAP;
  //   },
  //   [layoutWidgets]
  // );

  const widgetColMap = useMemo(
    function getWidgetColMap() {
      let colMap = Array.from({ length: COLUMN_COUNT }).map(() =>
        Array.from({ length: ROW_COUNT }).map(() => null)
      );
      layoutWidgets.forEach(({ Id, LayoutConfig }) => {
        let { col, row, rowSpan, colSpan } = LayoutConfig;

        if (colSpan > 1) {
          Array.from({ length: colSpan }).forEach((_, i) => {
            if (rowSpan > 1) {
              Array.from({ length: rowSpan }).forEach((_, j) => {
                colMap[col + i][row + j] = Id;
              });
            } else {
              colMap[col + i][row] = Id;
            }
          });
        }
        if (rowSpan > 1) {
          Array.from({ length: rowSpan }).forEach((_, i) => {
            if (colSpan > 1) {
              Array.from({ length: colSpan }).forEach((_, j) => {
                colMap[col + j][row + i] = Id;
              });
            } else {
              colMap[col][row + i] = Id;
            }
          });
        }
        if (colSpan === 1 && rowSpan === 1) {
          colMap[col][row] = Id;
        }
      });
      console.log("widgetColMap trigerred");
      return colMap;
    },
    [layoutWidgets]
  );

  // const hoverRowLimit = useMemo(
  //   function getHoverRowLimit() {
  //     let hoverLimit = Array.from({ length: COLUMN_COUNT }).map(() => 0);
  //     layoutWidgets.forEach(({ LayoutConfig }) => {
  //       let { col, row, rowSpan, colSpan } = LayoutConfig;
  //       let rowLimit = row + rowSpan;
  //       if (rowLimit > hoverLimit[col]) {
  //         if (colSpan > 1) {
  //           Array.from({ length: colSpan }).forEach((_, index) => {
  //             hoverLimit[col + index] = rowLimit;
  //           });
  //         } else {
  //           hoverLimit[col] = rowLimit;
  //         }
  //       }
  //     });
  //     console.log("hoverRowLimit", hoverLimit);
  //     return hoverLimit;
  //   },
  //   [layoutWidgets]
  // );

  const tempWidgetColMap = useRef(null);
  const originLayoutWidgets = useRef(null);
  const layoutWidgetsChanged = useRef(false);

  function handleDragStart(e) {
    console.log("start", e, e.active.rect.current);
    setIsDragging(true);
    setActiveWidget({ ...e.active.data.current.widget });
    let newLayoutWidgets = [...layoutWidgets];
    if (e.active?.data.current.type === "DragWidgetCell") {
      newLayoutWidgets = newLayoutWidgets.filter(
        ({ Id }) => Id !== e.active?.data.current.widget.Id
      );
      setLayoutWidgets(newLayoutWidgets);
    }
    tempWidgetColMap.current = widgetColMap;
    originLayoutWidgets.current = newLayoutWidgets;
  }

  function getFilledColMap(colMap) {
    let lastWidgetIndex = colMap.findLastIndex((item) => item !== null);
    let filledColMap =
      lastWidgetIndex !== -1 ? colMap.slice(0, lastWidgetIndex + 1) : [];
    return filledColMap;
  }

  function getMovableCell({ col, row, rowSpan, colSpan }) {
    let movableRow = row + rowSpan > ROW_COUNT ? ROW_COUNT - rowSpan : row;
    let movableCol =
      col + colSpan > COLUMN_COUNT ? COLUMN_COUNT - colSpan : col;
    return { movableRow, movableCol };
  }

  function handleDragOver(e) {
    console.log("over", e);
    if (!e.over) {
      return;
    }
    // if (e.over?.data.current.type === "AddCell") {
    //   console.log("over cell", e.over.data.current.cell);
    //   let { rowSpan = 1, colSpan = 1 } = activeWidget?.LayoutConfig || {};
    //   let { col } = e.over.data.current.cell;
    //   let row = hoverRowLimit[col];
    //   if (colSpan) {
    //     row = Math.max(...hoverRowLimit.slice(col, col + colSpan));
    //   }
    //   setHoverCell({ row, col, rowSpan, colSpan });
    // }
    if (e.over?.data.current.type === "AddCell") {
      let { rowSpan = 1, colSpan = 1 } = activeWidget?.LayoutConfig || {};
      let { col, row } = e.over.data.current.cell;
      let overWidgetId = tempWidgetColMap.current[col][row];
      let newLayoutWidgets = [...layoutWidgets];
      tempWidgetColMap.current[hoverDetail.col] = widgetColMap[hoverDetail.col];
      if (col !== hoverDetail.col && layoutWidgetsChanged) {
        newLayoutWidgets = [...originLayoutWidgets.current];
        setLayoutWidgets(newLayoutWidgets);
        layoutWidgetsChanged.current = false;
      }
      let currentColMap = getFilledColMap(tempWidgetColMap.current[col]);
      console.log("over cell", e.over.data.current.cell, currentColMap);
      if (overWidgetId || row < currentColMap.length) {
        let firstFreeIndex = currentColMap.findIndex((i) => i === null);
        if (firstFreeIndex !== -1) {
          const { movableRow, movableCol } = getMovableCell({
            row: firstFreeIndex,
            col,
            rowSpan,
            colSpan
          });
          setHoverDetail({
            row: movableRow,
            col: movableCol,
            rowSpan,
            colSpan
          });
        } else {
          let slideWidgetIndex = currentColMap.findIndex(
            (id) => id === overWidgetId
          );
          let movableRowIndex = slideWidgetIndex;

          let slideWidgets = currentColMap.slice(slideWidgetIndex);

          const { movableRow, movableCol } = getMovableCell({
            row: movableRowIndex,
            col,
            rowSpan,
            colSpan
          });
          console.log("isOver widget", slideWidgets, movableRow, movableCol);
          newLayoutWidgets = newLayoutWidgets.map((widget) => {
            if (slideWidgets.includes(widget.Id)) {
              const newLayoutConfig = {
                ...widget.LayoutConfig,
                row: row + rowSpan
              };
              return { ...widget, LayoutConfig: newLayoutConfig };
            }
            return widget;
          });
          setHoverDetail({
            row: movableRow,
            col: movableCol,
            rowSpan,
            colSpan
          });
          console.log(
            "over layoutWidgets",
            newLayoutWidgets,
            tempWidgetColMap.current[col]
          );
          layoutWidgetsChanged.current = true;
          setLayoutWidgets(newLayoutWidgets);
        }
      } else {
        let hoverRow = currentColMap.length;
        let otherColMaps = tempWidgetColMap.current
          .slice(col, col + colSpan)
          .map((colMap) => {
            return getFilledColMap(colMap);
          });
        if (colSpan) {
          hoverRow = Math.max(...otherColMaps.map((colMap) => colMap.length));
        }
        const { movableRow, movableCol } = getMovableCell({
          row: hoverRow,
          col,
          rowSpan,
          colSpan
        });
        setHoverDetail({
          row: movableRow,
          col: movableCol,
          rowSpan,
          colSpan
        });
        console.log("hover", hoverRow);
      }
    }
  }

  function handleDragEnd(e) {
    console.log("end", e);
    const { over, active } = e;
    if (over && over?.data.current.type === "AddCell") {
      let type = active?.data.current.type;
      let currentWidget = type ? active.data.current.widget : activeWidget;
      let { colSpan: widgetColSpan, rowSpan: widgetRowSpan } =
        activeWidget?.LayoutConfig || {};
      let { col, row, colSpan, rowSpan } = hoverDetail;
      const newLayoutWidgets = [
        ...layoutWidgets,
        {
          ...currentWidget,
          WidgetId: currentWidget.WidgetId || currentWidget.Id,
          Id: type
            ? `${currentWidget.Id}_${layoutWidgets.length + 1}`
            : currentWidget.Id,
          LayoutConfig: {
            col,
            colSpan: widgetColSpan || colSpan,
            rowSpan: widgetRowSpan || rowSpan,
            row: row
          }
        }
      ];
      console.log("layoutWidgets", newLayoutWidgets);

      setLayoutWidgets(newLayoutWidgets);
    }
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

  function handleDragCancel(e) {
    console.log("cancel", e);
    setIsDragging(false);
    setActiveWidget({});
    setHoverDetail({});
  }

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={closestCorners}
    >
      <div className={styles.mainContainer}>
        <LeftNav />
        <div
          className={`${styles.container} ${
            isDragging ? styles.isDragging : ""
          }`}
        >
          <Cells colCount={COLUMN_COUNT} rowCount={ROW_COUNT} />
          <LayoutWidgets widgets={layoutWidgets} />
          <HoverCell {...hoverDetail} />
        </div>
      </div>
      <DragOverlay dropAnimation={null}>
        {activeWidget.Id ? (
          activeWidget.LayoutConfig ? (
            <WidgetCell widget={activeWidget} isOverlay={true} />
          ) : (
            <Widget widget={activeWidget} isOverlay={true} />
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function Cells({ colCount, rowCount }) {
  let cells = rowCount * colCount;

  return Array.from({ length: cells }).map((_, index) => {
    let cellCol = index % colCount;
    let cellRow = Math.floor(index / rowCount);
    return <Cell key={index} col={cellCol} row={cellRow} />;
  });
}

function Cell({ col, row, rowSpan = 1, colSpan = 1 }) {
  const { setNodeRef } = useDroppable({
    id: `${col}_${row}`,
    data: {
      cell: {
        col,
        row,
        rowSpan,
        colSpan
      },
      type: "AddCell"
    }
  });

  return (
    <span
      ref={setNodeRef}
      className={styles.cell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
    >
      <label>c:{col}</label>
      <label>r:{row}</label>
    </span>
  );
}

Cell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number
};

function HoverCell({ col, row, rowSpan = 1, colSpan = 1 }) {
  if (isNaN(col) || isNaN(row)) {
    return null;
  }
  return (
    <span
      className={styles.hoverCell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
    >
      <label>c:{col}</label>
      <label>r:{row}</label>
    </span>
  );
}

HoverCell.propTypes = {
  col: PropTypes.number,
  row: PropTypes.number,
  rowSpan: PropTypes.number,
  colSpan: PropTypes.number
};

function LeftNav() {
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
    >
      <label>Widget</label>
      <label>{widget.Name}</label>
    </div>
  );
}

Widget.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string
  }),
  isOverlay: PropTypes.bool
};

function LayoutWidgets({ widgets }) {
  return widgets.map((widget) => {
    return <WidgetCell key={widget.Id} widget={widget} />;
  });
}

function WidgetCell({ widget }) {
  const { col, row, rowSpan, colSpan } = widget.LayoutConfig;
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: widget.Id,
    data: {
      widget,
      type: "DragWidgetCell"
    }
  });

  return (
    <div
      className={styles.widgetCell}
      style={{
        gridArea: `${row + 1} / ${col + 1} / span ${rowSpan} / span ${colSpan}`
      }}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
    >
      <label>Widget</label>
      <label>{widget.Id}</label>
    </div>
  );
}

WidgetCell.propTypes = {
  widget: PropTypes.shape({
    Id: PropTypes.string,
    Name: PropTypes.string,
    LayoutConfig: PropTypes.shape({
      col: PropTypes.number,
      row: PropTypes.number,
      rowSpan: PropTypes.number,
      colSpan: PropTypes.number
    })
  })
};
