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

import Graph from "graphology";
import Sigma from "sigma";
import { circular } from "graphology-layout";
import {
  PlainObject,
  Coordinates,
  EdgeDisplayData,
  NodeDisplayData
} from "sigma/types";
import { animateNodes } from "sigma/utils/animate";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import myPersonalData from "./data.json";

class GraphVisualizer {
  private graph: Graph;
  private fa2Layout: FA2Layout | null;
  private cancelCurrentAnimation: (() => void) | null;

  FA2Button = document.getElementById("forceatlas2") as HTMLElement;
  FA2StopLabel = document.getElementById(
    "forceatlas2-stop-label"
  ) as HTMLElement;
  FA2StartLabel = document.getElementById(
    "forceatlas2-start-label"
  ) as HTMLElement;
  randomButton = document.getElementById("random") as HTMLElement;
  circularButton = document.getElementById("circular") as HTMLElement;
  searchInput = document.getElementById("search-input") as HTMLInputElement;
  searchSuggestions = document.getElementById(
    "suggestions"
  ) as HTMLDataListElement;
  zoomInBtn = document.getElementById("zoom-in") as HTMLButtonElement;
  zoomOutBtn = document.getElementById("zoom-out") as HTMLButtonElement;
  zoomResetBtn = document.getElementById("zoom-reset") as HTMLButtonElement;
  labelsThresholdRange = document.getElementById(
    "labels-threshold"
  ) as HTMLInputElement;

  constructor(data: JSON) {
    this.graph = new Graph();
    this.graph.import(data);
    this.fa2Layout = null;
    this.cancelCurrentAnimation = null;

    // Initialize the graph attributes
    const radius = 200;
    const centerX = 300;
    const centerY = 300;
    const angleIncrement = (2 * Math.PI) / this.graph.order;
    const maxPerturbation = 20;
    let i = 0;
    let occupiedAngles = new Set();

    this.graph.forEachNode((node) => {
      let angle = i * angleIncrement;

      while (occupiedAngles.has(angle)) {
        angle += angleIncrement;
      }

      const perturbation =
        Math.random() * maxPerturbation - maxPerturbation / 2;
      const x = centerX + (radius + perturbation) * Math.cos(angle);
      const y = centerY + (radius + perturbation) * Math.sin(angle);

      this.graph.setNodeAttribute(node, "x", x);
      this.graph.setNodeAttribute(node, "y", y);

      occupiedAngles.add(angle);
      i++;
    });

    let j = 0;
    this.graph.forEachNode((node) => {
      this.graph.setNodeAttribute(node, "size", 10);
      j++;
    });

    let k = 0;
    this.graph.forEachEdge((edge) => {
      this.graph.setEdgeAttribute(edge, "size", 4);
      k++;
    });

    const sensibleSettings = forceAtlas2.inferSettings(this.graph);
    this.fa2Layout = new FA2Layout(this.graph, {
      iterations: 5,
      settings: sensibleSettings
    });
  }

  private stopFA2(): void {
    this.fa2Layout.stop();
    this.FA2StartLabel.style.display = "flex";
    this.FA2StopLabel.style.display = "none";
  }

  private startFA2(): void {
    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }

