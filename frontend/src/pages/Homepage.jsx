import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Text,
  Button,
  Grid,
  VStack,
  HStack,
  Icon,
  Flex,
  Divider,
} from '@chakra-ui/react'
import {
  MdTrendingUp,
  MdSavings,
  MdAccountBalance,
  MdInsights,
  MdArrowForward,
  MdLock,
} from 'react-icons/md'

export default function Homepage() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION */}
      <Box
        bg="neutral.900"
        color="white"
        pt={{ base: 24, md: 32 }}
        pb={{ base: 32, md: 48 }}
        position="relative"
        overflow="hidden"
      >
        {/* Subtle gradient overlay */}
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
          <VStack spacing={12} align="center" textAlign="center">
            {/* Main headline */}
            <Box maxW="1100px">
              <Text
                fontSize={{ base: '5xl', md: '6xl', lg: '7xl' }}
                fontWeight="black"
                letterSpacing="tighter"
                lineHeight="tighter"
                mb={8}
              >
                Your AI-powered financial coach
              </Text>
              <Text
                fontSize={{ base: 'xl', md: '2xl' }}
                color="neutral.400"
                fontWeight="normal"
                lineHeight="relaxed"
                maxW="900px"
                mx="auto"
                mb={12}
              >
                Smart insights, personalized guidance, and powerful tools to help you take control of your financial future
              </Text>

              {/* CTA Buttons */}
              <HStack spacing={6} justify="center">
                <Button
                  as={Link}
                  to={isLoggedIn ? "/dashboard" : "/login"}
                  size="lg"
                  fontSize="lg"
                  px={12}
                  py={8}
                  rightIcon={<MdArrowForward />}
                >
                  {isLoggedIn ? "Go to Dashboard" : "Get Started"}
                </Button>
                <Button
                  as={Link}
                  to="/coach"
                  size="lg"
                  variant="secondary"
                  fontSize="lg"
                  px={12}
                  py={8}
                >
                  Talk to Coach
                </Button>
              </HStack>
            </Box>

            {/* Stats Row */}
            <Grid
              templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
              gap={12}
              w="full"
              pt={16}
              borderTop="1px solid"
              borderColor="neutral.700"
            >
              <StatBlock number="AI-Powered" label="Intelligent insights" />
              <StatBlock number="Real-time" label="Portfolio tracking" />
              <StatBlock number="Smart" label="Goal planning" />
              <StatBlock number="24/7" label="Financial coach" />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box py={24} bg="white">
        <Container maxW="1400px">
          <Box textAlign="center" mb={16}>
            <Text
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="black"
              color="neutral.900"
              letterSpacing="tighter"
              mb={4}
            >
              Everything you need to master your money
            </Text>
            <Text fontSize="xl" color="neutral.600" maxW="700px" mx="auto">
              Comprehensive financial tools powered by artificial intelligence
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
            <FeatureCard
              icon={MdInsights}
              title="Spending Insights"
              description="AI-powered analysis of your spending patterns, trends, and anomalies to help you make smarter decisions"
              link="/insights"
            />
            <FeatureCard
              icon={MdSavings}
              title="Goal Tracking"
              description="Set financial goals, track progress, and get personalized recommendations to achieve your targets faster"
              link="/goals"
            />
            <FeatureCard
              icon={MdAccountBalance}
              title="Portfolio Manager"
              description="Real-time portfolio tracking with performance metrics, allocation analysis, and net worth monitoring"
              link="/portfolio"
            />
            <FeatureCard
              icon={MdInsights}
              title="AI Coach"
              description="Interactive financial coach available 24/7 to answer questions and provide personalized guidance"
              link="/coach"
            />
            <FeatureCard
              icon={MdTrendingUp}
              title="Smart Subscriptions"
              description="Automatically detect recurring charges, identify gray charges, and get recommendations to optimize spending"
              link="/subscriptions"
            />
            <FeatureCard
              icon={MdTrendingUp}
              title="Compound Interest Calculator"
              description="Visualize the power of compound interest and see how your savings can grow over time"
              link="/goals"
            />
          </Grid>
        </Container>
      </Box>

      {/* HOW IT WORKS SECTION */}
      <Box py={24} bg="neutral.50">
        <Container maxW="1400px">
          <Box textAlign="center" mb={16}>
            <Text
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="black"
              color="neutral.900"
              letterSpacing="tighter"
              mb={4}
            >
              Simple, powerful, effective
            </Text>
            <Text fontSize="xl" color="neutral.600" maxW="700px" mx="auto">
              Get started in minutes and transform your financial life
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={12}>
            <StepCard
              number="1"
              title="Connect your data"
              description="Upload your transaction history and investment portfolio to get started"
            />
            <StepCard
              number="2"
              title="Get insights"
              description="AI analyzes your spending, identifies patterns, and provides actionable recommendations"
            />
            <StepCard
              number="3"
              title="Take action"
              description="Set goals, track progress, and chat with your AI coach to stay on track"
            />
          </Grid>
        </Container>
      </Box>

      {/* CTA SECTION */}
      <Box py={24} bg="neutral.900" color="white">
        <Container maxW="1400px">
          <Box textAlign="center">
            <Text
              fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
              fontWeight="black"
              letterSpacing="tighter"
              mb={6}
            >
              Ready to take control?
            </Text>
            <Text fontSize="xl" color="neutral.400" mb={12} maxW="700px" mx="auto">
              Start building your financial future today with AI-powered coaching
            </Text>
            <Button
              as={Link}
              to={isLoggedIn ? "/dashboard" : "/login"}
              size="lg"
              fontSize="xl"
              px={16}
              py={10}
              rightIcon={<MdArrowForward />}
            >
              {isLoggedIn ? "Go to Dashboard" : "Get Started Now"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box py={12} bg="neutral.50" borderTop="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <VStack spacing={8}>
            {/* Security Badge */}
            <HStack spacing={3} justify="center">
              <Icon as={MdLock} boxSize={5} color="neutral.600" />
              <Text fontSize="sm" color="neutral.600">
                Bank-level 256-bit encryption protects your data
              </Text>
            </HStack>

            <Divider />

            {/* Links */}
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              w="full"
              gap={6}
            >
              <Text fontSize="sm" color="neutral.600">
                Financial Coach. All rights reserved.
              </Text>

              <HStack spacing={8}>
                <Text as={Link} to="/privacy" fontSize="sm" color="neutral.600" _hover={{ color: 'neutral.900' }}>
                  Privacy Policy
                </Text>
                <Text as={Link} to="/terms" fontSize="sm" color="neutral.600" _hover={{ color: 'neutral.900' }}>
                  Terms of Service
                </Text>
                <Text as={Link} to="/account" fontSize="sm" color="neutral.600" _hover={{ color: 'neutral.900' }}>
                  Account Settings
                </Text>
              </HStack>
            </Flex>

            {/* Disclaimer */}
            <Text fontSize="xs" color="neutral.500" textAlign="center" maxW="800px">
              This application provides educational financial information and is not a substitute for professional financial advice.
              Consult a licensed financial advisor before making investment decisions.
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  )
}

