"use client";

import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";

export default function MatchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const closeModal = () => {
    setIsOpen(false);
    // We do NOT clear innerHTML here to avoid breaking the widget reference
    // The widget will overwrite it next time anyway
  };

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // If nodes are added (widget injected), open the modal
        if (mutation.type === "childList" && contentRef.current?.hasChildNodes()) {
           setIsOpen(true);
        }
      }
    });

    if (contentRef.current) {
      observer.observe(contentRef.current, { childList: true, subtree: true });
    }

    return () => observer.disconnect();
  }, []);

  // FIX: Use 'invisible' instead of 'hidden'.
  // This keeps the container in the DOM so the widget can calculate dimensions.
  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
      }`}
    >
      <div className="bg-white w-full h-full md:max-w-4xl md:h-[85vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white">
          <h2 className="font-bold text-gray-800">Match Details</h2>
          <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* TARGET CONTAINER */}
        <div 
          id="match-details-container" 
          ref={contentRef}
          className="flex-1 overflow-y-auto bg-gray-50"
        >
          {/* Widget injects here */}
        </div>
      </div>
    </div>
  );
}