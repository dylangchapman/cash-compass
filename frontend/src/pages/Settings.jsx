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
} from 'react-icons/md'

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
            Manage your account, security, and privacy preferences
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
      <Modal isOpen={deleteAccountModal.isOpen} onClose={deleteAccountModal.onClose} isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent
          bg="neutral.900"
          border="2px solid"
          borderColor="neutral.600"
          borderRadius="8px"
          boxShadow="0 10px 40px rgba(0, 0, 0, 0.5)"
        >
          <ModalHeader color="white" borderBottom="1px solid" borderColor="neutral.700" pb={4}>
            Delete Account
          </ModalHeader>
          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Alert status="error" borderRadius="6px" bg="error.900" border="1px solid" borderColor="error.600">
                <AlertIcon color="error.400" />
                <Text fontWeight="semibold" color="error.200">This will permanently delete your account</Text>
              </Alert>
              <Text color="neutral.200">Type <Text as="strong" color="white">DELETE</Text> to confirm:</Text>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                bg="neutral.800"
                color="white"
                border="1px solid"
                borderColor="neutral.600"
                _focus={{ borderColor: 'neutral.400', boxShadow: 'none' }}
                _placeholder={{ color: 'neutral.500' }}
              />
            </VStack>
          </ModalBody>
          <ModalFooter borderTop="1px solid" borderColor="neutral.700" pt={4}>
            <Button variant="ghost" mr={3} onClick={deleteAccountModal.onClose} color="neutral.200" _hover={{ bg: 'neutral.700', color: 'white' }}>
              Cancel
            </Button>
            <Button bg="error.600" color="white" _hover={{ bg: 'error.500' }} onClick={handleDeleteAccount} isDisabled={deleteConfirmText !== 'DELETE'}>
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
