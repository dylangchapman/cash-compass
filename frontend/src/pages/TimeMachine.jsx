import { useState, useEffect, useCallback, useMemo } from 'react'
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
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Input,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from '@chakra-ui/react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { MdTimeline, MdTrendingUp, MdTrendingDown, MdSavings, MdAccountBalance, MdCalculate, MdShowChart, MdCheckCircle, MdWarning } from 'react-icons/md'
import { financialAPI } from '../services/api'
import LoginPrompt from '../components/LoginPrompt'

const CACHE_KEY = 'cached_time_machine_baseline'

// Average historical inflation rate
const AVERAGE_INFLATION_RATE = 3.0

// Calculate compound interest growth
const calculateCompoundGrowth = (principal, monthlyContribution, annualRate, years) => {
  const monthlyRate = annualRate / 100 / 12
  const months = years * 12
  let balance = principal

  const data = [{ year: 0, balance: principal, contributions: principal, interest: 0 }]

  let totalContributions = principal
  for (let month = 1; month <= months; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution
    totalContributions += monthlyContribution

    if (month % 12 === 0) {
      const year = month / 12
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions),
      })
    }
  }

  return data
}

// Calculate inflation-adjusted (real) value
const calculateInflationAdjusted = (futureValue, years, inflationRate) => {
  return futureValue / Math.pow(1 + inflationRate / 100, years)
}

const getCached = (key) => {
  try {
    const cached = localStorage.getItem(key)
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage errors
  }
}

