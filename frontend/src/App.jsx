import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [isConnected, setIsConnected] = useState(false);
  const [detections, setDetections] = useState([]);
  const [frame, setFrame] = useState(null);
  const [hasHelmet, setHasHelmet] = useState(false);
  // Audio Context for beep sound
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setFrame(`data:image/jpeg;base64,${data.frame}`);
      setDetections(data.detections);
    };

    return () => ws.close();
  }, []);

  // Filter detections based on threshold
  const validDetections = detections.filter(d => d.conf >= confidenceThreshold);
  const helmetDetected = validDetections.some(d => d.label === 'helmet');

  const startBeep = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    // If already beeping (interval set), do nothing
    if (oscillatorRef.current) return;

    const playTone = () => {
      const osc = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();

      // Seatbelt chime sound (two tones or a specific wave)
      // Sine wave is smoother, like a chime
      osc.type = 'sine';
      // High pitch for seatbelt warning (usually around 700-1000Hz)
      osc.frequency.setValueAtTime(800, audioCtxRef.current.currentTime);

      // Envelope for the "ding" effect
      const now = audioCtxRef.current.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // Decay

      osc.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    };

    // Play immediately then loop
    playTone();
    oscillatorRef.current = setInterval(playTone, 800); // Repeat every 800ms
  };

  const stopBeep = () => {
    if (oscillatorRef.current) {
      clearInterval(oscillatorRef.current);
      oscillatorRef.current = null;
    }
  };

  useEffect(() => {
    setHasHelmet(helmetDetected);

    if (!helmetDetected && isConnected && frame) {
      // Only beep if we have a frame (system is running) and no helmet
      startBeep();
    } else {
      stopBeep();
    }
  }, [helmetDetected, isConnected, frame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopBeep();
  }, []);

  return (
    <div className="app-container">
      <header>
        <h1>HelmetGuard AI</h1>
        <div style={{ color: isConnected ? 'var(--primary)' : 'var(--danger)' }}>
          ● {isConnected ? 'System Online' : 'Connecting...'}
        </div>
      </header>

      <div className="main-content">
        <div className="video-section">
          {frame ? (
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              {/* We use the CanvasOverlay to draw BOTH the image and the boxes to ensure alignment */}
              <CanvasOverlay
                detections={detections}
                threshold={confidenceThreshold}
                imageSrc={frame}
              />
            </div>
          ) : (
            <div style={{ color: 'var(--text-dim)' }}>Waiting for video feed...</div>
          )}
        </div>

        <div className="sidebar">
          <div className="panel">
            <div className="control-group">
              <label>Confidence Threshold: {Math.round(confidenceThreshold * 100)}%</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              />
            </div>
          </div>

          {!hasHelmet && (
            <div className="status-indicator status-danger">
              WEAR HELMET
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CanvasOverlay = ({ detections, threshold, imageSrc }) => {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = imageSrc;

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      detections.forEach(det => {
        if (det.conf >= threshold) {
          const [x1, y1, x2, y2] = det.bbox;
          const color = det.label === 'helmet' ? '#00f2ff' : '#ff2a6d';

          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

          ctx.fillStyle = color;
          ctx.font = '20px Arial';
          ctx.fillText(`${det.label} ${Math.round(det.conf * 100)}%`, x1, y1 - 10);
        }
      });
    };
  }, [detections, threshold, imageSrc]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
};

export default App;
