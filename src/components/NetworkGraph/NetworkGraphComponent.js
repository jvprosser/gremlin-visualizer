import React from 'react';
import { connect } from 'react-redux';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data'; // 1. Import DataSet
import { ACTIONS } from '../../constants';

class NetworkGraph extends React.Component {
  constructor(props) {
    super(props);
    this.graphRef = React.createRef();

    // 2. Create and manage DataSet instances within the component.
    // This assumes props.nodeHolder and props.edgeHolder from Redux are plain arrays.
    this.nodes = new DataSet(props.nodes);
    this.edges = new DataSet(props.edges);
  }

  shouldComponentUpdate(nextProps, nextState) {
//   console.log("in Network shouldComponentUpdate");
  // If this condition is met, the component will not update
//  if (this.props.value === nextProps.value) {
//    return false;
//  }
    return true;
  }

  componentDidMount() {
//      console.log("Node data:", this.props.nodes);
//      console.log("Edge data:", this.props.edges);

    // 3. Use the component's internal DataSet instances to build the graph.
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    this.network = new Network(this.graphRef.current, data, this.props.networkOptions);

    // --- Event listeners remain the same ---
    this.network.on('selectNode', (params) => {
      const nodeId = params.nodes && params.nodes.length > 0 ? params.nodes[0] : null;
      this.props.dispatch({ type: ACTIONS.SET_SELECTED_NODE, payload: nodeId });
    });

    this.network.on('selectEdge', (params) => {
      const edgeId = params.edges && params.edges.length === 1 ? params.edges[0] : null;
      const isNodeSelected = params.nodes && params.nodes.length > 0;
      if (!isNodeSelected && edgeId !== null) {
        this.props.dispatch({ type: ACTIONS.SET_SELECTED_EDGE, payload: edgeId });
      }
    });
  }

  // 4. Add componentDidUpdate to sync changes from Redux props to the local DataSet.
  componentDidUpdate(prevProps, prevState) {
    // If the node array from Redux has changed, update the DataSet.
//     console.log("in Network  componentDidUpdate")
//     console.log(`prevprops=${JSON.stringify(prevProps)}`)
//     console.log(`prevstates=${JSON.stringify(prevState)}`)
//     console.log(`this.props=${JSON.stringify(this.props)}`)

    if (this.props.nodes !== prevProps.nodes) {
//        console.log("Node data updated:", this.props.nodes);

      this.nodes.clear();
      this.nodes.add(this.props.nodes);
    }

    // If the edge array from Redux has changed, update the DataSet.
    if (this.props.edges !== prevProps.edges) {
//        console.log("Edge data updated:", this.props.edges);

      this.edges.clear();
      this.edges.add(this.props.edges);
    }
  }


  render() {
//        console.log("in network render");

    return <div ref={this.graphRef} className={'mynetwork'} />;
  }
}

export const NetworkGraphComponent = connect((state) => {
  return {
    nodes: state.graph.nodes,
    edges: state.graph.edges,
    networkOptions: state.options.networkOptions,
    FUCKME: "YES",
  };
})(NetworkGraph);
