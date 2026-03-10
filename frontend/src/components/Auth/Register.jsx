import React, { useState } from "react";
import axiosClient from "../../api/axiosClient";

const steps = ["username", "email", "password", "confirmPassword"];

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const currentField = steps[step];

  const handleChange = (e) => {
    setForm({ ...form, [currentField]: e.target.value });
  };

  const handleNext = async (e) => {
    e.preventDefault();
    if (!form[currentField]) return;

    if (currentField === "confirmPassword" && form.password !== form.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setMessage("");

    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      try {
        setLoading(true);
        const res = await axiosClient.post("/auth/register", {
          username: form.username,
          email: form.email,
          password: form.password,
        });
        setMessage(res.data);
      } catch {
        setMessage("Registration failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setMessage("");
      setStep(step - 1);
    }
  };

  const progress = ((step + 1) / steps.length) * 100;
  const isSuccess = message && message.toLowerCase().includes("success");

  return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#00d084]/[0.05] rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/3 w-[350px] h-[350px] bg-[#a855f7]/[0.04] rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00d084] to-[#06b6d4] flex items-center justify-center shadow-[0_0_20px_rgba(0,208,132,0.3)]">
              <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
            <span className="text-lg font-bold text-[#f0f2f8] tracking-tight">
              AFriendlyCoding
            </span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#11131a] border border-white/[0.08] rounded-2xl p-8 shadow-[0_4px_32px_rgba(0,0,0,0.5)]">

          {/* Header */}
          <div className="mb-6">
            <span className="text-[11px] font-mono text-[#00d084] tracking-[0.15em] uppercase">
              SETUP_IDENTITY
            </span>
            <h1 className="mt-2 text-xl font-semibold text-[#f0f2f8]">
              Create your account
            </h1>
            <p className="text-sm text-[#8890a8] mt-1">
              Step {step + 1} of {steps.length} —{" "}
              <span className="text-[#50566a] font-mono">
                {currentField.replace(/([A-Z])/g, " $1").toLowerCase()}
              </span>
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-5 h-0.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00d084] to-[#06b6d4] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Step indicators */}
          <div className="flex gap-2 mb-7">
            {steps.map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i < step
                    ? "bg-[#00d084] flex-1"
                    : i === step
                    ? "bg-[#00d084]/60 flex-1"
                    : "bg-white/[0.07] w-8"
                }`}
              />
            ))}
          </div>

          {/* Previously filled fields (read-only summary) */}
          {step > 0 && (
            <div className="mb-5 space-y-1.5">
              {steps.slice(0, step).map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#161820] border border-white/[0.05]"
                >
                  <span className="text-xs font-mono text-[#50566a] uppercase tracking-wider">
                    {s.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-xs text-[#8890a8] font-mono">
                    {s.includes("password") ? "••••••••" : form[s]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className="block mb-2 text-xs font-semibold text-[#8890a8] uppercase tracking-wider font-mono">
                {currentField.replace(/([A-Z])/g, " $1")}
              </label>
              <input
                type={currentField.includes("password") ? "password" : currentField === "email" ? "email" : "text"}
                value={form[currentField]}
                onChange={handleChange}
                autoFocus
                className="
                  w-full bg-[#161820]
                  border border-white/[0.08] rounded-xl
                  px-4 py-3
                  text-[#f0f2f8] text-sm
                  placeholder-[#50566a]
                  focus:outline-none focus:border-[#00d084]/50
                  focus:ring-2 focus:ring-[#00d084]/10
                  transition-all duration-200
                "
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#50566a] hover:text-[#8890a8] transition-colors"
                >
                  ← BACK
                </button>
              ) : (
                <span />
              )}
              <button
                type="submit"
                disabled={loading}
                className="
                  flex items-center gap-2
                  px-5 py-2.5 rounded-xl text-sm font-semibold
                  text-black bg-gradient-to-r from-[#00d084] to-[#00b874]
                  transition-all duration-200 hover:-translate-y-px
                  shadow-[0_4px_16px_rgba(0,208,132,0.25)]
                  disabled:opacity-60 disabled:cursor-not-allowed
                "
              >
                {loading
                  ? "Creating…"
                  : step === steps.length - 1
                  ? "Create account →"
                  : "Next →"}
              </button>
            </div>
          </form>

          {/* Feedback */}
          {message && (
            <div
              className={`mt-5 flex items-center gap-2 text-sm font-mono px-4 py-3 rounded-xl border ${
                isSuccess
                  ? "text-[#00d084] bg-[#00d084]/10 border-[#00d084]/20"
                  : "text-[#ef4743] bg-[#ef4743]/10 border-[#ef4743]/20"
              }`}
            >
              <span>{isSuccess ? "✓" : "✗"}</span>
              {message}
            </div>
          )}
        </div>

        <p className="text-center mt-5 text-sm text-[#50566a]">
          Already have an account?{" "}
          <a href="/login" className="text-[#00d084] hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
