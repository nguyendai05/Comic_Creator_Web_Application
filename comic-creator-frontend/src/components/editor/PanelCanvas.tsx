import { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Text } from 'react-konva';
import { useCurrentPage, useEditorStore } from '@/stores/editorStore';
import { PanelShape } from './PanelShape';
import { PanelToolbar } from './PanelToolbar';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 1200;
const GRID_SIZE = 20;

export function PanelCanvas() {
    const currentPage = useCurrentPage();
    const { selectedPanelId, selectPanel } = useEditorStore();
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

    // Update canvas size on container resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const container = containerRef.current;
                const containerWidth = container.offsetWidth;
                const containerHeight = container.offsetHeight;

                // Calculate scale to fit canvas in container
                const scaleX = (containerWidth - 40) / CANVAS_WIDTH;
                const scaleY = (containerHeight - 40) / CANVAS_HEIGHT;
                const newScale = Math.min(scaleX, scaleY, 1); // Max scale is 1

                setScale(newScale);
                setStageSize({
                    width: containerWidth,
                    height: containerHeight
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Calculate stage offset to center canvas
    const offsetX = (stageSize.width - CANVAS_WIDTH * scale) / 2;
    const offsetY = (stageSize.height - CANVAS_HEIGHT * scale) / 2;

    if (!currentPage) {
        return (
            <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                    <p className="text-xl mb-2">No page selected</p>
                    <p className="text-sm">Select a page from the sidebar</p>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="h-full bg-gray-900 relative">
            <PanelToolbar />

            <Stage
                width={stageSize.width}
                height={stageSize.height}
                scaleX={scale}
                scaleY={scale}
                x={offsetX}
                y={offsetY}
                onClick={(e) => {
                    // Deselect if clicked on background
                    if (e.target === e.target.getStage()) {
                        selectPanel(null);
                    }
                }}
            >
                {/* Background Layer */}
                <Layer>
                    {/* Canvas background */}
                    <Rect
                        x={0}
                        y={0}
                        width={CANVAS_WIDTH}
                        height={CANVAS_HEIGHT}
                        fill="white"
                        shadowColor="black"
                        shadowBlur={10}
                        shadowOpacity={0.3}
                        shadowOffsetX={0}
                        shadowOffsetY={4}
                    />

                    {/* Grid (optional) */}
                    {Array.from({ length: Math.ceil(CANVAS_WIDTH / GRID_SIZE) }).map((_, i) => (
                        <Rect
                            key={`grid-v-${i}`}
                            x={i * GRID_SIZE}
                            y={0}
                            width={1}
                            height={CANVAS_HEIGHT}
                            fill="#f0f0f0"
                        />
                    ))}
                    {Array.from({ length: Math.ceil(CANVAS_HEIGHT / GRID_SIZE) }).map((_, i) => (
                        <Rect
                            key={`grid-h-${i}`}
                            x={0}
                            y={i * GRID_SIZE}
                            width={CANVAS_WIDTH}
                            height={1}
                            fill="#f0f0f0"
                        />
                    ))}

                    {/* Page info */}
                    <Text
                        text={`Page ${currentPage.page_number} • ${currentPage.panels.length} panels`}
                        x={20}
                        y={20}
                        fontSize={16}
                        fill="#666"
                        fontFamily="system-ui"
                    />

                    {/* Panels */}
                    {currentPage.panels
                        .sort((a, b) => (a.position.z_index || 0) - (b.position.z_index || 0))
                        .map((panel) => (
                            <PanelShape
                                key={panel.panel_id}
                                panel={panel}
                                isSelected={panel.panel_id === selectedPanelId}
                                onClick={() => selectPanel(panel.panel_id)}
                            />
                        ))}
                </Layer>
            </Stage>

            {/* Canvas Info Overlay */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                <p>Zoom: {Math.round(scale * 100)}%</p>
                <p>Canvas: {CANVAS_WIDTH}×{CANVAS_HEIGHT}px</p>
            </div>
        </div>
    );
}
