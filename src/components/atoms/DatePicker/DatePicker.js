import {useMemo, useState} from "react";
import {Box, IconButton, Typography} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {DatePicker as MuiDatePicker} from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import {STR_TODAY} from "../../../constants/constantsPlus";
import {defaultBgClr} from "../../../theme/theme";

export default function DatePicker(props)
{
  const {value, onChange, cbDateSelect, onTodayClick, onDateLabelClick} = props;

  const [date, setDate] = useState(value || new Date());
  const [pickerOpen, setPickerOpen] = useState(false);

  const formattedDate = useMemo(() =>
  {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(date);
  }, [date]);

  const styles = useMemo(() => ({
    wrapper: {
      display: "flex",
      alignItems: "center",
      backgroundColor: defaultBgClr,
      borderRadius: "3px",
      paddingLeft: "8px",
      paddingRight: "8px",
      height: "30px",
      gap: "4px",
      position: "relative"
    },
    todayBtn: {
      fontWeight: 500,
      paddingLeft: "4px",
      paddingRight: "4px",
      cursor: "pointer",
      fontSize: "0.875rem",
      userSelect: "none"
    },
    dateText: {
      minWidth: "80px",
      textAlign: "center"
    },
    iconBtn: {
      padding: "2px",
      borderRadius: "3px"
    },
    hiddenPicker: {
      position: "absolute",
      opacity: 0,
      pointerEvents: "none",
      width: 0,
      height: 0,
      overflow: "hidden"
    }
  }), []);

  const updateDate = (newDate) =>
  {
    setDate(newDate);
    onChange?.(newDate);
  };

  const handleToday = () =>
  {
    const today = new Date();
    updateDate(today);
    cbDateSelect?.(today);
    onTodayClick?.();
  };

  const handlePrev = () =>
  {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    updateDate(d);
  };

  const handleNext = () =>
  {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    updateDate(d);
  };

  const handlePickerChange = (dayjsValue) =>
  {
    if(!dayjsValue)
    {
      return;
    }
    const selected = dayjsValue.toDate();
    setDate(selected);
    onChange?.(selected);
    cbDateSelect?.(selected);
    onDateLabelClick?.();
  };

  return (
    <Box style={styles.wrapper}>
      <Typography variant="body2" style={styles.todayBtn} onClick={handleToday}>
        {STR_TODAY}
      </Typography>
      <IconButton size="small" onClick={handlePrev} style={styles.iconBtn}>
        <ChevronLeftIcon style={{fontSize: "16px"}} />
      </IconButton>
      <Typography
        variant="body2"
        style={{...styles.dateText, cursor: onDateLabelClick ? "pointer" : "default"}}
        onClick={onDateLabelClick}
      >
        {formattedDate}
      </Typography>
      <IconButton size="small" onClick={handleNext} style={styles.iconBtn}>
        <ChevronRightIcon style={{fontSize: "16px"}} />
      </IconButton>
      <IconButton size="small" onClick={() => setPickerOpen(true)} style={styles.iconBtn}>
        <CalendarTodayIcon style={{fontSize: "14px"}} />
      </IconButton>

      <Box style={styles.hiddenPicker}>
        <MuiDatePicker
          open={pickerOpen}
          onClose={() => setPickerOpen(false)}
          value={dayjs(date)}
          onChange={handlePickerChange}
          slotProps={{textField: {size: "small"}}}
        />
      </Box>
    </Box>
  );
}
