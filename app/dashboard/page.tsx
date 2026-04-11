// app/dashboard/page.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  InputBase,
  Drawer,
  IconButton,
  TextField,
  CircularProgress,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { TalentCard, TalentCardItem } from "../Components/TalentCardItem";
import { UploadZone } from "../Components/UploadZone";

// ─── Types ────────────────────────────────────────────────────────────────────

interface InferredSkill {
  name: string;
  weight: number;
}

interface JDStatus {
  id: string;
  status: "draft" | "inferring" | "active" | "paused" | "closed";
  title: string;
  inferred_skills: InferredSkill[];
  inferred_seniority: string | null;
  inferred_domain: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  "Available now",
  "Remote OK",
  "Top 10% match",
  "Verified only",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely reads the org-id cookie.
 * Must only be called inside event handlers or effects (never during render).
 */
function getOrgId(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("vetta_org_id="));
  return match ? match.split("=")[1] : "";
}

// ─── API Helpers ──────────────────────────────────────────────────────────────

async function uploadJDFile(
  orgId: string,
  file: File,
  title: string,
): Promise<{ jd_id: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("title", title);

  const res = await fetch(`/api/orgs/${orgId}/job-descriptions/upload`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed.");
  }
  return res.json();
}

async function pasteJDText(
  orgId: string,
  title: string,
  rawText: string,
): Promise<{ jd_id: string }> {
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, raw_text: rawText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Save failed.");
  }
  return res.json();
}

async function fetchJDStatus(orgId: string, jdId: string): Promise<JDStatus> {
  const res = await fetch(`/api/orgs/${orgId}/job-descriptions/${jdId}`);
  if (!res.ok) throw new Error("Failed to fetch JD status.");
  const data = await res.json();
  return data.job_description as JDStatus;
}

// ─── InferencePanel ───────────────────────────────────────────────────────────

