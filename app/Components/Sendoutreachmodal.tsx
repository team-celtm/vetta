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
  InputAdornment,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SendIcon from "@mui/icons-material/Send";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import { useState } from "react";

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

type TemplateKey =
  | "initial_reachout"
  | "interview_invite"
  | "follow_up"
  | "offer_letter";

interface Template {
  label: string;
  subject: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// Templates
// ─────────────────────────────────────────────────────────────

function buildTemplates(
  candidateName: string,
  role: string,
  ctc?: string,
): Record<TemplateKey, Template> {
  const first = candidateName.split(" ")[0];

  return {
    initial_reachout: {
      label: "Initial reach-out",
      subject: `Exciting opportunity at Acme – ${role} role`,
      message: `Hi ${first},

I came across your profile and was impressed by your expertise.

We have an exciting ${role} opportunity at Acme that I believe aligns well with your background.

Would you be open to a brief conversation to explore this further?

Looking forward to hearing from you.

Warm regards,
Recruiting Team`,
    },

    interview_invite: {
      label: "Interview invite",
      subject: `Interview invitation – ${role} at Acme`,
      message: `Hi ${first},

Thank you for your interest in the ${role} position at Acme.

We'd love to invite you for an interview to discuss the opportunity further.

Please let us know your availability and we'll schedule a time that works for you.

Warm regards,
Recruiting Team`,
    },

    follow_up: {
      label: "Follow-up",
      subject: `Following up – ${role} opportunity at Acme`,
      message: `Hi ${first},

I wanted to follow up on my previous message regarding the ${role} role at Acme.

We're still very interested in connecting with you.

Please feel free to reach out if you have any questions.

Warm regards,
Recruiting Team`,
    },

    offer_letter: {
      label: "Offer letter",
      subject: `Job offer – ${role} at Acme`,
      message: `Hi ${first},

We are delighted to extend an offer for the ${role} position at Acme.

${
  ctc
    ? `Your proposed Cost to Company (CTC) will be ₹${ctc} per annum.

`
    : ""
}We believe your skills and experience will be a valuable addition to our team.

Please find the details of your offer attached.

Kindly review and revert with your acceptance at your earliest convenience.

Congratulations once again — we look forward to welcoming you aboard!

Warm regards,
Recruiting Team`,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function SendOutreachModal({
  open,
  onClose,
  candidate,
  orgId,
  jdId,
}: SendOutreachModalProps) {
  const [ctc, setCtc] = useState("");

  const templates = buildTemplates(candidate.name, candidate.role, ctc);

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
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const MAX_CHARS = 2000;

  // ───────────────────────────────────────────────────────────
  // Apply template
  // ───────────────────────────────────────────────────────────

  function applyTemplate(key: TemplateKey) {
    setSelectedTemplate(key);

    const updatedTemplates = buildTemplates(
      candidate.name,
      candidate.role,
      ctc,
    );

    setSubject(updatedTemplates[key].subject);
    setMessage(updatedTemplates[key].message);
  }

  // ───────────────────────────────────────────────────────────
  // Send outreach
  // ───────────────────────────────────────────────────────────

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

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          role: candidate.role,
          subject,
          message,
          template: selectedTemplate,
          ctc,
          orgId,
          jdId,
        }),
      });

