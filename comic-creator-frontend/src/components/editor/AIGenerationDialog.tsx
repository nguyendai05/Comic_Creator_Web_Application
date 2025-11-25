import { useState, useEffect } from 'react';
import {
    X,
    Wand2,
    Image as ImageIcon,
    Loader2,
    Plus,
    Trash2,
    AlertCircle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'react-hot-toast';
import type { Panel, Character } from '@/types';
import { api } from '@/lib/api';
import { useEditorStore } from '@/stores/editorStore';

interface AIGenerationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    panelId: string;
    panel: Panel;
    characters: Character[];
}

interface GenerationState {
    sceneDescription: string;
    selectedCharacters: {
        characterId: string;
        expression: string;
        pose: string;
    }[];
    style: {
        base: 'manga' | 'western' | 'webtoon';
        quality: 'standard' | 'high';
    };
    cameraAngle: 'closeup' | 'medium' | 'wide' | 'low' | 'high';
    isGenerating: boolean;
    progress: number;
    error: string | null;
}

const EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'scared', 'determined'];
const POSES = ['standing', 'sitting', 'running', 'fighting', 'flying', 'dynamic'];
const ANGLES = [
    { id: 'closeup', label: 'Close Up' },
    { id: 'medium', label: 'Medium' },
    { id: 'wide', label: 'Wide' },
    { id: 'low', label: 'Low Angle' },
    { id: 'high', label: 'High Angle' },
];

