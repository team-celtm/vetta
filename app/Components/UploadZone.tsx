
import { Box, Typography } from "@mui/material";
import { useRef, useState } from "react";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

export function UploadZone({ onUpload }: { onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

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
        if (file) onUpload(file);
      }}
      sx={{
        border: `1.5px dashed ${dragOver ? "#1A35E8" : "rgba(0,0,0,0.15)"}`,
        borderRadius: "12px",
        p: { xs: 2, sm: 2.5 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        cursor: "pointer",
        transition: "all 0.2s",
        bgcolor: dragOver ? "rgba(26,53,232,0.04)" : "rgba(0,0,0,0.02)",
        "&:hover": {
          bgcolor: "rgba(26,53,232,0.03)",
          borderColor: "rgba(26,53,232,0.5)",
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
          if (f) onUpload(f);
        }}
      />
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
      <Typography sx={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>
        Upload Job Description
      </Typography>
      <Typography sx={{ color: "#9CA3AF", fontSize: 11.5 }}>
        PDF, DOCX or TXT · drag & drop or click
      </Typography>
    </Box>
  );
}
