import { useState, useRef, useEffect } from 'react'
import {
  Box,
  Text,
  Input,
  Button,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Icon,
  useToast,
  Wrap,
  WrapItem,
  Container,
} from '@chakra-ui/react'
import { Card, CardBody } from '@chakra-ui/react'
import { MdSend, MdSecurity } from 'react-icons/md'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Section from '../components/ui/Section'
import StatusBadge from '../components/ui/StatusBadge'

const SUGGESTED_QUESTIONS = [
  "How can I save more money?",
  "What's my biggest spending problem?",
  "Am I spending too much on subscriptions?",
  "Help me create a budget",
  "How can I reduce my grocery spending?",
  "What should I invest my cash in?"
]

export default function Coach() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello. I've analyzed your spending patterns and am ready to provide personalized financial guidance. How can I assist you today?",
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const toast = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage

    if (!textToSend.trim()) {
      toast({
        title: 'Empty message',
        description: 'Please enter a message',
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

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-br, primary.600, purple.800)"
        color="white"
        py={16}
        mb={12}
        borderRadius="md"
      >
        <Container maxW="container.xl">
          <VStack align="start" spacing={6}>
            <Box>
              <Text fontSize="5xl" fontWeight="bold" letterSpacing="tight" lineHeight="1.1">
                Financial Coach
              </Text>
              <Text fontSize="xl" mt={3} opacity={0.9}>
                Get personalized financial advice powered by AI
              </Text>
            </Box>

            <HStack spacing={3} bg="whiteAlpha.200" px={4} py={3} borderRadius="md">
              <Icon as={MdSecurity} boxSize={5} />
              <Text fontSize="sm" opacity={0.95}>
                Your conversations are private and secure. All data is encrypted.
              </Text>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Suggested Questions */}
      <Box bg="neutral.50" py={12} mb={12}>
        <Container maxW="container.xl">
          <Box mb={6}>
            <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
              Quick Start
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Try these common questions to get started
            </Text>
          </Box>

          <Wrap spacing={3}>
            {SUGGESTED_QUESTIONS.map((question, idx) => (
              <WrapItem key={idx}>
                <Button
                  size="md"
                  variant="secondary"
                  onClick={() => useSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              </WrapItem>
            ))}
          </Wrap>
        </Container>
      </Box>

      {/* Chat Messages */}
      <Box bg="white" py={12}>
        <Container maxW="container.xl">
          <Box
            h="650px"
            bg="neutral.50"
            borderRadius="md"
            border="1px solid"
            borderColor="neutral.200"
            display="flex"
            flexDirection="column"
          >
            <Box
              flex="1"
              overflowY="auto"
              display="flex"
              flexDirection="column"
              gap={6}
              p={8}
              bg="white"
            >
            {messages.map((message, idx) => (
              <Box key={idx}>
                {message.role === 'assistant' ? (
                  <HStack align="start" spacing={4}>
                    <Avatar
                      size="sm"
                      bg="primary.500"
                      color="white"
                      name="FC"
                    />
                    <VStack align="start" spacing={3} flex={1} maxW="85%">
                      <Box
                        bg="neutral.100"
                        px={5}
                        py={4}
                        borderRadius="md"
                        borderTopLeftRadius="sm"
                      >
                        <Text color="neutral.900" lineHeight="tall" fontSize="md">
                          {message.content}
                        </Text>
                      </Box>

                      {message.suggestions && message.suggestions.length > 0 && (
                        <VStack align="start" spacing={2} pl={2}>
                          <Text fontSize="xs" fontWeight="semibold" color="neutral.600" textTransform="uppercase" letterSpacing="wide">
                            Key Takeaways
                          </Text>
                          {message.suggestions.map((suggestion, sidx) => (
                            <StatusBadge key={sidx} status="info">
                              {suggestion}
                            </StatusBadge>
                          ))}
                        </VStack>
                      )}

                      <Text fontSize="xs" color="neutral.500" pl={2}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </VStack>
                  </HStack>
                ) : (
                  <HStack align="start" spacing={4} justify="flex-end">
                    <VStack align="end" spacing={2} flex={1} maxW="85%">
                      <Box
                        bg="primary.500"
                        color="white"
                        px={5}
                        py={4}
                        borderRadius="md"
                        borderTopRightRadius="sm"
                      >
                        <Text lineHeight="tall" fontSize="md">
                          {message.content}
                        </Text>
                      </Box>
                      <Text fontSize="xs" color="neutral.500" pr={2}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </VStack>
                    <Avatar
                      size="sm"
                      bg="neutral.600"
                      color="white"
                      name="You"
                    />
                  </HStack>
                )}
              </Box>
            ))}

            {isLoading && (
              <HStack align="start" spacing={4}>
                <Avatar size="sm" bg="primary.500" color="white" name="FC" />
                <Box bg="neutral.100" px={5} py={4} borderRadius="md" borderTopLeftRadius="sm">
                  <HStack spacing={2}>
                    <Spinner size="sm" color="primary.500" />
                    <Text color="neutral.600" fontSize="md">
                      Analyzing...
                    </Text>
                  </HStack>
                </Box>
              </HStack>
            )}

              <div ref={messagesEndRef} />
            </Box>

            {/* Input Area */}
            <Box
              p={6}
              borderTop="1px solid"
              borderColor="neutral.200"
              bg="white"
            >
            <HStack spacing={3}>
              <Input
                placeholder="Ask your financial coach anything..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                size="lg"
                bg="white"
                _focus={{
                  borderColor: 'primary.500',
                  boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
                }}
              />
              <Button
                onClick={() => sendMessage()}
                isLoading={isLoading}
                loadingText="Sending"
                size="lg"
                leftIcon={<MdSend />}
                px={8}
              >
                Send
              </Button>
            </HStack>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
