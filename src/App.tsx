import { useState, useEffect, useRef } from 'react'
import './App.css'

const CHARACTERS = ['ス', 'ガ', 'シ', 'カ', 'オ'];

type PatternConfig = {
  pattern: string;
  name: string;
  type: 'youtube' | 'image';
  src: string;
  themeClass: string;
  bgClass: string;
};

const SPECIAL_PATTERNS: PatternConfig[] = [
  {
    pattern: 'スガシカオ',
    name: 'おめでとう！スガシカオだね！',
    type: 'youtube',
    src: 'Aw3l547PNP4',
    themeClass: 'success-theme',
    bgClass: 'bg-success-light',
  },
  {
    pattern: 'カシスガオ',
    name: 'カシス顔',
    type: 'image',
    src: '/kashisugao.png', // ユーザーに配置してもらう想定
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'オカシガス',
    name: 'お菓子ガス',
    type: 'image',
    src: '/okashigasu.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'ガスオカシ',
    name: 'ガスお菓子',
    type: 'image',
    src: '/okashigasu.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'オスシガカ',
    name: 'お寿司画家',
    type: 'image',
    src: '/osushigaka.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'シカガオス',
    name: '鹿が押忍！',
    type: 'image',
    src: '/shikagaosu.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'カオガスシ',
    name: '顔が寿司',
    type: 'image',
    src: '/kaogasushi.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'スシガカオ',
    name: '寿司が顔',
    type: 'image',
    src: '/kaogasushi.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'カオスシガ',
    name: 'カオス滋賀',
    type: 'image',
    src: '/kaosushiga.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'シガカオス',
    name: '滋賀カオス',
    type: 'image',
    src: '/kaosushiga.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'カスガオシ',
    name: '春日推し',
    type: 'image',
    src: '/kasugaoshi.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
  {
    pattern: 'オシカスガ',
    name: '推し春日',
    type: 'image',
    src: '/kasugaoshi.png',
    themeClass: 'special-theme',
    bgClass: 'bg-special-light',
  },
];

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

type GameState = 'idle' | 'running' | 'stopping' | 'finished';

function App() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [slots, setSlots] = useState<string[]>(Array(5).fill(''));
  const [targetSlots, setTargetSlots] = useState<string[]>([]);
  const [showRetry, setShowRetry] = useState(false);

  // Animation interval ref
  const animationInterval = useRef<number | undefined>(undefined);

  // Handle Start
  const handleStart = () => {
    setGameState('running');
  };

  // Handle Stop
  const handleStop = () => {
    // Determine the final result immediately (shuffle of characters, unique)
    const finalResult = shuffle(CHARACTERS);
    setTargetSlots(finalResult);
    setGameState('stopping');
    setShowRetry(false);
  };

  // Handle Retry
  const handleRetry = () => {
    setGameState('idle');
    setSlots(Array(5).fill(''));
    setShowRetry(false);
  };

  // Effect for running state (all slots flickering)
  useEffect(() => {
    if (gameState === 'running') {
      animationInterval.current = window.setInterval(() => {
        const randomSlots = Array(5).fill('').map(() => 
          CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
        );
        setSlots(randomSlots);
      }, 50);
    }
    
    return () => {
      if (animationInterval.current) clearInterval(animationInterval.current);
    };
  }, [gameState]);

  // Improvement for smoother spinning during stop phase
  // We can override the logic above to use a single high-frequency interval
  useEffect(() => {
    if (gameState === 'stopping') {
      if (animationInterval.current) clearInterval(animationInterval.current);
      
      const startTime = Date.now();
      const spinInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const slotsToReveal = Math.floor(elapsed / 200); // 1 char every 200ms

        if (slotsToReveal >= 5) {
          // All done
          setSlots(targetSlots);
          setGameState('finished');
          clearInterval(spinInterval);
        } else {
          // Update slots
          setSlots(prev => {
            const next = [...prev];
            // Set fixed ones
            for (let i = 0; i < slotsToReveal; i++) {
              next[i] = targetSlots[i];
            }
            // Spin remaining
            for (let i = slotsToReveal; i < 5; i++) {
              next[i] = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];
            }
            return next;
          });
        }
      }, 50); // Update every 50ms for smooth spinning

      return () => clearInterval(spinInterval);
    }
  }, [gameState, targetSlots]);


  // Check result
  const resultString = slots.join('');
  const matchedPattern = SPECIAL_PATTERNS.find(p => p.pattern === resultString);
  const isSuccess = resultString === 'スガシカオ'; // Original success for specific styling if needed, or rely on pattern config
  const isClose = gameState === 'finished' && !matchedPattern && resultString.startsWith('スガ');

  // Handle Retry visibility delay
  useEffect(() => {
    if (gameState === 'finished') {
      if (matchedPattern) {
        // Delay for special patterns or success
        const timer = setTimeout(() => {
          setShowRetry(true);
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        // Immediate for failure or "close" (unless isSuccess is treated as matchedPattern which it is)
        setShowRetry(true);
      }
    }
  }, [gameState, matchedPattern]);

  const getBackgroundColor = () => {
    if (gameState !== 'finished') return '';
    if (matchedPattern) return matchedPattern.bgClass;
    if (isClose) return 'bg-close-light';
    return 'bg-failure-light';
  };

  const getResultMessage = () => {
    if (matchedPattern) return matchedPattern.name;
    if (isClose) return '惜しい！もう一息！';
    return '残念！スガシカオじゃないね...';
  };

  const getThemeClass = () => {
    if (matchedPattern) return matchedPattern.themeClass;
    if (isClose) return 'close-theme';
    return 'failure-theme';
  };

  return (
    <div className="container">
      {/* Background Overlay */}
      <div className={`background-overlay ${getBackgroundColor()}`} />
      
      {/* Title (only visible on idle state at top) */}
      {gameState === 'idle' && (
        <>
        <h1 className="game-title">スガシカオルーレット</h1>
        <p className="game-description">スガシカオを目指してルーレットを回そう！</p>
        </>
      )}
      
      {/* Sunburst Effect for Success */}
      {isSuccess && <div className="sunburst" />}

      <div className="roulette-container">
        {slots.map((char, index) => (
          <div key={index} className={`square ${!char ? 'empty' : ''} ${gameState === 'finished' && matchedPattern ? 'square-success' : ''}`}>
            {char}
          </div>
        ))}
      </div>

      {gameState === 'finished' && (
        <div className={`result-message ${getThemeClass()}`}>
          {getResultMessage()}
        </div>
      )}

      {gameState === 'finished' && matchedPattern && (
        <div className="result-container">
          {matchedPattern.type === 'youtube' && (
            <div className="video-container">
              <iframe 
                width="100%" 
                height="100%" 
                src={`https://www.youtube.com/embed/${matchedPattern.src}`} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          )}

          {matchedPattern.type === 'image' && (
            <div className="image-result-container">
              <img src={matchedPattern.src} alt={matchedPattern.name} className="result-image" />
            </div>
          )}
        </div>
      )}

      {gameState === 'idle' && (
        <button className="action-button btn-start" onClick={handleStart}>
          Start!
        </button>
      )}
      
      {gameState === 'running' && (
        <button className="action-button btn-stop" onClick={handleStop}>
          Stop!
        </button>
      )}

      {gameState === 'finished' && showRetry && (
        <button className="action-button btn-retry" onClick={handleRetry}>
          Retry!
        </button>
      )}
    </div>
  )
}

export default App
