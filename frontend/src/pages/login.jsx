import { useState } from "react";
import "./login.css";
function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [step, setStep] = useState("details");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // SEND OTP
  const sendOtp = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setMessage("Enter your name.");
      return;
    }

    if (!email.trim()) {
      setMessage("Enter your Gmail address.");
      return;
    }

    if (!phone.trim()) {
      setMessage("Enter your phone number.");
      return;
    }

    setLoading(true);
    setMessage("");

  try {
    const response = await fetch(
      "https://personal-finance-management-production-7a21.up.railway.app/api/auth/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      }
    );

      const result = await response.json();

      if (result.success) {
        setStep("otp");
        setMessage("OTP sent successfully.");
      } else {
        setMessage(result.message || "Failed to send OTP.");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const verifyOtp = async (event) => {
    event.preventDefault();

    if (otp.length !== 6) {
      setMessage("Enter the 6-digit OTP.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            otp,
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        localStorage.setItem(
          "fintrack_user",
          JSON.stringify(result.user)
        );

        onLogin(result.user);
      } else {
        setMessage(result.message || "Invalid OTP.");
      }
    } catch (error) {
      console.error("Verify OTP error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const backToDetails = () => {
    setStep("details");
    setOtp("");
    setMessage("");
  };

  return (
    <main className="login-page">

      <nav className="login-nav">
        <div className="login-logo">
          Fin<span>Track</span>
        </div>

        <div className="login-nav-text">
          Personal finance, simplified.
        </div>
      </nav>

      <div className="login-content">

        {/* LEFT SIDE */}
        <section className="login-hero">

          <div className="floating-card card-wallet">
            ₹
          </div>

          <div className="floating-card card-chart">
            ↗
          </div>

          <div className="floating-card card-coin">
            $
          </div>

          <div className="hero-circle">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
          </div>

          <div className="hero-copy">

            <p className="hero-label">
              SMART MONEY MANAGEMENT
            </p>

            <h1>
              Take control
              <br />
              of your <span>money.</span>
            </h1>

            <p className="hero-description">
              Track your spending, manage your budgets,
              build your goals and understand your finances
              from one simple workspace.
            </p>

          </div>

        </section>

        {/* LOGIN CARD */}
        <section className="login-card">

          {step === "details" ? (

            <>
              <div className="login-card-heading">

                <span className="login-eyebrow">
                  WELCOME TO FINTRACK
                </span>

                <h2>
                  Let's get
                  <br />
                  started.
                </h2>

                <p>
                  Enter your details to receive a secure OTP.
                </p>

              </div>

              <form onSubmit={sendOtp}>

                {/* NAME */}
                <label>
                  Your name
                </label>

                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  autoComplete="name"
                  required
                />

                {/* EMAIL */}
                <label>
                  Gmail address
                </label>

                <input
                  type="email"
                  placeholder="you@gmail.com"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoComplete="email"
                  required
                />

                {/* PHONE */}
                <label>
                  Phone number
                </label>

                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  autoComplete="tel"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send OTP"}
                  <span>→</span>
                </button>

              </form>
            </>

          ) : (

            <>
              <div className="login-card-heading">

                <span className="login-eyebrow">
                  VERIFY IDENTITY
                </span>

                <h2>
                  Enter your
                  <br />
                  <span>OTP.</span>
                </h2>

                <p>
                  We sent a 6-digit verification code
                  for <strong>{name}</strong>.
                </p>

              </div>

              <form onSubmit={verifyOtp}>

                <label>
                  Verification code
                </label>

                <input
                  className="otp-input"
                  type="text"
                  inputMode="numeric"
                  maxLength="6"
                  placeholder="000000"
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  autoComplete="one-time-code"
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                  <span>→</span>
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={backToDetails}
                >
                  ← Change details
                </button>

              </form>
            </>

          )}

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

          <div className="login-security">
            <span>●</span>
            Secure OTP authentication
          </div>

        </section>

      </div>

    </main>
  );
}

export default Login;