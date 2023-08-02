// Define a polygon of interest (Iran)
var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88]);

// Make an Image Collection of Landsat-8 images
// Here we choose TOA or Top of Atmosphere imagery
// There are several advantages to using TOA imagery e.g. improved comparability between sensors,
// atmospheric corrections are applied, enhanced radiometric consistency.
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2022-07-01', '2022-08-31') // Filter collection by date (here Sentinel-1A launch-end 2022)
  .filterBounds(geometry) // Filter collection by Iran geometry
  .filterMetadata('CLOUD_COVER','less_than',10) // Keep only images with cloud cover <10% to improve NDVI estimation
var trueColor432 = dataset.select(['B4', 'B3', 'B2']);  // 'TrueColor432', i.e. only bands 4,3,2 to plot the images in True Colour (RGB)
var trueColor432Vis = {
  min: 0.0,
  max: 0.4,
};
Map.centerObject(geometry, 5); // Centre map at the centre of Iran geometry, zoom 5 (play with zoom to change view)
Map.addLayer(trueColor432, trueColor432Vis, 'True Color (432)'); // plot true colour TOA Landsat-8 images 2014-2022 for Iran with <10% cloud

// Reduce the ImageCollection into a mosaic image
var image = dataset.median(); // find the median value at each pixel across all images in the now filtered collection
print(image, 'ls8 mosaic'); // this commands prints the mosaic in the Console on the right

// Calculate NDVI (Normalized Difference Vegetation Index) 
// NDVI = (NIR-Red)/(NIR+Red). Band 5 (B5) is images NIR band, Band 4 is red.
var ndvi = image.normalizedDifference(['B5', 'B4']);
Map.addLayer(ndvi, {min:0, max:1, palette:['000000','00ff00']}, 'NDVI'); // add NDVI layer to the map with green-black pallete, call the layer NDVI

// You can also do the same calculation in other ways
var ndvi1 = image.expression('(NIR-RED)/(NIR+RED)', {'NIR':image.select('B5'), 'RED': image.select('B4')});
Map.addLayer(ndvi1, {min:0, max:1, palette:['000000','00ff00']}, 'NDVI (expression)', false);

// export as geotif for gis. Layer will appear in Task panel to right. Run this layer to export to your Google Drive.
// Ensure to choose a suitable CRS when exporting this layer e.g. EPSG:4326.
Export.image.toDrive({
  image: ndvi.clip(geometry), // clip the NDVI layer to geometry before export
  description: '20220701_20220831_ls8_ndvi_500', // pick a suitable name
  region: geometry,
  scale: 500, // pixel width to export the image. Landsat-8 multispectral resolution is 30 m
  //so here we downsample the layer to match the InSAR data (500m)
  maxPixels: 4e10 // max number of pixels allowed in the exported image to limit size of exported image
});
