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
  Flex,
} from '@chakra-ui/react'
import { MdAdd, MdClose, MdAutoAwesome, MdCheckCircle, MdWarning, MdTrendingUp } from 'react-icons/md'
import { financialAPI } from '../services/api'

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

  // Retirement calculator state
  const [yearsToRetirement, setYearsToRetirement] = useState(30)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [currentAge, setCurrentAge] = useState(35)
  const [monthlySavings, setMonthlySavings] = useState(500)

  // Calculate total excess spending from goal results
  const calculateExcessSpending = () => {
    if (!goalResults || goalResults.length === 0) return 0

    let totalExcess = 0
    goalResults.forEach(result => {
      if (result.status === 'over-budget') {
        // Monthly excess
        const monthlyExcess = result.current - result.target
        totalExcess += monthlyExcess
      }
    })
    return totalExcess
  }

  // Compound interest calculator
  const calculateRetirementValue = (monthlyAmount, years, annualReturn) => {
    const monthlyRate = annualReturn / 100 / 12
    const months = years * 12

    // Future value of annuity formula
    const futureValue = monthlyAmount * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
    return futureValue
  }

  // Inflation adjustment
  const adjustForInflation = (futureValue, years, inflationRate = 2.5) => {
    return futureValue / Math.pow(1 + inflationRate / 100, years)
  }

  const monthlyExcess = calculateExcessSpending()
  const retirementValue = calculateRetirementValue(monthlyExcess, yearsToRetirement, expectedReturn)
  const inflationAdjustedValue = adjustForInflation(retirementValue, yearsToRetirement)
  const totalContributions = monthlyExcess * 12 * yearsToRetirement
  const compoundGrowth = retirementValue - totalContributions

  if (loadingNetWorth) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="neutral.900" thickness="3px" />
      </Center>
    )
  }

  const isOnTrack = netWorthProgress?.on_track

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION - Net Worth Goal */}
      <Box bg="neutral.900" color="white" pt={32} pb={40} position="relative">
        <Container maxW="1400px">
          <VStack align="start" spacing={12}>
            {/* Main headline */}
            <Box>
              <HStack spacing={4} mb={6}>
                <Icon
                  as={isOnTrack ? MdCheckCircle : MdTrendingUp}
                  boxSize={12}
                  color={isOnTrack ? 'success.400' : 'warning.400'}
                />
                <Text
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  fontWeight="black"
                  letterSpacing="tighter"
                  lineHeight="none"
                >
                  ${netWorth?.total_net_worth?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
              </HStack>
              <Text fontSize="xl" color="neutral.400" fontWeight="medium">
                Current Net Worth
              </Text>
              <Text fontSize="lg" color="neutral.500" mt={2}>
                {isOnTrack ? 'Excellent progress toward your goal' : 'Building steady momentum'}
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
              <Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={3}>
                  Target Goal
                </Text>
                <Text fontSize="4xl" fontWeight="black" letterSpacing="tighter" mb={2}>
                  ${netWorthGoal.toLocaleString('en-US')}
                </Text>
                <Text fontSize="sm" color="neutral.400" fontWeight="medium">
                  {netWorthProgress?.progress_percent?.toFixed(1)}% complete
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={3}>
                  Remaining
                </Text>
                <Text fontSize="4xl" fontWeight="black" letterSpacing="tighter" mb={2}>
                  ${netWorthProgress?.remaining?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" color="neutral.400" fontWeight="medium">
                  {netWorthProgress?.months_to_goal > 0 && `~${Math.ceil(netWorthProgress.months_to_goal)} months to goal`}
                </Text>
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={3}>
                  Portfolio Value
                </Text>
                <Text fontSize="4xl" fontWeight="black" letterSpacing="tighter" mb={2}>
                  ${netWorth?.portfolio_value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" color="neutral.400" fontWeight="medium">
                  {netWorth?.portfolio_percent?.toFixed(1)}% of net worth
                </Text>
              </Box>
            </Grid>

            {/* Progress Bar */}
            <Box w="full">
              <Text fontSize="sm" color="neutral.500" mb={3} fontWeight="semibold">
                Progress to Goal
              </Text>
              <Box bg="neutral.800" h="12px" borderRadius="6px" overflow="hidden">
                <Box
                  bg={isOnTrack ? 'success.500' : 'warning.500'}
                  h="full"
                  w={`${Math.min(netWorthProgress?.progress_percent || 0, 100)}%`}
                  transition="width 0.5s ease"
                />
              </Box>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* MILESTONES SECTION */}
      <Box py={24} bg="white">
        <Container maxW="1400px">
          <SectionHeader
            title="Milestones"
            description="Track progress through key checkpoints"
          />

          <Grid templateColumns="repeat(5, 1fr)" gap={6} mt={12}>
            {[25, 50, 75, 90, 100].map((pct) => {
              const achieved = netWorthProgress?.milestones_achieved?.some(m => m.percent === pct)
              const isCurrent = netWorthProgress?.next_milestone?.percent === pct

              return (
                <VStack key={pct} spacing={4}>
                  <Box
                    w={20}
                    h={20}
                    borderRadius="8px"
                    bg={achieved ? 'neutral.900' : isCurrent ? 'neutral.700' : 'neutral.200'}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    transition="all 0.3s"
                    _hover={{
                      transform: achieved ? 'scale(1.05)' : 'none',
                    }}
                  >
                    {achieved ? (
                      <Icon as={MdCheckCircle} boxSize={10} color="white" />
                    ) : (
                      <Text fontWeight="black" color={isCurrent ? 'white' : 'neutral.500'} fontSize="xl">
                        {pct}%
                      </Text>
                    )}
                  </Box>
                  <Text fontSize="sm" color="neutral.700" textAlign="center" fontWeight="semibold">
                    {pct}% Milestone
                  </Text>
                </VStack>
              )
            })}
          </Grid>

          {/* Update Goal */}
          <Box mt={16} pt={12} borderTop="2px solid" borderColor="neutral.200">
            <Text fontSize="2xl" fontWeight="bold" color="neutral.900" mb={2}>
              Adjust target goal
            </Text>
            <Text fontSize="md" color="neutral.600" mb={6}>
              Update your net worth target to match your financial aspirations
            </Text>
            <HStack maxW="md">
              <Input
                type="number"
                value={netWorthGoal}
                onChange={(e) => setNetWorthGoal(Number(e.target.value))}
                placeholder="Enter goal amount"
                size="lg"
                color="neutral.900"
              />
              <Button onClick={() => updateNetWorthGoal(netWorthGoal)} size="lg">
                Update
              </Button>
            </HStack>
          </Box>
        </Container>
      </Box>

      {/* ADD NEW SPENDING GOAL */}
      <Box py={24} bg="neutral.50" borderTop="2px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <SectionHeader
            title="Set spending goals"
            description="Create monthly targets to control expenses by category"
          />

          <Box
            bg="white"
            border="2px solid"
            borderColor="neutral.200"
            borderRadius="8px"
            p={8}
            mt={12}
          >
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6} mb={6}>
              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                  Goal Name
                </FormLabel>
                <Input
                  placeholder="e.g., Coffee Budget"
                  value={newGoal.goal_name}
                  onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                  size="lg"
                  color="neutral.900"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                  Monthly Target ($)
                </FormLabel>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  size="lg"
                  color="neutral.900"
                />
              </FormControl>

              <FormControl>
                <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
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

      {/* CURRENT GOALS */}
      <Box py={24} bg="white">
        <Container maxW="1400px">
          <Flex justify="space-between" align="end" mb={12}>
            <SectionHeader
              title={`Active goals (${goals.length})`}
              description="Monitor all your financial targets"
            />
            <Button
              onClick={analyzeGoals}
              isLoading={analyzing}
              loadingText="Analyzing..."
              size="lg"
            >
              Analyze Progress
            </Button>
          </Flex>

          {goals.length > 0 ? (
            <Grid gap={4}>
              {goals.map((goal, idx) => (
                <Box
                  key={idx}
                  bg="white"
                  border="2px solid"
                  borderColor="neutral.200"
                  borderRadius="8px"
                  p={6}
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'neutral.400',
                  }}
                >
                  <Flex justify="space-between" align="center">
                    <Box flex={1}>
                      <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={1}>
                        {goal.goal_name}
                      </Text>
                      <HStack spacing={3}>
                        <Text fontSize="md" color="neutral.600" fontWeight="medium">
                          ${goal.target}/month
                        </Text>
                        {goal.category && (
                          <>
                            <Text color="neutral.400">•</Text>
                            <Text fontSize="md" color="neutral.600" fontWeight="medium">
                              {goal.category}
                            </Text>
                          </>
                        )}
                      </HStack>
                    </Box>
                    <Button
                      size="sm"
                      variant="ghost"
                      leftIcon={<MdClose />}
                      onClick={() => removeGoal(idx)}
                      color="neutral.600"
                      _hover={{ color: 'error.600', bg: 'error.50' }}
                    >
                      Remove
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Grid>
          ) : (
            <Box
              py={20}
              textAlign="center"
              border="2px dashed"
              borderColor="neutral.300"
              borderRadius="8px"
            >
              <Text color="neutral.600" fontSize="lg" fontWeight="medium" mb={2}>
                No goals set yet
              </Text>
              <Text color="neutral.500" fontSize="sm">
                Add your first goal above to start tracking
              </Text>
            </Box>
          )}
        </Container>
      </Box>

      {/* AI INSIGHTS */}
      {aiInsights && (
        <Box py={24} bg="neutral.50" borderTop="2px solid" borderColor="neutral.200">
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
                  <Icon as={MdAutoAwesome} boxSize={6} />
                  <Text fontSize="lg" fontWeight="bold">
                    Coach's Analysis
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

      {/* GOAL RESULTS */}
      {goalResults && goalResults.length > 0 && (
        <Box py={24} bg="white">
          <Container maxW="1400px">
            <SectionHeader
              title="Progress report"
              description="Detailed analysis of each goal's performance"
            />

            <Grid gap={6} mt={12}>
              {goalResults.map((result, idx) => {
                const isOnTrack = result.status === 'on-track'
                const progressPercent = Math.min(result.progress_percent, 100)

                return (
                  <Box
                    key={idx}
                    bg="white"
                    border="2px solid"
                    borderColor={isOnTrack ? 'success.500' : 'error.500'}
                    borderRadius="8px"
                    overflow="hidden"
                  >
                    <Box bg={isOnTrack ? 'success.50' : 'error.50'} p={6} borderBottom="2px solid" borderColor={isOnTrack ? 'success.500' : 'error.500'}>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="xl" fontWeight="bold" color="neutral.900" mb={2}>
                            {result.goal_name}
                          </Text>
                          <HStack spacing={2}>
                            <Icon
                              as={isOnTrack ? MdCheckCircle : MdWarning}
                              boxSize={5}
                              color={isOnTrack ? 'success.700' : 'error.700'}
                            />
                            <Text fontSize="sm" fontWeight="bold" color={isOnTrack ? 'success.800' : 'error.800'} textTransform="uppercase" letterSpacing="wider">
                              {isOnTrack ? 'On Track' : 'Needs Attention'}
                            </Text>
                          </HStack>
                        </Box>
                      </Flex>
                    </Box>

                    <Box p={8}>
                      <Grid templateColumns="repeat(2, 1fr)" gap={8} mb={8}>
                        <Box>
                          <Text fontSize="xs" color="neutral.500" mb={2} textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                            Target
                          </Text>
                          <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tighter">
                            ${result.target?.toFixed(2)}
                          </Text>
                          <Text fontSize="sm" color="neutral.600" mt={1}>per month</Text>
                        </Box>
                        <Box>
                          <Text fontSize="xs" color="neutral.500" mb={2} textTransform="uppercase" letterSpacing="wider" fontWeight="bold">
                            Current Average
                          </Text>
                          <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tighter">
                            ${result.current?.toFixed(2)}
                          </Text>
                          <Text fontSize="sm" color="neutral.600" mt={1}>per month</Text>
                        </Box>
                      </Grid>

                      <Box mb={8}>
                        <Flex justify="space-between" mb={3}>
                          <Text fontSize="sm" fontWeight="bold" color="neutral.700" textTransform="uppercase" letterSpacing="wider">
                            Progress
                          </Text>
                          <Text fontSize="lg" fontWeight="black" color={isOnTrack ? 'success.700' : 'error.700'}>
                            {result.progress_percent?.toFixed(0)}%
                          </Text>
                        </Flex>
                        <Box bg="neutral.200" h="12px" borderRadius="6px" overflow="hidden">
                          <Box
                            bg={isOnTrack ? 'success.500' : 'error.500'}
                            h="full"
                            w={`${progressPercent}%`}
                            transition="width 0.5s ease"
                          />
                        </Box>
                      </Box>

                      <Box
                        p={6}
                        bg="neutral.50"
                        borderRadius="8px"
                        border="1px solid"
                        borderColor="neutral.200"
                      >
                        <Text fontSize="xs" fontWeight="bold" color="neutral.700" mb={3} textTransform="uppercase" letterSpacing="wider">
                          Forecast
                        </Text>
                        <Text fontSize="md" color="neutral.800" lineHeight="1.7">
                          {result.forecast}
                        </Text>
                      </Box>
                    </Box>
                  </Box>
                )
              })}
            </Grid>
          </Container>
        </Box>
      )}

      {/* RETIREMENT PLANNING CALCULATOR */}
      {goals.length > 0 && (
        <Box py={24} bg="neutral.900" color="white">
          <Container maxW="1400px">
            {!goalResults || goalResults.length === 0 ? (
              /* Show message to analyze goals first */
              <Box textAlign="center" py={16}>
                <Box
                  bg="neutral.800"
                  border="2px solid"
                  borderColor="primary.500"
                  borderRadius="8px"
                  p={12}
                  maxW="800px"
                  mx="auto"
                >
                  <Icon as={MdTrendingUp} boxSize={24} color="primary.400" mb={6} />
                  <Text fontSize="4xl" fontWeight="black" color="white" letterSpacing="tighter" mb={4}>
                    Retirement Planning Calculator
                  </Text>
                  <Text fontSize="xl" color="neutral.300" mb={8} lineHeight="1.8">
                    Discover the power of compound interest and see how your spending decisions today impact your retirement tomorrow.
                  </Text>
                  <Button size="lg" onClick={analyzeGoals} isLoading={analyzing} loadingText="Analyzing...">
                    Analyze Your Goals First
                  </Button>
                </Box>
              </Box>
            ) : (
              <>
                <Box mb={12}>
                  <HStack spacing={4} mb={6}>
                    <Icon as={monthlyExcess > 0 ? MdTrendingUp : MdCheckCircle} boxSize={12} color="success.400" />
                    <Text fontSize="5xl" fontWeight="black" letterSpacing="tighter" lineHeight="none">
                      {monthlyExcess > 0 ? 'Your Retirement Opportunity' : 'Excellent Financial Discipline!'}
                    </Text>
                  </HStack>
                  <Text fontSize="xl" color="neutral.400" maxW="900px">
                    {monthlyExcess > 0
                      ? "Imagine investing your excess spending instead. Here's the power of compound interest."
                      : "You're staying on target with your goals. Keep up the great work and continue building your financial future."}
                  </Text>
                </Box>

                {monthlyExcess > 0 ? (
              <>
                {/* Call to Action - Dramatic Numbers */}
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12} mb={16}>
              {/* Current Situation */}
              <Box
                bg="neutral.800"
                border="2px solid"
                borderColor="error.600"
                borderRadius="8px"
                p={8}
              >
                <Text fontSize="sm" color="neutral.400" mb={4} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                  What You're Losing Monthly
                </Text>
                <Text fontSize="6xl" fontWeight="black" color="error.500" letterSpacing="tighter" mb={4}>
                  ${monthlyExcess.toFixed(2)}
                </Text>
                <Text fontSize="md" color="neutral.400" mb={6}>
                  Over-budget spending each month that could be building your future
                </Text>
                <Box bg="error.900" p={4} borderRadius="6px">
                  <Text fontSize="sm" color="error.300" fontWeight="semibold">
                    Over {yearsToRetirement} years, you'll spend: ${totalContributions.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                </Box>
              </Box>

              {/* Future Opportunity */}
              <Box
                bg="neutral.800"
                border="2px solid"
                borderColor="success.500"
                borderRadius="8px"
                p={8}
              >
                <Text fontSize="sm" color="neutral.400" mb={4} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                  What It Could Become
                </Text>
                <Text fontSize="6xl" fontWeight="black" color="success.400" letterSpacing="tighter" mb={4}>
                  ${retirementValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="md" color="neutral.400" mb={6}>
                  If invested at {expectedReturn}% annual return until age {currentAge + yearsToRetirement}
                </Text>
                <Box bg="success.900" p={4} borderRadius="6px">
                  <Text fontSize="sm" color="success.300" fontWeight="semibold">
                    Compound growth adds: ${compoundGrowth.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                </Box>
              </Box>
            </Grid>

            {/* Inflation Adjusted Value */}
            <Box
              bg="warning.900"
              border="2px solid"
              borderColor="warning.600"
              borderRadius="8px"
              p={8}
              mb={16}
            >
              <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8} alignItems="center">
                <Box>
                  <Text fontSize="sm" color="warning.300" mb={3} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                    Inflation-Adjusted Value (Today's Dollars)
                  </Text>
                  <Text fontSize="4xl" fontWeight="black" color="warning.400" letterSpacing="tighter" mb={3}>
                    ${inflationAdjustedValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                  <Text fontSize="md" color="warning.200">
                    Real purchasing power at retirement (assuming 2.5% annual inflation)
                  </Text>
                </Box>
                <Box textAlign="right">
                  <Text fontSize="7xl" fontWeight="black" color="warning.500" letterSpacing="tighter">
                    {((retirementValue / totalContributions) - 1).toFixed(1)}x
                  </Text>
                  <Text fontSize="sm" color="warning.300" fontWeight="semibold">
                    Return Multiple
                  </Text>
                </Box>
              </Grid>
            </Box>

            {/* Calculator Controls */}
            <Box
              bg="white"
              border="2px solid"
              borderColor="neutral.700"
              borderRadius="8px"
              p={8}
              mb={12}
            >
              <Text fontSize="2xl" fontWeight="bold" color="neutral.900" mb={6}>
                Adjust Your Projection
              </Text>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={6}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                    Current Age
                  </FormLabel>
                  <Input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    size="lg"
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                    Years to Retirement
                  </FormLabel>
                  <Input
                    type="number"
                    value={yearsToRetirement}
                    onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                    size="lg"
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                    Expected Annual Return (%)
                  </FormLabel>
                  <Input
                    type="number"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    size="lg"
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>
              </Grid>
            </Box>

            {/* Call to Action */}
            <Box textAlign="center" py={12} px={8}>
              <Text fontSize="3xl" fontWeight="black" color="white" mb={6} letterSpacing="tight">
                The power of compound interest is real.
              </Text>
              <Text fontSize="xl" color="neutral.400" mb={8} maxW="800px" mx="auto">
                Every dollar you save today works for you tomorrow. Stick to your goals and watch your future wealth grow exponentially.
              </Text>
              <HStack justify="center" spacing={4}>
                <Box textAlign="center" px={8} py={6} bg="neutral.800" borderRadius="8px">
                  <Text fontSize="sm" color="neutral.500" mb={2} fontWeight="bold">DAILY IMPACT</Text>
                  <Text fontSize="3xl" fontWeight="black" color="success.400">
                    ${(monthlyExcess / 30).toFixed(2)}
                  </Text>
                  <Text fontSize="xs" color="neutral.500" mt={1}>saved per day</Text>
                </Box>
                <Box textAlign="center" px={8} py={6} bg="neutral.800" borderRadius="8px">
                  <Text fontSize="sm" color="neutral.500" mb={2} fontWeight="bold">YEARLY IMPACT</Text>
                  <Text fontSize="3xl" fontWeight="black" color="success.400">
                    ${(monthlyExcess * 12).toLocaleString()}
                  </Text>
                  <Text fontSize="xs" color="neutral.500" mt={1}>saved per year</Text>
                </Box>
              </HStack>
            </Box>
              </>
            ) : (
              /* ON TARGET - Show Savings Calculator */
              <>
                {/* Congratulations Banner */}
                <Box
                  bg="success.900"
                  border="2px solid"
                  borderColor="success.500"
                  borderRadius="8px"
                  p={8}
                  mb={12}
                  textAlign="center"
                >
                  <HStack spacing={4} justify="center" mb={3}>
                    <Icon as={MdCheckCircle} boxSize={10} color="success.400" />
                    <Text fontSize="3xl" fontWeight="black" color="success.400" letterSpacing="tighter">
                      You're On Target!
                    </Text>
                  </HStack>
                  <Text fontSize="lg" color="neutral.300">
                    You're meeting all your spending goals. Now let's see how your disciplined savings can grow.
                  </Text>
                </Box>

                {/* Calculator - Enter Monthly Savings */}
                <Box
                  bg="white"
                  border="2px solid"
                  borderColor="neutral.700"
                  borderRadius="8px"
                  p={8}
                  mb={12}
                >
                  <Text fontSize="2xl" fontWeight="bold" color="neutral.900" mb={6}>
                    Project Your Savings Growth
                  </Text>
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6}>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                        Monthly Savings ($)
                      </FormLabel>
                      <Input
                        type="number"
                        value={monthlySavings}
                        onChange={(e) => setMonthlySavings(Number(e.target.value))}
                        size="lg"
                        bg="white"
                        color="neutral.900"
                        placeholder="500"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                        Current Age
                      </FormLabel>
                      <Input
                        type="number"
                        value={currentAge}
                        onChange={(e) => setCurrentAge(Number(e.target.value))}
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                        Years to Retirement
                      </FormLabel>
                      <Input
                        type="number"
                        value={yearsToRetirement}
                        onChange={(e) => setYearsToRetirement(Number(e.target.value))}
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">
                        Expected Return (%)
                      </FormLabel>
                      <Input
                        type="number"
                        step="0.5"
                        value={expectedReturn}
                        onChange={(e) => setExpectedReturn(Number(e.target.value))}
                        size="lg"
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>
                  </Grid>
                </Box>

                {/* Future Value Projections */}
                <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12} mb={16}>
                  {/* Total Contributions */}
                  <Box
                    bg="neutral.800"
                    border="2px solid"
                    borderColor="neutral.600"
                    borderRadius="8px"
                    p={8}
                  >
                    <Text fontSize="sm" color="neutral.400" mb={4} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                      What You'll Contribute
                    </Text>
                    <Text fontSize="6xl" fontWeight="black" color="neutral.300" letterSpacing="tighter" mb={4}>
                      ${(monthlySavings * 12 * yearsToRetirement).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text fontSize="md" color="neutral.400" mb={6}>
                      Total savings over {yearsToRetirement} years at ${monthlySavings}/month
                    </Text>
                    <Box bg="neutral.700" p={4} borderRadius="6px">
                      <Text fontSize="sm" color="neutral.400" fontWeight="semibold">
                        Your disciplined contributions: ${monthlySavings}/month × {yearsToRetirement * 12} months
                      </Text>
                    </Box>
                  </Box>

                  {/* Future Value with Growth */}
                  <Box
                    bg="neutral.800"
                    border="2px solid"
                    borderColor="success.500"
                    borderRadius="8px"
                    p={8}
                  >
                    <Text fontSize="sm" color="neutral.400" mb={4} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                      What It Will Become
                    </Text>
                    <Text fontSize="6xl" fontWeight="black" color="success.400" letterSpacing="tighter" mb={4}>
                      ${calculateRetirementValue(monthlySavings, yearsToRetirement, expectedReturn).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text fontSize="md" color="neutral.400" mb={6}>
                      Future value at {expectedReturn}% annual return at age {currentAge + yearsToRetirement}
                    </Text>
                    <Box bg="success.900" p={4} borderRadius="6px">
                      <Text fontSize="sm" color="success.300" fontWeight="semibold">
                        Compound growth adds: ${(calculateRetirementValue(monthlySavings, yearsToRetirement, expectedReturn) - (monthlySavings * 12 * yearsToRetirement)).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </Text>
                    </Box>
                  </Box>
                </Grid>

                {/* Inflation Adjusted Value */}
                <Box
                  bg="warning.900"
                  border="2px solid"
                  borderColor="warning.600"
                  borderRadius="8px"
                  p={8}
                  mb={16}
                >
                  <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={8} alignItems="center">
                    <Box>
                      <Text fontSize="sm" color="warning.300" mb={3} fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                        Inflation-Adjusted Value (Today's Dollars)
                      </Text>
                      <Text fontSize="4xl" fontWeight="black" color="warning.400" letterSpacing="tighter" mb={3}>
                        ${adjustForInflation(calculateRetirementValue(monthlySavings, yearsToRetirement, expectedReturn), yearsToRetirement).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </Text>
                      <Text fontSize="md" color="warning.200">
                        Real purchasing power at retirement (assuming 2.5% annual inflation)
                      </Text>
                    </Box>
                    <Box textAlign="right">
                      <Text fontSize="7xl" fontWeight="black" color="warning.500" letterSpacing="tighter">
                        {((calculateRetirementValue(monthlySavings, yearsToRetirement, expectedReturn) / (monthlySavings * 12 * yearsToRetirement)) - 1).toFixed(1)}x
                      </Text>
                      <Text fontSize="sm" color="warning.300" fontWeight="semibold">
                        Return Multiple
                      </Text>
                    </Box>
                  </Grid>
                </Box>

                {/* Call to Action */}
                <Box textAlign="center" py={12} px={8}>
                  <Text fontSize="3xl" fontWeight="black" color="white" mb={6} letterSpacing="tight">
                    Your discipline is building real wealth.
                  </Text>
                  <Text fontSize="xl" color="neutral.400" mb={8} maxW="800px" mx="auto">
                    By staying on target with your goals, you're harnessing the power of compound interest. Every month you stick to your budget, your future self gets richer.
                  </Text>
                  <HStack justify="center" spacing={4}>
                    <Box textAlign="center" px={8} py={6} bg="neutral.800" borderRadius="8px">
                      <Text fontSize="sm" color="neutral.500" mb={2} fontWeight="bold">DAILY SAVINGS</Text>
                      <Text fontSize="3xl" fontWeight="black" color="success.400">
                        ${(monthlySavings / 30).toFixed(2)}
                      </Text>
                      <Text fontSize="xs" color="neutral.500" mt={1}>per day</Text>
                    </Box>
                    <Box textAlign="center" px={8} py={6} bg="neutral.800" borderRadius="8px">
                      <Text fontSize="sm" color="neutral.500" mb={2} fontWeight="bold">YEARLY SAVINGS</Text>
                      <Text fontSize="3xl" fontWeight="black" color="success.400">
                        ${(monthlySavings * 12).toLocaleString()}
                      </Text>
                      <Text fontSize="xs" color="neutral.500" mt={1}>per year</Text>
                    </Box>
                  </HStack>
                </Box>
              </>
            )}
              </>
            )}
          </Container>
        </Box>
      )}
    </Box>
  )
}

// Section Header Component
function SectionHeader({ title, description }) {
  return (
    <Box>
      <Text
        fontSize={{ base: '3xl', md: '4xl' }}
        fontWeight="black"
        color="neutral.900"
        letterSpacing="tighter"
        mb={3}
      >
        {title}
      </Text>
      <Text fontSize="lg" color="neutral.600" fontWeight="normal">
        {description}
      </Text>
    </Box>
  )
}
