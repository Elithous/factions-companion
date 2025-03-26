import { createTheme, MantineColorsTuple } from '@mantine/core';

// Define a brown color palette based on #8D6A3F
const brownPrimary: MantineColorsTuple = [
  '#f8f0e6', // lightest
  '#ecdcc7',
  '#d9c2a4',
  '#c5a77e',
  '#b6935f',
  '#a98349',
  '#8D6A3F', // primary
  '#7a5c35',
  '#694e2d',
  '#573f23'  // darkest
];

export const mantineTheme = createTheme({
  colors: {
    brownPrimary,
  },
  primaryColor: 'brownPrimary',
  
  // Set default background color for components
  components: {
    Paper: {
      defaultProps: {
        bg: '#8D6A3F',
      },
    },
    Box: {
      defaultProps: {
        bg: '#8D6A3F',
      },
    },
    AppShell: {
      defaultProps: {
        bg: '#8D6A3F',
      },
    },
    Button: {
      defaultProps: {
        color: 'blue'
      },
    },
    Slider: {
      defaultProps: {
        color: 'blue'
      },
    },
    Checkbox: {
      defaultProps: {
        color: 'blue'
      }
    }
  },
}); 