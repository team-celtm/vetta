"use client";

import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  TextField,
  MenuItem,
  Select,
  CircularProgress,
  Divider,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Interviewer {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export interface InterviewRound {
  id: string;
  round_number: number;
  interview_type: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  duration: string | null;
  mode: string | null;
  focus_area: string | null;
  notes_for_candidate: string | null;
  meeting_link: string | null;
  interviewers: string[] | null;
  decision: "selected" | "rejected" | "pending";
  intimation_note: string | null;
  intimation_sent: boolean;
  invite_sent: boolean;
}

export interface ScheduleInterviewModalProps {
  open: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    role: string;
    experience: string;
    location: string;
    email?: string;
    phone?: string;
  };
  availableInterviewers?: Interviewer[];
  orgId: string;
  jdId: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERVIEW_TYPES = [
  "Technical round", "HR round", "Managerial round",
  "Cultural fit", "System design", "Case study",
];
const DURATIONS = ["15 minutes", "30 minutes", "45 minutes", "60 minutes", "90 minutes"];
const MODES     = ["Video call", "In-person", "Phone call"];

// Round 1, 2, 3 = interview stage; Round 4 = offer stage
const PIPELINE_ROUNDS = [
  { label: "Screening", round: 0 },
  { label: "Round 1",   round: 1 },
  { label: "Round 2",   round: 2 },
  { label: "Final",     round: 3 },
  { label: "Offer",     round: 4 },
];

function defaultNote(name: string, role: string) {
  return `Hi ${name},\n\nThank you for taking the time to interview with us for the ${role} role.\n\nWe will be in touch shortly with an update regarding your application status.\n\nWarm regards,\nRecruiting Team`;
}

function nextRoundLabel(currentRound: number): string {
  if (currentRound >= 3) return "Offer stage";
  if (currentRound === 2) return "Final round";
  return `Round ${currentRound + 1}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 0.5, letterSpacing: 0.3, textTransform: "uppercase" }}>
      {children}
    </Typography>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", letterSpacing: 1, mb: 1.5, textTransform: "uppercase" }}>
      {children}
    </Typography>
  );
}

function InfoBox({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <Box sx={{ p: 1.5, borderRadius: "8px", bgcolor: "#F9FAFB", border: "1px solid #F3F4F6" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
        <Box sx={{ width: 12, height: 12, borderRadius: "3px", border: "1.5px solid #D1D5DB", bgcolor: "#fff", flexShrink: 0 }} />
        <Typography sx={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600 }}>{label}</Typography>
      </Box>
      {isLink && value && value !== "—" ? (
        <a href={value} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 13, fontWeight: 600, color: "#2563EB", textDecoration: "none", wordBreak: "break-all" }}>
          {value}
        </a>
      ) : (
        <Typography sx={{ fontSize: 13, color: "#111827", fontWeight: 600, wordBreak: "break-all" }}>
          {value || "—"}
        </Typography>
      )}
    </Box>
  );
}

function RoundProgressBar({ activeRound, rounds }: { activeRound: number; rounds: InterviewRound[] }) {
  function getDecisionForRound(r: number) {
    return rounds.find((x) => x.round_number === r)?.decision ?? null;
  }

  return (
    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
      {PIPELINE_ROUNDS.map((step, idx) => {
        const dec         = getDecisionForRound(step.round);
        const isRejected  = dec === "rejected";
        const isCompleted = !isRejected && (dec === "selected" || step.round < activeRound);
        const isActive    = step.round === activeRound;
        const isLast      = idx === PIPELINE_ROUNDS.length - 1;

        const borderColor = isRejected ? "#EF4444" : isCompleted ? "#10B981" : isActive ? "#2563EB" : "#D1D5DB";
        const bgColor     = isRejected ? "#FEF2F2" : isCompleted ? "#10B981" : isActive ? "#EFF6FF" : "#F9FAFB";
        const labelColor  = isRejected ? "#EF4444" : isCompleted ? "#10B981" : isActive ? "#2563EB" : "#9CA3AF";

        return (
          <Box key={step.label} sx={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 28, height: 28, borderRadius: "50%", border: "2px solid", borderColor, bgcolor: bgColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}>
                {isRejected ? (
                  <CancelOutlinedIcon sx={{ fontSize: 14, color: "#EF4444" }} />
                ) : isCompleted ? (
                  <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#fff" }} />
                ) : (
                  <Typography sx={{ fontSize: 10, fontWeight: 700, color: isActive ? "#2563EB" : "#9CA3AF" }}>
                    {step.round === 0 ? "✓" : step.round === 4 ? "★" : step.round}
                  </Typography>
                )}
              </Box>
              <Typography sx={{ fontSize: 10, fontWeight: isActive ? 700 : 500, color: labelColor, whiteSpace: "nowrap" }}>
                {step.label}
              </Typography>
            </Box>
            {!isLast && (
              <Box sx={{ flex: 1, height: 2, bgcolor: isCompleted && !isRejected ? "#10B981" : "#E5E7EB", mx: 0.5, mb: 2.5, transition: "background 0.2s" }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScheduleInterviewModal({
  open,
  onClose,
  candidate,
  availableInterviewers = [],
  orgId,
  jdId,
}: ScheduleInterviewModalProps) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  // ── DB state ──────────────────────────────────────────────────────────────
  const [loading,      setLoading]      = useState(true);
  const [rounds,       setRounds]       = useState<InterviewRound[]>([]);
  const [currentRound, setCurrentRound] = useState(1);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [section, setSection] = useState<"schedule" | "decision">("schedule");

  const [form, setForm] = useState({
    interviewType: "Technical round",
    date:          today,
    time:          "10:30",
    duration:      "45 minutes",
    mode:          "Video call",
    focusArea:     "",
    notes:         "",
    meetingLink:   "",
  });

  const [interviewerList,       setInterviewerList]       = useState<Interviewer[]>([]);
  const [selectedInterviewers,  setSelectedInterviewers]  = useState<string[]>([]);
  const [newInterviewerName,    setNewInterviewerName]    = useState("");

  const [decision,       setDecision]       = useState<"selected" | "rejected" | null>(null);
  const [intimationNote, setIntimationNote] = useState(defaultNote(candidate.name, candidate.role));
  const [editingNote,    setEditingNote]    = useState(false);

  const [sendingInvite, setSendingInvite] = useState(false);
  const [savingDraft,   setSavingDraft]   = useState(false);
  const [submitting,    setSubmitting]    = useState(false);

  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>
    ({ open: false, message: "", severity: "success" });

  const availableInterviewersRef = useRef(availableInterviewers);
  useEffect(() => { availableInterviewersRef.current = availableInterviewers; }, [availableInterviewers]);

  const roundsApiBase = `/api/orgs/${orgId}/job-descriptions/${jdId}/candidates/${candidate.id}/interview-rounds`;

  // ── Load rounds ────────────────────────────────────────────────────────────

  const loadRounds = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(roundsApiBase);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const fetchedRounds: InterviewRound[] = data.rounds ?? [];
      const fetchedCurrentRound: number = data.currentRound ?? 1;

      setRounds(fetchedRounds);
      setCurrentRound(fetchedCurrentRound);

      // Pre-fill form from the active round if it exists
      const activeRound = fetchedRounds.find(
        (r) => r.round_number === fetchedCurrentRound
      );

      if (activeRound) {
        setForm({
          interviewType: activeRound.interview_type        ?? "Technical round",
          date:          activeRound.scheduled_date        ?? today,
          time:          activeRound.scheduled_time        ?? "10:30",
          duration:      activeRound.duration              ?? "45 minutes",
          mode:          activeRound.mode                  ?? "Video call",
          focusArea:     activeRound.focus_area            ?? "",
          notes:         activeRound.notes_for_candidate   ?? "",
          meetingLink:   activeRound.meeting_link          ?? "",
        });

        // Restore interviewers from DB
        if (activeRound.interviewers?.length) {
          const restored: Interviewer[] = activeRound.interviewers.map((name, i) => {
            const COLORS = ["#6366F1","#0EA5E9","#10B981","#F59E0B","#EF4444","#8B5CF6"];
            const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
            return { id: `restored-${i}`, name, initials, color: COLORS[i % COLORS.length] };
          });
          setInterviewerList(restored);
          setSelectedInterviewers(restored.map((iv) => iv.id));
        } else {
          setInterviewerList([]);
          setSelectedInterviewers([]);
        }

        if (activeRound.decision !== "pending") {
          setDecision(activeRound.decision as "selected" | "rejected");
        }
        if (activeRound.intimation_note) {
          setIntimationNote(activeRound.intimation_note);
        }
      } else {
        // New round — reset form
        setForm({
          interviewType: "Technical round",
          date:          today,
          time:          "10:30",
          duration:      "45 minutes",
          mode:          "Video call",
          focusArea:     "",
          notes:         "",
          meetingLink:   "",
        });
        setInterviewerList([]);
        setSelectedInterviewers([]);
      }
    } catch (err) {
      console.error("[loadRounds]", err);
    } finally {
      setLoading(false);
    }
  }, [roundsApiBase, today]);

  useEffect(() => {
    if (!open) return;
    setSection("schedule");
    setDecision(null);
    setEditingNote(false);
    setIntimationNote(defaultNote(candidate.name, candidate.role));
    setInterviewerList([]);
    setSelectedInterviewers([]);
    setNewInterviewerName("");
    loadRounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loadRounds]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  function setField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleInterviewer(id: string) {
    setSelectedInterviewers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addInterviewer() {
    const name = newInterviewerName.trim();
    if (!name) return;
    if (interviewerList.some((iv) => iv.name.toLowerCase() === name.toLowerCase())) {
      setNewInterviewerName("");
      return;
    }
    const COLORS = ["#6366F1","#0EA5E9","#10B981","#F59E0B","#EF4444","#8B5CF6"];
    const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    const newIv: Interviewer = { id: `iv-${Date.now()}`, name, initials, color: COLORS[interviewerList.length % COLORS.length] };
    setInterviewerList((prev) => [...prev, newIv]);
    setSelectedInterviewers((prev) => [...prev, newIv.id]);
    setNewInterviewerName("");
  }

  const interviewerNames = interviewerList
    .filter((i) => selectedInterviewers.includes(i.id))
    .map((i) => i.name);

  const initials = candidate.name.split(" ").map((n) => n[0]).join("");

  // ── Save round to DB ───────────────────────────────────────────────────────

  async function saveRoundToDB(inviteSent: boolean) {
    const res = await fetch(roundsApiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        roundNumber:   currentRound,
        interviewType: form.interviewType,
        date:          form.date,
        time:          form.time,
        duration:      form.duration,
        mode:          form.mode,
        focusArea:     form.focusArea,
        notes:         form.notes,
        meetingLink:   form.meetingLink,
        interviewers:  interviewerNames,
        inviteSent,
      }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error ?? "Failed to save round.");
    }
  }

  // ── Send invite ────────────────────────────────────────────────────────────

  async function handleSendInvite() {
    if (!form.date || !form.time) {
      return setSnackbar({ open: true, message: "Please fill in date and time.", severity: "error" });
    }
    if (selectedInterviewers.length === 0) {
      return setSnackbar({ open: true, message: "Select at least one interviewer.", severity: "error" });
    }

    setSendingInvite(true);
    try {
      await saveRoundToDB(true);

      const inviteRes = await fetch("/api/send-interview-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId:    candidate.id,
          candidateName:  candidate.name,
          candidateEmail: candidate.email,
          role:           candidate.role,
          interviewType:  form.interviewType,
          date:           form.date,
          time:           form.time,
          duration:       form.duration,
          mode:           form.mode,
          focusArea:      form.focusArea,
          meetingLink:    form.meetingLink,
          interviewers:   interviewerNames,
          notes:          form.notes,
          orgId,
          jdId,
        }),
      });

      if (!inviteRes.ok) {
        const d = await inviteRes.json();
        throw new Error(d.error ?? "Failed to send email.");
      }

      await loadRounds();
      setSnackbar({ open: true, message: `Invite sent to ${candidate.name} ✓`, severity: "success" });
      setTimeout(() => setSection("decision"), 1200);
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Unknown error", severity: "error" });
    } finally {
      setSendingInvite(false);
    }
  }

  // ── Save draft ─────────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      await saveRoundToDB(false);
      await loadRounds();
      setSnackbar({ open: true, message: "Draft saved ✓", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Unknown error", severity: "error" });
    } finally {
      setSavingDraft(false);
    }
  }

  // ── Submit decision ────────────────────────────────────────────────────────

  async function handleSubmitDecision() {
    if (!decision) {
      return setSnackbar({ open: true, message: "Please select a decision first.", severity: "error" });
    }

    setSubmitting(true);
    try {
      const patchRes = await fetch(roundsApiBase, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber:    currentRound,
          decision,
          intimationNote,
          intimationSent: true,
        }),
      });

      if (!patchRes.ok) {
        const d = await patchRes.json();
        throw new Error(d.error ?? "Failed to save decision.");
      }

      const { nextStage, nextRound } = await patchRes.json();

      await fetch("/api/send-intimation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: candidate.email,
          candidateName:  candidate.name,
          role:           candidate.role,
          decision,
          note:           intimationNote,
          nextRound:      decision === "selected" ? nextRound : null,
        }),
      });

      await loadRounds();

      const successMsg = decision === "selected"
        ? `${candidate.name} moved to ${nextStage === "offer" ? "Offer stage" : nextRoundLabel(currentRound)} ✓`
        : `${candidate.name} exited the process.`;

      setSnackbar({ open: true, message: successMsg, severity: "success" });

      if (decision === "selected" && nextRound) {
        // Stay open, show new round
        setTimeout(() => {
          setDecision(null);
          setSection("schedule");
        }, 1400);
      } else {
        setTimeout(() => onClose(), 1800);
      }
    } catch (err) {
      setSnackbar({ open: true, message: err instanceof Error ? err.message : "Unknown error", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  const activeRoundData = rounds.find((r) => r.round_number === currentRound);
  const alreadyDecided  = activeRoundData?.decision !== "pending" && activeRoundData?.decision !== undefined;
  const inviteAlreadySent = activeRoundData?.invite_sent ?? false;
  const isRejected = rounds.some((r) => r.decision === "rejected");

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: "16px", width: 620, maxWidth: "95vw",
            maxHeight: "90vh", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.13)",
            display: "flex", flexDirection: "column",
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* ── Header ── */}
          <Box sx={{ px: 3, py: 2, borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "#FAFAFA", flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: "#6366F1" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Schedule interview</Typography>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>Book a session with the candidate</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {!loading && (
                <Box sx={{
                  px: 1.5, py: 0.5, borderRadius: "20px",
                  bgcolor: isRejected ? "#FEF2F2" : "#EFF6FF",
                  border: `1px solid ${isRejected ? "#FECACA" : "#DBEAFE"}`,
                }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: isRejected ? "#DC2626" : "#2563EB" }}>
                    {isRejected
                      ? "Process ended"
                      : currentRound === 4
                      ? "Offer stage"
                      : currentRound === 3
                      ? "Final round"
                      : `Round ${currentRound} — In progress`}
                  </Typography>
                </Box>
              )}
              <IconButton onClick={onClose} size="small" sx={{ bgcolor: "#F3F4F6", borderRadius: "8px", "&:hover": { bgcolor: "#E5E7EB" } }}>
                <CloseIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Box>
          </Box>

          {/* ── Scrollable content ── */}
          <Box sx={{ flex: 1, overflowY: "auto" }}>

            {/* Round progress */}
            <Box sx={{ px: 3, pt: 2.5 }}>
              {loading
                ? <Skeleton variant="rectangular" height={52} sx={{ borderRadius: "8px", mb: 3 }} />
                : <RoundProgressBar activeRound={currentRound} rounds={rounds} />
              }
            </Box>

            {/* Candidate strip */}
            <Box sx={{ mx: 3, mb: 2, px: 2, py: 1.5, borderRadius: "10px", bgcolor: "#F8F9FF", border: "1px solid #E8EAFF", display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ width: 38, height: 38, borderRadius: "10px", background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                {initials}
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{candidate.name}</Typography>
                <Typography sx={{ fontSize: 12, color: "#6B7280" }}>{candidate.role} · {candidate.experience} · {candidate.location}</Typography>
              </Box>
            </Box>

            {/* Section tabs */}
            <Box sx={{ mx: 3, mb: 2, display: "flex", borderRadius: "10px", bgcolor: "#F3F4F6", p: 0.5, gap: 0.5 }}>
              {(["schedule", "decision"] as const).map((tab) => (
                <Box key={tab} onClick={() => setSection(tab)}
                  sx={{ flex: 1, py: 0.9, borderRadius: "8px", textAlign: "center", cursor: "pointer", bgcolor: section === tab ? "#fff" : "transparent", boxShadow: section === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
                  <Typography sx={{ fontSize: 12, fontWeight: section === tab ? 700 : 500, color: section === tab ? "#111827" : "#6B7280" }}>
                    {tab === "schedule" ? "📅 Interview Details" : "✅ Decision"}
                  </Typography>
                </Box>
              ))}
            </Box>

            {/* ═══ SCHEDULE SECTION ═══ */}
            {section === "schedule" && (
              <Box sx={{ px: 3, pb: 1 }}>
                {loading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {[80, 60, 80, 60].map((w, i) => <Skeleton key={i} variant="rectangular" height={w} sx={{ borderRadius: "8px" }} />)}
                  </Box>
                ) : (
                  <>
                    {/* Read-only summary */}
                    <SectionLabel>Interview Details</SectionLabel>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1.5, mb: 2 }}>
                      <InfoBox label="Date"        value={form.date} />
                      <InfoBox label="Time"        value={form.time} />
                      <InfoBox label="Interviewer" value={interviewerNames[0] ?? "—"} />
                      <InfoBox label="Mode"        value={form.mode} />
                      <InfoBox label="Duration"    value={form.duration} />
                      <InfoBox label="Focus area"  value={form.focusArea || "—"} />
                    </Box>

                    {/* Meeting link read-only display */}
                    {form.meetingLink && (
                      <Box sx={{ mb: 2 }}>
                        <InfoBox label="Meeting link" value={form.meetingLink} isLink />
                      </Box>
                    )}

                    {/* Invite sent badge */}
                    {inviteAlreadySent && (
                      <Box sx={{ mb: 2, px: 2, py: 1, borderRadius: "8px", bgcolor: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#10B981" }} />
                        <Typography sx={{ fontSize: 12, color: "#059669", fontWeight: 600 }}>
                          Invite already sent for this round
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ mb: 2 }} />
                    <SectionLabel>Configure</SectionLabel>

                    {/* Interview type */}
                    <Box sx={{ mb: 2 }}>
                      <FieldLabel>Interview type</FieldLabel>
                      <Select fullWidth size="small" value={form.interviewType} onChange={(e) => setField("interviewType", e.target.value)}
                        sx={{ borderRadius: "8px", fontSize: 13, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
                        {INTERVIEW_TYPES.map((t) => <MenuItem key={t} value={t} sx={{ fontSize: 13 }}>{t}</MenuItem>)}
                      </Select>
                    </Box>

                    {/* Date + Time */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
                      <Box>
                        <FieldLabel>Date</FieldLabel>
                        <TextField fullWidth size="small" type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} inputProps={{ min: today }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }} />
                      </Box>
                      <Box>
                        <FieldLabel>Time</FieldLabel>
                        <TextField fullWidth size="small" type="time" value={form.time} onChange={(e) => setField("time", e.target.value)}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }} />
                      </Box>
                    </Box>

                    {/* Duration + Mode */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 2 }}>
                      <Box>
                        <FieldLabel>Duration</FieldLabel>
                        <Select fullWidth size="small" value={form.duration} onChange={(e) => setField("duration", e.target.value)}
                          sx={{ borderRadius: "8px", fontSize: 13, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
                          {DURATIONS.map((d) => <MenuItem key={d} value={d} sx={{ fontSize: 13 }}>{d}</MenuItem>)}
                        </Select>
                      </Box>
                      <Box>
                        <FieldLabel>Mode</FieldLabel>
                        <Select fullWidth size="small" value={form.mode} onChange={(e) => setField("mode", e.target.value)}
                          sx={{ borderRadius: "8px", fontSize: 13, "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E5E7EB" } }}>
                          {MODES.map((m) => <MenuItem key={m} value={m} sx={{ fontSize: 13 }}>{m}</MenuItem>)}
                        </Select>
                      </Box>
                    </Box>

                    {/* Focus area */}
                    <Box sx={{ mb: 2 }}>
                      <FieldLabel>Focus area</FieldLabel>
                      <TextField fullWidth size="small" placeholder="e.g. .NET / SQL" value={form.focusArea} onChange={(e) => setField("focusArea", e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }} />
                    </Box>

                    {/* Meeting link */}
                    <Box sx={{ mb: 2 }}>
                      <FieldLabel>Meeting link</FieldLabel>
                      <TextField
                        fullWidth size="small"
                        placeholder="https://meet.google.com/xxx or Zoom link"
                        value={form.meetingLink}
                        onChange={(e) => setField("meetingLink", e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <LinkIcon sx={{ fontSize: 16, color: "#9CA3AF", mr: 0.5 }} />
                          ),
                        }}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }}
                      />
                    </Box>

                    {/* Interviewers */}
                    <Box sx={{ mb: 2 }}>
                      <FieldLabel>Interviewers</FieldLabel>
                      {interviewerList.length > 0 && (
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                          {interviewerList.map((iv) => (
                            <Box key={iv.id}
                              sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, px: 1.5, py: 0.6, borderRadius: "20px", border: "1.5px solid", borderColor: selectedInterviewers.includes(iv.id) ? iv.color : "#E5E7EB", bgcolor: selectedInterviewers.includes(iv.id) ? `${iv.color}14` : "#F9FAFB", cursor: "pointer", transition: "all 0.15s", userSelect: "none", "&:hover": { borderColor: iv.color } }}
                              onClick={() => toggleInterviewer(iv.id)}>
                              <Box sx={{ width: 22, height: 22, borderRadius: "50%", bgcolor: iv.color, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {iv.initials}
                              </Box>
                              <Typography sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{iv.name}</Typography>
                              <Box onClick={(e) => { e.stopPropagation(); setInterviewerList((p) => p.filter((x) => x.id !== iv.id)); setSelectedInterviewers((p) => p.filter((x) => x !== iv.id)); }}
                                sx={{ ml: 0.25, color: "#9CA3AF", fontSize: 14, lineHeight: 1, cursor: "pointer", "&:hover": { color: "#EF4444" } }}>
                                ×
                              </Box>
                            </Box>
                          ))}
                        </Box>
                      )}
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <TextField size="small" fullWidth placeholder="Type interviewer name and press Add"
                          value={newInterviewerName}
                          onChange={(e) => setNewInterviewerName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterviewer(); } }}
                          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }} />
                        <Button variant="outlined" onClick={addInterviewer} disabled={!newInterviewerName.trim()}
                          sx={{ textTransform: "none", borderRadius: "8px", borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, fontSize: 13, px: 2, flexShrink: 0, "&:hover": { borderColor: "#6366F1", color: "#6366F1", bgcolor: "#EEF2FF" } }}>
                          Add
                        </Button>
                      </Box>
                    </Box>

                    {/* Notes */}
                    <Box sx={{ mb: 3 }}>
                      <FieldLabel>Notes for candidate (optional)</FieldLabel>
                      <TextField fullWidth multiline rows={2} size="small" placeholder="e.g. Please have your IDE ready, focus areas are .NET and SQL…"
                        value={form.notes} onChange={(e) => setField("notes", e.target.value)}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, "& fieldset": { borderColor: "#E5E7EB" } } }} />
                    </Box>
                  </>
                )}
              </Box>
            )}

            {/* ═══ DECISION SECTION ═══ */}
            {section === "decision" && (
              <Box sx={{ px: 3, pb: 1 }}>
                {loading ? (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Skeleton variant="rectangular" height={80} sx={{ borderRadius: "10px" }} />
                    <Skeleton variant="rectangular" height={160} sx={{ borderRadius: "10px" }} />
                  </Box>
                ) : (
                  <>
                    {/* Previous rounds summary */}
                    {rounds.filter((r) => r.decision !== "pending" && r.round_number !== currentRound).length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        <SectionLabel>Previous rounds</SectionLabel>
                        {rounds
                          .filter((r) => r.decision !== "pending" && r.round_number !== currentRound)
                          .map((r) => (
                            <Box key={r.id}
                              sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.2, mb: 1, borderRadius: "8px", bgcolor: r.decision === "selected" ? "#F0FDF4" : "#FEF2F2", border: "1px solid", borderColor: r.decision === "selected" ? "#BBF7D0" : "#FECACA" }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                                {r.round_number === 3 ? "Final" : `Round ${r.round_number}`} — {r.interview_type}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                {r.decision === "selected"
                                  ? <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#10B981" }} />
                                  : <CancelOutlinedIcon sx={{ fontSize: 15, color: "#EF4444" }} />
                                }
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: r.decision === "selected" ? "#059669" : "#DC2626", textTransform: "capitalize" }}>
                                  {r.decision}
                                </Typography>
                              </Box>
                            </Box>
                          ))}
                        <Divider sx={{ mb: 2 }} />
                      </Box>
                    )}

                    <SectionLabel>
                      Decision for {currentRound === 3 ? "Final round" : currentRound === 4 ? "Offer stage" : `Round ${currentRound}`}
                    </SectionLabel>

                    {/* Already decided */}
                    {alreadyDecided ? (
                      <Box sx={{ p: 2, borderRadius: "10px", bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
                        {activeRoundData?.decision === "selected"
                          ? <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#10B981" }} />
                          : <CancelOutlinedIcon sx={{ fontSize: 18, color: "#EF4444" }} />
                        }
                        <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
                          Decision already submitted:{" "}
                          <strong style={{ color: activeRoundData?.decision === "selected" ? "#059669" : "#DC2626", textTransform: "capitalize" }}>
                            {activeRoundData?.decision}
                          </strong>
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {/* Decision cards */}
                        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5, mb: 3 }}>
                          <Box onClick={() => setDecision("selected")}
                            sx={{ p: 2, borderRadius: "10px", border: "2px solid", borderColor: decision === "selected" ? "#10B981" : "#E5E7EB", bgcolor: decision === "selected" ? "#F0FDF4" : "#FAFAFA", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 1.5, "&:hover": { borderColor: "#10B981", bgcolor: "#F0FDF4" } }}>
                            <CheckCircleOutlineIcon sx={{ fontSize: 22, color: decision === "selected" ? "#10B981" : "#9CA3AF" }} />
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Selected</Typography>
                              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
                                Move to {nextRoundLabel(currentRound)}
                              </Typography>
                            </Box>
                          </Box>
                          <Box onClick={() => setDecision("rejected")}
                            sx={{ p: 2, borderRadius: "10px", border: "2px solid", borderColor: decision === "rejected" ? "#EF4444" : "#E5E7EB", bgcolor: decision === "rejected" ? "#FEF2F2" : "#FAFAFA", cursor: "pointer", transition: "all 0.15s", display: "flex", alignItems: "center", gap: 1.5, "&:hover": { borderColor: "#EF4444", bgcolor: "#FEF2F2" } }}>
                            <CancelOutlinedIcon sx={{ fontSize: 22, color: decision === "rejected" ? "#EF4444" : "#9CA3AF" }} />
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Not selected</Typography>
                              <Typography sx={{ fontSize: 11, color: "#6B7280" }}>Exit process</Typography>
                            </Box>
                          </Box>
                        </Box>

                        {/* Intimation note */}
                        <SectionLabel>Intimation to candidate</SectionLabel>
                        <Box sx={{ border: "1px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", mb: 3 }}>
                          <Box sx={{ px: 2, py: 1.2, bgcolor: "#F9FAFB", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 14, height: 14, borderRadius: "3px", border: "1.5px solid #D1D5DB", bgcolor: "#fff" }} />
                              <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Default note — will be sent automatically</Typography>
                            </Box>
                            <Button size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />} onClick={() => setEditingNote((v) => !v)}
                              sx={{ textTransform: "none", fontSize: 12, fontWeight: 600, color: "#374151", minWidth: 0, px: 1.5, py: 0.5, borderRadius: "6px", bgcolor: "#F3F4F6", "&:hover": { bgcolor: "#E5E7EB" } }}>
                              Edit ↗
                            </Button>
                          </Box>
                          {editingNote ? (
                            <TextField fullWidth multiline rows={6} value={intimationNote} onChange={(e) => setIntimationNote(e.target.value)}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 0, fontSize: 13, "& fieldset": { border: "none" } } }} />
                          ) : (
                            <Box sx={{ px: 2, py: 1.5 }}>
                              {intimationNote.split("\n").map((line, i) => (
                                <Typography key={i} sx={{ fontSize: 13, color: "#374151", lineHeight: 1.7, minHeight: line === "" ? "1.2em" : undefined }}>
                                  {line || " "}
                                </Typography>
                              ))}
                            </Box>
                          )}
                        </Box>
                      </>
                    )}
                  </>
                )}
              </Box>
            )}
          </Box>

          {/* ── Footer ── */}
          <Box sx={{ px: 3, py: 2, bgcolor: "#FAFAFA", borderTop: "1px solid #F3F4F6", display: "flex", gap: 1.5, justifyContent: "flex-end", flexShrink: 0 }}>
            {section === "schedule" ? (
              <>
                <Button variant="outlined"
                  startIcon={savingDraft ? <CircularProgress size={13} /> : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
                  disabled={savingDraft || loading}
                  onClick={handleSaveDraft}
                  sx={{ textTransform: "none", borderRadius: "9px", borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, fontSize: 13, px: 2.5, "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}>
                  {savingDraft ? "Saving…" : "Save draft"}
                </Button>
                <Button variant="contained"
                  startIcon={sendingInvite ? <CircularProgress size={13} color="inherit" /> : <SendIcon sx={{ fontSize: 15 }} />}
                  disabled={sendingInvite || loading}
                  onClick={handleSendInvite}
                  sx={{ textTransform: "none", borderRadius: "9px", bgcolor: "#2563EB", fontWeight: 600, fontSize: 13, px: 2.5, boxShadow: "none", "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" } }}>
                  {sendingInvite ? "Sending…" : "Send invite"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outlined" onClick={() => setSection("schedule")}
                  sx={{ textTransform: "none", borderRadius: "9px", borderColor: "#E5E7EB", color: "#374151", fontWeight: 600, fontSize: 13, px: 2.5, "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" } }}>
                  ← Back
                </Button>
                {!alreadyDecided && (
                  <Button variant="contained"
                    startIcon={submitting ? <CircularProgress size={13} color="inherit" /> : <SendIcon sx={{ fontSize: 15 }} />}
                    disabled={submitting || !decision || loading}
                    onClick={handleSubmitDecision}
                    sx={{ textTransform: "none", borderRadius: "9px", bgcolor: decision === "rejected" ? "#EF4444" : "#2563EB", fontWeight: 600, fontSize: 13, px: 2.5, boxShadow: "none", "&:hover": { bgcolor: decision === "rejected" ? "#DC2626" : "#1D4ED8", boxShadow: "none" } }}>
                    {submitting ? "Submitting…" : "Submit & send intimation"}
                  </Button>
                )}
              </>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ borderRadius: "10px", fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}