function InferencePanel({ jd }: { jd: JDStatus | null }) {
  if (!jd) return null;

  if (jd.status === "inferring") {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2,
          bgcolor: "#EEF2FF",
          borderRadius: "10px",
          border: "1px solid rgba(26,53,232,0.15)",
        }}
      >
        <CircularProgress size={16} thickness={5} sx={{ color: "#1A35E8" }} />
        <Box>
          <Typography
            sx={{ fontSize: 12.5, fontWeight: 700, color: "#1A35E8" }}
          >
            AI Inference Running…
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#6B7280" }}>
            Extracting skills, seniority and personality signals
          </Typography>
        </Box>
      </Box>
    );
  }

  if (jd.status === "active" && jd.inferred_skills?.length > 0) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: "#F0FDF4",
          borderRadius: "10px",
          border: "1px solid rgba(16,185,129,0.2)",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 14, color: "#059669" }} />
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#059669" }}>
            Inference Complete
          </Typography>
          {jd.inferred_seniority && (
            <Chip
              label={jd.inferred_seniority}
              size="small"
              sx={{
                height: 18,
                fontSize: 10,
                bgcolor: "#D1FAE5",
                color: "#065F46",
                fontWeight: 600,
                "& .MuiChip-label": { px: 1 },
                ml: "auto",
              }}
            />
          )}
        </Box>

        {jd.inferred_domain && (
          <Typography sx={{ fontSize: 11, color: "#6B7280", mb: 1 }}>
            Domain:{" "}
            <strong style={{ color: "#374151" }}>{jd.inferred_domain}</strong>
          </Typography>
        )}

        <Typography
          sx={{
            color: "#6B7280",
            fontSize: 10.5,
            fontWeight: 600,
            mb: 0.75,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Inferred Skills
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {jd.inferred_skills.map((skill) => (
            <Chip
              key={skill.name}
              label={`${skill.name} · ${Math.round(skill.weight * 100)}%`}
              size="small"
              sx={{
                height: 22,
                fontSize: 10.5,
                bgcolor:
                  skill.weight >= 0.8
                    ? "#DCFCE7"
                    : skill.weight >= 0.5
                      ? "#F3F4F6"
                      : "#FEF9C3",
                color:
                  skill.weight >= 0.8
                    ? "#166534"
                    : skill.weight >= 0.5
                      ? "#374151"
                      : "#92400E",
                fontWeight: 600,
                "& .MuiChip-label": { px: 1 },
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return null;
}

// ─── LeftPanelContent ─────────────────────────────────────────────────────────

function LeftPanelContent({
  jd,
  onFileUpload,
  onTextSubmit,
  isLoading,
  error,
  onClose,
}: {
  jd: JDStatus | null;
  onFileUpload: (file: File, title: string) => void;
  onTextSubmit: (title: string, text: string) => void;
  isLoading: boolean;
  error: string | null;
  onClose?: () => void;
}) {
  const [tab, setTab] = useState(0);
  const [title, setTitle] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    if (!title.trim()) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  return (
    <Box
      sx={{
        width: { xs: 300, sm: 380 },
        height: "100%",
        bgcolor: "#FFFFFF",
        p: 2.5,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box>
          <Typography sx={{ color: "#111827", fontWeight: 700, fontSize: 14 }}>
            Smart Match Engine
          </Typography>
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: "#10B981",
              }}
            />
            <Typography sx={{ color: "#6B7280", fontSize: 11.5 }}>
              AI inference active
            </Typography>
          </Box>
        </Box>
        {onClose && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#9CA3AF", mt: -0.5 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          minHeight: 34,
          "& .MuiTab-root": {
            fontSize: 12,
            fontWeight: 600,
            minHeight: 34,
            textTransform: "none",
            color: "#9CA3AF",
            "&.Mui-selected": { color: "#1A35E8" },
          },
          "& .MuiTabs-indicator": { bgcolor: "#1A35E8", height: 2 },
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <Tab label="Upload File" />
        <Tab label="Paste Text" />
      </Tabs>

      {/* Shared title field */}
      <TextField
        size="small"
        placeholder="Job title e.g. Senior Product Designer"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            fontSize: 12.5,
            borderRadius: "8px",
            "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
            "&:hover fieldset": { borderColor: "rgba(26,53,232,0.4)" },
            "&.Mui-focused fieldset": { borderColor: "#1A35E8" },
          },
        }}
      />

      {/* Tab: Upload */}
      {tab === 0 ? (
        <>
          <UploadZone onUpload={handleFileSelected} />
          {selectedFile && (
            <Box
              sx={{
                p: 1.5,
                bgcolor: "#F0F4FF",
                borderRadius: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{ fontSize: 11.5, color: "#374151", fontWeight: 600 }}
              >
                📄 {selectedFile.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSelectedFile(null)}
                sx={{ color: "#9CA3AF" }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          )}
          <Button
            fullWidth
            variant="contained"
            disabled={!selectedFile || !title.trim() || isLoading}
            onClick={() => selectedFile && onFileUpload(selectedFile, title)}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              bgcolor: "#1A35E8",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              height: 40,
              "&:hover": { bgcolor: "#1430c4" },
              "&.Mui-disabled": {
                bgcolor: "rgba(26,53,232,0.3)",
                color: "#fff",
              },
            }}
          >
            {isLoading ? "Uploading…" : "Upload & Analyse"}
          </Button>
        </>
      ) : (
        <>
          <TextField
            multiline
            minRows={6}
            maxRows={12}
            placeholder="Paste the full job description text here…"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: 12,
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(0,0,0,0.12)" },
                "&:hover fieldset": { borderColor: "rgba(26,53,232,0.4)" },
                "&.Mui-focused fieldset": { borderColor: "#1A35E8" },
              },
            }}
          />
          <Button
            fullWidth
            variant="contained"
            disabled={
              pasteText.trim().length < 50 || !title.trim() || isLoading
            }
            onClick={() => onTextSubmit(title, pasteText)}
            startIcon={
              isLoading ? (
                <CircularProgress size={14} sx={{ color: "#fff" }} />
              ) : (
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{
              bgcolor: "#1A35E8",
              borderRadius: "8px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: 13,
              height: 40,
              "&:hover": { bgcolor: "#1430c4" },
              "&.Mui-disabled": {
                bgcolor: "rgba(26,53,232,0.3)",
                color: "#fff",
              },
            }}
          >
            {isLoading ? "Saving…" : "Save & Analyse"}
          </Button>
        </>
      )}

      {/* Error */}
      {error && (
        <Box
          sx={{
            p: 1.5,
            bgcolor: "#FEF2F2",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          <Typography sx={{ fontSize: 11.5, color: "#DC2626" }}>
            {error}
          </Typography>
        </Box>
      )}

      {/* AI inference result */}
      <InferencePanel jd={jd} />

      {/* Filters — visible once JD is active */}
      {jd?.status === "active" && (
        <Box sx={{ mt: 1 }}>
          <Typography
            sx={{
              color: "#6B7280",
              fontSize: 11,
              fontWeight: 600,
              mb: 1,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Filters
          </Typography>
          {FILTER_OPTIONS.map((f) => (
            <Box
              key={f}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                py: 0.75,
                cursor: "pointer",
                "&:hover": { "& .label": { color: "#111827" } },
              }}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "4px",
                  border: "1.5px solid #D1D5DB",
                  flexShrink: 0,
                }}
              />
              <Typography
                className="label"
                sx={{
                  color: "#6B7280",
                  fontSize: 12,
                  transition: "color 0.15s",
                }}
              >
                {f}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // All fetched results — never mutated by search
  const [allResults, setAllResults] = useState<TalentCard[]>([]);
  // Derived: filtered view shown in the grid
  const [searchQuery, setSearchQuery] = useState("");
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);

  // JD state
  const [jd, setJd] = useState<JDStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Derived filtered results (never mutates allResults) ──────────────────────
  const visibleResults = searchQuery.trim()
    ? allResults.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.role.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allResults;

  // ── Load matches for a JD ────────────────────────────────────────────────────
  const loadMatches = useCallback(async (jdId: string) => {
    const orgId = getOrgId();
    if (!orgId) return;
    try {
      const res = await fetch(
        `/api/orgs/${orgId}/job-descriptions/${jdId}/matches`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.details || "Failed to load matches.");
      }
      const data = await res.json();
      setAllResults(data.results ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Match fetch error:", message);
      setError(message);
    }
  }, []);

  // ── Polling until JD is active ───────────────────────────────────────────────
  const startPolling = useCallback(
    (jdId: string) => {
      const orgId = getOrgId();
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          const latest = await fetchJDStatus(orgId, jdId);
          setJd(latest);

          if (latest.status === "active") {
            clearInterval(pollingRef.current!);
            pollingRef.current = null;
            loadMatches(jdId);
          }

          if (latest.status === "closed" || latest.status === "paused") {
            clearInterval(pollingRef.current!);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    },
    [loadMatches],
  );

  // ── Restore last session on mount ────────────────────────────────────────────
  // In the mount useEffect, replace the localStorage restore with:
  useEffect(() => {
    const orgId = getOrgId();
    if (!orgId) return;

    // Fetch the most recent active/inferring JD for this org
    fetch(`/api/orgs/${orgId}/job-descriptions/latest`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.job_description) return;
        const latest = data.job_description;
        setJd(latest);
        if (latest.status === "active") loadMatches(latest.id);
        if (latest.status === "inferring") startPolling(latest.id);
      })
      .catch(() => {});

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loadMatches, startPolling]);

  // ── Upload handler ────────────────────────────────────────────────────────────
  const handleFileUpload = async (file: File, title: string) => {
    const orgId = getOrgId();
    setIsLoading(true);
    setError(null);
    setAllResults([]);
    try {
      const { jd_id } = await uploadJDFile(orgId, file, title);
      localStorage.setItem("vetta_last_jd_id", jd_id);
      setJd({
        id: jd_id,
        status: "inferring",
        title,
        inferred_skills: [],
        inferred_seniority: null,
        inferred_domain: null,
      });
      setLeftDrawerOpen(false);
      startPolling(jd_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Paste handler ─────────────────────────────────────────────────────────────
  const handleTextSubmit = async (title: string, rawText: string) => {
    const orgId = getOrgId();
    setIsLoading(true);
    setError(null);
    setAllResults([]);
    setJd(null);
    try {
      const { jd_id } = await pasteJDText(orgId, title, rawText);
      localStorage.setItem("vetta_last_jd_id", jd_id);
      setJd({
        id: jd_id,
        status: "inferring",
        title,
        inferred_skills: [],
        inferred_seniority: null,
        inferred_domain: null,
      });
      setLeftDrawerOpen(false);
      startPolling(jd_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const isInferring = jd?.status === "inferring";
  const hasResults = visibleResults.length > 0;

  return (
    <Box sx={{ display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Desktop left panel */}
      {!isMobile && (
        <Box
          sx={{
            width: 380,
            flexShrink: 0,
            bgcolor: "#FFFFFF",
            borderRight: "1px solid rgba(0,0,0,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <LeftPanelContent
            jd={jd}
            onFileUpload={handleFileUpload}
            onTextSubmit={handleTextSubmit}
            isLoading={isLoading}
            error={error}
          />
        </Box>
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          anchor="left"
          open={leftDrawerOpen}
          onClose={() => setLeftDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: "min(300px, 85vw)",
              border: "none",
              p: 0,
            },
          }}
        >
          <LeftPanelContent
            jd={jd}
            onFileUpload={handleFileUpload}
            onTextSubmit={handleTextSubmit}
            isLoading={isLoading}
            error={error}
            onClose={() => setLeftDrawerOpen(false)}
          />
        </Drawer>
      )}

      {/* Main panel */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            bgcolor: "#F5F2EC",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: { xs: "wrap", sm: "nowrap" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexShrink: 0,
            }}
          >
            {isMobile && (
              <IconButton
                onClick={() => setLeftDrawerOpen(true)}
                size="small"
                sx={{
                  bgcolor: "#fff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  width: 36,
                  height: 36,
                  color: "#374151",
                  "&:hover": { borderColor: "#1A35E8", color: "#1A35E8" },
                }}
              >
                <FilterListIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
            <Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: 15, sm: 17 },
                  color: "#0F1117",
                }}
              >
                Talent Match Results
              </Typography>
              {jd && (
                <Typography sx={{ fontSize: 11, color: "#9CA3AF" }}>
                  {jd.title}
                </Typography>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "nowrap",
              width: { xs: "100%", sm: "auto" },
            }}
          >
            {/* Search — filters visibleResults, never destroys allResults */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                bgcolor: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                px: 1.5,
                height: 36,
                flexGrow: { xs: 1, sm: 0 },
                width: { sm: 200, md: 220 },
              }}
            >
              <SearchIcon
                sx={{ color: "#9CA3AF", fontSize: 18, flexShrink: 0 }}
              />
              <InputBase
                placeholder="Search talent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ fontSize: 13, color: "#374151", flex: 1, minWidth: 0 }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery("")}
                  sx={{ p: 0.25, color: "#9CA3AF" }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            <Button
              startIcon={<TuneIcon />}
              variant="outlined"
              size="small"
              sx={{
                borderColor: "rgba(0,0,0,0.15)",
                color: "#374151",
                fontSize: 12,
                fontWeight: 600,
                textTransform: "none",
                height: 36,
                borderRadius: "8px",
                whiteSpace: "nowrap",
                display: { xs: "none", sm: "flex" },
                "&:hover": { borderColor: "#1A35E8", color: "#1A35E8" },
              }}
            >
              Filters
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                bgcolor: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                px: 1.5,
                height: 36,
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  bgcolor: "#10B981",
                }}
              />
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  whiteSpace: "nowrap",
                }}
              >
                1,240 vetted
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content area */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "auto",
            p: { xs: 2, sm: 3 },
            bgcolor: "#F5F2EC",
          }}
        >
          {/* Inferring spinner */}
          {isInferring && (
            <Box sx={{ textAlign: "center", mt: 10 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2, fontWeight: 700 }}>
                AI is matching talent…
              </Typography>
            </Box>
          )}

          {/* Empty state */}
          {!isInferring && !hasResults && !error && (
            <Box sx={{ textAlign: "center", mt: 10, opacity: 0.6 }}>
              <SearchOffOutlinedIcon sx={{ fontSize: 48 }} />
              <Typography>Upload a Job Description to see matches.</Typography>
            </Box>
          )}

          {/* Error state */}
          {error && !isInferring && (
            <Box
              sx={{
                textAlign: "center",
                mt: 10,
                p: 3,
                bgcolor: "#FEF2F2",
                borderRadius: "12px",
                border: "1px solid rgba(239,68,68,0.2)",
                maxWidth: 480,
                mx: "auto",
              }}
            >
              <Typography sx={{ color: "#DC2626", fontWeight: 600 }}>
                {error}
              </Typography>
            </Box>
          )}

          {/* Results grid */}
          {!isInferring && hasResults && (
            <Box>
              <Typography sx={{ fontSize: 13, color: "#6B7280", mb: 2 }}>
                {searchQuery
                  ? `${visibleResults.length} of ${allResults.length} candidates match "${searchQuery}"`
                  : `Found ${allResults.length} vetted candidates for "${jd?.title}"`}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                }}
              >
                {visibleResults.map((card) => (
                  <TalentCardItem key={card.id} card={card} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
