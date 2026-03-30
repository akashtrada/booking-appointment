import {useEffect, useMemo, useRef, useState} from "react";
import {Box, IconButton, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import BoxAps from "../../molecules/BoxAps";
import useTherapistStore from "../../../store/therapistStore";
import {px} from "../../../utils/utilPlus";
import {dividerClr, textPrimaryClr, textSecondaryClr} from "../../../theme/theme";

const ROW_HEIGHT = 48;
const VISIBLE_ROWS = 10;
const DROPDOWN_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

export default function TherapistDropdown({value, onChange})
{
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const therapists = useTherapistStore((s) => s.therapists);

  useEffect(() =>
  {
    function handleClickOutside(e)
    {
      if(containerRef.current && !containerRef.current.contains(e.target))
      {
        setOpen(false);
        setSearch("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() =>
  {
    const q = search.toLowerCase().trim();
    const list = q
      ? therapists.filter(
        (t) =>
          (t.alias || "").toLowerCase().includes(q) ||
          (t.code || "").toLowerCase().includes(q) ||
          String(t.pagerNumber || "").includes(q)
      )
      : [...therapists].sort((a, b) => (a.alias || "").localeCompare(b.alias || ""));
    return list;
  }, [therapists, search]);

  const handleSelect = (therapist) =>
  {
    onChange(therapist);
    setOpen(false);
    setSearch("");
  };

  const handleClear = () =>
  {
    onChange(null);
  };

  const styles = useMemo(() => ({
    container: {position: "relative", flex: 1},
    trigger: {
      cursor: "pointer",
      border: `1px solid ${dividerClr}`,
      borderRadius: px(6),
      padding: `${px(5)} ${px(8)}`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      minHeight: px(36)
    },
    triggerText: {fontSize: "13px", color: textSecondaryClr},
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 1400,
      border: `1px solid ${dividerClr}`,
      borderRadius: px(6)
    },
    searchBox: {
      padding: px(8),
      borderBottom: `1px solid ${dividerClr}`
    },
    listArea: {
      height: px(DROPDOWN_HEIGHT),
      overflowY: "auto"
    },
    row: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${px(8)} ${px(12)}`,
      cursor: "pointer",
      borderBottom: `1px solid #f5f5f5`,
      minHeight: px(ROW_HEIGHT),
      boxSizing: "border-box"
    },
    rowName: {fontSize: "13px", color: textPrimaryClr, fontWeight: 500},
    rowCode: {fontSize: "11px", color: textSecondaryClr},
    emptyMsg: {
      padding: `${px(16)} ${px(12)}`,
      fontSize: "13px",
      color: textSecondaryClr,
      textAlign: "center"
    },
    selectedRow: {
      display: "flex",
      alignItems: "center",
      gap: px(6)
    }
  }), []);

  return (
    <Box ref={containerRef} style={styles.container}>
      {value ? (
        <Box style={styles.trigger}>
          <Box style={styles.selectedRow}>
            <BoxAps
              size="small"
              number={value.pagerNumber}
              gender={value.gender}
              primaryText={value.alias}
              secondaryText={value.code}
            />
          </Box>
          <IconButton size="small" onClick={handleClear} sx={{p: 0}}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Box style={styles.trigger} onClick={() => setOpen((o) => !o)}>
          <Typography style={styles.triggerText}>Select therapist</Typography>
          <SearchIcon fontSize="small" sx={{color: textSecondaryClr}} />
        </Box>
      )}

      {open && !value && (
        <Paper elevation={3} style={styles.dropdown}>
          <Box style={styles.searchBox}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search therapist…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{color: textSecondaryClr}} />
                  </InputAdornment>
                )
              }}
            />
          </Box>
          <Box style={styles.listArea}>
            {filtered.length === 0 && (
              <Typography style={styles.emptyMsg}>No therapists found</Typography>
            )}
            {filtered.map((t) => (
              <Box key={t.id} style={styles.row} onClick={() => handleSelect(t)}>
                <Typography style={styles.rowName}>{t.alias}</Typography>
                <Typography style={styles.rowCode}>#{t.pagerNumber} · {t.code}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
