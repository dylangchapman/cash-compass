import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
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
  Input,
  Select,
  Grid,
  Flex,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { MdArrowBack, MdSearch, MdFilterList, MdSort } from 'react-icons/md'
import { financialAPI } from '../services/api'

export default function CategoryTransactions() {
  const { category } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  // Filter and sort state
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState('date')
  const [sortDirection, setSortDirection] = useState('desc')
  const [dateFilter, setDateFilter] = useState('all')

  useEffect(() => {
    loadTransactions()
  }, [category])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const result = await financialAPI.getTransactionsByCategory(category)
      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return []

    let filtered = [...data.transactions]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(t =>
        t.merchant.toLowerCase().includes(term) ||
        (t.notes && t.notes.toLowerCase().includes(term))
      )
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      let cutoffDate = new Date()

      switch (dateFilter) {
        case '30days':
          cutoffDate.setDate(now.getDate() - 30)
          break
        case '90days':
          cutoffDate.setDate(now.getDate() - 90)
          break
        case '6months':
          cutoffDate.setMonth(now.getMonth() - 6)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }

      filtered = filtered.filter(t => new Date(t.date) >= cutoffDate)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'merchant':
          comparison = a.merchant.localeCompare(b.merchant)
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [data?.transactions, searchTerm, sortField, sortDirection, dateFilter])

  // Calculate filtered total
  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0)
  }, [filteredTransactions])

  if (loading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="neutral.900" thickness="3px" />
      </Center>
    )
  }

  if (error) {
    return (
      <Box py={24}>
        <Container maxW="1400px">
          <Alert status="error" borderRadius="8px">
            <AlertIcon />
            Error loading transactions: {error}
          </Alert>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={24} pb={16}>
        <Container maxW="1400px">
          <Button
            variant="ghost"
            color="neutral.400"
            leftIcon={<MdArrowBack />}
            onClick={() => navigate('/insights')}
            mb={8}
            _hover={{ color: 'white', bg: 'neutral.800' }}
            pl={0}
          >
            Back to Insights
          </Button>

          <Text
            fontSize={{ base: '4xl', md: '5xl', lg: '6xl' }}
            fontWeight="black"
            letterSpacing="tighter"
            mb={4}
          >
            {decodeURIComponent(category)}
          </Text>
          <Text fontSize="xl" color="neutral.400">
            {data?.count || 0} transactions
          </Text>
        </Container>
      </Box>

      {/* Summary Stats */}
      <Box py={12} bg="neutral.50" borderBottom="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
            <StatCard
              label="Total Spending"
              value={`$${data?.total?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}`}
              sublabel="All time in this category"
            />
            <StatCard
              label="Filtered Total"
              value={`$${filteredTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              sublabel={`${filteredTransactions.length} matching transactions`}
            />
            <StatCard
              label="Average Transaction"
              value={`$${filteredTransactions.length > 0
                ? (filteredTotal / filteredTransactions.length).toLocaleString('en-US', { minimumFractionDigits: 2 })
                : '0.00'}`}
              sublabel="Per transaction"
            />
          </Grid>
        </Container>
      </Box>

      {/* Filters */}
      <Box py={8} bg="white" borderBottom="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <Icon as={MdSearch} color="neutral.400" />
              </InputLeftElement>
              <Input
                placeholder="Search merchants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                color="neutral.900"
              />
            </InputGroup>

            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              bg="white"
              color="neutral.900"
              icon={<MdFilterList />}
            >
              <option value="all">All Time</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="6months">Last 6 Months</option>
              <option value="year">Last Year</option>
            </Select>

            <Select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              bg="white"
              color="neutral.900"
              icon={<MdSort />}
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="merchant">Sort by Merchant</option>
            </Select>

            <Select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value)}
              bg="white"
              color="neutral.900"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </Select>
          </Grid>
        </Container>
      </Box>

      {/* Transactions Table */}
      <Box py={12}>
        <Container maxW="1400px">
          {filteredTransactions.length > 0 ? (
            <Box
              bg="white"
              border="2px solid"
              borderColor="neutral.200"
              borderRadius="8px"
              overflow="hidden"
            >
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="neutral.50">
                    <Tr>
                      <Th
                        cursor="pointer"
                        onClick={() => {
                          if (sortField === 'date') {
                            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
                          } else {
                            setSortField('date')
                            setSortDirection('desc')
                          }
                        }}
                      >
                        Date {sortField === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th
                        cursor="pointer"
                        onClick={() => {
                          if (sortField === 'merchant') {
                            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
                          } else {
                            setSortField('merchant')
                            setSortDirection('asc')
                          }
                        }}
                      >
                        Merchant {sortField === 'merchant' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </Th>
                      <Th>Notes</Th>
                      <Th
                        isNumeric
                        cursor="pointer"
                        onClick={() => {
                          if (sortField === 'amount') {
                            setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
                          } else {
                            setSortField('amount')
                            setSortDirection('desc')
                          }
                        }}
                      >
                        Amount {sortField === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredTransactions.map((transaction, idx) => (
                      <Tr
                        key={idx}
                        _hover={{ bg: 'neutral.50' }}
                        transition="background 0.15s"
                      >
                        <Td fontSize="sm" color="neutral.700" fontWeight="medium">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Td>
                        <Td fontWeight="semibold" color="neutral.900">
                          {transaction.merchant}
                        </Td>
                        <Td fontSize="sm" color="neutral.600" maxW="300px" isTruncated>
                          {transaction.notes || '-'}
                        </Td>
                        <Td isNumeric fontWeight="bold" fontSize="md" color="neutral.900">
                          ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>

              {/* Table Footer with Totals */}
              <Box
                p={6}
                bg="neutral.50"
                borderTop="2px solid"
                borderColor="neutral.200"
              >
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                    Showing {filteredTransactions.length} of {data?.count || 0} transactions
                  </Text>
                  <HStack spacing={8}>
                    <Box textAlign="right">
                      <Text fontSize="xs" color="neutral.500" textTransform="uppercase" letterSpacing="wide" fontWeight="bold">
                        Filtered Total
                      </Text>
                      <Text fontSize="2xl" fontWeight="black" color="neutral.900" letterSpacing="tight">
                        ${filteredTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    </Box>
                  </HStack>
                </Flex>
              </Box>
            </Box>
          ) : (
            <Box
              py={20}
              textAlign="center"
              border="2px dashed"
              borderColor="neutral.300"
              borderRadius="8px"
            >
              <Text color="neutral.600" fontSize="lg" fontWeight="medium" mb={2}>
                No transactions found
              </Text>
              <Text color="neutral.500" fontSize="sm">
                Try adjusting your filters or search term
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  )
}

// Stat Card Component
function StatCard({ label, value, sublabel }) {
  return (
    <Box
      bg="white"
      border="2px solid"
      borderColor="neutral.200"
      borderRadius="8px"
      p={6}
    >
      <Text
        fontSize="xs"
        fontWeight="bold"
        textTransform="uppercase"
        letterSpacing="wider"
        color="neutral.500"
        mb={2}
      >
        {label}
      </Text>
      <Text
        fontSize="3xl"
        fontWeight="black"
        color="neutral.900"
        letterSpacing="tighter"
        mb={1}
      >
        {value}
      </Text>
      <Text fontSize="sm" color="neutral.600">
        {sublabel}
      </Text>
    </Box>
  )
}
