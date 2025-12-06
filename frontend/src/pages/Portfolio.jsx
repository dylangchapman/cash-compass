import { useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Text,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  HStack,
  VStack,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Container,
} from '@chakra-ui/react'
import { Card, CardHeader, CardBody } from '@chakra-ui/react'
import { MdRefresh, MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { financialAPI } from '../services/api'
import PageHeader from '../components/layout/PageHeader'
import Section from '../components/ui/Section'
import MetricCard from '../components/ui/MetricCard'
import StatusBadge from '../components/ui/StatusBadge'

const COLORS = ['#635bff', '#22c55e', '#f59e0b']

export default function Portfolio() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const toast = useToast()

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    try {
      setLoading(true)
      const data = await financialAPI.getPortfolio()
      setPortfolio(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      await financialAPI.refreshPortfolio()
      await loadPortfolio()
      toast({
        title: 'Portfolio updated',
        description: 'Stock prices have been refreshed',
        status: 'success',
        duration: 3000,
      })
    } catch (err) {
      toast({
        title: 'Error refreshing',
        description: err.message,
        status: 'error',
        duration: 5000,
      })
    } finally {
      setRefreshing(false)
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
        Error loading portfolio: {error}
      </Alert>
    )
  }

  const isPositive = portfolio?.total_gain_loss >= 0
  const allocationData = [
    { name: 'Stocks', value: portfolio?.allocation.stocks.value || 0 },
    { name: 'ETFs', value: portfolio?.allocation.etfs.value || 0 },
    { name: 'Bonds', value: portfolio?.allocation.bonds.value || 0 },
  ].filter(item => item.value > 0)

  return (
    <Box>
      {/* Hero Section */}
      <Box
        bgGradient={isPositive ? "linear(to-br, success.500, success.700)" : "linear(to-br, neutral.600, neutral.800)"}
        color="white"
        py={16}
        mb={12}
        borderRadius="md"
      >
        <Container maxW="container.xl">
          <VStack align="start" spacing={6}>
            <Box>
              <HStack spacing={4} mb={3}>
                <Text fontSize="5xl" fontWeight="bold" letterSpacing="tight" lineHeight="1.1">
                  ${portfolio?.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Icon
                  as={isPositive ? MdTrendingUp : MdTrendingDown}
                  boxSize={12}
                  color={isPositive ? 'green.200' : 'red.200'}
                />
              </HStack>
              <Text fontSize="xl" opacity={0.9} mb={2}>
                Portfolio Value
              </Text>
              <HStack spacing={4}>
                <Text fontSize="lg" fontWeight="semibold">
                  {isPositive ? '+' : ''}{portfolio?.total_return_percent?.toFixed(2)}% Return
                </Text>
                <Text fontSize="md" opacity={0.8}>
                  {isPositive ? '+' : ''}${portfolio?.total_gain_loss?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </HStack>
            </Box>

            {/* Key Metrics - Inline */}
            <Grid
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
              gap={8}
              w="full"
              pt={4}
            >
              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Cost Basis
                </Text>
                <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                  ${portfolio?.total_cost?.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" opacity={0.8} mt={1}>Total invested</Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Holdings
                </Text>
                <Text fontSize="3xl" fontWeight="bold" letterSpacing="tight">
                  {portfolio?.holdings?.length || 0}
                </Text>
                <Text fontSize="sm" opacity={0.8} mt={1}>Active positions</Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" opacity={0.8} mb={2}>
                  Last Updated
                </Text>
                <Text fontSize="xl" fontWeight="bold" letterSpacing="tight">
                  {new Date(portfolio?.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  mt={2}
                  leftIcon={<MdRefresh />}
                  onClick={handleRefresh}
                  isLoading={refreshing}
                  colorScheme="whiteAlpha"
                  borderColor="whiteAlpha.400"
                  _hover={{ bg: 'whiteAlpha.200' }}
                >
                  Refresh
                </Button>
              </Box>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Allocation Chart */}
      <Box bg="white" py={12} mb={12}>
        <Container maxW="container.xl">
          <Box mb={8}>
            <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
              Portfolio Allocation
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Diversification across asset classes
            </Text>
          </Box>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
            <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="neutral.200">
              <Text fontSize="md" fontWeight="semibold" color="neutral.900" mb={6}>
                Asset Allocation
              </Text>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${((entry.value / portfolio.total_value) * 100).toFixed(1)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      padding: '12px',
                    }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <Box bg="white" p={6} borderRadius="md" border="1px solid" borderColor="neutral.200">
              <Text fontSize="md" fontWeight="semibold" color="neutral.900" mb={6}>
                Allocation Breakdown
              </Text>
              <VStack align="stretch" spacing={4}>
                <Box p={4} borderRadius="md" bg="primary.50" borderLeft="4px solid" borderLeftColor="primary.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="neutral.900">Stocks</Text>
                    <StatusBadge status="info">{portfolio?.allocation.stocks.percent.toFixed(1)}%</StatusBadge>
                  </HStack>
                  <Text fontSize="xl" fontWeight="semibold" color="primary.700">
                    ${portfolio?.allocation.stocks.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>

                <Box p={4} borderRadius="md" bg="success.50" borderLeft="4px solid" borderLeftColor="success.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="neutral.900">ETFs</Text>
                    <StatusBadge status="success">{portfolio?.allocation.etfs.percent.toFixed(1)}%</StatusBadge>
                  </HStack>
                  <Text fontSize="xl" fontWeight="semibold" color="success.700">
                    ${portfolio?.allocation.etfs.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>

                <Box p={4} borderRadius="md" bg="warning.50" borderLeft="4px solid" borderLeftColor="warning.500">
                  <HStack justify="space-between" mb={2}>
                    <Text fontWeight="semibold" color="neutral.900">Bonds</Text>
                    <StatusBadge status="warning">{portfolio?.allocation.bonds.percent.toFixed(1)}%</StatusBadge>
                  </HStack>
                  <Text fontSize="xl" fontWeight="semibold" color="warning.700">
                    ${portfolio?.allocation.bonds.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>
              </VStack>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Holdings Table */}
      <Box bg="white" py={12}>
        <Container maxW="container.xl">
          <Box mb={8}>
            <Text fontSize="3xl" fontWeight="bold" color="neutral.900" mb={2}>
              Holdings
            </Text>
            <Text fontSize="lg" color="neutral.600">
              Your current equity positions
            </Text>
          </Box>

          <Box bg="white" borderRadius="md" border="1px solid" borderColor="neutral.200" overflow="hidden">
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg="neutral.50">
                  <Tr>
                    <Th>Symbol</Th>
                    <Th>Name</Th>
                    <Th isNumeric>Shares</Th>
                    <Th isNumeric>Cost Basis</Th>
                    <Th isNumeric>Current Price</Th>
                    <Th isNumeric>Market Value</Th>
                    <Th isNumeric>Gain/Loss</Th>
                    <Th isNumeric>Return %</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {portfolio?.holdings?.map((holding, idx) => {
                    const isGain = holding.gain_loss >= 0
                    return (
                      <Tr key={idx} _hover={{ bg: 'neutral.50' }}>
                        <Td fontWeight="semibold" color="primary.600">{holding.symbol}</Td>
                        <Td fontSize="sm" color="neutral.700">{holding.name}</Td>
                        <Td isNumeric fontSize="sm">{holding.shares}</Td>
                        <Td isNumeric fontSize="sm">${holding.cost_basis.toFixed(2)}</Td>
                        <Td isNumeric fontSize="sm" fontWeight="medium">${holding.current_price.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="semibold">${holding.current_value.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="semibold" color={isGain ? 'success.600' : 'error.600'}>
                          {isGain ? '+' : ''}${holding.gain_loss.toFixed(2)}
                        </Td>
                        <Td isNumeric fontWeight="semibold" color={isGain ? 'success.600' : 'error.600'}>
                          {isGain ? '+' : ''}{holding.gain_loss_percent.toFixed(2)}%
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}
