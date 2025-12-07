import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Spinner,
  Icon,
  useToast,
  Container,
  Flex,
  InputGroup,
  InputRightElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@chakra-ui/react'
import { MdSend, MdInfo, MdDelete, MdWarning } from 'react-icons/md'
import { financialAPI } from '../services/api'
import LoginPrompt from '../components/LoginPrompt'

const SUGGESTED_QUESTIONS = [
  "How can I save more money?",
  "What's my biggest spending problem?",
  "Am I spending too much on subscriptions?",
  "Help me create a budget",
  "How can I reduce my grocery spending?",
  "What should I invest my cash in?",
  "How can I improve my credit score?",
  "What financial goals should I set?",
  "What are some tips for paying off debt?",
  "How can I plan for retirement?",
]

const CACHE_KEY = 'cached_coach_messages'
const DEFAULT_MESSAGE = {
  role: 'assistant',
  content: "Hello. I've analyzed your spending patterns and am ready to provide personalized financial guidance. How can I assist you today?",
  timestamp: new Date().toISOString(),
}

// Helper to safely get cached messages
const getCachedMessages = () => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const messages = JSON.parse(cached)
      // Convert timestamp strings back to Date objects
      return messages.map(m => ({ ...m, timestamp: new Date(m.timestamp) }))
    }
  } catch {
    // Ignore errors
  }
  return [{ ...DEFAULT_MESSAGE, timestamp: new Date() }]
}

// Helper to cache messages
const cacheMessages = (messages) => {
  try {
    // Convert Date objects to strings for storage
    const toCache = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }))
    localStorage.setItem(CACHE_KEY, JSON.stringify(toCache))
  } catch {
    // Ignore storage errors
  }
}

