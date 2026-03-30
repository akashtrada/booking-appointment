import {useEffect, useMemo, useState} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography
} from "@mui/material";
import {DatePicker as MuiDatePicker} from "@mui/x-date-pickers/DatePicker";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import CustomerSearch from "../organisms/createBookingDrawer/CustomerSearch";
import BookingItemForm from "../organisms/createBookingDrawer/BookingItemForm";
import {
  cancelBooking,
  createBooking,
  deleteBooking,
  updateBooking,
  updateBookingStatus
} from "../../services/bookingCreateService";
import useUiStore from "../../store/uiStore";
import useFilterStore from "../../store/filterStore";
import useBookingStore from "../../store/bookingStore";
import useTherapistStore from "../../store/therapistStore";
import {px, TIME_SLOTS} from "../../utils/utilPlus";
import {bgWhiteClr, dividerClr, gapHalf, gapStd, HEADER_BG, textPrimaryClr, textSecondaryClr} from "../../theme/theme";
import {
  DEFAULT_START_TIME,
  DRAWER_WIDTH,
  OUTLET_NAME,
  PANEL,
  PENDING_BOOKING_COLOR,
  SOURCE_OPTIONS,
  STR_CHECKIN,
  STR_CONFIRMED
} from "../../constants/constantsPlus";

const schema = yup.object({
  start_time: yup.string().required("Select a time"),
  customer: yup.mixed().required("Customer is required"),
  items: yup
  .array()
  .of(
    yup.object({
      service: yup.mixed().required("Select a service"),
      therapist: yup.mixed().nullable(),
      start_time: yup.string().required(),
      end_time: yup.string().required(),
      duration: yup.number().min(1, "Select a service"),
      service_request: yup.string(),
      room: yup.mixed().nullable()
    })
  )
  .min(1),
  source: yup.string().required("Source is required"),
  note: yup.string()
});

const DEFAULT_ITEM = {
  service: null,
  therapist: null,
  start_time: DEFAULT_START_TIME,
  end_time: DEFAULT_START_TIME,
  duration: 0,
  service_request: "",
  room: null
};

function parseServiceDate(dateStr)
{
  if(!dateStr)
  {
    return null;
  }
  const parts = dateStr.split("-");
  if(parts.length !== 3)
  {
    return null;
  }
  const [d, m, y] = parts;
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr)
{
  return dayjs(dateStr).format("ddd, MMM D");
}

