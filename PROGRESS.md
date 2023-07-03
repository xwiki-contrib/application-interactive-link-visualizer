# Progress report for the Interactive Link Visualizer Application

## Week 1 (29 May - 04 June 2023)

- [X] Created a new space called `LinkVisualizer` for the application in XWiki
- [X] Attented a detailed video meeting with both the mentors
- [X] Researched about Webjars and studied how to integrate it into the application
- [X] Developed a `maven-webpack` module to generate the custom Webjar involving TypeScript files (special thanks to [Manuel Leduc](https://github.com/manuelleduc))!
- [X] Opened issues for creating the Webjars of `sigma.js` ([here](https://github.com/webjars/sigma.js/issues/2)) & `graphology` ([here](https://github.com/webjars/webjars/issues/2005)), they're packaged now!
- [X] Developed a basic API implementation with dummy data to visualize graphs inside XWiki
- [X] Refactored the API code to use the `graph data` from the XWiki JavaScriptExtension (approach is to pass the data object to the constructor of the API class and then export the class and its methods so that the initialization is triggered by the called method inside the JSX)
- [X] Created the [design page](https://design.xwiki.org/xwiki/bin/view/Proposal/InteractiveLinkVisualizerApplication) to cover the technical details of the project

## Week 2 (05 June - 11 June 2023)

- [X] Studied XWiki's Solr API to develop data source
- [X] Studied different layouts of Graphology: `random-layout`, `forceAtlas2-layout` and `circular layout`
- [X] Fixed the issue: We cannot produce the graph unless we have `x` and `y` co-ordinates even if we use any of the pre-defined layouts
- [X] Implemented 4 interactive controls in the API
- [X] Controls include: `zoom-in`, `zoom-out` and `zoom-reset` button and a `label-threshold` slider
- [X] Implemented the `Search in nodes...` feature in the API
- [X] Implemented the `Search suggestions` feature that suggests the available nodes for searching
- [X] Implemented all layouts `random-layout`, `forceAtlas2-layout` and `circular layout` in the API and provided toggle buttons for each of the 3 layouts
  Note: The demo fork of the implemenation is [here](https://codesandbox.io/s/myself-layout-experiment-mxkq36)

## Week 3 (12 June - 18 June 2023)

- [X] Study XWiki's JavaScript API and the relevant methods like `getURL()` to generate page's URL
- [X] Generate required attributes for nodes & edges like wiki page's `URL, size, color` etc.
- [X] Develop the data-source by generating the `data` object from Solr queries
- [X] Solved the data-source issue of having links that does not point to any reference (it could happen due to some reasons eg, if hidden documents are not being shown to the user). This was resulting in generating an edge for which we have no node. This is fixed now.
- [X] Solved the issue of having multiple targets `(links)` for a single source `(reference)` by splitting the edges. Now the data-source is acceptable in the API in the as is form.

## Week 4 (19 June - 25 June 2023)

- [X] Implemented the functionality to make the graph nodes draggable.
- [X] Solved the issue of stopping the `FA2Layout` after some time to save the resources (CPU & Memory)
- [X] Implemented the node click handle event. On clicking the node will open it's page URL from now on
- [X] CI and Sonar Integration done (special thanks to [Manuel Leduc](https://github.com/manuelleduc))!
- [X] Created the `<option></option>` element using DOM API for better security and to avoid potential XSS ([commit link](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/d416e98a0e51b152091493dada1030f8666d7015))
- [X] Made a set to store lowercase labels in `search in nodes...` feature to improve time complexity from O(n) to O(1) ([commit link](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/6271729942b7a491c0c77c0cecfe363e10f9a13d))
- [X] Optimized the method to generate graph nodes ([commit link](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/11c1a0c5c1c0ec40dac08819db0bdb9ea5d61826))
- [X] Variables fixed like usage of `const` instead of `var`, removing unused variables etc. ([commit link](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/aa91ce5988c9312a5a5b973aa112bf6892420094))
- [X] Other code improvements ([commits link](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commits/main))
- [X] Added arrow styled edges instead of plain line. Now the links actually points to the nodes. Also added other optimal renderer settings
- [X] Changed the name of output API JS file from `bundle.js` to something more particular

## Week 5 (26 June - 2 July 2023)

- [X] Implemented the method to filter the number of documents we wish to visualize in the wiki (basically to change the value of the `nb` parameter). Now the user have to enter the desired value in the field and then only the graph will be visualized
- [X] Use a [RequireJS Module UIX](https://www.xwiki.org/xwiki/bin/view/Documentation/DevGuide/ExtensionPoint/RequireJS%20Module%20Config) for the visualisation API to keep the code DRY (don't repeat yourself)
- [X] Create a UIX entry for the application so that it is visible in the application panel of XWiki

## Week 6 (3 July - 9 July 2023)

# Midterm Evaluation (10 July - 14 July 2023)

<!--
# Final Evaluation (28 August - 04 September)
-->

## Upcoming tasks

- [ ] Implement the panel for visualisation only around the opened wiki page

## What is left

- [ ] Research on testing JS framework & write tests for the application (potential choice: [Jasmine](https://jasmine.github.io/))
- [ ] Use color variables from inside of XWiki instead of hardcoding the color values
- [ ] Use proper CSS and button styles from XWiki
- [ ] Study about the `Localization Module` in order to generate key-value pairs that will allow the possibility of translation of the application pages
- [ ] Publish the extension the XWiki Extension Store and write documentations & demo around the extension
