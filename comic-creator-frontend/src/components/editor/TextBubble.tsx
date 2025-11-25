import { useRef } from 'react';
import { Group, Rect, Text as KonvaText, Path } from 'react-konva';
import type { TextElement } from '@/types';

interface TextBubbleProps {
  textElement: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (newPos: { x: number; y: number }) => void;
}

export function TextBubble({
  textElement,
  isSelected,
  onSelect,
  onDragEnd
}: TextBubbleProps) {
  const groupRef = useRef<any>(null);
  const { position, style, content, text_type } = textElement;

  // Bubble style paths for different types
  const getBubblePath = () => {
    const w = position.width;
    const h = position.height;

    switch (style?.bubble_style) {
      case 'round':
        // Rounded rectangle path
        const radius = 10;
        return `M ${radius} 0
                L ${w - radius} 0
                Q ${w} 0 ${w} ${radius}
                L ${w} ${h - radius}
                Q ${w} ${h} ${w - radius} ${h}
                L ${radius} ${h}
                Q 0 ${h} 0 ${h - radius}
                L 0 ${radius}
                Q 0 0 ${radius} 0 Z`;

      case 'spiky':
        // Spiky bubble for shouting/emphasis
        return `M 10 0
                L ${w - 10} 0
                L ${w} 10
                L ${w} ${h - 10}
                L ${w - 10} ${h}
                L 10 ${h}
                L 0 ${h - 10}
                L 0 10 Z`;

      case 'cloud':
        // Cloud-like thought bubble
        return `M ${w * 0.2} ${h * 0.1}
                Q ${w * 0.1} ${h * 0.1} ${w * 0.1} ${h * 0.3}
                Q ${w * 0.1} ${h * 0.5} ${w * 0.2} ${h * 0.6}
                Q ${w * 0.1} ${h * 0.7} ${w * 0.2} ${h * 0.85}
                Q ${w * 0.3} ${h * 0.95} ${w * 0.5} ${h * 0.9}
                Q ${w * 0.7} ${h * 0.95} ${w * 0.8} ${h * 0.85}
                Q ${w * 0.9} ${h * 0.7} ${w * 0.8} ${h * 0.6}
                Q ${w * 0.9} ${h * 0.5} ${w * 0.9} ${h * 0.3}
                Q ${w * 0.9} ${h * 0.1} ${w * 0.8} ${h * 0.1}
                Q ${w * 0.6} ${h * 0.05} ${w * 0.5} ${h * 0.1}
                Q ${w * 0.3} ${h * 0.05} ${w * 0.2} ${h * 0.1} Z`;

      case 'square':
        // Simple rectangle
        return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;

      default:
        return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`;
    }
  };

  const handleDragEnd = (e: any) => {
    const node = e.target;
    onDragEnd({
      x: node.x(),
      y: node.y()
    });
  };

  // Determine if this is a narration box (no bubble needed)
  const isNarration = text_type === 'narration';

  // Determine if this is SFX (special styling)
  const isSFX = text_type === 'sfx';

  // Calculate text position within bubble
  const textX = isNarration ? 0 : 5;
  const textY = isNarration ? 0 : 5;
  const textWidth = position.width - (isNarration ? 0 : 10);
  const textHeight = position.height - (isNarration ? 0 : 10);

  return (
    <Group
      ref={groupRef}
      x={position.x}
      y={position.y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={handleDragEnd}
      opacity={isSelected ? 1 : 0.9}
    >
      {/* Bubble/Box Background */}
      {!isSFX && (
        <>
          {isNarration ? (
            // Narration box - simple rectangle
            <Rect
              width={position.width}
              height={position.height}
              fill={style?.bubble_color || '#FFFFFF'}
              stroke={style?.bubble_border_color || '#000000'}
              strokeWidth={style?.bubble_border_width || 2}
              cornerRadius={3}
            />
          ) : (
            // Speech bubble - custom path
            <Path
              data={getBubblePath()}
              fill={style?.bubble_color || '#FFFFFF'}
              stroke={style?.bubble_border_color || '#000000'}
              strokeWidth={style?.bubble_border_width || 2}
            />
          )}
        </>
      )}

      {/* Text Content */}
      <KonvaText
        x={textX}
        y={textY}
        text={content}
        width={textWidth}
        height={textHeight}
        fontSize={style?.font_size || 16}
        fontFamily={style?.font_family || 'Arial'}
        fill={style?.color || '#000000'}
        fontStyle={`${style?.bold ? 'bold ' : ''}${style?.italic ? 'italic' : ''}`}
        align={isSFX ? 'center' : 'left'}
        verticalAlign="middle"
        wrap="word"
        padding={5}
      />

      {/* Selection Border */}
      {isSelected && (
        <Rect
          width={position.width}
          height={position.height}
          stroke="#2563EB"
          strokeWidth={2}
          dash={[5, 5]}
          listening={false}
        />
      )}
    </Group>
  );
}
