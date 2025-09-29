import React, { useMemo, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

const clamp = (val, min, max) => Math.min(Math.max(val ?? 0, min), max);

function useAnimatedNumber(n) {
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { stiffness: 180, damping: 24, mass: 0.7 });
  const [display, setDisplay] = useState(0);
  React.useEffect(() => {
    mv.set(n);
    const unsub = spring.on("change", (v) => setDisplay(v));
    return () => unsub();
  }, [n]);
  return display;
}

function formatEuro(value) {
  if (isNaN(value)) return "€0";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function ReturnRateCalculatorCard({
  brandColor = "#FCD62A",
  accentColor = "#000000",
}) {
  const [price, setPrice] = useState(75);
  const [volume, setVolume] = useState(500000);
  const [rate, setRate] = useState(25);
  const [reduction, setReduction] = useState(20);
  const [handling, setHandling] = useState(12);

  const constrainedRate = clamp(rate, 0, 100);
  const constrainedReduction = clamp(reduction, 0, 100);
  const newRate = Math.max(0, constrainedRate - constrainedReduction);

  const { currentCost, newCost, savings } = useMemo(() => {
    const currentReturns = volume * (constrainedRate / 100);
    const newReturns = volume * (newRate / 100);
    const currentCost = currentReturns * (price + (handling || 0));
    const newCost = newReturns * (price + (handling || 0));
    const savings = Math.max(0, currentCost - newCost);
    return { currentCost, newCost, savings };
  }, [price, volume, constrainedRate, newRate, handling]);

  const animatedSavings = useAnimatedNumber(savings);
  const animatedCurrentCost = useAnimatedNumber(currentCost);
  const animatedNewCost = useAnimatedNumber(newCost);

  const gradient = `linear-gradient(135deg, ${brandColor}, ${accentColor})`;

  return (
    <div className="w-full min-h-screen flex justify-center items-start bg-white p-8">
      <div className="max-w-2xl w-full rounded-3xl shadow-xl p-1" style={{ background: gradient }}>
        <div className="rounded-[22px] bg-white p-6 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">
              Find Out How Better Visuals Can Save You Money
            </h1>
            <p className="mt-2 text-gray-600">
              Adjust the numbers below to see how much poor visuals might be costing you.
            </p>
          </div>

          {/* Input fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <LabeledInput label="Average product price (€)" value={price} onChange={setPrice} />
            <LabeledInput label="Annual sales volume (units)" value={volume} onChange={setVolume} />
            <LabeledInput label="Current return rate (%)" value={rate} onChange={setRate} />
            <LabeledInput label="Expected reduction in returns (%)" value={reduction} onChange={setReduction} />
            <LabeledInput label="Handling cost per return (€)" value={handling} onChange={setHandling} />
          </div>

          {/* Results */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            <StatPill
              title="Estimated annual savings"
              highlight
              color={brandColor}
              value={animatedSavings}
              formatter={formatEuro}
            />
            <StatPill title="Current return cost" value={animatedCurrentCost} formatter={formatEuro} />
            <StatPill title="New return cost" value={animatedNewCost} formatter={formatEuro} />
          </div>

          {/* CTA */}
          <div className="text-center">
            <a
              href="https://spicemediaproduction.com/page67529823.html"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block px-8 py-4 text-lg font-semibold rounded-2xl shadow-md transition transform hover:scale-[1.02]"
              style={{ background: brandColor, color: "#000" }}
            >
              Talk to SPICE
            </a>
            <p className="mt-3 text-xs text-gray-500">
              Click to discuss how SPICE Media Production can help you reduce your return rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Subcomponents ────────────────────────── */

function LabeledInput({ label, value, onChange }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <input
        type="number"
        className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-400"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function StatPill({ title, value, formatter = (v) => v, highlight = false, color = "#FCD62A" }) {
  const bg = highlight ? `${color}22` : "#F9FAFB";
  const text = highlight ? color : "#111827";
  return (
    <div className="rounded-2xl p-5 border text-center" style={{ backgroundColor: bg, borderColor: `${color}44` }}>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-2xl font-extrabold" style={{ color: text }}>
        {formatter(Math.round(value || 0))}
      </div>
    </div>
  );
}
