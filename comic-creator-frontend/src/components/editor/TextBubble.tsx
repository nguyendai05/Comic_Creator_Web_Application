import { useRef, useEffect, useState } from 'react';
import { Group, Rect, Text as KonvaText, Path, Transformer, Circle } from 'react-konva';
import Konva from 'konva';
import type { TextElement } from '@/types';

interface TextBubbleProps {
  textElement: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<TextElement>) => void;
  onDelete: () => void;
  panelBounds: { x: number; y: number; width: number; height: number };
}

interface BubbleStyle {
  fill: string;
  stroke: string;
  strokeWidth?: number;
  cornerRadius?: number;
  tailSize?: number;
  cloudBubbles?: number;
  fontWeight?: string;
  fontStyle?: string;
}

const BUBBLE_STYLES: Record<string, BubbleStyle> = {
  speech: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    cornerRadius: 20,
    tailSize: 15,
  },
  thought: {
    fill: '#FFFFFF',
    stroke: '#000000',
    strokeWidth: 2,
    cloudBubbles: 3,
  },
  narration: {
    fill: '#FFF9E6',
    stroke: '#D4A574',
    strokeWidth: 1,
    cornerRadius: 4,
  },
  sfx: {
    fill: 'transparent',
    stroke: 'transparent',
    fontWeight: 'bold',
    fontStyle: 'italic',
  }
};

const TAIL_POSITIONS = [
  'bottom', 'bottom-left', 'left', 'top-left',
  'top', 'top-right', 'right', 'bottom-right'
] as const;

