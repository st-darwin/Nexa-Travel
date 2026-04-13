import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  text: string;
  icon?: string; // e.g., "magic-star.svg"
  loadingText?: string;
}

const Button = ({ 
  loading = false, 
  text, 
  icon = "magic-star.svg", 
  loadingText = "Synthesizing...", 
  className = "",
  ...props 
}: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`
        relative group overflow-hidden px-6 py-3.5 w-full 
        flex items-center justify-center gap-3 
        rounded-2xl font-semibold text-white transition-all duration-300
        ${loading 
          ? "bg-neutral-800 cursor-not-allowed opacity-80" 
          : "bg-black hover:bg-neutral-900 active:scale-[0.98] shadow-soft hover:shadow-lg"
        }
        ${className}
      `}
    >
      {/* Visual Depth Overlay */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 pointer-events-none" />

      <div className="relative flex items-center gap-3">
        <img
          className={`size-6 transition-transform duration-500 ${
            loading ? "animate-spin opacity-70" : "group-hover:rotate-12"
          }`}
          src={`/assets/icons/${loading ? "loader.svg" : icon}`}
          alt=""
        />
        
        <span className="tracking-tight">
          {loading ? loadingText : text}
        </span>
      </div>
    </button>
  );
};

export default Button;