export default function Coach() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const [messages, setMessages] = useState(() => getCachedMessages())
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const toast = useToast()
  const clearHistoryModal = useDisclosure()

  if (!isLoggedIn) {
    return (
      <LoginPrompt
        title="Financial Coach"
        description="Sign in to chat with your AI-powered financial coach and get personalized advice based on your spending patterns."
      />
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Scroll to bottom and cache messages when they change
  useEffect(() => {
    scrollToBottom()
    cacheMessages(messages)
  }, [messages])

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage

    if (!textToSend.trim()) {
      toast({
        title: 'Empty message',
        status: 'warning',
        duration: 2000,
      })
      return
    }

    const userMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await financialAPI.chatWithCoach(textToSend)

      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        suggestions: response.suggestions,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to get response from coach',
        status: 'error',
        duration: 5000,
      })

      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const useSuggestedQuestion = (question) => {
    sendMessage(question)
  }

  const handleClearHistory = () => {
    const clearedMessages = [
      {
        role: 'assistant',
        content: "Chat history cleared. How can I help you today?",
        timestamp: new Date(),
      }
    ]
    setMessages(clearedMessages)
    // Clear the cache
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // Ignore errors
    }
    clearHistoryModal.onClose()
    toast({
      title: 'Chat history cleared',
      status: 'success',
      duration: 2000,
    })
  }

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION */}
      <Box bg="neutral.900" color="white" pt={32} pb={20}>
        <Container maxW="1400px">
          <VStack align="start" spacing={8}>
            <Box>
              <Text
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="black"
                letterSpacing="tighter"
                lineHeight="none"
                mb={4}
              >
                Financial Coach
              </Text>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="neutral.400"
                fontWeight="normal"
                maxW="700px"
              >
                Get personalized advice based on your spending patterns and financial goals
              </Text>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* AI DISCLAIMER */}
      <Box bg="neutral.100" py={4} borderBottom="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <HStack spacing={3} justify="center">
            <Icon as={MdInfo} boxSize={5} color="neutral.600" />
            <Text fontSize="sm" color="neutral.700">
              This AI assistant analyzes your transaction data to provide guidance.
              Conversations are stored to improve responses.
              This is not licensed financial advice - consult a professional for investment decisions.
            </Text>
          </HStack>
        </Container>
      </Box>

      {/* SUGGESTED QUESTIONS */}
      <Box bg="white" py={8} borderBottom="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="sm" fontWeight="semibold" color="neutral.600" textTransform="uppercase" letterSpacing="wider">
              Suggested Questions
            </Text>
            <Button
              size="sm"
              variant="ghost"
              color="neutral.600"
              leftIcon={<MdDelete />}
              onClick={clearHistoryModal.onOpen}
            >
              Clear History
            </Button>
          </Flex>
          <Flex gap={3} flexWrap="wrap">
            {SUGGESTED_QUESTIONS.map((question, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="secondary"
                onClick={() => useSuggestedQuestion(question)}
                fontWeight="medium"
              >
                {question}
              </Button>
            ))}
          </Flex>
        </Container>
      </Box>

      {/* CHAT INTERFACE */}
      <Box py={12}>
        <Container maxW="1200px">
          <Box
            bg="white"
            border="2px solid"
            borderColor="neutral.200"
            borderRadius="8px"
            h="600px"
            display="flex"
            flexDirection="column"
            overflow="hidden"
          >
            {/* Messages Area */}
            <Box
              flex="1"
              overflowY="auto"
              p={8}
              css={{
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#fafafa',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#d4d4d8',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a1a1aa',
                },
              }}
            >
              <VStack spacing={8} align="stretch">
                {messages.map((message, idx) => (
                  <MessageBlock key={idx} message={message} />
                ))}

                {isLoading && (
                  <HStack spacing={3} py={4}>
                    <Spinner size="sm" color="neutral.900" />
                    <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                      Analyzing your data...
                    </Text>
                  </HStack>
                )}

                <div ref={messagesEndRef} />
              </VStack>
            </Box>

            {/* Input Area */}
            <Box
              p={6}
              borderTop="2px solid"
              borderColor="neutral.200"
              bg="neutral.50"
            >
              <InputGroup size="lg">
                <Input
                  placeholder="Ask your financial coach anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isLoading}
                  bg="white"
                  color="neutral.900"
                  fontSize="md"
                  h="56px"
                  pr="120px"
                />
                <InputRightElement width="110px" h="56px">
                  <Button
                    onClick={() => sendMessage()}
                    isLoading={isLoading}
                    size="md"
                    leftIcon={<MdSend />}
                    h="40px"
                  >
                    Send
                  </Button>
                </InputRightElement>
              </InputGroup>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Clear History Modal */}
      <Modal isOpen={clearHistoryModal.isOpen} onClose={clearHistoryModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent
          bg="neutral.900"
          border="2px solid"
          borderColor="neutral.600"
          borderRadius="8px"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.5)"
        >
          <ModalHeader color="white" borderBottom="1px solid" borderColor="neutral.700" pb={4}>
            Clear Chat History
          </ModalHeader>
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3}>
                <Icon as={MdWarning} boxSize={6} color="warning.400" />
                <Text fontWeight="semibold" color="white">This will delete all messages</Text>
              </HStack>
              <Text color="neutral.200">
                Your conversation history will be permanently deleted. This action cannot be undone.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="neutral.700" pt={4}>
            <Button
              variant="ghost"
              mr={3}
              onClick={clearHistoryModal.onClose}
              color="neutral.200"
              _hover={{ bg: 'neutral.700', color: 'white' }}
            >
              Cancel
            </Button>
            <Button bg="error.600" color="white" _hover={{ bg: 'error.500' }} onClick={handleClearHistory}>
              Clear History
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// Message Block Component
function MessageBlock({ message }) {
  const isAssistant = message.role === 'assistant'

  if (isAssistant) {
    return (
      <Box>
        <HStack spacing={3} mb={3} align="center">
          <Box
            w="32px"
            h="32px"
            bg="neutral.900"
            borderRadius="6px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="xs" fontWeight="bold" color="white">AI</Text>
          </Box>
          <Text fontSize="sm" fontWeight="bold" color="neutral.900">
            Financial Coach
          </Text>
          <Text fontSize="xs" color="neutral.500">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </HStack>

        <Box pl="44px">
          <Text
            fontSize="md"
            color="neutral.800"
            lineHeight="1.7"
            whiteSpace="pre-wrap"
          >
            {message.content}
          </Text>

          {message.suggestions && message.suggestions.length > 0 && (
            <VStack align="stretch" spacing={2} mt={6}>
              <Text fontSize="xs" fontWeight="bold" color="neutral.600" textTransform="uppercase" letterSpacing="wider">
                Key Takeaways
              </Text>
              {message.suggestions.map((suggestion, sidx) => (
                <Box
                  key={sidx}
                  bg="neutral.100"
                  px={4}
                  py={3}
                  borderRadius="6px"
                  borderLeft="3px solid"
                  borderLeftColor="neutral.900"
                >
                  <Text fontSize="sm" color="neutral.900" fontWeight="medium">
                    {suggestion}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </Box>
      </Box>
    )
  }

  // User message
  return (
    <Box>
      <HStack spacing={3} mb={3} align="center" justify="flex-end">
        <Text fontSize="xs" color="neutral.500">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="neutral.900">
          You
        </Text>
        <Box
          w="32px"
          h="32px"
          bg="neutral.600"
          borderRadius="6px"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text fontSize="sm" fontWeight="bold" color="white">
            U
          </Text>
        </Box>
      </HStack>

      <Box pr="44px">
        <Text
          fontSize="md"
          color="neutral.800"
          lineHeight="1.7"
          textAlign="right"
        >
          {message.content}
        </Text>
      </Box>
    </Box>
  )
}
