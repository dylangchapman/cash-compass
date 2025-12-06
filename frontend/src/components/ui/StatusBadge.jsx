import { Badge } from '@chakra-ui/react'

const statusConfig = {
  success: { colorScheme: 'green', bg: 'success.600', color: 'white' },
  warning: { colorScheme: 'yellow', bg: 'warning.600', color: 'white' },
  error: { colorScheme: 'red', bg: 'error.600', color: 'white' },
  info: { colorScheme: 'blue', bg: 'primary.600', color: 'white' },
  neutral: { colorScheme: 'gray', bg: 'neutral.600', color: 'white' },
}

export default function StatusBadge({ status, children, ...props }) {
  const config = statusConfig[status] || statusConfig.neutral

  return (
    <Badge
      bg={config.bg}
      color={config.color}
      px={2.5}
      py={1}
      borderRadius="md"
      fontWeight="medium"
      fontSize="xs"
      {...props}
    >
      {children}
    </Badge>
  )
}
