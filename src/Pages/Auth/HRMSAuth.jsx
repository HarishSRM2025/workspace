import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../config/api";
import "./hrms-auth.css";

/* ─────────────────────────────────────
   DESIGN TOKENS (JS-side only, for inline style references)
───────────────────────────────────── */
const T = {
  blueM: "#3B7BFF",
  teal:  "#0FC4C4",
  ink3:  "#7A88A8",
};

/* ─────────────────────────────────────
   FIELD
───────────────────────────────────── */
function Field({ label, type = "text", placeholder, autoComplete, required, onInput, onChange, value, icon }) {
  const [show, setShow]       = useState(false);
  const [focused, setFocused] = useState(false);
  const isPw = type === "password";

  return (
    <div className="h-fg">
      {label && (
        <label className="h-label">
          {label}{required && <span className="h-req">*</span>}
        </label>
      )}
      <div className="h-iw">
        <i
          className={`fa-solid ${icon} h-ico`}
          style={{ color: focused ? T.blueM : T.ink3 }}
        />
        <input
          type={isPw ? (show ? "text" : "password") : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onInput={onInput}
          onChange={onChange}
          value={value}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`h-input${isPw ? " h-input-pr" : ""}`}
        />
        {isPw && (
          <button type="button" className="h-eye" onClick={() => setShow(v => !v)}>
            <i className={`fa-regular ${show ? "fa-eye-slash" : "fa-eye"}`} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   STRENGTH BAR
───────────────────────────────────── */
function StrengthBar({ value }) {
  if (!value) return null;

  let s = 0;
  if (value.length >= 8)          s++;
  if (/[A-Z]/.test(value))        s++;
  if (/[0-9]/.test(value))        s++;
  if (/[^A-Za-z0-9]/.test(value)) s++;

  const colors = ["", "#EF4444", "#F59E0B", T.blueM, T.teal];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div>
      <div className="h-sbar">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`h-ss${s >= i ? " filled" : ""}`}
            style={{ background: s >= i ? colors[s] : undefined }}
          />
        ))}
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 600, marginTop: 3,
        color: s <= 1 ? "#EF4444" : s === 2 ? "#F59E0B" : s === 3 ? T.blueM : T.teal,
      }}>
        {labels[s]}{labels[s] ? " password" : ""}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   LEFT PANEL
───────────────────────────────────── */
const FEATURES = [
  { icon: "fa-users",           label: "People",     desc: "Hire, onboard & manage from day one" },
  { icon: "fa-money-bill-wave", label: "Payroll",    desc: "Auto payslips, tax & statutory filings" },
  { icon: "fa-clock",           label: "Attendance", desc: "Geo-fencing, biometric, real-time sync" },
  { icon: "fa-chart-pie",       label: "Analytics",  desc: "Live dashboards & workforce insights" },
];

const AVATARS = [
  { letter: "R", color: "#3B7BFF" },
  { letter: "S", color: "#8B5CF6" },
  { letter: "K", color: "#0FC4C4" },
  { letter: "P", color: "#F5B731" },
];

