import React from "react";

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon */}
      <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
        <span className="text-white text-xl font-bold">V</span>
      </div>

      {/* Logo Text */}
      <div>
        <div className="text-lg font-extrabold">VoiceBox</div>
        <div className="text-xs text-slate-400 -mt-1">Anonymous Feedback</div>
      </div>
    </div>
  );
}
