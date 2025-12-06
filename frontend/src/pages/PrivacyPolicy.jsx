import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Divider,
} from '@chakra-ui/react'

export default function PrivacyPolicy() {
  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="900px">
          <Text
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="black"
            letterSpacing="tighter"
            mb={4}
          >
            Privacy Policy
          </Text>
          <Text fontSize="md" color="neutral.400">
            Last updated: December 2024
          </Text>
        </Container>
      </Box>

      {/* Content */}
      <Box py={16}>
        <Container maxW="900px">
          <VStack spacing={12} align="stretch">
            <PolicySection title="Overview">
              <Text>
                Financial Coach is committed to protecting your privacy. This policy explains what data we collect,
                how we use it, and your rights regarding your personal information.
              </Text>
              <Text>
                We collect only the data necessary to provide personalized financial guidance. We never sell your
                personal or financial data to third parties.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Data We Collect">
              <Text fontWeight="semibold" mb={2}>Account Information</Text>
              <Text mb={4}>
                Email address and name for account identification and communication.
              </Text>

              <Text fontWeight="semibold" mb={2}>Financial Data</Text>
              <Text mb={4}>
                Transaction history, spending categories, and portfolio holdings that you upload or connect.
                This data is used solely to provide personalized insights and coaching.
              </Text>

              <Text fontWeight="semibold" mb={2}>Usage Data</Text>
              <Text>
                Interactions with the application including chat history with the AI coach, goals you set,
                and features you use. This helps us improve the service.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="How We Use Your Data">
              <VStack align="stretch" spacing={3}>
                <Text>1. Provide personalized financial insights and recommendations</Text>
                <Text>2. Power the AI coach to answer your financial questions</Text>
                <Text>3. Track your goals and monitor progress</Text>
                <Text>4. Detect unusual spending patterns and subscription charges</Text>
                <Text>5. Improve our service and develop new features</Text>
              </VStack>
            </PolicySection>

            <Divider />

            <PolicySection title="Data Security">
              <Text mb={4}>
                Your data is protected with industry-standard encryption both in transit (TLS 1.3) and at rest
                (AES-256). We implement strict access controls and regular security audits.
              </Text>
              <Text>
                Financial data is processed in secure, isolated environments. AI analysis occurs within our
                encrypted infrastructure and your data is never shared with third-party AI providers in
                identifiable form.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Data Retention">
              <Text mb={4}>
                We retain your data for as long as your account is active. You can delete specific data
                (such as chat history) or your entire account at any time from Account Settings.
              </Text>
              <Text>
                When you delete your account, all personal data is permanently removed within 30 days.
                Anonymized, aggregated data may be retained for service improvement.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Your Rights">
              <VStack align="stretch" spacing={3}>
                <Text><strong>Access:</strong> View all data we hold about you</Text>
                <Text><strong>Export:</strong> Download your data in standard formats (CSV, JSON)</Text>
                <Text><strong>Delete:</strong> Remove specific data or your entire account</Text>
                <Text><strong>Correct:</strong> Update inaccurate information</Text>
                <Text><strong>Object:</strong> Opt out of certain data processing activities</Text>
              </VStack>
            </PolicySection>

            <Divider />

            <PolicySection title="Third-Party Services">
              <Text mb={4}>
                We use select third-party services to operate Financial Coach:
              </Text>
              <VStack align="stretch" spacing={2}>
                <Text>- Cloud infrastructure providers for secure data storage</Text>
                <Text>- AI services for natural language processing (data is anonymized)</Text>
                <Text>- Analytics services to understand usage patterns (no personal data shared)</Text>
              </VStack>
            </PolicySection>

            <Divider />

            <PolicySection title="Contact">
              <Text>
                For privacy-related questions or to exercise your data rights, contact us at privacy@financialcoach.com
                or through the Account Settings page.
              </Text>
            </PolicySection>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

function PolicySection({ title, children }) {
  return (
    <Box>
      <Heading as="h2" size="lg" fontWeight="bold" mb={4} color="neutral.900">
        {title}
      </Heading>
      <VStack align="stretch" spacing={4} color="neutral.700" lineHeight="1.8">
        {children}
      </VStack>
    </Box>
  )
}
