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
import { MdShield, MdPerson, MdLogout } from 'react-icons/md'

const NavLink = ({ to, children }) => {
  const location = useLocation()
  const isActive = location.pathname === to

  return (
    <ChakraLink
      as={Link}
      to={to}
      px={3}
      py={2}
      fontSize="sm"
      fontWeight="medium"
      color={isActive ? 'neutral.900' : 'neutral.600'}
      borderBottom="2px solid"
      borderColor={isActive ? 'primary.500' : 'transparent'}
      _hover={{
        color: 'neutral.900',
        textDecoration: 'none',
      }}
      transition="all 0.2s"
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
      zIndex={10}
    >
      <Container maxW="container.xl">
        <Flex h={16} align="center" justify="space-between">
          {/* Logo */}
          <HStack spacing={3}>
            <Text fontSize="xl" fontWeight="semibold" color="neutral.900" letterSpacing="tight">
              Financial Coach
            </Text>
            <HStack spacing={1.5} px={2} py={1} bg="neutral.100" borderRadius="sm">
              <Icon as={MdShield} boxSize={3.5} color="neutral.600" />
              <Text fontSize="xs" fontWeight="medium" color="neutral.600">
                Secure
              </Text>
            </HStack>
          </HStack>

          {/* Navigation */}
          <Flex align="center" gap={1}>
            {isLoggedIn ? (
              <>
                <HStack spacing={1} mr={4}>
                  <NavLink to="/">Dashboard</NavLink>
                  <NavLink to="/insights">Insights</NavLink>
                  <NavLink to="/goals">Goals</NavLink>
                  <NavLink to="/subscriptions">Subscriptions</NavLink>
                  <NavLink to="/portfolio">Portfolio</NavLink>
                  <NavLink to="/coach">Coach</NavLink>
                </HStack>

                <Menu>
                  <MenuButton>
                    <Flex align="center" gap={2} px={3} py={2} cursor="pointer">
                      <Avatar size="sm" name={userName} bg="primary.500" />
                      <Text fontSize="sm" fontWeight="medium" color="neutral.700">
                        {userName.split(' ')[0]}
                      </Text>
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    <MenuItem icon={<MdPerson />} as={Link} to="/account">
                      Account Settings
                    </MenuItem>
                    <MenuItem icon={<MdLogout />} onClick={handleLogout}>
                      Sign Out
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <Button
                as={Link}
                to="/login"
                variant="primary"
                size="sm"
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
