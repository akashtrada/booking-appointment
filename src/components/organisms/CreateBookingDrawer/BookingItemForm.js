import { useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  MenuItem,
  Select,
  FormControl,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Controller, useWatch } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import ServiceDropdown from './ServiceDropdown';
import TherapistDropdown from './TherapistDropdown';
import { px } from '../../../utils/appPlus';
import { gapHalf, gapStd, dividerClr, textSecondaryClr, textPrimaryClr } from '../../../theme/theme';
import useFilterStore from '../../../store/filterStore';
import { fetchRooms } from '../../../services/roomService';

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

function formatDisplayTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const displayH = h % 12 || 12;
  return `${String(displayH).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export default function BookingItemForm({ index, control, setValue, getValues, remove, showRemove, errors }) {
  const selectedDate = useFilterStore((s) => s.selectedDate);

  const watchedService = useWatch({ control, name: `items.${index}.service` });
  const watchedDuration = useWatch({ control, name: `items.${index}.duration` });
  const watchedRoom = useWatch({ control, name: `items.${index}.room` });

  const { data: rooms = [] } = useQuery({
    queryKey: ['rooms', selectedDate, watchedDuration],
    queryFn: () => fetchRooms(selectedDate, watchedDuration),
    enabled: !!watchedDuration && watchedDuration > 0,
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    if (watchedRoom?.room_id && !watchedRoom?.items?.length && rooms.length > 0) {
      const fullRoom = rooms.find((r) => r.room_id === watchedRoom.room_id);
      if (fullRoom) setValue(`items.${index}.room`, fullRoom);
    }
  }, [rooms]);

  const styles = useMemo(() => ({
    card: {
      border: `1px solid ${dividerClr}`,
      borderRadius: px(8),
      padding: px(gapStd),
      marginBottom: px(gapHalf),
      position: 'relative',
    },
    row: {
      display: 'flex',
      alignItems: 'center',
      gap: px(gapHalf),
      marginTop: px(10),
    },
    label: {
      fontSize: '12px',
      color: textSecondaryClr,
      minWidth: px(46),
      flexShrink: 0,
    },
    value: {
      fontSize: '13px',
      color: textPrimaryClr,
      fontWeight: 500,
    },
    deleteBtn: {
      position: 'absolute',
      top: px(6),
      right: px(6),
    },
  }), []);

  const handleServiceChange = (service, onChange) => {
    onChange(service);
    if (service) {
      const startTime = getValues(`items.${index}.start_time`);
      const endTime = addMinutes(startTime, service.duration);
      setValue(`items.${index}.duration`, service.duration);
      setValue(`items.${index}.end_time`, endTime);
      setValue(`items.${index}.room`, null);
    }
  };

  return (
    <Box style={styles.card}>
      {showRemove && (
        <IconButton size="small" style={styles.deleteBtn} onClick={() => remove(index)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}

      <Controller
        name={`items.${index}.service`}
        control={control}
        render={({ field }) => (
          <ServiceDropdown
            value={field.value}
            onChange={(service) => handleServiceChange(service, field.onChange)}
            error={errors?.items?.[index]?.service?.message}
          />
        )}
      />

      {watchedService && (
        <>
          <Controller
            name={`items.${index}.therapist`}
            control={control}
            render={({ field }) => (
              <Box style={styles.row}>
                <Typography style={styles.label}>With</Typography>
                <TherapistDropdown value={field.value} onChange={field.onChange} />
              </Box>
            )}
          />

          <Controller
            name={`items.${index}.duration`}
            control={control}
            render={({ field: durField }) => (
              <Controller
                name={`items.${index}.start_time`}
                control={control}
                render={({ field: startField }) => (
                  <Controller
                    name={`items.${index}.end_time`}
                    control={control}
                    render={({ field: endField }) => (
                      <Box style={styles.row}>
                        <Typography style={styles.label}>For</Typography>
                        <Typography style={styles.value}>
                          {durField.value ? `${durField.value} min` : '—'}
                        </Typography>
                        {startField.value && (
                          <>
                            <Typography style={{ ...styles.label, marginLeft: px(4) }}>At</Typography>
                            <Typography style={styles.value}>
                              {formatDisplayTime(startField.value)}
                              {endField.value && ` — ${formatDisplayTime(endField.value)}`}
                            </Typography>
                          </>
                        )}
                      </Box>
                    )}
                  />
                )}
              />
            )}
          />

          <Controller
            name={`items.${index}.room`}
            control={control}
            render={({ field }) => (
              <Box style={styles.row}>
                <Typography style={styles.label}>Using</Typography>
                <FormControl size="small" sx={{ flex: 1 }}>
                  <Select
                    value={field.value?.room_id || ''}
                    onChange={(e) => {
                      const room = rooms.find((r) => r.room_id === e.target.value) || null;
                      field.onChange(room);
                    }}
                    displayEmpty
                    renderValue={(val) =>
                      val
                        ? rooms.find((r) => r.room_id === val)?.room_name || ''
                        : <span style={{ color: textSecondaryClr, fontSize: '13px' }}>Select room</span>
                    }
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.room_id} value={room.room_id}>
                        {room.room_name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          />

          <Controller
            name={`items.${index}.service_request`}
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                size="small"
                placeholder="Service request (optional)"
                sx={{ marginTop: `${gapHalf}px` }}
              />
            )}
          />
        </>
      )}
    </Box>
  );
}
