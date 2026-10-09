import React, { useEffect, useState, useRef } from 'react';
import './Feed.css';
import { supabase } from '../supabaseClient';

const MAX_IMAGE_MB = 8;

export default function Feed({ user }) {
  const [groups, setGroups] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  // composer state
  const [caption, setCaption] = useState('');
  const [groupId, setGroupId] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const myUserId = user?.id;

  /* -------------------------
     LOAD GROUPS
  ------------------------- */

  useEffect(() => {
    async function loadGroups() {
      if (!myUserId) return;

      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, groups(id, name)')
        .eq('user_id', myUserId);

      if (error) {
        console.error('Groups load error:', error);
        return;
      }

      setGroups(data || []);
    }

    loadGroups();
  }, [myUserId]);

  /* -------------------------
     LOAD FEED
  ------------------------- */

  async function loadFeed() {
    if (!myUserId) return;

    try {
      const groupIds = groups.map((g) => g.group_id);

      let query = supabase
        .from('posts')
        .select('*, profiles(username, display_name), groups(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (groupIds.length > 0) {
        query = query.or(
          `user_id.eq.${myUserId},group_id.in.(${groupIds.join(',')})`
        );
      } else {
        query = query.eq('user_id', myUserId);
      }

      const { data, error } = await query;

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Feed load error:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (groups.length >= 0 && !loading) loadFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  /* -------------------------
     IMAGE PICKER
  ------------------------- */

  function onPickFile(e) {
    const picked = e.target.files?.[0];

    if (!picked) return;

    if (picked.size > MAX_IMAGE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_IMAGE_MB}MB`);
      return;
    }

    setError('');
    setFile(picked);
    setFilePreview(URL.createObjectURL(picked));
  }

  function clearFile() {
    setFile(null);
    setFilePreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  /* -------------------------
     UPLOAD IMAGE -> STORAGE
  ------------------------- */

  async function uploadImage() {
    const path = `${myUserId}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;

    const { error: uploadError } = await supabase.storage
      .from('posts')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('posts').getPublicUrl(path);

    return data.publicUrl;
  }

  /* -------------------------
     CREATE POST
  ------------------------- */

  async function handlePost() {
    const text = caption.trim();

    if (!text && !file) {
      setError('Write something or add a photo');
      return;
    }

    setPosting(true);
    setError('');

    try {
      let imageUrl = null;

      if (file) {
        imageUrl = await uploadImage();
      }

      const { data: inserted, error: insertError } = await supabase
        .from('posts')
        .insert({
          user_id: myUserId,
          group_id: groupId || null,
          caption: text || null,
          image_url: imageUrl,
        })
        .select('*, profiles(username, display_name), groups(name)')
        .single();

      if (insertError) throw insertError;

      setPosts((prev) => [inserted, ...prev]);
      setCaption('');
      clearFile();
    } catch (err) {
      console.error('Post error:', err);
      setError(
        err.message?.includes('Bucket')
          ? 'Photo storage is not set up yet — run the SQL from the update first'
          : err.message || 'Could not post. Try again.'
      );
    } finally {
      setPosting(false);
    }
  }

  /* -------------------------
     DELETE OWN POST
  ------------------------- */

  async function handleDelete(id) {
    const { error } = await supabase.from('posts').delete().eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  /* -------------------------
     RENDER
  ------------------------- */

  return (
    <div className="feed-page">
      {/* ===== COMPOSER ===== */}

      <div className="feed-composer">
        <div className="composer-header">
          <span className="composer-title">
            <i className="ti ti-message-share" aria-hidden="true" />
            Share a session
          </span>

          {groups.length > 0 && (
            <select
              className="composer-group-select"
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              aria-label="Post to group"
            >
              <option value="">Everyone (my feed)</option>
              {groups.map((g) => (
                <option key={g.group_id} value={g.group_id}>
                  {g.groups?.name || 'Group'}
                </option>
              ))}
            </select>
          )}
        </div>

        <textarea
          className="composer-input"
          placeholder="Bad beat story, heater, or just talk trash…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          maxLength={500}
        />

        {filePreview && (
          <div className="composer-preview">
            <img src={filePreview} alt="Selected" />
            <button
              className="preview-remove"
              onClick={clearFile}
              type="button"
              aria-label="Remove photo"
            >
              <i className="ti ti-x" />
            </button>
          </div>
        )}

        {error && <p className="composer-error">{error}</p>}

        <div className="composer-actions">
          <button
            className="composer-photo-btn"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            <i className="ti ti-photo" aria-hidden="true" />
            Photo
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={onPickFile}
            hidden
          />

          <button
            className="composer-post-btn"
            type="button"
            disabled={posting}
            onClick={handlePost}
          >
            {posting ? 'Posting…' : 'Post'}
          </button>
        </div>
      </div>

      {/* ===== FEED ===== */}

      {loading ? (
        <p className="feed-loading">Loading the feed…</p>
      ) : posts.length === 0 ? (
        <div className="feed-empty">
          <i className="ti ti-photo-heart" aria-hidden="true" />
          <p>Nothing here yet.</p>
          <p className="feed-empty-sub">
            Post a photo from your next session with the group.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <article className="feed-post" key={post.id}>
            <div className="post-header">
              <div className="post-avatar">
                {(post.profiles?.display_name ||
                  post.profiles?.username ||
                  'P')
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="post-user">
                <span className="post-name">
                  {post.profiles?.display_name ||
                    post.profiles?.username ||
                    'Player'}
                </span>

                <span className="post-meta">
                  {timeAgo(post.created_at)}
                  {post.groups?.name
                    ? ` · ${post.groups.name}`
                    : ''}
                </span>
              </div>

              {post.user_id === myUserId && (
                <button
                  className="post-delete"
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  aria-label="Delete post"
                >
                  <i className="ti ti-trash" />
                </button>
              )}
            </div>

            {post.caption && (
              <p className="post-caption">{post.caption}</p>
            )}

            {post.image_url && (
              <img
                className="post-image"
                src={post.image_url}
                alt=""
                loading="lazy"
              />
            )}
          </article>
        ))
      )}
    </div>
  );
}

/* -------------------------
   HELPERS
------------------------- */

function timeAgo(iso) {
  if (!iso) return '';

  const seconds =
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
