import {
  Box,
  Container,
  Text,
  VStack,
  Heading,
  Divider,
} from '@chakra-ui/react'

export default function TermsOfService() {
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
            Terms of Service
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
            <PolicySection title="Agreement to Terms">
              <Text>
                By accessing or using Financial Coach, you agree to be bound by these Terms of Service.
                If you do not agree to these terms, do not use the service.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Description of Service">
              <Text>
                Financial Coach provides AI-powered financial analysis, insights, and guidance based on
                transaction data and portfolio information you provide. The service includes spending
                analysis, goal tracking, subscription management, and interactive coaching.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Important Disclaimers">
              <Box bg="warning.50" border="2px solid" borderColor="warning.300" borderRadius="8px" p={6}>
                <Text fontWeight="bold" color="warning.800" mb={3}>
                  Not Financial Advice
                </Text>
                <Text color="warning.900">
                  Financial Coach is an educational and informational tool. It does not provide licensed
                  financial, investment, tax, or legal advice. The AI coach is not a registered financial
                  advisor. Always consult qualified professionals before making financial decisions.
                </Text>
              </Box>
              <Text mt={4}>
                We do not guarantee the accuracy, completeness, or timeliness of any information provided.
                Investment decisions based on information from this service are made at your own risk.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="User Responsibilities">
              <VStack align="stretch" spacing={3}>
                <Text>1. Provide accurate and complete information when using the service</Text>
                <Text>2. Maintain the security of your account credentials</Text>
                <Text>3. Use the service only for lawful purposes</Text>
                <Text>4. Not attempt to reverse engineer or compromise the service</Text>
                <Text>5. Not use automated systems to access the service without permission</Text>
              </VStack>
            </PolicySection>

            <Divider />

            <PolicySection title="Account Terms">
              <Text mb={4}>
                You must provide a valid email address to create an account. You are responsible for all
                activity that occurs under your account. Notify us immediately if you suspect unauthorized
                access.
              </Text>
              <Text>
                We reserve the right to suspend or terminate accounts that violate these terms or are
                inactive for extended periods.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Intellectual Property">
              <Text>
                All content, features, and functionality of Financial Coach are owned by us and protected
                by intellectual property laws. You may not copy, modify, distribute, or create derivative
                works without explicit permission.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Data and Privacy">
              <Text>
                Your use of Financial Coach is also governed by our Privacy Policy, which describes how
                we collect, use, and protect your data. By using the service, you consent to our data
                practices as described in the Privacy Policy.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Limitation of Liability">
              <Text>
                To the maximum extent permitted by law, Financial Coach and its operators shall not be
                liable for any indirect, incidental, special, consequential, or punitive damages, or any
                loss of profits or revenues, whether incurred directly or indirectly, or any loss of data,
                use, goodwill, or other intangible losses.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Service Modifications">
              <Text>
                We reserve the right to modify, suspend, or discontinue the service at any time without
                notice. We may also update these terms periodically. Continued use of the service after
                changes constitutes acceptance of the modified terms.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Termination">
              <Text>
                You may terminate your account at any time through Account Settings. Upon termination,
                your right to use the service ceases immediately. We may retain certain data as required
                by law or for legitimate business purposes as described in our Privacy Policy.
              </Text>
            </PolicySection>

            <Divider />

            <PolicySection title="Contact">
              <Text>
                For questions about these Terms of Service, contact us at legal@financialcoach.com.
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
