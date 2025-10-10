import React from 'react';
import { Grid }  from '@mui/material';
import { NetworkGraphComponent } from './components/NetworkGraph/NetworkGraphComponent';
import { HeaderComponent } from './components/Header/HeaderComponent';
import { DetailsComponent } from './components/Details/DetailsComponent';
import { StrictMode } from 'react';


export class App extends React.Component{
  render(){
    return (
      <div>
        <Grid container spacing={1}>
          <Grid   size={{ xs:12, sm: 12 , md: 12 }}>
            <HeaderComponent />
          </Grid>
          <Grid  size={{ xs:12, sm: 9 , md: 9 }}>
      <StrictMode>

            <NetworkGraphComponent />
      </StrictMode>
          </Grid>
          <Grid  size={{ xs:12, sm: 3 , md: 3 }}>
            <DetailsComponent />
          </Grid>
        </Grid>

      </div>
      );
  }
}
