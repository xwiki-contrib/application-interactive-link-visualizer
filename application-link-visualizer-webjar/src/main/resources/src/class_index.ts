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


import Sigma from "sigma";
import { Coordinates, EdgeDisplayData, NodeDisplayData } from "sigma/types";
import Graph from "graphology";

class GraphVisualization {
  private graph: Graph;
  private renderer: Sigma;
  private state: State;

  constructor(data: any) {
    this.graph = new Graph();
    this.graph.import(data);
    this.renderer = new Sigma(this.graph, this.getContainer());

    this.state = {
      hoveredNode: undefined,
      searchQuery: "",
      selectedNode: undefined,
      suggestions: undefined,
      hoveredNeighbors: undefined,
    };

    this.setupSearchInput();
    this.setupGraphInteractions();
    this.refreshRendering();
  }

  private getContainer(): HTMLElement {
    return document.getElementById("sigma-container") as HTMLElement;
  }

  private getSearchInput(): HTMLInputElement {
    return document.getElementById("search-input") as HTMLInputElement;
  }

  private getSuggestionsList(): HTMLDataListElement {
    return document.getElementById("suggestions") as HTMLDataListElement;
  }

  private setupSearchInput() {
    const searchInput = this.getSearchInput();

    searchInput.addEventListener("input", () => {
      this.setSearchQuery(searchInput.value || "");
    });

    searchInput.addEventListener("blur", () => {
      this.setSearchQuery("");
    });

    this.refreshSearchSuggestions();
  }

  private refreshSearchSuggestions() {
    const suggestionsList = this.getSuggestionsList();

    suggestionsList.innerHTML = this.graph
      .nodes()
      .map((node) => `<option value="${this.graph.getNodeAttribute(node, "label")}"></option>`)
      .join("\n");
  }

  private setSearchQuery(query: string) {
    this.state.searchQuery = query;

    const searchInput = this.getSearchInput();
    if (searchInput.value !== query) searchInput.value = query;

    if (query) {
      const lcQuery = query.toLowerCase();
      const suggestions = this.graph
        .nodes()
        .map((n) => ({ id: n, label: this.graph.getNodeAttribute(n, "label") as string }))
        .filter(({ label }) => label.toLowerCase().includes(lcQuery));

      if (suggestions.length === 1 && suggestions[0].label === query) {
        this.state.selectedNode = suggestions[0].id;
        this.state.suggestions = undefined;

        const nodePosition = this.renderer.getNodeDisplayData(this.state.selectedNode) as Coordinates;
        this.renderer.getCamera().animate(nodePosition, {
          duration: 500,
        });
      } else {
        this.state.selectedNode = undefined;
        this.state.suggestions = new Set(suggestions.map(({ id }) => id));
      }
    } else {
      this.state.selectedNode = undefined;
      this.state.suggestions = undefined;
    }

    this.refreshRendering();
  }

  private setupGraphInteractions() {
    this.renderer.on("enterNode", ({ node }) => {
      this.setHoveredNode(node);
    });

    this.renderer.on("leaveNode", () => {
      this.setHoveredNode(undefined);
    });
  }

  private setHoveredNode(node?: string) {
    if (node) {
      this.state.hoveredNode = node;
      this.state.hoveredNeighbors = new Set(this.graph.neighbors(node));
    } else {
      this.state.hoveredNode = undefined;
      this.state.hoveredNeighbors = undefined;
    }

    this.refreshRendering();
  }

  private refreshRendering() {
    this.refreshNodeRendering();
    this.refreshEdgeRendering();
    this.renderer.refresh();
  }

  private refreshNodeRendering() {
    this.renderer.setSetting("nodeReducer", (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };

      if (
        this.state.hoveredNeighbors &&
        !this.state.hoveredNeighbors.has(node) &&
        this.state.hoveredNode !== node
      ) {
        res.label = "";
        res.color = "#f6f6f6";
      }

      if (this.state.selectedNode === node) {
        res.highlighted = true;
      } else if (this.state.suggestions && !this.state.suggestions.has(node)) {
        res.label = "";
        res.color = "#f6f6f6";
      }

      return res;
    });
  }

  private refreshEdgeRendering() {
    this.renderer.setSetting("edgeReducer", (edge, data) => {
      const res: Partial<EdgeDisplayData> = { ...data };

      if (this.state.hoveredNode && !this.graph.hasExtremity(edge, this.state.hoveredNode)) {
        res.hidden = true;
      }

      if (
        this.state.suggestions &&
        (!this.state.suggestions.has(this.graph.source(edge)) ||
          !this.state.suggestions.has(this.graph.target(edge)))
      ) {
        res.hidden = true;
      }

      return res;
    });
  }
}

interface State {
  hoveredNode?: string;
  searchQuery: string;
  selectedNode?: string;
  suggestions?: Set<string>;
  hoveredNeighbors?: Set<string>;
}

export function createGraphVisualization(data: any): GraphVisualization {
  return new GraphVisualization(data);
}

/*
Now to use this:
import { createGraphVisualization } from "./graphVisualization";

const graphData = {}; // Your graph data

const graphVisualization = createGraphVisualization(graphData);

*/