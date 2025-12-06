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
} from '@chakra-ui/react'
import {
  MdPerson,
  MdLock,
  MdDownload,
  MdDelete,
  MdPrivacyTip,
  MdSecurity,
  MdWarning,
} from 'react-icons/md'

export default function Account() {
  const navigate = useNavigate()
  const toast = useToast()
  const userName = localStorage.getItem('userName') || 'User'
  const userEmail = localStorage.getItem('userEmail') || 'user@example.com'

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    aiAnalysis: true,
    anonymizedData: false,
    emailWeeklySummary: true,
    emailAnomalyAlerts: true,
    emailGoalUpdates: false,
    chatHistoryRetention: '30days',
  })

  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  // Delete modals
  const deleteAccountModal = useDisclosure()
  const deleteChatModal = useDisclosure()
  const deleteDataModal = useDisclosure()

  const [deleteConfirmText, setDeleteConfirmText] = useState('')

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
    toast({
      title: 'Setting updated',
      status: 'success',
      duration: 2000,
    })
  }

  const handlePasswordChange = () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: 'Passwords do not match',
        status: 'error',
        duration: 3000,
      })
      return
    }
    if (passwords.new.length < 8) {
      toast({
        title: 'Password must be at least 8 characters',
        status: 'error',
        duration: 3000,
      })
      return
    }
    toast({
      title: 'Password updated successfully',
      status: 'success',
      duration: 3000,
    })
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
    // In a real app, this would trigger an API call and file download
  }

  const handleDeleteChatHistory = () => {
    deleteChatModal.onClose()
    toast({
      title: 'Chat history deleted',
      description: 'All conversation history has been permanently removed.',
      status: 'success',
      duration: 3000,
    })
  }

  const handleDeleteData = () => {
    deleteDataModal.onClose()
    toast({
      title: 'Financial data deleted',
      description: 'Your transaction and portfolio data has been removed.',
      status: 'success',
      duration: 3000,
    })
  }

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: 'Please type DELETE to confirm',
        status: 'error',
        duration: 3000,
      })
      return
    }
    localStorage.clear()
    deleteAccountModal.onClose()
    navigate('/login')
  }

  return (
    <Box bg="white" minH="100vh">
      {/* Header */}
      <Box bg="neutral.900" color="white" pt={32} pb={16}>
        <Container maxW="1000px">
          <Text
            fontSize={{ base: '4xl', md: '5xl' }}
            fontWeight="black"
            letterSpacing="tighter"
            mb={4}
          >
            Account Settings
          </Text>
          <Text fontSize="lg" color="neutral.400">
            Manage your profile, security, and privacy preferences
          </Text>
        </Container>
      </Box>

      <Container maxW="1000px" py={12}>
        <VStack spacing={8} align="stretch">

          {/* Profile Information */}
          <SettingsSection icon={MdPerson} title="Profile Information">
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              <Box>
                <Text fontSize="xs" color="neutral.500" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                  Full Name
                </Text>
                <Text fontSize="md" fontWeight="medium" color="neutral.900">
                  {userName}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color="neutral.500" mb={1} fontWeight="semibold" textTransform="uppercase" letterSpacing="wide">
                  Email Address
                </Text>
                <Text fontSize="md" fontWeight="medium" color="neutral.900">
                  {userEmail}
                </Text>
              </Box>
            </Grid>
          </SettingsSection>

          {/* Security Settings */}
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
                <Divider />
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontSize="md" fontWeight="medium" color="neutral.900">Two-Factor Authentication</Text>
                    <Text fontSize="sm" color="neutral.600">Add an extra layer of security to your account</Text>
                  </Box>
                  <Button size="sm" variant="secondary">
                    Configure
                  </Button>
                </Flex>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={4}>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Current Password</FormLabel>
                  <Input
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">New Password</FormLabel>
                  <Input
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                    bg="white"
                    color="neutral.900"
                  />
                  <Text fontSize="xs" color="neutral.500" mt={1}>Minimum 8 characters</Text>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" fontWeight="semibold">Confirm New Password</FormLabel>
                  <Input
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    bg="white"
                    color="neutral.900"
                  />
                </FormControl>
                <HStack spacing={3}>
                  <Button size="sm" onClick={handlePasswordChange}>
                    Update Password
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowPasswordChange(false)}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            )}
          </SettingsSection>

          {/* Privacy Dashboard */}
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
              <Divider />
              <Box>
                <Text fontSize="md" fontWeight="medium" color="neutral.900" mb={3}>Email Notifications</Text>
                <VStack align="stretch" spacing={3} pl={4}>
                  <PrivacyToggle
                    title="Weekly Summary"
                    description="Receive a weekly overview of your spending"
                    isChecked={privacySettings.emailWeeklySummary}
                    onChange={() => handlePrivacyToggle('emailWeeklySummary')}
                    compact
                  />
                  <PrivacyToggle
                    title="Anomaly Alerts"
                    description="Get notified about unusual transactions"
                    isChecked={privacySettings.emailAnomalyAlerts}
                    onChange={() => handlePrivacyToggle('emailAnomalyAlerts')}
                    compact
                  />
                  <PrivacyToggle
                    title="Goal Updates"
                    description="Receive updates on goal progress"
                    isChecked={privacySettings.emailGoalUpdates}
                    onChange={() => handlePrivacyToggle('emailGoalUpdates')}
                    compact
                  />
                </VStack>
              </Box>
            </VStack>
          </SettingsSection>

          {/* Data Export */}
          <SettingsSection icon={MdDownload} title="Export Your Data">
            <Text fontSize="sm" color="neutral.600" mb={4}>
              Download a copy of your data in standard formats. Exports include all data associated with your account.
            </Text>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MdDownload />}
                onClick={() => handleExport('transactions')}
              >
                Transactions (CSV)
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MdDownload />}
                onClick={() => handleExport('portfolio')}
              >
                Portfolio (CSV)
              </Button>
              <Button
                variant="secondary"
                size="md"
                leftIcon={<MdDownload />}
                onClick={() => handleExport('all')}
              >
                All Data (JSON)
              </Button>
            </Grid>
          </SettingsSection>

          {/* Data Deletion */}
          <SettingsSection icon={MdDelete} title="Delete Data">
            <Alert status="info" borderRadius="6px" mb={4}>
              <AlertIcon />
              <Text fontSize="sm">Data deletion is permanent and cannot be undone.</Text>
            </Alert>
            <VStack align="stretch" spacing={4}>
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="md" fontWeight="medium" color="neutral.900">Chat History</Text>
                  <Text fontSize="sm" color="neutral.600">Delete all conversations with the AI coach</Text>
                </Box>
                <Button
                  size="sm"
                  variant="secondary"
                  color="error.600"
                  borderColor="error.300"
                  onClick={deleteChatModal.onOpen}
                >
                  Delete Chat History
                </Button>
              </Flex>
              <Divider />
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="md" fontWeight="medium" color="neutral.900">Financial Data</Text>
                  <Text fontSize="sm" color="neutral.600">Delete all transactions, goals, and portfolio data</Text>
                </Box>
                <Button
                  size="sm"
                  variant="secondary"
                  color="error.600"
                  borderColor="error.300"
                  onClick={deleteDataModal.onOpen}
                >
                  Delete Financial Data
                </Button>
              </Flex>
              <Divider />
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontSize="md" fontWeight="medium" color="neutral.900">Delete Account</Text>
                  <Text fontSize="sm" color="neutral.600">Permanently delete your account and all associated data</Text>
                </Box>
                <Button
                  size="sm"
                  bg="error.600"
                  color="white"
                  _hover={{ bg: 'error.700' }}
                  onClick={deleteAccountModal.onOpen}
                >
                  Delete Account
                </Button>
              </Flex>
            </VStack>
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

      {/* Delete Chat History Modal */}
      <Modal isOpen={deleteChatModal.isOpen} onClose={deleteChatModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Chat History</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3} color="warning.600">
                <Icon as={MdWarning} boxSize={6} />
                <Text fontWeight="semibold">This action cannot be undone</Text>
              </HStack>
              <Text color="neutral.700">
                All conversations with the AI coach will be permanently deleted. This includes
                all questions you have asked and recommendations you have received.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteChatModal.onClose}>
              Cancel
            </Button>
            <Button bg="error.600" color="white" _hover={{ bg: 'error.700' }} onClick={handleDeleteChatHistory}>
              Delete Chat History
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Financial Data Modal */}
      <Modal isOpen={deleteDataModal.isOpen} onClose={deleteDataModal.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Financial Data</ModalHeader>
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <HStack spacing={3} color="warning.600">
                <Icon as={MdWarning} boxSize={6} />
                <Text fontWeight="semibold">This action cannot be undone</Text>
              </HStack>
              <Text color="neutral.700">
                This will permanently delete:
              </Text>
              <VStack align="stretch" spacing={1} pl={4}>
                <Text fontSize="sm" color="neutral.700">- All transaction history</Text>
                <Text fontSize="sm" color="neutral.700">- All financial goals and progress</Text>
                <Text fontSize="sm" color="neutral.700">- Portfolio holdings and history</Text>
                <Text fontSize="sm" color="neutral.700">- Subscription tracking data</Text>
              </VStack>
              <Text color="neutral.700" fontWeight="medium">
                Your account will remain active but all financial data will be removed.
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteDataModal.onClose}>
              Cancel
            </Button>
            <Button bg="error.600" color="white" _hover={{ bg: 'error.700' }} onClick={handleDeleteData}>
              Delete Financial Data
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
              <Text color="neutral.700">
                Deleting your account will:
              </Text>
              <VStack align="stretch" spacing={1} pl={4}>
                <Text fontSize="sm" color="neutral.700">- Remove all personal information</Text>
                <Text fontSize="sm" color="neutral.700">- Delete all financial data and history</Text>
                <Text fontSize="sm" color="neutral.700">- Cancel any active subscriptions</Text>
                <Text fontSize="sm" color="neutral.700">- Remove access to the service</Text>
              </VStack>
              <Box pt={4}>
                <Text fontSize="sm" color="neutral.700" mb={2}>
                  Type <strong>DELETE</strong> to confirm:
                </Text>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  bg="white"
                  color="neutral.900"
                />
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={deleteAccountModal.onClose}>
              Cancel
            </Button>
            <Button
              bg="error.600"
              color="white"
              _hover={{ bg: 'error.700' }}
              onClick={handleDeleteAccount}
              isDisabled={deleteConfirmText !== 'DELETE'}
            >
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
        <Text fontSize="lg" fontWeight="bold" color="neutral.900">
          {title}
        </Text>
      </Flex>
      <Box p={6}>
        {children}
      </Box>
    </Box>
  )
}

// Privacy Toggle Component
function PrivacyToggle({ title, description, isChecked, onChange, compact = false }) {
  return (
    <Flex justify="space-between" align="center">
      <Box>
        <Text fontSize={compact ? 'sm' : 'md'} fontWeight="medium" color="neutral.900">
          {title}
        </Text>
        <Text fontSize={compact ? 'xs' : 'sm'} color="neutral.600">
          {description}
        </Text>
      </Box>
      <Switch
        isChecked={isChecked}
        onChange={onChange}
        colorScheme="green"
        size={compact ? 'sm' : 'md'}
      />
    </Flex>
  )
}
