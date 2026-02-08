'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  description: string;
  image?: string;
}

export function EventsCarousel() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Fetch events or use default placeholder
    setEvents([
      {
        id: '1',
        title: 'Company Event',
        date: '2026-02-15',
        description: 'Upcoming company event',
      },
    ]);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? events.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === events.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (!events.length) {
    return <div>No events available</div>;
  }

  const currentEvent = events[currentIndex];

  return (
    <div className="events-carousel w-full">
      <div className="flex items-center justify-between">
        <button onClick={goToPrevious} className="p-2">
          <ChevronLeft size={24} />
        </button>
        <div className="flex-1 mx-4">
          <h3 className="text-xl font-bold">{currentEvent.title}</h3>
          <p className="text-gray-600">{currentEvent.date}</p>
          <p className="text-gray-700">{currentEvent.description}</p>
        </div>
        <button onClick={goToNext} className="p-2">
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}
