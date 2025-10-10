import React from 'react';
import { connect } from 'react-redux';
import { Button, TextField }  from '@mui/material';
import axios from 'axios';
import { ACTIONS, QUERY_ENDPOINT, COMMON_GREMLIN_ERROR } from '../../constants';
import { onFetchQuery } from '../../logics/actionHelper';

class Header extends React.Component {
  clearGraph() {
    this.props.dispatch({ type: ACTIONS.CLEAR_GRAPH });
    this.props.dispatch({ type: ACTIONS.CLEAR_QUERY_HISTORY });
  }

  // Refactored to be an async function for better readability
async sendQuery() {
//  console.log("in sendQuery()");
//  console.log(`Processing user data: ${JSON.stringify(this.props)}`);

  this.props.dispatch({ type: ACTIONS.SET_ERROR, payload: null });

  try {
    // Use 'await' to wait for the post request to resolve
    const response = await axios.post(
      QUERY_ENDPOINT,
      {
        host: this.props.host,
        port: this.props.port,
        query: this.props.query,
        nodeLimit: this.props.nodeLimit,
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    // This code runs only after the await is successful (replaces .then())
    onFetchQuery(
      response,
      this.props.query,
      [...this.props.nodeLabels],
//      this.props.nodeLabels,
      this.props.dispatch
    );

  } catch (error) {
    // The catch block handles any errors from the axios call (replaces .catch())
    if (error.response) {
      console.error('Response Data:', error.response.data);
      console.error('Status Code:', error.response.status);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error Message:', error.message);
    }

    this.props.dispatch({
      type: ACTIONS.SET_ERROR,
      payload: COMMON_GREMLIN_ERROR,
    });
  }
}

  onHostChanged(host) {
    this.props.dispatch({ type: ACTIONS.SET_HOST, payload: host });
  }

  onPortChanged(port) {
    this.props.dispatch({ type: ACTIONS.SET_PORT, payload: port });
  }

  onQueryChanged(query) {
    this.props.dispatch({ type: ACTIONS.SET_QUERY, payload: query });
  }

  render(){
//        console.log("in header render");
    return (
      <div className={'header'}>
        <form noValidate autoComplete="off">
          <TextField value={this.props.host} onChange={(event => this.onHostChanged(event.target.value))} id="standard-basic" label="host" style={{width: '10%'}} />
          <TextField value={this.props.port} onChange={(event => this.onPortChanged(event.target.value))} id="standard-basic" label="port" style={{width: '10%'}} />
          <TextField value={this.props.query} onChange={(event => this.onQueryChanged(event.target.value))} id="standard-basic" label="gremlin query" style={{width: '60%'}} />
          <Button variant="contained" color="primary" onClick={this.sendQuery.bind(this)} style={{width: '150px'}} >Execute</Button>
          <Button variant="outlined" color="secondary" onClick={this.clearGraph.bind(this)} style={{width: '150px'}} >Clear Graph</Button>
        </form>

        <br />
        <div style={{color: 'red'}}>{this.props.error}</div>
      </div>

    );
  }
}

export const HeaderComponent = connect((state)=>{
  return {
    host: state.gremlin.host,
    port: state.gremlin.port,
    query: state.gremlin.query,
    error: state.gremlin.error,
    nodes: state.graph.nodes,
    edges: state.graph.edges,
    nodeLabels: state.options.nodeLabels,
    nodeLimit: state.options.nodeLimit
  };
})(Header);
