import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react'
import { MdShield, MdDownload, MdPerson, MdSecurity } from 'react-icons/md'
import PageHeader from '../components/layout/PageHeader'

export default function Account() {
  const userName = localStorage.getItem('userName') || 'User'
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com'

  return (
    <Container maxW="container.lg" py={8}>
      <PageHeader
        title="Account Settings"
        description="Manage your profile and security preferences"
      />

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mt={8}>
        {/* Profile Information */}
        <Box
          bg="white"
          p={6}
          borderRadius="md"
          border="1px solid"
          borderColor="neutral.200"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={MdPerson} boxSize={5} color="neutral.700" />
            <Heading size="sm" fontWeight="semibold">
              Profile Information
            </Heading>
          </Flex>
          <VStack align="stretch" spacing={3}>
            <Box>
              <Text fontSize="xs" color="neutral.600" mb={1}>
                Full Name
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {userName}
              </Text>
            </Box>
            <Divider />
            <Box>
              <Text fontSize="xs" color="neutral.600" mb={1}>
                Email Address
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                {userEmail}
              </Text>
            </Box>
            <Divider />
            <Box>
              <Text fontSize="xs" color="neutral.600" mb={1}>
                Account Type
              </Text>
              <Text fontSize="sm" fontWeight="medium">
                Premium
              </Text>
            </Box>
          </VStack>
        </Box>

        {/* Security Settings */}
        <Box
          bg="white"
          p={6}
          borderRadius="md"
          border="1px solid"
          borderColor="neutral.200"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={MdShield} boxSize={5} color="success.500" />
            <Heading size="sm" fontWeight="semibold">
              Security & Privacy
            </Heading>
          </Flex>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" color="neutral.600" lineHeight="tall">
              Your financial data is protected with bank-level encryption. We use
              industry-standard security practices to keep your information safe.
            </Text>
            <Divider />
            <VStack align="stretch" spacing={2}>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  Data Encryption
                </Text>
                <Text fontSize="xs" color="success.600" fontWeight="medium">
                  Active
                </Text>
              </Flex>
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" fontWeight="medium">
                  Two-Factor Auth
                </Text>
                <Text fontSize="xs" color="neutral.500">
                  Enabled
                </Text>
              </Flex>
            </VStack>
          </VStack>
        </Box>

        {/* Data Management */}
        <Box
          bg="white"
          p={6}
          borderRadius="md"
          border="1px solid"
          borderColor="neutral.200"
        >
          <Flex align="center" gap={2} mb={4}>
            <Icon as={MdDownload} boxSize={5} color="neutral.700" />
            <Heading size="sm" fontWeight="semibold">
              Data Management
            </Heading>
          </Flex>
          <VStack align="stretch" spacing={3}>
            <Text fontSize="sm" color="neutral.600">
              Download your financial data or manage your data preferences.
            </Text>
            <VStack align="stretch" spacing={2} pt={2}>
              <Button variant="secondary" size="sm" leftIcon={<MdDownload />}>
                Export Transaction History
              </Button>
              <Button variant="secondary" size="sm" leftIcon={<MdDownload />}>
                Download Portfolio Data
              </Button>
            </VStack>
          </VStack>
        </Box>

        {/* Privacy Notice */}
        <Box
          bg="primary.50"
          p={6}
          borderRadius="md"
          border="1px solid"
          borderColor="primary.200"
        >
          <Flex align="center" gap={2} mb={3}>
            <Icon as={MdSecurity} boxSize={5} color="primary.600" />
            <Heading size="sm" fontWeight="semibold" color="primary.900">
              Privacy Commitment
            </Heading>
          </Flex>
          <VStack align="stretch" spacing={2}>
            <Text fontSize="sm" color="primary.900" lineHeight="tall">
              We never sell your data. Your financial information is used solely to
              provide personalized insights and coaching.
            </Text>
            <Text fontSize="xs" color="primary.700">
              All AI analysis happens securely and your data never leaves our
              encrypted environment.
            </Text>
          </VStack>
        </Box>
      </SimpleGrid>

      {/* Additional Settings */}
      <Box
        bg="white"
        p={6}
        borderRadius="md"
        border="1px solid"
        borderColor="neutral.200"
        mt={6}
      >
        <Heading size="sm" fontWeight="semibold" mb={4}>
          Preferences
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Currency
            </Text>
            <Text fontSize="sm" color="neutral.600">
              USD ($)
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Date Format
            </Text>
            <Text fontSize="sm" color="neutral.600">
              MM/DD/YYYY
            </Text>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={1}>
              Email Notifications
            </Text>
            <Text fontSize="sm" color="neutral.600">
              Weekly Summary
            </Text>
          </Box>
        </SimpleGrid>
      </Box>
    </Container>
  )
}