export function AIGenerationDialog({
    isOpen,
    onClose,
    panelId,
    panel,
    characters
}: AIGenerationDialogProps) {
    const { updatePanel } = useEditorStore();
    const [credits, setCredits] = useState<number | null>(null);
    const [state, setState] = useState<GenerationState>({
        sceneDescription: panel.script_text || '',
        selectedCharacters: [],
        style: {
            base: 'manga',
            quality: 'standard'
        },
        cameraAngle: 'medium',
        isGenerating: false,
        progress: 0,
        error: null
    });

    // Reset state when dialog opens
    useEffect(() => {
        if (isOpen) {
            setState({
                sceneDescription: panel.script_text || '',
                selectedCharacters: [],
                style: {
                    base: 'manga',
                    quality: 'standard'
                },
                cameraAngle: 'medium',
                isGenerating: false,
                progress: 0,
                error: null
            });

            // Fetch credits
            api.getCredits().then(res => setCredits(res.credits_balance));
        }
    }, [isOpen, panel.script_text]);

    const handleGenerate = async () => {
        if (!state.sceneDescription.trim()) {
            setState(s => ({ ...s, error: 'Please enter a scene description' }));
            return;
        }

        if (credits !== null && credits < 1) {
            setState(s => ({ ...s, error: 'Insufficient credits' }));
            return;
        }

        setState(s => ({ ...s, isGenerating: true, progress: 0, error: null }));

        try {
            const job = await api.createAIJob({
                job_type: 'panel_generation',
                panel_id: panelId,
                input: {
                    scene_description: state.sceneDescription,
                    characters: state.selectedCharacters.map(c => ({
                        character_id: c.characterId,
                        expression: c.expression,
                        pose: c.pose
                    })),
                    style: {
                        base: state.style.base,
                        quality: state.style.quality,
                    },
                    panel: {
                        camera_angle: state.cameraAngle,
                        aspect_ratio: `${panel.position.width}:${panel.position.height}`
                    },
                },
            });

            // Poll for completion
            const pollInterval = setInterval(async () => {
                try {
                    const status = await api.getAIJob(job.job_id);

                    if (status.status === 'success' && status.result) {
                        clearInterval(pollInterval);
                        updatePanel(panelId, {
                            image_url: status.result.image_url,
                            thumbnail_url: status.result.thumbnail_url,
                            generation_prompt: status.result.prompt_used,
                        });

                        // Update credits
                        api.getCredits().then(res => setCredits(res.credits_balance));

                        toast.success('Panel generated successfully!');
                        onClose();
                    } else if (status.status === 'failed') {
                        clearInterval(pollInterval);
                        setState(s => ({
                            ...s,
                            isGenerating: false,
                            error: status.error?.message || 'Generation failed'
                        }));
                    } else {
                        setState(s => ({ ...s, progress: status.progress || 0 }));
                    }
                } catch (err) {
                    clearInterval(pollInterval);
                    setState(s => ({
                        ...s,
                        isGenerating: false,
                        error: 'Failed to check job status'
                    }));
                }
            }, 2000);

        } catch (error) {
            setState(s => ({
                ...s,
                isGenerating: false,
                error: error instanceof Error ? error.message : 'Failed to start generation'
            }));
        }
    };

    const addCharacter = () => {
        if (characters.length === 0) return;
        setState(s => ({
            ...s,
            selectedCharacters: [
                ...s.selectedCharacters,
                {
                    characterId: characters[0].character_id,
                    expression: 'neutral',
                    pose: 'standing'
                }
            ]
        }));
    };

    const updateCharacter = (index: number, updates: Partial<GenerationState['selectedCharacters'][0]>) => {
        setState(s => ({
            ...s,
            selectedCharacters: s.selectedCharacters.map((char, i) =>
                i === index ? { ...char, ...updates } : char
            )
        }));
    };

    const removeCharacter = (index: number) => {
        setState(s => ({
            ...s,
            selectedCharacters: s.selectedCharacters.filter((_, i) => i !== index)
        }));
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 w-[900px] h-[600px] z-50 flex flex-col animate-in zoom-in-95 duration-200">

                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-blue-400" />
                            <Dialog.Title className="font-semibold text-lg">Generate Panel with AI</Dialog.Title>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden">
                        {/* Left Column: Preview */}
                        <div className="w-1/2 p-6 bg-gray-950/50 border-r border-gray-800 flex flex-col">
                            <div className="flex-1 flex items-center justify-center bg-gray-900 rounded-lg border border-gray-800 relative overflow-hidden">
                                {state.isGenerating ? (
                                    <div className="text-center space-y-4">
                                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto" />
                                        <div>
                                            <p className="font-medium text-blue-400">Generating...</p>
                                            <p className="text-sm text-gray-500">{state.progress}% complete</p>
                                        </div>
                                    </div>
                                ) : panel.image_url ? (
                                    <img
                                        src={panel.image_url}
                                        alt="Current panel"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="text-center text-gray-500">
                                        <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                        <p>Preview area</p>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-center text-sm mb-2">
                                    <span className="text-gray-400">Credits Balance</span>
                                    <span className={`font-medium ${credits !== null && credits < 1 ? 'text-red-400' : 'text-white'}`}>
                                        {credits !== null ? credits : '...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Estimated Cost</span>
                                    <span className="font-medium text-blue-400">1 credit</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Controls */}
                        <div className="w-1/2 p-6 overflow-y-auto space-y-6">
                            {/* Scene Description */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">
                                    Scene Description
                                </label>
                                <textarea
                                    value={state.sceneDescription}
                                    onChange={(e) => setState(s => ({ ...s, sceneDescription: e.target.value }))}
                                    placeholder="Describe what's happening in this panel..."
                                    className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Characters */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-300">Characters</label>
                                    <button
                                        onClick={addCharacter}
                                        disabled={characters.length === 0}
                                        className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Character
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {state.selectedCharacters.map((char, i) => (
                                        <div key={i} className="p-3 bg-gray-800 rounded-lg border border-gray-700 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <select
                                                    value={char.characterId}
                                                    onChange={(e) => updateCharacter(i, { characterId: e.target.value })}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm flex-1 mr-2"
                                                >
                                                    {characters.map(c => (
                                                        <option key={c.character_id} value={c.character_id}>
                                                            {c.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                <button
                                                    onClick={() => removeCharacter(i)}
                                                    className="text-gray-500 hover:text-red-400"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <select
                                                    value={char.expression}
                                                    onChange={(e) => updateCharacter(i, { expression: e.target.value })}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                                                >
                                                    {EXPRESSIONS.map(exp => (
                                                        <option key={exp} value={exp}>{exp}</option>
                                                    ))}
                                                </select>
                                                <select
                                                    value={char.pose}
                                                    onChange={(e) => updateCharacter(i, { pose: e.target.value })}
                                                    className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                                                >
                                                    {POSES.map(pose => (
                                                        <option key={pose} value={pose}>{pose}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ))}
                                    {state.selectedCharacters.length === 0 && (
                                        <div className="text-center py-4 border-2 border-dashed border-gray-800 rounded-lg text-gray-600 text-sm">
                                            No characters selected
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Style & Camera */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Style</label>
                                    <select
                                        value={state.style.base}
                                        onChange={(e) => setState(s => ({ ...s, style: { ...s.style, base: e.target.value as any } }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="manga">Manga</option>
                                        <option value="western">Western Comic</option>
                                        <option value="webtoon">Webtoon</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-300">Quality</label>
                                    <select
                                        value={state.style.quality}
                                        onChange={(e) => setState(s => ({ ...s, style: { ...s.style, quality: e.target.value as any } }))}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="standard">Standard</option>
                                        <option value="high">High Quality</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-300">Camera Angle</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {ANGLES.map(angle => (
                                        <button
                                            key={angle.id}
                                            onClick={() => setState(s => ({ ...s, cameraAngle: angle.id as any }))}
                                            className={`px-3 py-2 text-xs rounded-lg border transition-colors ${state.cameraAngle === angle.id
                                                    ? 'bg-blue-600 border-blue-500 text-white'
                                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                                }`}
                                        >
                                            {angle.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {state.error && (
                                <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{state.error}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900 rounded-b-xl">
                        <button
                            onClick={onClose}
                            disabled={state.isGenerating}
                            className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={state.isGenerating || !state.sceneDescription.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {state.isGenerating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-4 h-4" />
                                    Generate
                                </>
                            )}
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
