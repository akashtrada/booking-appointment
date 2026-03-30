import {createTheme} from "@mui/material/styles";

export const HEADER_BG = "#1c0d06";
export const NAV_ACTIVE = "#c8860a";

export const gapStd = 16;
export const gapHalf = 8;
export const gapQuarter = 4;

export const STATUS_COLORS = {
  Confirmed: "#b0d9e9",
  "Check-in (In Progress)": "#F3E0E4",
  "Check-in": "#F3E0E4",
  "Checked-in": "#F3E0E4",
  "In Progress": "#F3E0E4",
  Cancelled: "#ced4d8",
  "No-show": "#ced4d8"
};

export const defaultBgClr = "#f5f5f5";
export const borderClr = "#bebebe";
export const dividerClr = "#e0e0e0";
export const textPrimaryClr = "#1a1a1a";
export const textSecondaryClr = "#6b6b6b";
export const bgWhiteClr = "#ffffff";

const primary = {
  main: "#2c1a0e",
  light: "#4d3020",
  dark: "#1a0c05",
  contrastText: bgWhiteClr
};

const theme = createTheme({
  palette: {
    mode: "light",
    primary,
    error: {
      main: "#d32f2f"
    },
    text: {
      primary: textPrimaryClr,
      secondary: textSecondaryClr,
      disabled: "#9e9e9e"
    },
    background: {
      default: "#f5f5f5",
      paper: bgWhiteClr
    },
    divider: "#e0e0e0"
  },
  typography: {
    fontFamily: "\"Inter\", \"Roboto\", sans-serif"
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          borderRadius: "3px"
        }
      }
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            color: "#e0e0e0"
          }
        }
      }
    }
  }
});

export default theme;
