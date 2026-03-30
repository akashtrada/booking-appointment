import {useMemo} from "react";
import {AppBar, Box, Toolbar, Typography} from "@mui/material";
import {NavLink} from "react-router-dom";
import {HEADER_BG, NAV_ACTIVE} from "../../../theme/theme";
import {STR_LOGO} from "../../../constants/constantsPlus";

const NAV_TABS = [
  {label: "Home", to: "/", disabled: false},
  {label: "Therapists", to: "/therapists", disabled: true},
  {label: "Sales", to: "/sales", disabled: true},
  {label: "Clients", to: "/clients", disabled: true},
  {label: "Transactions", to: "/transactions", disabled: true},
  {label: "Reports", to: "/reports", disabled: true},
];

export default function Header()
{
  const styles = useMemo(() => ({
    appBar: {
      width: "100%",
      backgroundColor: HEADER_BG,
      boxShadow: "none"

    },
    logo: {
      fontWeight: "bold",
      color: "#ffffff",
      marginRight: "32px"
    },
    nav: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      gap: "24px",
      flex: 1
    }
  }), []);

  const getNavStyle = ({isActive}) => ({
    color: "#ffffff",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.875rem",
    padding: "6px 12px",
    borderRadius: "4px",
    backgroundColor: isActive ? NAV_ACTIVE : "transparent",
    opacity: isActive ? 1 : 0.85
  });

  return (
    <AppBar position="static" elevation={0} style={styles.appBar}>
      <Toolbar>
        <Typography variant="h5" style={styles.logo}>
          {STR_LOGO}
        </Typography>
        <Box style={styles.nav}>
          {NAV_TABS.map((tab) =>
            tab.disabled ? (
              <Typography
                key={tab.to}
                style={{
                  color: '#ffffff',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  padding: '6px 12px',
                  opacity: 0.4,
                  cursor: 'not-allowed',
                  userSelect: 'none',
                }}
              >
                {tab.label}
              </Typography>
            ) : (
              <NavLink key={tab.to} to={tab.to} end style={getNavStyle}>
                {tab.label}
              </NavLink>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
