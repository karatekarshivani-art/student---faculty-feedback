'use client';

export default function ThemeToggle() {
  return (
    <div className="theme-toggle">
      <button 
        onClick={() => {
          document.documentElement.classList.toggle('dark-mode');
        }} 
        title="Toggle Dark Mode"
      >
        🌓
      </button>
    </div>
  );
}