// Stat Block Component
function StatBlock({ number, label }) {
  return (
    <Box textAlign="center">
      <Text fontSize="3xl" fontWeight="black" letterSpacing="tighter" mb={2}>
        {number}
      </Text>
      <Text fontSize="sm" color="neutral.500" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
    </Box>
  )
}

// Feature Card Component
function FeatureCard({ icon, title, description, link }) {
  return (
    <Box
      as={Link}
      to={link}
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      p={8}
      transition="all 0.2s"
      _hover={{
        borderColor: 'neutral.900',
        transform: 'translateY(-4px)',
      }}
      display="block"
      textDecoration="none"
    >
      <Icon as={icon} boxSize={12} color="neutral.900" mb={4} />
      <Text fontSize="2xl" fontWeight="bold" color="neutral.900" mb={3} letterSpacing="tight">
        {title}
      </Text>
      <Text fontSize="md" color="neutral.700" lineHeight="1.7">
        {description}
      </Text>
    </Box>
  )
}

// Step Card Component
function StepCard({ number, title, description }) {
  return (
    <Box textAlign="center">
      <Box
        w={20}
        h={20}
        bg="neutral.900"
        color="white"
        borderRadius="8px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        mx="auto"
        mb={6}
      >
        <Text fontSize="4xl" fontWeight="black">
          {number}
        </Text>
      </Box>
      <Text fontSize="2xl" fontWeight="bold" color="neutral.900" mb={3} letterSpacing="tight">
        {title}
      </Text>
      <Text fontSize="md" color="neutral.700" lineHeight="1.7">
        {description}
      </Text>
    </Box>
  )
}
