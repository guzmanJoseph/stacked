import React, { useState } from 'react';
import './AddModal.css';

export default function ScanModal({ onScanComplete, onClose }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };

    reader.readAsDataURL(file);
  }

  async function handleScan() {
    if (!imageBase64) {
      alert('Upload a screenshot first.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/scan-bet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64 }),
      });

      const parsedBet = await res.json();

      if (!res.ok) {
        throw new Error(parsedBet.error || 'Failed to scan screenshot');
      }

      onScanComplete(parsedBet);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-handle" />
        <h2 className="modal-title">Scan Bet Screenshot</h2>

        <input
          className="form-input"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {imagePreview && (
          <img
            src={imagePreview}
            alt="Bet screenshot preview"
            style={{
              width: '100%',
              maxHeight: '320px',
              objectFit: 'contain',
              borderRadius: '16px',
              marginTop: '16px'
            }}
          />
        )}

        <button className="submit-btn" onClick={handleScan} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan Screenshot'}
        </button>

        <button className="cancel-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}