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

- [X] Studied XWiki's Solr API to develop data source (WIP)
- [X] Studied different layouts of Graphology: `random-layout`, `forceAtlas2-layout` and `circular layout`
- [X] Fixed the issue: We cannot produce the graph unless we have `x` and `y` co-ordinates even if we use any of the pre-defined layouts
- [X] Implemented 4 interactive controls in the API
- [X] Controls include: `zoom-in`, `zoom-out` and `zoom-reset` button and a `label-threshold` slider
- [X] Implemented the `Search in nodes...` feature in the API
- [X] Implemented the `Search suggestions` feature that suggests the available nodes for searching
- [X] Implemented all layouts `random-layout`, `forceAtlas2-layout` and `circular layout` in the API and provided toggle buttons for each of the 3 layouts
  Note: The demo fork of the implemenation is [here](https://codesandbox.io/s/layout-experiment-vq1xec)

## Tasks for coming days...

- [ ] Develop the data-source by generating the `data` object from Solr queries
- [ ] Study XWiki's JavaScript API and the relevant methods like `getURL()` to generate page's URL
- [ ] Generate required attributes for nodes & edges like wiki page's `URL, size, color` etc.
- [ ] Study about the `Localization Module` in order to generate key-value pairs that will allow the possibility of translation of the application pages
- [ ] Study and implement macro for the application (take inspiration from XWiki's ChartJS application)


## Remaining major tasks of the project (what is left) (subject to change)

- [ ] Research on testing JS framework & write tests for the application (potential choice: [Jasmine](https://jasmine.github.io/))
- [ ] Translations for the application
- [ ] Provide a way to filter the number of documents in a wiki we wish to visualize
- [ ] Publish the extension the XWiki Extension Store and write documentations & demo around the extension

<!-- ## Week 3 (12 June - 18 June 2023)

- [X] 

 ## Week 4 (19 June - 25 June 2023)

- [X]

## Week 5 (26 June - 2 July 2023)

- [X] 

## Week 6 (3 July - 9 July 2023)

- [X]

-->
