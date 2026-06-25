import Image from "next/image";

export const BrandingPanel: React.FC = () => {
  return (
    <div className="relative flex-col justify-center items-center hidden h-full p-10 lg:flex lg:w-[50%] bg-[#030914] overflow-hidden">
      
      {/* Dynamic Background Effects */}
      {/* 1. Deep glowing orb in the center behind the logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      
      {/* 2. Sweeping light rays */}
      <div className="absolute top-[-20%] left-[-10%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-60 rotate-12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-20%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-800/10 via-transparent to-transparent opacity-40 -rotate-12 blur-3xl pointer-events-none" />
      
      {/* 3. Abstract Network / Constellation placeholder (SVG Overlay) */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none mix-blend-screen">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="network-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" fill="#fff" />
              <circle cx="150" cy="80" r="3" fill="#fff" />
              <circle cx="80" cy="160" r="1.5" fill="#fff" />
              <circle cx="180" cy="180" r="2.5" fill="#fff" />
              <path d="M 20 20 L 150 80 L 80 160 L 20 20" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.4" />
              <path d="M 150 80 L 180 180 L 80 160" fill="none" stroke="#fff" strokeWidth="0.5" strokeOpacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#network-pattern)" />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-10 select-none max-w-lg">
        
        {/* Glassmorphism Logo Container */}
        <div className="relative p-12 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden group">
          {/* subtle inner shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="relative w-[140px] h-[140px]">
            <Image 
              src="/logo.png" 
              alt="Naprocs Logo" 
              fill 
              className="object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              priority 
            />
          </div>
        </div>

        {/* Text Area */}
        <div className="flex flex-col items-center justify-center text-center">
          <h1 className="text-[48px] font-serif tracking-widest text-white leading-none mb-3 drop-shadow-lg">
            NAPROCS
          </h1>
          <p className="text-[22px] font-serif text-blue-200/80 tracking-widest drop-shadow-md">
            AI Echo System
          </p>
        </div>
      </div>
    </div>
  );
};

