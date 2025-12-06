import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { MdShield } from 'react-icons/md'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')

    // Simple validation
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    // For demo purposes - just store that user is logged in
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('userName', 'Dylan Chapman')
    localStorage.setItem('userEmail', email)

    navigate('/')
  }

  return (
    <Box minH="100vh" bg="neutral.50" display="flex" alignItems="center">
      <Container maxW="md">
        <VStack spacing={8}>
          {/* Logo/Header */}
          <VStack spacing={2}>
            <Flex align="center" gap={2}>
              <Text fontSize="2xl" fontWeight="semibold" color="neutral.900">
                Financial Coach
              </Text>
              <Icon as={MdShield} boxSize={6} color="primary.500" />
            </Flex>
            <Text fontSize="sm" color="neutral.600">
              Professional financial guidance powered by AI
            </Text>
          </VStack>

          {/* Login Form */}
          <Box
            bg="white"
            p={8}
            borderRadius="md"
            border="1px solid"
            borderColor="neutral.200"
            width="100%"
            boxShadow="sm"
          >
            <VStack spacing={6} align="stretch">
              <VStack spacing={1} align="start">
                <Heading size="md" fontWeight="semibold">
                  Sign In
                </Heading>
                <Text fontSize="sm" color="neutral.600">
                  Access your financial dashboard
                </Text>
              </VStack>

              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              <form onSubmit={handleLogin}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Email
                    </FormLabel>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      size="lg"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm" fontWeight="medium">
                      Password
                    </FormLabel>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      size="lg"
                    />
                  </FormControl>

                  <Button type="submit" variant="primary" size="lg" width="full" mt={2}>
                    Sign In
                  </Button>
                </VStack>
              </form>

              <Box pt={4} borderTop="1px solid" borderColor="neutral.200">
                <Flex align="center" gap={2} justify="center">
                  <Icon as={MdShield} boxSize={4} color="success.500" />
                  <Text fontSize="xs" color="neutral.600">
                    Your data is encrypted and stored securely
                  </Text>
                </Flex>
              </Box>
            </VStack>
          </Box>

          <Text fontSize="xs" color="neutral.500" textAlign="center" maxW="sm">
            This is a demonstration application. All financial data is synthetic
            and for illustrative purposes only.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}
