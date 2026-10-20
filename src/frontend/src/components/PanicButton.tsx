import { useTradeRisk } from "@/context/TradeRiskContext";
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type PanicStatus = "idle" | "activating" | "secured";

const STEPS = [
  "Activating emergency protection...",
  "Cancelling pending trades...",
  "Closing active positions...",
  "Enabling Safe Mode...",
];

export function PanicButton() {
  const { setSafeMode } = useTradeRisk();
  const [showConfirm, setShowConfirm] = useState(false);
  const [panicStatus, setPanicStatus] = useState<PanicStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handlePanicClick = () => {
    setShowConfirm(true);
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  const handleActivate = async () => {
    setShowConfirm(false);
    setPanicStatus("activating");
    setCurrentStep(0);
    setCompletedSteps([]);

    // Step 0: Activating emergency protection
    setCurrentStep(0);
    await delay(800);
    setCompletedSteps([0]);

    // Step 1: Cancel pending trades
    setCurrentStep(1);
    await delay(800);
    setCompletedSteps([0, 1]);

    // Step 2: Close active positions
    setCurrentStep(2);
    await delay(800);
    setCompletedSteps([0, 1, 2]);

    // Step 3: Enable Safe Mode
    setCurrentStep(3);
    setSafeMode(true);
    await delay(600);
    setCompletedSteps([0, 1, 2, 3]);

    setPanicStatus("secured");
  };

  const handleDismissSecured = () => {
    setPanicStatus("idle");
    setCompletedSteps([]);
    setCurrentStep(0);
  };

  return (
    <>
      {/* Panic Button */}
      <AnimatePresence mode="wait">
        {panicStatus === "idle" && (
          <motion.button
            key="panic-btn"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handlePanicClick}
            data-ocid="panic.open_modal_button"
            aria-label="Emergency Stop — Panic Button"
            className="relative flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.45 0.22 27), oklch(0.38 0.20 20))",
              border: "1px solid oklch(0.58 0.22 27 / 0.6)",
              boxShadow:
                "0 0 18px oklch(0.50 0.22 27 / 0.45), 0 0 6px oklch(0.55 0.24 27 / 0.3) inset",
              color: "oklch(0.97 0.02 27)",
              animation: "panicPulse 2.5s ease-in-out infinite",
            }}
          >
            <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">PANIC</span>
          </motion.button>
        )}

        {panicStatus === "activating" && (
          <motion.div
            key="panic-activating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
            style={{
              background: "oklch(0.38 0.20 20 / 0.2)",
              border: "1px solid oklch(0.55 0.22 27 / 0.4)",
              color: "oklch(0.78 0.16 27)",
            }}
          >
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span className="hidden sm:inline">Securing...</span>
          </motion.div>
        )}

        {panicStatus === "secured" && (
          <motion.button
            key="panic-secured"
            type="button"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={handleDismissSecured}
            data-ocid="panic.secured_button"
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: "oklch(0.35 0.16 160 / 0.25)",
              border: "1px solid oklch(0.52 0.18 160 / 0.5)",
              color: "oklch(0.78 0.18 160)",
              boxShadow: "0 0 12px oklch(0.52 0.18 160 / 0.25)",
            }}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Secured</span>
            <X className="h-3 w-3 opacity-60" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            key="confirm-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "oklch(0 0 0 / 0.75)",
              backdropFilter: "blur(8px)",
            }}
            onClick={(e) => e.target === e.currentTarget && handleCancel()}
            data-ocid="panic.dialog"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="relative w-full max-w-md rounded-2xl p-6 space-y-5"
              style={{
                background: "oklch(0.13 0.04 265 / 0.97)",
                border: "1px solid oklch(0.55 0.22 27 / 0.35)",
                boxShadow:
                  "0 0 60px oklch(0.45 0.22 27 / 0.25), 0 24px 64px oklch(0 0 0 / 0.6)",
              }}
            >
              {/* Warning icon */}
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{
                    background: "oklch(0.45 0.22 27 / 0.15)",
                    border: "1px solid oklch(0.55 0.22 27 / 0.3)",
                  }}
                >
                  <AlertTriangle
                    className="h-6 w-6"
                    style={{ color: "oklch(0.72 0.20 27)" }}
                  />
                </div>
                <div>
                  <h2
                    className="text-base font-bold"
                    style={{ color: "oklch(0.95 0.02 265)" }}
                  >
                    Activate Emergency Protection?
                  </h2>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.55 0.05 265)" }}
                  >
                    This action cannot be undone immediately.
                  </p>
                </div>
              </div>

              {/* Body */}
              <div
                className="rounded-xl p-4 space-y-2.5"
                style={{
                  background: "oklch(0.16 0.05 265 / 0.6)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
              >
                <p
                  className="text-sm"
                  style={{ color: "oklch(0.78 0.04 265)" }}
                >
                  This will immediately:
                </p>
                {[
                  "Cancel all pending trades",
                  "Simulate closing all active positions",
                  "Enable Safe Mode automatically",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <div
                      className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                      style={{ background: "oklch(0.72 0.20 27)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "oklch(0.70 0.04 265)" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  data-ocid="panic.cancel_button"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    background: "oklch(0.20 0.04 265 / 0.6)",
                    border: "1px solid oklch(1 0 0 / 0.1)",
                    color: "oklch(0.75 0.04 265)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleActivate}
                  data-ocid="panic.confirm_button"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition-all hover:opacity-90 active:scale-95"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.45 0.22 27), oklch(0.38 0.20 20))",
                    border: "1px solid oklch(0.58 0.22 27 / 0.5)",
                    boxShadow: "0 0 20px oklch(0.45 0.22 27 / 0.35)",
                    color: "oklch(0.97 0.02 27)",
                  }}
                >
                  ⚠️ Activate
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activation Progress Overlay */}
      <AnimatePresence>
        {panicStatus === "activating" && (
          <motion.div
            key="activating-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "oklch(0 0 0 / 0.80)",
              backdropFilter: "blur(12px)",
            }}
            data-ocid="panic.loading_state"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-sm rounded-2xl p-6 space-y-5"
              style={{
                background: "oklch(0.13 0.04 265 / 0.97)",
                border: "1px solid oklch(0.55 0.22 27 / 0.3)",
                boxShadow:
                  "0 0 60px oklch(0.45 0.22 27 / 0.2), 0 24px 64px oklch(0 0 0 / 0.5)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{
                    background: "oklch(0.45 0.22 27 / 0.15)",
                    border: "1px solid oklch(0.55 0.22 27 / 0.3)",
                  }}
                >
                  <ShieldAlert
                    className="h-5 w-5"
                    style={{ color: "oklch(0.72 0.20 27)" }}
                  />
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: "oklch(0.88 0.04 265)" }}
                  >
                    Emergency Protocol
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.52 0.05 265)" }}
                  >
                    Securing your portfolio...
                  </p>
                </div>
              </div>

              {/* Step list */}
              <div className="space-y-3">
                {STEPS.map((step, idx) => {
                  const isDone = completedSteps.includes(idx);
                  const isActive = currentStep === idx && !isDone;
                  return (
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: idx <= currentStep ? 1 : 0.3, x: 0 }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      <div
                        className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full"
                        style={{
                          background: isDone
                            ? "oklch(0.52 0.18 160 / 0.2)"
                            : isActive
                              ? "oklch(0.45 0.22 27 / 0.2)"
                              : "oklch(0.20 0.04 265 / 0.4)",
                          border: isDone
                            ? "1px solid oklch(0.52 0.18 160 / 0.5)"
                            : isActive
                              ? "1px solid oklch(0.55 0.22 27 / 0.5)"
                              : "1px solid oklch(1 0 0 / 0.08)",
                        }}
                      >
                        {isDone ? (
                          <CheckCircle
                            className="h-3.5 w-3.5"
                            style={{ color: "oklch(0.68 0.18 160)" }}
                          />
                        ) : isActive ? (
                          <Loader2
                            className="h-3.5 w-3.5 animate-spin"
                            style={{ color: "oklch(0.72 0.20 27)" }}
                          />
                        ) : (
                          <div
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ background: "oklch(0.40 0.04 265)" }}
                          />
                        )}
                      </div>
                      <span
                        className="text-sm"
                        style={{
                          color: isDone
                            ? "oklch(0.72 0.14 160)"
                            : isActive
                              ? "oklch(0.82 0.06 265)"
                              : "oklch(0.42 0.04 265)",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Secured Full-Screen Card */}
      <AnimatePresence>
        {panicStatus === "secured" && (
          <motion.div
            key="secured-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
              background: "oklch(0 0 0 / 0.78)",
              backdropFilter: "blur(12px)",
            }}
            data-ocid="panic.success_state"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 16 }}
              transition={{ type: "spring", stiffness: 350, damping: 28 }}
              className="w-full max-w-sm rounded-2xl p-8 space-y-6 text-center"
              style={{
                background: "oklch(0.13 0.04 265 / 0.97)",
                border: "1px solid oklch(0.52 0.18 160 / 0.35)",
                boxShadow:
                  "0 0 80px oklch(0.52 0.18 160 / 0.2), 0 24px 64px oklch(0 0 0 / 0.5)",
              }}
            >
              {/* Shield icon with success glow */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: 0.1,
                }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: "oklch(0.52 0.18 160 / 0.12)",
                  border: "2px solid oklch(0.52 0.18 160 / 0.45)",
                  boxShadow: "0 0 40px oklch(0.52 0.18 160 / 0.25)",
                }}
              >
                <CheckCircle
                  className="h-10 w-10"
                  style={{ color: "oklch(0.68 0.18 160)" }}
                />
              </motion.div>

              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "oklch(0.88 0.14 160)" }}
                >
                  Portfolio Secured
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-sm"
                  style={{ color: "oklch(0.60 0.06 265)" }}
                >
                  All positions closed. Safe Mode enabled.
                </motion.p>
              </div>

              {/* Summary rows */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl p-4 space-y-2.5 text-left"
                style={{
                  background: "oklch(0.16 0.05 265 / 0.6)",
                  border: "1px solid oklch(1 0 0 / 0.06)",
                }}
              >
                {[
                  "Pending trades cancelled",
                  "Active positions closed",
                  "Safe Mode enabled",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5">
                    <CheckCircle
                      className="h-4 w-4 flex-shrink-0"
                      style={{ color: "oklch(0.62 0.18 160)" }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: "oklch(0.72 0.05 265)" }}
                    >
                      {item}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                type="button"
                onClick={handleDismissSecured}
                data-ocid="panic.close_button"
                className="w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: "oklch(0.20 0.05 265 / 0.6)",
                  border: "1px solid oklch(1 0 0 / 0.1)",
                  color: "oklch(0.70 0.04 265)",
                }}
              >
                Dismiss
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
