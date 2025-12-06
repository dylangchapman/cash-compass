import { useState, useEffect } from 'react'
import {
  Box,
  Text,
  Button,
  Input,
  Select,
  FormControl,
  FormLabel,
  Grid,
  Progress,
  HStack,
  VStack,
  Icon,
  useToast,
  Spinner,
  Center,
  Container,
} from '@chakra-ui/react'
import { Card, CardHeader, CardBody } from '@chakra-ui/react'
import { MdAdd, MdClose, MdLightbulb, MdCheckCircle, MdWarning, MdTrendingUp, MdAccountBalance } from 'react-icons/md'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Section from '../components/ui/Section'
import StatusBadge from '../components/ui/StatusBadge'
import MetricCard from '../components/ui/MetricCard'

const DEFAULT_GOALS = [
  { goal_name: 'Monthly Spending Limit', target: 2500, category: null },
  { goal_name: 'Groceries Budget', target: 400, category: 'Groceries' },
  { goal_name: 'Dining Out Budget', target: 150, category: 'Restaurants' },
]

const DEFAULT_NET_WORTH_GOAL = 50000

export default function Goals() {
  const [analyzing, setAnalyzing] = useState(false)
  const [goalResults, setGoalResults] = useState(null)
  const [aiInsights, setAiInsights] = useState(null)
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [netWorth, setNetWorth] = useState(null)
  const [netWorthGoal, setNetWorthGoal] = useState(DEFAULT_NET_WORTH_GOAL)
  const [netWorthProgress, setNetWorthProgress] = useState(null)
  const [loadingNetWorth, setLoadingNetWorth] = useState(true)
  const [newGoal, setNewGoal] = useState({
    goal_name: '',
    target: '',
    category: '',
  })

  const toast = useToast()

  useEffect(() => {
    loadNetWorth()
  }, [])

  const loadNetWorth = async () => {
    try {
      setLoadingNetWorth(true)
      const nw = await financialAPI.getNetWorth()
      setNetWorth(nw)

      const progress = await financialAPI.analyzeNetWorthGoal(netWorthGoal)
      setNetWorthProgress(progress)
    } catch (err) {
      console.error('Error loading net worth:', err)
    } finally {
      setLoadingNetWorth(false)
    }
  }

  const updateNetWorthGoal = async (newGoalAmount) => {
    try {
      setNetWorthGoal(newGoalAmount)
      const progress = await financialAPI.analyzeNetWorthGoal(newGoalAmount)
      setNetWorthProgress(progress)
    } catch (err) {
      toast({
        title: 'Error updating goal',
        description: err.message,
        status: 'error',
        duration: 5000,
      })
    }
  }

  const analyzeGoals = async () => {
    if (goals.length === 0) {
      toast({
        title: 'No goals set',
        description: 'Please add at least one goal to analyze',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    try {
      setAnalyzing(true)
      const result = await financialAPI.analyzeGoals(goals)
      setGoalResults(result.goals)
      setAiInsights(result.ai_insights)
    } catch (err) {
      toast({
        title: 'Error analyzing goals',
        description: err.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const addGoal = () => {
    if (!newGoal.goal_name || !newGoal.target) {
      toast({
        title: 'Missing information',
        description: 'Please enter goal name and target amount',
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const goal = {
      goal_name: newGoal.goal_name,
      target: parseFloat(newGoal.target),
      category: newGoal.category || null,
    }

    setGoals([...goals, goal])
    setNewGoal({ goal_name: '', target: '', category: '' })

    toast({
      title: 'Goal added',
      status: 'success',
      duration: 2000,
    })
  }

  const removeGoal = (index) => {
    setGoals(goals.filter((_, idx) => idx !== index))
  }

  const getStatusColor = (status) => {
    return status === 'on-track' ? 'success' : 'error'
  }

  const getProgressColor = (percent) => {
    if (percent <= 80) return 'success'
    if (percent <= 100) return 'warning'
    return 'error'
  }

  return (
    <Box>
      {loadingNetWorth ? (
        <Center py={20}>
          <Spinner size="xl" color="primary.500" thickness="3px" />
        </Center>
      ) : (
        <>
          {/* Hero Section - Net Worth Goal */}
          <Box
            bgGradient={netWorthProgress?.on_track ? "linear(to-br, primary.600, primary.800)" : "linear(to-br, neutral.700, neutral.900)"}
            color="white"
            py={16}
            mb={12}
            borderRadius="md"
          >
            <Container maxW="container.xl">
              <VStack align="start" spacing={8}>
                <Box>
                  <Text fontSize="5xl" fontWeight="bold" letterSpacing="tight" lineHeight="1.1">
                    ${netWorth?.total_net_worth?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                  <Text fontSize="2xl" mt={3} opacity={0.9}>
                    Net Worth Goal
                  </Text>
                  <HStack spacing={4} mt={2}>
                    <Icon
                      as={netWorthProgress?.on_track ? MdCheckCircle : MdWarning}
                      boxSize={6}
                    />
                    <Text fontSize="lg" fontWeight="semibold">
                      {netWorthProgress?.on_track ? 'Excellent Progress' : 'Building Momentum'}
                    </Text>
                  </HStack>
                </Box>

                {/* Progress Stats */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} w="full">
                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                      Goal Target
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                      ${netWorthGoal.toLocaleString('en-US')}
                    </Text>
                    <Text fontSize="sm" opacity={0.8} mt={1}>
                      {netWorthProgress?.progress_percent?.toFixed(1)}% complete
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                      Remaining
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                      ${netWorthProgress?.remaining?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text fontSize="sm" opacity={0.8} mt={1}>
                      {netWorthProgress?.months_to_goal > 0 && `~${Math.ceil(netWorthProgress.months_to_goal)} months`}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                      Portfolio
                    </Text>
                    <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                      ${netWorth?.portfolio_value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text fontSize="sm" opacity={0.8} mt={1}>
                      {netWorth?.portfolio_percent?.toFixed(1)}% of net worth
                    </Text>
                  </Box>
                </Grid>

                {/* Progress Bar */}
                <Box w="full">
                  <Progress
                    value={netWorthProgress?.progress_percent}
                    colorScheme="whiteAlpha"
                    size="lg"
                    borderRadius="full"
                    bg="whiteAlpha.300"
                  />
                </Box>
              </VStack>
            </Container>
          </Box>

          {/* Milestones Section */}
          <Box bg="white" py={12} mb={12}>
            <Container maxW="container.xl">
              <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={8}>
                Milestones
              </Text>

              <Grid templateColumns="repeat(5, 1fr)" gap={6}>
                {netWorthProgress?.milestones_achieved && [25, 50, 75, 90, 100].map((pct) => {
                  const achieved = netWorthProgress.milestones_achieved.some(m => m.percent === pct)
                  const isCurrent = netWorthProgress.next_milestone?.percent === pct

                  return (
                    <VStack key={pct} spacing={3}>
                      <Box
                        w={16}
                        h={16}
                        borderRadius="md"
                        bg={achieved ? 'success.500' : isCurrent ? 'primary.500' : 'neutral.200'}
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        {achieved ? (
                          <Icon as={MdCheckCircle} boxSize={8} color="white" />
                        ) : (
                          <Text fontWeight="bold" color={isCurrent ? 'white' : 'neutral.500'} fontSize="lg">
                            {pct}%
                          </Text>
                        )}
                      </Box>
                      <Text fontSize="sm" color="neutral.600" textAlign="center" fontWeight="semibold">
                        {pct}% Goal
                      </Text>
                    </VStack>
                  )
                })}
              </Grid>

              {/* Update Goal */}
              <Box mt={12} pt={8} borderTop="1px solid" borderColor="neutral.200">
                <Text fontSize="xl" fontWeight="semibold" color="neutral.900" mb={4}>
                  Adjust Your Goal
                </Text>
                <HStack maxW="md">
                  <Input
                    type="number"
                    value={netWorthGoal}
                    onChange={(e) => setNetWorthGoal(Number(e.target.value))}
                    placeholder="Enter goal amount"
                    size="lg"
                  />
                  <Button onClick={() => updateNetWorthGoal(netWorthGoal)} size="lg">
                    Update
                  </Button>
                </HStack>
              </Box>
            </Container>
          </Box>
        </>
      )}

      {/* Add New Goal */}
      <Box bg="neutral.50" py={12} mb={12}>
        <Container maxW="container.xl">
          <Box mb={8}>
            <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
              Set a New Goal
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Create monthly spending targets by category
            </Text>
          </Box>

          <Box bg="white" p={8} borderRadius="md" border="1px solid" borderColor="neutral.200">
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.700">
                  Goal Name
                </FormLabel>
                <Input
                  placeholder="e.g., Coffee Budget"
                  value={newGoal.goal_name}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.700">
                  Monthly Target ($)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  size="lg"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.700">
                  Category (Optional)
                </FormLabel>
                <Select
                  placeholder="All spending"
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                  size="lg"
                >
                  <option value="Groceries">Groceries</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Coffee">Coffee</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Utilities">Utilities</option>
                </Select>
              </FormControl>
            </Grid>

            <Button leftIcon={<MdAdd />} onClick={addGoal} size="lg">
              Add Goal
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Current Goals */}
      <Section title={`Your Goals (${goals.length})`} description="Track all your financial targets">
        <Card>
          <CardHeader borderBottom="1px solid" borderColor="neutral.200" pb={4}>
            <HStack justify="space-between">
              <Text fontSize="md" fontWeight="semibold" color="neutral.900">
                Active Goals
              </Text>
              <Button
                onClick={analyzeGoals}
                isLoading={analyzing}
                loadingText="Analyzing..."
                size="sm"
              >
                Analyze Progress
              </Button>
            </HStack>
          </CardHeader>

          <CardBody pt={6}>
            {goals.length > 0 ? (
              <Grid gap={3}>
                {goals.map((goal, idx) => (
                  <Box
                    key={idx}
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
                    borderColor="neutral.200"
                    bg="neutral.50"
                  >
                    <HStack justify="space-between">
                      <VStack align="start" spacing={1} flex={1}>
                        <Text fontWeight="semibold" color="neutral.900">
                          {goal.goal_name}
                        </Text>
                        <Text fontSize="sm" color="neutral.600">
                          Target: ${goal.target}/month
                          {goal.category && ` • ${goal.category}`}
                        </Text>
                      </VStack>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        leftIcon={<MdClose />}
                        onClick={() => removeGoal(idx)}
                      >
                        Remove
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </Grid>
            ) : (
              <Box py={8} textAlign="center">
                <Text color="neutral.500" mb={2}>
                  No goals set yet
                </Text>
                <Text color="neutral.400" fontSize="sm">
                  Add your first goal above to start tracking
                </Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </Section>

      {/* AI Insights */}
      {aiInsights && (
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
                  Coach's Analysis
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
      )}

      {/* Goal Results */}
      {goalResults && goalResults.length > 0 && (
        <Section title="Progress Report" description="Detailed analysis of your goal performance">
          <Grid gap={6}>
            {goalResults.map((result, idx) => {
              const status = getStatusColor(result.status)
              const progressColor = getProgressColor(result.progress_percent)

              return (
                <Card
                  key={idx}
                  borderLeft="4px solid"
                  borderLeftColor={`${status}.500`}
                >
                  <CardBody p={6}>
                    <HStack justify="space-between" mb={4}>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.900">
                          {result.goal_name}
                        </Text>
                        <StatusBadge status={status}>
                          {result.status === 'on-track' ? (
                            <HStack spacing={1}>
                              <Icon as={MdCheckCircle} boxSize={3} />
                              <span>On Track</span>
                            </HStack>
                          ) : (
                            <HStack spacing={1}>
                              <Icon as={MdWarning} boxSize={3} />
                              <span>Needs Attention</span>
                            </HStack>
                          )}
                        </StatusBadge>
                      </VStack>
                    </HStack>

                    <Grid templateColumns="repeat(2, 1fr)" gap={6} mb={6}>
                      <Box>
                        <Text fontSize="xs" color="neutral.500" mb={1} textTransform="uppercase" letterSpacing="wide">
                          Target
                        </Text>
                        <Text fontSize="xl" fontWeight="semibold" color="neutral.900">
                          ${result.target?.toFixed(2)}/mo
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="neutral.500" mb={1} textTransform="uppercase" letterSpacing="wide">
                          Current Average
                        </Text>
                        <Text fontSize="xl" fontWeight="semibold" color="neutral.900">
                          ${result.current?.toFixed(2)}/mo
                        </Text>
                      </Box>
                    </Grid>

                    <Box mb={4}>
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium" color="neutral.700">
                          Progress
                        </Text>
                        <Text fontSize="sm" fontWeight="semibold" color={`${progressColor}.600`}>
                          {result.progress_percent?.toFixed(0)}%
                        </Text>
                      </HStack>
                      <Progress
                        value={Math.min(result.progress_percent, 100)}
                        colorScheme={progressColor}
                        size="lg"
                        borderRadius="full"
                        bg="neutral.200"
                      />
                    </Box>

                    <Box
                      p={4}
                      bg="neutral.50"
                      borderRadius="md"
                      borderWidth="1px"
                      borderColor="neutral.200"
                    >
                      <Text fontSize="xs" fontWeight="semibold" color="neutral.700" mb={2} textTransform="uppercase" letterSpacing="wide">
                        Forecast
                      </Text>
                      <Text fontSize="sm" color="neutral.700" lineHeight="tall">
                        {result.forecast}
                      </Text>
                    </Box>
                  </CardBody>
                </Card>
              )
            })}
          </Grid>
        </Section>
      )}
    </Box>
  )
}
