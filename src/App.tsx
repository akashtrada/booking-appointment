import { Container, Typography, Box } from '@mui/material'

function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Booking Appointment
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          React + TypeScript + MUI
        </Typography>
      </Box>
    </Container>
  )
}

export default App