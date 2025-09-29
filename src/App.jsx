import React from "react";
import ReturnRateCalculatorCard from "./ReturnRateCalculatorCard.jsx";

export default function App() {
  // Sends lead data to Netlify Function, which forwards to your CRM
  const onLeadSubmit = async (payload) => {
    try {
      const res = await fetch("/.netlify/functions/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Network response was not ok");
    } catch (e) {
      console.error("Lead submit failed:", e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <ReturnRateCalculatorCard
        ctaHref="https://your-booking-link.example"
        onLeadSubmit={onLeadSubmit}
        brandColor="#7C3AED"
        accentColor="#14B8A6"
        defaultHandlingCost={12}
      />
    </div>
  );
}
