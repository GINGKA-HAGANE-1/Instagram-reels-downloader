"use client";

import { useState } from 'react';

export default function AboutPage() {
  const [videoError, setVideoError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-3xl font-bold mb-8">About Me</h1>
        <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden shadow-xl">
          {videoError ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
              <p className="text-gray-600 dark:text-gray-400">
                Video could not be loaded. Please make sure gingka.mp4 is in the public directory.
              </p>
            </div>
          ) : (
            <div className="relative">
              <video
                src="/gingka.mp4"
                className="w-full h-full"
                autoPlay
                loop
                muted={!isMuted}
                playsInline
                controls
                onError={() => setVideoError(true)}
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {!isMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 