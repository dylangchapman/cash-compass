import { Box, Heading, Text } from '@chakra-ui/react'

export default function PageHeader({ title, description }) {
  return (
    <Box mb={8} pb={6} borderBottom="1px solid" borderColor="neutral.200">
      <Heading size="2xl" mb={3} letterSpacing="tight">
        {title}
      </Heading>
      {description && (
        <Text fontSize="lg" color="neutral.600" maxW="3xl">
          {description}
        </Text>
      )}
    </Box>
  )
}
