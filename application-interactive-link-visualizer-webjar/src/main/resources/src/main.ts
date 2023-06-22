/*
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

import DirectedGraph from "graphology";
import Sigma from "sigma";
import { Coordinates, EdgeDisplayData, NodeDisplayData } from "sigma/types";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";

export function visualize(data: any, sigmaContainer: string) {
  const graph = new DirectedGraph();
  graph.import(data);

  // Initialise x and y coordinates; nodes and edges size

  let i = 0;
  graph.forEachNode((node) => {
    graph.setNodeAttribute(node, "x", i++);
    graph.setNodeAttribute(node, "y", i);
    i++;
  });
  graph.forEachNode((node) => {
    graph.setNodeAttribute(node, "size", 10);
  });
  graph.forEachEdge((edge) => {
    graph.setEdgeAttribute(edge, "size", 3);
  });

  // Declare DOM Elements
  const container = document.getElementById(sigmaContainer);
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const searchSuggestions = document.getElementById("suggestions") as HTMLDataListElement;
  const zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
  const zoomOutBtn = document.getElementById("zoom-out") as HTMLButtonElement;
  const zoomResetBtn = document.getElementById("zoom-reset") as HTMLButtonElement;
  const labelsThresholdRange = document.getElementById("labels-threshold") as HTMLInputElement;

  /* We have 2 options for settings but ofcourse we can only choose 1 at a time:
  const customSettings = {
    gravity: 1,
    adjustSizes: true,
    barnesHutOptimize: true
  };
  */
  const sensibleSettings = forceAtlas2.inferSettings(graph);
  const fa2Layout = new FA2Layout(graph, {
    settings: sensibleSettings;
  });

  function stopFA2() {
    fa2Layout.stop();
  }
  function startFA2() {
    fa2Layout.start();
    setTimeout(stopFA2, 5000); // Stop the layout after 5 seconds
  }
  startFA2();

  const renderer = new Sigma(graph, container);

  // Search by nodes feature
  // Type and declare internal state:
  interface State {
    hoveredNode?: string;
    searchQuery: string;

    // State derived from query:
    selectedNode?: string;
    suggestions?: Set<string>;

    // State derived from hovered node:
    hoveredNeighbors?: Set<string>;
  }
  const state: State = { searchQuery: "" };

  // Feed the datalist autocomplete values:
  graph.forEachNode((node) => {
    const optionElement = document.createElement("option");
    const label = graph.getNodeAttribute(node, "label");
    optionElement.value = label;
    searchSuggestions.appendChild(optionElement);
  });

  // Actions:
  function setSearchQuery(query: string) {
    state.searchQuery = query;

    if (searchInput.value !== query) searchInput.value = query;

    if (query) {
      const lcQuery = query.toLowerCase();
      const suggestions = graph
        .nodes()
        .map((n) => ({
          id: n,
          label: graph.getNodeAttribute(n, "label") as string
        }))
        .filter(({ label }) => label.toLowerCase().includes(lcQuery));

      /* If we have a single perfect match, them we remove the suggestions, and
         we consider the user has selected a node through the datalist
         autocomplete: */
      if (suggestions.length === 1 && suggestions[0].label === query) {
        state.selectedNode = suggestions[0].id;
        state.suggestions = undefined;

        // Move the camera to center it on the selected node:
        const nodePosition = renderer.getNodeDisplayData(
          state.selectedNode
        ) as Coordinates;
        renderer.getCamera().animate(nodePosition, {
          duration: 2000
        });
      }
      // Else, we display the suggestions list:
      else {
        state.selectedNode = undefined;
        state.suggestions = new Set(suggestions.map(({ id }) => id));
      }
    }
    // If the query is empty, then we reset the selectedNode / suggestions state:
    else {
      state.selectedNode = undefined;
      state.suggestions = undefined;
    }

    // Refresh rendering:
    renderer.refresh();
  }
  function setHoveredNode(node?: string) {
    if (node) {
      state.hoveredNode = node;
      state.hoveredNeighbors = new Set(graph.neighbors(node));
    } else {
      state.hoveredNode = undefined;
      state.hoveredNeighbors = undefined;
    }

    // Refresh rendering:
    renderer.refresh();
  }

  // Bind search input interactions:
  searchInput.addEventListener("input", () => {
    setSearchQuery(searchInput.value || "");
  });
  searchInput.addEventListener("blur", () => {
    setSearchQuery("");
  });

  // Bind graph interactions:
  renderer.on("enterNode", ({ node }) => {
    setHoveredNode(node);
  });
  renderer.on("leaveNode", () => {
    setHoveredNode(undefined);
  });

  /* Render nodes accordingly to the internal state:
     1. If a node is selected, it is highlighted
     2. If there is query, all non-matching nodes are greyed
     3. If there is a hovered node, all non-neighbor nodes are greyed */

  renderer.setSetting("nodeReducer", (node, data) => {
    const res: Partial<NodeDisplayData> = { ...data };

    if (
      state.hoveredNeighbors &&
      !state.hoveredNeighbors.has(node) &&
      state.hoveredNode !== node
    ) {
      res.label = "";
      res.color = "#f6f6f6";
    }

    if (state.selectedNode === node) {
      res.highlighted = true;
    } else if (state.suggestions && !state.suggestions.has(node)) {
      res.label = "";
      res.color = "#f6f6f6";
    }

    return res;
  });

  /* Render edges accordingly to the internal state:
   1. If a node is hovered, the edge is hidden if it is not connected to the node
   2. If there is a query, the edge is only visible if it connects two suggestions */

  renderer.setSetting("edgeReducer", (edge, data) => {
    const res: Partial<EdgeDisplayData> = { ...data };

    if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
      res.hidden = true;
    }

    if (
      state.suggestions &&
      (!state.suggestions.has(graph.source(edge)) ||
        !state.suggestions.has(graph.target(edge)))
    ) {
      res.hidden = true;
    }

    return res;
  });

  // Interactive Buttons
  const camera = renderer.getCamera();

  // Bind zoom manipulation buttons
  zoomInBtn.addEventListener("click", () => {
    camera.animatedZoom({ duration: 800 });
  });
  zoomOutBtn.addEventListener("click", () => {
    camera.animatedUnzoom({ duration: 800 });
  });
  zoomResetBtn.addEventListener("click", () => {
    camera.animatedReset({ duration: 800 });
  });

  // Bind labels threshold to range input
  labelsThresholdRange.addEventListener("input", () => {
    renderer.setSetting(
      "labelRenderedSizeThreshold",
      +labelsThresholdRange.value
    );
  });

  // Set proper range initial value:
  labelsThresholdRange.value =
    renderer.getSetting("labelRenderedSizeThreshold") + "";

  // Draggable nodes feature
  let draggedNode: string | null = null;
  let isDragging = false;

  /* On mouse down on a node
    - we enable the drag mode
    - save in the dragged node in the state
    - highlight the node
    - disable the camera so its state is not updated */

  renderer.on("downNode", (e) => {
    isDragging = true;
    draggedNode = e.node;
    graph.setNodeAttribute(draggedNode, "highlighted", true);
  });

    // On mouse move, if the drag mode is enabled, we change the position of the draggedNode
  renderer.getMouseCaptor().on("mousemovebody", (e) => {
    if (!isDragging || !draggedNode) return;

    // Get new position of node
    const pos = renderer.viewportToGraph(e);

    graph.setNodeAttribute(draggedNode, "x", pos.x);
    graph.setNodeAttribute(draggedNode, "y", pos.y);

    // Prevent sigma to move camera:
    e.preventSigmaDefault();
    e.original.preventDefault();
    e.original.stopPropagation();
  });

    // On mouse up, we reset the autoscaling and the dragging mode
  renderer.getMouseCaptor().on("mouseup", () => {
    if (draggedNode) {
      graph.removeNodeAttribute(draggedNode, "highlighted");
    }
    isDragging = false;
    draggedNode = null;
  });

  // Disable the autoscale at the first down interaction
  renderer.getMouseCaptor().on("mousedown", () => {
    if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
  });
}

export default visualize;