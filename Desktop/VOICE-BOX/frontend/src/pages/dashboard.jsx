import React, { useState } from "react";
import Hero from "../components/Hero";
import Features from "../components/Features";
import Logo from "../components/Logo";
import FeedbackForm from "../components/FeedbackForm";
import FeedbackFeed from "../components/FeedbackFeed";

export default function Dashboard() {
  // 1. The Trigger: A simple number
  const [refreshKey, setRefreshKey] = useState(0);

  // 2. The Function: Adds 1 to the trigger
  const handleFeedbackSubmit = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="w-full min-h-screen bg-black">

      {/* Header */}
      <div className="w-full py-4 relative z-50">
        <div className="max-w-7xl mx-auto px-6"><Logo /></div>
      </div>

      {/* Hero & Features */}
      <div className="relative z-0"><Hero /></div>
      <div className="relative z-10 -mt-24"><Features /></div>

      {/* FEEDBACK FORM */}
      {/* We pass 'onSuccess' so the form can notify us when done */}
      <div className="relative z-20 -mt-12 max-w-7xl mx-auto px-6">
        <FeedbackForm onSuccess={handleFeedbackSubmit} />
      </div>

      {/* FEEDBACK FEED */}
      {/* 'key={refreshKey}' forces this component to reload whenever the number changes */}
      <div className="relative z-20 mt-8">
        <FeedbackFeed key={refreshKey} />
      </div>

    </div>
  );
}