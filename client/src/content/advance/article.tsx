import React, { useRef, useState } from 'react';
import AdvancedArticle from './advanceArticle.json';

const ChessConcepts: React.FC = () => {
  const sectionRefs = AdvancedArticle.concepts.map(() => useRef<HTMLDivElement | null>(null));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Scroll to a specific section when a navigation item is clicked
  const scrollToSection = (index: number) => {
    if (sectionRefs[index]?.current) {
      sectionRefs[index]?.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex relative justify-between p-2">
      {/* Main content area */}
      <div className="p-6 ml-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Advanced Chess Concepts</h1>
        {AdvancedArticle.concepts.map((concept, index) => (
          <div key={index} ref={sectionRefs[index]} className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">{concept.title}</h2>
            <p className="mb-4">{concept.description}</p>

            {/* Handle Subtopics Section */}
            {concept.subtopics && (
              <ul className="mb-4 list-disc ml-6">
                {concept.subtopics.map((subtopic, subIdx) => (
                  <li key={subIdx} className="mb-2">
                    <strong>{subtopic.title}: </strong> {subtopic.details}
                  </li>
                ))}
              </ul>
            )}
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
        className={`absolute top-0 right-0 min-h-[400px] rounded p-4 transform ${
          isSidebarOpen ? "translate-x-0 bg-black opacity-90" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:static md:translate-x-0`}
      >
        <h2 className="text-xl text-white font-semibold mb-4">Chess Guide Sections</h2>
        <ul>
          {AdvancedArticle.concepts.map((section, index) => (
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
};

export default ChessConcepts;
