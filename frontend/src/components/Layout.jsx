import { Box, Container } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from './layout/Navbar'
import Footer from './layout/Footer'

export default function Layout() {
  return (
    <Box minH="100vh" bg="neutral.50">
      <Navbar />

      <Container maxW="container.xl" py={12}>
        <Outlet />
      </Container>

      <Footer />
    </Box>
  )
}
