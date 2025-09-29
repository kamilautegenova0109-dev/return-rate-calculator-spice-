import React, { useMemo, useState } from "react";
import { motion, AnimatePresence, useSpring, useMotionValue } from "framer-motion";

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
  ctaText = "Lower My Return Rate",
  ctaHref = "#",
  showAdvanced = true,
  defaultHandlingCost = 12,
  onLeadSubmit,
}) {
  const [price, setPrice] = useState(75);
  const [volume, setVolume] = useState(500000);
  const [rate, setRate] = useState(25);
  const [reduction, setReduction] = useState(20);
  const [handling, setHandling] = useState(defaultHandlingCost);

  const [showEmail, setShowEmail] = useState(false);
  const [lead, setLead] = useState({ name: "", email: "", company: "", consent: false });
  const [submitted, setSubmitted] = useState(false);

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

  async function handleLeadSubmit(e) {
    e.preventDefault();
    if (!lead.consent) return;
    try {
      if (onLeadSubmit) {
        await onLeadSubmit({
          name: lead.name,
          email: lead.email,
          company: lead.company,
          price,
          volume,
          currentReturnRate: constrainedRate,
          expectedReduction: constrainedReduction,
          currentCost,
          newCost,
          savings,
        });
      }
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setSubmitted(true);
    }
  }

  return (
    <div className="w-full max-w-[820px] mx-auto">
      <div className="rounded-3xl shadow-xl p-1" style={{ background: gradient }}>
        <div className="rounded-[22px] bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${brandColor}15`, color: brandColor }}
              >
                Return Rate Calculator
              </div>
              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold tracking-tight">
                See how much you can save with better visuals
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Play with the numbers. Results update instantly.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <LabeledInput label="Average product price (€)" value={price} onChange={setPrice} />
            <LabeledInput label="Annual sales volume (units)" value={volume} onChange={setVolume} />
            <LabeledInput label="Current return rate (%)" value={rate} onChange={setRate} />
            <LabeledInput
              label="Expected reduction in returns (%)"
              value={reduction}
              onChange={setReduction}
            />
          </div>

          {showAdvanced && (
            <details className="mt-3 group">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 select-none">
                Advanced (optional): Handling cost per return (€) — currently{" "}
                {formatEuro(handling)}
              </summary>
              <div className="mt-3 max-w-sm">
                <LabeledInput
                  label="Handling cost per return (€)"
                  value={handling}
                  onChange={setHandling}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Covers logistics, processing, repackaging, etc. Defaults to €
                  {defaultHandlingCost}.
                </p>
              </div>
            </details>
          )}

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatPill title="Estimated annual savings" highlight color={brandColor} value={animatedSavings} formatter={formatEuro} />
            <StatPill title="Current return cost" value={animatedCurrentCost} formatter={formatEuro} />
            <StatPill title="New return cost" value={animatedNewCost} formatter={formatEuro} />
          </div>

          <div className="mt-6">
            <a
              href={ctaHref}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center justify-center rounded-2xl px-5 py-3 font-semibold text-white shadow-md hover:shadow-lg transition active:scale-[0.99]"
              style={{ background: gradient }}
              onClick={() => setShowEmail(true)}
            >
              {ctaText}
            </a>
            <p className="text-xs text-gray-500 mt-2">
              Tip: Click the CTA to book a shoot — or leave your details below and we’ll reach out
              to help you lower this number.
            </p>
          </div>

          <AnimatePresence>
            {(showEmail || savings > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ type: "spring", stiffness: 160, damping: 18 }}
                className="mt-6 border rounded-2xl p-4 sm:p-5"
                style={{ borderColor: `${brandColor}33` }}
              >
                {submitted ? (
                  <div className="text-center">
                    <p className="mt-2 font-semibold">
                      Thanks! We’ll be in touch to help reduce your return rate.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <TextInput label="Name" value={lead.name} onChange={(v) => setLead({ ...lead, name: v })} />
                    <TextInput label="Email" type="email" value={lead.email} onChange={(v) => setLead({ ...lead, email: v })} required />
                    <TextInput label="Company" value={lead.company} onChange={(v) => setLead({ ...lead, company: v })} />
                    <div className="sm:col-span-2 flex items-start gap-2 mt-1">
                      <input
                        id="consent"
                        type="checkbox"
                        className="mt-1"
                        checked={lead.consent}
                        onChange={(e) => setLead({ ...lead, consent: e.target.checked })}
                      />
                      <label htmlFor="consent" className="text-xs text-gray-600">
                        I agree to be contacted about lowering our return rate. Privacy-first: we’ll never share your data.
                      </label>
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="submit"
                        disabled={!lead.consent}
                        className={`rounded-xl px-4 py-3 font-semibold text-white transition shadow-md ${
                          lead.consent ? "opacity-100" : "opacity-60 cursor-not-allowed"
                        }`}
                        style={{ background: gradient }}
                      >
                        Send
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 text-xs text-gray-500">
            Estimates are directional and based on your inputs. Savings = (current return cost − new return cost), including optional handling cost per return.
          </p>
        </div>
      </div>
    </div>
  );
}

function LabeledInput({ label, value, onChange, type = "number" }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <input
        type={type}
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function TextInput({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-gray-700 mb-1">{label}</div>
      <input
        type={type}
        required={required}
        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-300"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

function StatPill({ title, value, formatter = (v) => v, highlight = false, color = "#FCD62A" }) {
  const bg = highlight ? `${color}15` : "#F3F4F6";
  const text = highlight ? color : "#111827";
  return (
    <div className="rounded-2xl p-4 border" style={{ backgroundColor: bg, borderColor: `${color}22` }}>
      <div className="text-xs text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: text }}>
        {formatter(Math.round(value || 0))}
      </div>
    </div>
  );
}
