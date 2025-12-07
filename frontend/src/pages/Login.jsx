import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  Flex,
  Icon,
  Divider,
  HStack,
} from '@chakra-ui/react'
import { MdLock } from 'react-icons/md'
import { financialAPI } from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setIsLoading(true)

    try {
      const result = await financialAPI.login(email, password)

      if (result.success) {
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('userName', result.user.name)
        localStorage.setItem('userEmail', result.user.email)
        navigate('/dashboard')
      } else {
        setError(result.message || 'Invalid email or password')
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password || !name) {
      setError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      const result = await financialAPI.register(email, password, name)

      if (result.success) {
        setSuccess('Account created successfully! You can now sign in.')
        setShowRegister(false)
        setPassword('')
        setConfirmPassword('')
      } else {
        setError(result.message || 'Failed to create account')
      }
    } catch (err) {
      setError('Unable to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = (e) => {
    e.preventDefault()
    if (!email) {
      setError('Please enter your email address')
      return
    }
    setResetEmailSent(true)
    setShowForgotPassword(false)
  }

  const resetForm = () => {
    setError('')
    setSuccess('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <Box minH="100vh" bg="neutral.50" display="flex" alignItems="center">
      <Container maxW="md" py={12}>
        <VStack spacing={8}>
          {/* Logo/Header */}
          <VStack spacing={2}>
            <Text fontSize="2xl" fontWeight="black" color="neutral.900" letterSpacing="tighter">
              Financial Coach
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Secure financial guidance powered by AI
            </Text>
          </VStack>

          {/* Login/Register Form */}
          <Box
            bg="white"
            p={8}
            borderRadius="8px"
            border="2px solid"
            borderColor="neutral.200"
            width="100%"
          >
            <VStack spacing={6} align="stretch">
              <VStack spacing={1} align="start">
                <Text fontSize="xl" fontWeight="bold" color="neutral.900">
                  {showRegister ? 'Create Account' : showForgotPassword ? 'Reset Password' : 'Sign In'}
                </Text>
                <Text fontSize="sm" color="neutral.600">
                  {showRegister
                    ? 'Enter your details to create a new account'
                    : showForgotPassword
                    ? 'Enter your email to receive a password reset link'
                    : 'Access your financial dashboard'
                  }
                </Text>
              </VStack>

              {error && (
                <Alert status="error" borderRadius="6px">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {success && (
                <Alert status="success" borderRadius="6px">
                  <AlertIcon />
                  {success}
                </Alert>
              )}

              {resetEmailSent && (
                <Alert status="success" borderRadius="6px">
                  <AlertIcon />
                  Password reset instructions have been sent to your email.
                </Alert>
              )}

              {showRegister ? (
                /* Register Form */
                <form onSubmit={handleRegister}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Full Name
                      </FormLabel>
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Email Address
                      </FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Password
                      </FormLabel>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Confirm Password
                      </FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <Button type="submit" size="lg" width="full" mt={2} isLoading={isLoading}>
                      Create Account
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowRegister(false)
                        resetForm()
                      }}
                      color="neutral.600"
                    >
                      Already have an account? Sign In
                    </Button>
                  </VStack>
                </form>
              ) : showForgotPassword ? (
                /* Forgot Password Form */
                <form onSubmit={handleForgotPassword}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Email Address
                      </FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <Button type="submit" size="lg" width="full">
                      Send Reset Link
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowForgotPassword(false)
                        resetForm()
                      }}
                      color="neutral.600"
                    >
                      Back to Sign In
                    </Button>
                  </VStack>
                </form>
              ) : (
                /* Login Form */
                <form onSubmit={handleLogin}>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900">
                        Email Address
                      </FormLabel>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <Flex justify="space-between" align="center" mb={1}>
                        <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.900" mb={0}>
                          Password
                        </FormLabel>
                        <Button
                          variant="link"
                          size="xs"
                          color="neutral.600"
                          fontWeight="medium"
                          onClick={() => {
                            setShowForgotPassword(true)
                            resetForm()
                          }}
                        >
                          Forgot password?
                        </Button>
                      </Flex>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <Button type="submit" size="lg" width="full" mt={2} isLoading={isLoading}>
                      Sign In
                    </Button>

                    <Divider />

                    <Button
                      variant="secondary"
                      size="lg"
                      width="full"
                      onClick={() => {
                        setShowRegister(true)
                        resetForm()
                      }}
                    >
                      Create New Account
                    </Button>
                  </VStack>
                </form>
              )}

              <Divider />

              {/* Security Notice */}
              <Flex align="center" gap={2} justify="center">
                <Icon as={MdLock} boxSize={4} color="neutral.500" />
                <Text fontSize="xs" color="neutral.600">
                  256-bit encryption protects your data
                </Text>
              </Flex>
            </VStack>
          </Box>

          {/* Legal Links */}
          <VStack spacing={3}>
            <Text fontSize="xs" color="neutral.500" textAlign="center">
              By signing in, you agree to our{' '}
              <Text as={Link} to="/terms" color="neutral.700" fontWeight="medium" textDecoration="underline">
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text as={Link} to="/privacy" color="neutral.700" fontWeight="medium" textDecoration="underline">
                Privacy Policy
              </Text>
            </Text>

            <Text fontSize="xs" color="neutral.400" textAlign="center" maxW="sm">
              This is a demonstration application. All financial data shown is synthetic
              and for illustrative purposes only.
            </Text>
          </VStack>

          {/* Footer Links */}
          <HStack spacing={6} pt={4}>
            <Text as={Link} to="/privacy" fontSize="xs" color="neutral.500" _hover={{ color: 'neutral.700' }}>
              Privacy Policy
            </Text>
            <Text as={Link} to="/terms" fontSize="xs" color="neutral.500" _hover={{ color: 'neutral.700' }}>
              Terms of Service
            </Text>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}