export function TextBubble({
  textElement,
  isSelected,
  onSelect,
  onUpdate,
  // onDelete,
  panelBounds
}: TextBubbleProps) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { position, style, content, text_type } = textElement;
  const bubbleStyle = BUBBLE_STYLES[text_type === 'dialogue' ? (style?.bubble_style === 'thought' ? 'thought' : 'speech') : (text_type as 'narration' | 'sfx')] || BUBBLE_STYLES.speech;

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target;
    // Constrain to panel bounds
    const x = Math.max(0, Math.min(node.x(), panelBounds.width - (node.width() * node.scaleX())));
    const y = Math.max(0, Math.min(node.y(), panelBounds.height - (node.height() * node.scaleY())));

    node.x(x);
    node.y(y);

    onUpdate({
      position: {
        ...position,
        x,
        y
      }
    });
  };

  const handleTransformEnd = () => {
    if (groupRef.current) {
      const node = groupRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Reset scale and update width/height
      node.scaleX(1);
      node.scaleY(1);

      onUpdate({
        position: {
          ...position,
          x: node.x(),
          y: node.y(),
          width: Math.max(50, node.width() * scaleX),
          height: Math.max(30, node.height() * scaleY)
        }
      });
    }
  };

  // Better path generation for speech bubble
  const getSpeechBubblePath = (w: number, h: number, tailPos: string = 'bottom') => {
    const r = 20;
    const t = 15; // tail size

    // Start top-left
    let d = `M ${r} 0`;

    // Top edge
    if (tailPos === 'top') {
      d += ` L ${w / 2 - t} 0 L ${w / 2} ${-t} L ${w / 2 + t} 0`;
    }
    d += ` L ${w - r} 0 Q ${w} 0 ${w} ${r}`;

    // Right edge
    if (tailPos === 'right') {
      d += ` L ${w} ${h / 2 - t} L ${w + t} ${h / 2} L ${w} ${h / 2 + t}`;
    }
    d += ` L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h}`;

    // Bottom edge
    if (tailPos === 'bottom') {
      d += ` L ${w / 2 + t} ${h} L ${w / 2} ${h + t} L ${w / 2 - t} ${h}`;
    }
    d += ` L ${r} ${h} Q 0 ${h} 0 ${h - r}`;

    // Left edge
    if (tailPos === 'left') {
      d += ` L 0 ${h / 2 + t} L ${-t} ${h / 2} L 0 ${h / 2 - t}`;
    }
    d += ` L 0 ${r} Q 0 0 ${r} 0 Z`;

    return d;
  };

  const getThoughtBubblePath = (w: number, h: number) => {
    // Simple cloud shape
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
  };

  const handleDblClick = () => {
    setIsEditing(true);

    // Create textarea overlay
    const stage = groupRef.current?.getStage();
    if (!stage) return;

    const textNode = groupRef.current?.findOne('Text') as Konva.Text;
    const tr = trRef.current;

    // Hide text node and transformer
    if (textNode) textNode.hide();
    if (tr) tr.hide();

    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const areaPosition = {
      x: stageBox.left + textPosition.x,
      y: stageBox.top + textPosition.y,
    };

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = content;
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
    textarea.style.height = `${textNode.height() - textNode.padding() * 2 + 5}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight().toString();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill() as string;

    // Rotation
    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;

    textarea.focus();

    const removeTextarea = () => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      if (textNode) textNode.show();
      if (tr && isSelected) tr.show();
      setIsEditing(false);
      onUpdate({ content: textarea.value });
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== textarea) {
        removeTextarea();
      }
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        removeTextarea();
      }
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  };

  const cycleTailPosition = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const currentPos = style?.tail_position || 'bottom';
    const currentIndex = TAIL_POSITIONS.indexOf(currentPos as any);
    const nextIndex = (currentIndex + 1) % TAIL_POSITIONS.length;
    onUpdate({
      style: {
        ...style,
        tail_position: TAIL_POSITIONS[nextIndex]
      }
    });
  };

  return (
    <>
      <Group
        ref={groupRef}
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        draggable={isSelected && !isEditing}
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        dragBoundFunc={(pos) => {
          // Simple bound check - can be improved
          return {
            x: Math.max(panelBounds.x, Math.min(pos.x, panelBounds.x + panelBounds.width)),
            y: Math.max(panelBounds.y, Math.min(pos.y, panelBounds.y + panelBounds.height))
          };
        }}
      >
        {/* Bubble Shape */}
        {text_type === 'dialogue' && style?.bubble_style !== 'thought' && (
          <Path
            data={getSpeechBubblePath(position.width, position.height, style?.tail_position || 'bottom')}
            fill={bubbleStyle.fill}
            stroke={bubbleStyle.stroke}
            strokeWidth={bubbleStyle.strokeWidth}
            shadowColor="black"
            shadowBlur={2}
            shadowOpacity={0.1}
            shadowOffsetY={1}
          />
        )}

        {text_type === 'dialogue' && style?.bubble_style === 'thought' && (
          <Path
            data={getThoughtBubblePath(position.width, position.height)}
            fill={bubbleStyle.fill}
            stroke={bubbleStyle.stroke}
            strokeWidth={bubbleStyle.strokeWidth}
            shadowColor="black"
            shadowBlur={2}
            shadowOpacity={0.1}
            shadowOffsetY={1}
          />
        )}

        {text_type === 'narration' && (
          <Rect
            width={position.width}
            height={position.height}
            fill={bubbleStyle.fill}
            stroke={bubbleStyle.stroke}
            strokeWidth={bubbleStyle.strokeWidth}
            cornerRadius={bubbleStyle.cornerRadius}
          />
        )}

        {/* Text Content */}
        <KonvaText
          text={content}
          width={position.width}
          height={position.height}
          fontSize={style?.font_size || 16}
          fontFamily={style?.font_family || 'Arial'}
          fill={style?.color || '#000000'}
          fontStyle={`${style?.bold ? 'bold ' : ''}${style?.italic ? 'italic' : ''}`}
          align="center"
          verticalAlign="middle"
          padding={10}
        />

        {/* Tail Control Handle */}
        {isSelected && text_type === 'dialogue' && style?.bubble_style !== 'thought' && (
          <Circle
            x={position.width - 10}
            y={position.height - 10}
            radius={6}
            fill="#3B82F6"
            stroke="white"
            strokeWidth={2}
            onClick={cycleTailPosition}
            onTap={cycleTailPosition}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'pointer';
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) container.style.cursor = 'default';
            }}
          />
        )}
      </Group>

      {isSelected && (
        <Transformer
          ref={trRef}
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
