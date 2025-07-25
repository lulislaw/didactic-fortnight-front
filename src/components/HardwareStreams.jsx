// src/components/constructor/HardwareStreams.jsx
import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {Grid, Paper, Typography, Box} from '@mui/material'
import HlsPreview from '@/components/HlsPreview.jsx'

export default function HardwareStreams({
                                          hardwareList = [],
                                          camerasOnFloor = [],
                                          selectedHardwareId,
                                          onSelectHardware,
                                        }) {

  const linked = useMemo(() => {
    const ids = Array.from(
        new Set(camerasOnFloor.map(cam => cam.hardwareId).filter(Boolean))
    )
    return ids
        .map(id => hardwareList.find(h => h.id === id))
        .filter(Boolean)
  }, [hardwareList, camerasOnFloor])

  if (!linked.length) {
    return <Typography>Нет привязанных железных камер</Typography>
  }

  return (
      <Grid container spacing={2}>
        {linked.map(hw => {
          const isSel = hw.id === selectedHardwareId
          return (
              <Grid item xs={12} sm={6} md={4} key={hw.id}>
                <Paper
                    onClick={() => onSelectHardware(hw.id)}
                    sx={{
                      p: 1,
                      cursor: 'pointer',
                      border: theme =>
                          isSel
                              ? `2px solid ${theme.palette.primary.main}`
                              : '1px solid #ddd',
                      opacity: isSel ? 1 : 0.5,
                      transition: 'opacity .3s, border-color .3s',
                    }}
                >
                  <Typography noWrap variant="subtitle2" gutterBottom>
                    {hw.name}
                  </Typography>
                  <Box sx={{width: '100%', height: 120}}>
                    <HlsPreview
                        url={hw.stream_url}
                        style={{width: '100%', height: '100%'}}
                    />
                  </Box>
                </Paper>
              </Grid>
          )
        })}
      </Grid>
  )
}

HardwareStreams.propTypes = {
  hardwareList:       PropTypes.array,
  camerasOnFloor:     PropTypes.array,
  selectedHardwareId: PropTypes.string,
  onSelectHardware:   PropTypes.func.isRequired,
}
