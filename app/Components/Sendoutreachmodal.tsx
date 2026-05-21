"use client";

import {
  Box,
  Typography,
  Dialog,
  DialogContent,
  IconButton,
  Button,
  TextField,
  Chip,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendIcon from "@mui/icons-material/Send";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendOutreachModalProps {
  open: boolean;
  onClose: () => void;
  candidate: {
    id: string;
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  orgId: string;
  jdId: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────

type TemplateKey = "initial_reachout" | "interview_invite" | "follow_up" | "offer_letter";

interface Template {
  label: string;
  subject: string;
  message: string;
}

function buildTemplates(candidateName: string, role: string): Record<TemplateKey, Template> {
  const first = candidateName.split(" ")[0];
  return {
    initial_reachout: {
      label: "Initial reach-out",
      subject: `Exciting opportunity at Acme – ${role} role`,
      message: `Hi ${first},\n\nI came across your profile and was impressed by your expertise. We have an exciting ${role} opportunity at Acme that I believe aligns well with your background.\n\nWould you be open to a brief conversation to explore this further?\n\nLooking forward to hearing from you.\n\nWarm regards,\nRecruiting Team`,
    },
    interview_invite: {
      label: "Interview invite",
      subject: `Interview invitation – ${role} at Acme`,
      message: `Hi ${first},\n\nThank you for your interest in the ${role} position at Acme. We'd love to invite you for an interview to discuss the opportunity further.\n\nPlease let us know your availability and we'll schedule a time that works for you.\n\nWarm regards,\nRecruiting Team`,
    },
    follow_up: {
      label: "Follow-up",
      subject: `Following up – ${role} opportunity at Acme`,
      message: `Hi ${first},\n\nI wanted to follow up on my previous message regarding the ${role} role at Acme. We're still very interested in connecting with you.\n\nPlease feel free to reach out if you have any questions.\n\nWarm regards,\nRecruiting Team`,
    },
    offer_letter: {
      label: "Offer letter",
      subject: `Job offer – ${role} at Acme`,
      message: `Hi ${first},\n\nWe are delighted to extend an offer for the ${role} position at Acme. Please find the details of your offer attached.\n\nKindly review and revert with your acceptance at your earliest convenience.\n\nWarm regards,\nRecruiting Team`,
    },
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SendOutreachModal({
  open,
  onClose,
  candidate,
  orgId,
  jdId,
}: SendOutreachModalProps) {
  const templates = buildTemplates(candidate.name, candidate.role);

  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateKey>("initial_reachout");
  const [subject, setSubject] = useState(templates.initial_reachout.subject);
  const [message, setMessage] = useState(templates.initial_reachout.message);
  const [sending, setSending] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const MAX_CHARS = 2000;

  function applyTemplate(key: TemplateKey) {
    setSelectedTemplate(key);
    setSubject(templates[key].subject);
    setMessage(templates[key].message);
  }

  // ── Send message ────────────────────────────────────────────────────────────

  async function handleSend() {
    if (!candidate.email) {
      setSnackbar({
        open: true,
        message: "This candidate has no email address on file.",
        severity: "error",
      });
      return;
    }
    if (!subject.trim() || !message.trim()) {
      setSnackbar({
        open: true,
        message: "Subject and message cannot be empty.",
        severity: "error",
      });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId:    candidate.id,
          candidateName:  candidate.name,
          candidateEmail: candidate.email,
          role:           candidate.role,
          subject,
          message,
          template:       selectedTemplate,
          orgId,
          jdId,
        }),
      });

      if (res.ok) {
        setSnackbar({
          open: true,
          message: `Outreach sent to ${candidate.name} ✓`,
          severity: "success",
        });
        setTimeout(() => onClose(), 1600);
      } else {
        const data = await res.json();
        setSnackbar({
          open: true,
          message: data.error ?? "Failed to send message.",
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
      setSending(false);
    }
  }

  // ── Save draft (just logs / stores locally for now) ─────────────────────────

  async function handleSaveDraft() {
    setSavingDraft(true);
    try {
      await fetch("/api/send-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId:    candidate.id,
          candidateName:  candidate.name,
          candidateEmail: candidate.email,
          role:           candidate.role,
          subject,
          message,
          template:       selectedTemplate,
          orgId,
          jdId,
          draft:          true,   // ← tells backend not to send email
        }),
      });
      setSnackbar({ open: true, message: "Draft saved ✓", severity: "success" });
    } catch {
      setSnackbar({ open: true, message: "Failed to save draft.", severity: "error" });
    } finally {
      setSavingDraft(false);
    }
  }

  const initials = candidate.name.split(" ").map((n) => n[0]).join("");

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            width: 520,
            maxWidth: "95vw",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.13)",
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: "flex", flexDirection: "column" }}>

          {/* ── Header ── */}
          <Box
            sx={{
              px: 3, py: 2,
              borderBottom: "1px solid #F3F4F6",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              bgcolor: "#FAFAFA", flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36, height: 36, borderRadius: "10px",
                  bgcolor: "#EFF6FF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <EmailOutlinedIcon sx={{ fontSize: 18, color: "#2563EB" }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>
                  Send outreach
                </Typography>
                <Typography sx={{ fontSize: 12, color: "#9CA3AF" }}>
                  Reach out to the candidate directly
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={onClose} size="small"
              sx={{ bgcolor: "#F3F4F6", borderRadius: "8px", "&:hover": { bgcolor: "#E5E7EB" } }}
            >
              <CloseIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Box>

          {/* ── Candidate strip ── */}
          <Box
            sx={{
              mx: 3, mt: 2.5, mb: 2, px: 2, py: 1.5,
              borderRadius: "10px", bgcolor: "#F8F9FF", border: "1px solid #E8EAFF",
              display: "flex", alignItems: "center", gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 13, flexShrink: 0,
              }}
            >
              {initials}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>
                {candidate.name}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {candidate.email ?? "No email on file"}
                {candidate.phone ? ` · ${candidate.phone}` : ""}
              </Typography>
            </Box>
          </Box>

          {/* ── Form body ── */}
          <Box sx={{ px: 3, pb: 1 }}>

            {/* Template chips */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 1, letterSpacing: 0.3, textTransform: "uppercase" }}>
                Template
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {(Object.keys(templates) as TemplateKey[]).map((key) => (
                  <Chip
                    key={key}
                    label={templates[key].label}
                    onClick={() => applyTemplate(key)}
                    size="small"
                    sx={{
                      fontSize: 12,
                      fontWeight: selectedTemplate === key ? 700 : 500,
                      borderRadius: "20px",
                      bgcolor: selectedTemplate === key ? "#2563EB" : "#F3F4F6",
                      color:   selectedTemplate === key ? "#fff"    : "#374151",
                      border:  "none",
                      cursor:  "pointer",
                      "&:hover": {
                        bgcolor: selectedTemplate === key ? "#1D4ED8" : "#E5E7EB",
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Subject */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 0.5, letterSpacing: 0.3, textTransform: "uppercase" }}>
                Subject
              </Typography>
              <TextField
                fullWidth size="small"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", fontSize: 13,
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                  },
                }}
              />
            </Box>

            {/* Message */}
            <Box sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", mb: 0.5, letterSpacing: 0.3, textTransform: "uppercase" }}>
                Message
              </Typography>
              <TextField
                fullWidth multiline rows={7}
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) setMessage(e.target.value);
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px", fontSize: 13,
                    "& fieldset": { borderColor: "#E5E7EB" },
                    "&:hover fieldset": { borderColor: "#D1D5DB" },
                  },
                }}
              />
              {/* Char count */}
              <Typography sx={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", mt: 0.5 }}>
                {message.length} / {MAX_CHARS}
              </Typography>
            </Box>
          </Box>

          {/* ── Footer ── */}
          <Box
            sx={{
              px: 3, py: 2,
              bgcolor: "#FAFAFA", borderTop: "1px solid #F3F4F6",
              display: "flex", gap: 1.5, justifyContent: "flex-end",
              flexShrink: 0,
            }}
          >
            <Button
              variant="outlined"
              startIcon={savingDraft ? <CircularProgress size={13} /> : <SaveOutlinedIcon sx={{ fontSize: 15 }} />}
              disabled={savingDraft}
              onClick={handleSaveDraft}
              sx={{
                textTransform: "none", borderRadius: "9px",
                borderColor: "#E5E7EB", color: "#374151",
                fontWeight: 600, fontSize: 13, px: 2.5,
                "&:hover": { borderColor: "#D1D5DB", bgcolor: "#F9FAFB" },
              }}
            >
              {savingDraft ? "Saving…" : "Save draft"}
            </Button>
            <Button
              variant="contained"
              startIcon={sending ? <CircularProgress size={13} color="inherit" /> : <SendIcon sx={{ fontSize: 15 }} />}
              disabled={sending || !candidate.email}
              onClick={handleSend}
              sx={{
                textTransform: "none", borderRadius: "9px",
                bgcolor: "#2563EB", fontWeight: 600, fontSize: 13, px: 2.5,
                boxShadow: "none",
                "&:hover": { bgcolor: "#1D4ED8", boxShadow: "none" },
              }}
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

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
    </>
  );
}