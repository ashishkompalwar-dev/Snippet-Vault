import React from "react";
import { Link } from "react-router-dom";

function CreateSnippetPage({
  token,
  title,
  setTitle,
  content,
  setContent,
  saveSnippet,
  saveLoading,
  createMessage,
}) {
  if (!token) {
    return (
      <section className="page">
        <div className="panelish">
          <h2>Create note</h2>
          <p className="hint">
            Sign in is optional for browsing, but required before creating a note.
          </p>
          <Link to="/login" className="primary link-btn">
            Go to login
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="section-head">
        <h2>Create note</h2>
      </div>

      <form
        className="panelish editor"
        onSubmit={(event) => {
          event.preventDefault();
          saveSnippet();
        }}
      >
        <label htmlFor="title">Title</label>
        <input
          id="title"
          placeholder="Example: API retry logic"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <label htmlFor="content">Note text</label>
        <textarea
          id="content"
          placeholder="Write plain text notes or code snippets"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={9}
        />

        <button className="primary" type="submit" disabled={saveLoading}>
          {saveLoading ? "Saving..." : "Save note"}
        </button>
      </form>

      {createMessage && <p className="auth-message">{createMessage}</p>}
    </section>
  );
}

export default CreateSnippetPage;
