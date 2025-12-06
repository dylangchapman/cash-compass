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
  Flex,
  Select,
  Input,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Switch,
} from '@chakra-ui/react'
import { MdRefresh, MdTrendingUp, MdTrendingDown, MdShowChart, MdCompareArrows, MdSettings, MdStackedLineChart } from 'react-icons/md'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { financialAPI } from '../services/api'

const ALLOCATION_COLORS = {
  stocks: '#18181b',
  etfs: '#52525b',
  bonds: '#a1a1aa',
}

const STRATEGY_COLORS = ['#18181b', '#3b82f6', '#10b981']
const MULTI_COMPARE_COLORS = ['#18181b', '#3b82f6', '#10b981', '#f59e0b']
const SMA_COLOR = '#ef4444'
const EMA_COLOR = '#8b5cf6'

export default function Portfolio() {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)
  const [portfolio, setPortfolio] = useState(null)
  const toast = useToast()

  // Backtesting state
  const [backtestTab, setBacktestTab] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState('60_40')
  const [backtestYears, setBacktestYears] = useState(5)
  const [backtestCapital, setBacktestCapital] = useState(10000)
  const [backtestLoading, setBacktestLoading] = useState(false)
  const [backtestResult, setBacktestResult] = useState(null)
  const [strategyComparison, setStrategyComparison] = useState(null)
  const [compareSymbol, setCompareSymbol] = useState('SPY')

  // Multi-portfolio comparison state
  const [selectedPresets, setSelectedPresets] = useState(['60_40', 'sp500'])
  const [multiCompareResults, setMultiCompareResults] = useState(null)
  const [multiCompareLoading, setMultiCompareLoading] = useState(false)

  // Indicator state
  const [showSMA, setShowSMA] = useState(false)
  const [smaPeriod, setSmaPeriod] = useState(20)
  const [showEMA, setShowEMA] = useState(false)
  const [emaPeriod, setEmaPeriod] = useState(12)

  // Custom allocation state
  const [customStocks, setCustomStocks] = useState(60)
  const [customBonds, setCustomBonds] = useState(40)

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
      toast({ title: 'Portfolio updated', status: 'success', duration: 3000 })
    } catch (err) {
      toast({ title: 'Error refreshing', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setRefreshing(false)
    }
  }

  const runBacktest = async () => {
    try {
      setBacktestLoading(true)
      const result = await financialAPI.backtestAllocation(selectedPreset, backtestYears, backtestCapital)
      setBacktestResult(result)
    } catch (err) {
      toast({ title: 'Error running backtest', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setBacktestLoading(false)
    }
  }

  const runCustomBacktest = async () => {
    try {
      setBacktestLoading(true)
      const allocation = {
        SPY: customStocks / 100,
        BND: customBonds / 100
      }
      const result = await financialAPI.backtestCustomAllocation(allocation, backtestYears, backtestCapital)
      setBacktestResult({
        ...result,
        name: `Custom ${customStocks}/${customBonds}`,
        description: `${customStocks}% Stocks, ${customBonds}% Bonds`
      })
    } catch (err) {
      toast({ title: 'Error running backtest', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setBacktestLoading(false)
    }
  }

  const runStrategyComparison = async () => {
    try {
      setBacktestLoading(true)
      const result = await financialAPI.compareStrategies(compareSymbol, backtestYears, backtestCapital)
      setStrategyComparison(result)
    } catch (err) {
      toast({ title: 'Error comparing strategies', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setBacktestLoading(false)
    }
  }

  const togglePresetSelection = (preset) => {
    setSelectedPresets(prev => {
      if (prev.includes(preset)) {
        return prev.filter(p => p !== preset)
      }
      if (prev.length >= 4) {
        toast({ title: 'Maximum 4 portfolios', status: 'warning', duration: 2000 })
        return prev
      }
      return [...prev, preset]
    })
  }

  const runMultiComparison = async () => {
    if (selectedPresets.length < 2) {
      toast({ title: 'Select at least 2 portfolios', status: 'warning', duration: 2000 })
      return
    }
    try {
      setMultiCompareLoading(true)
      const results = await Promise.all(
        selectedPresets.map(preset => financialAPI.backtestAllocation(preset, backtestYears, backtestCapital))
      )
      setMultiCompareResults(results)
    } catch (err) {
      toast({ title: 'Error comparing portfolios', description: err.message, status: 'error', duration: 5000 })
    } finally {
      setMultiCompareLoading(false)
    }
  }

  // Calculate SMA for a data series
  const calculateSMA = (data, period) => {
    if (!data || data.length < period) return data
    return data.map((point, index) => {
      if (index < period - 1) return { ...point, sma: null }
      const sum = data.slice(index - period + 1, index + 1).reduce((acc, p) => acc + p.value, 0)
      return { ...point, sma: sum / period }
    })
  }

  // Calculate EMA for a data series
  const calculateEMA = (data, period) => {
    if (!data || data.length < period) return data
    const multiplier = 2 / (period + 1)
    let ema = null
    return data.map((point, index) => {
      if (index < period - 1) return { ...point, ema: null }
      if (index === period - 1) {
        const sum = data.slice(0, period).reduce((acc, p) => acc + p.value, 0)
        ema = sum / period
        return { ...point, ema }
      }
      ema = (point.value - ema) * multiplier + ema
      return { ...point, ema }
    })
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
        Error loading portfolio: {error}
      </Alert>
    )
  }

  const isPositive = portfolio?.total_gain_loss >= 0
  const allocationData = [
    { name: 'Stocks', value: portfolio?.allocation.stocks.value || 0, key: 'stocks' },
    { name: 'ETFs', value: portfolio?.allocation.etfs.value || 0, key: 'etfs' },
    { name: 'Bonds', value: portfolio?.allocation.bonds.value || 0, key: 'bonds' },
  ].filter(item => item.value > 0)

  const presetOptions = [
    { value: '60_40', label: '60/40 Stock/Bond' },
    { value: 'sp500', label: 'S&P 500 Only' },
    { value: 'aggressive', label: 'Aggressive Growth' },
    { value: 'conservative', label: 'Conservative' },
    { value: 'all_weather', label: 'All Weather' },
  ]

  return (
    <Box bg="white" minH="100vh">
      {/* HERO SECTION - Portfolio Value */}
      <Box bg="neutral.900" color="white" pt={32} pb={40} position="relative">
        <Container maxW="1400px">
          <VStack align="start" spacing={12}>
            <Box>
              <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={6}>
                Total Portfolio Value
              </Text>
              <HStack spacing={6} align="baseline" mb={6}>
                <Text fontSize={{ base: '5xl', md: '6xl', lg: '7xl' }} fontWeight="black" letterSpacing="tighter" lineHeight="none">
                  ${portfolio?.total_value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
                <Icon as={isPositive ? MdTrendingUp : MdTrendingDown} boxSize={16} color={isPositive ? 'success.500' : 'error.500'} />
              </HStack>

              <HStack spacing={8} mb={8}>
                <Box>
                  <Text fontSize="sm" color="neutral.500" mb={1} fontWeight="semibold">Return</Text>
                  <Text fontSize="3xl" fontWeight="bold" color={isPositive ? 'success.400' : 'error.400'}>
                    {isPositive ? '+' : ''}{portfolio?.total_return_percent?.toFixed(2)}%
                  </Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="neutral.500" mb={1} fontWeight="semibold">Gain/Loss</Text>
                  <Text fontSize="3xl" fontWeight="bold" color={isPositive ? 'success.400' : 'error.400'}>
                    {isPositive ? '+' : ''}${portfolio?.total_gain_loss?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>
              </HStack>
            </Box>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={12} w="full" pt={8} borderTop="1px solid" borderColor="neutral.700">
              <MetricBlock label="Cost Basis" value={`$${portfolio?.total_cost?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} sublabel="Total invested" />
              <MetricBlock label="Holdings" value={portfolio?.holdings?.length || 0} sublabel="Active positions" />
              <Box>
                <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={3}>
                  Last Updated
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mb={3}>
                  {new Date(portfolio?.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Button size="sm" variant="secondary" leftIcon={<MdRefresh />} onClick={handleRefresh} isLoading={refreshing}>
                  Refresh Prices
                </Button>
              </Box>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* ALLOCATION SECTION */}
      <Box py={24} bg="white">
        <Container maxW="1400px">
          <SectionHeader title="Asset allocation" description="Diversification across investment types" />

          <Grid templateColumns={{ base: '1fr', lg: '1fr 1.5fr' }} gap={12} mt={12}>
            <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={8}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{ position: 'inside', formatter: (entry) => `${((entry.value / portfolio.total_value) * 100).toFixed(1)}%`, fill: '#ffffff', fontSize: 14, fontWeight: 700 }}
                    outerRadius={140}
                    fill="#18181b"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px', padding: '12px 16px' }} formatter={(value) => `$${value.toLocaleString()}`} labelStyle={{ color: '#ffffff', fontWeight: 600 }} itemStyle={{ color: '#ffffff', fontWeight: 600 }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            <VStack align="stretch" spacing={4}>
              <AllocationCard title="Stocks" percent={portfolio?.allocation.stocks.percent.toFixed(1)} value={portfolio?.allocation.stocks.value} color={ALLOCATION_COLORS.stocks} />
              <AllocationCard title="ETFs" percent={portfolio?.allocation.etfs.percent.toFixed(1)} value={portfolio?.allocation.etfs.value} color={ALLOCATION_COLORS.etfs} />
              <AllocationCard title="Bonds" percent={portfolio?.allocation.bonds.percent.toFixed(1)} value={portfolio?.allocation.bonds.value} color={ALLOCATION_COLORS.bonds} />
            </VStack>
          </Grid>
        </Container>
      </Box>

      {/* PORTFOLIO OPTIONS & BACKTESTING */}
      <Box py={24} bg="neutral.50" borderTop="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <SectionHeader title="Portfolio Options & Backtesting" description="Compare allocations and test strategies with historical data" />

          <Tabs index={backtestTab} onChange={setBacktestTab} variant="unstyled" mt={12}>
            <TabList bg="white" p={1} borderRadius="8px" border="2px solid" borderColor="neutral.200" mb={8} flexWrap="wrap">
              <Tab flex={1} py={3} fontWeight="semibold" borderRadius="6px" _selected={{ bg: 'neutral.900', color: 'white' }} color="neutral.600">
                <HStack spacing={2}><Icon as={MdSettings} boxSize={5} /><Text>Preset Allocations</Text></HStack>
              </Tab>
              <Tab flex={1} py={3} fontWeight="semibold" borderRadius="6px" _selected={{ bg: 'neutral.900', color: 'white' }} color="neutral.600">
                <HStack spacing={2}><Icon as={MdStackedLineChart} boxSize={5} /><Text>Multi-Compare</Text></HStack>
              </Tab>
              <Tab flex={1} py={3} fontWeight="semibold" borderRadius="6px" _selected={{ bg: 'neutral.900', color: 'white' }} color="neutral.600">
                <HStack spacing={2}><Icon as={MdShowChart} boxSize={5} /><Text>Custom Mix</Text></HStack>
              </Tab>
              <Tab flex={1} py={3} fontWeight="semibold" borderRadius="6px" _selected={{ bg: 'neutral.900', color: 'white' }} color="neutral.600">
                <HStack spacing={2}><Icon as={MdCompareArrows} boxSize={5} /><Text>Strategy Comparison</Text></HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Preset Allocations */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
                  <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                    <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={4}>Select Preset</Text>
                    <VStack align="stretch" spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Allocation Type</FormLabel>
                        <Select value={selectedPreset} onChange={(e) => setSelectedPreset(e.target.value)} color="neutral.900">
                          {presetOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Backtest Period (Years)</FormLabel>
                        <Select value={backtestYears} onChange={(e) => setBacktestYears(Number(e.target.value))} color="neutral.900">
                          <option value={1}>1 Year</option>
                          <option value={3}>3 Years</option>
                          <option value={5}>5 Years</option>
                          <option value={10}>10 Years</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Initial Capital</FormLabel>
                        <Input type="number" value={backtestCapital} onChange={(e) => setBacktestCapital(Number(e.target.value))} color="neutral.900" />
                      </FormControl>
                      <Button onClick={runBacktest} isLoading={backtestLoading} loadingText="Running..." size="lg" w="full">
                        Run Backtest
                      </Button>
                    </VStack>
                  </Box>

                  <Box>
                    {backtestResult ? (
                      <BacktestResults result={backtestResult} />
                    ) : (
                      <Box bg="white" border="2px dashed" borderColor="neutral.200" borderRadius="8px" p={12} textAlign="center">
                        <Icon as={MdShowChart} boxSize={16} color="neutral.300" mb={4} />
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.600">Select a preset and run backtest</Text>
                        <Text fontSize="sm" color="neutral.500" mt={2}>Historical performance will appear here</Text>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </TabPanel>

              {/* Multi-Compare */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
                  <VStack spacing={6} align="stretch">
                    {/* Portfolio Selection */}
                    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                      <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={4}>Select Portfolios to Compare</Text>
                      <VStack align="stretch" spacing={3}>
                        {presetOptions.map((opt) => (
                          <Checkbox
                            key={opt.value}
                            isChecked={selectedPresets.includes(opt.value)}
                            onChange={() => togglePresetSelection(opt.value)}
                            colorScheme="gray"
                            size="lg"
                          >
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">{opt.label}</Text>
                          </Checkbox>
                        ))}
                      </VStack>
                      <Text fontSize="xs" color="neutral.500" mt={3}>Select 2-4 portfolios to compare</Text>
                    </Box>

                    {/* Indicator Controls */}
                    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                      <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={4}>Indicators</Text>
                      <VStack align="stretch" spacing={4}>
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2}>
                            <Box w={3} h={3} borderRadius="full" bg={SMA_COLOR} />
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">SMA (Simple Moving Average)</Text>
                          </HStack>
                          <Switch isChecked={showSMA} onChange={(e) => setShowSMA(e.target.checked)} colorScheme="red" />
                        </Flex>
                        {showSMA && (
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="semibold">SMA Period (days)</FormLabel>
                            <Select size="sm" value={smaPeriod} onChange={(e) => setSmaPeriod(Number(e.target.value))}>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </Select>
                          </FormControl>
                        )}
                        <Flex justify="space-between" align="center">
                          <HStack spacing={2}>
                            <Box w={3} h={3} borderRadius="full" bg={EMA_COLOR} />
                            <Text fontSize="sm" fontWeight="medium" color="neutral.900">EMA (Exponential Moving Average)</Text>
                          </HStack>
                          <Switch isChecked={showEMA} onChange={(e) => setShowEMA(e.target.checked)} colorScheme="purple" />
                        </Flex>
                        {showEMA && (
                          <FormControl>
                            <FormLabel fontSize="xs" fontWeight="semibold">EMA Period (days)</FormLabel>
                            <Select size="sm" value={emaPeriod} onChange={(e) => setEmaPeriod(Number(e.target.value))}>
                              <option value={12}>12</option>
                              <option value={26}>26</option>
                              <option value={50}>50</option>
                            </Select>
                          </FormControl>
                        )}
                      </VStack>
                    </Box>

                    {/* Backtest Settings */}
                    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                      <VStack align="stretch" spacing={4}>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="semibold">Period</FormLabel>
                          <Select value={backtestYears} onChange={(e) => setBacktestYears(Number(e.target.value))}>
                            <option value={1}>1 Year</option>
                            <option value={3}>3 Years</option>
                            <option value={5}>5 Years</option>
                            <option value={10}>10 Years</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel fontSize="sm" fontWeight="semibold">Initial Capital</FormLabel>
                          <Input type="number" value={backtestCapital} onChange={(e) => setBacktestCapital(Number(e.target.value))} />
                        </FormControl>
                        <Button onClick={runMultiComparison} isLoading={multiCompareLoading} loadingText="Comparing..." size="lg" w="full" isDisabled={selectedPresets.length < 2}>
                          Compare Portfolios
                        </Button>
                      </VStack>
                    </Box>
                  </VStack>

                  <Box>
                    {multiCompareResults ? (
                      <MultiCompareResults
                        results={multiCompareResults}
                        presetOptions={presetOptions}
                        selectedPresets={selectedPresets}
                        showSMA={showSMA}
                        smaPeriod={smaPeriod}
                        showEMA={showEMA}
                        emaPeriod={emaPeriod}
                        calculateSMA={calculateSMA}
                        calculateEMA={calculateEMA}
                      />
                    ) : (
                      <Box bg="white" border="2px dashed" borderColor="neutral.200" borderRadius="8px" p={12} textAlign="center">
                        <Icon as={MdStackedLineChart} boxSize={16} color="neutral.300" mb={4} />
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.600">Select portfolios to compare</Text>
                        <Text fontSize="sm" color="neutral.500" mt={2}>See multiple allocations plotted together</Text>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </TabPanel>

              {/* Custom Mix */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
                  <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                    <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={4}>Custom Allocation</Text>
                    <VStack align="stretch" spacing={6}>
                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold" color="neutral.900">Stocks (SPY)</Text>
                          <Text fontSize="sm" fontWeight="bold" color="neutral.900">{customStocks}%</Text>
                        </Flex>
                        <Slider value={customStocks} onChange={(v) => { setCustomStocks(v); setCustomBonds(100 - v); }} min={0} max={100} step={5}>
                          <SliderTrack bg="neutral.200"><SliderFilledTrack bg="neutral.900" /></SliderTrack>
                          <SliderThumb boxSize={6} />
                        </Slider>
                      </Box>
                      <Box>
                        <Flex justify="space-between" mb={2}>
                          <Text fontSize="sm" fontWeight="semibold" color="neutral.900">Bonds (BND)</Text>
                          <Text fontSize="sm" fontWeight="bold" color="neutral.900">{customBonds}%</Text>
                        </Flex>
                        <Slider value={customBonds} onChange={(v) => { setCustomBonds(v); setCustomStocks(100 - v); }} min={0} max={100} step={5}>
                          <SliderTrack bg="neutral.200"><SliderFilledTrack bg="neutral.500" /></SliderTrack>
                          <SliderThumb boxSize={6} />
                        </Slider>
                      </Box>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Backtest Period</FormLabel>
                        <Select value={backtestYears} onChange={(e) => setBacktestYears(Number(e.target.value))} color="neutral.900">
                          <option value={1}>1 Year</option>
                          <option value={3}>3 Years</option>
                          <option value={5}>5 Years</option>
                          <option value={10}>10 Years</option>
                        </Select>
                      </FormControl>
                      <Button onClick={runCustomBacktest} isLoading={backtestLoading} size="lg" w="full">
                        Test Custom Mix
                      </Button>
                    </VStack>
                  </Box>

                  <Box>
                    {backtestResult ? (
                      <BacktestResults result={backtestResult} />
                    ) : (
                      <Box bg="white" border="2px dashed" borderColor="neutral.200" borderRadius="8px" p={12} textAlign="center">
                        <Icon as={MdShowChart} boxSize={16} color="neutral.300" mb={4} />
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.600">Adjust sliders and run backtest</Text>
                        <Text fontSize="sm" color="neutral.500" mt={2}>See how different stock/bond mixes perform</Text>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </TabPanel>

              {/* Strategy Comparison */}
              <TabPanel p={0}>
                <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr' }} gap={8}>
                  <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6}>
                    <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={4}>Compare Strategies</Text>
                    <VStack align="stretch" spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Symbol</FormLabel>
                        <Select value={compareSymbol} onChange={(e) => setCompareSymbol(e.target.value)} color="neutral.900">
                          <option value="SPY">SPY (S&P 500)</option>
                          <option value="QQQ">QQQ (NASDAQ)</option>
                          <option value="VTI">VTI (Total Market)</option>
                          <option value="AAPL">AAPL (Apple)</option>
                          <option value="MSFT">MSFT (Microsoft)</option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Period</FormLabel>
                        <Select value={backtestYears} onChange={(e) => setBacktestYears(Number(e.target.value))} color="neutral.900">
                          <option value={1}>1 Year</option>
                          <option value={3}>3 Years</option>
                          <option value={5}>5 Years</option>
                          <option value={10}>10 Years</option>
                        </Select>
                      </FormControl>
                      <Alert status="info" borderRadius="6px" fontSize="sm">
                        <AlertIcon />
                        Compares Buy & Hold vs SMA Crossover strategies
                      </Alert>
                      <Button onClick={runStrategyComparison} isLoading={backtestLoading} size="lg" w="full">
                        Compare Strategies
                      </Button>
                    </VStack>
                  </Box>

                  <Box>
                    {strategyComparison ? (
                      <StrategyComparisonResults comparison={strategyComparison} />
                    ) : (
                      <Box bg="white" border="2px dashed" borderColor="neutral.200" borderRadius="8px" p={12} textAlign="center">
                        <Icon as={MdCompareArrows} boxSize={16} color="neutral.300" mb={4} />
                        <Text fontSize="lg" fontWeight="semibold" color="neutral.600">Compare trading strategies</Text>
                        <Text fontSize="sm" color="neutral.500" mt={2}>Buy & Hold vs SMA Crossover analysis</Text>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Container>
      </Box>

      {/* HOLDINGS TABLE */}
      <Box py={24} bg="white" borderTop="1px solid" borderColor="neutral.200">
        <Container maxW="1400px">
          <SectionHeader title="Holdings" description="Your current equity positions" />

          <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" overflow="hidden" mt={12}>
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
                    <Th isNumeric>Return</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {portfolio?.holdings?.map((holding, idx) => {
                    const isGain = holding.gain_loss >= 0
                    return (
                      <Tr key={idx} _hover={{ bg: 'neutral.50' }} transition="background 0.15s">
                        <Td fontWeight="bold" fontSize="md" color="neutral.900">{holding.symbol}</Td>
                        <Td fontSize="sm" color="neutral.700" fontWeight="medium">{holding.name}</Td>
                        <Td isNumeric fontSize="sm" color="neutral.800">{holding.shares}</Td>
                        <Td isNumeric fontSize="sm" color="neutral.800">${holding.cost_basis.toFixed(2)}</Td>
                        <Td isNumeric fontSize="sm" fontWeight="semibold" color="neutral.900">${holding.current_price.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold" fontSize="md" color="neutral.900">${holding.current_value.toFixed(2)}</Td>
                        <Td isNumeric fontWeight="bold" fontSize="md" color={isGain ? 'success.700' : 'error.700'}>
                          {isGain ? '+' : ''}${holding.gain_loss.toFixed(2)}
                        </Td>
                        <Td isNumeric fontWeight="bold" fontSize="md" color={isGain ? 'success.700' : 'error.700'}>
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

// Backtest Results Component
function BacktestResults({ result }) {
  const r = result.result || result
  const isPositive = r.total_return >= 0

  return (
    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" overflow="hidden">
      <Box bg="neutral.900" color="white" p={6}>
        <Text fontSize="xl" fontWeight="bold">{result.name || r.strategy_name}</Text>
        {result.description && <Text fontSize="sm" color="neutral.400" mt={1}>{result.description}</Text>}
      </Box>

      <Box p={6}>
        <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
          <MetricBox label="Total Return" value={`${r.total_return >= 0 ? '+' : ''}${r.total_return?.toFixed(2)}%`} color={isPositive ? 'success.600' : 'error.600'} />
          <MetricBox label="CAGR" value={`${r.cagr?.toFixed(2)}%`} />
          <MetricBox label="Sharpe Ratio" value={r.sharpe_ratio?.toFixed(2)} />
          <MetricBox label="Sortino Ratio" value={r.sortino_ratio?.toFixed(2)} />
        </Grid>

        <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={6}>
          <MetricBox label="Max Drawdown" value={`${r.max_drawdown?.toFixed(2)}%`} color="error.600" />
          <MetricBox label="Volatility" value={`${r.volatility?.toFixed(2)}%`} />
          <MetricBox label="Win Rate" value={`${r.win_rate?.toFixed(1)}%`} />
          <MetricBox label="Final Value" value={`$${r.final_value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}`} color={isPositive ? 'success.600' : 'error.600'} />
        </Grid>

        {r.equity_curve && r.equity_curve.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="neutral.700" mb={4}>Equity Curve</Text>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={r.equity_curve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => v.substring(5)} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px' }} formatter={(v) => [`$${v.toLocaleString()}`, 'Value']} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="value" stroke="#18181b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Strategy Comparison Results Component
function StrategyComparisonResults({ comparison }) {
  if (!comparison.strategies || comparison.strategies.length === 0) {
    return (
      <Alert status="warning" borderRadius="8px">
        <AlertIcon />
        No strategy data available
      </Alert>
    )
  }

  // Combine equity curves for comparison chart
  const combinedData = []
  comparison.strategies.forEach((strategy, idx) => {
    strategy.equity_curve.forEach(point => {
      const existing = combinedData.find(d => d.date === point.date)
      if (existing) {
        existing[`strategy${idx}`] = point.value
      } else {
        combinedData.push({ date: point.date, [`strategy${idx}`]: point.value })
      }
    })
  })

  return (
    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" overflow="hidden">
      <Box bg="neutral.900" color="white" p={6}>
        <Text fontSize="xl" fontWeight="bold">Strategy Comparison: {comparison.symbol}</Text>
        <Text fontSize="sm" color="neutral.400">{comparison.period_years} year backtest</Text>
      </Box>

      <Box p={6}>
        {/* Comparison Table */}
        <Box overflowX="auto" mb={8}>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Strategy</Th>
                <Th isNumeric>Total Return</Th>
                <Th isNumeric>CAGR</Th>
                <Th isNumeric>Sharpe</Th>
                <Th isNumeric>Sortino</Th>
                <Th isNumeric>Max DD</Th>
                <Th isNumeric>Final Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {comparison.strategies.map((s, idx) => (
                <Tr key={idx}>
                  <Td fontWeight="bold">
                    <HStack>
                      <Box w={3} h={3} borderRadius="full" bg={STRATEGY_COLORS[idx]} />
                      <Text>{s.strategy_name}</Text>
                    </HStack>
                  </Td>
                  <Td isNumeric color={s.total_return >= 0 ? 'success.600' : 'error.600'} fontWeight="semibold">
                    {s.total_return >= 0 ? '+' : ''}{s.total_return?.toFixed(2)}%
                  </Td>
                  <Td isNumeric>{s.cagr?.toFixed(2)}%</Td>
                  <Td isNumeric>{s.sharpe_ratio?.toFixed(2)}</Td>
                  <Td isNumeric>{s.sortino_ratio?.toFixed(2)}</Td>
                  <Td isNumeric color="error.600">{s.max_drawdown?.toFixed(2)}%</Td>
                  <Td isNumeric fontWeight="bold">${s.final_value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        {/* Equity Curve Comparison */}
        {combinedData.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="neutral.700" mb={4}>Performance Comparison</Text>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => v?.substring(5)} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px' }} formatter={(v) => [`$${v?.toLocaleString()}`, '']} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#fff' }} />
                <Legend />
                {comparison.strategies.map((s, idx) => (
                  <Line key={idx} type="monotone" dataKey={`strategy${idx}`} name={s.strategy_name} stroke={STRATEGY_COLORS[idx]} strokeWidth={2} dot={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Multi-Compare Results Component
function MultiCompareResults({ results, presetOptions, selectedPresets, showSMA, smaPeriod, showEMA, emaPeriod, calculateSMA, calculateEMA }) {
  if (!results || results.length === 0) {
    return (
      <Alert status="warning" borderRadius="8px">
        <AlertIcon />
        No comparison data available
      </Alert>
    )
  }

  // Build combined data for chart
  const combinedData = []
  results.forEach((res, idx) => {
    const r = res.result || res
    if (!r.equity_curve) return
    r.equity_curve.forEach(point => {
      const existing = combinedData.find(d => d.date === point.date)
      if (existing) {
        existing[`portfolio${idx}`] = point.value
      } else {
        combinedData.push({ date: point.date, [`portfolio${idx}`]: point.value })
      }
    })
  })

  // Apply indicators to first portfolio's data for display
  let chartData = combinedData.sort((a, b) => new Date(a.date) - new Date(b.date))

  if (showSMA && chartData.length > 0) {
    const firstPortfolioData = chartData.map(d => ({ date: d.date, value: d.portfolio0 || 0 }))
    const smaData = calculateSMA(firstPortfolioData, smaPeriod)
    chartData = chartData.map((d, idx) => ({ ...d, sma: smaData[idx]?.sma }))
  }

  if (showEMA && chartData.length > 0) {
    const firstPortfolioData = chartData.map(d => ({ date: d.date, value: d.portfolio0 || 0 }))
    const emaData = calculateEMA(firstPortfolioData, emaPeriod)
    chartData = chartData.map((d, idx) => ({ ...d, ema: emaData[idx]?.ema }))
  }

  const getPresetLabel = (presetValue) => {
    return presetOptions.find(p => p.value === presetValue)?.label || presetValue
  }

  return (
    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" overflow="hidden">
      <Box bg="neutral.900" color="white" p={6}>
        <Text fontSize="xl" fontWeight="bold">Portfolio Comparison</Text>
        <Text fontSize="sm" color="neutral.400">{selectedPresets.length} portfolios compared</Text>
      </Box>

      <Box p={6}>
        {/* Comparison Table */}
        <Box overflowX="auto" mb={8}>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Portfolio</Th>
                <Th isNumeric>Total Return</Th>
                <Th isNumeric>CAGR</Th>
                <Th isNumeric>Sharpe</Th>
                <Th isNumeric>Sortino</Th>
                <Th isNumeric>Max DD</Th>
                <Th isNumeric>Final Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results.map((res, idx) => {
                const r = res.result || res
                return (
                  <Tr key={idx}>
                    <Td fontWeight="bold">
                      <HStack>
                        <Box w={3} h={3} borderRadius="full" bg={MULTI_COMPARE_COLORS[idx]} />
                        <Text>{res.name || getPresetLabel(selectedPresets[idx])}</Text>
                      </HStack>
                    </Td>
                    <Td isNumeric color={r.total_return >= 0 ? 'success.600' : 'error.600'} fontWeight="semibold">
                      {r.total_return >= 0 ? '+' : ''}{r.total_return?.toFixed(2)}%
                    </Td>
                    <Td isNumeric>{r.cagr?.toFixed(2)}%</Td>
                    <Td isNumeric>{r.sharpe_ratio?.toFixed(2)}</Td>
                    <Td isNumeric>{r.sortino_ratio?.toFixed(2)}</Td>
                    <Td isNumeric color="error.600">{r.max_drawdown?.toFixed(2)}%</Td>
                    <Td isNumeric fontWeight="bold">${r.final_value?.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Td>
                  </Tr>
                )
              })}
            </Tbody>
          </Table>
        </Box>

        {/* Combined Equity Curve Chart */}
        {chartData.length > 0 && (
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="neutral.700" mb={4}>
              Performance Comparison
              {showSMA && <Text as="span" color={SMA_COLOR} ml={2}>+ SMA({smaPeriod})</Text>}
              {showEMA && <Text as="span" color={EMA_COLOR} ml={2}>+ EMA({emaPeriod})</Text>}
            </Text>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => v?.substring(5)} />
                <YAxis tick={{ fill: '#71717a', fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '6px' }}
                  formatter={(v, name) => {
                    if (name === 'sma') return [`$${v?.toLocaleString()}`, `SMA(${smaPeriod})`]
                    if (name === 'ema') return [`$${v?.toLocaleString()}`, `EMA(${emaPeriod})`]
                    return [`$${v?.toLocaleString()}`, '']
                  }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend />
                {results.map((res, idx) => (
                  <Line
                    key={idx}
                    type="monotone"
                    dataKey={`portfolio${idx}`}
                    name={res.name || getPresetLabel(selectedPresets[idx])}
                    stroke={MULTI_COMPARE_COLORS[idx]}
                    strokeWidth={2}
                    dot={false}
                  />
                ))}
                {showSMA && (
                  <Line
                    type="monotone"
                    dataKey="sma"
                    name={`SMA(${smaPeriod})`}
                    stroke={SMA_COLOR}
                    strokeWidth={1.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
                {showEMA && (
                  <Line
                    type="monotone"
                    dataKey="ema"
                    name={`EMA(${emaPeriod})`}
                    stroke={EMA_COLOR}
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// Helper Components
function MetricBlock({ label, value, sublabel }) {
  return (
    <Box>
      <Text fontSize="xs" fontWeight="semibold" textTransform="uppercase" letterSpacing="wider" color="neutral.500" mb={3}>{label}</Text>
      <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" letterSpacing="tighter" lineHeight="none" mb={2}>{value}</Text>
      <Text fontSize="sm" color="neutral.400" fontWeight="medium">{sublabel}</Text>
    </Box>
  )
}

function MetricBox({ label, value, color = 'neutral.900' }) {
  return (
    <Box p={4} bg="neutral.50" borderRadius="6px">
      <Text fontSize="xs" color="neutral.500" textTransform="uppercase" fontWeight="bold" mb={1}>{label}</Text>
      <Text fontSize="xl" fontWeight="black" color={color} letterSpacing="tight" sx={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>{value}</Text>
    </Box>
  )
}

function SectionHeader({ title, description }) {
  return (
    <Box>
      <Text fontSize={{ base: '3xl', md: '4xl' }} fontWeight="black" color="neutral.900" letterSpacing="tighter" mb={3}>{title}</Text>
      <Text fontSize="lg" color="neutral.600" fontWeight="normal">{description}</Text>
    </Box>
  )
}

function AllocationCard({ title, percent, value, color }) {
  return (
    <Box bg="white" border="2px solid" borderColor="neutral.200" borderRadius="8px" p={6} transition="all 0.2s" _hover={{ borderColor: color, transform: 'translateX(4px)' }}>
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <Box w="4px" h="50px" bg={color} borderRadius="2px" />
          <Box>
            <Text fontSize="lg" fontWeight="bold" color="neutral.900" mb={1}>{title}</Text>
            <Text fontSize="3xl" fontWeight="black" color="neutral.900" letterSpacing="tighter">${value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          </Box>
        </HStack>
        <Box textAlign="right">
          <Text fontSize="4xl" fontWeight="black" color={color} letterSpacing="tighter">{percent}%</Text>
        </Box>
      </Flex>
    </Box>
  )
}