      if (res.ok) {
        // ─────────────────────────────────────────────
        // Move candidate to HIRED after offer letter
        // ─────────────────────────────────────────────

        if (selectedTemplate === "offer_letter") {
          try {
            await fetch(
              `/api/orgs/${orgId}/job-descriptions/${jdId}/pipeline`,
              {
                method: "PATCH",

                headers: {
                  "Content-Type": "application/json",
                },

                body: JSON.stringify({
                  candidateId: candidate.id,
                  stage: "hired",
                }),
              },
            );

            // refresh pipeline instantly
            window.dispatchEvent(new Event("pipeline-refresh"));
          } catch (err) {
            console.error("Failed to move candidate to hired", err);
          }
        }

        setSnackbar({
          open: true,

          message:
            selectedTemplate === "offer_letter"
              ? `${candidate.name} moved to Hired ✓`
              : `Outreach sent to ${candidate.name} ✓`,

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

  // ───────────────────────────────────────────────────────────
  // Save draft
  // ───────────────────────────────────────────────────────────

  async function handleSaveDraft() {
    setSavingDraft(true);

    try {
      await fetch("/api/send-outreach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          candidateId: candidate.id,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
          role: candidate.role,
          subject,
          message,
          template: selectedTemplate,
          ctc,
          orgId,
          jdId,
          draft: true,
        }),
      });

      setSnackbar({
        open: true,
        message: "Draft saved ✓",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "Failed to save draft.",
        severity: "error",
      });
    } finally {
      setSavingDraft(false);
    }
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("");

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: 560,
            maxWidth: "95vw",
            borderRadius: "18px",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(0,0,0,0.14)",
          },
        }}
      >
        <DialogContent
          sx={{
            p: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}

          <Box
            sx={{
              px: 3,
              py: 2,
              borderBottom: "1px solid #F3F4F6",
              bgcolor: "#FAFAFA",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "12px",
                  bgcolor: "#EFF6FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <EmailOutlinedIcon
                  sx={{
                    fontSize: 18,
                    color: "#2563EB",
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: "#111827",
                  }}
                >
                  Send outreach
                </Typography>

                <Typography
                  sx={{
                    fontSize: 12,
                    color: "#9CA3AF",
                  }}
                >
                  Reach out to the candidate directly
                </Typography>
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                bgcolor: "#F3F4F6",
                borderRadius: "10px",
                "&:hover": {
                  bgcolor: "#E5E7EB",
                },
              }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>

          {/* Candidate */}

          <Box
            sx={{
              mx: 3,
              mt: 2.5,
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: "12px",
              bgcolor: "#F8FAFF",
              border: "1px solid #E8EAFF",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: "12px",
                background: "linear-gradient(135deg,#6366F1,#8B5CF6,#EC4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 800,
                fontSize: 13,
              }}
            >
              {initials}
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: "#111827",
                }}
              >
                {candidate.name}
              </Typography>

              <Typography
                sx={{
                  fontSize: 12,
                  color: "#6B7280",
                }}
              >
                {candidate.email ?? "No email on file"}
              </Typography>
            </Box>
          </Box>

          {/* Form */}

          <Box sx={{ px: 3, pb: 1 }}>
            {/* Templates */}

            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9CA3AF",
                  mb: 1,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                Templates
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {(Object.keys(templates) as TemplateKey[]).map((key) => {
                  const isOffer = key === "offer_letter";
                  const selected = selectedTemplate === key;

                  return (
                    <Chip
                      key={key}
                      label={isOffer ? "💰 Offer letter" : templates[key].label}
                      onClick={() => applyTemplate(key)}
                      size="small"
                      sx={{
                        height: 34,
                        px: 0.5,
                        fontSize: 12,
                        fontWeight: selected ? 700 : 600,
                        borderRadius: "999px",
                        cursor: "pointer",
                        transition: "all .18s ease",

                        bgcolor: isOffer
                          ? selected
                            ? "#059669"
                            : "#ECFDF5"
                          : selected
                            ? "#2563EB"
                            : "#F3F4F6",

                        color: isOffer
                          ? selected
                            ? "#fff"
                            : "#065F46"
                          : selected
                            ? "#fff"
                            : "#374151",

                        border: isOffer
                          ? "1px solid #A7F3D0"
                          : "1px solid transparent",

                        "&:hover": {
                          transform: "translateY(-1px)",
                        },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {/* Subject */}

            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9CA3AF",
                  mb: 0.5,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                Subject
              </Typography>

              <TextField
                fullWidth
                size="small"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontSize: 13,
                  },
                }}
              />
            </Box>

            {/* Offer CTC */}

            {selectedTemplate === "offer_letter" && (
              <Box
                sx={{
                  mb: 2.5,
                  p: 2,
                  borderRadius: "14px",
                  background: "linear-gradient(135deg,#ECFDF5 0%,#F0FDF4 100%)",
                  border: "1px solid #A7F3D0",
                }}
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#065F46",
                    mb: 1,
                  }}
                >
                  Compensation Details
                </Typography>

                <TextField
                  fullWidth
                  size="small"
                  placeholder="18,00,000"
                  value={ctc}
                  onChange={(e) => {
                    const value = e.target.value;

                    setCtc(value);

                    const updatedTemplates = buildTemplates(
                      candidate.name,
                      candidate.role,
                      value,
                    );

                    setSubject(updatedTemplates.offer_letter.subject);

                    setMessage(updatedTemplates.offer_letter.message);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      bgcolor: "#fff",
                    },
                  }}
                />
              </Box>
            )}

            {/* Message */}

            <Box sx={{ mb: 1 }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#9CA3AF",
                  mb: 0.5,
                  letterSpacing: 0.3,
                  textTransform: "uppercase",
                }}
              >
                Message
              </Typography>

              <TextField
                fullWidth
                multiline
                rows={8}
                value={message}
                onChange={(e) => {
                  if (e.target.value.length <= MAX_CHARS) {
                    setMessage(e.target.value);
                  }
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "10px",
                    fontSize: 13,
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "right",
                  mt: 0.5,
                }}
              >
                {message.length} / {MAX_CHARS}
              </Typography>
            </Box>
          </Box>

          {/* Footer */}

          <Box
            sx={{
              px: 3,
              py: 2,
              bgcolor: "#FAFAFA",
              borderTop: "1px solid #F3F4F6",
              display: "flex",
              justifyContent: "flex-end",
              gap: 1.5,
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                savingDraft ? (
                  <CircularProgress size={13} />
                ) : (
                  <SaveOutlinedIcon sx={{ fontSize: 15 }} />
                )
              }
              disabled={savingDraft}
              onClick={handleSaveDraft}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                borderColor: "#E5E7EB",
                color: "#374151",
                fontWeight: 600,
              }}
            >
              {savingDraft ? "Saving…" : "Save draft"}
            </Button>

            <Button
              variant="contained"
              startIcon={
                sending ? (
                  <CircularProgress size={13} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 15 }} />
                )
              }
              disabled={sending || !candidate.email}
              onClick={handleSend}
              sx={{
                textTransform: "none",
                borderRadius: "10px",
                bgcolor: "#2563EB",
                fontWeight: 700,
                boxShadow: "none",

                "&:hover": {
                  bgcolor: "#1D4ED8",
                  boxShadow: "none",
                },
              }}
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Snackbar */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnackbar((s) => ({
            ...s,
            open: false,
          }))
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={() =>
            setSnackbar((s) => ({
              ...s,
              open: false,
            }))
          }
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: "10px",
            fontWeight: 600,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
