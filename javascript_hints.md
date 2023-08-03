# JavaScript and GEE hints

If you have never used JavaScript before, GEE code can look a bit alien. Here is a quick guide on what's going on:

1. To set a variable of any type (point, image collection, chart) simply type *var* followed by your command
   e.g. to create *dataset* of Landsat-8 Top of Atmosphere images:
   var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')

   e.g. to set a geometry that is a rectangle in lat lon coordinates that covers Iran
   var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88])

2. GEE is composed of objects and methods.
   Objects are data types e.g. raster images, numbers, strings
   Each object belongs to a class.
   Each class has a set of functions available to it.

   This panel on the left hand side of this website (https://developers.google.com/earth-engine/apidocs/ee-date-advance#examples)
   shows you the available objects (e.g. ee.Array)
   and what functions can be applied to them (e.g. ee.Array.argmax)
   ![image](https://github.com/eejap/GEE_iran/assets/93524485/a49a471b-c127-462d-884d-c8d571432190)
