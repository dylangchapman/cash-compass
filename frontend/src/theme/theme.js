import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    // Stripe-inspired palette
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#635bff', // Stripe purple
      600: '#5145cd',
      700: '#4239a4',
      800: '#342e81',
      900: '#2b2768',
    },
    neutral: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },
  },
  fonts: {
    heading: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    mono: '"SF Mono", "Monaco", "Inconsolata", "Fira Code", monospace',
  },
  fontSizes: {
    xs: '0.6875rem',
    sm: '0.8125rem',
    md: '0.9375rem',
    lg: '1.125rem',
    xl: '1.375rem',
    '2xl': '1.75rem',
    '3xl': '2.25rem',
    '4xl': '3rem',
    '5xl': '4rem',
    '6xl': '5rem',
    '7xl': '6rem',
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    tighter: 1.1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacings: {
    tighter: '-0.06em',
    tight: '-0.03em',
    normal: '0',
    wide: '0.015em',
    wider: '0.05em',
    widest: '0.1em',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  styles: {
    global: {
      body: {
        bg: '#ffffff',
        color: 'neutral.900',
        fontSize: 'md',
        lineHeight: 'normal',
        fontWeight: 'normal',
      },
      '*::placeholder': {
        color: 'neutral.400',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: '6px',
        transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
        _focus: {
          boxShadow: 'none',
        },
      },
      sizes: {
        sm: {
          fontSize: 'sm',
          px: 4,
          py: 2,
          h: '36px',
        },
        md: {
          fontSize: 'md',
          px: 6,
          py: 2.5,
          h: '42px',
        },
        lg: {
          fontSize: 'lg',
          px: 8,
          py: 3,
          h: '50px',
        },
      },
      variants: {
        primary: {
          bg: 'neutral.900',
          color: 'white',
          _hover: {
            bg: 'neutral.800',
            transform: 'translateY(-1px)',
          },
          _active: {
            bg: 'neutral.900',
            transform: 'translateY(0)',
          },
        },
        secondary: {
          bg: 'white',
          color: 'neutral.900',
          border: '1.5px solid',
          borderColor: 'neutral.300',
          _hover: {
            borderColor: 'neutral.900',
            transform: 'translateY(-1px)',
          },
        },
        ghost: {
          bg: 'transparent',
          color: 'neutral.700',
          _hover: {
            bg: 'neutral.100',
            color: 'neutral.900',
          },
        },
      },
      defaultProps: {
        variant: 'primary',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'white',
          borderRadius: '8px',
          border: '1px solid',
          borderColor: 'neutral.200',
          overflow: 'hidden',
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: 'neutral.300',
            borderWidth: '1.5px',
            borderRadius: '6px',
            fontSize: 'md',
            _hover: {
              borderColor: 'neutral.400',
            },
            _focus: {
              borderColor: 'neutral.900',
              boxShadow: '0 0 0 1px var(--chakra-colors-neutral-900)',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Select: {
      baseStyle: {
        field: {
          // Ensure option elements inside select are styled
          '> option, > optgroup': {
            bg: 'white',
            color: 'neutral.900',
          },
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'white',
            color: 'neutral.900',
            borderColor: 'neutral.300',
            borderWidth: '1.5px',
            borderRadius: '6px',
            fontSize: 'md',
            _hover: {
              borderColor: 'neutral.400',
            },
            _focus: {
              borderColor: 'neutral.900',
              boxShadow: '0 0 0 1px var(--chakra-colors-neutral-900)',
            },
            // Style the dropdown options with high contrast
            '> option, > optgroup': {
              bg: 'white',
              color: 'neutral.900',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: 'semibold',
        fontSize: 'xs',
        px: 3,
        py: 1,
        borderRadius: '4px',
        textTransform: 'uppercase',
        letterSpacing: 'wide',
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: 'bold',
        letterSpacing: 'tight',
        color: 'neutral.900',
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            fontSize: 'xs',
            fontWeight: 'semibold',
            textTransform: 'uppercase',
            letterSpacing: 'wider',
            color: 'neutral.600',
            borderColor: 'neutral.200',
          },
          td: {
            borderColor: 'neutral.200',
          },
        },
      },
    },
  },
  shadows: {
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  radii: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
})

export default theme
