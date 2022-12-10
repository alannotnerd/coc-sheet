import * as React from "react";

import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import Sheet from "./Sheet";

const theme = createTheme({});

export class App extends React.Component {
  public render() {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div>
          <main>
            <Sheet />
          </main>
        </div>
      </ThemeProvider>
    );
  }
}

export default App;
