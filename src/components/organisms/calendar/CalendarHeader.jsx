import {useMemo} from "react";
import {Box, Typography} from "@mui/material";
import BoxAps from "../../molecules/BoxAps";
import EmptyState from "../../atoms/EmptyState";
import {px} from "../../../utils/utilPlus";

const CORNER_WIDTH = 80;
const COL_WIDTH = 120;
const HEADER_HEIGHT = 48;
const SKELETON_COUNT = 8;

export default function CalendarHeader(props)
{
  const {therapists, virtualColumns, totalColWidth, headerRef, isLoading} = props;

  const styles = useMemo(() => ({
    wrapper: {
      display: "flex",
      flexShrink: 0,
      backgroundColor: "#ffffff",
      borderBottom: "1px solid #e0e0e0"
    },
    corner: {
      width: px(CORNER_WIDTH),
      minWidth: px(CORNER_WIDTH),
      height: px(HEADER_HEIGHT),
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#ffffff"
    },
    therapistScroll: {
      overflow: "hidden",
      flex: 1,
      height: px(HEADER_HEIGHT)
    },
    innerTrack: {
      position: "relative",
      height: px(HEADER_HEIGHT)
    },
    therapistCell: {
      position: "absolute",
      top: 0,
      height: px(HEADER_HEIGHT),
      width: px(COL_WIDTH),
      display: "flex",
      alignItems: "center",
      paddingLeft: px(8),
      backgroundColor: "#ffffff"
    },
    skeletonRow: {
      display: "flex",
      height: px(HEADER_HEIGHT),
      alignItems: "center"
    },
    skeletonCell: {
      width: px(COL_WIDTH),
      height: px(HEADER_HEIGHT),
      display: "flex",
      alignItems: "center",
      paddingLeft: px(8),
      flexShrink: 0
    }
  }), []);

  const renderContent = () =>
  {
    if(isLoading)
    {
      return (
        <Box style={styles.skeletonRow}>
          {Array.from({length: SKELETON_COUNT}, (_, i) => (
            <Box key={i} style={styles.skeletonCell}>
              <BoxAps skeleton />
            </Box>
          ))}
        </Box>
      );
    }

    if(therapists.length === 0)
    {
      return <EmptyState message="No therapists available" />;
    }

    return (
      <Box style={{...styles.innerTrack, width: px(totalColWidth)}}>
        {virtualColumns.map((virtualCol) =>
        {
          const therapist = therapists[virtualCol.index];
          if(!therapist)
          {
            return null;
          }
          return (
            <Box key={virtualCol.key} style={{...styles.therapistCell, left: px(virtualCol.start)}}>
              <BoxAps
                number={therapist.pagerNumber}
                gender={therapist.gender}
                primaryText={therapist.alias}
                secondaryText={therapist.code}
              />
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box style={styles.wrapper}>
      <Box style={styles.corner}>
        <Typography variant="caption" fontWeight={600} color="text.secondary">
          Time
        </Typography>
      </Box>
      <Box ref={headerRef} style={styles.therapistScroll}>
        {renderContent()}
      </Box>
    </Box>
  );
}
