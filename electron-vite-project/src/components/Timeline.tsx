/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 *
 * @file Timeline.tsx
 */
import React, { useState } from 'react';
import './Timeline.css';

interface RedBox {
  index: number;
  left: number;
  width: number;
}

const MyTimeline: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null); // vorraussichtlich überflüssig
  const [redBoxes, setRedBoxes] = useState<RedBox[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [draggedBox, setDraggedBox] = useState<RedBox | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const handleCellClick = (cellIndex: number) => {
    const foundBox = redBoxes.find((box) => box.index === cellIndex);

    if (foundBox) {
      // Wenn auf eine vorhandene rote Box geklickt wurde, entferne sie
      //setRedBoxes(redBoxes.filter((box) => box.index !== cellIndex));
    } else {
      // Klicke auf neue Zelle, füge rote Box hinzu
      setRedBoxes([...redBoxes, { index: cellIndex, left: 0, width: 64 }]);
    }
    setSelectedCell(cellIndex);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, cellIndex: number) => {
    if (!isResizing) {
      const foundBox = redBoxes.find((box) => box.index === cellIndex);
      if (foundBox) {
        setDraggedBox(foundBox);
        event.dataTransfer.setDragImage(new Image(), 0, 0);
      }
      //event.dataTransfer.setData('text/plain', String(cellIndex));
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    /*
    // Überprüfen, ob die verschobene Box über einer anderen Box platziert wird
    const overlappingBox = redBoxes.find((box) => box.index === cellIndex);

    // Überprüfen, ob die überlappende Box unterschiedlich zur verschobenen Box ist
    if (overlappingBox && overlappingBox.index !== draggedBox?.index) {
      // Entfernen der überlappenden Box
      setRedBoxes(redBoxes.filter((box) => box.index !== overlappingBox.index));
    }
    */
    setHoveredCell(cellIndex);
  };

  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    if (draggedBox === null) return;

    // Überprüfen, ob die verschobene Box über einer anderen Box platziert wurde
    const overlappingBox = redBoxes.find((box) => box.index === cellIndex);
    if (overlappingBox && overlappingBox.index !== draggedBox.index) {
      // Entfernen der überlappenden Box
      setRedBoxes(redBoxes.filter((box) => box.index !== overlappingBox.index));
    }

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

  const handleResize = (event: React.MouseEvent<HTMLDivElement>, boxIndex: number, isRightDrag: boolean) => {
    setIsResizing(true);

    const startX = event.clientX;
    const foundBox = redBoxes.find((box) => box.index === boxIndex);
    const startLeft = foundBox?.left || 0;
    const startWidth = foundBox?.width || 32;

    const handleMouseMove = (event: MouseEvent) => {
      const diffX = event.clientX - startX;
      const newLeft = startLeft + (isRightDrag ? 0 : diffX);
      const newWidth = isRightDrag ? startWidth + diffX : startWidth - diffX;

      if (newWidth >= 32 && newWidth % 32 === 0) {
        setRedBoxes((prevBoxes) => prevBoxes.map((box) => (box.index === boxIndex ? { ...box, left: newLeft, width: newWidth } : box)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <table className='timeline-container'>
      <tbody>
        {Array(4)
          .fill(null)
          .map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array(50)
                .fill(null)
                .map((_, colIndex) => {
                  const cellIndex = rowIndex * 50 + colIndex;
                  const isCellSelected = selectedCell === cellIndex;
                  const foundBox = redBoxes.find((box) => box.index === cellIndex);
                  const isCellRed = !!foundBox;
                  const isCellDragged = draggedBox?.index === cellIndex && !isResizing;
                  const isCellHovered = hoveredCell === cellIndex;

                  return (
                    <td
                      className={`grid-cell ${isCellSelected ? 'selected' : ''} ${isCellHovered ? 'drag-over' : ''}`}
                      onMouseEnter={() => setSelectedCell(cellIndex)}
                      onClick={() => handleCellClick(cellIndex)}
                      onDragOver={(event) => handleDragOver(event, cellIndex)}
                      onDrop={(event) => handleDrop(event, cellIndex)}
                      key={cellIndex}
                    >
                      {isCellRed && (
                        <div
                          className={`red-box ${isCellDragged ? 'dragged' : ''}`}
                          style={{
                            left: `${foundBox?.left}px`,
                            width: `${foundBox?.width}px`,
                          }}
                          draggable={!isResizing}
                          onDragStart={(event) => handleDragStart(event, cellIndex)}
                        >
                          <div
                            className='red-box-handle-left'
                            onMouseDown={(event) => handleResize(event, cellIndex, false)}
                          />
                          <div
                            className='red-box-handle-right'
                            onMouseDown={(event) => handleResize(event, cellIndex, true)}
                          />
                          <div className='red-box-content'>Scene X</div>
                        </div>
                      )}
                      {isCellHovered && draggedBox && (
                        <div
                          className='gray-box'
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
