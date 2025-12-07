import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Grid,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Container,
  Icon,
  Flex,
  Skeleton,
  Button,
} from '@chakra-ui/react'
import { Link } from 'react-router-dom'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { MdTrendingUp, MdTrendingDown, MdCheckCircle } from 'react-icons/md'
import { financialAPI } from '../services/api'
import { getCached, setCache } from '../utils/cache'

// Net worth goal milestones - auto-adjusts based on current net worth
const NET_WORTH_MILESTONES = [50000, 100000, 250000, 500000, 1000000, 2500000, 5000000]

// Helper to calculate the appropriate net worth goal based on current value
const calculateNetWorthGoal = (currentNetWorth) => {
  if (!currentNetWorth || currentNetWorth <= 0) return NET_WORTH_MILESTONES[0]

  // Find the next milestone above current net worth
  for (const milestone of NET_WORTH_MILESTONES) {
    if (currentNetWorth < milestone) {
      return milestone
    }
  }
  // If above all milestones, set goal to next round number
  return Math.ceil(currentNetWorth / 1000000) * 1000000 + 1000000
}

// Helper to get the goal after the current one
const getNextGoalAfterCurrent = (currentGoal) => {
  const currentIndex = NET_WORTH_MILESTONES.indexOf(currentGoal)
  if (currentIndex >= 0 && currentIndex < NET_WORTH_MILESTONES.length - 1) {
    return NET_WORTH_MILESTONES[currentIndex + 1]
  }
  // If current goal is not in milestones or is the last one, calculate next
  return Math.ceil(currentGoal / 1000000) * 1000000 + 1000000
}

const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7']

const CACHE_KEYS = {
  NET_WORTH: 'cached_net_worth',
  NET_WORTH_PROGRESS: 'cached_net_worth_progress',
}

