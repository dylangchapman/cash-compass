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
} from '@chakra-ui/react'
import { Card, CardHeader, CardBody } from '@chakra-ui/react'
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
import { MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import MetricCard from '../components/ui/MetricCard'
import Section from '../components/ui/Section'
import StatusBadge from '../components/ui/StatusBadge'

const COLORS = ['#635bff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const result = await financialAPI.getDashboardSummary()
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
        Error loading dashboard: {error}
      </Alert>
    )
  }

  const savingsRate = data?.savings_rate || 0
  const isPositiveSavings = savingsRate > 0

  // Calculate monthly average (assuming 6 months of data)
  const monthsOfData = 6
  const monthlyAvgExpenses = data?.total_expenses ? (data.total_expenses / monthsOfData) : 0

  const categoryData = data?.top_categories?.map(cat => ({
    name: cat.category,
    value: cat.total,
    percentage: cat.percentage,
  })) || []

  // Convert month number to abbreviation
  const getMonthAbbreviation = (monthNum) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[parseInt(monthNum) - 1] || monthNum
  }

  // Calculate total monthly spend across ALL categories
  const calculateMonthlyTotals = () => {
    if (!data?.monthly_trends || data.monthly_trends.length === 0) return []

    const monthlyTotals = {}

    // Aggregate spending from all categories by month
    data.monthly_trends.forEach(categoryTrend => {
      categoryTrend.monthly_data.forEach(monthData => {
        const month = monthData.month
        if (!monthlyTotals[month]) {
          monthlyTotals[month] = 0
        }
        monthlyTotals[month] += monthData.amount
      })
    })

    // Convert to array and calculate YTD cumulative
    const sortedMonths = Object.keys(monthlyTotals).sort()
    let ytdTotal = 0

    return sortedMonths.map(month => {
      ytdTotal += monthlyTotals[month]
      const monthNumber = month.substring(5, 7) // Extract MM from YYYY-MM
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
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient="linear(to-br, primary.500, primary.700)"
        color="white"
        py={16}
        mb={12}
        borderRadius="md"
      >
        <Container maxW="container.xl">
          <VStack align="start" spacing={6}>
            <Box>
              <Text fontSize="5xl" fontWeight="bold" letterSpacing="tight" lineHeight="1.1">
                Financial Overview
              </Text>
              <Text fontSize="xl" mt={3} opacity={0.9}>
                Your complete financial picture at a glance
              </Text>
            </Box>

            {/* Key Metrics - Inline */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
              gap={8}
              w="full"
              pt={4}
            >
              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Monthly Avg
                </Text>
                <Text fontSize="4xl" fontWeight="bold" letterSpacing="tight">
                  ${monthlyAvgExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" opacity={0.8} mt={1}>Average per month</Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  YTD Total
                </Text>
                <Text fontSize="4xl" fontWeight="bold" letterSpacing="tight">
                  ${data?.total_expenses?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" opacity={0.8} mt={1}>Year to date</Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Net Savings
                </Text>
                <HStack spacing={2}>
                  <Text fontSize="4xl" fontWeight="bold" letterSpacing="tight">
                    ${data?.net_savings?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </Text>
                  <Icon
                    as={isPositiveSavings ? MdTrendingUp : MdTrendingDown}
                    boxSize={8}
                    color={isPositiveSavings ? 'green.200' : 'red.200'}
                  />
                </HStack>
                <Text fontSize="sm" opacity={0.8} mt={1}>{Math.abs(savingsRate).toFixed(1)}% savings rate</Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Subscriptions
                </Text>
                <Text fontSize="4xl" fontWeight="bold" letterSpacing="tight">
                  {data?.active_subscriptions || 0}
                </Text>
                <Text fontSize="sm" opacity={0.8} mt={1}>${data?.subscription_cost?.toFixed(0) || 0}/month</Text>
              </Box>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Charts Section */}
      <Box bg="white" py={12} mb={12}>
        <Container maxW="container.xl">
          <Box mb={8}>
            <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
              Spending Analysis
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Breakdown of your expenses and patterns
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={12}>
            {/* Bar Chart */}
            <Box>
              <Text fontSize="xl" fontWeight="semibold" color="neutral.900" mb={6}>
                Spending by Category
              </Text>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    tick={{ fill: '#71717a', fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      padding: '12px',
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>

            {/* Pie Chart */}
            <Box>
              <Text fontSize="xl" fontWeight="semibold" color="neutral.900" mb={6}>
                Category Distribution
              </Text>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => entry.percentage > 5 ? `${entry.percentage?.toFixed(0)}%` : ''}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      padding: '12px',
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Trend Line Chart */}
      {trendData.length > 0 && (
        <Box bg="neutral.50" py={12} mb={12}>
          <Container maxW="container.xl">
            <Box mb={8}>
              <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
                Spending Trends
              </Text>
              <Text fontSize="lg" color="neutral.600">
                Track monthly expenses and year-to-date cumulative spend
              </Text>
            </Box>

            <Box bg="white" p={8} borderRadius="md" border="1px solid" borderColor="neutral.200">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: '#71717a', fontSize: 13 }}
                  />
                  <YAxis tick={{ fill: '#71717a', fontSize: 13 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '6px',
                      padding: '12px',
                    }}
                    formatter={(value) => `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  />
                  <Legend
                    wrapperStyle={{
                      paddingTop: '20px',
                      fontSize: '14px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="monthlySpend"
                    name="Monthly Spend"
                    stroke="#635bff"
                    strokeWidth={3}
                    dot={{ fill: '#635bff', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ytdSpend"
                    name="YTD Cumulative"
                    stroke="#22c55e"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    dot={{ fill: '#22c55e', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Container>
        </Box>
      )}

      {/* Anomalies */}
      {data?.recent_anomalies && data.recent_anomalies.length > 0 && (
        <Box bg="warning.50" py={12}>
          <Container maxW="container.xl">
            <Box mb={8}>
              <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
                Unusual Activity
              </Text>
              <Text fontSize="lg" color="neutral.700">
                Transactions that differ from your typical spending patterns
              </Text>
            </Box>

            <VStack spacing={4} align="stretch">
              {data.recent_anomalies.map((anomaly, idx) => (
                <Box
                  key={idx}
                  bg="white"
                  p={6}
                  borderRadius="md"
                  borderLeft="4px solid"
                  borderLeftColor="warning.600"
                >
                  <HStack justify="space-between" align="start">
                    <VStack align="start" spacing={2}>
                      <HStack spacing={3}>
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.900">
                          {anomaly.merchant}
                        </Text>
                        <Box bg="warning.100" px={3} py={1} borderRadius="sm">
                          <Text fontSize="xs" fontWeight="semibold" color="warning.800" textTransform="uppercase">
                            Unusual
                          </Text>
                        </Box>
                      </HStack>
                      <Text fontSize="sm" color="neutral.600">
                        {anomaly.date} • {anomaly.category}
                      </Text>
                      {anomaly.note && (
                        <Text fontSize="sm" color="neutral.700" mt={1}>
                          {anomaly.note}
                        </Text>
                      )}
                    </VStack>
                    <Text fontSize="3xl" fontWeight="bold" color="warning.700" letterSpacing="tight">
                      ${anomaly.amount?.toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              ))}
            </VStack>
          </Container>
        </Box>
      )}
    </Box>
  )
}
