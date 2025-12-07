import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Grid,
  VStack,
  HStack,
  Icon,
  Container,
  Flex,
  Tooltip,
} from '@chakra-ui/react'
import { MdWarning, MdInsights, MdCheckCircle, MdHelpOutline } from 'react-icons/md'
import { financialAPI } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'
import LoginPrompt from '../components/LoginPrompt'

export default function Subscriptions() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (isLoggedIn) {
      loadSubscriptions()
    } else {
      setLoading(false)
    }
  }, [isLoggedIn])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const result = await financialAPI.getSubscriptionInsights()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="neutral.900" thickness="3px" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="8px">
        <AlertIcon />
        Error loading subscriptions: {error}
      </Alert>
    )
  }

  if (!isLoggedIn) {
    return (
      <LoginPrompt
        title="Subscription Manager"
        description="Sign in to track and optimize all your recurring charges, identify unused subscriptions, and find potential savings."
      />
    )
  }

  const subscriptions = data?.subscriptions || []
  const aiInsights = data?.ai_insights
  const grayCharges = subscriptions.filter(sub => sub.is_gray_charge)

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION */}
      <Box bg="neutral.900" color="white" pt={32} pb={40}>
        <Container maxW="1400px">
          <VStack align="start" spacing={12}>
            <Box>
              <Text
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="black"
                letterSpacing="tighter"
                lineHeight="tighter"
                mb={6}
              >
                Subscription Manager
              </Text>
              <Text fontSize="xl" color="neutral.400" fontWeight="normal" maxW="700px">
                Track and optimize all your recurring charges in one place
              </Text>
            </Box>

            {/* Key metrics grid */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={12}
              w="full"
              pt={8}
              borderTop="1px solid"
              borderColor="neutral.700"
            >
              <MetricBlock
                label="Active Subscriptions"
                value={subscriptions.length}
                sublabel="Detected recurring charges"
              />
              <MetricBlock
                label="Monthly Cost"
                value={`$${data?.total_monthly?.toFixed(2)}`}
                sublabel="Total per month"
              />
              <MetricBlock
                label="Potential Issues"
                value={data?.gray_charges_detected || 0}
                sublabel={grayCharges.length > 0 ? 'Review recommended' : 'All clear'}
                icon={grayCharges.length > 0 ? MdWarning : MdCheckCircle}
                iconColor={grayCharges.length > 0 ? 'warning.400' : 'success.400'}
                tooltip="Gray charges are recurring payments you may have forgotten about or no longer use—like free trials that converted to paid, unused memberships, or services you signed up for once and forgot."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* AI INSIGHTS */}
      {aiInsights && (
        <Box py={24} bg="white">
          <Container maxW="1400px">
            <Box
              bg="white"
              border="2px solid"
              borderColor="neutral.900"
              borderRadius="8px"
              overflow="hidden"
            >
              <Box bg="neutral.900" color="white" p={6}>
                <HStack spacing={3}>
                  <Icon as={MdInsights} boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold">
                    Analysis & Recommendations
                  </Text>
                </HStack>
              </Box>
              <Box p={8}>
                <Text
                  whiteSpace="pre-wrap"
                  lineHeight="1.8"
                  color="neutral.800"
                  fontSize="md"
                >
                  {aiInsights}
                </Text>
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      {/* GRAY CHARGES WARNING */}
      {grayCharges.length > 0 && (
        <Box py={24} bg="warning.50" borderTop="2px solid" borderColor="warning.200">
          <Container maxW="1400px">
            <Box
              bg="white"
              border="2px solid"
              borderColor="warning.600"
              borderRadius="8px"
              p={8}
            >
              <HStack spacing={4} mb={4}>
                <Icon as={MdWarning} boxSize={8} color="warning.600" />
                <Box>
                  <HStack spacing={2} mb={1}>
                    <Text fontSize="2xl" fontWeight="black" color="neutral.900">
                      Potential Gray Charges Detected
                    </Text>
                    <Tooltip
                      label="Gray charges are sneaky recurring fees that often go unnoticed—expired free trials, forgotten memberships, or duplicate services. We flag these based on keywords in your transaction notes like 'trial', 'protection plan', or 'suspicious'."
                      placement="top"
                      hasArrow
                      bg="neutral.900"
                      color="white"
                      px={4}
                      py={3}
                      borderRadius="8px"
                      fontSize="sm"
                      maxW="320px"
                    >
                      <Box as="span" cursor="help">
                        <Icon as={MdHelpOutline} boxSize={5} color="warning.600" />
                      </Box>
                    </Tooltip>
                  </HStack>
                  <Text fontSize="md" color="neutral.700">
                    We found {grayCharges.length} subscription(s) that may be unwanted or forgotten charges
                  </Text>
                </Box>
              </HStack>
            </Box>
          </Container>
        </Box>
      )}

      {/* SUBSCRIPTIONS LIST */}
      <Box py={24} bg={grayCharges.length > 0 ? 'white' : 'neutral.50'}>
        <Container maxW="1400px">
          <Box mb={12}>
            <Text fontSize="4xl" fontWeight="black" color="neutral.900" letterSpacing="tighter" mb={3}>
              Your subscriptions
            </Text>
            <Text fontSize="lg" color="neutral.600">
              All recurring charges detected in your transactions
            </Text>
          </Box>

          <Grid gap={4}>
            {subscriptions.map((sub, idx) => (
              <Box
                key={idx}
                bg="white"
                border="2px solid"
                borderColor={sub.is_gray_charge ? 'warning.600' : 'neutral.200'}
                borderRadius="8px"
                overflow="hidden"
                transition="all 0.2s"
                _hover={{
                  borderColor: sub.is_gray_charge ? 'warning.700' : 'neutral.400',
                  transform: 'translateY(-2px)',
                }}
              >
                {/* Header with merchant and badges */}
                <Box
                  bg={sub.is_gray_charge ? 'warning.100' : 'neutral.50'}
                  p={6}
                  borderBottom="2px solid"
                  borderColor={sub.is_gray_charge ? 'warning.600' : 'neutral.200'}
                >
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <HStack spacing={3} mb={2}>
                        <Text fontSize="xl" fontWeight="bold" color="neutral.900">
                          {sub.merchant}
                        </Text>
                        {sub.is_gray_charge && (
                          <Tooltip
                            label="This charge was flagged because it may be a forgotten subscription, expired free trial, or unwanted recurring fee. Review to confirm if you still need this service."
                            placement="top"
                            hasArrow
                            bg="neutral.900"
                            color="white"
                            px={4}
                            py={3}
                            borderRadius="8px"
                            fontSize="sm"
                            maxW="280px"
                          >
                            <Box as="span">
                              <StatusBadge status="warning">Potential Gray Charge</StatusBadge>
                            </Box>
                          </Tooltip>
                        )}
                        <Tooltip
                          label={
                            sub.confidence === 'high'
                              ? "High confidence: This merchant charged the same amount 5+ times, strongly indicating a subscription."
                              : sub.confidence === 'medium'
                              ? "Medium confidence: This merchant charged similar amounts 3-4 times, likely a subscription."
                              : "Low confidence: This merchant has recurring charges but the pattern is less consistent."
                          }
                          placement="top"
                          hasArrow
                          bg="neutral.900"
                          color="white"
                          px={4}
                          py={3}
                          borderRadius="8px"
                          fontSize="sm"
                          maxW="280px"
                        >
                          <Box as="span">
                            <StatusBadge status={sub.confidence === 'high' ? 'success' : 'neutral'}>
                              {sub.confidence} confidence
                            </StatusBadge>
                          </Box>
                        </Tooltip>
                      </HStack>
                      <Text fontSize="sm" color="neutral.600" textTransform="capitalize" fontWeight="medium">
                        {sub.frequency} billing
                      </Text>
                    </Box>

                    <Box textAlign="right">
                      <Text fontSize="4xl" fontWeight="black" color="neutral.900" letterSpacing="tighter">
                        ${sub.amount?.toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                        per {sub.frequency === 'monthly' ? 'month' : 'charge'}
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {/* Details */}
                <Box p={6}>
                  <Grid templateColumns="repeat(3, 1fr)" gap={8}>
                    <Box>
                      <Text fontSize="xs" color="neutral.500" mb={2} textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                        Last Charged
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="neutral.900">
                        {sub.last_charge}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.500" mb={2} textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                        Monthly Cost
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="neutral.900">
                        ${sub.frequency === 'monthly' ? sub.amount?.toFixed(2) : (sub.amount * 12)?.toFixed(2)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.500" mb={2} textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                        YTD Total
                      </Text>
                      <Text fontSize="md" fontWeight="semibold" color="neutral.900">
                        ${sub.total_spent?.toFixed(2)}
                      </Text>
                    </Box>
                  </Grid>
                </Box>
              </Box>
            ))}

            {subscriptions.length === 0 && (
              <Box
                py={20}
                textAlign="center"
                border="2px dashed"
                borderColor="neutral.300"
                borderRadius="8px"
              >
                <Icon as={MdCheckCircle} boxSize={16} color="neutral.300" mb={4} />
                <Text color="neutral.600" fontWeight="semibold" fontSize="lg" mb={2}>
                  No recurring subscriptions detected
                </Text>
                <Text color="neutral.500" fontSize="sm">
                  We'll notify you if any recurring charges appear
                </Text>
              </Box>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

// Metric Block Component
function MetricBlock({ label, value, sublabel, icon, iconColor, tooltip }) {
  return (
    <Box>
      <HStack spacing={2} mb={3}>
        <Text
          fontSize="xs"
          fontWeight="semibold"
          textTransform="uppercase"
          letterSpacing="wider"
          color="neutral.500"
        >
          {label}
        </Text>
        {tooltip && (
          <Tooltip
            label={tooltip}
            placement="top"
            hasArrow
            bg="neutral.800"
            color="white"
            px={4}
            py={3}
            borderRadius="8px"
            fontSize="sm"
            maxW="300px"
          >
            <Box as="span" cursor="help">
              <Icon as={MdHelpOutline} boxSize={4} color="neutral.500" />
            </Box>
          </Tooltip>
        )}
      </HStack>
      <HStack spacing={3} align="baseline">
        <Text
          fontSize={{ base: '3xl', md: '4xl' }}
          fontWeight="black"
          letterSpacing="tighter"
          lineHeight="none"
        >
          {value}
        </Text>
        {icon && (
          <Icon
            as={icon}
            boxSize={8}
            color={iconColor}
          />
        )}
      </HStack>
      <Text fontSize="sm" color="neutral.400" mt={2} fontWeight="medium">
        {sublabel}
      </Text>
    </Box>
  )
}
