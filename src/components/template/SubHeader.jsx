import {useMemo} from "react";
import {Box} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import Dropdown from "../atoms/Dropdown";
import Button from "../atoms/Button";
import DatePicker from "../atoms/DatePicker";
import Search from "../molecules/Search";
import {px} from "../../utils/utilPlus";
import {gapHalf, gapStd} from "../../theme/theme";
import useOutletStore from "../../store/outletStore";

export default function SubHeader(props)
{
  const {onDateChange, onSearch, onFilterClick, onTodayClick, onDateLabelClick} = props;
  const outletName = useOutletStore((s) => s.outletName);

  const styles = useMemo(() => ({
    wrapper: {
      display: "flex",
      alignItems: "center",
      paddingLeft: px(gapStd),
      paddingRight: px(gapStd),
      paddingTop: px(gapStd),
      paddingBottom: px(gapStd),
      borderBottom: "1px solid #e0e0e0",
      backgroundColor: "#ffffff",
      gap: px(gapHalf)
    },
    leftGroup: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      width: px(200),
      height: px(40)
    },
    spacer: {
      flexGrow: 1
    },
    rightGroup: {
      display: "flex",
      alignItems: "center",
      gap: px(gapStd)
    }
  }), []);

  return (
    <Box style={styles.wrapper}>
      <Box style={styles.leftGroup}>
        <Dropdown value={outletName} disabled />
        <Dropdown value="Display : 15 Min" disabled />
      </Box>

      <Box style={styles.spacer} />

      <Box style={styles.rightGroup}>
        <Search onSearch={onSearch} />
        <Button
          label="Filter"
          icon={<TuneIcon style={{fontSize: "16px"}} />}
          iconPosition="right"
          variant="outlined"
          size="small"
          onClick={onFilterClick}
          sx={{height: px(30)}}
        />
        <DatePicker onChange={onDateChange} onTodayClick={onTodayClick} onDateLabelClick={onDateLabelClick} />
      </Box>
    </Box>
  );
}
