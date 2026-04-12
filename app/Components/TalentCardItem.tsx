import { Box, Chip, Typography, Button } from "@mui/material";
import { useState } from "react";

export interface SkillScore {
  name: string;
  score: number;
}

export interface TalentCard {
  id: string;
  name: string;
  role: string;
  match: number;
  skills: string[];
  skillScores: SkillScore[];
  location: string;
  experience: string;
  available: boolean;
  email?: string;
  phone?: string;
  linkedin?: string;

}

export function TalentCardItem({ card }: { card: TalentCard }) {
  const [selected, setSelected] = useState<TalentCard | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<string[]>([]);
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "16px",
        bgcolor: "#F9FAFB",
        border: "1px solid #E5E7EB",
        position: "relative",
        overflow: "hidden",
        width: 320,

        // top gradient border
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          height: 4,
          width: "100%",
          background:
            "linear-gradient(90deg, #3B82F6, #06B6D4, #10B981, #F59E0B)",
        },
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 1.5,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.2 }}>
          {/* Avatar */}
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #F59E0B, #F97316, #FB7185)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
            }}
          >
            {card.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Box>

          {/* Name + Role */}
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
              {card.name}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
              {card.role}
            </Typography>
          </Box>
        </Box>

        {/* Match */}
        <Box
          sx={{
            bgcolor: "#DCFCE7",
            color: "#059669",
            fontWeight: 700,
            fontSize: 12,
            px: 1.5,
            py: 0.5,
            borderRadius: "999px",
          }}
        >
          {card.match}%
        </Box>
      </Box>

      {/* COLORED SKILL BARS */}
      <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
        {["B2B", "API", "OKRs", "Comm", "Sales"].map((item, i) => {
          const colors = [
            "#FCD34D",
            "#93C5FD",
            "#C4B5FD",
            "#6EE7B7",
            "#FCA5A5",
          ];
          return (
            <Box
              key={i}
              sx={{
                flex: 1,
                height: 10,
                borderRadius: 2,
                bgcolor: colors[i],
              }}
            />
          );
        })}
      </Box>

      {/* SKILL LABELS */}
      <Box sx={{ display: "flex", gap: 1, mb: 1.5 }}>
        {["B2B", "API", "OKRs", "Comm", "Sales"].map((item) => (
          <Typography
            key={item}
            sx={{
              fontSize: 10,
              color: "#6B7280",
              textAlign: "center",
              flex: 1,
            }}
          >
            {item}
          </Typography>
        ))}
      </Box>

      {/* TAGS */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
        {card.skills.map((skill) => (
          <Chip
            key={skill}
            label={skill}
            size="small"
            sx={{
              bgcolor: "#E5E7EB",
              fontSize: 11,
              height: 24,
              borderRadius: "8px",
            }}
          />
        ))}
      </Box>

      {/* FOOTER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
            📍 {card.location}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#6B7280" }}>
            {card.experience}
          </Typography>
        </Box>

        <Button
          size="small"
          onClick={() => setSelected(card)}
          sx={{
            textTransform: "none",
            fontSize: 12,
            borderRadius: "8px",
            bgcolor: "#F3F4F6",
            color: "#111827",
            px: 1.5,
          }}
        >
          View Profile
        </Button>
      
      </Box>
    </Box>
  );
}
