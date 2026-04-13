import "./App.css";
import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CreateSnippetPage from "./pages/CreateSnippetPage";
import { BASE_URL, requestJson } from "./lib/api";

const TOKEN_KEY = "snippetVaultToken";
const USER_KEY = "snippetVaultUser";

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

function AppShell() {
  const navigate = useNavigate();
  const [snippets, setSnippets] = useState([]);
  const [snippetsLoading, setSnippetsLoading] = useState(false);
  const [snippetsError, setSnippetsError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("signin");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [createMessage, setCreateMessage] = useState("");

  useEffect(() => {
    loadSnippets();

    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const getErrorMessage = (error, fallbackMessage) => {
    if (error instanceof Error) {
      if (error.message.includes("Failed to fetch")) {
        return `Cannot reach backend at ${BASE_URL}. Start local server and retry.`;
      }

      return error.message;
    }

    return fallbackMessage;
  };

  const loadSnippets = async () => {
    setSnippetsLoading(true);
    setSnippetsError("");

    try {
      const data = await requestJson("/snippets");
      setSnippets(Array.isArray(data) ? data : []);
    } catch (error) {
      setSnippetsError(getErrorMessage(error, "Unable to load snippets."));
    } finally {
      setSnippetsLoading(false);
    }
  };

  const clearCreateForm = () => {
    setTitle("");
    setContent("");
  };

  const saveSnippet = async () => {
    if (!title.trim() || !content.trim()) {
      setCreateMessage("Please add a title and note text.");
      return;
    }

    if (!token) {
      setCreateMessage("Sign in first to create a new note.");
      navigate("/login");
      return;
    }

    try {
      setSaveLoading(true);
      setCreateMessage("");

      const data = await requestJson("/snippets", {
        method: "POST",
        token,
        body: { title: title.trim(), content: content.trim() },
      });

      const newSnippet = data && data.snippet ? data.snippet : data;
      setSnippets((prev) => [newSnippet, ...prev]);
      clearCreateForm();
      setCreateMessage("Snippet saved.");
      navigate("/home");
    } catch (error) {
      setCreateMessage(getErrorMessage(error, "Failed to create snippet."));
    } finally {
      setSaveLoading(false);
    }
  };

  const submitAuth = async (event) => {
    event.preventDefault();

    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage("Email and password are required.");
      return;
    }

    if (authMode === "signup" && !authName.trim()) {
      setAuthMessage("Name is required for sign up.");
      return;
    }

    try {
      setAuthLoading(true);
      setAuthMessage("");

      const endpoint = authMode === "signup" ? "/signup" : "/login";
      const payload =
        authMode === "signup"
          ? {
              name: authName.trim(),
              email: authEmail.trim(),
              password: authPassword,
            }
          : {
              email: authEmail.trim(),
              password: authPassword,
            };

      const data = await requestJson(endpoint, {
        method: "POST",
        body: payload,
      });

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuthPassword("");
      setAuthMessage(`Welcome ${data.user?.name || "back"}.`);
      navigate("/create");
    } catch (error) {
      setAuthMessage(getErrorMessage(error, "Authentication failed."));
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
    setAuthPassword("");
    setAuthMessage("You are now in guest mode.");
    setCreateMessage("");
  };

  const deleteSnippet = async (id) => {
    const shouldDelete = window.confirm("Delete this snippet?");
    if (!shouldDelete) {
      return;
    }

    try {
      await requestJson(`/snippets/${id}`, { method: "DELETE" });
      setSnippets((prev) => prev.filter((snippet) => snippet._id !== id));
    } catch (error) {
      window.alert(getErrorMessage(error, "Failed to delete snippet."));
    }
  };

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode);
    setAuthMessage("");
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Knowledge keeper</p>
          <h1>Snippet Vault</h1>
          <p className="hero-sub">Store simple text snippets in one clean place.</p>
        </div>

        <div className="hero-right">
          <nav className="site-nav" aria-label="Main navigation">
            <NavLink
              to="/home"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Home
            </NavLink>
            <NavLink
              to="/create"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Create
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              Login
            </NavLink>
          </nav>
          <div className="status-chip">{user ? `Signed in: ${user.name}` : "Guest mode"}</div>
        </div>
      </header>

      <main>
        <Routes>
          <Route
            path="/home"
            element={
              <HomePage
                snippets={snippets}
                loading={snippetsLoading}
                error={snippetsError}
                onRefresh={loadSnippets}
                onDelete={deleteSnippet}
                user={user}
              />
            }
          />
          <Route
            path="/login"
            element={
              <LoginPage
                user={user}
                authMode={authMode}
                setAuthMode={handleAuthModeChange}
                authName={authName}
                setAuthName={setAuthName}
                authEmail={authEmail}
                setAuthEmail={setAuthEmail}
                authPassword={authPassword}
                setAuthPassword={setAuthPassword}
                authLoading={authLoading}
                authMessage={authMessage}
                submitAuth={submitAuth}
                logout={logout}
              />
            }
          />
          <Route
            path="/create"
            element={
              <CreateSnippetPage
                token={token}
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                saveSnippet={saveSnippet}
                saveLoading={saveLoading}
                createMessage={createMessage}
              />
            }
          />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
