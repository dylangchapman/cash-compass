import { Box, Text, Button, VStack, Container } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export default function LoginPrompt({ title, description }) {
  return (
    <Box bg="white" minH="100vh">
      <Box
        bg="neutral.900"
        color="white"
        pt={32}
        pb={40}
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(135deg, neutral.900 0%, neutral.800 100%)"
          opacity="0.6"
        />
        <Container maxW="1400px" position="relative" zIndex="1">
          <VStack align="center" spacing={8} textAlign="center">
            <Box maxW="700px">
              <Text
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="black"
                letterSpacing="tighter"
                lineHeight="tighter"
                mb={6}
              >
                {title}
              </Text>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="neutral.400"
                fontWeight="normal"
                lineHeight="relaxed"
              >
                {description}
              </Text>
            </Box>
            <Button
              as={Link}
              to="/login"
              size="lg"
              bg="white"
              color="neutral.900"
              _hover={{ bg: 'neutral.100' }}
              px={8}
            >
              Sign In to Continue
            </Button>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}
