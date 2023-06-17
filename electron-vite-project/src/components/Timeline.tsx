import React, { useState } from 'react';
import './Timeline.css'; // Pfade zur CSS-Datei anpassen

const MyTimeline: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<number | null>(null);
  const [redBoxes, setRedBoxes] = useState<number[]>([]);
  const [draggedBox, setDraggedBox] = useState<number | null>(null);

  const handleCellClick = (cellIndex: number) => {
    if (redBoxes.includes(cellIndex)) {
      // Klicke auf bereits rote Box, entferne sie
      setRedBoxes(redBoxes.filter((box) => box !== cellIndex));
    } else {
      // Klicke auf neue Zelle, füge rote Box hinzu
      setRedBoxes([...redBoxes, cellIndex]);
    }
    setSelectedCell(cellIndex);
  };

  const handleDragStart = (cellIndex: number) => {
    setDraggedBox(cellIndex);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>) => {
    event.preventDefault();
  };

  const handleDrop = (cellIndex: number) => {
    if (draggedBox === null) return;

    // Verschiebe die rote Box von der ursprünglichen Zelle zur neuen Zelle
    const updatedBoxes = redBoxes.filter((box) => box !== draggedBox);
    updatedBoxes.push(cellIndex);
    setRedBoxes(updatedBoxes);

    setDraggedBox(null);
  };

  return (
    <table className="grid-container">
      <tbody>
        {Array(4).fill(null).map((_, rowIndex) => (
          <tr key={rowIndex}>
            {Array(50).fill(null).map((_, colIndex) => {
              const cellIndex = rowIndex * 50 + colIndex;
              const isCellSelected = selectedCell === cellIndex;
              const isCellRed = redBoxes.includes(cellIndex);
              const isCellDragged = draggedBox === cellIndex;

              return (
                <td
                  className={`grid-cell ${isCellSelected ? 'selected' : ''}`}
                  onMouseEnter={() => setSelectedCell(cellIndex)}
                  onClick={() => handleCellClick(cellIndex)}
                  onDragStart={() => handleDragStart(cellIndex)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(cellIndex)}
                  draggable
                  key={cellIndex}
                >
                  {isCellRed && <div className={`red-box ${isCellDragged ? 'dragged' : ''}`} />}
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
