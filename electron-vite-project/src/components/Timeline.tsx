import React, { useState } from 'react';
import './Timeline.css';

interface RedBox {
  index: number;
  left: number;
  width: number;
}

const MyTimeline: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [redBoxes, setRedBoxes] = useState<RedBox[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedBox, setDraggedBox] = useState<RedBox  | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number  | null>(null);

  const handleCellClick = (cellIndex: number) => {
    const foundBox = redBoxes.find((box) => box.index === cellIndex);

    if (foundBox) {
      // Wenn auf eine vorhandene rote Box geklickt wurde, entferne sie
      //setRedBoxes(redBoxes.filter((box) => box.index !== cellIndex));
    } else {
      // Klicke auf neue Zelle, füge rote Box hinzu
      setRedBoxes([...redBoxes, { index: cellIndex, left: 0, width: 32 }]);
    }
    setSelectedCell(cellIndex);
  };

  const handleLeftDrag = (event: React.MouseEvent<HTMLDivElement>, boxIndex: number) => {
    setIsDragging(true);
  
    const startX = event.clientX;
    const foundBox = redBoxes.find((box) => box.index === boxIndex);
    const startLeft = foundBox?.left || 0;
    const startWidth = foundBox?.width || 32;
  
    const handleMouseMove = (event: MouseEvent) => {
      const diffX = event.clientX - startX;
      const newLeft = startLeft + diffX;
      const newWidth = startWidth - diffX;
  
      if (newWidth >= 32 && newWidth % 32 === 0) {
        setRedBoxes(
          redBoxes.map((box) => {
            if (box.index === boxIndex) {
              return { ...box, left: newLeft, width: newWidth };
            }
            return box;
          })
        );
      }
    };
  
    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  const handleRightDrag = (event: React.MouseEvent<HTMLDivElement>, boxIndex: number) => {
    setIsDragging(true);

    const startX = event.clientX;
    const foundBox = redBoxes.find((box) => box.index === boxIndex);
    const startWidth = foundBox?.width || 32;

    const handleMouseMove = (event: MouseEvent) => {
      const diffX = event.clientX - startX;
      const newWidth = startWidth + diffX;

      if (newWidth >= 32 && newWidth % 32 === 0) {
        setRedBoxes(redBoxes.map((box) => (box.index === boxIndex ? { ...box, width: newWidth } : box)));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDragStart = (cellIndex: number) => {
    if (!isDragging) {
      const foundBox = redBoxes.find((box) => box.index === cellIndex);
      if (foundBox) {
        setDraggedBox(foundBox);
      }
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    setHoveredCell(cellIndex);
  };

  const handleDrop = (cellIndex: number) => {
    if (draggedBox === null) return;
  
    // Verschiebe die rote Box von der ursprünglichen Zelle zur neuen Zelle
    const updatedBoxes = redBoxes.map((box) => {
      if (box.index === draggedBox.index) {
        return { ...box, index: cellIndex, left: 0 }; // Setze die linke Position auf 0 für die neue Zelle
      }
      return box;
    });
    setRedBoxes(updatedBoxes);
  
    setDraggedBox(null);
    setHoveredCell(null);
  };

  return (
    <table className="grid-container">
      <tbody>
        {Array(4).fill(null).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array(50).fill(null).map((_, colIndex) => {
              const cellIndex = rowIndex * 50 + colIndex;
              const isCellSelected = selectedCell === cellIndex;
              const foundBox = redBoxes.find((box) => box.index === cellIndex);
              const isCellRed = !!foundBox;
              const isCellDragged = draggedBox?.width === cellIndex;
              const isCellHovered = hoveredCell === cellIndex;

              return (
                <td
                  className={`grid-cell ${isCellSelected ? 'selected' : ''} ${isCellHovered ? 'drag-over' : ''}`}
                  onMouseEnter={() => setSelectedCell(cellIndex)}
                  onClick={() => handleCellClick(cellIndex)}
                  onDragStart={() => handleDragStart(cellIndex)}
                  onDragOver={(event) => handleDragOver(event, cellIndex)}
                  onDrop={() => handleDrop(cellIndex)}
                  draggable={!isDragging}
                  key={cellIndex}
                >
                  {isCellRed && (
                    <div
                      className={`red-box ${isCellDragged ? 'dragged' : ''}`}
                      style={{ left: `${foundBox?.left}px`, width: `${foundBox?.width}px` }}
                      draggable={isCellDragged}
                      onDragStart={(event) => handleDragStart(cellIndex)}
                    >
                      <div
                        className="red-box-handle-left"
                        onMouseDown={(event) => handleLeftDrag(event, cellIndex)}
                      />
                      <div
                        className="red-box-handle-right"
                        onMouseDown={(event) => handleRightDrag(event, cellIndex)}
                      />
                      <div className="red-box-content">{/* Inhalt der roten Box */}</div>
                    </div>
                  )}
                  {isCellHovered && draggedBox && (
                    <div
                      className="gray-box"
                      style={{ width: `${draggedBox.width}px` }}
                    />
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MyTimeline;
