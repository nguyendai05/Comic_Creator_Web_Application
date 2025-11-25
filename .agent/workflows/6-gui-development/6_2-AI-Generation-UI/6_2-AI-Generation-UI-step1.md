---
description: AI Generation UI (Dialog, Prompt Builder, Progress) -> Implementation Steps 1
---

### Step 1: Create AIGenerationDialog Component
```typescript
//File:src/components/editor/AIGenerationDialog.tsx
import { useState, useEffect, useRef } from 'react';import {X,Wand2,User,Camera,Palette,Loader2,AlertCircle,CheckCircle,Plus,Trash2,} from 'lucide-react';
import { api } from '@/lib/api';
import { useEditorStore } from '@/stores/editorStore';
import type { Panel, Character, AIJob } from '@/types';

interface AIGenerationDialogProps {isOpen: boolean;onClose: () => void;panel: Panel;characters: Character[];}

interface SelectedCharacter {character_id: string;expression: string;pose: string;}

const EXPRESSIONS = ['neutral', 'happy', 'sad', 'angry', 'surprised', 'scared', 'determined'];
const POSES = ['standing', 'sitting', 'running', 'fighting', 'talking', 'thinking', 'action'];
const CAMERA_ANGLES = ['close-up', 'medium', 'wide', 'extreme-wide', 'low-angle', 'high-angle', 'dutch-angle'];
const ART_STYLES = ['manga', 'western', 'webtoon', 'realistic', 'cartoon'];

export function AIGenerationDialog({
  isOpen,
  onClose,
  panel,
  characters,
}: AIGenerationDialogProps) {
  const { updatePanel } = useEditorStore();
  
  // Form state
  const [sceneDescription, setSceneDescription] = useState(panel.script_text || '');
  const [selectedCharacters, setSelectedCharacters] = useState<SelectedCharacter[]>([]);
  const [artStyle, setArtStyle] = useState<string>('manga');
  const [quality, setQuality] = useState<'standard' | 'high'>('standard');
  const [cameraAngle, setCameraAngle] = useState<string>('medium');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<AIJob | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cleanup polling on unmount or close
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSceneDescription(panel.script_text || '');
      setSelectedCharacters([]);
      setArtStyle('manga');
      setQuality('standard');
      setCameraAngle('medium');
      setIsGenerating(false);
      setProgress(0);
      setError(null);
      setCurrentJob(null);
    }
  }, [isOpen, panel]);
  
  const addCharacter = () => {
    if (characters.length === 0) return;
    
    setSelectedCharacters((prev) => [
      ...prev,
      {
        character_id: characters[0].character_id,
        expression: 'neutral',
        pose: 'standing',
      },
    ]);
  };
  
  const removeCharacter = (index: number) => {
    setSelectedCharacters((prev) => prev.filter((_, i) => i !== index));
  };
  
  const updateCharacter = (index: number, updates: Partial<SelectedCharacter>) => {
    setSelectedCharacters((prev) =>
      prev.map((char, i) => (i === index ? { ...char, ...updates } : char))
    );
  };
  
  const handleGenerate = async () => {
    if (!sceneDescription.trim()) {
      setError('Please enter a scene description');
      return;
    }
    
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    
    try {
      // Create AI job
      const job = await api.createAIJob({
        job_type: 'panel_generation',
        panel_id: panel.panel_id,
        input: {
          scene_description: sceneDescription,
          characters: selectedCharacters.map((c) => ({
            character_id: c.character_id,
            expression: c.expression,
            pose: c.pose,
          })),
          style: {
            base: artStyle,
            quality,
          },
          panel: {
            camera_angle: cameraAngle,
            aspect_ratio: `${panel.position.width}:${panel.position.height}`,
          },
        },
      });
      
      setCurrentJob(job);
      console.log('🎨 AI Job created:', job.job_id);
      
      // Start polling for status
      pollIntervalRef.current = setInterval(async () => {
        try {
          const status = await api.getAIJob(job.job_id);
          console.log('📊 Job status:', status.status, status.progress);
          
          if (status.progress) {
            setProgress(status.progress);
          }
          
          if (status.status === 'success' && status.result) {
            // Update panel with generated image
            updatePanel(panel.panel_id, {
              image_url: status.result.image_url,
              thumbnail_url: status.result.thumbnail_url,
              generation_prompt: status.result.prompt_used,
              generation_config: {
                style: artStyle,
                quality,
                camera_angle: cameraAngle,
              },
            });
            
            // Cleanup and close
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
            }
            setIsGenerating(false);
            setProgress(100);
            
            // Close dialog after short delay
            setTimeout(() => {
              onClose();
            }, 1000);
            
          } else if (status.status === 'failed') {
            throw new Error(status.error?.message || 'Generation failed');
          }
        } catch (err) {
          console.error('Polling error:', err);
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          setError(err instanceof Error ? err.message : 'An error occurred');
          setIsGenerating(false);
        }
      }, 2000);
      
    } catch (err) {
      console.error('❌ Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to start generation');
      setIsGenerating(false);
    }
  };
  
  const handleCancel = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (currentJob) {
      api.cancelAIJob(currentJob.job_id).catch(console.error);
    }
    setIsGenerating(false);
    setProgress(0);
    setCurrentJob(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Generate Panel with AI</h2>
              <p className="text-sm text-gray-400">Panel {panel.panel_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isGenerating ? (
            /* Progress View */
            <div className="py-12 text-center">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
                <div
                  className="absolute inset-0 border-4 border-blue-500 rounded-full transition-all duration-500"
                  style={{
                    clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin(progress * 0.0628)}% ${50 - 50 * Math.cos(progress * 0.0628)}%, 50% 50%)`,
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{progress}%</span>
                </div>
              </div>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white font-medium mb-2">Generating your panel...</p>
              <p className="text-gray-400 text-sm mb-6">This may take up to 30 seconds</p>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          ) : (
            /* Form View */
            <div className="space-y-6">
              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400">{error}</p>
                </div>
              )}
              
              {/* Scene Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scene Description *
                </label>
                <textarea
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                  placeholder="Describe what's happening in this panel..."
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be specific about actions, environment, lighting, and mood
                </p>
              </div>
              
              {/* Characters */}
              {characters.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Characters
                    </label>
                    <button
                      onClick={addCharacter}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Add Character
                    </button>
                  </div>
                  
                  {selectedCharacters.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No characters selected. Add characters for better consistency.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {selectedCharacters.map((char, index) => {
                        const characterData = characters.find(
                          (c) => c.character_id === char.character_id
                        );
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg"
                          >
                            <User className="w-8 h-8 text-gray-400" />
                            <div className="flex-1 grid grid-cols-3 gap-2">
                              <select
                                value={char.character_id}
                                onChange={(e) =>
                                  updateCharacter(index, { character_id: e.target.value })
                                }
                                className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
                              >
                                {characters.map((c) => (
                                  <option key={c.character_id} value={c.character_id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={char.expression}
                                onChange={(e) =>
                                  updateCharacter(index, { expression: e.target.value })
                                }
                                className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
                              >
                                {EXPRESSIONS.map((exp) => (
                                  <option key={exp} value={exp}>
                                    {exp}
                                  </option>
                                ))}
                              </select>
                              <select
                                value={char.pose}
                                onChange={(e) =>
                                  updateCharacter(index, { pose: e.target.value })
                                }
                                className="bg-gray-700 text-white rounded px-2 py-1 text-sm border border-gray-600"
                              >
                                {POSES.map((pose) => (
                                  <option key={pose} value={pose}>
                                    {pose}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              onClick={() => removeCharacter(index)}
                              className="p-1.5 text-gray-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {/* Style & Camera */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Palette className="w-4 h-4 inline mr-1" />
                    Art Style
                  </label>
                  <select
                    value={artStyle}
                    onChange={(e) => setArtStyle(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  >
                    {ART_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Camera className="w-4 h-4 inline mr-1" />
                    Camera Angle
                  </label>
                  <select
                    value={cameraAngle}
                    onChange={(e) => setCameraAngle(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600"
                  >
                    {CAMERA_ANGLES.map((angle) => (
                      <option key={angle} value={angle}>
                        {angle.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Quality */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Quality
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setQuality('standard')}
                    className={`flex-1 p-3 rounded-lg border ${
                      quality === 'standard'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="block font-medium">Standard</span>
                    <span className="text-xs opacity-75">1 credit • Fast</span>
                  </button>
                  <button
                    onClick={() => setQuality('high')}
                    className={`flex-1 p-3 rounded-lg border ${
                      quality === 'high'
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <span className="block font-medium">High Quality</span>
                    <span className="text-xs opacity-75">2 credits • Better detail</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        {!isGenerating && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Cost: <span className="text-white font-medium">{quality === 'high' ? 2 : 1} credit</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={!sceneDescription.trim()}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Wand2 className="w-4 h-4" />
                Generate
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```