function LeftPanel() {
  return (
    <div className="h-left">
      <div className="h-aurora" />
      <div className="h-grid" />
      <div className="h-orb h-orb-1" />
      <div className="h-orb h-orb-2" />
      <div className="h-orb h-orb-3" />

      <div className="h-left-inner">
        {/* Logo */}
        <div className="h-logo">
          <div className="h-logo-mark"><i className="fa-solid fa-sitemap" /></div>
          <span className="h-logo-name">PeopleOS</span>
          <span className="h-logo-badge">HRMS</span>
        </div>

        {/* Mid content */}
        <div className="h-mid">
          <div className="h-live">
            <div className="h-live-dot" />
            <span>Trusted by 340+ organisations</span>
          </div>
          <h1 className="h-headline">
             
            Bring your people together with <br /><em>one unified workforce platform today.</em>
          </h1>
          <p className="h-sub">
            Manage every stage of your workforce journey with one intelligent HR platform. From employee onboarding and attendance tracking to payroll processing, leave management, and performance reviews, streamline daily operations with ease. Improve productivity, reduce manual work, and gain real-time insights to support better decisions across your entire organization every day.

          </p>
          <div className="h-features">
            {FEATURES.map(f => (
              <div className="h-feat" key={f.label}>
                <div className="h-feat-ico"><i className={`fa-solid ${f.icon}`} /></div>
                <div>
                  <div className="h-feat-n">{f.label}</div>
                  <div className="h-feat-d">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="h-left-foot">
          <div style={{ display: "flex", alignItems: "center" }}>
            <div className="h-avs">
              {AVATARS.map(a => (
                <div key={a.letter} className="h-av" style={{ background: a.color }}>
                  {a.letter}
                </div>
              ))}
            </div>
            <div className="h-av-txt"><strong>12,400+</strong> managed daily</div>
          </div>
          <div className="h-stats">
            {[["4.9★", "Rating"], ["99.9%", "Uptime"]].map(([n, l]) => (
              <div className="h-stat" key={l}>
                <div className="h-stat-n">{n}</div>
                <div className="h-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────
   SIGN IN
───────────────────────────────────── */
function SignIn({ onSwitch, tenant_id, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.TENANT_USER_SIGNIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: tenant_id,
          user_email: email,
          user_password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sign in failed");
      }

      // Store user data in localStorage
      // The gateway wraps the auth service response, so we need to extract the inner data
      const authData = data.data || data;
      localStorage.setItem("hrms_tenant_user_data", JSON.stringify({
        success: true,
        data: authData.data || authData
      }));
      
      // Call onSuccess to redirect
      onSuccess();
    } catch (err) {
      console.error("Sign in error:", err);
      setError(err.message || "An error occurred during sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-card" onSubmit={handleSignIn}>
      <div className="h-panel">
        <div>
          <div className="h-title">Welcome <em>back</em></div>
          <div className="h-title-sub">Sign in to your workspace to continue.</div>
        </div>

        {error && (
          <div style={{
            padding: "12px",
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "15px",
            border: "1px solid #FECACA",
          }}>
            {error}
          </div>
        )}

        <Field
          label="Email address"
          type="email"
          placeholder="workmail@company.com"
          autoComplete="email"
          icon="fa-envelope"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="h-fg">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label className="h-label">Password</label>
            <a href="#" className="h-fgt">Forgot password?</a>
          </div>
          <Field
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            icon="fa-lock"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="h-extras">
          <label className="h-chk">
            <input
              type="checkbox"
              style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.blueM }}
            />
            Keep me signed in
          </label>
        </div>

        <button type="submit" className="h-btn h-btn-si" disabled={loading}>
          <i className="fa-solid fa-arrow-right-to-bracket" />
          {loading ? "Signing in..." : "Sign In to Workspace"}
        </button>

        <div className="h-info">
          <i className="fa-solid fa-shield-halved" />
          <span>Protected by enterprise-grade TLS encryption. Your data never leaves your region.</span>
        </div>

        <div className="h-sw">
          New to PeopleOS?
          <button type="button" className="h-sw-btn" onClick={onSwitch}>Create an account →</button>
        </div>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────
   SIGN UP
───────────────────────────────────── */
function SignUp({ onSwitch, tenant_id}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPw] = useState("");
  
  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!termsAgreed) {
      setError("Please agree to the Terms & Privacy Policy");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.TENANT_USER_SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenant_id: tenant_id,
          user_name: formData.fullName,
          user_email: formData.email,
          user_phone: formData.phone,
          user_password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Sign up failed");
      }

      
      // Store user data in localStorage
      // localStorage.setItem("hrms_tenant_user_data", JSON.stringify(data));
      
      // Call onSuccess to redirect
      onSwitch();
    } catch (err) {
      console.error("Sign up error:", err);
      setError(err.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="h-card" onSubmit={handleSignUp}>
      <div className="h-panel">
        <div>
          <div className="h-title">Get <em>started</em></div>
          <div className="h-title-sub">Create your account and join 340+ organisations.</div>
        </div>

        {error && (
          <div style={{
            padding: "12px",
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "15px",
            border: "1px solid #FECACA",
          }}>
            {error}
          </div>
        )}

        <Field
          label="Full Name"
          placeholder="e.g. Ravi Kumar"
          autoComplete="name"
          required
          icon="fa-user"
          value={formData.fullName}
          onChange={handleInputChange("fullName")}
        />

        <div className="h-row2">
          <Field
            label="Work Email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            required
            icon="fa-envelope"
            value={formData.email}
            onChange={handleInputChange("email")}
          />
          <Field
            label="Phone"
            type="tel"
            placeholder="+91 98765 43210"
            autoComplete="tel"
            required
            icon="fa-phone"
            value={formData.phone}
            onChange={handleInputChange("phone")}
          />
        </div>

        <div className="h-fg">
          <label className="h-label">Password <span className="h-req">*</span></label>
          <Field
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            icon="fa-lock"
            value={formData.password}
            onChange={(e) => {
              handleInputChange("password")(e);
              setPw(e.target.value);
            }}
          />
          <StrengthBar value={pw} />
        </div>

        <Field
          label="Confirm Password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          required
          icon="fa-lock"
          value={formData.confirmPassword}
          onChange={handleInputChange("confirmPassword")}
        />

        <label className="h-chk">
          <input
            type="checkbox"
            style={{ width: 15, height: 15, cursor: "pointer", accentColor: T.blueM }}
            checked={termsAgreed}
            onChange={(e) => setTermsAgreed(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <a href="#" style={{ color: T.blueM, textDecoration: "none", fontWeight: 700 }}>
              Terms &amp; Privacy Policy
            </a>
          </span>
        </label>

        <button type="submit" className="h-btn h-btn-su" disabled={loading}>
          <i className="fa-solid fa-user-check" />
          {loading ? "Creating Account..." : "Create My Account"}
        </button>

        <p className="h-terms">
          By registering you agree to our{" "}
          <a href="#">Privacy Policy</a> &amp; <a href="#">Data Processing Agreement</a>.
        </p>

        <div className="h-sw">
          Already have an account?
          <button type="button" className="h-sw-btn" onClick={onSwitch}>Sign in →</button>
        </div>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────── */
export default function HRMSAuth() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [tenantId, setTenantId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.TENANT_GET(slug));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Get Tenant Details failed");
        }

        // The gateway wraps the response, which could result in data.data or data.data.data
        const tenantInfo = data?.data?.data || data?.data;
        
        if (!tenantInfo || !tenantInfo.id) {
            throw new Error("Invalid tenant slug or tenant ID not found");
        }

        setTenantId(tenantInfo.id);
      } catch (err) {
        console.error("Tenant Details error:", err);
        setError(err.message || "An error occurred during Get Tenant Details");
      } finally {
        setLoading(false);
      }
    };
    if (slug) {
      fetchTenant();
    }
  }, [slug]);
  
  const toSignin = useCallback(() => setMode("signin"), []);
  const toSignup = useCallback(() => setMode("signup"), []);
  
  const handleAuthSuccess = useCallback(() => {
    // Redirect to home page after successful authentication
    navigate(`/${slug}/home`, { replace: true });
  }, [slug, navigate]);

  return (
    <div className="h-page">
      <LeftPanel />
      <div className="h-right">
        <div className="h-auth">
          {loading ? (
            <div className="h-panel">Loading tenant details...</div>
          ) : error ? (
            <div className="h-panel">
              <div style={{ color: "#DC2626" }}>{error}</div>
            </div>
          ) : mode === "signin"
            ? <SignIn key="si" tenant_id={tenantId} onSwitch={toSignup} onSuccess={handleAuthSuccess} />
            : <SignUp key="su" tenant_id={tenantId} onSwitch={toSignin}  />
          }
        </div>
      </div>
    </div>
  );
}