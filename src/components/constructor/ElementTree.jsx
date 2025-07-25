import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  IconButton
} from '@mui/material';
import DomainIcon from '@mui/icons-material/Domain';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function ElementTree({
                                      floors,
                                      camerasMap,
                                      selectedFloorId,
                                      selectedCameraId,
                                      onSelectFloor,
                                      onSelectCamera,
                                    }) {
  const [expanded, setExpanded] = useState({});

  const toggleFloor = floorId => {
    setExpanded(prev => ({
      ...prev,
      [floorId]: !prev[floorId]
    }));
  };

  return (
    <List disablePadding>
      {floors.map(floorId => {
        const isExpanded = Boolean(expanded[floorId]);
        const isFloorSelected =
          floorId === selectedFloorId && selectedCameraId == null;

        return (
          <React.Fragment key={floorId}>
            <ListItem
              disableGutters
              selected={isFloorSelected}
              secondaryAction={
                <IconButton
                  edge="end"
                  size="small"
                  onClick={() => toggleFloor(floorId)}
                >
                  {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              }
            >
              <ListItemButton
                onClick={() => onSelectFloor(floorId)}
                sx={{ pl: 1 }}
              >
                <ListItemIcon>
                  <DomainIcon />
                </ListItemIcon>
                <ListItemText primary={`Этаж ${floorId}`} />
              </ListItemButton>
            </ListItem>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <List disablePadding>
                {(camerasMap[floorId] || []).map(cam => (
                  <ListItemButton
                    key={cam.id}
                    sx={{ pl: 3 }}
                    selected={cam.id === selectedCameraId}
                    onClick={() => {
                      onSelectFloor(floorId);
                      onSelectCamera(cam.id);
                    }}
                  >
                    <ListItemIcon>
                      <CameraAltIcon />
                    </ListItemIcon>
                    <ListItemText primary={`Камера #${cam.id}`} />
                  </ListItemButton>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        );
      })}
    </List>
  );
}

ElementTree.propTypes = {
  floors:           PropTypes.arrayOf(PropTypes.number).isRequired,
  camerasMap:       PropTypes.objectOf(PropTypes.array).isRequired,
  selectedFloorId:  PropTypes.number,
  selectedCameraId: PropTypes.number,
  onSelectFloor:    PropTypes.func.isRequired,
  onSelectCamera:   PropTypes.func.isRequired,
};
