import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router-dom'
import Navbar from './layout/Navbar'
import Footer from './layout/Footer'

export default function Layout() {
  return (
    <Box minH="100vh" bg="neutral.50">
      <Navbar />

      <Box w="full">
        <Outlet />
      </Box>

      <Footer />
    </Box>
  )
}
