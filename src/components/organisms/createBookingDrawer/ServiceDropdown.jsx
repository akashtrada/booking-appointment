import {useEffect, useMemo, useRef, useState} from "react";
import {Box, CircularProgress, InputAdornment, Paper, TextField, Typography} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useQuery} from "@tanstack/react-query";
import {fetchServiceCategories} from "../../../services/serviceCategoryService";
import {px} from "../../../utils/utilPlus";
import {dividerClr, textPrimaryClr, textSecondaryClr} from "../../../theme/theme";

export default function ServiceDropdown({value, onChange, error})
{
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const {data: categories = [], isFetching} = useQuery({
    queryKey: ["service-categories"],
    queryFn: fetchServiceCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000
  });

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

  const filteredCategories = useMemo(() =>
  {
    if(!search.trim())
    {
      return categories;
    }
    const q = search.toLowerCase();
    return categories
    .map((cat) => ({
      ...cat,
      services: cat.services.filter((s) => s.name.toLowerCase().includes(q))
    }))
    .filter((cat) => cat.services.length > 0);
  }, [categories, search]);

  const styles = useMemo(() => ({
    container: {position: "relative"},
    trigger: {
      cursor: "pointer"
    },
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
      height: px(370),
      overflowY: "auto"
    },
    categoryHeader: {
      padding: `${px(8)} ${px(12)} ${px(4)}`,
      fontSize: "11px",
      fontWeight: 700,
      color: textSecondaryClr,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      backgroundColor: "#fafafa",
      borderBottom: `1px solid #f0f0f0`
    },
    serviceRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${px(10)} ${px(12)}`,
      cursor: "pointer",
      borderBottom: `1px solid #f5f5f5`,
      minHeight: px(37),
      boxSizing: "border-box"
    },
    serviceName: {fontSize: "13px", color: textPrimaryClr, fontWeight: 500},
    serviceMeta: {fontSize: "11px", color: textSecondaryClr, flexShrink: 0},
    loadingBox: {display: "flex", justifyContent: "center", padding: px(16)},
    errorText: {fontSize: "11px", color: "#d32f2f", marginTop: px(2), paddingLeft: px(2)}
  }), []);

  const handleSelect = (category, service) =>
  {
    onChange({
      id: service.id,
      name: service.name,
      duration: parseInt(service.duration, 10),
      price: parseFloat(service.price) || 0,
      categoryName: category.name
    });
    setOpen(false);
    setSearch("");
  };

  const displayValue = value ? `${value.name} (${value.duration} min)` : "";

  return (
    <Box ref={containerRef} style={styles.container}>
      <TextField
        fullWidth
        size="small"
        placeholder="Select service"
        value={displayValue}
        onClick={() => setOpen((o) => !o)}
        onChange={() =>
        {
        }}
        inputProps={{readOnly: true, style: {cursor: "pointer"}}}
        error={!!error}
        InputProps={{
          endAdornment: isFetching ? (
            <InputAdornment position="end"><CircularProgress size={14} /></InputAdornment>
          ) : null
        }}
      />
      {error && <Typography style={styles.errorText}>{error}</Typography>}
      {open && (
        <Paper elevation={3} style={styles.dropdown}>
          <Box style={styles.searchBox}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search services…"
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
            {isFetching && (
              <Box style={styles.loadingBox}><CircularProgress size={20} /></Box>
            )}
            {!isFetching && filteredCategories.map((category) => (
              <Box key={category.id}>
                <Typography style={styles.categoryHeader}>{category.name}</Typography>
                {category.services.map((service) => (
                  <Box key={service.id} style={styles.serviceRow} onClick={() => handleSelect(category, service)}>
                    <Typography style={styles.serviceName}>{service.name}</Typography>
                    <Typography style={styles.serviceMeta}>{service.duration} min</Typography>
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