const formatCurrency = (value) => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`
  }
  return `$${value.toFixed(0)}`
}

const formatCurrencyFull = (value) => {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function TimeMachine() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  // Baseline data
  const [baseline, setBaseline] = useState(() => getCached(CACHE_KEY))
  const [loading, setLoading] = useState(!baseline)
  const [error, setError] = useState(null)

  if (!isLoggedIn) {
    return (
      <LoginPrompt
        title="Time Machine"
        description="Sign in to simulate different financial scenarios and see how your decisions today could impact your future wealth."
      />
    )
  }

  // Projection data
  const [projection, setProjection] = useState(null)
  const [projecting, setProjecting] = useState(false)

  // Scenario adjustments (percentage changes)
  const [adjustments, setAdjustments] = useState({
    restaurants_adjustment: 0,
    groceries_adjustment: 0,
    shopping_adjustment: 0,
    entertainment_adjustment: 0,
    transportation_adjustment: 0,
    subscriptions_adjustment: 0,
    rent_adjustment: 0,
    other_adjustment: 0,
    income_adjustment: 0,
    investment_return_rate: 7,
    inflation_rate: 3,
    emergency_fund_target: 10000,
    retirement_goal: 500000,
  })

  // Retirement calculator state
  const [currentAge, setCurrentAge] = useState(30)
  const [retirementAge, setRetirementAge] = useState(65)
  const [currentSavings, setCurrentSavings] = useState(10000)
  const [retirementMonthlyContribution, setRetirementMonthlyContribution] = useState(500)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [inflationRate, setInflationRate] = useState(AVERAGE_INFLATION_RATE)

  // Load baseline data
  const loadBaseline = useCallback(async () => {
    try {
      setLoading(true)
      const data = await financialAPI.getTimeMachineBaseline()
      setBaseline(data)
      setCache(CACHE_KEY, data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Calculate projections when adjustments change
  const calculateProjection = useCallback(async () => {
    if (!baseline) return

    try {
      setProjecting(true)
      const result = await financialAPI.projectTimeMachine(adjustments)
      setProjection(result)
    } catch (err) {
      console.error('Projection error:', err)
    } finally {
      setProjecting(false)
    }
  }, [baseline, adjustments])

  useEffect(() => {
    loadBaseline()
  }, [loadBaseline])

  useEffect(() => {
    const debounce = setTimeout(() => {
      calculateProjection()
    }, 300)
    return () => clearTimeout(debounce)
  }, [calculateProjection])

  const handleSliderChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: value }))
  }

  const handleInputChange = (key, value) => {
    setAdjustments(prev => ({ ...prev, [key]: Number(value) || 0 }))
  }

  // Check if any adjustments are non-zero
  const hasChanges = useMemo(() => {
    return adjustments.restaurants_adjustment !== 0 ||
      adjustments.groceries_adjustment !== 0 ||
      adjustments.shopping_adjustment !== 0 ||
      adjustments.entertainment_adjustment !== 0 ||
      adjustments.transportation_adjustment !== 0 ||
      adjustments.subscriptions_adjustment !== 0 ||
      adjustments.rent_adjustment !== 0 ||
      adjustments.other_adjustment !== 0 ||
      adjustments.income_adjustment !== 0
  }, [adjustments])

  // Calculate retirement projections
  const yearsToRetirement = retirementAge - currentAge
  const retirementData = useMemo(() => {
    if (yearsToRetirement <= 0) return []
    return calculateCompoundGrowth(currentSavings, retirementMonthlyContribution, expectedReturn, yearsToRetirement)
  }, [currentSavings, retirementMonthlyContribution, expectedReturn, yearsToRetirement])

  const finalBalance = retirementData.length > 0 ? retirementData[retirementData.length - 1].balance : 0
  const totalContributions = retirementData.length > 0 ? retirementData[retirementData.length - 1].contributions : 0
  const totalInterest = finalBalance - totalContributions
  const inflationAdjustedValue = calculateInflationAdjusted(finalBalance, yearsToRetirement, inflationRate)
  const purchasingPowerLoss = finalBalance - inflationAdjustedValue

  // Real return rate (after inflation)
  const realReturnRate = ((1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1) * 100

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
        Error loading Time Machine: {error}
      </Alert>
    )
  }

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="1600px">
          <HStack spacing={4} mb={4}>
            <Icon as={MdTimeline} boxSize={10} />
            <Text
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="black"
              letterSpacing="tighter"
            >
              Time Machine
            </Text>
          </HStack>
          <Text fontSize="lg" color="neutral.400" maxW="800px">
            Use the Time Machine to see how small changes today affect your financial future.
            Adjust spending, income, and savings to explore different scenarios.
          </Text>
        </Container>
      </Box>

      {/* Main Content */}
      <Box py={8}>
        <Container maxW="1600px">
          <Grid templateColumns={{ base: '1fr', lg: '380px 1fr' }} gap={8}>
            {/* Left Panel - Controls */}
            <Box>
              <VStack spacing={6} align="stretch" position="sticky" top="100px">
                {/* Category Adjustments */}
                <ControlSection title="Spending Adjustments" icon={MdTrendingDown}>
                  <VStack spacing={5} align="stretch">
                    <AdjustmentSlider
                      label="Restaurants"
                      value={adjustments.restaurants_adjustment}
                      onChange={(v) => handleSliderChange('restaurants_adjustment', v)}
                      baseline={baseline?.category_spending?.restaurants}
                    />
                    <AdjustmentSlider
                      label="Groceries"
                      value={adjustments.groceries_adjustment}
                      onChange={(v) => handleSliderChange('groceries_adjustment', v)}
                      baseline={baseline?.category_spending?.groceries}
                    />
                    <AdjustmentSlider
                      label="Shopping"
                      value={adjustments.shopping_adjustment}
                      onChange={(v) => handleSliderChange('shopping_adjustment', v)}
                      baseline={baseline?.category_spending?.shopping}
                    />
                    <AdjustmentSlider
                      label="Entertainment"
                      value={adjustments.entertainment_adjustment}
                      onChange={(v) => handleSliderChange('entertainment_adjustment', v)}
                      baseline={baseline?.category_spending?.entertainment}
                    />
                    <AdjustmentSlider
                      label="Transportation"
                      value={adjustments.transportation_adjustment}
                      onChange={(v) => handleSliderChange('transportation_adjustment', v)}
                      baseline={baseline?.category_spending?.transportation}
                    />
                    <AdjustmentSlider
                      label="Subscriptions"
                      value={adjustments.subscriptions_adjustment}
                      onChange={(v) => handleSliderChange('subscriptions_adjustment', v)}
                      baseline={baseline?.category_spending?.subscriptions}
                    />
                  </VStack>
                </ControlSection>

                {/* Fixed Costs */}
                <ControlSection title="Fixed Costs" icon={MdAccountBalance}>
                  <AdjustmentSlider
                    label="Rent / Housing"
                    value={adjustments.rent_adjustment}
                    onChange={(v) => handleSliderChange('rent_adjustment', v)}
                    baseline={baseline?.category_spending?.rent}
                  />
                </ControlSection>

                {/* Income */}
                <ControlSection title="Income Adjustment" icon={MdTrendingUp}>
                  <AdjustmentSlider
                    label="Monthly Income"
                    value={adjustments.income_adjustment}
                    onChange={(v) => handleSliderChange('income_adjustment', v)}
                    baseline={baseline?.monthly_income}
                    isIncome
                  />
                </ControlSection>

                {/* Goals */}
                <ControlSection title="Financial Goals" icon={MdSavings}>
                  <VStack spacing={4} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                        Emergency Fund Target
                      </FormLabel>
                      <Input
                        type="number"
                        value={adjustments.emergency_fund_target}
                        onChange={(e) => handleInputChange('emergency_fund_target', e.target.value)}
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                        Retirement Goal
                      </FormLabel>
                      <Input
                        type="number"
                        value={adjustments.retirement_goal}
                        onChange={(e) => handleInputChange('retirement_goal', e.target.value)}
                        bg="white"
                        color="neutral.900"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                        Expected Investment Return: {adjustments.investment_return_rate}%
                      </FormLabel>
                      <Slider
                        value={adjustments.investment_return_rate}
                        onChange={(v) => handleSliderChange('investment_return_rate', v)}
                        min={1}
                        max={12}
                        step={0.5}
                      >
                        <SliderTrack bg="neutral.200">
                          <SliderFilledTrack bg="success.500" />
                        </SliderTrack>
                        <SliderThumb boxSize={4} />
                      </Slider>
                    </FormControl>
                  </VStack>
                </ControlSection>
              </VStack>
            </Box>

            {/* Right Panel - Results */}
            <Box>
              <VStack spacing={6} align="stretch">
                {/* Summary Cards */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', xl: 'repeat(4, 1fr)' }} gap={4}>
                  <SummaryCard
                    label="Current Monthly Savings"
                    value={projection?.current_monthly_savings}
                    subtext={`${projection?.current_savings_rate?.toFixed(1)}% savings rate`}
                    variant="neutral"
                  />
                  <SummaryCard
                    label="Scenario Monthly Savings"
                    value={projection?.scenario_monthly_savings}
                    subtext={`${projection?.scenario_savings_rate?.toFixed(1)}% savings rate`}
                    variant={hasChanges && projection?.savings_difference > 0 ? 'success' : hasChanges ? 'warning' : 'neutral'}
                  />
                  <SummaryCard
                    label="Monthly Difference"
                    value={projection?.savings_difference}
                    subtext={projection?.savings_difference_percent > 0 ? `+${projection?.savings_difference_percent?.toFixed(1)}%` : `${projection?.savings_difference_percent?.toFixed(1)}%`}
                    variant={projection?.savings_difference > 0 ? 'success' : projection?.savings_difference < 0 ? 'error' : 'neutral'}
                    showArrow
                  />
                  <SummaryCard
                    label="12-Month Extra Savings"
                    value={projection?.projection_months?.[11]?.difference}
                    subtext="vs current path"
                    variant={projection?.projection_months?.[11]?.difference > 0 ? 'success' : 'neutral'}
                  />
                </Grid>

                {/* 12-Month Projection Chart */}
                <ChartSection title="12-Month Savings Projection" description="Cumulative savings comparison over the next year">
                  {projection?.projection_months && (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={projection.projection_months}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          tickFormatter={(v) => `M${v}`}
                        />
                        <YAxis
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '12px',
                          }}
                          formatter={(value) => [formatCurrencyFull(value), '']}
                          labelFormatter={(label) => `Month ${label}`}
                          labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="current_savings"
                          name="Current Path"
                          stroke="#71717a"
                          fill="#d4d4d8"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="scenario_savings"
                          name="Time Machine Scenario"
                          stroke="#22c55e"
                          fill="#86efac"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </ChartSection>

                {/* Category Comparison */}
                <ChartSection title="Current vs Scenario Spending" description="Monthly spending by category">
                  {projection?.category_comparison && (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={projection.category_comparison} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis
                          type="number"
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          tickFormatter={formatCurrency}
                        />
                        <YAxis
                          type="category"
                          dataKey="category"
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          width={100}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '12px',
                          }}
                          formatter={(value) => [formatCurrencyFull(value), '']}
                          labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                        <Legend />
                        <Bar dataKey="current" name="Current" fill="#71717a" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="scenario" name="Scenario" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </ChartSection>

                {/* Emergency Fund & Goals */}
                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                  <MetricCard
                    title="Emergency Fund Runway"
                    currentValue={`${projection?.current_emergency_fund_months?.toFixed(1)} months`}
                    scenarioValue={`${projection?.scenario_emergency_fund_months?.toFixed(1)} months`}
                    note={projection?.months_to_emergency_fund_goal
                      ? `${Math.ceil(projection.months_to_emergency_fund_goal)} months to reach ${formatCurrencyFull(adjustments.emergency_fund_target)} goal`
                      : 'Set positive savings to calculate'}
                  />
                  <MetricCard
                    title="Time to Retirement Goal"
                    currentValue={projection?.current_time_to_goal ? `${projection.current_time_to_goal.toFixed(1)} years` : 'N/A'}
                    scenarioValue={projection?.scenario_time_to_goal ? `${projection.scenario_time_to_goal.toFixed(1)} years` : 'N/A'}
                    note={projection?.goal_time_saved && projection.goal_time_saved > 0
                      ? `Save ${projection.goal_time_saved.toFixed(1)} years with this scenario`
                      : projection?.goal_time_saved && projection.goal_time_saved < 0
                        ? `Takes ${Math.abs(projection.goal_time_saved).toFixed(1)} years longer`
                        : `Goal: ${formatCurrencyFull(adjustments.retirement_goal)}`}
                    positive={projection?.goal_time_saved > 0}
                  />
                </Grid>

                {/* Long-term Investment Growth */}
                <ChartSection title="10-Year Investment Growth Projection" description="Compound growth with monthly contributions at your expected return rate">
                  {projection?.investment_growth_projection && (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={projection.investment_growth_projection}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis
                          dataKey="year"
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          tickFormatter={(v) => `Year ${v}`}
                        />
                        <YAxis
                          tick={{ fill: '#18181b', fontSize: 12 }}
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#18181b',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '12px',
                          }}
                          formatter={(value) => [formatCurrencyFull(value), '']}
                          labelFormatter={(label) => `Year ${label}`}
                          labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                          itemStyle={{ color: '#ffffff' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="current_balance"
                          name="Current Path"
                          stroke="#71717a"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="scenario_balance"
                          name="Time Machine Scenario"
                          stroke="#22c55e"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                  {projection?.investment_growth_projection && (
                    <HStack justify="center" spacing={8} mt={4}>
                      <Box textAlign="center">
                        <Text fontSize="sm" color="neutral.500">Current Path (10yr)</Text>
                        <Text fontSize="xl" fontWeight="black" color="neutral.700">
                          {formatCurrencyFull(projection.investment_growth_projection[9]?.current_balance || 0)}
                        </Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontSize="sm" color="neutral.500">Scenario (10yr)</Text>
                        <Text fontSize="xl" fontWeight="black" color="success.600">
                          {formatCurrencyFull(projection.investment_growth_projection[9]?.scenario_balance || 0)}
                        </Text>
                      </Box>
                      <Box textAlign="center">
                        <Text fontSize="sm" color="neutral.500">Difference</Text>
                        <Text fontSize="xl" fontWeight="black" color={projection.investment_growth_projection[9]?.difference > 0 ? 'success.600' : 'error.600'}>
                          {projection.investment_growth_projection[9]?.difference > 0 ? '+' : ''}
                          {formatCurrencyFull(projection.investment_growth_projection[9]?.difference || 0)}
                        </Text>
                      </Box>
                    </HStack>
                  )}
                </ChartSection>

                {/* Disclaimer */}
                <Box
                  bg="neutral.100"
                  border="1px solid"
                  borderColor="neutral.200"
                  borderRadius="8px"
                  p={4}
                >
                  <Text fontSize="xs" color="neutral.600">
                    These projections are for illustrative purposes only and are based on simplified calculations.
                    Actual results will vary based on market conditions, inflation, and other factors.
                    This is not financial advice. Consult a licensed financial advisor for personalized guidance.
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Retirement Calculator Section */}
      <Box py={16} bg="neutral.50" borderTop="2px solid" borderColor="neutral.200">
        <Container maxW="1600px">
          <Box mb={8}>
            <HStack spacing={3} mb={3}>
              <Icon as={MdCalculate} boxSize={8} color="neutral.900" />
              <Text
                fontSize={{ base: '3xl', md: '4xl' }}
                fontWeight="black"
                color="neutral.900"
                letterSpacing="tighter"
              >
                Retirement Calculator
              </Text>
            </HStack>
            <Text fontSize="lg" color="neutral.600">
              See how compound interest can grow your savings over time
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: '400px 1fr' }} gap={8}>
            {/* Calculator Inputs */}
            <Box
              bg="white"
              border="2px solid"
              borderColor="neutral.200"
              borderRadius="8px"
              p={6}
            >
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Current Age: {currentAge}
                  </FormLabel>
                  <Slider
                    value={currentAge}
                    onChange={setCurrentAge}
                    min={18}
                    max={70}
                    step={1}
                  >
                    <SliderTrack bg="neutral.200">
                      <SliderFilledTrack bg="neutral.900" />
                    </SliderTrack>
                    <SliderThumb boxSize={5} />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Retirement Age: {retirementAge}
                  </FormLabel>
                  <Slider
                    value={retirementAge}
                    onChange={setRetirementAge}
                    min={currentAge + 1}
                    max={80}
                    step={1}
                  >
                    <SliderTrack bg="neutral.200">
                      <SliderFilledTrack bg="neutral.900" />
                    </SliderTrack>
                    <SliderThumb boxSize={5} />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Current Savings
                  </FormLabel>
                  <Input
                    type="number"
                    value={currentSavings}
                    onChange={(e) => setCurrentSavings(Number(e.target.value) || 0)}
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Monthly Contribution
                  </FormLabel>
                  <Input
                    type="number"
                    value={retirementMonthlyContribution}
                    onChange={(e) => setRetirementMonthlyContribution(Number(e.target.value) || 0)}
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Expected Annual Return: {expectedReturn}%
                  </FormLabel>
                  <Slider
                    value={expectedReturn}
                    onChange={setExpectedReturn}
                    min={1}
                    max={12}
                    step={0.5}
                  >
                    <SliderTrack bg="neutral.200">
                      <SliderFilledTrack bg="success.500" />
                    </SliderTrack>
                    <SliderThumb boxSize={5} />
                  </Slider>
                </FormControl>

                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.700">
                    Expected Inflation: {inflationRate}%
                  </FormLabel>
                  <Slider
                    value={inflationRate}
                    onChange={setInflationRate}
                    min={1}
                    max={8}
                    step={0.5}
                  >
                    <SliderTrack bg="neutral.200">
                      <SliderFilledTrack bg="error.500" />
                    </SliderTrack>
                    <SliderThumb boxSize={5} />
                  </Slider>
                </FormControl>
              </VStack>
            </Box>

            {/* Results & Chart */}
            <VStack spacing={6} align="stretch">
              {/* Key Results */}
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <Box
                  bg="neutral.900"
                  color="white"
                  p={6}
                  borderRadius="8px"
                >
                  <Text fontSize="xs" color="neutral.400" textTransform="uppercase" fontWeight="bold" mb={2}>
                    Projected Balance at {retirementAge}
                  </Text>
                  <Text fontSize="3xl" fontWeight="black" letterSpacing="tight">
                    ${finalBalance.toLocaleString()}
                  </Text>
                  <HStack mt={2} spacing={4}>
                    <Text fontSize="sm" color="neutral.400">
                      Contributions: ${totalContributions.toLocaleString()}
                    </Text>
                  </HStack>
                </Box>

                <Box
                  bg="success.500"
                  color="white"
                  p={6}
                  borderRadius="8px"
                >
                  <Text fontSize="xs" color="success.100" textTransform="uppercase" fontWeight="bold" mb={2}>
                    Interest Earned (Compound Growth)
                  </Text>
                  <Text fontSize="3xl" fontWeight="black" letterSpacing="tight">
                    ${totalInterest.toLocaleString()}
                  </Text>
                  <Text fontSize="sm" color="success.100" mt={2}>
                    {totalContributions > 0 ? ((totalInterest / totalContributions) * 100).toFixed(0) : 0}% return on contributions
                  </Text>
                </Box>
              </Grid>

              {/* Inflation Warning */}
              <Box
                bg="warning.50"
                border="2px solid"
                borderColor="warning.400"
                borderRadius="8px"
                p={6}
              >
                <HStack spacing={3} mb={3}>
                  <Icon as={MdWarning} boxSize={6} color="warning.600" />
                  <Text fontWeight="bold" color="warning.700" fontSize="lg">
                    The Hidden Cost of Inflation
                  </Text>
                </HStack>
                <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                  <Box>
                    <Text fontSize="xs" color="warning.600" textTransform="uppercase" fontWeight="bold" mb={1}>
                      Today's Purchasing Power
                    </Text>
                    <Text fontSize="2xl" fontWeight="black" color="warning.700">
                      ${Math.round(inflationAdjustedValue).toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="warning.600" textTransform="uppercase" fontWeight="bold" mb={1}>
                      Lost to Inflation
                    </Text>
                    <Text fontSize="2xl" fontWeight="black" color="error.600">
                      -${Math.round(purchasingPowerLoss).toLocaleString()}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="warning.600" textTransform="uppercase" fontWeight="bold" mb={1}>
                      Real Return Rate
                    </Text>
                    <Text fontSize="2xl" fontWeight="black" color={realReturnRate > 0 ? 'success.600' : 'error.600'}>
                      {realReturnRate.toFixed(1)}%
                    </Text>
                  </Box>
                </Grid>
                <Divider my={4} borderColor="warning.300" />
                <Text fontSize="sm" color="warning.700" lineHeight="tall">
                  <strong>Why this matters:</strong> At {inflationRate}% annual inflation, your ${finalBalance.toLocaleString()} will only buy what ${Math.round(inflationAdjustedValue).toLocaleString()} buys today.
                  This is why investing is crucial - keeping money in a savings account (0.5% APY) means losing purchasing power every year.
                  Your real return after inflation is only {realReturnRate.toFixed(1)}%, not {expectedReturn}%.
                </Text>
              </Box>

              {/* Growth Chart */}
              <Box
                bg="white"
                border="2px solid"
                borderColor="neutral.200"
                borderRadius="8px"
                p={6}
              >
                <HStack spacing={3} mb={4}>
                  <Icon as={MdShowChart} boxSize={5} color="neutral.700" />
                  <Text fontWeight="bold" color="neutral.900">
                    Growth Over Time - The Power of Compound Interest
                  </Text>
                </HStack>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={retirementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                    <XAxis
                      dataKey="year"
                      tick={{ fill: '#18181b', fontSize: 12 }}
                      tickFormatter={(value) => `Year ${value}`}
                    />
                    <YAxis
                      tick={{ fill: '#18181b', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#18181b',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '12px',
                      }}
                      formatter={(value, name) => {
                        const labels = {
                          balance: 'Total Balance',
                          contributions: 'Your Contributions',
                          interest: 'Compound Interest',
                        }
                        return [`$${value.toLocaleString()}`, labels[name] || name]
                      }}
                      labelFormatter={(label) => `Year ${label} (Age ${currentAge + label})`}
                      labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="contributions"
                      stackId="1"
                      stroke="#71717a"
                      fill="#d4d4d8"
                      name="Your Contributions"
                    />
                    <Area
                      type="monotone"
                      dataKey="interest"
                      stackId="1"
                      stroke="#22c55e"
                      fill="#86efac"
                      name="Compound Interest"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <Text fontSize="sm" color="neutral.600" mt={4} textAlign="center">
                  Notice how compound interest (green) grows exponentially over time - this is why starting early is so powerful!
                </Text>
              </Box>

              {/* Educational Callout */}
              <Box
                bg="neutral.900"
                color="white"
                p={6}
                borderRadius="8px"
              >
                <Text fontWeight="bold" fontSize="lg" mb={3}>
                  Why Compound Interest is Your Greatest Ally
                </Text>
                <VStack align="stretch" spacing={3}>
                  <HStack align="start" spacing={3}>
                    <Icon as={MdCheckCircle} boxSize={5} color="success.400" mt={0.5} />
                    <Text fontSize="sm" color="neutral.200">
                      <strong>The Rule of 72:</strong> Divide 72 by your return rate to see how many years it takes to double your money. At {expectedReturn}% return, your money doubles every {Math.round(72 / expectedReturn)} years.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Icon as={MdCheckCircle} boxSize={5} color="success.400" mt={0.5} />
                    <Text fontSize="sm" color="neutral.200">
                      <strong>Time is your friend:</strong> Starting 10 years earlier can result in 2-3x more wealth at retirement, even with smaller contributions.
                    </Text>
                  </HStack>
                  <HStack align="start" spacing={3}>
                    <Icon as={MdWarning} boxSize={5} color="warning.400" mt={0.5} />
                    <Text fontSize="sm" color="neutral.200">
                      <strong>Beat inflation:</strong> Cash loses ~{inflationRate}% purchasing power yearly. Investing in diversified index funds historically returns 7-10% annually, outpacing inflation.
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </VStack>
          </Grid>
        </Container>
      </Box>

      {projecting && (
        <Box
          position="fixed"
          bottom={4}
          right={4}
          bg="neutral.900"
          color="white"
          px={4}
          py={2}
          borderRadius="6px"
          boxShadow="lg"
        >
          <HStack spacing={2}>
            <Spinner size="sm" />
            <Text fontSize="sm">Calculating...</Text>
          </HStack>
        </Box>
      )}
    </Box>
  )
}

// Control Section Component
function ControlSection({ title, icon, children }) {
  return (
    <Box
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      overflow="hidden"
    >
      <HStack
        spacing={3}
        p={4}
        bg="neutral.50"
        borderBottom="2px solid"
        borderColor="neutral.200"
      >
        <Icon as={icon} boxSize={5} color="neutral.700" />
        <Text fontSize="md" fontWeight="bold" color="neutral.900">{title}</Text>
      </HStack>
      <Box p={4}>{children}</Box>
    </Box>
  )
}

// Adjustment Slider Component
function AdjustmentSlider({ label, value, onChange, baseline, isIncome = false }) {
  const adjustedValue = baseline ? baseline * (1 + value / 100) : 0
  const isPositive = value > 0
  const isNegative = value < 0
  const exceedsSliderRange = value < -50 || value > 50

  // Handle direct dollar amount input - allows exceeding slider range
  const handleScenarioInput = (inputValue) => {
    if (!baseline || baseline === 0) return
    const newValue = Number(inputValue) || 0
    // Calculate the percentage change from baseline to get to this value
    const percentChange = ((newValue - baseline) / baseline) * 100
    // Round to nearest integer, no clamping - allow any value
    onChange(Math.round(percentChange))
  }

  // Slider value is clamped for display, but actual value can exceed
  const sliderDisplayValue = Math.max(-50, Math.min(50, value))

  return (
    <FormControl>
      <HStack justify="space-between" mb={1}>
        <FormLabel fontSize="sm" fontWeight="semibold" color="neutral.700" mb={0}>
          {label}
        </FormLabel>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color={
            isIncome
              ? (isPositive ? 'success.600' : isNegative ? 'error.600' : 'neutral.600')
              : (isNegative ? 'success.600' : isPositive ? 'error.600' : 'neutral.600')
          }
        >
          {value > 0 ? '+' : ''}{value}%
          {exceedsSliderRange && ' *'}
        </Text>
      </HStack>
      <Slider
        value={sliderDisplayValue}
        onChange={onChange}
        min={-50}
        max={50}
        step={5}
      >
        <SliderTrack bg="neutral.200">
          <SliderFilledTrack
            bg={
              isIncome
                ? (isPositive ? 'success.500' : isNegative ? 'error.500' : 'neutral.400')
                : (isNegative ? 'success.500' : isPositive ? 'error.500' : 'neutral.400')
            }
          />
        </SliderTrack>
        <SliderThumb boxSize={4} />
      </Slider>
      {baseline > 0 && (
        <HStack justify="space-between" mt={1}>
          <Text fontSize="xs" color="neutral.500">
            Current: ${baseline.toFixed(0)}/mo
          </Text>
          <HStack spacing={1}>
            <Text fontSize="xs" color="neutral.600" fontWeight="medium">
              Scenario: $
            </Text>
            <Input
              type="number"
              value={Math.round(adjustedValue)}
              onChange={(e) => handleScenarioInput(e.target.value)}
              size="xs"
              w="70px"
              px={1}
              py={0}
              h="20px"
              fontSize="xs"
              fontWeight="medium"
              color={exceedsSliderRange ? 'primary.600' : 'neutral.900'}
              bg={exceedsSliderRange ? 'primary.50' : 'neutral.50'}
              border="1px solid"
              borderColor={exceedsSliderRange ? 'primary.300' : 'neutral.300'}
              borderRadius="4px"
              textAlign="right"
              _focus={{ borderColor: 'neutral.500', boxShadow: 'none' }}
            />
            <Text fontSize="xs" color="neutral.600">/mo</Text>
          </HStack>
        </HStack>
      )}
    </FormControl>
  )
}

// Summary Card Component
function SummaryCard({ label, value, subtext, variant = 'neutral', showArrow = false }) {
  const bgColors = {
    neutral: 'white',
    success: 'success.50',
    warning: 'warning.50',
    error: 'error.50',
  }
  const borderColors = {
    neutral: 'neutral.200',
    success: 'success.400',
    warning: 'warning.400',
    error: 'error.400',
  }
  const valueColors = {
    neutral: 'neutral.900',
    success: 'success.700',
    warning: 'warning.700',
    error: 'error.700',
  }

  return (
    <Box
      bg={bgColors[variant]}
      border="2px solid"
      borderColor={borderColors[variant]}
      borderRadius="8px"
      p={4}
    >
      <Stat>
        <StatLabel fontSize="xs" color="neutral.600" textTransform="uppercase" fontWeight="bold" letterSpacing="wide">
          {label}
        </StatLabel>
        <StatNumber fontSize="2xl" fontWeight="black" color={valueColors[variant]} letterSpacing="tight">
          {value != null ? formatCurrencyFull(value) : '--'}
        </StatNumber>
        <StatHelpText mb={0} fontSize="sm" color="neutral.600">
          {showArrow && value != null && value !== 0 && (
            <StatArrow type={value > 0 ? 'increase' : 'decrease'} />
          )}
          {subtext}
        </StatHelpText>
      </Stat>
    </Box>
  )
}

// Chart Section Component
function ChartSection({ title, description, children }) {
  return (
    <Box
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      overflow="hidden"
    >
      <Box p={4} borderBottom="1px solid" borderColor="neutral.100">
        <Text fontSize="lg" fontWeight="bold" color="neutral.900">{title}</Text>
        <Text fontSize="sm" color="neutral.600">{description}</Text>
      </Box>
      <Box p={4}>{children}</Box>
    </Box>
  )
}

// Metric Card Component
function MetricCard({ title, currentValue, scenarioValue, note, positive }) {
  return (
    <Box
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      p={5}
    >
      <Text fontSize="sm" fontWeight="bold" color="neutral.600" textTransform="uppercase" letterSpacing="wide" mb={4}>
        {title}
      </Text>
      <Grid templateColumns="1fr 1fr" gap={4}>
        <Box>
          <Text fontSize="xs" color="neutral.500" mb={1}>Current</Text>
          <Text fontSize="xl" fontWeight="black" color="neutral.700">{currentValue}</Text>
        </Box>
        <Box>
          <Text fontSize="xs" color="neutral.500" mb={1}>Scenario</Text>
          <Text fontSize="xl" fontWeight="black" color={positive ? 'success.600' : 'neutral.900'}>{scenarioValue}</Text>
        </Box>
      </Grid>
      <Divider my={3} />
      <Text fontSize="sm" color={positive ? 'success.600' : 'neutral.600'}>{note}</Text>
    </Box>
  )
}
