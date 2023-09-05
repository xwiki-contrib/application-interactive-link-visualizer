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
import {
  Coordinates,
  EdgeDisplayData,
  NodeDisplayData,
  PartialButFor
} from "sigma/types";
import forceAtlas2 from "graphology-layout-forceatlas2";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import { Settings } from "sigma/settings";
import drawLabel from "sigma/rendering/canvas/label";
import EdgeArrowHeadProgram from "sigma/rendering/webgl/programs/edge.arrowHead";
import { createEdgeCompoundProgram } from "sigma/rendering/webgl/programs/common/edge";
import EdgeClampedProgram from "sigma/rendering/webgl/programs/edge.clamped";

interface ThemeColors {
  labelColor: string,
  fadeColor: string,
  labelContainerColor: string,
  nodeColor: string
}

export function visualize(data: DirectedGraph, sigmaContainer: string, themeColors: ThemeColors, isPanel : boolean = false, nb : number = null) {
  const graph = new DirectedGraph();
  graph.import(data);

 // Initialise x and y coordinates & edge size
 let i : number = 0;
 graph.forEachNode((node) => {
   graph.setNodeAttribute(node, "x", i++);
   graph.setNodeAttribute(node, "y", i);
   i++;
 });
 graph.forEachEdge((edge) => {
  graph.setEdgeAttribute(edge, "size", (isPanel ? 2 : 1));
});

 class customEdgeArrowHeadProgram extends EdgeArrowHeadProgram {
  process(
    sourceData: NodeDisplayData,
    targetData: NodeDisplayData,
    data: EdgeDisplayData,
    hidden: boolean,
    offset: number
  ) {
    data.size *= (isPanel ? 3.5 : 4) || 1;
    super.process(sourceData, targetData, data, hidden, offset);
  }
}

const EdgeArrowProgram = createEdgeCompoundProgram([
  EdgeClampedProgram,
  customEdgeArrowHeadProgram
]);

  // Declare DOM Elements
  const container : HTMLElement = document.getElementById(sigmaContainer);
  const searchInput = document.getElementById("search-input") as HTMLInputElement;
  const searchSuggestions = document.getElementById("suggestions") as HTMLDataListElement;
  const zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
  const zoomOutBtn = document.getElementById("zoom-out") as HTMLButtonElement;
  const zoomResetBtn = document.getElementById("zoom-reset") as HTMLButtonElement;
  const iterationBtn = document.getElementById("iteration-button") as HTMLButtonElement;
  const killGraphBtn = document.getElementById("kill-graph-button") as HTMLButtonElement;


  /* We have 2 options for settings but ofcourse we can only choose 1 at a time:
    const customSettings = {
    gravity: 0.01,
    adjustSizes: true,
    barnesHutOptimize: true,
    scalingRatio: 10,
    slowDown: 10
  };
  */
  const sensibleSettings = forceAtlas2.inferSettings(graph);
  const fa2Layout = new FA2Layout(graph, {
    settings: sensibleSettings
  });

  function stopFA2() {
    fa2Layout.stop();
  }
  function startFA2() {
    fa2Layout.start();
    setTimeout(stopFA2, (isPanel ? 1500 : (Math.log(nb) * 1200)));
  }
  startFA2();

   function customDrawHover(
    context: CanvasRenderingContext2D,
    data: PartialButFor<NodeDisplayData, "x" | "y" | "size" | "label" | "color">,
    settings: Settings
  ): void {
    const size = settings.labelSize,
      font = settings.labelFont,
      weight = "bold";
  
    context.font = `${weight} ${size}px ${font}`;
  
    // Then we draw the label background
    context.fillStyle = themeColors.labelContainerColor;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 6;
    context.shadowColor = themeColors.labelColor;
  
    const PADDING = 3;
  
    if (typeof data.label === "string") {
      const textWidth = context.measureText(data.label).width,
        boxWidth = Math.round(textWidth + 5),
        boxHeight = Math.round(size + 2 * PADDING),
        radius = Math.max(data.size, size / 2) + PADDING;
  
      const angleRadian = Math.asin(boxHeight / 2 / radius);
      const xDeltaCoord = Math.sqrt(
        Math.abs(Math.pow(radius, 2) - Math.pow(boxHeight / 2, 2))
      );
  
      context.beginPath();
      context.moveTo(data.x + xDeltaCoord, data.y + boxHeight / 2);
      context.lineTo(data.x + radius + boxWidth, data.y + boxHeight / 2);
      context.lineTo(data.x + radius + boxWidth, data.y - boxHeight / 2);
      context.lineTo(data.x + xDeltaCoord, data.y - boxHeight / 2);
      context.arc(data.x, data.y, radius, angleRadian, -angleRadian);
      context.closePath();
      context.fill();
    } else {
      context.beginPath();
      context.arc(data.x, data.y, data.size + PADDING, 0, Math.PI * 2);
      context.closePath();
      context.fill();
    }
  
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 0;
    context.shadowBlur = 0;
  
    // And finally we draw the label
    drawLabel(context, data, settings);
  }

  const rendererSettings = {
    labelRenderedSizeThreshold: (isPanel ? 0.7 : 1),
    defaultEdgeType: "arrow",
    labelSize: (isPanel ? 14 : 15),
    labelWeight: "normal",
    labelColor: { color: themeColors.labelColor },
    zIndex: true,
    hoverRenderer: customDrawHover,
    edgeProgramClasses: { arrow: EdgeArrowProgram },
    allowInvalidContainer: true
  };

  const renderer = new Sigma(graph, container, rendererSettings);
   
// Nice visual optimisations
renderer.on("enterNode", () => {
  container.style.cursor = "pointer";
});
renderer.on("leaveNode", () => {
  container.style.cursor = "default";
});

if(isPanel) {
renderer.on("enterNode", ({ node }) => {
  graph.updateNodeAttribute(node, "size", n => n + 4);
});
renderer.on("leaveNode", ({ node }) => {
  graph.updateNodeAttribute(node, "size", n => n - 4);
});
} else {
renderer.on("enterNode", ({ node }) => {
  graph.updateNodeAttribute(node, "size", n => n + 3);
  graph.updateNodeAttribute(node, "color", n => "orange");
});
renderer.on("leaveNode", ({ node }) => {
  graph.updateNodeAttribute(node, "size", n => n - 3);
  graph.updateNodeAttribute(node, "color", n => themeColors.nodeColor);
});
}

  // Search by nodes feature
  function handleSearch(graph: DirectedGraph, renderer: Sigma, isPanel : boolean) {

    if (isPanel) {
      return; // Skip search feature if we are on the Panel
    }

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

    // Make a new Set to store all lowercase labels and then perform the check
    const lowercaseLabels = new Set<string>(
      graph.nodes().map((n) => graph.getNodeAttribute(n, "label").toLowerCase())
    );

    function setSearchQuery(query: string) {
      state.searchQuery = query;

      if (searchInput.value !== query) searchInput.value = query;

      if (query) {
        const lcQuery = query.toLowerCase();
        const suggestions = graph
          .nodes()
          .filter((n) =>
            lowercaseLabels.has(
              graph.getNodeAttribute(n, "label").toLowerCase()
            )
          )
          .map((n) => ({
            id: n,
            label: graph.getNodeAttribute(n, "label") as string
          }))
          .filter(({ label }) => label.toLowerCase().includes(lcQuery));

        /* If we have a single perfect match, then we remove the suggestions, and
           we consider the user has selected a node through the datalist autocomplete: */
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
       2. If there is a query, all non-matching nodes are greyed
       3. If there is a hovered node, all non-neighbor nodes are greyed */

    renderer.setSetting("nodeReducer", (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };

      if (
        state.hoveredNeighbors &&
        !state.hoveredNeighbors.has(node) &&
        state.hoveredNode !== node
      ) {
        res.label = "";
        res.color = themeColors.fadeColor;
      }

      if (state.selectedNode === node) {
        res.highlighted = true;
      } else if (state.suggestions && !state.suggestions.has(node)) {
        res.label = "";
        res.color = themeColors.fadeColor;
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
  }
  handleSearch(graph, renderer, isPanel);

// Nodes drag & click events
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

/* Delta is the distance in pixels that we must move horizontally or vertically between the up and down events 
for the code to classify it as a drag rather than a click. This is because sometimes we will move the mouse or
our finger a few pixels before lifting it.
:) Read more here: https://stackoverflow.com/a/59741870/9691448
*/
const delta : number = 10;  
let startX : number;
let startY : number;
let allowClick : boolean = true;

// Disable the autoscale at the first down interaction
renderer.getMouseCaptor().on("mousedown", (event) => {
  startX = event.original.pageX;
  startY = event.original.pageY;
  if (!renderer.getCustomBBox()) renderer.setCustomBBox(renderer.getBBox());
});

// On mouse up, we reset the autoscaling and the dragging mode
renderer.getMouseCaptor().on("mouseup", (event) => {
  if (draggedNode) {
    graph.removeNodeAttribute(draggedNode, "highlighted");
    const diffX : number = Math.abs(event.original.pageX - startX);
    const diffY : number = Math.abs(event.original.pageY - startY);
    allowClick  = diffX < delta && diffY < delta;
    isDragging = false;
    draggedNode = null;
  }
});

/* On click, we open the corresponding page URL:
   In panel the links will be opened in the current tab, elsewhere in the new tab
*/
if(isPanel) {
  renderer.on("clickNode", ({ node }) => {
    if (!graph.getNodeAttribute(node, "hidden") && allowClick) {
        window.open(graph.getNodeAttribute(node, "pageURL"), "_self");
      }
      });
    }
if (!isPanel) {
  renderer.on("clickNode", ({ node }) => {
      if (!graph.getNodeAttribute(node, "hidden") && allowClick) {
        window.open(graph.getNodeAttribute(node, "pageURL"), "_blank");
        }
      });
  const camera = renderer.getCamera();
  zoomInBtn.addEventListener("click", () => {
    camera.animatedZoom({ duration: 600 });
  });
  zoomOutBtn.addEventListener("click", () => {
    camera.animatedUnzoom({ duration: 600 });
  });
  zoomResetBtn.addEventListener("click", () => {
    camera.animatedReset({ duration: 600 });
  });
  iterationBtn.addEventListener("click", () => {
    startFA2();
  })
  killGraphBtn.addEventListener("click", () => {
    stopFA2();
    renderer.clear();
    renderer.kill();
  })
}
}

export default visualize;