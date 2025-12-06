import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Text,
  VStack,
  HStack,
  Icon,
  Switch,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Alert,
  AlertIcon,
  Grid,
  Select,
} from '@chakra-ui/react'
import {
  MdPerson,
  MdLock,
  MdDownload,
  MdDelete,
  MdPrivacyTip,
  MdAdd,
  MdClose,
  MdFlag,
} from 'react-icons/md'

const DEFAULT_GOALS = [
  { goal_name: 'Monthly Spending Limit', target: 2500, category: null },
  { goal_name: 'Groceries Budget', target: 400, category: 'Groceries' },
  { goal_name: 'Dining Out Budget', target: 150, category: 'Restaurants' },
]

export default function Settings() {
  const navigate = useNavigate()
  const toast = useToast()

  // Account state
  const userName = localStorage.getItem('userName') || 'User'
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com'
  const [privacySettings, setPrivacySettings] = useState({
    aiAnalysis: true,
    anonymizedData: false,
    emailWeeklySummary: true,
    emailAnomalyAlerts: true,
    emailGoalUpdates: false,
  })
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
  const deleteAccountModal = useDisclosure()
  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  // Goals state (for editing goals that will be analyzed on Insights page)
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [newGoal, setNewGoal] = useState({ goal_name: '', target: '', category: '' })

  // Account handlers
  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }))
    toast({ title: 'Setting updated', status: 'success', duration: 2000 })
  }

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Passwords do not match', status: 'error', duration: 3000 })
      return
    }
    if (passwords.new.length < 8) {
      toast({ title: 'Password must be at least 8 characters', status: 'error', duration: 3000 })
      return
    }
    toast({ title: 'Password updated successfully', status: 'success', duration: 3000 })
    setShowPasswordChange(false)
    setPasswords({ current: '', new: '', confirm: '' })
  }

  const handleExport = (type) => {
    toast({
      title: `Preparing ${type} export`,
      description: 'Your download will begin shortly.',
      status: 'info',
      duration: 3000,
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({ title: 'Please type DELETE to confirm', status: 'error', duration: 3000 })
      return
    }
    localStorage.clear()
    deleteAccountModal.onClose()
    navigate('/login')
  }

  // Goals handlers
  const addGoal = () => {
    if (!newGoal.goal_name || !newGoal.target) {
      toast({ title: 'Missing information', description: 'Please enter goal name and target', status: 'warning', duration: 3000 })
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
  }

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="1200px">
          <Text
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="black"
            letterSpacing="tighter"
            mb={4}
          >
            Account Settings
          </Text>
          <Text fontSize="lg" color="neutral.400">
            Manage your account, security, and spending goals
          </Text>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="1200px" py={8}>
        <VStack spacing={6} align="stretch">
                {/* Profile Information */}
                <SettingsSection icon={MdPerson} title="Profile Information">
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                    <Box>
                      <Text fontSize="xs" color="neutral.500" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                        Full Name
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="neutral.900">{userName}</Text>
                    </Box>
                    <Box>
                      <Text fontSize="xs" color="neutral.500" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                        Email Address
                      </Text>
                      <Text fontSize="md" fontWeight="medium" color="neutral.900">{userEmail}</Text>
                    </Box>
                  </Grid>
                </SettingsSection>

                {/* Security */}
                <SettingsSection icon={MdLock} title="Security">
                  {!showPasswordChange ? (
                    <VStack align="stretch" spacing={4}>
                      <Flex justify="space-between" align="center">
                        <Box>
                          <Text fontSize="md" fontWeight="medium" color="neutral.900">Password</Text>
                          <Text fontSize="sm" color="neutral.600">Last changed 30 days ago</Text>
                        </Box>
                        <Button size="sm" variant="secondary" onClick={() => setShowPasswordChange(true)}>
                          Change Password
                        </Button>
                      </Flex>
                    </VStack>
                  ) : (
                    <VStack align="stretch" spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Current Password</FormLabel>
                        <Input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} bg="white" color="neutral.900" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">New Password</FormLabel>
                        <Input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} bg="white" color="neutral.900" />
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm" fontWeight="semibold">Confirm New Password</FormLabel>
                        <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} bg="white" color="neutral.900" />
                      </FormControl>
                      <HStack spacing={3}>
                        <Button size="sm" onClick={handlePasswordChange}>Update Password</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowPasswordChange(false)}>Cancel</Button>
                      </HStack>
                    </VStack>
                  )}
                </SettingsSection>

                {/* Privacy */}
                <SettingsSection icon={MdPrivacyTip} title="Privacy Settings">
                  <VStack align="stretch" spacing={4}>
                    <PrivacyToggle
                      title="AI Analysis"
                      description="Allow AI to analyze your transactions for personalized insights"
                      isChecked={privacySettings.aiAnalysis}
                      onChange={() => handlePrivacyToggle('aiAnalysis')}
                    />
                    <Divider />
                    <PrivacyToggle
                      title="Product Improvement"
                      description="Share anonymized usage data to help improve the service"
                      isChecked={privacySettings.anonymizedData}
                      onChange={() => handlePrivacyToggle('anonymizedData')}
                    />
                  </VStack>
                </SettingsSection>

                {/* Data Export */}
                <SettingsSection icon={MdDownload} title="Export Your Data">
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
                    <Button variant="secondary" size="md" leftIcon={<MdDownload />} onClick={() => handleExport('transactions')}>
                      Transactions (CSV)
                    </Button>
                    <Button variant="secondary" size="md" leftIcon={<MdDownload />} onClick={() => handleExport('portfolio')}>
                      Portfolio (CSV)
                    </Button>
                    <Button variant="secondary" size="md" leftIcon={<MdDownload />} onClick={() => handleExport('all')}>
                      All Data (JSON)
                    </Button>
                  </Grid>
                </SettingsSection>

                {/* Delete Account */}
                <SettingsSection icon={MdDelete} title="Delete Account">
                  <Alert status="warning" borderRadius="6px" mb={4}>
                    <AlertIcon />
                    <Text fontSize="sm">Account deletion is permanent and cannot be undone.</Text>
                  </Alert>
                  <Button bg="error.600" color="white" _hover={{ bg: 'error.700' }} onClick={deleteAccountModal.onOpen}>
                    Delete Account
                  </Button>
                </SettingsSection>

                {/* Spending Goals */}
                <SettingsSection icon={MdFlag} title="Spending Goals">
                  <Text fontSize="sm" color="neutral.600" mb={4}>
                    Set your monthly spending targets. View your progress on the <Text as={Link} to="/insights" color="neutral.900" fontWeight="bold" textDecoration="underline">Insights page</Text>.
                  </Text>
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
                      <FormLabel fontSize="sm" fontWeight="bold" color="neutral.900">Category</FormLabel>
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
                  <Button leftIcon={<MdAdd />} onClick={addGoal} mb={6}>Add Goal</Button>

                  {goals.length > 0 ? (
                    <VStack align="stretch" spacing={3}>
                      {goals.map((goal, idx) => (
                        <Box
                          key={idx}
                          p={4}
                          border="1px solid"
                          borderColor="neutral.200"
                          borderRadius="6px"
                          _hover={{ borderColor: 'neutral.300' }}
                        >
                          <Flex justify="space-between" align="center">
                            <Box>
                              <Text fontSize="md" fontWeight="bold" color="neutral.900">{goal.goal_name}</Text>
                              <HStack spacing={3}>
                                <Text fontSize="sm" color="neutral.600">${goal.target}/month</Text>
                                {goal.category && (
                                  <>
                                    <Text color="neutral.400">|</Text>
                                    <Text fontSize="sm" color="neutral.600">{goal.category}</Text>
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
                    <Box py={6} textAlign="center" border="2px dashed" borderColor="neutral.200" borderRadius="8px">
                      <Text color="neutral.500">No goals set yet. Add your first goal above.</Text>
                    </Box>
                  )}
                </SettingsSection>

                {/* Legal Links */}
                <Box pt={8} borderTop="1px solid" borderColor="neutral.200">
                  <HStack spacing={8} justify="center">
                    <Text as={Link} to="/privacy" fontSize="sm" color="neutral.600" _hover={{ color: 'neutral.900' }}>
                      Privacy Policy
                    </Text>
                    <Text as={Link} to="/terms" fontSize="sm" color="neutral.600" _hover={{ color: 'neutral.900' }}>
                      Terms of Service
                    </Text>
                  </HStack>
                </Box>
              </VStack>
      </Container>

      {/* Delete Account Modal */}
      <Modal isOpen={deleteAccountModal.isOpen} onClose={deleteAccountModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Alert status="error" borderRadius="6px">
                <AlertIcon />
                <Text fontWeight="semibold">This will permanently delete your account</Text>
              </Alert>
              <Text color="neutral.700">Type <strong>DELETE</strong> to confirm:</Text>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                bg="white"
                color="neutral.900"
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteAccountModal.onClose}>Cancel</Button>
            <Button bg="error.600" color="white" _hover={{ bg: 'error.700' }} onClick={handleDeleteAccount} isDisabled={deleteConfirmText !== 'DELETE'}>
              Permanently Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// Settings Section Component
function SettingsSection({ icon, title, children }) {
  return (
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
        <Icon as={icon} boxSize={5} color="neutral.700" />
        <Text fontSize="lg" fontWeight="bold" color="neutral.900">{title}</Text>
      </Flex>
      <Box p={6}>{children}</Box>
    </Box>
  )
}

// Privacy Toggle Component
function PrivacyToggle({ title, description, isChecked, onChange }) {
  return (
    <Flex justify="space-between" align="center">
      <Box>
        <Text fontSize="md" fontWeight="medium" color="neutral.900">{title}</Text>
        <Text fontSize="sm" color="neutral.600">{description}</Text>
      </Box>
      <Switch isChecked={isChecked} onChange={onChange} colorScheme="green" />
    </Flex>
  )
}
