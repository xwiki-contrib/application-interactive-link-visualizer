# Progress report for the Interactive Link Visualizer Application

## Week 1 (29 May - 04 June 2023) ✔

- [X] Created a new space called `Interactive Link Visualizer` for the application in XWiki
- [X] Attented a detailed video meeting with both the mentors
- [X] Researched about Webjars and studied how to integrate it into the application
- [X] Developed a `maven-webpack` module to generate the custom Webjar involving TypeScript files (special thanks to [Manuel Leduc](https://github.com/manuelleduc))!
- [X] Opened issues for creating the Webjars of `sigma.js` ([here](https://github.com/webjars/sigma.js/issues/2)) & `graphology` ([here](https://github.com/webjars/webjars/issues/2005)), they're packaged now!
- [X] Developed a basic API implementation with dummy data to visualize graphs inside XWiki
- [X] Refactored the API code to use the `graph data` from the XWiki JavaScriptExtension (approach is to pass the data object to the constructor of the API class and then export the class and its methods so that the initialization is triggered by the called method inside the JSX)
- [X] Created the [design page](https://design.xwiki.org/xwiki/bin/view/Proposal/InteractiveLinkVisualizerApplication) to cover the technical details of the project

## Week 2 (05 June - 11 June 2023) ✔

- [X] Studied XWiki's Solr API to develop data source
- [X] Studied different layouts of Graphology: `random-layout`, `forceAtlas2-layout` and `circular layout`
- [X] Fixed the issue: We cannot produce the graph unless we have `x` and `y` co-ordinates even if we use any of the pre-defined layouts
- [X] Implemented 4 interactive controls in the API
- [X] Controls include: `zoom-in`, `zoom-out` and `zoom-reset` button and a `label-threshold` slider
- [X] Implemented the `Search in nodes...` feature in the API
- [X] Implemented the `Search suggestions` feature that suggests the available nodes for searching
- [X] Implemented all layouts `random-layout`, `forceAtlas2-layout` and `circular layout` in the API and provided toggle buttons for each of the 3 layouts
  Note: The demo fork of the implemenation is [here](https://codesandbox.io/s/myself-layout-experiment-mxkq36)

## Week 3 (12 June - 18 June 2023) ✔

- [X] Study XWiki's JavaScript API and the relevant methods like `getURL()` to generate page's URL
- [X] Generate required attributes for nodes & edges like wiki page's `URL, size, color` etc.
- [X] Develop the data-source by generating the `data` object from Solr queries
- [X] Solved the data-source issue of having links that does not point to any reference (it could happen due to some reasons eg, if hidden documents are not being shown to the user). This was resulting in generating an edge for which we have no node. This is fixed now.
- [X] Solved the issue of having multiple targets `(links)` for a single source `(reference)` by splitting the edges. Now the data-source is acceptable in the API in the as is form.

## Week 4 (19 June - 25 June 2023) ✔

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

## Week 5 (26 June - 2 July 2023) ✔

- [X] Implemented the method to filter the number of documents we wish to visualize in the wiki (basically to change the value of the `nb` parameter). Now the user has a choice to override the default value to whatever they wish for
- [X] Use a [RequireJS Module UIX](https://www.xwiki.org/xwiki/bin/view/Documentation/DevGuide/ExtensionPoint/RequireJS%20Module%20Config) for the visualisation API to keep the code DRY (don't repeat yourself)
- [X] Create a UIX entry for the application so that it is visible in the application panel of XWiki

## Week 6 (03 July - 9 July 2023) ✔

- [X] Refactored the `Search in nodes...` feature to adapt with the panel. Now the function checks if there is a need to have the feature or not
- [X] Implemented the panel for the application (for visualisation centered around the opened wiki document)
- [X] Implemented styles from XWiki conventions using pre-defined XWiki specific classes
- [X] Removed all hardcoded colors and implemented the colors from XWiki Flamingo application (that handles all themes inside XWiki)
- [X] Implemented a custom `drawHover()` method that overrides existing `drawHover()` method in Sigma.js ([issue reference](https://github.com/jacomyal/sigma.js/issues/1368))

# Midterm Evaluation ✔

## Week 7 (17 July - 23 July 2023) ✔

- [X] Improve application's folder directory structure
- [X] Other minor fixes like panel's width should be generated dynamically, use `jsontool.serialize` to keep the code DRY, external font removed, dependency version fixed, panel `labelContainer` fixed, include more `fl` fields like `wiki, spaces, name` to avoid log errors, added `Displaying` keyword to show that there could be more documents
- [X] Release the first working extension on [XWiki Extension Store](https://extensions.xwiki.org)
- [X] Write the extension documentation and a blog informing about the first release

## Week 8 (24 July - 30 July 2023) ✔

- [X] Implemented a `escapeQueryChars()` function to escape reserved characters in Solr queries
- [X] Improve the panel code efficiency by using multiple Solr queries
- [X] Display an isolated node for currently opened document if there are no linked pages
- [X] Increased arrow head size in the edges by implementing a custom `customEdgeArrowHeadProgram` class ([INTLV-5 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/7ca54c5b117fb30dbec27c65da039cbfa1b4b274))
- [X] Implemented a way to keep the main visualisation and panel settings separate. Now the following settings are different for the main visualisation and the panel:
    - Size of `nodes`, `edges`, `label arrow head` & `graph nodes label`
    - Layout stopping time
    - Label rendered size threshold setting
- [X] Change the mouse cursor to a hand pointer when hovering over a node to give the indication of a link ([INTLV-8 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/ab74b94e762db7c6d4c7172f09f0971c6f434388))

## Week 9 (31 July - 06 August 2023)

- [X] Node size increases & color changes when hovering over it; for better visuals ([INTLV-9 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/0c674e75ae75ba4a2bf5828653df90761eebb21a))
- [X] Create a mathematical formula to stop the graph layout after some time; that depends on `nb` ([INTLV-10 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/8c6806b8c52f2344f5d7759f526d7ca2ce455ef6))
- [X] Implement a drag-detection method to avoid accidental clicks on the node ([INTLV-3 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/1e688d287cabba6848360657e7b0924bb8bf2493))
- [X] Current opened document's node in the panel should have a different color & size
- [X] Integrate the Solr Search Facets integration in the application ([INTLV-13 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/bee8fc3c7a80a0791a29a88d9a79e6a35b60ad4d))
- [X] Make the `Type` Facet field force to show only Documents
- [X] Enable `Tags` type Facet field
- [X] Override query limit to 1000
- [X] Empty search should also display the default graph
- [X] Remove `Highlighting` filter from Solr Facets
- [X] Add a fullscreen button for the visualisation ([INTLV-14 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/2171d0bc9b8f650ef8dec0edd284f9aeb9fb77ff))
- [X] Add zoom-in & zoom-out buttons ([INTLV-15 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/2171d0bc9b8f650ef8dec0edd284f9aeb9fb77ff))
- [X] Listen for both DOM loaded and updated events to start the initialisation
- [X] Fixed Search feature should not work on the panel ([INTLV-18 commit](https://github.com/xwiki-contrib/application-interactive-link-visualizer/commit/f9d7232a5ac614633bd41f09ecd161c782597aa1))
- [X] Add a way to change the number of results to be displayed in the graph
- [X] Add a button to increase the number of iterations in the graph
- [X] Kill and clear the previous graph instance to release memory ([INTLV-20 commit]())

## What is left

- [ ] Translations: implement the `Localization Module` in order to generate key-value pairs that will allow the possibility of translation of the application pages

<!--
## Week 10 (07 August - 13 August 2023)
## Week 11 (14 August - 20 August 2023)
## Week 12 (21 August - 27 August 2023)
# Final Evaluation (28 August - 04 September)
-->
