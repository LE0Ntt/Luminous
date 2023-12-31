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
import { TranslationContext } from './TranslationContext';

interface scene {
  id: number;
  index: number;
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
  const { t } = React.useContext(TranslationContext);

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
      const random4digitId = Math.floor(Math.random() * 9000) + 1000;
      setScenes([...scenes, { id: random4digitId, index: cellIndex, width: 128, sceneId: parseInt(droppingScene) }]);
      return;
    }

    // Check if the dragged box is dropped on itself
    const overlappingBox = scenes.find((box) => box.index === cellIndex);
    if (overlappingBox) {
      // Remove the overlapping box
      //setScenes(scenes.filter((box) => box.index !== overlappingBox.index));
    } else {
      // Move the dragged box to the new position
      const updatedBoxes = scenes.map((box) => {
        if (box.index === draggedBox.index) {
          return { ...box, index: cellIndex };
        }
        return box;
      });
      setScenes(updatedBoxes);
    }

    setDraggedBox(null);
    setHoveredCell(null);
  };

  const handleResize = (event: React.MouseEvent<HTMLDivElement>, boxId: number, isRightDrag: boolean) => {
    setIsResizing(true);

    document.body.style.cursor = 'ew-resize';

    const startX = event.clientX;
    const foundBox = scenes.find((box) => box.id === boxId);
    const startWidth = foundBox?.width || 32;
    const startIndex = foundBox?.index || 0;

    const handleMouseMove = (event: MouseEvent) => {
      const diffX = event.clientX - startX;
      const indexDiff = Math.floor(diffX / 32);
      const newWidth = isRightDrag ? startWidth + diffX : startWidth - diffX;
      const newIndex = isRightDrag ? foundBox?.index ?? 0 : startIndex + indexDiff;

      if (
        newWidth >= 32 &&
        newWidth % 32 === 0 &&
        newIndex >= Math.floor(startIndex / 100) * 100 &&
        // check if other scene + width is not overlapping
        scenes.every((box) => box.id === boxId || box.index + box.width / 32 <= newIndex || box.index >= newIndex + newWidth / 32)
      ) {
        setScenes((prevBoxes) => prevBoxes.map((box) => (box.id === boxId ? { ...box, index: newIndex, width: newWidth } : box)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
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
      setDraggedBox({ id: parseInt(id), index: 999, width: 128 });
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
      {scenes.length === 0 && <span className='dragHint'>{t('dragHint')}</span>}
      <table>
        <thead>
          <tr>
            <td className='sticky-col-placeholder'> </td>
          </tr>
        </thead>
        <tbody>
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
                      const isCellScene = !!foundBox;
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
                          {isCellScene && (
                            <div
                              className={`scene-box ${isCellDragged ? 'dragged' : ''}`}
                              style={{
                                width: `${foundBox?.width}px`,
                              }}
                              draggable={!isResizing}
                              onDragStart={(event) => handleDragStart(event, cellIndex)}
                              onDrag={handleDrag}
                              onDragEnd={handleDragEnd}
                            >
                              <div
                                className='scene-box-handle-left'
                                onMouseDown={(event) => handleResize(event, foundBox.id, false)}
                              />
                              <div
                                className='scene-box-handle-right'
                                onMouseDown={(event) => handleResize(event, foundBox.id, true)}
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
