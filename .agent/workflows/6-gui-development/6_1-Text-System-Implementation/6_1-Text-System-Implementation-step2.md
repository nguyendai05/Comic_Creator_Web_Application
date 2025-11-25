---
description: Text System Implementation -> step 2
---

## 🎯 Implementation Steps 2

### Step 2: Create TextBubble Component

```typescript
// File: src/components/editor/TextBubble.tsx

import { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text, Circle, Line, Transformer } from 'react-konva';
import type { TextElement } from '@/types';
import Konva from 'konva';

interface TextBubbleProps {
  textElement: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
  panelPosition: { x: number; y: number };
}

export function TextBubble({
  textElement,
  isSelected,
  onSelect,
  onUpdate,
  panelPosition,
}: TextBubbleProps) {
  const groupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { position, style, content, text_type } = textElement;
  
  // Calculate absolute position (relative to panel)
  const absX = panelPosition.x + position.x;
  const absY = panelPosition.y + position.y;
  
  // Attach transformer when selected
  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);
  
  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    onUpdate({
      position: {
        ...position,
        x: node.x() - panelPosition.x,
        y: node.y() - panelPosition.y,
      },
    });
  };
  
  // Handle transform end (resize)
  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    onUpdate({
      position: {
        ...position,
        x: node.x() - panelPosition.x,
        y: node.y() - panelPosition.y,
        width: Math.max(50, position.width * scaleX),
        height: Math.max(30, position.height * scaleY),
      },
    });
  };
  
  // Render bubble shape based on type
  const renderBubble = () => {
    if (text_type === 'sfx' || style.bubble_style === 'none') {
      return null;
    }
    
    const { bubble_color, bubble_border_color, bubble_border_width } = style;
    
    if (text_type === 'narration' || style.bubble_style === 'rectangle') {
      return (
        <Rect
          x={0}
          y={0}
          width={position.width}
          height={position.height}
          fill={bubble_color || '#FFFFFF'}
          stroke={bubble_border_color || '#000000'}
          strokeWidth={bubble_border_width || 2}
          cornerRadius={4}
        />
      );
    }
    
    // Speech bubble (rounded with tail)
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={position.width}
          height={position.height}
          fill={bubble_color || '#FFFFFF'}
          stroke={bubble_border_color || '#000000'}
          strokeWidth={bubble_border_width || 2}
          cornerRadius={15}
        />
        {/* Tail */}
        <Line
          points={[
            position.width / 2 - 10, position.height,
            position.width / 2, position.height + 15,
            position.width / 2 + 10, position.height,
          ]}
          fill={bubble_color || '#FFFFFF'}
          stroke={bubble_border_color || '#000000'}
          strokeWidth={bubble_border_width || 2}
          closed
        />
      </>
    );
  };
  
  return (
    <>
      <Group
        ref={groupRef}
        x={absX}
        y={absY}
        draggable={isSelected}
        onClick={(e) => {
          e.cancelBubble = true;
          onSelect();
        }}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onDblClick={() => setIsEditing(true)}
      >
        {/* Bubble background */}
        {renderBubble()}
        
        {/* Text content */}
        <Text
          x={8}
          y={8}
          width={position.width - 16}
          height={position.height - 16}
          text={content}
          fontSize={style.font_size || 14}
          fontFamily={style.font_family || 'Comic Sans MS'}
          fontStyle={`${style.bold ? 'bold' : ''} ${style.italic ? 'italic' : ''}`}
          fill={style.color || '#000000'}
          align="center"
          verticalAlign="middle"
          wrap="word"
        />
        
        {/* Selection highlight */}
        {isSelected && (
          <Rect
            x={-2}
            y={-2}
            width={position.width + 4}
            height={position.height + 4}
            stroke="#3B82F6"
            strokeWidth={2}
            dash={[5, 3]}
            listening={false}
          />
        )}
      </Group>
      
      {/* Transformer for resize */}
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 30) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}
```