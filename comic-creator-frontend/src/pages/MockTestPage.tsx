import { useState, useEffect } from 'react';
import { MockDB } from '@/lib/mockData/mockDB';
import {
    generateMockSeries,
    generateMockEpisodeFull
} from '@/lib/mockData/generators';
import type { Series, EpisodeFullResponse } from '@/types';

export function MockTestPage() {
    const [stats, setStats] = useState({ series: 0, episodes: 0, episodeFull: 0 });
    const [series, setSeries] = useState<Series[]>([]);
    const [testEpisode, setTestEpisode] = useState<EpisodeFullResponse | null>(null);

    useEffect(() => {
        // Load initial data
        setStats(MockDB.stats());
        setSeries(MockDB.series.getAll());
    }, []);

    const handleClear = () => {
        MockDB.clear();
        MockDB.initialize();
        setStats(MockDB.stats());
        setSeries(MockDB.series.getAll());
        alert('Database cleared and reinitialized!');
    };

    const handleGenerateSeries = () => {
        const newSeries = generateMockSeries();
        MockDB.series.create(newSeries);
        setSeries(MockDB.series.getAll());
        setStats(MockDB.stats());
        alert(`Created series: ${newSeries.title}`);
    };

    const handleGenerateEpisode = () => {
        const episode = generateMockEpisodeFull();
        setTestEpisode(episode);
        alert(`Generated episode with ${episode.pages.length} pages`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mock Data System Test</h1>

                {/* Stats */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Database Stats</h2>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded">
                            <p className="text-sm text-gray-600">Series</p>
                            <p className="text-2xl font-bold">{stats.series}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded">
                            <p className="text-sm text-gray-600">Episodes</p>
                            <p className="text-2xl font-bold">{stats.episodes}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded">
                            <p className="text-sm text-gray-600">Full Episodes</p>
                            <p className="text-2xl font-bold">{stats.episodeFull}</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Actions</h2>
                    <div className="flex gap-4 flex-wrap">
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Clear & Reinitialize
                        </button>
                        <button
                            onClick={handleGenerateSeries}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Generate Series
                        </button>
                        <button
                            onClick={handleGenerateEpisode}
                            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Generate Episode (Full)
                        </button>
                    </div>
                </div>

                {/* Series List */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Series List</h2>
                    <div className="space-y-4">
                        {series.map((s) => (
                            <div key={s.series_id} className="border p-4 rounded">
                                <h3 className="font-semibold text-lg">{s.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                                <div className="flex gap-2 mt-2">
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{s.genre}</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs">{s.status}</span>
                                    {s.art_style && (
                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                            {s.art_style.base}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Test Episode */}
                {testEpisode && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Test Episode Structure</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold">Episode</h3>
                                <p className="text-sm">{testEpisode.episode.title}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold">Pages</h3>
                                <p className="text-sm">{testEpisode.pages.length} pages</p>
                                <ul className="ml-4 mt-2 space-y-2">
                                    {testEpisode.pages.map((page) => (
                                        <li key={page.page_id} className="text-sm">
                                            Page {page.page_number}: {page.panels.length} panels
                                            <ul className="ml-4 mt-1">
                                                {page.panels.slice(0, 2).map((panel) => (
                                                    <li key={panel.panel_id} className="text-xs text-gray-600">
                                                        Panel {panel.panel_number}: {panel.text_elements?.length || 0} text elements
                                                    </li>
                                                ))}
                                            </ul>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold">Characters</h3>
                                <p className="text-sm">{testEpisode.characters.length} characters</p>
                                <ul className="ml-4 mt-2">
                                    {testEpisode.characters.map((char) => (
                                        <li key={char.character_id} className="text-sm">
                                            {char.name} - {char.appearance_description}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
