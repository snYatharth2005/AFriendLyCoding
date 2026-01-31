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

    if (
      currentField === "confirmPassword" &&
      form.password !== form.confirmPassword
    ) {
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

  return (
    <div className="min-h-screen bg-[#0b0d13] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-xl bg-[#11131a] border border-white/10 p-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-mono text-blue-400 tracking-widest">
            SETUP_IDENTITY
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">
            Create your account
          </h1>
          <p className="text-sm text-white/50">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6 h-1 w-full bg-white/5 rounded">
          <div
            className="h-full bg-blue-500 rounded transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Active Input */}
        <form onSubmit={handleNext}>
          <label className="block mb-2 text-xs text-white/50 font-mono">
            {currentField.replace(/([A-Z])/g, " $1").toUpperCase()}
          </label>

          <input
            type={currentField.includes("password") ? "password" : "text"}
            value={form[currentField]}
            onChange={handleChange}
            autoFocus
            className="
              w-full bg-[#0b0d13]
              border border-white/10
              rounded-md px-4 py-3
              text-white text-sm
              focus:outline-none
              focus:border-blue-500/50
              focus:ring-2 focus:ring-blue-500/20
              transition
            "
          />

          {/* Commands */}
          <div className="mt-6 flex items-center justify-between">
            {step > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="
                  text-xs font-mono text-white/50
                  hover:text-white/80
                  transition
                "
              >
                ← BACK
              </button>
            ) : (
              <span />
            )}

            <button
              disabled={loading}
              className="
                text-sm font-mono text-blue-400
                hover:text-blue-300
                transition
              "
            >
              {step === steps.length - 1 ? "EXECUTE →" : "NEXT →"}
            </button>
          </div>
        </form>

        {/* Feedback */}
        {message && (
          <p
            className={`mt-6 text-sm font-mono ${
              message.includes("success")
                ? "text-blue-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Register;
