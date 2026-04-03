import "./App.css";
import React, { useEffect, useState } from "react";

function App() {
  const [snippets, setSnippets] = useState([]);
  const [editId, setEditId] = useState(null);

  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("");

  // FETCH SNIPPETS
  useEffect(() => {
    fetch("https://snippet-vault-backend.onrender.com/snippets")
      .then((res) => res.json())
      .then((data) => setSnippets(data))
      .catch((err) => console.log(err));
  }, []);

  // ADD / UPDATE
  const addSnippet = async () => {
    try {
      if (!title || !code || !language) {
        alert("Fill all fields!");
        return;
      }

      if (editId) {
        // UPDATE
        await fetch(`https://snippet-vault-backend.onrender.com/snippets/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, code, language }),
        });

        setSnippets(
          snippets.map((s) =>
            s._id === editId ? { ...s, title, code, language } : s
          )
        );

        setEditId(null);
      } else {
        // CREATE
        const res = await fetch("https://snippet-vault-backend.onrender.com/snippets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, code, language }),
        });

        const data = await res.json();
        setSnippets([...snippets, data.snippet]);
      }

      setTitle("");
      setCode("");
      setLanguage("");
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE
  const deleteSnippet = async (id) => {
    try {
      await fetch(`https://snippet-vault-backend.onrender.com/snippets/${id}`, {
        method: "DELETE",
      });

      setSnippets(snippets.filter((s) => s._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="container">
      {/* HEADER */}
      <div className="header">
        <h1>Snippet Vault 🚀</h1>
        <button
          className="toggle-btn"
          onClick={() => document.body.classList.toggle("dark")}
        >
          Toggle 🌙
        </button>
      </div>

      {/* FORM */}
      <div className="form">
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <input
          placeholder="Language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        />

        <button className="add-btn" onClick={addSnippet}>
          {editId ? "Update ✏️" : "Add Snippet ➕"}
        </button>
      </div>

      {/* EMPTY */}
      {snippets.length === 0 && (
        <p className="empty">No snippets yet 😢</p>
      )}

      {/* LIST */}
      {snippets.map((snippet) => (
        <div key={snippet._id} className="card">
          <h3>{snippet.title}</h3>

         <pre className="code">
            <code>{snippet.code}</code>
            </pre>

          <p className="lang">{snippet.language}</p>

          <div className="btn-group">
            <button
              onClick={() => {
                setTitle(snippet.title);
                setCode(snippet.code);
                setLanguage(snippet.language);
                setEditId(snippet._id);
              }}
            >
              Edit ✏️
            </button>

            <button
              className="delete"
              onClick={() => deleteSnippet(snippet._id)}
            >
              Delete 🗑️
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;