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

  constructor(data: any) {
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
    if (this.fa2Layout) {
      this.fa2Layout.stop();
    }
  }

  private startFA2(): void {
    if (this.cancelCurrentAnimation) {
      this.cancelCurrentAnimation();
    }

    if (this.fa2Layout) {
      this.fa2Layout.start();
    }
  }

  toggleFA2Layout(): void {
    if (this.fa2Layout) {
      if (this.fa2Layout.isRunning()) {
        this.stopFA2();
      } else {
        this.startFA2();
      }
    }
  }

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

    const currentCenterX = (xExtents.min + xExtents.max) / 2;
    const currentCenterY = (yExtents.min + yExtents.max) / 2;

    const radius = Math.max(
      Math.abs(xExtents.max - currentCenterX),
      Math.abs(xExtents.min - currentCenterX),
      Math.abs(yExtents.max - currentCenterY),
      Math.abs(yExtents.min - currentCenterY)
    );

    const maxPerturbation = radius / 10;

    this.graph.forEachNode((node) => {
      const perturbationX =
        Math.random() * maxPerturbation * 2 - maxPerturbation;
      const perturbationY =
        Math.random() * maxPerturbation * 2 - maxPerturbation;

      const x = currentCenterX + perturbationX;
      const y = currentCenterY + perturbationY;

      this.graph.setNodeAttribute(node, "x", x);
      this.graph.setNodeAttribute(node, "y", y);
    });

    const settings = forceAtlas2.inferSettings(this.graph);
    this.fa2Layout = new FA2Layout(this.graph, {
      iterations: 5,
      settings
    });

    this.startFA2();
  }

  animateNode(nodeId: string, targetCoordinates: Coordinates): Promise<void> {
    return new Promise((resolve) => {
      if (this.fa2Layout && this.fa2Layout.isRunning()) {
        this.stopFA2();
      }

      if (this.cancelCurrentAnimation) {
        this.cancelCurrentAnimation();
      }

      const duration = 500;
      const easing = "quadraticInOut";

      const startCoordinates = this.graph.getNodeAttributes(nodeId);

      this.cancelCurrentAnimation = animateNodes(
        this.graph,
        [{ key: nodeId, target: targetCoordinates }],
        {
          easing,
          duration,
          onComplete: () => {
            this.cancelCurrentAnimation = null;
            resolve();
          },
          renderFrame: () => {
            this.sigma.refresh();
          }
        }
      );
    });
  }

  private createSigmaInstance(container: HTMLElement): Sigma {
    return new Sigma(this.graph, container, {
      minCameraRatio: 0.1,
      maxCameraRatio: 10
    });
  }

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
}

export default GraphVisualizer;
const container = document.getElementById("sigma-container");
const graphVisualizer = new GraphVisualizer(myPersonalData);
graphVisualizer.visualize(container);
