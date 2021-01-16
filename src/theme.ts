import { pink } from '@material-ui/core/colors'
import { createMuiTheme } from '@material-ui/core/styles'

// Create a theme instance.
const theme = createMuiTheme({
  // @see https://github.com/mui-org/material-ui/issues/18308
  overrides: {
    MuiAppBar: {
      colorPrimary: {
        backgroundColor: '#424242',
      },
    },
  },
  palette: {
    type: 'dark',
    primary: {
      main: pink.A200,
    },
  },
})

export default theme
