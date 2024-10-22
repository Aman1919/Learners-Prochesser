import { useRef, useState } from 'react';
import BegnnierArticle from './BegnnierArticle.json';

interface ArticleSection {
    title: string;
    content?: string;
    items?: Array<{ piece: string; movement: string }>;
    rules?: Array<{
        rule: string;
        description: string;
        conditions?: string[];
    }>;
    tactics?: Array<{
        tactic: string;
        description: string;
        example?: string;
    }>;
    patterns?: Array<{
        pattern: string;
        description: string;
    }>;
    puzzles?: { description: string };
}

interface ArticleData {
    title: string;
    sections: ArticleSection[];
}

const articleData: ArticleData = BegnnierArticle as ArticleData;

export default function Article() {
    // Create refs for each section to handle scroll
    const sectionRefs = articleData.sections.map(() => useRef<HTMLDivElement | null>(null));
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Scroll to a specific section when a navigation item is clicked
    const scrollToSection = (index: number) => {
        if (sectionRefs[index]?.current) {
            sectionRefs[index]?.current.scrollIntoView({ behavior: 'smooth' });
            setIsSidebarOpen(false)
        }
    };

    return (
        <div className="flex relative justify-between p-2">
            {/* Main content area */}
            <div className="p-6 ml-auto">
                <h1 className="text-3xl font-bold mb-6 text-center">{articleData.title}</h1>
                {articleData.sections.map((section, index) => (
                    <div key={index} ref={sectionRefs[index]} className="mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                        {section.content && <p className="mb-4">{section.content}</p>}

                        {/* Handle Piece Movements Section */}
                        {section.items && (
                            <ul className="mb-4 list-disc ml-6">
                                {section.items.map((item, idx) => (
                                    <li key={idx} className="mb-2">
                                        <strong>{item.piece}: </strong> {item.movement}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Handle Rules Section */}
                        {section.rules && (
                            <ul className="mb-4 list-disc ml-6">
                                {section.rules.map((rule, idx) => (
                                    <li key={idx} className="mb-2">
                                        <strong>{rule.rule}: </strong> {rule.description}
                                        {rule.conditions && (
                                            <ul className="ml-4 list-disc">
                                                {rule.conditions.map((condition, condIdx) => (
                                                    <li key={condIdx}>{condition}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Handle Tactics Section */}
                        {section.tactics && (
                            <ul className="mb-4 list-disc ml-6">
                                {section.tactics.map((tactic, idx) => (
                                    <li key={idx} className="mb-2">
                                        <strong>{tactic.tactic}: </strong> {tactic.description}
                                        {tactic.example && (
                                            <p>
                                                <em>Example: </em>
                                                {tactic.example}
                                            </p>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Handle Checkmate Patterns Section */}
                        {section.patterns && (
                            <ul className="mb-4 list-disc ml-6">
                                {section.patterns.map((pattern, idx) => (
                                    <li key={idx} className="mb-2">
                                        <strong>{pattern.pattern}: </strong> {pattern.description}
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Handle Puzzles Section */}
                        {section.puzzles && <p>{section.puzzles.description}</p>}
                    </div>
                ))}
            </div>

            {/* Sidebar toggle button for mobile view */}
            <button
  className={`absolute right-10 top-0 h-[50px] z-20 block md:hidden bg-gray-800 text-white rounded ${
    isSidebarOpen ? "hidden" : "block"
  }`}
  onClick={() => setIsSidebarOpen(true)}
>
  Menu
</button>
<button
  className={`absolute right-10 top-0 h-[50px] z-20 block md:hidden bg-gray-800 text-white rounded ${
    !isSidebarOpen ? "hidden" : "block"
  }`}
  onClick={() => setIsSidebarOpen(false)}
>
  ✕
</button>

            {/* Sidebar with section navigation */}
            <div
                className={`fixed top-0 right-0 h-full rounded  p-4 transform ${isSidebarOpen ? "translate-x-0 bg-black opacity-90" : "translate-x-full"
                    } transition-transform duration-300 ease-in-out md:static md:translate-x-0`}
            >
                <h2 className="text-xl text-white font-semibold mb-4">Chess Guide Sections</h2>
                <ul>
                    {articleData.sections.map((section, index) => (
                        <li key={index} className="mb-2">
                            <button
                                className="text-yellow-600 hover:underline whitespace-nowrap"
                                onClick={() => scrollToSection(index)}
                            >
                                {section.title}
                            </button>
                        </li>
                    ))}
                </ul>
        
            </div>
        </div>
    );
}
