import React, { useState, useEffect } from 'react';

export const Ranking = ({ setView }: { setView: (view: string) => void }) => {
  const [rankingData, setRankingData] = useState([]);
  const [podiumData, setPodiumData] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentLimit, setCurrentLimit] = useState(15);
  // TODO: Get current user ID from authentication context or prop
  const currentUserId = 'user-id-7'; // Example user ID to highlight in the list

  // Mimic setRealViewportHeight script for viewport-related CSS (if any depends on --vh)
  useEffect(() => {
    const setRealViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setRealViewportHeight();
    window.addEventListener('resize', setRealViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(setRealViewportHeight, 100);
    });
    return () => {
      window.removeEventListener('resize', setRealViewportHeight);
      window.removeEventListener('orientationchange', setRealViewportHeight);
    };
  }, []);

  // TODO: Get BASE_APP_URL from environment or config, for image paths and API calls
  const BASE_APP_URL = 'https://placehold.co'; // Placeholder base URL

  // TODO: Replace with actual authentication logic
  const requireAuth = async () => {
    // Simulate auth check
    console.log('Checking authentication...');
    return true; // Assume authenticated for now
  };

  const fetchRankingData = async (offset = 0) => {
    setIsLoading(true);
    // TODO: Replace with actual API call to fetch ranking data
    // Example fetch:
    // const response = await fetch(`${BASE_APP_URL}/api/ranking?limit=${currentLimit}&offset=${offset}`);
    // const data = await response.json();

    // Mock data for demonstration
    const mockDataChunk = Array.from({ length: 15 }, (_, i) => ({
      id: `user-id-${offset + i + 1}`,
      name: `User ${offset + i + 1}`,
      level: `Level ${Math.floor(Math.random() * 10) + 1}`,
      points: 1000 - (offset + i) * 10,
      rank: offset + i + 1,
      profile_image_filename: null, // For placeholder
      image_url: null, // For placeholder
    }));

    // Simulate inserting current user if not in the fetched chunk for demonstration
    if (offset === 0) {
        const currentUserExists = mockDataChunk.some(user => user.id === currentUserId);
        if (!currentUserExists) {
            // Add current user at a specific simulated rank if not already there
            const currentUserData = {
                id: currentUserId,
                name: 'Você',
                level: 'Level 15',
                points: 750,
                rank: 7,
                profile_image_filename: null,
                image_url: null,
            };
            mockDataChunk.splice(6, 0, currentUserData); // Insert 'Você' at 7th position for demo
            mockDataChunk.forEach((user, idx) => user.rank = offset + idx + 1); // Re-rank after insertion
        }
    }

    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    const newUsers = mockDataChunk.slice(0, currentLimit);
    setRankingData(prevData => {
        const combined = [...prevData, ...newUsers];
        // Filter out duplicates and sort by rank to ensure proper order
        const uniqueUsers = Array.from(new Map(combined.map(item => [item['id'], item])).values());
        return uniqueUsers.sort((a, b) => a.rank - b.rank);
    });
    setPodiumData(prevData => {
        // Only update podium from the initial fetch or if new podium members come in
        if (offset === 0) {
            return newUsers.slice(0, 3).sort((a,b) => a.rank - b.rank);
        }
        return prevData;
    });
    setTotalUsersCount(100); // Simulate total users available in the ranking
    setHasMore(offset + newUsers.length < 100); // Simulate if more data exists
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      const authenticated = await requireAuth();
      if (authenticated) {
        fetchRankingData(0); // Initial fetch
        setUserPoints(1234); // TODO: Fetch actual user points for the badge
      }
    })();
  }, [currentUserId]); // Re-fetch if currentUserId changes

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchRankingData(rankingData.length);
    }
  };

  // Inline <style> for animations and responsive CSS that Tailwind doesn't easily cover directly 
  // (e.g., max-width media queries, specific custom keyframes, or very specific calc values).
  // In a real project, these would ideally be in a global CSS file or `tailwind.config.js` with plugins.
  const inlineStyles = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    /* Mobile Responsiveness from original CSS */
    @media (max-width: 768px) {
      .ranking-page-grid { padding: 20px 6px 20px 6px !important; }
      .podium-container { gap: 16px !important; }
      .player-avatar-large { width: 56px !important; height: 56px !important; }
      .podium-place.first .player-avatar-large { width: 72px !important; height: 72px !important; }
      .ranking-item { padding: 16px 18px !important; gap: 12px !important; }
      .rank-position { width: 28px !important; height: 28px !important; font-size: 0.8rem !important; border-radius: 10px !important; }
      .player-avatar { width: 40px !important; height: 40px !important; }
      .player-info { max-width: calc(100% - 40px - 12px) !important; }
      .player-name { font-size: 0.95rem !important; }
      .player-level { font-size: 0.75rem !important; }
      .player-points { font-size: 0.85rem !important; }
    }
  `;

  return (
    <div className="min-h-screen pb-20 font-sans bg-[#121212] text-white">
      <style>{inlineStyles}</style>

      <header className="flex items-center justify-between mb-5 p-3 px-3 mt-0">
        <h1 className="text-4xl font-bold text-white flex items-center gap-3">
          <i className="fas fa-trophy text-[#FF6B00] text-[1.8rem]"></i>
          Ranking
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView("PointsHistory")}
            className="flex items-center gap-2 h-11 px-4 rounded-full bg-[#1E1E1E] border border-[#2E2E2E] text-white transition-all duration-200 ease-in-out hover:border-[#FF6B00]"
          >
            <i className="fas fa-star text-[#FF6B00] text-base"></i>
            <span className="font-semibold text-base" id="user-points-display">{userPoints}</span>
          </button>
        </div>
      </header>

      <section className="ranking-page-grid flex flex-col gap-5 px-2 pb-5">
        {/* Podium Section */}
        <div className="mb-0 mt-0">
          <div className="podium-container flex justify-center items-end gap-5 mb-5 px-0">
            {podiumData.map((player, index) => {
              const rankDisplay = player.rank; // Use actual rank from data
              let orderClass = '';
              let avatarSizeClasses = 'w-16 h-16 border-[2px]'; // Default for 2nd and 3rd
              let iconSizeClasses = 'text-[1.8rem]';
              let rankBadgeClasses = 'w-8 h-8 text-[0.9rem] bg-gradient-to-br from-[#cd7f32] to-[#daa520] text-white'; // Default 3rd
              
              if (player.rank === 1) { // First place
                orderClass = 'order-2 scale-110'; // First place is in the middle, scaled
                avatarSizeClasses = 'w-20 h-20 border-[3px] player-avatar-large';
                iconSizeClasses = 'text-[2.2rem]';
                rankBadgeClasses = 'w-9 h-9 text-base bg-gradient-to-br from-[#ffd700] to-[#ffed4e] text-[#333]';
              } else if (player.rank === 2) { // Second place
                orderClass = 'order-1'; // Second place on the left
                avatarSizeClasses = 'w-16 h-16 border-[2px] player-avatar-large';
                iconSizeClasses = 'text-[1.8rem]';
                rankBadgeClasses = 'w-8 h-8 text-[0.9rem] bg-gradient-to-br from-[#c0c0c0] to-[#e8e8e8] text-[#333]';
              } else if (player.rank === 3) { // Third place
                orderClass = 'order-3'; // Third place on the right
                avatarSizeClasses = 'w-16 h-16 border-[2px] player-avatar-large';
                iconSizeClasses = 'text-[1.8rem]';
              }

              return (
                <div key={player.id} className={`podium-place flex flex-col items-center text-center relative ${orderClass}`}>
                  <div className={`relative flex items-center justify-center overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)] border-[#FF6B00] ${avatarSizeClasses}`}>
                    <img src={`https://placehold.co/${player.rank === 1 ? '80x80' : '64x64'}?text=${player.name.split(' ')[0]}`} alt="Foto de Perfil" className="w-full h-full object-cover" />
                    {/* Placeholder for icon if image fails: <i className={`fas fa-user text-[#FF6B00] ${iconSizeClasses}`}></i> */}
                    <div className={`rank-badge absolute top-[-8px] right-[-8px] flex items-center justify-center rounded-full font-bold ${rankBadgeClasses}`}>
                      {rankDisplay}
                    </div>
                  </div>
                  <p className="podium-name text-base font-semibold text-white mb-1">{player.name}</p>
                  <p className="podium-level text-[0.85rem] text-[#FF6B00] font-medium mb-1">{player.level}</p>
                  <p className="podium-points text-[0.8rem] text-[#A0A0A0] font-medium">{player.points} pts</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ranking List */}
        <ul className="ranking-list list-none p-0 m-0">
          {rankingData.map((player) => (
            <li
              key={player.id}
              className={`ranking-item grid grid-cols-[32px_1fr_auto] items-center p-[18px_20px] mb-2 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] rounded-3xl transition-all duration-200 ease-in-out w-full gap-4
                hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.1)] hover:translate-y-[-2px]
                ${player.id === currentUserId ? 'current-user bg-[rgba(255,107,0,0.1)] border-[#FF6B00]' : ''}
              `}
            >
              <div className={`rank-position flex items-center justify-center w-8 h-8 text-[0.9rem] font-semibold text-[rgba(255,255,255,0.6)] bg-[rgba(255,255,255,0.05)] rounded-xl flex-shrink-0 self-center my-auto
                ${player.id === currentUserId ? 'text-[#FF6B00] bg-[rgba(255,140,0,0.15)]' : ''}
              `}>
                {player.rank}
              </div>
              <div className="player-content flex items-center gap-3 min-w-0">
                <div className="player-avatar flex items-center justify-center overflow-hidden rounded-full bg-[rgba(255,255,255,0.05)] border-[2px] border-[#FF6B00] flex-shrink-0 w-11 h-11">
                  <img src={`https://placehold.co/44x44?text=${player.name.split(' ')[0]}`} alt="Foto de Perfil" className="w-full h-full object-cover" />
                  {/* <i className="fas fa-user text-[#FF6B00] text-[1.2rem]"></i> */}
                </div>
                <div className="player-info flex flex-col gap-px min-w-0 flex-1 max-w-[calc(100%-44px-12px)]">
                  <p className="player-name text-base font-semibold text-white m-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{player.name}</p>
                  <p className="player-level text-sm text-[#FF6B00] font-medium m-0 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{player.level}</p>
                </div>
              </div>
              <p className={`player-points text-[0.9rem] font-semibold text-[#A0A0A0] text-right flex-shrink-0 whitespace-nowrap
                ${player.id === currentUserId ? 'text-[#FF6B00]' : ''}
              `}>
                {player.points} pts
              </p>
            </li>
          ))}
        </ul>

        {/* Load More Button */}
        <div className="load-more-container flex justify-center mt-5 px-5">
          {hasMore && (
            <button
              id="load-more-btn"
              onClick={handleLoadMore}
              className={`load-more-btn flex items-center gap-2 px-6 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl text-white text-[0.9rem] font-medium cursor-pointer transition-all duration-300 ease-in-out no-underline font-inherit
                hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)] hover:translate-y-[-2px]
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} group
              `}
              disabled={isLoading}
            >
              <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ease-in-out ${isLoading ? 'animate-spin' : 'group-hover:translate-y-0.5'}`}></i>
              Carregar Mais
              <span className="users-count text-[#A0A0A0] text-xs font-normal">({rankingData.length}/{totalUsersCount})</span>
            </button>
          )}
        </div>
      </section>

      {/* TODO: Integrate bottom navigation as a separate React component or JSX fragment if needed */}
      {/* For Font Awesome icons to display, ensure Font Awesome CSS is loaded globally in your React app (e.g., in index.html or App.js). */}
    </div>
  );
};
