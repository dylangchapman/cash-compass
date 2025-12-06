import { Box, Text, HStack, Icon } from '@chakra-ui/react'
import { Card, CardBody } from '@chakra-ui/react'

export default function MetricCard({ label, value, change, trend, icon, valueColor }) {
  return (
    <Card>
      <CardBody p={6}>
        <HStack justify="space-between" mb={3}>
          <Text fontSize="sm" fontWeight="medium" color="neutral.600" textTransform="uppercase" letterSpacing="wide">
            {label}
          </Text>
          {icon && <Icon as={icon} boxSize={5} color="neutral.400" />}
        </HStack>

        <Text fontSize="3xl" fontWeight="semibold" color={valueColor || 'neutral.900'} letterSpacing="tight" mb={2}>
          {value}
        </Text>

        {change && (
          <HStack spacing={2}>
            <Text fontSize="sm" color={trend === 'up' ? 'success.600' : trend === 'down' ? 'error.600' : 'neutral.600'}>
              {change}
            </Text>
          </HStack>
        )}
      </CardBody>
    </Card>
  )
}
