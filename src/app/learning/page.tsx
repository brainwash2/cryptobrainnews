import React from 'react';
import Image from 'next/image';

export const metadata = { title: 'Learning Hub | CryptoBrainNews' };

export default function LearningHub() {
  const courses = [
    {
      title: 'Bitcoin Fundamentals',
      level: 'Beginner',
      duration: '2h · 5 Mods',
      image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=500',
      color: 'bg-orange-500',
    },
    {
      title: 'DeFi Yield Strategies',
      level: 'Intermediate',
      duration: '4h · 8 Mods',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=500',
      color: 'bg-blue-500',
    },
    {
      title: 'On-Chain Analysis',
      level: 'Advanced',
      duration: '6h · 12 Mods',
      image: 'https://images.unsplash.com/photo-1642104704074-907c0698cbd9?auto=format&fit=crop&q=80&w=500',
      color: 'bg-purple-500',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-6xl font-bold font-heading mb-4">
          LEARNING <span className="text-primary">HUB.</span>
        </h1>
        <p className="text-gray-400 text-xl font-mono">
          MASTER THE ON-CHAIN ECONOMY
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold font-heading mb-6 border-b border-gray-800 pb-4">
          START HERE: FOUNDATIONS
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative h-64 mb-4 overflow-hidden border border-gray-800 group-hover:border-primary transition-colors">
                <div
                  className={`absolute top-4 left-4 z-10 ${course.color} text-black text-xs font-bold px-2 py-1 uppercase`}
                >
                  {course.level}
                </div>
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold font-heading mb-2 group-hover:text-primary transition-colors">
                {course.title}
              </h3>
              <p className="text-gray-500 text-sm font-mono">
                {course.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
