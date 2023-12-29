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
import React, { useEffect, useState } from 'react';
import './Timeline.css';
import { eventBus } from './EventBus';

interface scene {
  index: number;
  left: number;
  width: number;
  sceneId?: number;
  sceneName?: string;
}

const Timeline: React.FC = () => {
  const [scenes, setScenes] = useState<scene[]>([]);
  const [isResizing, setIsResizing] = useState(false);
  const [draggedBox, setDraggedBox] = useState<scene | null>(null);
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [droppingScene, setDroppingScene] = useState<string>('');

  /*const handleCellClick = (cellIndex: number) => {
    const foundBox = scenes.find((box) => box.index === cellIndex);
    if (foundBox) {
      //setScenes(scenes.filter((box) => box.index !== cellIndex)); // Wenn auf eine vorhandene Box geklickt wurde, entferne sie
    } else {
      setScenes([...scenes, { index: cellIndex, left: 0, width: 64 }]); // Klicke auf neue Zelle, füge Box hinzu
    }
    setSelectedCell(cellIndex);
  };*/

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, cellIndex: number) => {
    if (!isResizing) {
      const foundBox = scenes.find((box) => box.index === cellIndex);
      if (foundBox) {
        setDraggedBox(foundBox);
        event.dataTransfer.setDragImage(new Image(), 0, 0);
      }
      //event.dataTransfer.setData('text/plain', String(cellIndex));
    }
  };

  // Make it possible to drag the box through itself to the right
  const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
    (event.target as HTMLDivElement).style.pointerEvents = 'none';
  };

  // Make it draggable again after dragging
  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    (event.target as HTMLDivElement).style.pointerEvents = 'auto';
    setDraggedBox(null);
    setHoveredCell(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    /*
    // Überprüfen, ob die verschobene Box über einer anderen Box platziert wird
    const overlappingBox = scenes.find((box) => box.index === cellIndex);
    // Überprüfen, ob die überlappende Box unterschiedlich zur verschobenen Box ist
    if (overlappingBox && overlappingBox.index !== draggedBox?.index) {
      setScenes(scenes.filter((box) => box.index !== overlappingBox.index)); // Entfernen der überlappenden Box
    }
    */
    setHoveredCell(cellIndex);
  };

  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    if (draggedBox === null) return;

    if (draggedBox.index === 999) {
      setScenes([...scenes, { index: cellIndex, left: 0, width: 64, sceneId: parseInt(droppingScene) }]);
      return;
    }

    // Überprüfen, ob die verschobene Box über einer anderen Box platziert wurde
    const overlappingBox = scenes.find((box) => box.index === cellIndex);
    if (overlappingBox && overlappingBox.index !== draggedBox.index) {
      // Entfernen der überlappenden Box
      setScenes(scenes.filter((box) => box.index !== overlappingBox.index));
    }

    // Verschiebe die Box von der ursprünglichen Zelle zur neuen Zelle
    const updatedBoxes = scenes.map((box) => {
      if (box.index === draggedBox.index) {
        return { ...box, index: cellIndex, left: 0 }; // Setze die linke Position auf 0 für die neue Zelle
      }
      return box;
    });
    setScenes(updatedBoxes);

    setDraggedBox(null);
    setHoveredCell(null);
  };

  const handleResize = (event: React.MouseEvent<HTMLDivElement>, boxIndex: number, isRightDrag: boolean) => {
    setIsResizing(true);

    const startX = event.clientX;
    const foundBox = scenes.find((box) => box.index === boxIndex);
    const startLeft = foundBox?.left || 0;
    const startWidth = foundBox?.width || 32;

    const handleMouseMove = (event: MouseEvent) => {
      const diffX = event.clientX - startX;
      const newLeft = startLeft + (isRightDrag ? 0 : diffX);
      const newWidth = isRightDrag ? startWidth + diffX : startWidth - diffX;

      if (newWidth >= 32 && newWidth % 32 === 0) {
        setScenes((prevBoxes) => prevBoxes.map((box) => (box.index === boxIndex ? { ...box, left: newLeft, width: newWidth } : box)));
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

  useEffect(() => {
    const onDragStart = (id: string) => {
      console.log(`Beginne Ziehen der Szene ${id}`);
      setDroppingScene(id);
      setDraggedBox({ index: 999, left: 0, width: 64 });
    };

    const onDragEnd = (id: string) => {
      console.log(`Beende Ziehen der Szene ${id}`);
      setDroppingScene('');
      setDraggedBox(null);
    };

    eventBus.on('drag-start', onDragStart);
    eventBus.on('drag-end', onDragEnd);

    return () => {
      eventBus.off('drag-start', onDragStart);
      eventBus.off('drag-end', onDragEnd);
    };
  }, []);

  const tableCells = 100;

  return (
    <div className='timeline-container'>
      <table>
        <tbody>
          <td className='sticky-col-placeholder'></td>
          {Array(4)
            .fill(null)
            .map((_, index) => (
              <tr key={index}>
                <td className='sticky-col'>Layer {index + 1}</td>
              </tr>
            ))}
        </tbody>
      </table>
      <div className='timeline-scroll'>
        <table className='timeline'>
          <tbody>
            <tr className={'header-row'}>
              {Array(Math.round(tableCells / 4))
                .fill(null)
                .map((_, index) => (
                  <td
                    className='header-cell'
                    key={index}
                    colSpan={4}
                  >
                    {index}
                  </td>
                ))}
            </tr>
            <tr className={'small-border'}>
              {Array(Math.round(tableCells / 2))
                .fill(null)
                .map((_, index) => (
                  <td
                    className='header-cell'
                    key={index}
                    colSpan={2}
                  ></td>
                ))}
            </tr>
            {Array(4)
              .fill(null)
              .map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array(tableCells)
                    .fill(null)
                    .map((_, colIndex) => {
                      const cellIndex = rowIndex * tableCells + colIndex;
                      const foundBox = scenes.find((box) => box.index === cellIndex);
                      const isCellRed = !!foundBox;
                      const isCellDragged = draggedBox?.index === cellIndex && !isResizing;
                      const isCellHovered = hoveredCell === cellIndex;
                      return (
                        <td
                          className={`grid-cell 
                            ${isCellHovered ? 'drag-over' : ''} 
                            ${colIndex % 2 === 0 ? 'cell-light' : ''} 
                            ${rowIndex % 2 === 0 ? 'row-light' : ''}`} // Highlight every second cell
                          onDragOver={(event) => handleDragOver(event, cellIndex)}
                          onDrop={(event) => handleDrop(event, cellIndex)}
                          key={cellIndex}
                        >
                          {isCellRed && (
                            <div
                              className={`scene-box ${isCellDragged ? 'dragged' : ''}`}
                              style={{
                                left: `${foundBox?.left}px`,
                                width: `${foundBox?.width}px`,
                              }}
                              draggable={!isResizing}
                              onDragStart={(event) => handleDragStart(event, cellIndex)}
                              onDrag={handleDrag}
                              onDragEnd={handleDragEnd}
                            >
                              <div
                                className='scene-box-handle-left'
                                onMouseDown={(event) => handleResize(event, cellIndex, false)}
                              />
                              <div
                                className='scene-box-handle-right'
                                onMouseDown={(event) => handleResize(event, cellIndex, true)}
                              />
                              <div className='scene-box-content'>Scene {foundBox?.sceneId}</div>
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
        <div
          id='cursor'
          className='cursor'
          // onWheel={handleWheelEvent}
          // onMouseDown={() => setIsMouseDown(true)}
        >
          <div className='cursorHead'></div>
          <div className='cursorNeck'></div>
          <div className='cursorNeedle'></div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
