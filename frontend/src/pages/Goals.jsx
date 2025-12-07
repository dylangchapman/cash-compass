import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Grid,
  Select,
} from '@chakra-ui/react'
import {
  MdFlag,
  MdAdd,
  MdClose,
  MdTrendingUp,
} from 'react-icons/md'

const GOALS_STORAGE_KEY = 'user_spending_goals'
const MAX_GOALS = 6

const DEFAULT_GOALS = [
  { goal_name: 'Monthly Spending Limit', target: 2500, category: null },
  { goal_name: 'Groceries Budget', target: 400, category: 'Groceries' },
  { goal_name: 'Dining Out Budget', target: 150, category: 'Restaurants' },
]

const loadGoalsFromStorage = () => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : DEFAULT_GOALS
  } catch {
    return DEFAULT_GOALS
  }
}

const saveGoalsToStorage = (goals) => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals))
  } catch {
    // Ignore storage errors
  }
}

export default function Goals() {
  const toast = useToast()

  // Goals state - load from localStorage
  const [goals, setGoals] = useState(loadGoalsFromStorage)
  const [newGoal, setNewGoal] = useState({ goal_name: '', target: '', category: '' })

  // Save to localStorage whenever goals change
  useEffect(() => {
    saveGoalsToStorage(goals)
  }, [goals])

  // Goals handlers
  const addGoal = () => {
    if (!newGoal.goal_name || !newGoal.target) {
      toast({ title: 'Missing information', description: 'Please enter goal name and target', status: 'warning', duration: 3000 })
      return
    }
    if (goals.length >= MAX_GOALS) {
      toast({ title: 'Maximum goals reached', description: `You can only have up to ${MAX_GOALS} goals`, status: 'warning', duration: 3000 })
      return
    }
    setGoals([...goals, {
      goal_name: newGoal.goal_name,
      target: parseFloat(newGoal.target),
      category: newGoal.category || null,
    }])
    setNewGoal({ goal_name: '', target: '', category: '' })
    toast({ title: 'Goal added', status: 'success', duration: 2000 })
  }

  const removeGoal = (index) => {
    setGoals(goals.filter((_, idx) => idx !== index))
    toast({ title: 'Goal removed', status: 'info', duration: 2000 })
  }

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="1200px">
          <HStack spacing={4} mb={4}>
            <Icon as={MdFlag} boxSize={10} />
            <Text
              fontSize={{ base: '4xl', md: '5xl' }}
              fontWeight="black"
              letterSpacing="tighter"
            >
              Spending Goals
            </Text>
          </HStack>
          <Text fontSize="lg" color="neutral.400">
            Set monthly spending targets and track your progress
          </Text>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="1200px" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Add New Goal Section */}
          <Box
            bg="white"
            border="2px solid"
            borderColor="neutral.200"
            borderRadius="8px"
            overflow="hidden"
          >
            <Flex
              align="center"
              gap={3}
              p={4}
              bg="neutral.50"
              borderBottom="2px solid"
              borderColor="neutral.200"
            >
              <Icon as={MdAdd} boxSize={5} color="neutral.700" />
              <Text fontSize="lg" fontWeight="bold" color="neutral.900">Add New Goal</Text>
            </Flex>
            <Box p={6}>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} mb={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">Goal Name</FormLabel>
                  <Input
                    placeholder="e.g., Coffee Budget"
                    value={newGoal.goal_name}
                    onChange={(e) => setNewGoal({ ...newGoal, goal_name: e.target.value })}
                    color="neutral.900"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">Monthly Target ($)</FormLabel>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    color="neutral.900"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">Category (Optional)</FormLabel>
                  <Select
                    placeholder="All spending"
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
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
              <Button leftIcon={<MdAdd />} onClick={addGoal}>Add Goal</Button>
            </Box>
          </Box>

          {/* Current Goals Section */}
          <Box
            bg="white"
            border="2px solid"
            borderColor="neutral.200"
            borderRadius="8px"
            overflow="hidden"
          >
            <Flex
              align="center"
              gap={3}
              p={4}
              bg="neutral.50"
              borderBottom="2px solid"
              borderColor="neutral.200"
            >
              <Icon as={MdTrendingUp} boxSize={5} color="neutral.700" />
              <Text fontSize="lg" fontWeight="bold" color="neutral.900">Your Goals</Text>
              <Text fontSize="sm" color="neutral.500" ml="auto">
                {goals.length}/{MAX_GOALS} goals
              </Text>
            </Flex>
            <Box p={6}>
              {goals.length > 0 ? (
                <VStack align="stretch" spacing={3}>
                  {goals.map((goal, idx) => (
                    <Box
                      key={idx}
                      p={4}
                      border="2px solid"
                      borderColor="neutral.200"
                      borderRadius="8px"
                      _hover={{ borderColor: 'neutral.300', bg: 'neutral.50' }}
                      transition="all 0.2s"
                    >
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="lg" fontWeight="bold" color="neutral.900">{goal.goal_name}</Text>
                          <HStack spacing={3} mt={1}>
                            <Text fontSize="md" fontWeight="semibold" color="success.600">
                              ${goal.target}/month
                            </Text>
                            {goal.category && (
                              <>
                                <Text color="neutral.400">|</Text>
                                <Text fontSize="sm" color="neutral.600" fontWeight="medium">
                                  {goal.category}
                                </Text>
                              </>
                            )}
                            {!goal.category && (
                              <>
                                <Text color="neutral.400">|</Text>
                                <Text fontSize="sm" color="neutral.500" fontStyle="italic">
                                  All categories
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
                </VStack>
              ) : (
                <Box py={12} textAlign="center" border="2px dashed" borderColor="neutral.200" borderRadius="8px">
                  <Icon as={MdFlag} boxSize={12} color="neutral.300" mb={4} />
                  <Text fontSize="lg" fontWeight="semibold" color="neutral.600" mb={2}>
                    No goals set yet
                  </Text>
                  <Text fontSize="sm" color="neutral.500">
                    Add your first spending goal above to start tracking your budget.
                  </Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Info Box */}
          <Box
            bg="neutral.900"
            color="white"
            p={6}
            borderRadius="8px"
          >
            <Text fontWeight="bold" fontSize="lg" mb={3}>
              Track Your Progress
            </Text>
            <Text fontSize="sm" color="neutral.300" mb={4}>
              Once you've set your goals, head to the Insights page to analyze your progress and see how you're doing against your targets.
            </Text>
            <Button
              as={Link}
              to="/insights"
              variant="secondary"
              size="sm"
              bg="white"
              color="neutral.900"
              _hover={{ bg: 'neutral.100' }}
            >
              View Insights
            </Button>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}
