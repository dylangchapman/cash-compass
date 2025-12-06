import { useState, useEffect } from 'react'
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
  Divider,
  Progress,
} from '@chakra-ui/react'
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
import { MdTrendingUp, MdTrendingDown, MdCheckCircle, MdFlag } from 'react-icons/md'
import { financialAPI } from '../services/api'

const DEFAULT_NET_WORTH_GOAL = 50000

const COLORS = ['#18181b', '#3f3f46', '#71717a', '#a1a1aa', '#d4d4d8', '#e4e4e7']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [netWorth, setNetWorth] = useState(null)
  const [netWorthProgress, setNetWorthProgress] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [result, nw] = await Promise.all([
        financialAPI.getDashboardSummary(),
        financialAPI.getNetWorth()
      ])
      setData(result)
      setNetWorth(nw)

      // Load net worth progress
      const progress = await financialAPI.analyzeNetWorthGoal(DEFAULT_NET_WORTH_GOAL)
      setNetWorthProgress(progress)
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
        Error loading dashboard: {error}
      </Alert>
    )
  }

  const savingsRate = data?.savings_rate || 0
  const isPositiveSavings = savingsRate > 0
  const monthsOfData = 6
  const monthlyAvgExpenses = data?.total_expenses ? (data.total_expenses / monthsOfData) : 0

  const categoryData = data?.top_categories?.map(cat => ({
    name: cat.category,
    value: cat.total,
    percentage: cat.percentage,
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
    let ytdTotal = 0

    return sortedMonths.map(month => {
      ytdTotal += monthlyTotals[month]
      const monthNumber = month.substring(5, 7)
      return {
        month: getMonthAbbreviation(monthNumber),
        fullMonth: month,
        monthlySpend: monthlyTotals[month],
        ytdSpend: ytdTotal
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
                label="Monthly Average"
                value={`$${monthlyAvgExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                sublabel="Per month"
              />
              <MetricBlock
                label="YTD Total"
                value={`$${data?.total_expenses?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
                sublabel="Year to date"
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
            description="Breakdown of expenses by category"
          />

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12} mt={12}>
            {/* Bar Chart */}
            <ChartCard title="Top categories">
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
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 16px',
                    }}
                    formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']}
                    labelStyle={{ color: '#ffffff', marginBottom: '4px', fontWeight: 600 }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
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
            <ChartCard title="Distribution">
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{
                      position: 'inside',
                      formatter: (entry) => entry.percentage > 5 ? `${entry.percentage?.toFixed(0)}%` : '',
                      fill: '#ffffff',
                      fontSize: 14,
                      fontWeight: 700,
                    }}
                    outerRadius={130}
                    fill="#18181b"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '12px 16px',
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                    itemStyle={{ color: '#ffffff', fontWeight: 600 }}
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
              description="Monthly expenses and year-to-date cumulative spend"
            />

            <ChartCard title="6-month overview" mt={12}>
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
                    dataKey="ytdSpend"
                    name="YTD Cumulative"
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
      {netWorthProgress && (
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
                  <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" letterSpacing="tight">
                    ${netWorth?.total_net_worth?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold" mb={2}>
                    Target Goal
                  </Text>
                  <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" letterSpacing="tight">
                    ${DEFAULT_NET_WORTH_GOAL.toLocaleString('en-US')}
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold" mb={2}>
                    Progress
                  </Text>
                  <Text
                    fontSize={{ base: '3xl', md: '4xl' }}
                    fontWeight="black"
                    letterSpacing="tight"
                    color={netWorthProgress?.on_track ? 'success.400' : 'warning.400'}
                  >
                    {netWorthProgress?.progress_percent?.toFixed(1)}%
                  </Text>
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
                const milestoneAmount = (DEFAULT_NET_WORTH_GOAL * pct) / 100

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
                <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tight">
                  ${netWorthProgress?.remaining?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
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
                <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tight">
                  {netWorthProgress?.months_to_goal > 0 ? `${Math.ceil(netWorthProgress.months_to_goal)} months` : 'Calculating...'}
                </Text>
              </Box>
            </Grid>
          </Container>
        </Box>
      )}

      {/* ANOMALIES SECTION */}
      {data?.recent_anomalies && data.recent_anomalies.length > 0 && (
        <Box py={24} bg="white" borderTop="1px solid" borderColor="neutral.200">
          <Container maxW="1400px">
            <SectionHeader
              title="Unusual activity"
              description="Transactions that differ from your typical spending patterns"
            />

            <VStack spacing={4} align="stretch" mt={12}>
              {data.recent_anomalies.map((anomaly, idx) => (
                <Box
                  key={idx}
                  bg="white"
                  p={8}
                  border="2px solid"
                  borderColor="warning.300"
                  borderRadius="8px"
                  transition="all 0.2s"
                  _hover={{
                    borderColor: 'warning.600',
                    transform: 'translateY(-2px)',
                  }}
                >
                  <Flex justify="space-between" align="start">
                    <VStack align="start" spacing={3}>
                      <HStack spacing={3}>
                        <Text fontSize="xl" fontWeight="bold" color="neutral.900">
                          {anomaly.merchant}
                        </Text>
                        <Box bg="warning.100" px={3} py={1} borderRadius="4px">
                          <Text fontSize="xs" fontWeight="bold" color="warning.800" textTransform="uppercase" letterSpacing="wide">
                            Unusual
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                        {anomaly.date} • {anomaly.category}
                      </Text>
                      {anomaly.note && (
                        <Text fontSize="sm" color="neutral.700" mt={2}>
                          {anomaly.note}
                        </Text>
                      )}
                    </VStack>
                    <Text fontSize="4xl" fontWeight="black" color="warning.600" letterSpacing="tighter">
                      ${anomaly.amount?.toFixed(2)}
                    </Text>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </Container>
        </Box>
      )}
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
