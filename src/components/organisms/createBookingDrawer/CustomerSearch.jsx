import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {Avatar, Box, CircularProgress, IconButton, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {useQuery} from "@tanstack/react-query";
import {px} from "../../../utils/utilPlus";
import {fetchAllClients} from "../../../services/userService";
import {dividerClr, textPrimaryClr, textSecondaryClr} from "../../../theme/theme";
import {PENDING_BOOKING_COLOR} from "../../../constants/constantsPlus";

const ROW_HEIGHT = 52;
const VISIBLE_ROWS = 10;
const DROPDOWN_HEIGHT = ROW_HEIGHT * VISIBLE_ROWS;

function getInitials(name = "")
{
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function getPhone(user)
{
  return (
    user.mobile_number ||
    user.phone ||
    user.phone_number ||
    user.mobile ||
    user.contact_no ||
    user.contact_number ||
    user.contact ||
    ""
  );
}

export default function CustomerSearch({value, onChange})
{
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  const {data: allClients = [], isFetching} = useQuery({
    queryKey: ["all-clients"],
    queryFn: fetchAllClients,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

  const filtered = useMemo(() =>
  {
    const q = query.toLowerCase().trim();
    const list = q
      ? allClients.filter(
        (u) =>
          (u.name || "").toLowerCase().includes(q) ||
          getPhone(u).toLowerCase().includes(q)
      )
      : [...allClients].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [allClients, query]);

  const handleInputChange = useCallback((e) =>
  {
    setQuery(e.target.value);
    setOpen(true);
  }, []);

  const handleSelect = useCallback((user) =>
  {
    onChange(user);
    setOpen(false);
    setQuery("");
  }, [onChange]);

  const handleClear = useCallback(() =>
  {
    onChange(null);
    setQuery("");
  }, [onChange]);

  useEffect(() =>
  {
    function handleClickOutside(e)
    {
      if(containerRef.current && !containerRef.current.contains(e.target))
      {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const styles = useMemo(() => ({
    container: {position: "relative"},
    dropdown: {
      position: "absolute",
      top: "calc(100% + 4px)",
      left: 0,
      right: 0,
      zIndex: 1300,
      height: px(DROPDOWN_HEIGHT),
      overflowY: "auto",
      border: `1px solid ${dividerClr}`,
      borderRadius: px(6)
    },
    userRow: {
      padding: `${px(10)} ${px(12)}`,
      cursor: "pointer",
      borderBottom: `1px solid #f5f5f5`,
      height: px(ROW_HEIGHT),
      boxSizing: "border-box"
    },
    userName: {
      fontSize: "13px",
      fontWeight: 600,
      color: textPrimaryClr,
      lineHeight: 1.3,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    },
    userPhone: {
      fontSize: "11px",
      color: textSecondaryClr,
      lineHeight: 1.3,
      marginTop: px(2)
    },
    emptyMsg: {
      padding: `${px(16)} ${px(12)}`,
      fontSize: "13px",
      color: textSecondaryClr,
      textAlign: "center"
    },
    selectedCard: {
      display: "flex",
      alignItems: "center",
      border: `1px solid ${dividerClr}`,
      borderRadius: px(6),
      padding: `${px(6)} ${px(8)}`,
      gap: px(8)
    },
    selectedAvatar: {
      width: px(34),
      height: px(34),
      fontSize: "12px",
      fontWeight: 700,
      backgroundColor: PENDING_BOOKING_COLOR,
      color: "#ffffff",
      flexShrink: 0
    },
    selectedTextGroup: {
      display: "flex",
      flexDirection: "column",
      gap: px(2),
      flex: 1,
      overflow: "hidden"
    },
    selectedPrimary: {fontSize: "13px", fontWeight: 600, color: textPrimaryClr, lineHeight: 1.3},
    selectedSecondary: {fontSize: "11px", color: textSecondaryClr, lineHeight: 1.3}
  }), []);

  if(value)
  {
    return (
      <Box style={styles.selectedCard}>
        <Avatar style={styles.selectedAvatar}>{getInitials(value.name)}</Avatar>
        <Box style={styles.selectedTextGroup}>
          <Typography style={styles.selectedPrimary}>#{value.id}</Typography>
          <Typography style={styles.selectedSecondary}>{value.name}</Typography>
        </Box>
        <IconButton size="small" onClick={handleClear}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box ref={containerRef} style={styles.container}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search client"
        value={query}
        onChange={handleInputChange}
        onFocus={() => setOpen(true)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{color: textSecondaryClr}} />
            </InputAdornment>
          ),
          endAdornment: isFetching ? (
            <InputAdornment position="end">
              <CircularProgress size={14} />
            </InputAdornment>
          ) : null
        }}
      />
      {open && (
        <Paper elevation={3} ref={listRef} style={styles.dropdown}>
          {isFetching && (
            <Box style={styles.emptyMsg}><CircularProgress size={20} /></Box>
          )}
          {!isFetching && filtered.length === 0 && (
            <Typography style={styles.emptyMsg}>No clients found</Typography>
          )}
          {!isFetching && filtered.map((user) => (
            <Box key={user.id} style={styles.userRow} onClick={() => handleSelect(user)}>
              <Typography style={styles.userName}>{user.name}</Typography>
              <Typography style={styles.userPhone}>{getPhone(user)}</Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
