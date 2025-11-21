import React, { useState } from 'react';

interface HistoryItem {
  id: string;
  title: string;
  summary: string;
  details: string;
}

export const PointsHistoryLogic = ({ setView }: { setView: (view: string) => void }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([
    { id: '1', title: 'Reward Earned', summary: 'You earned 50 points!', details: 'Completed the "Daily Workout" challenge on 2023-10-26.' },
    { id: '2', title: 'Points Redeemed', summary: 'You used 20 points.', details: 'Redeemed for a discount coupon on 2023-10-25.' },
    { id: '3', title: 'Bonus Points', summary: 'Holiday bonus: 100 points!', details: 'Special holiday promotion bonus on 2023-10-24.' },
    { id: '4', title: 'Reward Earned', summary: 'You earned 25 points!', details: 'Logged 7 days of activity on 2023-10-23.' }
  ]);

  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedItems(prevExpandedItems => {
      const newExpandedItems = new Set(prevExpandedItems);
      if (newExpandedItems.has(id)) {
        newExpandedItems.delete(id);
      } else {
        newExpandedItems.add(id);
      }
      return newExpandedItems;
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Points History</h1>

      <div
        onClick={() => setView("Dashboard")}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 cursor-pointer inline-block"
      >
        Go to Dashboard
      </div>

      <div className="space-y-4">
        {historyItems.map(item => (
          <div key={item.id} className="border border-gray-200 rounded-lg shadow-sm">
            <div
              className={`feed-item expandable p-4 cursor-pointer transition-all duration-300 flex justify-between items-center
                ${expandedItems.has(item.id) ? 'bg-gray-100 rounded-t-lg' : 'hover:bg-gray-50 rounded-lg'}`}
              onClick={() => toggleExpand(item.id)}
            >
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600 mt-1">{item.summary}</p>
              </div>
              <span className={`transform transition-transform duration-300 ${expandedItems.has(item.id) ? 'rotate-180' : ''}`}>
                &#9660;
              </span>
            </div>

            <div
              className={`expandable-content overflow-hidden transition-all duration-300 ease-in-out
                ${expandedItems.has(item.id) ? 'max-h-96 opacity-100 p-4 pt-0' : 'max-h-0 opacity-0 p-0'}`}
            >
              <p className="text-gray-700">{item.details}</p>
              <div
                onClick={() => setView("PointDetails")}
                className="mt-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer inline-block"
              >
                View full details
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};