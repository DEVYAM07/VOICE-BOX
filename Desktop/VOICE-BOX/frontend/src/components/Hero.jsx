import React from "react";

export default function Hero() {
  return (
    <section className="pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="glass rounded-2xl p-12 relative overflow-hidden">
          
          {/* background lights */}
          <div className="absolute -left-40 -top-28 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-purple-900/80 to-transparent opacity-50 pointer-events-none blur-3xl"></div>
          <div className="absolute right-[-120px] top-40 w-[420px] h-[420px] rounded-full bg-gradient-to-tr from-teal-700/60 to-transparent opacity-40 pointer-events-none blur-3xl"></div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="pill mx-auto">✨ 100% Anonymous & Secure</div>

            <h1 className="mt-8 hero-title text-6xl md:text-7xl text-white">
              <span>Your Voice, </span>
              <span className="gradient-accent">Amplified</span>
              <br />
              <span className="text-slate-300 block text-5xl md:text-6xl">
                Without the Filter
              </span>
            </h1>

            <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg">
              Share honest feedback, vote on ideas that matter, and help shape a better workplace.
              Your identity stays completely protected.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
