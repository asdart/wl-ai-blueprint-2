import { useEffect, useRef } from "react";

type OrbConfig = {
  pointCount: number;
  neighbors: number;
  hubCount: number;
  hubLinks: number;
  randomLinks: number;
  breathe: boolean;
  breatheIntensity: number;
  floatIntensity: number;
  speed: number;
  tilt: number;
  lineColor: string;
};

const DEFAULTS: OrbConfig = {
  pointCount: 680,
  neighbors: 12,
  hubCount: 60,
  hubLinks: 50,
  randomLinks: 8,
  breathe: true,
  breatheIntensity: 0.2,
  floatIntensity: 0.6,
  speed: 0.1,
  tilt: -0.42,
  lineColor: "#39463e",
};

type Point = {
  x: number;
  y: number;
  z: number;
  deg: number;
  floatPhase: number;
  floatFreq: number;
  floatAmp: number;
};

/* quaternion helpers */
type Quat = [number, number, number, number];

function qMul(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}
function qNorm(q: Quat): Quat {
  const l = Math.hypot(q[0], q[1], q[2], q[3]) || 1;
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}
function qAxisAngle(ax: number, ay: number, az: number, angle: number): Quat {
  const s = Math.sin(angle * 0.5);
  return [ax * s, ay * s, az * s, Math.cos(angle * 0.5)];
}
function qRot(q: Quat, vx: number, vy: number, vz: number): [number, number, number] {
  const [qx, qy, qz, qw] = q;
  const tx = 2 * (qy * vz - qz * vy);
  const ty = 2 * (qz * vx - qx * vz);
  const tz = 2 * (qx * vy - qy * vx);
  return [
    vx + qw * tx + qy * tz - qz * ty,
    vy + qw * ty + qz * tx - qx * tz,
    vz + qw * tz + qx * ty - qy * tx,
  ];
}

function buildGeometry(c: OrbConfig) {
  const N = c.pointCount;
  const pts: Point[] = [];
  const gold = Math.PI * (3 - Math.sqrt(5));
  let seed = 1337;
  const rnd = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const th = gold * i;
    const x = Math.cos(th) * r + (rnd() - 0.5) * 0.09;
    const yy = y + (rnd() - 0.5) * 0.09;
    const z = Math.sin(th) * r + (rnd() - 0.5) * 0.09;
    const l = Math.hypot(x, yy, z) || 1;
    pts.push({
      x: x / l,
      y: yy / l,
      z: z / l,
      deg: 0,
      floatPhase: rnd() * Math.PI * 2,
      floatFreq: 0.18 + rnd() * 0.38,
      floatAmp: 0.022 + rnd() * 0.038,
    });
  }

  const edgeSet = new Set<number>();
  const edges: [number, number][] = [];
  const addEdge = (a: number, b: number) => {
    if (a === b || a >= N || b >= N) return;
    const key = a < b ? a * 100000 + b : b * 100000 + a;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push([a, b]);
    pts[a].deg++;
    pts[b].deg++;
  };

  for (let i = 0; i < N; i++) {
    const di: [number, number][] = [];
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const dx = pts[i].x - pts[j].x;
      const dy = pts[i].y - pts[j].y;
      const dz = pts[i].z - pts[j].z;
      di.push([dx * dx + dy * dy + dz * dz, j]);
    }
    di.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < c.neighbors; k++) addEdge(i, di[k][1]);
  }
  for (let i = 0; i < N; i++)
    for (let l = 0; l < c.randomLinks; l++) addEdge(i, Math.floor(rnd() * N));
  for (let h = 0; h < c.hubCount; h++) {
    const hub = Math.floor(rnd() * N);
    for (let l = 0; l < c.hubLinks; l++) addEdge(hub, Math.floor(rnd() * N));
  }

  return { pts, edges };
}

export default function OrbSphere({
  config,
  className,
  style,
}: {
  config?: Partial<OrbConfig>;
  className?: string;
  style?: React.CSSProperties;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c: OrbConfig = { ...DEFAULTS, ...config };
    const { pts, edges } = buildGeometry(c);
    const N = pts.length;

    let quat: Quat = qNorm(qAxisAngle(1, 0, 0, c.tilt));
    let spinSpeed = c.speed;
    let breatheTime = 0;
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = performance.now();

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const proj = new Array<{ sx: number; sy: number; d: number }>(N);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // resizing clears the canvas — redraw immediately in static mode
      if (prefersReduced) draw();
    };

    const draw = () => {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      let bScale = 1;
      if (c.breathe) {
        const bt = breatheTime;
        const bi = c.breatheIntensity;
        bScale =
          1 +
          bi * 0.038 * Math.sin(bt * 0.38 * Math.PI * 2) +
          bi * 0.024 * Math.sin(bt * 0.67 * Math.PI * 2 + 2.1) +
          bi * 0.018 * Math.sin(bt * 1.09 * Math.PI * 2 + 1.4) +
          bi * 0.011 * Math.sin(bt * 1.77 * Math.PI * 2 + 0.8);
      }

      const R = Math.min(w, h) * 0.42 * bScale;
      const cx = w / 2;
      const cy = h / 2;
      const q = quat;
      const bt = breatheTime;

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const fo =
          1 +
          p.floatAmp *
            c.floatIntensity *
            Math.sin(bt * p.floatFreq * Math.PI * 2 + p.floatPhase);
        const [rx, ry, rz] = qRot(q, p.x * fo, p.y * fo, p.z * fo);
        const pe = 1 / (1.9 - rz * 0.45);
        proj[i] = {
          sx: cx + rx * R * pe * 1.6,
          sy: cy - ry * R * pe * 1.6,
          d: Math.max(0, Math.min(1, (rz + 1) * 0.5)),
        };
      }

      const BUCKETS = 14;
      const paths = Array.from({ length: BUCKETS }, () => new Path2D());
      for (let e = 0; e < edges.length; e++) {
        const a = proj[edges[e][0]];
        const b = proj[edges[e][1]];
        if (!a || !b) continue;
        let bi = Math.floor((a.d + b.d) * 0.5 * BUCKETS);
        bi = Math.max(0, Math.min(BUCKETS - 1, bi));
        paths[bi].moveTo(a.sx, a.sy);
        paths[bi].lineTo(b.sx, b.sy);
      }
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = c.lineColor;
      for (let b = 0; b < BUCKETS; b++) {
        const d = (b + 0.5) / BUCKETS;
        ctx.globalAlpha = 0.022 + d * d * 0.085;
        ctx.stroke(paths[b]);
      }

      ctx.fillStyle = c.lineColor;
      for (let i = 0; i < N; i++) {
        const pr = proj[i];
        const isHub = pts[i].deg > 14;
        const r = (isHub ? 1.6 : 0.7) * (0.55 + pr.d * 0.6);
        ctx.globalAlpha = (isHub ? 0.5 : 0.14) * (0.3 + pr.d * 0.7);
        ctx.beginPath();
        ctx.arc(pr.sx, pr.sy, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const k = 1 - Math.exp(-dt * 3.5);
      spinSpeed += (c.speed - spinSpeed) * k;
      if (Math.abs(spinSpeed) > 1e-6) {
        const dqSpin = qAxisAngle(0, 1, 0, spinSpeed * dt);
        quat = qNorm(qMul(dqSpin, quat));
      }
      breatheTime += dt;
      draw();
      raf = requestAnimationFrame(loop);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    if (prefersReduced) {
      draw();
    } else {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