export default function Dashboard() {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  // Core data loading (fast - blocks page)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // Net worth data (can load async with cache)
  const [netWorth, setNetWorth] = useState(() => getCached(CACHE_KEYS.NET_WORTH))
  const [netWorthLoading, setNetWorthLoading] = useState(false)

  // Net worth progress (AI call - loads async with cache)
  const [netWorthProgress, setNetWorthProgress] = useState(() => getCached(CACHE_KEYS.NET_WORTH_PROGRESS))
  const [progressLoading, setProgressLoading] = useState(false)

  // Calculate dynamic goal based on current net worth
  const currentNetWorthGoal = calculateNetWorthGoal(netWorth?.total_net_worth)

  // Load core dashboard data
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const result = await financialAPI.getDashboardSummary()
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Load net worth data (async)
  const loadNetWorth = useCallback(async () => {
    try {
      setNetWorthLoading(true)
      const nw = await financialAPI.getNetWorth()
      setNetWorth(nw)
      setCache(CACHE_KEYS.NET_WORTH, nw)
    } catch (err) {
      console.error('Error loading net worth:', err)
    } finally {
      setNetWorthLoading(false)
    }
  }, [])

  // Load net worth progress (AI call - async)
  const loadNetWorthProgress = useCallback(async (goalAmount) => {
    try {
      setProgressLoading(true)
      const progress = await financialAPI.analyzeNetWorthGoal(goalAmount)
      setNetWorthProgress(progress)
      setCache(CACHE_KEYS.NET_WORTH_PROGRESS, progress)
    } catch (err) {
      console.error('Error loading net worth progress:', err)
    } finally {
      setProgressLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false)
      return
    }
    // Load core data first (blocks page)
    loadDashboardData()
    // Load net worth data (non-blocking with cache fallback)
    loadNetWorth()
  }, [loadDashboardData, loadNetWorth, isLoggedIn])

  // Load net worth progress when net worth is available
  useEffect(() => {
    if (isLoggedIn && netWorth?.total_net_worth !== undefined) {
      const goal = calculateNetWorthGoal(netWorth.total_net_worth)
      loadNetWorthProgress(goal)
    }
  }, [netWorth?.total_net_worth, loadNetWorthProgress, isLoggedIn])

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
        Error loading dashboard: {error}
      </Alert>
    )
  }

  // Show login prompt when not authenticated
  if (!isLoggedIn) {
    return (
      <Box bg="white" minH="100vh">
        <Box
          bg="neutral.900"
          color="white"
          pt={32}
          pb={40}
          position="relative"
          overflow="hidden"
        >
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
            <VStack align="center" spacing={8} textAlign="center">
              <Box maxW="700px">
                <Text
                  fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                  fontWeight="black"
                  letterSpacing="tighter"
                  lineHeight="tighter"
                  mb={6}
                >
                  Your financial overview
                </Text>
                <Text
                  fontSize={{ base: 'lg', md: 'xl' }}
                  color="neutral.400"
                  fontWeight="normal"
                  lineHeight="relaxed"
                >
                  Sign in to view your personalized spending patterns, track savings, and gain insights into your financial health.
                </Text>
              </Box>
              <Button
                as={Link}
                to="/login"
                size="lg"
                bg="white"
                color="neutral.900"
                _hover={{ bg: 'neutral.100' }}
                px={8}
              >
                Sign In to View Dashboard
              </Button>
            </VStack>
          </Container>
        </Box>
      </Box>
    )
  }

  const savingsRate = data?.savings_rate || 0
  const isPositiveSavings = savingsRate > 0
  const monthsOfData = 12 // Trailing 12 months
  const monthlyAvgExpenses = data?.total_expenses ? (data.total_expenses / monthsOfData) : 0

  const categoryData = data?.top_categories?.map(cat => ({
    name: cat.category,
    value: cat.total,
    percentage: cat.percentage,
    monthlyAvg: cat.total / monthsOfData, // Per month figure for tooltip
  })) || []

  const getMonthAbbreviation = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[parseInt(monthNum) - 1] || monthNum
  }

  const calculateMonthlyTotals = () => {
    if (!data?.monthly_trends || data.monthly_trends.length === 0) return []

    const monthlyTotals = {}

    data.monthly_trends.forEach(categoryTrend => {
      categoryTrend.monthly_data.forEach(monthData => {
        const month = monthData.month
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0
        }
        monthlyTotals[month] += monthData.amount
      })
    })

    const sortedMonths = Object.keys(monthlyTotals).sort()
    // Only take trailing 12 months
    const trailing12Months = sortedMonths.slice(-12)
    let cumulativeTotal = 0

    return trailing12Months.map(month => {
      cumulativeTotal += monthlyTotals[month]
      const monthNumber = month.substring(5, 7)
      return {
        month: getMonthAbbreviation(monthNumber),
        fullMonth: month,
        monthlySpend: monthlyTotals[month],
        cumulativeSpend: cumulativeTotal
      }
    })
  }

  const trendData = calculateMonthlyTotals()

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION - Full width, bold typography */}
      <Box
        bg="neutral.900"
        color="white"
        pt={32}
        pb={40}
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
          <VStack align="start" spacing={12}>
            {/* Main headline */}
            <Box maxW="900px">
              <Text
                fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
                fontWeight="black"
                letterSpacing="tighter"
                lineHeight="tighter"
                mb={6}
              >
                Your financial overview
              </Text>
              <Text
                fontSize={{ base: 'lg', md: 'xl' }}
                color="neutral.400"
                fontWeight="normal"
                lineHeight="relaxed"
                maxW="700px"
              >
                Track spending patterns, monitor savings, and gain insights into your financial health
              </Text>
            </Box>

            {/* Key metrics grid */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={8}
              w="full"
              pt={8}
            >
              <MetricBlock
                label="Monthly Average Expenses"
                value={`$${monthlyAvgExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                sublabel="per month"
              />
              <MetricBlock
                label="YTD Total expenses"
                value={`$${data?.total_expenses?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                sublabel="year to date"
              />
              <MetricBlock
                label="Net Savings"
                value={`$${data?.net_savings?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                sublabel={`${Math.abs(savingsRate).toFixed(1)}% savings rate`}
                icon={isPositiveSavings ? MdTrendingUp : MdTrendingDown}
                iconColor={isPositiveSavings ? 'success.500' : 'error.500'}
              />
              <MetricBlock
                label="Subscriptions"
                value={data?.active_subscriptions || 0}
                sublabel={`$${data?.subscription_cost?.toFixed(0) || 0}/month`}
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* SPENDING ANALYSIS SECTION */}
      <Box py={24} bg="white">
        <Container maxW="1400px">
          <SectionHeader
            title="Spending analysis"
            description="Breakdown of your expenses by category over the trailing 12 months"
          />

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12} mt={12}>
            {/* Bar Chart */}
            <ChartCard title="Top spending categories (trailing 12 months)">
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#18181b', fontSize: 13, fontWeight: 600 }}
                    stroke="#e4e4e7"
                  />
                  <YAxis tick={{ fill: '#18181b', fontSize: 13, fontWeight: 600 }} stroke="#e4e4e7" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <Box bg="#18181b" p={3} borderRadius="6px">
                            <Text color="white" fontWeight="bold" mb={2}>{label}</Text>
                            <Text color="white" fontSize="sm">
                              Total: ${data.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Text>
                            <Text color="neutral.400" fontSize="sm">
                              ~${data.monthlyAvg?.toLocaleString('en-US', { minimumFractionDigits: 2 })}/month
                            </Text>
                          </Box>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie Chart */}
            <ChartCard title="Spending distribution by category (trailing 12 months)">
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={{
                      position: 'inside',
                      formatter: (entry) => entry.percentage > 5 ? `${entry.percentage?.toFixed(0)}%` : '',
                      fill: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    outerRadius={120}
                    fill="#18181b"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <Box bg="#18181b" p={3} borderRadius="6px">
                            <Text color="white" fontWeight="bold" mb={2}>{data.name}</Text>
                            <Text color="white" fontSize="lg" fontWeight="bold">
                              {data.percentage?.toFixed(1)}%
                            </Text>
                            <Text color="neutral.400" fontSize="sm">
                              ${data.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </Text>
                          </Box>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      paddingTop: '16px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                    formatter={(value) => <span style={{ color: '#18181b' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        </Container>
      </Box>

      {/* SPENDING TRENDS SECTION */}
      {trendData.length > 0 && (
        <Box py={24} bg="neutral.50">
          <Container maxW="1400px">
            <SectionHeader
              title="Spending trends"
              description="Monthly expenses and cumulative spend over the trailing 12 months"
            />

            <ChartCard title="Monthly spending overview (trailing 12 months)" mt={12}>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#18181b', fontSize: 13, fontWeight: 600 }}
                    stroke="#e4e4e7"
                  />
                  <YAxis tick={{ fill: '#18181b', fontSize: 13, fontWeight: 600 }} stroke="#e4e4e7" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 16px',
                    }}
                    formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                    labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#18181b',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="monthlySpend"
                    name="Monthly Spend"
                    stroke="#18181b"
                    strokeWidth={3}
                    dot={{ fill: '#18181b', r: 6, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeSpend"
                    name="Cumulative Spend"
                    stroke="#71717a"
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    dot={{ fill: '#71717a', r: 6, strokeWidth: 2, stroke: 'white' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </Container>
        </Box>
      )}

      {/* MILESTONES SECTION */}
      <Box py={24} bg="white" borderTop="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <SectionHeader
            title="Financial milestones"
            description="Track your progress toward your net worth goal"
          />

          {/* Net Worth Overview Card */}
          <Box
            bg="neutral.900"
            color="white"
            p={8}
            borderRadius="8px"
            mt={12}
          >
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8} mb={6}>
              <Box>
                <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold" mb={2}>
                  Current Net Worth
                </Text>
                {netWorth ? (
                  <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" letterSpacing="tight">
                    ${netWorth?.total_net_worth?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                ) : (
                  <Skeleton height="40px" width="180px" startColor="neutral.700" endColor="neutral.600" />
                )}
              </Box>
              <Box>
                <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold" mb={2}>
                  Target Goal
                </Text>
                <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" letterSpacing="tight">
                  ${currentNetWorthGoal.toLocaleString('en-US')}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold" mb={2}>
                  Progress
                </Text>
                {netWorthProgress ? (
                  <Text
                    fontSize={{ base: '3xl', md: '4xl' }}
                    fontWeight="black"
                    letterSpacing="tight"
                    color={netWorthProgress?.on_track ? 'success.400' : 'warning.400'}
                  >
                    {netWorthProgress?.progress_percent?.toFixed(1)}%
                  </Text>
                ) : (
                  <HStack spacing={2}>
                    <Skeleton height="40px" width="100px" startColor="neutral.700" endColor="neutral.600" />
                    {progressLoading && <Spinner size="sm" color="neutral.400" />}
                  </HStack>
                )}
              </Box>
            </Grid>
            <Box>
              <Box bg="neutral.700" h="12px" borderRadius="6px" overflow="hidden">
                <Box
                  bg={netWorthProgress?.on_track ? 'success.500' : 'warning.500'}
                  h="full"
                  w={`${Math.min(netWorthProgress?.progress_percent || 0, 100)}%`}
                  transition="width 0.5s ease"
                />
              </Box>
            </Box>
          </Box>

            {/* Milestone Progress Indicators */}
            <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' }} gap={4} mt={8}>
              {[25, 50, 75, 90, 100].map((pct) => {
                const achieved = netWorthProgress?.milestones_achieved?.some(m => m.percent === pct)
                const isCurrent = netWorthProgress?.next_milestone?.percent === pct
                const milestoneAmount = (currentNetWorthGoal * pct) / 100

                return (
                  <Box
                    key={pct}
                    p={4}
                    bg={achieved ? 'neutral.900' : isCurrent ? 'neutral.100' : 'white'}
                    border="2px solid"
                    borderColor={achieved ? 'neutral.900' : isCurrent ? 'neutral.400' : 'neutral.200'}
                    borderRadius="8px"
                    textAlign="center"
                    transition="all 0.2s"
                  >
                    {achieved ? (
                      <Icon as={MdCheckCircle} boxSize={8} color="white" mb={2} />
                    ) : (
                      <Text fontSize="2xl" fontWeight="black" color={isCurrent ? 'neutral.900' : 'neutral.400'} mb={2}>
                        {pct}%
                      </Text>
                    )}
                    <Text fontSize="sm" fontWeight="bold" color={achieved ? 'white' : 'neutral.700'}>
                      ${milestoneAmount.toLocaleString()}
                    </Text>
                    <Text fontSize="xs" color={achieved ? 'neutral.400' : 'neutral.500'} mt={1}>
                      {achieved ? 'Achieved' : isCurrent ? 'Next Goal' : 'Upcoming'}
                    </Text>
                  </Box>
                )
              })}
            </Grid>

          {/* Additional Stats */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6} mt={8}>
            <Box
              p={6}
              bg="neutral.50"
              border="2px solid"
              borderColor="neutral.200"
              borderRadius="8px"
            >
              <Text fontSize="xs" color="neutral.500" textTransform="uppercase" fontWeight="bold" mb={2}>
                Remaining to Goal
              </Text>
              {netWorthProgress ? (
                <>
                  <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tight">
                    ${netWorthProgress?.remaining?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                  <Text fontSize="sm" color="neutral.600" mt={2}>
                    Next goal: ${getNextGoalAfterCurrent(currentNetWorthGoal).toLocaleString('en-US')}
                  </Text>
                </>
              ) : (
                <Skeleton height="36px" width="150px" />
              )}
            </Box>
            <Box
              p={6}
              bg="neutral.50"
              border="2px solid"
              borderColor="neutral.200"
              borderRadius="8px"
            >
              <Text fontSize="xs" color="neutral.500" textTransform="uppercase" fontWeight="bold" mb={2}>
                Estimated Time to Goal
              </Text>
              {netWorthProgress ? (
                <>
                  <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tight">
                    {netWorthProgress?.months_to_goal > 0 ? `${Math.ceil(netWorthProgress.months_to_goal)} months` : 'Calculating...'}
                  </Text>
                  {netWorthProgress?.months_to_goal > 0 && netWorthProgress?.remaining > 0 && (
                    <Text fontSize="sm" color="neutral.600" mt={2}>
                      at ${Math.round(netWorthProgress.remaining / netWorthProgress.months_to_goal).toLocaleString('en-US')}/month
                    </Text>
                  )}
                </>
              ) : (
                <Skeleton height="36px" width="120px" />
              )}
            </Box>
          </Grid>
        </Container>
      </Box>

    </Box>
  )
}

// Metric Block Component
function MetricBlock({ label, value, sublabel, icon, iconColor }) {
  return (
    <Box>
      <Text
        fontSize="xs"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="wider"
        color="neutral.500"
        mb={3}
      >
        {label}
      </Text>
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

// Chart Card Component
function ChartCard({ title, children, ...props }) {
  return (
    <Box
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      p={8}
      transition="all 0.2s"
      _hover={{
        borderColor: 'neutral.300',
      }}
      {...props}
    >
      <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={6} letterSpacing="tight">
        {title}
      </Text>
      {children}
    </Box>
  )
}