    this.fa2Layout.start();
    this.FA2StartLabel.style.display = "none";
    this.FA2StopLabel.style.display = "flex";
  }

  toggleFA2Layout(): void {
    if (this.fa2Layout.isRunning()) {
      this.stopFA2();
    } else {
      this.startFA2();
    }
  }

  // bind method to the forceatlas2 button

  // this.FA2Button.addEventListener("click", this.toggleFA2Layout.bind(this));

  randomLayout(): void {
    if (this.fa2Layout && this.fa2Layout.isRunning()) {
      this.stopFA2();
    }

    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }

    const xExtents = { min: 0, max: 0 };
    const yExtents = { min: 0, max: 0 };
    this.graph.forEachNode((node, attributes) => {
      xExtents.min = Math.min(attributes.x, xExtents.min);
      xExtents.max = Math.max(attributes.x, xExtents.max);
      yExtents.min = Math.min(attributes.y, yExtents.min);
      yExtents.max = Math.max(attributes.y, yExtents.max);
    });

    const randomPositions: PlainObject<PlainObject<number>> = {};
    this.graph.forEachNode((node) => {
      // create random positions respecting position extents
      randomPositions[node] = {
        x: Math.random() * (xExtents.max - xExtents.min),
        y: Math.random() * (yExtents.max - yExtents.min)
      };
    });
    // use sigma animation to update new positions
    this.cancelCurrentAnimation = animateNodes(this.graph, randomPositions, {
      duration: 2500
    });

    // bind method to the random button
    //this.randomButton.addEventListener("click", randomLayout);
  }

  /** CIRCULAR LAYOUT **/
  circularLayout(): void {
    // stop fa2 if running
    if (this.fa2Layout.isRunning()) this.stopFA2();
    if (this.cancelCurrentAnimation) this.cancelCurrentAnimation();

    //since we want to use animations we need to process positions before applying them through animateNodes
    const circularPositions = circular(this.graph, { scale: 100 });
    //In other context, it's possible to apply the position directly we : circular.assign(graph, {scale:100})
    this.cancelCurrentAnimation = animateNodes(this.graph, circularPositions, {
      duration: 2000,
      easing: "linear"
    });
  }

  // bind method to the random button
  // circularButton.addEventListener("click", circularLayout);

  private createSigmaInstance(container: HTMLElement): Sigma {
    return new Sigma(this.graph, container, {
      minCameraRatio: 0.1,
      maxCameraRatio: 10
    });
  }

  // const renderer = new Sigma(this.graph, container: HTMLElement, {
  //   minCameraRatio: 0.1,
  //   maxCameraRatio: 10
  // });

  private getNodeDisplayData(node: NodeDisplayData): PlainObject {
    const { x, y, size, color } = node;

    return {
      x,
      y,
      size,
      color,
      label: "",
      type: "circle",
      zIndex: 1
    };
  }

  private getEdgeDisplayData(edge: EdgeDisplayData): PlainObject {
    const { size, color, source, target } = edge;

    return {
      size,
      color,
      source,
      target,
      zIndex: 0
    };
  }

  visualize(container: HTMLElement): void {
    this.sigma = this.createSigmaInstance(container);

    const nodes = this.graph.nodes();
    const edges = this.graph.edges();

    const nodeDisplayData = nodes.reduce(
      (data: PlainObject, node: string) => ({
        ...data,
        [node]: this.getNodeDisplayData(this.graph.getNodeAttributes(node))
      }),
      {}
    );

    const edgeDisplayData = edges.reduce(
      (data: PlainObject, edge: string) => ({
        ...data,
        [edge]: this.getEdgeDisplayData(this.graph.getEdgeAttributes(edge))
      }),
      {}
    );

    this.sigma.refresh();
  }

  // -----------------------------------------------------
  // SEARCH FUNCTION
  // Type and declare internal state:
  // interface State {
  //   hoveredNode?: string;
  //   searchQuery: string;
  //   selectedNode?: string;
  //   suggestions?: Set<string>;
  //   hoveredNeighbors?: Set<string>;
  // }

  // private state: State = { searchQuery: "" };

  // // Feed the datalist autocomplete values:
  // this.searchSuggestions.innerHTML = this.graph
  //   .nodes()
  //   .map(
  //     (node) =>
  //       `<option value="${this.graph.getNodeAttribute(
  //         node,
  //         "label"
  //       )}"></option>`
  //   )
  //   .join("\n");

  // // Actions:
  // private setSearchQuery(query: string): void {
  //   this.state.searchQuery = query;

  //   if (searchInput.value !== query) searchInput.value = query;

  //   if (query) {
  //     const lcQuery = query.toLowerCase();
  //     const suggestions = this.graph
  //       .nodes()
  //       .map((n) => ({
  //         id: n,
  //         label: this.graph.getNodeAttribute(n, "label") as string
  //       }))
  //       .filter(({ label }) => label.toLowerCase().includes(lcQuery));

  //     // If we have a single perfect match, then we remove the suggestions, and
  //     // we consider the user has selected a node through the datalist
  //     // autocomplete:
  //     if (suggestions.length === 1 && suggestions[0].label === query) {
  //       this.state.selectedNode = suggestions[0].id;
  //       this.state.suggestions = undefined;

  //       // Move the camera to center it on the selected node:
  //       const nodePosition = this.renderer.getNodeDisplayData(
  //         this.state.selectedNode
  //       ) as Coordinates;
  //       this.renderer.getCamera().animate(nodePosition, {
  //         duration: 2000
  //       });
  //     }
  //     // Else, we display the suggestions list:
  //     else {
  //       this.state.selectedNode = undefined;
  //       this.state.suggestions = new Set(suggestions.map(({ id }) => id));
  //     }
  //   }
  //   // If the query is empty, then we reset the selectedNode / suggestions state:
  //   else {
  //     this.state.selectedNode = undefined;
  //     this.state.suggestions = undefined;
  //   }

  //   // Refresh rendering:
  //   this.renderer.refresh();
  // }
  // private setHoveredNode(node?: string): void {
  //   if (node) {
  //     this.state.hoveredNode = node;
  //     this.state.hoveredNeighbors = new Set(this.graph.neighbors(node));
  //   } else {
  //     this.state.hoveredNode = undefined;
  //     this.state.hoveredNeighbors = undefined;
  //   }

  //   // Refresh rendering:
  //   this.renderer.refresh();
  // }

  // // Bind search input interactions:
  // searchInput.addEventListener("input", () => {
  //   setSearchQuery(searchInput.value || "");
  // });
  // searchInput.addEventListener("blur", () => {
  //   setSearchQuery("");
  // });

  // // Bind graph interactions:
  // this.renderer.on("enterNode", ({ node }) => {
  //   this.setHoveredNode(node);
  // });
  // this.renderer.on("leaveNode", () => {
  //   this.setHoveredNode(undefined);
  // });

  // // Render nodes accordingly to the internal state:
  // // 1. If a node is selected, it is highlighted
  // // 2. If there is query, all non-matching nodes are greyed
  // // 3. If there is a hovered node, all non-neighbor nodes are greyed
  // this.renderer.setSetting("nodeReducer", (node, data) => {
  //   const res: Partial<NodeDisplayData> = { ...data };

  //   if (
  //     this.state.hoveredNeighbors &&
  //     !this.state.hoveredNeighbors.has(node) &&
  //     this.state.hoveredNode !== node
  //   ) {
  //     res.label = "";
  //     res.color = "#f6f6f6";
  //   }

  //   if (this.state.selectedNode === node) {
  //     res.highlighted = true;
  //   } else if (this.state.suggestions && !this.state.suggestions.has(node)) {
  //     res.label = "";
  //     res.color = "#f6f6f6";
  //   }

  //   return res;
  // });

  // // Render edges accordingly to the internal state:
  // // 1. If a node is hovered, the edge is hidden if it is not connected to the
  // //    node
  // // 2. If there is a query, the edge is only visible if it connects two
  // //    suggestions
  // this.renderer.setSetting("edgeReducer", (edge, data) => {
  //   const res: Partial<EdgeDisplayData> = { ...data };

  //   if (this.state.hoveredNode && !this.graph.hasExtremity(edge, this.state.hoveredNode)) {
  //     res.hidden = true;
  //   }

  //   if (
  //     this.state.suggestions &&
  //     (!this.state.suggestions.has(this.graph.source(edge)) ||
  //       !this.state.suggestions.has(this.graph.target(edge)))
  //   ) {
  //     res.hidden = true;
  //   }

  //   return res;
  // });
}

export default GraphVisualizer;
const container: HTMLElement = document.getElementById("sigma-container");
const graphVisualizer = new GraphVisualizer(myPersonalData);
graphVisualizer.visualize(container);
