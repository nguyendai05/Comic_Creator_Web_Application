import { useEffect, useState, useRef } from 'react';
import { Group, Rect, Image as KonvaImage, Text } from 'react-konva';
import { Group as KonvaGroup } from 'konva/lib/Group';
import type { Panel } from '@/types';
import { useEditorStore } from '@/stores/editorStore';
import { TextBubble } from './TextBubble';

interface PanelShapeProps {
    panel: Panel;
    isSelected: boolean;
    onClick: () => void;
}

export function PanelShape({ panel, isSelected, onClick }: PanelShapeProps) {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const { updatePanel } = useEditorStore();
    const groupRef = useRef<KonvaGroup>(null);

    // Load panel image
    useEffect(() => {
        if (panel.image_url) {
            const img = new window.Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                setImage(img);
                setImageLoaded(true);
            };

            img.onerror = () => {
                console.error('Failed to load image:', panel.image_url);
                setImageLoaded(false);
            };

            img.src = panel.image_url;
        }
    }, [panel.image_url]);

    const { x, y, width, height } = panel.position;

    const handleDragStart = () => {
        // Visual feedback
        if (groupRef.current) {
            groupRef.current.moveToTop();
        }
    };

    const handleDragMove = (e: any) => {
        const node = e.target;
        const newX = node.x();
        const newY = node.y();

        // Constrain to canvas bounds (optional)
        const maxX = 800 - width;
        const maxY = 1200 - height;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        if (newX !== constrainedX || newY !== constrainedY) {
            node.x(constrainedX);
            node.y(constrainedY);
        }
    };

    const handleDragEnd = (e: any) => {
        const node = e.target;
        const newX = node.x();
        const newY = node.y();

        // Update position in store
        updatePanel(panel.panel_id, {
            position: {
                ...panel.position,
                x: newX,
                y: newY
            }
        });

        // Reset position on Group (since we're using absolute positioning in Rect)
        // Actually, if we update the store, the component will re-render with new x/y props.
        // Konva might keep the dragged position if we don't reset it or if we don't control it fully.
        // React-Konva usually handles this if we pass x={x} y={y} to the Group.
        // If we pass x/y to Group, we should update store and let React update the prop.
        // However, the prompt code says:
        // node.x(0); node.y(0);
        // And the Group has x={x} y={y} ?
        // Wait, the original code had Rect x={x} y={y}.
        // The prompt says "Replace Group component with draggable version".
        // If I put x={x} y={y} on the Group, then the Rects inside should be relative to 0,0?
        // The original code had Rect x={x} y={y}.
        // If I move x/y to Group, I need to change Rect x/y to 0,0?
        // The prompt code snippet for `PanelShape` in the previous turn (Step 126) had:
        // <Group onClick={onClick}> <Rect x={x} y={y} ... /> ... </Group>
        // So the Group was at 0,0 (default) and Rect was at x,y.
        // If we make the Group draggable, Konva modifies the Group's x,y.
        // If we want to persist this, we update the store.
        // When the store updates, `panel.position` changes.
        // If we keep the structure: Group (draggable) -> Rect (x=panel.x, y=panel.y),
        // Then when dragging, Group x/y changes.
        // On drag end, we update panel.x/y.
        // Re-render: Group x=0 (default), Rect x=newX.
        // BUT, Konva node keeps its position after drag unless reset.
        // So `node.x(0); node.y(0);` in `handleDragEnd` makes sense IF the Group is not controlled by props x/y, OR if we want to reset the Group's offset and let the inner elements handle the position.
        // HOWEVER, if the Group is at 0,0 and Rect is at x,y.
        // Dragging moves Group to dx, dy.
        // Visual position = dx+x, dy+y.
        // We update x to x+dx, y to y+dy.
        // We reset Group to 0,0.
        // Visual position = 0+(x+dx), 0+(y+dy). Correct.

        node.x(0);
        node.y(0);
    };

    return (
        <Group
            ref={groupRef}
            draggable={isSelected}
            onClick={onClick}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            onMouseEnter={(e) => {
                const stage = e.target.getStage();
                if (stage) {
                    stage.container().style.cursor = isSelected ? 'move' : 'pointer';
                }
            }}
            onMouseLeave={(e) => {
                const stage = e.target.getStage();
                if (stage) {
                    stage.container().style.cursor = 'default';
                }
            }}
        >
            {/* Panel background */}
            <Rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={imageLoaded ? undefined : '#f5f5f5'}
                stroke={isSelected ? '#3B82F6' : '#000000'}
                strokeWidth={isSelected ? 3 : 2}
                shadowColor={isSelected ? '#3B82F6' : 'black'}
                shadowBlur={isSelected ? 20 : 4}
                shadowOpacity={isSelected ? 0.3 : 0.2}
                shadowOffsetX={0}
                shadowOffsetY={isSelected ? 0 : 2}
                cornerRadius={2}
            />

            {/* Panel image */}
            {imageLoaded && image && (
                <KonvaImage
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    image={image}
                    cornerRadius={2}
                />
            )}

            {/* Placeholder if no image */}
            {!imageLoaded && (
                <>
                    <Rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill="#e5e5e5"
                        cornerRadius={2}
                    />
                    <Text
                        x={x}
                        y={y + height / 2 - 10}
                        width={width}
                        text="No Image"
                        fontSize={14}
                        fill="#999"
                        align="center"
                        verticalAlign="middle"
                    />
                </>
            )}

            {/* Panel number badge */}
            <Group>
                <Rect
                    x={x + 8}
                    y={y + 8}
                    width={32}
                    height={24}
                    fill={isSelected ? '#3B82F6' : '#000000'}
                    opacity={0.8}
                    cornerRadius={4}
                />
                <Text
                    x={x + 8}
                    y={y + 8}
                    width={32}
                    height={24}
                    text={panel.panel_number.toString()}
                    fontSize={14}
                    fill="white"
                    fontStyle="bold"
                    align="center"
                    verticalAlign="middle"
                />
            </Group>

            {/* Text Elements */}
            <Group x={x} y={y}>
                {panel.text_elements?.map((textEl) => (
                    <TextBubble
                        key={textEl.text_id}
                        textElement={textEl}
                        isSelected={textEl.text_id === useEditorStore.getState().selectedTextId}
                        onSelect={() => {
                            useEditorStore.getState().selectText(textEl.text_id);
                        }}
                        onUpdate={(updates) => useEditorStore.getState().updateText(textEl.text_id, updates)}
                        onDelete={() => useEditorStore.getState().deleteText(textEl.text_id)}
                        panelBounds={{
                            x: 0,
                            y: 0,
                            width: width,
                            height: height,
                        }}
                    />
                ))}
            </Group>

            {/* Selection indicator */}
            {isSelected && (
                <>
                    {/* Corner handles */}
                    {[
                        { x: x, y: y },
                        { x: x + width, y: y },
                        { x: x, y: y + height },
                        { x: x + width, y: y + height }
                    ].map((corner, i) => (
                        <Rect
                            key={i}
                            x={corner.x - 4}
                            y={corner.y - 4}
                            width={8}
                            height={8}
                            fill="#3B82F6"
                            stroke="white"
                            strokeWidth={2}
                        />
                    ))}
                </>
            )}

            {/* Border overlay for different panel types */}
            {panel.panel_type === 'splash' && (
                <Rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    stroke="#FFD700"
                    strokeWidth={4}
                    cornerRadius={2}
                />
            )}
        </Group>
    );
}
