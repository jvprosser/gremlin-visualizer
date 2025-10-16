import _ from 'lodash';
import { ACTIONS } from '../constants';
import { getDiffNodes, getDiffEdges, findNodeById } from '../logics/utils';

// 1. Removed nodeHolder and edgeHolder. The state should only contain plain data.
const initialState = {
  nodes: [],
  edges: [],
  selectedNode: {},
  selectedEdge: {},
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.CLEAR_GRAPH: {
      // 2. To clear, simply return the initial state object.
      return initialState;
    }

    case ACTIONS.ADD_NODES: {
      const newNodes = getDiffNodes(action.payload, state.nodes);
      // 3. Return a new state object with a new, combined array.
      return {
        ...state,
        nodes: [...state.nodes, ...newNodes],
      };
    }

    case ACTIONS.ADD_EDGES: {
      const newEdges = getDiffEdges(action.payload, state.edges);
      // 4. Same immutable pattern for edges.
      return {
        ...state,
        edges: [...state.edges, ...newEdges],
      };
    }

    case ACTIONS.SET_SELECTED_NODE: {
      const nodeId = action.payload;
      const selectedNode = nodeId !== null ? findNodeById(state.nodes, nodeId) : {};
      return { ...state, selectedNode, selectedEdge: {} };
    }

    case ACTIONS.SET_SELECTED_EDGE: {
      const edgeId = action.payload;
      const selectedEdge = edgeId !== null ? findNodeById(state.edges, edgeId) : {};
      return { ...state, selectedEdge, selectedNode: {} };
    }

    case ACTIONS.REFRESH_NODE_LABELS: {
      const nodeLabelMap = _.mapValues(_.keyBy(action.payload, 'type'), 'field');

      // 5. Use .map() to create a NEW array instead of mutating the old one.
      const updatedNodes = state.nodes.map(node => {
        if (node.type in nodeLabelMap) {
          const field = nodeLabelMap[node.type];
          const label = node.properties[field];
          // Return a new object for the updated node
          return { ...node, label };
        }
        // Return the original object if no changes
        return node;
      });

      // Return a new state object with the updated nodes array.
      return { ...state, nodes: updatedNodes };
    }

    default:
      return state;
  }
};
