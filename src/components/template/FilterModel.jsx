import {useEffect, useMemo, useState} from "react";
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  InputAdornment,
  Popover,
  Radio,
  RadioGroup,
  TextField,
  Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import useFilterStore from "../../store/filterStore";
import useTherapistStore from "../../store/therapistStore";
import useRoomStore from "../../store/roomStore";
import {px} from "../../utils/utilPlus";
import {HEADER_BG, textPrimaryClr, textSecondaryClr} from "../../theme/theme";

const BOOKING_STATUSES = [
  "Confirmed",
  "Unconfirmed",
  "Checked In",
  "Completed",
  "Cancelled",
  "No Show",
  "Holding",
  "Check-in (In Progress)"
];

export default function FilterModel({anchorEl, onClose})
{
  const open = Boolean(anchorEl);

  const genderFilter = useFilterStore((s) => s.genderFilter);
  const statusFilters = useFilterStore((s) => s.statusFilters);
  const selectedTherapistIds = useFilterStore((s) => s.selectedTherapistIds);
  const resourceFilters = useFilterStore((s) => s.resourceFilters);
  const setGenderFilter = useFilterStore((s) => s.setGenderFilter);
  const setStatusFilters = useFilterStore((s) => s.setStatusFilters);
  const setSelectedTherapistIds = useFilterStore((s) => s.setSelectedTherapistIds);
  const setResourceFilters = useFilterStore((s) => s.setResourceFilters);
  const clearFilters = useFilterStore((s) => s.clearFilters);

  const therapists = useTherapistStore((s) => s.therapists);
  const resourceOptions = useRoomStore((s) => s.resourceOptions);

  const [therapistSearch, setTherapistSearch] = useState("");

  // initialise selectedTherapistIds to all when first opening and none selected
  useEffect(() =>
  {
    if(open && selectedTherapistIds.length === 0 && therapists.length > 0)
    {
      setSelectedTherapistIds(therapists.map((t) => t.id));
    }
  }, [open]);

  const filteredTherapistList = useMemo(() =>
  {
    if(!therapistSearch.trim())
    {
      return therapists;
    }
    const q = therapistSearch.toLowerCase();
    return therapists.filter(
      (t) =>
        t.alias?.toLowerCase().includes(q) ||
        t.code?.toLowerCase().includes(q) ||
        String(t.pagerNumber || "").includes(q)
    );
  }, [therapists, therapistSearch]);

  const allSelected = selectedTherapistIds.length === therapists.length;

  const handleSelectAll = (checked) =>
  {
    setSelectedTherapistIds(checked ? therapists.map((t) => t.id) : []);
  };

  const handleTherapistToggle = (id) =>
  {
    setSelectedTherapistIds(
      selectedTherapistIds.includes(id)
        ? selectedTherapistIds.filter((x) => x !== id)
        : [...selectedTherapistIds, id]
    );
  };

  const handleStatusToggle = (status) =>
  {
    setStatusFilters(
      statusFilters.includes(status)
        ? statusFilters.filter((s) => s !== status)
        : [...statusFilters, status]
    );
  };

  const handleClear = () =>
  {
    clearFilters();
    setSelectedTherapistIds(therapists.map((t) => t.id));
    setTherapistSearch("");
  };

  const styles = useMemo(() => ({
    paper: {width: 320, maxHeight: "80vh", overflowY: "auto"},
    section: {padding: `${px(12)} ${px(16)}`},
    sectionTitle: {
      fontSize: "12px",
      fontWeight: 700,
      color: textSecondaryClr,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: px(8)
    },
    groupLabel: {
      fontSize: "13px",
      fontWeight: 600,
      color: textPrimaryClr,
      marginBottom: px(6)
    },
    radioLabel: {fontSize: "13px", color: textPrimaryClr},
    statusGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: `${px(2)} ${px(4)}`
    },
    checkLabel: {fontSize: "13px", color: textPrimaryClr},
    therapistRow: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: px(8)
    },
    therapistTitle: {fontSize: "14px", fontWeight: 700, color: textPrimaryClr},
    clearBtn: {
      color: HEADER_BG,
      fontSize: "13px",
      fontWeight: 600,
      textTransform: "none",
      padding: `${px(12)} ${px(16)}`,
      width: "100%",
      justifyContent: "flex-start"
    }
  }), []);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{vertical: "bottom", horizontal: "right"}}
      transformOrigin={{vertical: "top", horizontal: "right"}}
      PaperProps={{style: styles.paper}}
    >
      {/* Show by group */}
      <Box style={styles.section}>
        <Typography style={styles.groupLabel}>Show by group (Person who is on duty)</Typography>
        <RadioGroup value={genderFilter} onChange={(e) => setGenderFilter(e.target.value)}>
          <Typography style={styles.sectionTitle}>All Therapist</Typography>
          <FormControlLabel
            value="all"
            control={<Radio size="small" />}
            label={<Typography style={styles.radioLabel}>All Therapist</Typography>}
          />
          <FormControlLabel
            value="male"
            control={<Radio size="small" />}
            label={<Typography style={styles.radioLabel}>Male</Typography>}
          />
          <FormControlLabel
            value="female"
            control={<Radio size="small" />}
            label={<Typography style={styles.radioLabel}>Female</Typography>}
          />
        </RadioGroup>
      </Box>

      <Divider />

      {/* Resources */}
      <Box style={styles.section}>
        <Typography style={styles.sectionTitle}>Resources</Typography>
        <Autocomplete
          multiple
          size="small"
          options={resourceOptions}
          getOptionLabel={(o) => o.label}
          value={resourceOptions.filter((o) => resourceFilters.includes(o.value))}
          onChange={(_, newVal) => setResourceFilters(newVal.map((o) => o.value))}
          isOptionEqualToValue={(o, v) => o.value === v.value}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={option.value}
                label={option.label}
                size="small"
                {...getTagProps({index})}
              />
            ))
          }
          renderInput={(params) => (
            <TextField {...params} placeholder="Select resources" size="small" />
          )}
        />
      </Box>

      <Divider />

      {/* Booking Status */}
      <Box style={styles.section}>
        <Typography style={styles.sectionTitle}>Booking Status</Typography>
        <Box style={styles.statusGrid}>
          {BOOKING_STATUSES.map((status) => (
            <FormControlLabel
              key={status}
              control={
                <Checkbox
                  size="small"
                  checked={!statusFilters.includes(status)}
                  onChange={() => handleStatusToggle(status)}
                />
              }
              label={<Typography style={styles.checkLabel}>{status}</Typography>}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      {/* Select Therapist */}
      <Box style={styles.section}>
        <Box style={styles.therapistRow}>
          <Typography style={styles.therapistTitle}>Select Therapist</Typography>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={allSelected}
                indeterminate={selectedTherapistIds.length > 0 && !allSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            }
            label={<Typography style={{fontSize: "13px", fontWeight: 600}}>Select all</Typography>}
            labelPlacement="start"
          />
        </Box>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by therapist"
          value={therapistSearch}
          onChange={(e) => setTherapistSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon style={{fontSize: "16px", color: textSecondaryClr}} />
              </InputAdornment>
            )
          }}
          style={{marginBottom: px(8)}}
        />
        <Box style={{maxHeight: px(180), overflowY: "auto"}}>
          {filteredTherapistList.map((t) => (
            <FormControlLabel
              key={t.id}
              control={
                <Checkbox
                  size="small"
                  checked={selectedTherapistIds.includes(t.id)}
                  onChange={() => handleTherapistToggle(t.id)}
                />
              }
              label={
                <Typography style={styles.checkLabel}>
                  {t.alias || t.code || `Therapist ${t.id}`}
                </Typography>
              }
              style={{display: "flex", marginBottom: px(2)}}
            />
          ))}
        </Box>
      </Box>

      <Divider />

      <Button style={styles.clearBtn} onClick={handleClear}>
        Clear Filter (Return to Default)
      </Button>
    </Popover>
  );
}
