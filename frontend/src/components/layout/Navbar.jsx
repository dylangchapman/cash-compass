import {
  Box,
  Container,
  Flex,
  HStack,
  Text,
  Icon,
  Link as ChakraLink,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
} from '@chakra-ui/react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { MdPerson, MdLogout, MdChevronRight, MdPrivacyTip } from 'react-icons/md'

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <ChakraLink
      as={Link}
      to={to}
      px={4}
      py={2}
      fontSize="sm"
      fontWeight={isActive ? 'bold' : 'medium'}
      color={isActive ? 'neutral.900' : 'neutral.600'}
      _hover={{
        color: 'neutral.900',
        textDecoration: 'none',
      }}
      transition="all 0.15s"
      position="relative"
      _after={isActive ? {
        content: '""',
        position: 'absolute',
        bottom: '-1px',
        left: 0,
        right: 0,
        height: '2px',
        bg: 'neutral.900',
      } : {}}
    >
      {children}
    </ChakraLink>
  )
}

export default function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const userName = localStorage.getItem('userName') || 'User'

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    navigate('/login')
  }

  return (
    <Box
      bg="white"
      borderBottom="1px solid"
      borderColor="neutral.200"
      position="sticky"
      top={0}
      zIndex={100}
      backdropFilter="blur(10px)"
    >
      <Container maxW="1400px">
        <Flex h={20} align="center" justify="space-between">
          {/* Logo */}
          <Box
            as={Link}
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            <Text
              fontSize="xl"
              fontWeight="black"
              color="neutral.900"
              letterSpacing="tighter"
            >
              Financial Coach
            </Text>
          </Box>

          {/* Navigation */}
          <Flex align="center" gap={2}>
            {isLoggedIn ? (
              <>
                <HStack spacing={1} mr={6}>
                  <NavLink to="/dashboard">Dashboard</NavLink>
                  <NavLink to="/insights">Insights</NavLink>
                  <NavLink to="/subscriptions">Subscriptions</NavLink>
                  <NavLink to="/portfolio">Portfolio</NavLink>
                  <NavLink to="/coach">Coach</NavLink>
                </HStack>

                <Menu>
                  <MenuButton
                    as={Button}
                    variant="ghost"
                    size="md"
                    rightIcon={<MdChevronRight />}
                    px={3}
                  >
                    <HStack spacing={3}>
                      <Avatar size="sm" name={userName} bg="neutral.900" />
                      <Text fontSize="sm" fontWeight="semibold" color="neutral.900">
                        {userName.split(' ')[0]}
                      </Text>
                    </HStack>
                  </MenuButton>
                  <MenuList
                    borderRadius="8px"
                    border="2px solid"
                    borderColor="neutral.700"
                    bg="neutral.800"
                    p={2}
                    boxShadow="xl"
                  >
                    <MenuItem
                      icon={<MdPerson />}
                      as={Link}
                      to="/settings"
                      borderRadius="6px"
                      fontWeight="medium"
                      fontSize="sm"
                      color="white"
                      bg="transparent"
                      _hover={{ bg: 'neutral.700' }}
                    >
                      Settings
                    </MenuItem>
                    <MenuItem
                      icon={<MdPrivacyTip />}
                      as={Link}
                      to="/privacy"
                      borderRadius="6px"
                      fontWeight="medium"
                      fontSize="sm"
                      color="white"
                      bg="transparent"
                      _hover={{ bg: 'neutral.700' }}
                    >
                      Privacy Policy
                    </MenuItem>
                    <MenuItem
                      icon={<MdLogout />}
                      onClick={handleLogout}
                      borderRadius="6px"
                      fontWeight="medium"
                      fontSize="sm"
                      color="error.300"
                      bg="transparent"
                      _hover={{ bg: 'error.900' }}
                    >
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Button
                as={Link}
                to="/login"
                size="md"
              >
                Sign In
              </Button>
            )}
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}
