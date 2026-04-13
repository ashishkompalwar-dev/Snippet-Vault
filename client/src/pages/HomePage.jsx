import React from "react";
import { Link } from "react-router-dom";

function HomePage({ snippets, loading, error, onRefresh, onDelete, user }) {
  return (
    <section className="page">
      <div className="section-head">
        <h2>All notes</h2>
        <div className="section-actions">
          <button className="ghost" onClick={onRefresh} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
          <Link to="/create" className="primary link-btn">
            Create note
          </Link>
        </div>
      </div>

      {!user && (
        <p className="hint">
          Guest mode is active. You can browse all snippets and only sign in when you want to create one.
        </p>
      )}

      {error && <p className="error-text">{error}</p>}

      {!loading && snippets.length === 0 && <p className="empty">No notes yet.</p>}

      <div className="notes-grid">
        {snippets.map((snippet, index) => {
          const ownerId = typeof snippet.owner === "string" ? snippet.owner : snippet.owner?._id;
          const canDelete = Boolean(user && ownerId && ownerId === user._id);

          return (
            <article key={snippet._id} className="card" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="card-head">
                <h3>{snippet.title}</h3>
                <span>
                  {snippet.createdAt ? new Date(snippet.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
              {snippet.owner?.name && <p className="owner-line">By {snippet.owner.name}</p>}
              <p className="note-content">{snippet.content}</p>
              {canDelete && (
                <div className="btn-group">
                  <button className="danger" onClick={() => onDelete(snippet._id)}>
                    Delete
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default HomePage;
