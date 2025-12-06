import { Box, Container, Text, HStack, VStack, Icon, SimpleGrid, Link as ChakraLink, Divider } from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import { MdShield, MdLock, MdPrivacyTip } from 'react-icons/md'

export default function Footer() {
  return (
    <Box
      as="footer"
      bg="white"
      borderTop="1px solid"
      borderColor="neutral.200"
      py={12}
      mt={16}
    >
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8} mb={8}>
          {/* Brand */}
          <VStack align="start" spacing={3}>
            <HStack spacing={2}>
              <Text fontSize="lg" fontWeight="semibold" color="neutral.900">
                Financial Coach
              </Text>
              <Icon as={MdShield} boxSize={5} color="primary.500" />
            </HStack>
            <Text fontSize="sm" color="neutral.600" lineHeight="tall">
              Professional financial guidance powered by AI
            </Text>
          </VStack>

          {/* Product */}
          <VStack align="start" spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="neutral.900" textTransform="uppercase" letterSpacing="wide">
              Product
            </Text>
            <ChakraLink as={Link} to="/" fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Dashboard
            </ChakraLink>
            <ChakraLink as={Link} to="/goals" fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Goals
            </ChakraLink>
            <ChakraLink as={Link} to="/portfolio" fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Portfolio
            </ChakraLink>
            <ChakraLink as={Link} to="/coach" fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              AI Coach
            </ChakraLink>
          </VStack>

          {/* Resources */}
          <VStack align="start" spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="neutral.900" textTransform="uppercase" letterSpacing="wide">
              Resources
            </Text>
            <ChakraLink fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Documentation
            </ChakraLink>
            <ChakraLink fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Support
            </ChakraLink>
            <ChakraLink fontSize="sm" color="neutral.600" _hover={{ color: 'primary.500' }}>
              Contact
            </ChakraLink>
          </VStack>

          {/* Security & Privacy */}
          <VStack align="start" spacing={3}>
            <Text fontSize="sm" fontWeight="semibold" color="neutral.900" textTransform="uppercase" letterSpacing="wide">
              Security
            </Text>
            <HStack spacing={2}>
              <Icon as={MdLock} boxSize={4} color="success.500" />
              <Text fontSize="sm" color="neutral.600">
                Bank-level encryption
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Icon as={MdPrivacyTip} boxSize={4} color="success.500" />
              <Text fontSize="sm" color="neutral.600">
                Data privacy guaranteed
              </Text>
            </HStack>
            <Text fontSize="xs" color="neutral.500" lineHeight="tall" mt={2}>
              Your data is encrypted at rest and in transit. We never share your information.
            </Text>
          </VStack>
        </SimpleGrid>

        <Divider mb={6} />

        <HStack justify="space-between" align="center" flexWrap="wrap">
          <Text fontSize="xs" color="neutral.500">
            © 2025 Financial Coach. Demo application for case study purposes.
          </Text>
          <HStack spacing={6}>
            <ChakraLink fontSize="xs" color="neutral.500" _hover={{ color: 'primary.500' }}>
              Privacy Policy
            </ChakraLink>
            <ChakraLink fontSize="xs" color="neutral.500" _hover={{ color: 'primary.500' }}>
              Terms of Service
            </ChakraLink>
          </HStack>
        </HStack>
      </Container>
    </Box>
  )
}