export default function CreateBookingDrawer()
{
  const isPanelOpen = useUiStore((s) => s.isPanelOpen);
  const panelMode = useUiStore((s) => s.panelMode);
  const selectedBookingId = useUiStore((s) => s.selectedBookingId);
  const closeCreateDrawer = useUiStore((s) => s.closeCreateDrawer);
  const closeEditDrawer = useUiStore((s) => s.closeEditDrawer);
  const showToast = useUiStore((s) => s.showToast);
  const selectedDate = useFilterStore((s) => s.selectedDate);
  const rawBookings = useBookingStore((s) => s.bookings);
  const removeBookingFromStore = useBookingStore((s) => s.removeBooking);
  const updateBookingInStore = useBookingStore((s) => s.updateBooking);
  const therapists = useTherapistStore((s) => s.therapists);

  const isOpen = isPanelOpen && (panelMode === "create" || panelMode === "edit");
  const isEdit = panelMode === "edit";

  const [isEditing, setIsEditing] = useState(false);
  const [formDate, setFormDate] = useState(selectedDate);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelOption, setCancelOption] = useState("normal");
  const [isProcessing, setIsProcessing] = useState(false);

  const rawBooking = isEdit ? rawBookings.find((b) => b.id === selectedBookingId) : null;

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: {errors, isSubmitting}
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      start_time: DEFAULT_START_TIME,
      customer: null,
      items: [{...DEFAULT_ITEM}],
      source: "",
      note: ""
    }
  });

  const {fields, append, remove} = useFieldArray({control, name: "items"});
  const watchStartTime = watch("start_time");

  const buildEditDefaults = (booking) =>
  {
    const items = Object.values(booking.booking_item || {}).flat();
    const firstItem = items[0];
    return {
      start_time: firstItem?.start_time?.substring(0, 5) || DEFAULT_START_TIME,
      customer: {
        id: booking.user_id,
        name: booking.customer_name,
        mobile_number: booking.mobile_number
      },
      items: items.length > 0 ? items.map((item) => ({
        bookingItemId: item.id,
        service: item.service_id
          ? {id: item.service_id, name: item.service, duration: item.duration, price: 0}
          : null,
        therapist: therapists.find((t) => t.id === item.therapist_id) || null,
        start_time: item.start_time?.substring(0, 5) || DEFAULT_START_TIME,
        end_time: item.end_time?.substring(0, 5) || DEFAULT_START_TIME,
        duration: item.duration || 0,
        service_request: item.service_request || "",
        room: item.room_items?.[0]
          ? {room_id: item.room_items[0].room_id, room_name: item.room_items[0].room_name, items: []}
          : null
      })) : [{...DEFAULT_ITEM}],
      source: booking.source || "",
      note: booking.note || booking.notes || ""
    };
  };

  useEffect(() =>
  {
    if(!isOpen)
    {
      return;
    }
    if(isEdit && rawBooking)
    {
      reset(buildEditDefaults(rawBooking));
      setFormDate(parseServiceDate(rawBooking.service_date) || selectedDate);
      setIsEditing(false);
    }
    else
    {
      reset({start_time: DEFAULT_START_TIME, customer: null, items: [{...DEFAULT_ITEM}], source: "", note: ""});
      setFormDate(selectedDate);
      setIsEditing(false);
    }
  }, [isOpen, panelMode, selectedBookingId]);

  const handleStartTimeChange = (time, rhfOnChange) =>
  {
    rhfOnChange(time);
    setValue("items.0.start_time", time);
    const dur = getValues("items.0.duration");
    if(dur > 0)
    {
      const [h, m] = time.split(":").map(Number);
      const total = h * 60 + m + dur;
      const end = `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
      setValue("items.0.end_time", end);
    }
  };

  const handleClose = () =>
  {
    reset({start_time: DEFAULT_START_TIME, customer: null, items: [{...DEFAULT_ITEM}], source: "", note: ""});
    setIsEditing(false);
    if(isEdit)
    {
      closeEditDrawer();
    }
    else
    {
      closeCreateDrawer();
    }
  };

  const handleCancelEdit = () =>
  {
    if(rawBooking)
    {
      reset(buildEditDefaults(rawBooking));
    }
    setIsEditing(false);
  };

  const onSubmit = async(data) =>
  {
    try
    {
      const service_at = dayjs(formDate).format("DD-MM-YYYY") + " " + data.start_time;
      if(isEdit)
      {
        await updateBooking(selectedBookingId, {...data, service_at});
        showToast("Booking updated successfully", "success");
      }
      else
      {
        await createBooking({...data, service_at});
        showToast("Booking created successfully", "success");
      }
      handleClose();
    }
    catch(err)
    {
      showToast(err?.message || (isEdit ? "Failed to update booking" : "Failed to create booking"), "error");
    }
  };

  const styles = useMemo(() => ({
    paper: {width: px(DRAWER_WIDTH)},
    shell: {
      width: px(DRAWER_WIDTH),
      height: "100%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: bgWhiteClr
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${px(gapStd)} ${px(gapStd)}`,
      borderBottom: `1px solid ${dividerClr}`,
      flexShrink: 0
    },
    headerTitle: {fontSize: "16px", fontWeight: 700, color: textPrimaryClr},
    headerActions: {display: "flex", alignItems: "center", gap: px(4)},
    body: {flex: 1, overflowY: "auto"},
    section: {padding: `${px(gapStd)} ${px(gapStd)}`},
    infoRow: {display: "flex", alignItems: "center", gap: px(gapHalf)},
    infoLabel: {fontSize: "13px", color: textSecondaryClr, minWidth: px(44)},
    infoValue: {fontSize: "13px", fontWeight: 600, color: textPrimaryClr},
    dateTimeRow: {display: "flex", gap: px(gapStd), alignItems: "flex-start"},
    sectionLabel: {
      fontSize: "12px",
      fontWeight: 600,
      color: textSecondaryClr,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginBottom: px(8)
    },
    addServiceBtn: {
      border: `1px solid ${PENDING_BOOKING_COLOR}`,
      color: PENDING_BOOKING_COLOR,
      fontSize: "12px",
      fontWeight: 600,
      marginTop: px(gapHalf),
      padding: `${px(4)} ${px(10)}`
    },
    footer: {
      padding: px(gapStd),
      borderTop: `1px solid ${dividerClr}`,
      flexShrink: 0
    },
    submitBtn: {width: "100%", height: px(40), fontWeight: 600, fontSize: "14px"},
    menuItem: {fontSize: "14px", minWidth: px(140)},
    menuItemDanger: {fontSize: "14px", minWidth: px(140), color: "#d32f2f"},
    statusBar: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${px(8)} ${px(gapStd)}`,
      borderBottom: `1px solid ${dividerClr}`,
      flexShrink: 0
    },
    statusLeft: {display: "flex", alignItems: "center", gap: px(8)},
    statusDot: {width: px(8), height: px(8), borderRadius: "50%", flexShrink: 0},
    statusText: {fontSize: "13px", fontWeight: 600, color: textPrimaryClr},
    checkinBtn: {
      backgroundColor: HEADER_BG,
      color: "#fff",
      fontSize: "12px",
      fontWeight: 600
    },
    detailsGrid: {display: "flex", flexDirection: "column", gap: px(6)},
    detailRow: {display: "flex", alignItems: "flex-start", gap: px(6)},
    detailLabel: {fontSize: "13px", color: textSecondaryClr, minWidth: px(88), flexShrink: 0},
    detailValue: {fontSize: "13px", color: textPrimaryClr, fontWeight: 500}
  }), []);

  const isCancelled = isEdit && rawBooking?.status === "Cancelled";

  const renderHeader = () =>
  {
    if(!isEdit)
    {
      return (
        <Box style={styles.header}>
          <Typography style={styles.headerTitle}>New Booking</Typography>
          <Button variant="outlined" size="small" onClick={handleClose}>Cancel</Button>
        </Box>
      );
    }
    if(isEditing)
    {
      return (
        <Box style={styles.header}>
          <Typography style={styles.headerTitle}>Update Booking</Typography>
          <Button variant="outlined" size="small" onClick={handleCancelEdit}>Cancel</Button>
        </Box>
      );
    }
    // Cancelled — no edit or menu actions
    if(isCancelled)
    {
      return (
        <Box style={styles.header}>
          <Typography style={styles.headerTitle}>Appointment</Typography>
          <Button variant="outlined" size="small" onClick={handleClose}>Close</Button>
        </Box>
      );
    }
    return (
      <Box style={styles.header}>
        <Typography style={styles.headerTitle}>Appointment</Typography>
        <Box style={styles.headerActions}>
          <IconButton size="small" onClick={() => setIsEditing(true)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
        >
          <MenuItem
            style={styles.menuItemDanger} onClick={() =>
          {
            setMenuAnchor(null);
            setCancelOption("normal");
            setCancelDialogOpen(true);
          }}
          >
            Cancel / Delete
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  const renderEditBody = (viewOnly = false) => (
    <Box
      style={{pointerEvents: viewOnly ? "none" : "auto"}}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Box style={styles.section}>
        <Box style={styles.infoRow}>
          <Typography style={styles.infoLabel}>{PANEL}</Typography>
          <Typography style={styles.infoValue}>{OUTLET_NAME}</Typography>
        </Box>
      </Box>
      <Divider />
      <Box style={styles.section}>
        <Box style={styles.dateTimeRow}>
          {isEdit ? (
            <MuiDatePicker
              label="On"
              value={dayjs(formDate)}
              onChange={(v) => v && setFormDate(v.format("YYYY-MM-DD"))}
              slotProps={{textField: {size: "small", style: {flex: 1}}}}
            />
          ) : (
            <TextField
              size="small"
              label="On"
              value={formatDisplayDate(selectedDate)}
              InputProps={{readOnly: true}}
              InputLabelProps={{shrink: true}}
              style={{flex: 1}}
            />
          )}
          <Controller
            name="start_time"
            control={control}
            render={({field}) => (
              <FormControl size="small" error={!!errors.start_time} style={{flex: 1}}>
                <InputLabel shrink>At</InputLabel>
                <Select
                  notched
                  label="At"
                  value={field.value}
                  onChange={(e) => handleStartTimeChange(e.target.value, field.onChange)}
                >
                  {TIME_SLOTS.map((slot) => (
                    <MenuItem key={slot.value} value={slot.value}>{slot.label}</MenuItem>
                  ))}
                </Select>
                {errors.start_time && <FormHelperText>{errors.start_time.message}</FormHelperText>}
              </FormControl>
            )}
          />
        </Box>
      </Box>
      <Divider />
      <Box style={styles.section}>
        <Typography style={styles.sectionLabel}>Client</Typography>
        <Controller
          name="customer"
          control={control}
          render={({field}) => (
            <Box>
              <CustomerSearch value={field.value} onChange={field.onChange} />
              {errors.customer && (
                <Typography style={{fontSize: "11px", color: "#d32f2f", marginTop: px(2)}}>
                  {errors.customer.message}
                </Typography>
              )}
            </Box>
          )}
        />
      </Box>
      <Divider />
      <Box style={styles.section}>
        <Typography style={styles.sectionLabel}>Services</Typography>
        {fields.map((field, index) => (
          <BookingItemForm
            key={field.id}
            index={index}
            control={control}
            setValue={setValue}
            getValues={getValues}
            remove={remove}
            showRemove={fields.length > 1}
            errors={errors}
          />
        ))}
        <Button
          variant="outlined"
          size="small"
          style={styles.addServiceBtn}
          startIcon={<AddIcon />}
          onClick={() => append({...DEFAULT_ITEM, start_time: watchStartTime, end_time: watchStartTime})}
        >
          Add service
        </Button>
      </Box>
      {!viewOnly && (
        <>
          <Divider />
          <Box style={styles.section}>
            <Typography style={styles.sectionLabel}>Source</Typography>
            <Controller
              name="source"
              control={control}
              render={({field}) => (
                <FormControl fullWidth size="small" error={!!errors.source}>
                  <Select
                    {...field}
                    displayEmpty
                    renderValue={(val) =>
                      val || <span style={{color: textSecondaryClr}}>Select Source</span>
                    }
                  >
                    {SOURCE_OPTIONS.map((s) => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                  </Select>
                  {errors.source && <FormHelperText>{errors.source.message}</FormHelperText>}
                </FormControl>
              )}
            />
          </Box>
        </>
      )}
      <Divider />
      <Box style={styles.section}>
        <Typography style={styles.sectionLabel}>Notes</Typography>
        <Controller
          name="note"
          control={control}
          render={({field}) => (
            <TextField
              {...field}
              fullWidth
              size="small"
              placeholder="Notes (Optional)"
              multiline
              minRows={2}
              maxRows={5}
              sx={field.value ? {
                "& .MuiInputBase-root": {backgroundColor: "#f6e9b4"},
                "& .MuiOutlinedInput-notchedOutline": {borderColor: "#e0c96e"}
              } : {}}
            />
          )}
        />
      </Box>
      {viewOnly && rawBooking && (
        <>
          <Divider />
          <Box style={styles.section}>
            <Typography style={styles.sectionLabel}>Booking details</Typography>
            <Box style={styles.detailsGrid}>
              {[
                {
                  label: "Booked on",
                  value: rawBooking.created_at ? dayjs(rawBooking.created_at).format("ddd, MMM D [at] h:mm A") : "—"
                },
                {label: "Booked by", value: rawBooking.customer_name || "—"},
                {
                  label: "Updated on",
                  value: rawBooking.updated_at ? dayjs(rawBooking.updated_at).format("ddd, MMM D [at] h:mm A") : "—"
                },
                {label: "Updated by", value: rawBooking.updated_by_name || rawBooking.updated_by || "—"},
                {label: "Source", value: rawBooking.source || "—"}
              ].map(({label, value}) => (
                <Box key={label} style={styles.detailRow}>
                  <Typography style={styles.detailLabel}>{label}:</Typography>
                  <Typography style={styles.detailValue}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <>
      <Drawer anchor="right" open={isOpen} onClose={handleClose} PaperProps={{style: styles.paper}}>
        <Box style={styles.shell}>
          {renderHeader()}
          {isEdit && !isEditing && isCancelled && (
            <Box style={styles.statusBar}>
              <Box style={styles.statusLeft}>
                <Box style={{...styles.statusDot, backgroundColor: "#9e9e9e"}} />
                <Typography style={styles.statusText}>Cancelled (normal cancellation)</Typography>
              </Box>
            </Box>
          )}
          {isEdit && !isEditing && !isCancelled && (rawBooking?.status === STR_CONFIRMED || rawBooking?.status
            === "Check-in (In Progress)") && (
            <Box style={styles.statusBar}>
              <Box style={styles.statusLeft}>
                <Box
                  style={{
                    ...styles.statusDot,
                    backgroundColor: rawBooking.status === STR_CONFIRMED ? "#1976d2" : "#e91e63"
                  }}
                />
                <Typography style={styles.statusText}>{rawBooking.status}</Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                style={styles.checkinBtn}
                onClick={async() =>
                {
                  const nextStatus = rawBooking.status === STR_CONFIRMED ? "Check-in (In Progress)" : "Completed";
                  try
                  {
                    await updateBookingStatus(selectedBookingId, nextStatus);
                    updateBookingInStore(selectedBookingId, {status: nextStatus});
                    showToast(rawBooking.status === STR_CONFIRMED ? "Checked in" : "Checked out", "success");
                  }
                  catch(err)
                  {
                    showToast(err?.message || "Action failed", "error");
                  }
                }}
              >
                {rawBooking.status === STR_CONFIRMED ? STR_CHECKIN : "Check-out"}
              </Button>
            </Box>
          )}
          <Box style={{flex: 1, overflowY: "auto"}}>
            {renderEditBody(isEdit && !isEditing)}
          </Box>
          {(!isEdit || isEditing) && !isCancelled && (
            <Box style={styles.footer}>
              <Button
                variant="contained"
                style={styles.submitBtn}
                disabled={isSubmitting}
                onClick={handleSubmit(onSubmit)}
              >
                {isSubmitting ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Update Booking" : "Create Booking")}
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{fontWeight: 700, fontSize: "16px", pb: 0}}>
          Cancel / Delete Booking
        </DialogTitle>
        <DialogContent sx={{pt: 1}}>
          <Typography sx={{fontSize: "13px", color: textSecondaryClr, mb: 2}}>
            Please select the cancellation type
          </Typography>
          <RadioGroup value={cancelOption} onChange={(e) => setCancelOption(e.target.value)}>
            <FormControlLabel
              value="normal"
              control={<Radio size="small" />}
              label={<Typography sx={{fontSize: "14px"}}>Normal Cancellation</Typography>}
            />
            <FormControlLabel
              value="noshow"
              disabled
              control={<Radio size="small" />}
              label={<Typography sx={{fontSize: "14px", color: textSecondaryClr}}>No Show</Typography>}
            />
          </RadioGroup>

          <Divider sx={{my: 2}} />

          <RadioGroup value={cancelOption} onChange={(e) => setCancelOption(e.target.value)}>
            <FormControlLabel
              value="delete"
              control={<Radio size="small" />}
              label={
                <Box>
                  <Typography sx={{fontSize: "14px"}}>Just Delete It</Typography>
                  <Typography sx={{fontSize: "11px", color: textSecondaryClr, mt: 0.25}}>
                    Bookings with a deposit cannot be deleted. Please cancel instead to retain a proper record.
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{justifyContent: "space-between", px: 3, pb: 2}}>
          <Button variant="outlined" size="small" onClick={() => setCancelDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            size="small"
            disabled={isProcessing}
            onClick={async() =>
            {
              setIsProcessing(true);
              try
              {
                if(cancelOption === "delete")
                {
                  await deleteBooking(selectedBookingId);
                  removeBookingFromStore(selectedBookingId);
                  showToast("Booking deleted", "success");
                }
                else
                {
                  await cancelBooking(selectedBookingId);
                  showToast("Booking cancelled", "success");
                }
                setCancelDialogOpen(false);
                handleClose();
              }
              catch(err)
              {
                showToast(err?.message || "Action failed", "error");
              }
              finally
              {
                setIsProcessing(false);
              }
            }}
          >
            {isProcessing ? "Processing…" : "Next"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
