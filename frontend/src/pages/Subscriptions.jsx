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
} from '@chakra-ui/react'
import { Card, CardHeader, CardBody } from '@chakra-ui/react'
import { MdWarning, MdLightbulb, MdCheckCircle } from 'react-icons/md'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Section from '../components/ui/Section'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'

export default function Subscriptions() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadSubscriptions()
  }, [])

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
      <Center h="400px">
        <Spinner size="xl" color="primary.500" thickness="3px" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Error loading subscriptions: {error}
      </Alert>
    )
  }

  const subscriptions = data?.subscriptions || []
  const aiInsights = data?.ai_insights
  const grayCharges = subscriptions.filter(sub => sub.is_gray_charge)

  return (
    <Box>
      <PageHeader
        title="Subscription Manager"
        description="Track and manage all your recurring charges in one place"
      />

      {/* Summary Metrics */}
      <Section>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
          <MetricCard
            label="Active Subscriptions"
            value={subscriptions.length}
            change="Detected recurring charges"
          />

          <MetricCard
            label="Monthly Cost"
            value={`$${data?.total_monthly?.toFixed(2)}`}
            valueColor="error.600"
            change="Total per month"
          />

          <MetricCard
            label="Potential Issues"
            value={data?.gray_charges_detected || 0}
            valueColor={grayCharges.length > 0 ? 'warning.600' : 'success.600'}
            change={grayCharges.length > 0 ? 'Review recommended' : 'All clear'}
            icon={grayCharges.length > 0 ? MdWarning : MdCheckCircle}
          />
        </Grid>
      </Section>

      {/* AI Insights */}
      <Section>
        <Card
          bg="primary.50"
          borderColor="primary.200"
          borderWidth="1px"
        >
          <CardHeader borderBottom="1px solid" borderColor="primary.200" pb={4}>
            <HStack>
              <Icon as={MdLightbulb} boxSize={5} color="primary.600" />
              <Text fontSize="md" fontWeight="semibold" color="primary.900">
                Subscription Analysis
              </Text>
            </HStack>
          </CardHeader>
          <CardBody pt={6}>
            <Text
              whiteSpace="pre-wrap"
              lineHeight="tall"
              color="primary.900"
              fontSize="md"
            >
              {aiInsights}
            </Text>
          </CardBody>
        </Card>
      </Section>

      {/* Gray Charges Warning */}
      {grayCharges.length > 0 && (
        <Alert
          status="warning"
          borderRadius="md"
          mb={8}
          py={4}
        >
          <AlertIcon />
          <Box>
            <Text fontWeight="semibold" mb={1}>
              Potential Gray Charges Detected
            </Text>
            <Text fontSize="sm">
              We found {grayCharges.length} subscription(s) that may be unwanted or forgotten charges. Review them carefully below.
            </Text>
          </Box>
        </Alert>
      )}

      {/* Subscriptions List */}
      <Section title="Your Subscriptions" description="All recurring charges detected in your transactions">
        <Grid gap={4}>
          {subscriptions.map((sub, idx) => (
            <Card
              key={idx}
              borderLeft="4px solid"
              borderLeftColor={sub.is_gray_charge ? 'warning.600' : 'primary.500'}
              bg={sub.is_gray_charge ? 'warning.100' : 'white'}
            >
              <CardBody p={5}>
                <HStack justify="space-between" mb={4}>
                  <VStack align="start" spacing={2}>
                    <HStack spacing={3}>
                      <Text fontWeight="semibold" fontSize="lg" color="black">
                        {sub.merchant}
                      </Text>
                      {sub.is_gray_charge && (
                        <StatusBadge status="warning">Potential Gray Charge</StatusBadge>
                      )}
                      <StatusBadge status={sub.confidence === 'high' ? 'success' : 'neutral'}>
                        {sub.confidence} confidence
                      </StatusBadge>
                    </HStack>

                    <Text fontSize="sm" color="neutral.700" textTransform="capitalize" fontWeight="medium">
                      {sub.frequency} billing
                    </Text>
                  </VStack>

                  <VStack align="end" spacing={0}>
                    <Text fontSize="3xl" fontWeight="semibold" color="neutral.900" letterSpacing="tight">
                      ${sub.amount?.toFixed(2)}
                    </Text>
                    <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide">
                      per {sub.frequency === 'monthly' ? 'month' : 'charge'}
                    </Text>
                  </VStack>
                </HStack>

                <Grid templateColumns="repeat(3, 1fr)" gap={6} pt={4} borderTop="1px solid" borderColor="neutral.200">
                  <Box>
                    <Text fontSize="xs" color="neutral.500" mb={1} textTransform="uppercase" letterSpacing="wide">
                      Last Charged
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                      {sub.last_charge}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="neutral.500" mb={1} textTransform="uppercase" letterSpacing="wide">
                      Monthly Cost
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                      ${sub.frequency === 'monthly' ? sub.amount?.toFixed(2) : (sub.amount * 12)?.toFixed(2)}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="neutral.500" mb={1} textTransform="uppercase" letterSpacing="wide">
                      YTD Total
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="neutral.900">
                      ${sub.total_spent?.toFixed(2)}
                    </Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>
          ))}

          {subscriptions.length === 0 && (
            <Card>
              <CardBody py={12}>
                <Center>
                  <VStack spacing={2}>
                    <Icon as={MdCheckCircle} boxSize={12} color="neutral.300" />
                    <Text color="neutral.500" fontWeight="medium">
                      No recurring subscriptions detected
                    </Text>
                    <Text color="neutral.400" fontSize="sm">
                      We'll notify you if any recurring charges appear
                    </Text>
                  </VStack>
                </Center>
              </CardBody>
            </Card>
          )}
        </Grid>
      </Section>
    </Box>
  )
}
