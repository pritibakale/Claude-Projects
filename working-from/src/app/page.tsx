import { MonthlyCalendar } from '@/components';

export default function Home() {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Working From</h1>
        <p className="text-gray-400 mt-1">Plan your work schedule</p>
      </header>

      <main className="max-w-4xl mx-auto">
        <MonthlyCalendar />
      </main>
    </div>
  );
}
