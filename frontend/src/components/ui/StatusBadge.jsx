import { Badge } from '@chakra-ui/react'

const statusConfig = {
  success: { colorScheme: 'green', bg: 'success.50', color: 'success.700' },
  warning: { colorScheme: 'yellow', bg: 'warning.50', color: 'warning.700' },
  error: { colorScheme: 'red', bg: 'error.50', color: 'error.700' },
  info: { colorScheme: 'blue', bg: 'primary.50', color: 'primary.700' },
  neutral: { colorScheme: 'gray', bg: 'neutral.100', color: 'neutral.700' },
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
