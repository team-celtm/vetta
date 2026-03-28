//app/dashboard/page.tsx

"use client";
import { useState, useRef } from "react";
import { Box, Typography, Button, Chip, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/TuneOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SearchOffOutlinedIcon from "@mui/icons-material/SearchOffOutlined";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TalentCard {
  id: string;
  name: string;
  role: string;
  match: number;
  skills: string[];
  location: string;
  available: boolean;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RESULTS: TalentCard[] = [
  {
    id: "1",
    name: "Aisha Patel",
    role: "Senior Product Designer",
    match: 97,
    skills: ["Figma", "UX Research", "Design Systems"],
    location: "London, UK",
    available: true,
  },
  {
    id: "2",
    name: "Marcus Chen",
    role: "Product Designer",
    match: 91,
    skills: ["Figma", "Prototyping", "User Testing"],
    location: "Berlin, DE",
    available: true,
  },
  {
    id: "3",
    name: "Sophie Williams",
    role: "UX Lead",
    match: 88,
    skills: ["UX Strategy", "Workshops", "Figma"],
    location: "Amsterdam, NL",
    available: false,
  },
  {
    id: "4",
    name: "Rohan Mehta",
    role: "Product Designer",
    match: 84,
    skills: ["Interaction Design", "Motion", "React"],
    location: "Remote",
    available: true,
  },
];

// ─── Components ───────────────────────────────────────────────────────────────

function UploadZone({ onUpload }: { onUpload: (text: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onUpload((e.target?.result as string) || file.name);
    reader.readAsText(file);
  };

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      sx={{
        border: `1.5px dashed ${dragOver ? "#1A35E8" : "rgba(255,255,255,0.15)"}`,
        borderRadius: "12px",
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        transition: "all 0.2s",
        bgcolor: dragOver ? "rgba(26,53,232,0.08)" : "rgba(255,255,255,0.04)",
        "&:hover": {
          bgcolor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.3)",
        },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <Box
        sx={{
          border: "2px dashed #000000",
          borderRadius: "12px",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          cursor: "pointer",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "#1A35E8",
            bgcolor: "rgba(26,53,232,0.04)",
          },
        }}
      >
        {/* Icon box */}
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            bgcolor: "rgba(26,53,232,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CloudUploadOutlinedIcon sx={{ color: "#1A35E8", fontSize: 22 }} />
        </Box>

        {/* Optional text */}
        <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>
          Click or drag to upload
        </Typography>
      </Box>
      <Typography sx={{ color: "000000", fontWeight: 600, fontSize: 13.5 }}>
        Upload Job Description
      </Typography>
      <Typography sx={{ color: "000000", fontSize: 11.5 }}>
        PDF, DOCX or paste text · click to upload
      </Typography>
    </Box>
  );
}

function TalentCardItem({ card }: { card: TalentCard }) {
  return (
    <Box
      sx={{
        p: 2.5,
        bgcolor: "#fff",
        borderRadius: "12px",
        border: "1px solid rgba(0,0,0,0.07)",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              bgcolor: "#1A35E8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            {card.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 13.5,
                color: "#0F1117",
                lineHeight: 1.2,
              }}
            >
              {card.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
              {card.role}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            bgcolor: card.match >= 90 ? "#ECFDF5" : "#F0F4FF",
            color: card.match >= 90 ? "#059669" : "#1A35E8",
            fontWeight: 700,
            fontSize: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: "20px",
          }}
        >
          {card.match}% match
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
        {card.skills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            size="small"
            sx={{
              fontSize: 11,
              height: 22,
              bgcolor: "#F3F4F6",
              color: "#374151",
              fontWeight: 500,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontSize: 11.5, color: "#9CA3AF" }}>
          📍 {card.location}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: card.available ? "#10B981" : "#F59E0B",
            }}
          />
          <Typography
            sx={{
              fontSize: 11,
              color: card.available ? "#10B981" : "#F59E0B",
              fontWeight: 600,
            }}
          >
            {card.available ? "Available" : "Open to roles"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [results, setResults] = useState<TalentCard[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = (text: string) => {
    console.log("JD content:", text.slice(0, 100));
    setResults(MOCK_RESULTS);
    setHasSearched(true);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setResults(MOCK_RESULTS);
      setHasSearched(true);
    }
  };

  return (
    <Box sx={{ display: "flex", height: "100%" }}>
      {/* Left Panel */}
      <Box
        sx={{
          width: 380,
          flexShrink: 0,
          bgcolor: "#FFFFFF",
          p: 2.5,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          borderRight: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {/* Header */}
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

        {/* Upload Zone */}
        <UploadZone onUpload={handleUpload} />

        {!hasSearched && (
          <Typography
            sx={{
              color: "#9CA3AF",
              fontSize: 12,
              textAlign: "center",
              mt: 1,
            }}
          >
            Upload a job description to activate AI inference and surface
            matched talent
          </Typography>
        )}

        {hasSearched && (
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

            {[
              "Available now",
              "Remote OK",
              "Top 10% match",
              "Verified only",
            ].map((f) => (
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

      {/* Right Panel */}
      <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <Box
          sx={{
            px: 3,
            py: 1.5,
            bgcolor: "#F5F2EC",
            borderBottom: "1px solid rgba(0,0,0,0.07)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontWeight: 700, fontSize: 17, color: "#0F1117" }}>
            Talent Match Results
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            {/* Search */}
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
                width: 220,
              }}
            >
              <SearchIcon sx={{ color: "#9CA3AF", fontSize: 18 }} />
              <InputBase
                placeholder="Search talent pool..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                sx={{ fontSize: 13, color: "#374151", flex: 1 }}
              />
            </Box>

            {/* Filters button */}
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
                "&:hover": { borderColor: "#1A35E8", color: "#1A35E8" },
              }}
            >
              Filters
            </Button>

            {/* Vetted count */}
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
                sx={{ fontSize: 12, fontWeight: 600, color: "#374151" }}
              >
                1,240 vetted
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: "auto", p: 3, bgcolor: "#F5F2EC" }}>
          {!hasSearched ? (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
              }}
            >
              <Box sx={{ opacity: 0.35 }}>
                <SearchOffOutlinedIcon
                  sx={{ fontSize: 52, color: "#9CA3AF" }}
                />
              </Box>
              <Typography
                sx={{ fontWeight: 700, fontSize: 17, color: "#374151" }}
              >
                No active search
              </Typography>
              <Typography
                sx={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  textAlign: "center",
                  maxWidth: 260,
                }}
              >
                Upload a job description to surface matched talent from the
                Vetta pool
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "#6B7280",
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                {results.length} candidates matched · sorted by relevance
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 2,
                }}
              >
                {results.map((card) => (
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
