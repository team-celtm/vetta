import {
  Box,
  Typography,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import { useEffect, useRef } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState } from "react";

export interface SkillScore {
  name: string;
  score: number;
}

export interface WorkHistory {
  title: string;
  company: string;
  from: string;
  to: string | null;
  current?: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  year: number;
}

export interface CandidateDetail {
  id: string;
  name: string;
  role: string;
  match: number;
  location: string;
  experience: string;
  available: boolean;
  availability: string;
  skills: string[];
  skillScores: SkillScore[];
  email?: string;
  phone?: string;
  linkedin?: string;
  city?: string;
  strongPoints?: string[];
  certifications?: Certification[];
  workHistory?: WorkHistory[];
  personalityScores?: Record<string, number>;
}

function getStableValue(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return 75 + (Math.abs(hash) % 15);
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────
// Fully dynamic: axes & scores are passed in as props, derived from skill data.

interface RadarAxis {
  label: string;
  angle: number; // degrees; 0 = right, start from top (-90)
}

function RadarChart({
  axes,
  scores,
}: {
  axes: RadarAxis[];
  scores: number[]; // parallel array — one value per axis, 0-100
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cx = 160;
  const cy = 160;
  const R = 110;

  function toXY(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, 320, 320);

    // Grid rings
    [0.25, 0.5, 0.75, 1].forEach((frac) => {
      ctx.beginPath();
      axes.forEach((axis, i) => {
        const { x, y } = toXY(axis.angle, R * frac);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Spokes
    axes.forEach((axis) => {
      const { x, y } = toXY(axis.angle, R);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Data polygon
    ctx.beginPath();
    axes.forEach((axis, i) => {
      const val = (scores[i] ?? 0) / 100;
      const { x, y } = toXY(axis.angle, R * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(59, 130, 246, 0.12)";
    ctx.fill();
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    axes.forEach((axis, i) => {
      const val = (scores[i] ?? 0) / 100;
      const { x, y } = toXY(axis.angle, R * val);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = "#3B82F6";
      ctx.fill();
    });
  }, [axes, scores]);

  return (
    <Box sx={{ position: "relative", width: 320, height: 320 }}>
      <canvas ref={canvasRef} width={320} height={320} />
      {axes.map((axis) => {
        const rad = ((axis.angle - 90) * Math.PI) / 180;
        const lx = cx + (R + 26) * Math.cos(rad);
        const ly = cy + (R + 26) * Math.sin(rad);
        return axis.label ? (
          <Typography
            key={axis.label}
            sx={{
              position: "absolute",
              left: lx,
              top: ly,
              transform: "translate(-50%, -50%)",
              fontSize: 11,
              color: "#9CA3AF",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            {axis.label}
          </Typography>
        ) : null;
      })}
    </Box>
  );
}

// ─── Skill Bar ────────────────────────────────────────────────────────────────

const BAR_COLORS = [
  "linear-gradient(90deg,#3B82F6,#06B6D4)",
  "linear-gradient(90deg,#10B981,#06B6D4)",
  "linear-gradient(90deg,#8B5CF6,#6366F1)",
  "linear-gradient(90deg,#F59E0B,#F97316)",
  "linear-gradient(90deg,#EC4899,#F43F5E)",
  "linear-gradient(90deg,#14B8A6,#10B981)",
];

function SkillBar({
  label,
  value,
  index,
}: {
  label: string;
  value: number;
  index: number;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
          {value}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: "#E5E7EB",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${value}%`,
            background: BAR_COLORS[index % BAR_COLORS.length],
            borderRadius: 3,
            transition: "width 0.6s ease",
          }}
        />
      </Box>
    </Box>
  );
}

// ─── Company Icon ─────────────────────────────────────────────────────────────

function CompanyIcon({ letter }: { letter: string }) {
  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: "8px",
        bgcolor: "#F3F4F6",
        border: "1px solid #E5E7EB",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {letter}
    </Box>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export function TalentProfileModal({
  candidate,
  open,
  onClose,
  orgId,
  jdId,
}: {
  candidate: CandidateDetail | null;
  open: boolean;
  onClose: () => void;
  orgId: string;
  jdId: string;
}) {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const [scheduling, setScheduling] = useState(false);
  const [shortlisting, setShortlisting] = useState(false);

  if (!candidate) return null;

  async function handleShortlist() {
    if (!candidate) return;
    setShortlisting(true);
    try {
      const res = await fetch(
        `/api/orgs/${orgId}/job-descriptions/${jdId}/pipeline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            stage: "screening",
          }),
        },
      );

      if (res.ok) {
        setSnackbar({
          open: true,
          message: `${candidate.name} has been shortlisted ✓`,
          severity: "success",
        });
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to shortlist candidate.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setShortlisting(false);
    }
  }

  async function handleScheduleInterview() {
    if (!candidate) return;
    setScheduling(true);
    try {
      const res = await fetch(
        `/api/orgs/${orgId}/job-descriptions/${jdId}/pipeline`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            candidateId: candidate.id,
            stage: "interview",
          }),
        },
      );

      if (res.ok) {
        setSnackbar({
          open: true,
          message: `Interview scheduled with ${candidate.name} ✓`,
          severity: "success",
        });
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to schedule interview.",
          severity: "error",
        });
      }
    } catch {
      setSnackbar({
        open: true,
        message: "Network error. Please try again.",
        severity: "error",
      });
    } finally {
      setScheduling(false);
    }
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  const resolvedSkills: SkillScore[] = candidate.skillScores?.length
    ? candidate.skillScores
    : candidate.skills.map((name) => ({ name, score: getStableValue(name) }));

  const radarSkills = resolvedSkills.slice(0, 6);
  const radarAxes: RadarAxis[] = radarSkills.map((s, i) => ({
    label: s.name,
    angle: -90 + i * (360 / radarSkills.length),
  }));
  const radarScores: number[] = radarSkills.map((s) => s.score);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: "20px",
          width: 1060,
          maxHeight: "90vh",
          overflow: "hidden",
          m: 2,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            bgcolor: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: "14px",
                background:
                  "linear-gradient(135deg, #6366F1, #8B5CF6, #EC4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {initials}
            </Box>

            <Box>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 20,
                  color: "#111827",
                  lineHeight: 1.2,
                }}
              >
                {candidate.name}
              </Typography>
              <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 0.5 }}>
                {candidate.role}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  📍 {candidate.location}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                  🗂 {candidate.experience}
                </Typography>
                {candidate.available && (
                  <Chip
                    label="✓ Available now"
                    size="small"
                    sx={{
                      bgcolor: "#DCFCE7",
                      color: "#059669",
                      fontWeight: 600,
                      fontSize: 11,
                      height: 22,
                      borderRadius: "6px",
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* <Box
              sx={{
                bgcolor: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "14px",
                px: 3,
                py: 1.5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{ fontWeight: 800, fontSize: 28, color: "#1D4ED8", lineHeight: 1 }}
              >
                {candidate.match}%
              </Typography>
              <Typography sx={{ fontSize: 11, color: "#6B7280", mt: 0.3 }}>
                match score
              </Typography>
            </Box> */}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: "#F3F4F6",
                borderRadius: "8px",
                "&:hover": { bgcolor: "#E5E7EB" },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* ── Body ── */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel — skill bars */}
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: "1px solid #E5E7EB",
              p: 3,
              overflowY: "auto",
            }}
          >
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9CA3AF",
                letterSpacing: 1,
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              Skill Match Scores
            </Typography>

            {/* One bar per resolved skill — the radar reads from this same list */}
            {resolvedSkills.map((s, i) => (
              <SkillBar key={s.name} label={s.name} value={s.score} index={i} />
            ))}

            {candidate.strongPoints?.length ? (
              <>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: 1,
                    mt: 2.5,
                    mb: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Strong Points
                </Typography>
                {candidate.strongPoints.map((pt, i) => (
                  <Typography
                    key={i}
                    sx={{ fontSize: 12, color: "#374151", mb: 0.75 }}
                  >
                    → {pt}
                  </Typography>
                ))}
              </>
            ) : null}

            {candidate.certifications?.length ? (
              <>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: 1,
                    mt: 2.5,
                    mb: 1,
                    textTransform: "uppercase",
                  }}
                >
                  Certifications
                </Typography>
                {candidate.certifications.map((cert, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      gap: 1,
                      alignItems: "flex-start",
                      p: 1.2,
                      borderRadius: "10px",
                      bgcolor: "#F3F4F6",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: 16 }}>🎓</Typography>
                    <Box>
                      <Typography
                        sx={{ fontSize: 12, fontWeight: 600, color: "#111827" }}
                      >
                        {cert.name}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                        {cert.issuer} · {cert.year}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </>
            ) : null}
          </Box>

          {/* Right panel — radar + work history + contact */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 3 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9CA3AF",
                letterSpacing: 1,
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              Skill Radar
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              {/*
                axes  = skill names as radar labels (up to 6)
                scores = the actual score values in the same order
                Both come from resolvedSkills — single source of truth.
              */}
              <RadarChart axes={radarAxes} scores={radarScores} />
            </Box>

            {candidate.workHistory?.length ? (
              <>
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: "#9CA3AF",
                    letterSpacing: 1,
                    mb: 1.5,
                    textTransform: "uppercase",
                  }}
                >
                  Work Experience
                </Typography>
                <Box sx={{ position: "relative", pl: 2 }}>
                  {candidate.workHistory.map((w, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: "flex",
                        gap: 2,
                        mb: 2,
                        alignItems: "flex-start",
                      }}
                    >
                      <CompanyIcon letter={w.company?.[0] ?? "?"} />
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#111827",
                          }}
                        >
                          {w.title}
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
                          {w.company}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                          {w.from} – {w.current ? "Present" : w.to}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </>
            ) : null}

            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: "#9CA3AF",
                letterSpacing: 1,
                mt: 1,
                mb: 1.5,
                textTransform: "uppercase",
              }}
            >
              Contact Details
            </Typography>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              {[
                { label: "Email", value: candidate.email },
                { label: "Phone", value: candidate.phone },
                { label: "LinkedIn", value: candidate.linkedin },
                { label: "City", value: candidate.city ?? candidate.location },
              ].map(({ label, value }) =>
                value ? (
                  <Box
                    key={label}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      bgcolor: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 10,
                        color: "#9CA3AF",
                        mb: 0.3,
                        fontWeight: 500,
                      }}
                    >
                      {label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: "#111827",
                        fontWeight: 500,
                        wordBreak: "break-all",
                      }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ) : null,
              )}
            </Box>
          </Box>
        </Box>

        {/* ── Footer ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            bgcolor: "#fff",
            borderTop: "1px solid #E5E7EB",
            display: "flex",
            gap: 1.5,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<BookmarkBorderIcon />}
            disabled={shortlisting} // ← add
            onClick={handleShortlist} // ← add
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "#E5E7EB",
              color: "#374151",
              fontWeight: 600,
              fontSize: 13,
              "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
            }}
          >
            {shortlisting ? "Shortlisting…" : "Shortlist"}{" "}
            
          </Button>
          <Button
            variant="outlined"
            startIcon={<CalendarMonthOutlinedIcon />}
            disabled={scheduling}
            onClick={handleScheduleInterview}
            sx={{
              flex: 1,
              textTransform: "none",
              borderRadius: "10px",
              borderColor: "#E5E7EB",
              color: "#374151",
              fontWeight: 600,
              fontSize: 13,
              "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
            }}
          >
            {scheduling ? "Scheduling…" : "Schedule Interview"}
          </Button>
          <Button
            variant="contained"
            startIcon={<EmailOutlinedIcon />}
            sx={{
              flex: 1.5,
              textTransform: "none",
              borderRadius: "10px",
              bgcolor: "#2563EB",
              fontWeight: 600,
              fontSize: 13,
              boxShadow: "none",
              "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
            }}
          >
            Send Outreach
          </Button>
        </Box>
      </DialogContent>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: "10px", fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
}
