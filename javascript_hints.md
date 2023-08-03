# JavaScript and GEE hints

If you have never used JavaScript before, GEE code can look a bit alien. Here is a quick guide on what's going on:

1. To set a variable of any type (point, image collection, chart) simply type *var* followed by your command
   
   e.g. to create *dataset* of Landsat-8 Top of Atmosphere images:
   var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')

   e.g. to set a geometry that is a rectangle in lat lon coordinates that covers Iran
   var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88])

3. GEE is composed of objects and methods.
   Objects are data types e.g. raster images, numbers, strings
   Each object belongs to a class.
   Each class has a set of functions available to it.

   This panel on the left hand side of this website (https://developers.google.com/earth-engine/apidocs/ee-date-advance#examples)
   shows you the available objects (e.g. ee.Array)
   and what functions can be applied to them (e.g. ee.Array.argmax)
   ![image](https://github.com/eejap/GEE_iran/assets/93524485/f1e15bc1-1b2d-4457-98e6-d78dcc5902bd)

4. To control what is seen on the Map below the code editor, call *Map* object:
   
   e.g. to centre the map on your variable *geometry* with zoom level 5:
   Map.centerObject(geometry, 5)

   e.g. to add a layer that you have created called *trueColor432* to your map with visualisation settings *trueColor432Vis*:
   Map.addLayer(trueColor432, trueColor432Vis, 'True Color (432)')

6. To create a function to apply to one or a collection of images, use *function*:
   
   e.g. create a function addNDVI to calculate Normalised Vegetation Difference Index from image bands 4 and 5

   function addNDVI(image) { \
     var ndvi = image.normalizedDifference(['B5', 'B4']); \
     return image.addBands(ndvi); \
   }
