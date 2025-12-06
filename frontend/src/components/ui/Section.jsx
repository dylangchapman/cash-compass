import { Box, Heading, Text } from '@chakra-ui/react'

export default function Section({ title, description, children, ...props }) {
  return (
    <Box mb={12} {...props}>
      {(title || description) && (
        <Box mb={6}>
          {title && (
            <Heading size="lg" mb={2} letterSpacing="tight">
              {title}
            </Heading>
          )}
          {description && (
            <Text color="neutral.600" fontSize="md">
              {description}
            </Text>
          )}
        </Box>
      )}
      {children}
    </Box>
  )
}
