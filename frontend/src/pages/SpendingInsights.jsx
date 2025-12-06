import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Button,
  useToast,
} from '@chakra-ui/react'
import { MdTrendingUp, MdTrendingDown, MdTrendingFlat, MdLightbulb, MdChevronRight, MdFlag, MdCheckCircle, MdWarning } from 'react-icons/md'
import { financialAPI } from '../services/api'
import StatusBadge from '../components/ui/StatusBadge'

const DEFAULT_GOALS = [
  { goal_name: 'Monthly Spending Limit', target: 2500, category: null },
  { goal_name: 'Groceries Budget', target: 400, category: 'Groceries' },
  { goal_name: 'Dining Out Budget', target: 150, category: 'Restaurants' },
]

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
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)

  // Goal analysis state
  const [analyzing, setAnalyzing] = useState(false)
  const [goalResults, setGoalResults] = useState(null)
  const [goalAiInsights, setGoalAiInsights] = useState(null)

  useEffect(() => {
    loadInsights()
  }, [])

  const analyzeGoals = async () => {
    try {
      setAnalyzing(true)
      const result = await financialAPI.analyzeGoals(DEFAULT_GOALS)
      setGoalResults(result.goals)
      setGoalAiInsights(result.ai_insights)
    } catch (err) {
      toast({ title: 'Error analyzing goals', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setAnalyzing(false)
    }
  }

  const handleCategoryClick = (category) => {
    navigate(`/transactions?category=${encodeURIComponent(category)}`)
  }

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
        <Spinner size="xl" color="neutral.900" thickness="3px" />
      </Center>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="8px">
        <AlertIcon />
        Error loading insights: {error}
      </Alert>
    )
  }

  const analytics = insights?.analytics
  const aiInsights = insights?.ai_insights

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="1400px">
          <Text
            fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
            fontWeight="black"
            letterSpacing="tighter"
            mb={4}
          >
            Spending Insights
          </Text>
          <Text fontSize="xl" color="neutral.400">
            AI-powered analysis of your spending patterns and trends
          </Text>
        </Container>
      </Box>

      {/* AI Insights */}
      <Box py={12} bg="neutral.50">
        <Container maxW="1400px">
          <Box
            bg="white"
            border="2px solid"
            borderColor="neutral.900"
            borderRadius="8px"
            overflow="hidden"
          >
            <Box bg="neutral.900" p={6}>
              <HStack spacing={3}>
                <Icon as={MdLightbulb} boxSize={6} color="white" />
                <Text fontSize="lg" fontWeight="bold" color="white">
                  AI Financial Analysis
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

      {/* Goal Progress Section */}
      <Box py={16} bg="white" borderTop="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <Box mb={8}>
            <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
              <Box>
                <Text
                  fontSize={{ base: '3xl', md: '4xl' }}
                  fontWeight="black"
                  color="neutral.900"
                  letterSpacing="tighter"
                  mb={3}
                >
                  Goal Progress
                </Text>
                <Text fontSize="lg" color="neutral.600">
                  Track your spending against your budget goals
                </Text>
              </Box>
              <Button
                onClick={analyzeGoals}
                isLoading={analyzing}
                loadingText="Analyzing..."
                size="lg"
                leftIcon={<MdFlag />}
              >
                Analyze Progress
              </Button>
            </HStack>
          </Box>

          {/* Goal Cards */}
          {goalResults && goalResults.length > 0 ? (
            <VStack spacing={6} align="stretch">
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
                {goalResults.map((result, idx) => {
                  const onTrack = result.status === 'on-track'
                  return (
                    <Box
                      key={idx}
                      p={6}
                      border="2px solid"
                      borderColor={onTrack ? 'success.500' : 'error.500'}
                      borderRadius="8px"
                      bg={onTrack ? 'success.50' : 'error.50'}
                    >
                      <HStack justify="space-between" mb={4}>
                        <Box>
                          <Text fontSize="lg" fontWeight="bold" color="neutral.900">{result.goal_name}</Text>
                          <HStack spacing={2} mt={1}>
                            <Icon as={onTrack ? MdCheckCircle : MdWarning} color={onTrack ? 'success.600' : 'error.600'} />
                            <Text fontSize="sm" fontWeight="bold" color={onTrack ? 'success.700' : 'error.700'}>
                              {onTrack ? 'On Track' : 'Over Budget'}
                            </Text>
                          </HStack>
                        </Box>
                        <Text fontSize="2xl" fontWeight="black" color="neutral.900">
                          {result.progress_percent?.toFixed(0)}%
                        </Text>
                      </HStack>
                      <Grid templateColumns="repeat(2, 1fr)" gap={4} mb={4}>
                        <Box>
                          <Text fontSize="xs" color="neutral.500" textTransform="uppercase" fontWeight="bold">Target</Text>
                          <Text fontSize="xl" fontWeight="bold" color="neutral.900">${result.target?.toFixed(0)}</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.500" textTransform="uppercase" fontWeight="bold">Current</Text>
                          <Text fontSize="xl" fontWeight="bold" color="neutral.900">${result.current?.toFixed(0)}</Text>
                        </Box>
                      </Grid>
                      <Box bg="neutral.200" h="8px" borderRadius="4px" overflow="hidden">
                        <Box
                          bg={onTrack ? 'success.500' : 'error.500'}
                          h="full"
                          w={`${Math.min(result.progress_percent, 100)}%`}
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Grid>

              {/* AI Goal Insights */}
              {goalAiInsights && (
                <Box
                  bg="neutral.900"
                  color="white"
                  p={6}
                  borderRadius="8px"
                  mt={4}
                >
                  <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" letterSpacing="wide" color="neutral.400" mb={3}>
                    Coach's Analysis
                  </Text>
                  <Text whiteSpace="pre-wrap" lineHeight="1.7">{goalAiInsights}</Text>
                </Box>
              )}
            </VStack>
          ) : (
            <Box
              py={12}
              textAlign="center"
              border="2px dashed"
              borderColor="neutral.200"
              borderRadius="8px"
            >
              <Icon as={MdFlag} boxSize={12} color="neutral.300" mb={4} />
              <Text fontSize="lg" fontWeight="semibold" color="neutral.600" mb={2}>
                Click "Analyze Progress" to see your goal status
              </Text>
              <Text fontSize="sm" color="neutral.500">
                Your goals: Monthly spending, Groceries, and Dining budgets
              </Text>
            </Box>
          )}
        </Container>
      </Box>

      {/* Category Breakdown */}
      <Box py={16} bg="white">
        <Container maxW="1400px">
          <Box mb={12}>
            <Text
              fontSize={{ base: '3xl', md: '4xl' }}
              fontWeight="black"
              color="neutral.900"
              letterSpacing="tighter"
              mb={3}
            >
              Spending by Category
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Click any category to view all transactions
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
            {analytics?.spending_by_category?.map((category, idx) => (
              <Box
                key={idx}
                bg="white"
                border="2px solid"
                borderColor="neutral.200"
                borderRadius="8px"
                p={6}
                cursor="pointer"
                transition="all 0.2s"
                _hover={{
                  borderColor: 'neutral.900',
                  transform: 'translateY(-2px)',
                  shadow: 'lg',
                }}
                onClick={() => handleCategoryClick(category.category)}
              >
                <HStack justify="space-between" mb={4}>
                  <HStack spacing={3}>
                    <Box
                      w={4}
                      h={4}
                      borderRadius="4px"
                      bg={`hsl(${(idx * 360) / analytics.spending_by_category.length}, 70%, 55%)`}
                    />
                    <Text fontWeight="bold" fontSize="lg" color="neutral.900">
                      {category.category}
                    </Text>
                  </HStack>
                  <Icon as={MdChevronRight} boxSize={6} color="neutral.400" />
                </HStack>

                <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tight" mb={2}>
                  ${category.total?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>

                <HStack justify="space-between" align="center">
                  <HStack spacing={2}>
                    <TrendIcon trend={category.trend} />
                    {category.change_percent && (
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color={category.change_percent > 0 ? 'error.600' : 'success.600'}
                      >
                        {category.change_percent > 0 ? '+' : ''}
                        {category.change_percent.toFixed(1)}%
                      </Text>
                    )}
                  </HStack>
                  <StatusBadge status="neutral">
                    {category.percentage?.toFixed(1)}% of total
                  </StatusBadge>
                </HStack>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Anomalies */}
      {analytics?.anomalies && analytics.anomalies.length > 0 && (
        <Box py={16} bg="neutral.50" borderTop="1px solid" borderColor="neutral.200">
          <Container maxW="1400px">
            <Box mb={12}>
              <Text
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="black"
                color="neutral.900"
                letterSpacing="tighter"
                mb={3}
              >
                Unusual Transactions
              </Text>
              <Text fontSize="lg" color="neutral.600">
                Significant deviations from your typical spending behavior
              </Text>
            </Box>

            <Grid gap={4}>
              {analytics.anomalies.map((anomaly, idx) => (
                <Box
                  key={idx}
                  bg="white"
                  border="2px solid"
                  borderColor="warning.300"
                  borderRadius="8px"
                  p={6}
                  cursor="pointer"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'warning.500',
                    shadow: 'md',
                  }}
                  onClick={() => handleCategoryClick(anomaly.category)}
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2} flex={1}>
                      <HStack>
                        <Text fontWeight="bold" fontSize="lg" color="neutral.900">
                          {anomaly.merchant}
                        </Text>
                        <StatusBadge status="warning">Unusual</StatusBadge>
                      </HStack>

                      <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                        {anomaly.date} in {anomaly.category}
                      </Text>

                      {anomaly.avg_for_category && (
                        <Text fontSize="sm" color="neutral.500">
                          Category average: ${anomaly.avg_for_category.toFixed(2)}
                        </Text>
                      )}

                      {anomaly.note && (
                        <Text fontSize="sm" color="neutral.700" fontStyle="italic">
                          {anomaly.note}
                        </Text>
                      )}
                    </VStack>

                    <Text fontSize="3xl" fontWeight="black" color="warning.600" letterSpacing="tight">
                      ${anomaly.amount?.toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </Grid>
          </Container>
        </Box>
      )}
    </Box>
  )
}
