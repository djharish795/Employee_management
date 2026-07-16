"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";

export const BrandingPanel: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = panelRef.current;
    const canvas = canvasRef.current;
    const cursorDot = cursorDotRef.current;
    const cursorRing = cursorRingRef.current;
    if (!wrap || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── state ──────────────────────────────────────────────────────────────
    let W = 0, H = 0, DPR = 1;
    let rafId: number;
    let nodes: Array<{
      x: number; y: number;
      vx: number; vy: number;
      r: number; tw: number;
    }> = [];
    let comets: Array<{
      x: number; y: number;
      vx: number; vy: number;
      life: number; len: number;
    }> = [];
    const mouse = { x: 0, y: 0, active: false };

    // ── resize ─────────────────────────────────────────────────────────────
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      W = wrap!.clientWidth;
      H = wrap!.clientHeight;
      canvas!.width = W * DPR;
      canvas!.height = H * DPR;
      canvas!.style.width = W + "px";
      canvas!.style.height = H + "px";
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0);
    }

    // ── nodes ──────────────────────────────────────────────────────────────
    function nodeCount() {
      return Math.max(40, Math.round((W * H) / 16000));
    }
    function makeNodes() {
      const n = nodeCount();
      nodes = [];
      for (let i = 0; i < n; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.6 + 0.8,
          tw: Math.random() * Math.PI * 2,
        });
      }
    }

    resize();
    makeNodes();

    // ── constants ──────────────────────────────────────────────────────────
    const LINK_DIST = 130;
    const MOUSE_LINK_DIST = 190;
    const MOUSE_PULL_DIST = 170;

    // ── draw loop ──────────────────────────────────────────────────────────
    function step() {
      ctx!.clearRect(0, 0, W, H);

      // ── update node positions + mouse attraction ──
      for (const p of nodes) {
        p.x += p.vx;
        p.y += p.vy;
        p.tw += 0.02;

        // wrap around edges (teleport)
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        // attract toward mouse
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_PULL_DIST && dist > 0.01) {
            const force = (1 - dist / MOUSE_PULL_DIST) * 0.035;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // damping + max-speed clamp
        p.vx *= 0.985;
        p.vy *= 0.985;
        const sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        const maxSp = 1.6;
        if (sp > maxSp) {
          p.vx = (p.vx / sp) * maxSp;
          p.vy = (p.vy / sp) * maxSp;
        }
      }

      // ── draw node-to-node edges ──
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.22;
            ctx!.strokeStyle = `rgba(150,170,255,${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // ── draw mouse-to-node edges ──
      if (mouse.active) {
        for (const p of nodes) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_LINK_DIST) {
            const alpha = (1 - dist / MOUSE_LINK_DIST) * 0.55;
            ctx!.strokeStyle = `rgba(190,205,255,${alpha})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(p.x, p.y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      // ── draw nodes with twinkle ──
      for (const p of nodes) {
        const twinkle = 0.55 + Math.sin(p.tw) * 0.25;
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(210,220,255,${twinkle})`;
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // ── mouse glow halo ──
      if (mouse.active) {
        const grad = ctx!.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 60
        );
        grad.addColorStop(0, "rgba(150,170,255,0.18)");
        grad.addColorStop(1, "rgba(150,170,255,0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, 60, 0, Math.PI * 2);
        ctx!.fill();
      }

      // ── comet streaks ──
      comets.forEach((c) => {
        c.x += c.vx;
        c.y += c.vy;
        c.life -= 0.006;

        const tailX = c.x - c.vx * (c.len / Math.max(Math.abs(c.vx), 0.1)) * 0.2;
        const tailY = c.y - c.vy * (c.len / Math.max(Math.abs(c.vx), 0.1)) * 0.2;

        const grad = ctx!.createLinearGradient(c.x, c.y, tailX, tailY);
        grad.addColorStop(0, `rgba(220,230,255,${Math.max(c.life, 0)})`);
        grad.addColorStop(1, "rgba(220,230,255,0)");

        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        ctx!.moveTo(c.x, c.y);
        ctx!.lineTo(tailX, tailY);
        ctx!.stroke();
      });

      // remove dead/off-screen comets
      comets = comets.filter(
        (c) => c.life > 0 && c.x > -60 && c.x < W + 60 && c.y < H + 60
      );

      rafId = requestAnimationFrame(step);
    }

    step();

    // ── comet spawner (every 3.2 s) ────────────────────────────────────────
    const cometInterval = setInterval(() => {
      const fromLeft = Math.random() < 0.5;
      const y = Math.random() * H * 0.6;
      comets.push({
        x: fromLeft ? -20 : W + 20,
        y,
        vx: (fromLeft ? 1 : -1) * (2.4 + Math.random() * 1.8),
        vy: 0.6 + Math.random() * 0.8,
        life: 1,
        len: 60 + Math.random() * 40,
      });
    }, 3200);

    // ── event handlers ─────────────────────────────────────────────────────
    function handleMouseMove(e: MouseEvent) {
      const r = wrap!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;

      if (cursorDot && cursorRing) {
        cursorDot.style.opacity = "1";
        cursorRing.style.opacity = "1";
        cursorDot.style.left = mouse.x + "px";
        cursorDot.style.top = mouse.y + "px";
        cursorRing.style.left = mouse.x + "px";
        cursorRing.style.top = mouse.y + "px";
      }
    }

    function handleMouseLeave() {
      mouse.active = false;
      if (cursorDot) cursorDot.style.opacity = "0";
      if (cursorRing) cursorRing.style.opacity = "0";
    }

    function handleMouseDown() {
      if (cursorRing)
        cursorRing.style.transform = "translate(-50%,-50%) scale(0.75)";
    }

    function handleMouseUp() {
      if (cursorRing)
        cursorRing.style.transform = "translate(-50%,-50%) scale(1)";
    }

    function handleResize() {
      resize();
      makeNodes();
    }

    wrap.addEventListener("mousemove", handleMouseMove);
    wrap.addEventListener("mouseleave", handleMouseLeave);
    wrap.addEventListener("mousedown", handleMouseDown);
    wrap.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    // ── cleanup ────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(cometInterval);
      wrap.removeEventListener("mousemove", handleMouseMove);
      wrap.removeEventListener("mouseleave", handleMouseLeave);
      wrap.removeEventListener("mousedown", handleMouseDown);
      wrap.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      {/* ── Keyframe animations injected once ── */}
      <style>{`
        @keyframes naprocs-drift1 {
          0%   { transform: translate(0,0) rotate(0deg); }
          100% { transform: translate(14px,-18px) rotate(20deg); }
        }
        @keyframes naprocs-drift2 {
          0%   { transform: translate(0,0) rotate(0deg); }
          100% { transform: translate(-16px,14px) rotate(-16deg); }
        }
        @keyframes naprocs-drift3 {
          0%   { transform: translate(0,0) rotate(0deg); }
          100% { transform: translate(10px,16px) rotate(12deg); }
        }
        @keyframes naprocs-pulse {
          0%   { transform: scale(0.55); opacity: 0.6; }
          80%  { opacity: 0; }
          100% { transform: scale(1.9);  opacity: 0; }
        }
        @keyframes naprocs-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes naprocs-spin-rev {
          from { transform: rotate(360deg); }
          to   { transform: rotate(0deg); }
        }
        @keyframes naprocs-breathe {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.03); }
        }
      `}</style>

      {/* ── Left panel ── */}
      <div
        ref={panelRef}
        className="hidden lg:flex"
        style={{
          position: "relative",
          flex: "1 1 50%",
          minWidth: 0,
          background: "radial-gradient(120% 120% at 15% 15%, #0a1024 0%, #050914 60%, #030509 100%)",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          cursor: "none",
        }}
      >
        {/* Canvas — particle + comet network */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "block",
            zIndex: 1,
          }}
        />

        {/* ── Floating circuit shapes ── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none" }}>

          {/* fs-1  — hexagon, top-left */}
          <div style={{
            position: "absolute", width: 70, height: 70,
            top: "10%", left: "8%", opacity: 0.35,
            animation: "naprocs-drift1 14s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <polygon points="50,5 90,27 90,73 50,95 10,73 10,27"
                fill="none" stroke="#8ea0ff" strokeWidth="1.5" />
            </svg>
          </div>

          {/* fs-2  — circle with centre dot, bottom-left */}
          <div style={{
            position: "absolute", width: 46, height: 46,
            top: "70%", left: "14%", opacity: 0.35,
            animation: "naprocs-drift2 11s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <circle cx="50" cy="50" r="40" fill="none" stroke="#7be0c2" strokeWidth="1.5" />
              <circle cx="50" cy="50" r="4" fill="#7be0c2" />
            </svg>
          </div>

          {/* fs-3  — square with connector pins, top-right */}
          <div style={{
            position: "absolute", width: 90, height: 90,
            top: "18%", left: "82%", opacity: 0.35,
            animation: "naprocs-drift3 16s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <rect x="20" y="20" width="60" height="60" rx="8"
                fill="none" stroke="#a98fff" strokeWidth="1.5" />
              <line x1="50" y1="0" x2="50" y2="20" stroke="#a98fff" strokeWidth="1.5" />
              <line x1="50" y1="80" x2="50" y2="100" stroke="#a98fff" strokeWidth="1.5" />
              <circle cx="50" cy="4" r="3" fill="#a98fff" />
              <circle cx="50" cy="96" r="3" fill="#a98fff" />
            </svg>
          </div>

          {/* fs-4  — mini hexagon, bottom-right */}
          <div style={{
            position: "absolute", width: 36, height: 36,
            top: "78%", left: "78%", opacity: 0.35,
            animation: "naprocs-drift1 9s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <polygon points="50,5 90,27 90,73 50,95 10,73 10,27"
                fill="none" stroke="#8ea0ff" strokeWidth="2" />
            </svg>
          </div>

          {/* fs-5  — dashed circle, middle-left */}
          <div style={{
            position: "absolute", width: 56, height: 56,
            top: "46%", left: "6%", opacity: 0.35,
            animation: "naprocs-drift2 13s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <circle cx="50" cy="50" r="38"
                fill="none" stroke="#8ea0ff" strokeWidth="1.5" strokeDasharray="6 6" />
            </svg>
          </div>

          {/* fs-6  — small rounded rect, middle-right */}
          <div style={{
            position: "absolute", width: 64, height: 64,
            top: "55%", left: "88%", opacity: 0.35,
            animation: "naprocs-drift3 12s ease-in-out infinite alternate",
          }}>
            <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", display: "block" }}>
              <rect x="25" y="25" width="50" height="50" rx="6"
                fill="none" stroke="#7be0c2" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* ── Pulse rings ── */}
        <div style={{
          position: "absolute", zIndex: 2,
          width: 1, height: 1, top: "50%", left: "50%",
          pointerEvents: "none",
        }}>
          {[0, 1.5, 3].map((delay, i) => (
            <div key={i} style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 180, height: 180,
              marginTop: -90, marginLeft: -90,
              borderRadius: "50%",
              border: "1px solid rgba(140,160,255,0.35)",
              animation: `naprocs-pulse 4.5s ease-out ${delay}s infinite`,
              opacity: 0,
            }} />
          ))}
        </div>

        {/* ── Inner orbit — spins forward ── */}
        <div style={{
          position: "absolute", zIndex: 2,
          top: "50%", left: "50%",
          width: 260, height: 260,
          marginTop: -130, marginLeft: -130,
          borderRadius: "50%",
          border: "1px dashed rgba(140,160,255,0.18)",
          animation: "naprocs-spin 26s linear infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            width: 6, height: 6,
            borderRadius: "50%",
            background: "#b9c0ff",
            boxShadow: "0 0 8px 2px rgba(150,170,255,0.6)",
            top: -3, left: "50%", marginLeft: -3,
          }} />
        </div>

        {/* ── Outer orbit — spins reverse ── */}
        <div style={{
          position: "absolute", zIndex: 2,
          top: "50%", left: "50%",
          width: 340, height: 340,
          marginTop: -170, marginLeft: -170,
          borderRadius: "50%",
          border: "1px dashed rgba(140,160,255,0.18)",
          animation: "naprocs-spin-rev 40s linear infinite",
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute",
            width: 6, height: 6,
            borderRadius: "50%",
            background: "#8fe3c7",
            boxShadow: "0 0 8px 2px rgba(120,220,190,0.55)",
            top: -3, left: "50%", marginLeft: -3,
          }} />
        </div>

        {/* ── Custom cursor dot — snaps instantly ── */}
        <div ref={cursorDotRef} style={{
          position: "absolute",
          top: 0, left: 0,
          width: 10, height: 10,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 0 16px 4px rgba(140,160,255,0.65)",
          pointerEvents: "none",
          transform: "translate(-50%,-50%)",
          zIndex: 5,
          opacity: 0,
          transition: "opacity .2s ease",
        }} />

        {/* ── Custom cursor ring — scales on click ── */}
        <div ref={cursorRingRef} style={{
          position: "absolute",
          top: 0, left: 0,
          width: 38, height: 38,
          borderRadius: "50%",
          border: "1px solid rgba(180,195,255,0.5)",
          pointerEvents: "none",
          transform: "translate(-50%,-50%) scale(1)",
          zIndex: 5,
          opacity: 0,
          transition: "opacity .2s ease, transform .15s ease",
        }} />

        {/* ── Brand — logo + tagline ── */}
        <div style={{
          position: "relative",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "none",
          userSelect: "none",
        }}>
          {/* Logo card — breathing animation */}
          <div style={{
            padding: 10,
            animation: "naprocs-breathe 5s ease-in-out infinite",
          }}>
            {/*
              ✅ Using naprocs-logo.png — the full brand identity image
                 (circuit "n" icon  + "NAPROCS TECHNOLOGIES" text)
              ✅ NO filter/invert: displayed in its natural teal+purple colors
              ✅ drop-shadow only for the glow effect
            */}
            <Image
              src="/naprocs-logo.png"
              alt="NAPROCS Technologies"
              height={115}
              width={460}
              priority
              style={{
                display: "block",
                objectFit: "contain",
                height: "auto",
                filter: "drop-shadow(0 0 22px rgba(120,150,255,0.35)) drop-shadow(0 4px 18px rgba(0,0,0,0.5))",
              }}
            />
          </div>

          {/* Tagline */}
          <p style={{
            marginTop: 18,
            fontFamily: "'Georgia','Times New Roman',serif",
            fontStyle: "italic",
            fontSize: 17,
            letterSpacing: "1px",
            color: "#b9c0ff",
            textAlign: "center",
          }}>
            AI Echo System
          </p>
        </div>
      </div>
    </>
  );
};
