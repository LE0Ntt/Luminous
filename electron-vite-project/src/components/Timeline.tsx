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
 *
 *
 * TODO:
 * - Solution for finer steps than 32px (1/4s)
 * - Scroll up/down when dragging in the top/bottom visible layer
 * - Scenes
 *   - Selectable
 *     - Fade in/out handles
 *     - Move multiple scenes at once
 *     - Delete
 *       - Reminder: update sessionStorage on last scene delete
 *     - Adjustable brightness
 *   - Display scene name
 * - Cursor
 *   - Appearance
 *   - Scroll on tableheader hover
 *   - Draggable
 *   - Sync with server
 * - Auto adjust show length
 *   - Grayed out time clip
 * - Server communication
 *   - Load show
 * - Layers
 *   - Mute/Solo
 *   - Changable name? Loading a show could be added on new layers
 *   - Delete
 *     - Delete all scenes on layer
 * - Touch support
 */
import React, { useEffect, useRef, useState } from 'react';
import './Timeline.css';
import { eventBus } from './EventBus';
import { TranslationContext } from './TranslationContext';
import Button from './Button';

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
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState([
    { name: 'Layer 1', mute: false, solo: false },
    { name: 'Layer 2', mute: false, solo: false },
    { name: 'Layer 3', mute: false, solo: false },
    { name: 'Layer 4', mute: false, solo: false },
  ]);
  const tableCells = 100;

  // Set dragged box on drag start
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, cellIndex: number) => {
    if (!isResizing) {
      const foundBox = scenes.find((box) => box.index === cellIndex);
      if (foundBox) {
        setDraggedBox(foundBox);
        event.dataTransfer.setDragImage(new Image(), 0, 0);
      }
    }
  };

  // Save scenes and layers in sessionStorage
  useEffect(() => {
    if (scenes.length === 0) return;
    sessionStorage.setItem('show', JSON.stringify(scenes));
    sessionStorage.setItem('layers', JSON.stringify(layers));
  }, [scenes, layers]);

  // Try to load scenes and layers from sessionStorage
  useEffect(() => {
    const loadDataFromStorage = (key: any, setter: any) => {
      const dataFromStorage = sessionStorage.getItem(key);
      if (dataFromStorage) {
        setter(JSON.parse(dataFromStorage));
      }
    };

    loadDataFromStorage('show', setScenes);
    loadDataFromStorage('layers', setLayers);
  }, []);

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

  // Dragging over a cell
  const handleDragOver = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();

    // Set the dragged cell
    setHoveredCell(cellIndex);

    // Set the width of the dragged box to the maximum available width
    const originalWidth = scenes.find((box) => box.index === draggedBox?.index)?.width || 128;
    const nextScene = scenes.filter((box) => box.index > cellIndex && box.index !== draggedBox?.index).sort((a, b) => a.index - b.index)[0];
    const maxAvailableWidth = nextScene ? (nextScene.index - cellIndex) * 32 : originalWidth;
    const sceneWidth = Math.min(originalWidth, maxAvailableWidth);
    setDraggedBox((prevBox) => (prevBox ? { ...prevBox, width: sceneWidth } : null));
  };

  // Drop the dragged scene
  const handleDrop = (event: React.DragEvent<HTMLTableCellElement>, cellIndex: number) => {
    event.preventDefault();
    if (draggedBox === null) return;

    if (draggedBox.index === 999) {
      const random4digitId = Math.floor(Math.random() * 9000) + 1000;

      setScenes([...scenes, { id: random4digitId, index: cellIndex, width: draggedBox.width, sceneId: parseInt(droppingScene) }]);
      return;
    }

    // Check if the dragged box is not dropped on another box
    if (!scenes.find((box) => box.index === cellIndex)) {
      // Move the dragged box to the new position
      const updatedBoxes = scenes.map((box) => {
        if (box.index === draggedBox.index) {
          return { ...box, index: cellIndex, width: draggedBox.width };
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

    // Get the start position of the mouse and the width of the box
    const startX = event.clientX;
    const foundBox = scenes.find((box) => box.id === boxId);
    const startWidth = foundBox?.width || 64;
    const startIndex = foundBox?.index || 0;

    // Resize the box while the mouse is moving
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate the new width and index
      const diffX = event.clientX - startX;
      const indexDiff = Math.ceil(diffX / 32);
      let newWidth = isRightDrag ? startWidth + diffX : startWidth - diffX;
      newWidth = Math.floor(newWidth / 32) * 32;
      let newIndex = isRightDrag ? foundBox?.index ?? 0 : startIndex + indexDiff;

      // Check if the new width and index are valid
      const isWidthValid = newWidth >= 32 && newWidth % 32 === 0;
      const isIndexValid = newIndex >= Math.floor(startIndex / 100) * 100;
      const isNotOverlapping = scenes.every((box) => box.id === boxId || box.index + box.width / 32 <= newIndex || box.index >= newIndex + newWidth / 32);

      // Update the box
      if (isWidthValid && isIndexValid && isNotOverlapping) {
        setScenes((prevBoxes) => prevBoxes.map((box) => (box.id === boxId ? { ...box, index: newWidth >= 32 ? newIndex : box.index, width: newWidth } : box)));
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

  // EventBus listeners for dragging scenes
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
      setHoveredCell(null);
    };

    eventBus.on('drag-start', onDragStart);
    eventBus.on('drag-end', onDragEnd);

    return () => {
      eventBus.off('drag-start', onDragStart);
      eventBus.off('drag-end', onDragEnd);
    };
  }, []);

  // Sync scroll position of all divs
  // Necessary because horizontal and vertical scrolling is not possible with one part staying fixed and the other scrolling.
  useEffect(() => {
    const handleScroll = (event: Event) => {
      const target = event.target as HTMLDivElement;
      syncScroll(target.scrollTop, target);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const deltaY = event.deltaY * 0.1; // Scroll speed
      const target = event.currentTarget as HTMLDivElement;
      const newScrollTop = target.scrollTop + deltaY;
      syncScroll(newScrollTop, target);
    };

    const divs = [scrollBarRef.current, timelineRef.current, layersRef.current];
    divs.forEach((div) => {
      if (div) {
        div.addEventListener('wheel', handleWheel);
        div.addEventListener('scroll', handleScroll);
      }
    });

    return () => {
      divs.forEach((div) => {
        if (div) {
          div.removeEventListener('wheel', handleWheel);
          div.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  const syncScroll = (scrollTop: number, sourceDiv: HTMLDivElement) => {
    [scrollBarRef, timelineRef, layersRef].forEach((divRef) => {
      if (divRef.current && divRef.current !== sourceDiv) {
        divRef.current.scrollTop = scrollTop;
      }
    });
  };

  const addLayer = () => {
    setLayers([...layers, { name: `Layer ${layers.length + 1}`, mute: false, solo: false }]);
  };

  const deleteLayer = (index: number) => {
    setLayers(layers.filter((_, i) => i !== index));
  };

  return (
    <div className='timeline-container'>
      {scenes.length === 0 && hoveredCell === null && <span className='dragHint'>{t('dragHint')}</span>}
      <div className='add-layer-container'>
        <Button
          className='add-layer-button'
          onClick={addLayer}
        >
          Add Layer
        </Button>
      </div>
      <div
        ref={layersRef}
        className='layer-table-container'
      >
        <table>
          <tbody>
            {Array(layers.length)
              .fill(null)
              .map((_, index) => (
                <tr key={index}>
                  <td className={`layer-col ${index % 2 === 0 && 'row-light'}`}>Layer {index + 1}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div className='timeline-scroll'>
        <table className='timeline-header'>
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
          </tbody>
        </table>
        <div
          className='timeline-table-container'
          ref={timelineRef}
        >
          <table className='timeline'>
            <tbody>
              {Array(layers.length)
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
                            ${rowIndex % 2 === 0 ? 'row-light' : ''}`} // Highlight every second row
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
        </div>
      </div>
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
      <div
        className='scroll-vertical '
        ref={scrollBarRef}
      >
        <div style={{ height: layers.length * 60 }}></div>
      </div>
    </div>
  );
};

export default Timeline;
