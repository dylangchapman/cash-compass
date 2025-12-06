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
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdLightbulb } from 'react-icons/md'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Section from '../components/ui/Section'
import StatusBadge from '../components/ui/StatusBadge'

const TrendIcon = ({ trend }) => {
  const config = {
    increasing: { icon: MdTrendingUp, color: 'error.500' },
    decreasing: { icon: MdTrendingDown, color: 'success.500' },
    stable: { icon: MdTrendingFlat, color: 'neutral.500' },
  }

  const { icon, color } = config[trend] || config.stable

  return <Icon as={icon} color={color} boxSize={5} />
}

export default function SpendingInsights() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    try {
      setLoading(true)
      const result = await financialAPI.getSpendingInsights()
      setInsights(result)
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
        Error loading insights: {error}
      </Alert>
    )
  }

  const analytics = insights?.analytics
  const aiInsights = insights?.ai_insights

  return (
    <Box>
      <PageHeader
        title="Spending Insights"
        description="AI-powered analysis of your spending patterns and trends"
      />

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
                AI Financial Analysis
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

      {/* Category Breakdown */}
      <Section title="Spending by Category" description="Detailed breakdown of your expenses">
        <Grid gap={4}>
          {analytics?.spending_by_category?.map((category, idx) => (
            <Card
              key={idx}
            >
              <CardBody p={5}>
                <HStack justify="space-between" mb={3}>
                  <HStack spacing={3}>
                    <Box
                      w={3}
                      h={3}
                      borderRadius="full"
                      bg={`hsl(${(idx * 360) / analytics.spending_by_category.length}, 70%, 55%)`}
                    />
                    <Text fontWeight="semibold" fontSize="md" color="neutral.900">
                      {category.category}
                    </Text>
                    <TrendIcon trend={category.trend} />
                  </HStack>

                  <StatusBadge status="neutral">
                    {category.percentage?.toFixed(1)}%
                  </StatusBadge>
                </HStack>

                <HStack justify="space-between" align="baseline">
                  <Text fontSize="2xl" fontWeight="semibold" color="neutral.900" letterSpacing="tight">
                    ${category.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>

                  {category.change_percent && (
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color={category.change_percent > 0 ? 'error.600' : 'success.600'}
                    >
                      {category.change_percent > 0 ? '+' : ''}
                      {category.change_percent.toFixed(1)}% from last month
                    </Text>
                  )}
                </HStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      </Section>

      {/* Anomalies */}
      {analytics?.anomalies && analytics.anomalies.length > 0 && (
        <Section
          title="Unusual Transactions"
          description="Significant deviations from your typical spending behavior"
        >
          <Grid gap={4}>
            {analytics.anomalies.map((anomaly, idx) => (
              <Card
                key={idx}
                borderLeft="4px solid"
                borderLeftColor="warning.500"
                bg="warning.50"
              >
                <CardBody p={5}>
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack>
                        <Text fontWeight="semibold" color="neutral.900">
                          {anomaly.merchant}
                        </Text>
                        <StatusBadge status="warning">Unusual</StatusBadge>
                      </HStack>

                      <Text fontSize="sm" color="neutral.600">
                        {anomaly.date} • {anomaly.category}
                      </Text>

                      {anomaly.avg_for_category && (
                        <Text fontSize="sm" color="neutral.600">
                          Avg {anomaly.category}: ${anomaly.avg_for_category.toFixed(2)}
                        </Text>
                      )}

                      {anomaly.note && (
                        <Text fontSize="sm" color="neutral.700" fontStyle="italic">
                          {anomaly.note}
                        </Text>
                      )}
                    </VStack>

                    <Text fontSize="2xl" fontWeight="semibold" color="warning.700" letterSpacing="tight">
                      ${anomaly.amount?.toFixed(2)}
                    </Text>
                  </HStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Section>
      )}
    </Box>
  )
}
