'use client';

import { useState } from 'react';
import { WorkLocation } from '@/types';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Reference Friday that is a WFO day (Jan 23, 2026)
const REFERENCE_OFFICE_FRIDAY = new Date(2026, 0, 23);

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getWorkLocation(year: number, month: number, day: number): WorkLocation {
  const date = new Date(year, month, day);
  const dayOfWeek = date.getDay();

  // Weekend - no work
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return null;
  }

  // Monday (1) and Tuesday (2) - Office
  if (dayOfWeek === 1 || dayOfWeek === 2) {
    return 'office';
  }

  // Wednesday (3) and Thursday (4) - Home
  if (dayOfWeek === 3 || dayOfWeek === 4) {
    return 'home';
  }

  // Friday (5) - Alternate (Jan 23, 2026 is Office)
  if (dayOfWeek === 5) {
    // Calculate weeks difference from reference Friday
    const diffTime = date.getTime() - REFERENCE_OFFICE_FRIDAY.getTime();
    const diffWeeks = Math.round(diffTime / (7 * 24 * 60 * 60 * 1000));
    // Even weeks from reference = Office, Odd weeks = Home
    return diffWeeks % 2 === 0 ? 'office' : 'home';
  }

  return null;
}

function getDayClass(location: WorkLocation): string {
  switch (location) {
    case 'home':
      return 'day-home';
    case 'office':
      return 'day-office';
    case 'holiday':
      return 'day-holiday';
    case 'leave':
      return 'day-leave';
    default:
      return '';
  }
}

export default function MonthlyCalendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  // Calculate monthly totals
  let wfoCount = 0;
  let wfhCount = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const location = getWorkLocation(currentYear, currentMonth, day);
    if (location === 'office') wfoCount++;
    if (location === 'home') wfhCount++;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Monthly Schedule</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-[var(--card-border)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-lg font-medium min-w-[160px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-[var(--card-border)] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="text-center text-sm text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square p-1 border border-[var(--card-border)]" />;
          }

          const location = getWorkLocation(currentYear, currentMonth, day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();

          return (
            <div
              key={day}
              className={`aspect-square flex flex-col items-center p-1 rounded-lg text-sm
                border border-[var(--card-border)] transition-colors hover:bg-[var(--card-border)]
                ${isToday ? 'ring-2 ring-white ring-opacity-50' : ''}`}
            >
              <span className={`text-xs ${location ? '' : 'text-gray-600'}`}>{day}</span>
              {location && (
                <div
                  className={`mt-auto mb-1 px-1.5 py-0.5 rounded text-[10px] font-medium truncate w-full text-center
                    ${location === 'office' ? 'bg-[var(--accent-office)] text-white' : ''}
                    ${location === 'home' ? 'bg-[var(--accent-home)] text-white' : ''}
                    ${location === 'holiday' ? 'bg-[var(--accent-holiday)] text-white' : ''}
                    ${location === 'leave' ? 'bg-[var(--accent-leave)] text-white' : ''}`}
                >
                  {location === 'office' ? 'Office' : location === 'home' ? 'WFH' : location}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-6 pt-4 border-t border-[var(--card-border)]">
        <div className="flex-1 p-3 rounded-lg bg-[var(--accent-office)]">
          <div className="text-2xl font-bold text-white">{wfoCount}</div>
          <div className="text-sm text-white/80">Office days</div>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-[var(--accent-home)]">
          <div className="text-2xl font-bold text-white">{wfhCount}</div>
          <div className="text-sm text-white/80">WFH days</div>
        </div>
        <div className="flex-1 p-3 rounded-lg bg-[var(--card-border)]">
          <div className="text-2xl font-bold text-white">{wfoCount + wfhCount}</div>
          <div className="text-sm text-white/80">Total work days</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-[var(--card-border)]">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent-home)] text-white">WFH</div>
          <span className="text-sm text-gray-400">Work from Home</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--accent-office)] text-white">Office</div>
          <span className="text-sm text-gray-400">Work from Office</span>
        </div>
      </div>
    </div>
  );
}
