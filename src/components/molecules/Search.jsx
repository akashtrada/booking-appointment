import {useDeferredValue, useEffect, useMemo, useState} from "react";
import {InputAdornment, TextField} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {px} from "../../utils/utilPlus";
import {borderClr} from "../../theme/theme";

export default function Search(props)
{
  const {onSearch, placeholder = "Search Sales by phone/name"} = props;

  const [value, setValue] = useState("");
  const deferredValue = useDeferredValue(value);

  const styles = useMemo(() => ({
    input: {
      "& .MuiOutlinedInput-root": {
        height: px(30),
        width: px(375),
        borderRadius: px(3),
        "& fieldset": {
          borderColor: borderClr
        }
      }
    }
  }), []);

  useEffect(() =>
  {
    onSearch?.(deferredValue);
  }, [deferredValue, onSearch]);

  return (
    <TextField
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      size="small"
      sx={styles.input}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon style={{fontSize: "18px"}} />
          </InputAdornment>
        )
      }}
    />
  );
}
