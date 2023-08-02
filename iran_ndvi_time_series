// Define a polygon of interest (Iran)
var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88]);

// Define several points of interest (vegetated areas within subsidence regions)
var rafsanjan_point = ee.Geometry.Point([55.73860525156263,30.48110766636398])
var wtp_point = ee.Geometry.Point([51.070,35.647]) // Western Tehran Plain
var mash_point = ee.Geometry.Point([59.2199, 36.5959]) //Mashhad
var bardsir_point = ee.Geometry.Point([56.5459, 30.774])


// Make an Image Collection of Landsat-8 images
// Here we choose TOA or Top of Atmosphere imagery
var dataset = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA')
  .filterDate('2014-10-01', '2022-12-31') // Filter collection by date (here Sentinel-1 start-end 2022)
  .filterBounds(geometry) // Filter collection by Iran geometry
  .filterMetadata('CLOUD_COVER','less_than',10) // Keep only images with cloud cover <10% to improve NDVI estimation
var trueColor432 = dataset.select(['B4', 'B3', 'B2']); // 'TrueColor432, i.e. only bands 4,3,2 to plot the images in True Colour (RGB)
var trueColor432Vis = {
  min: 0.0,
  max: 0.4,
};
Map.centerObject(geometry, 5); // Centre map at the centre of Iran geometry, zoom 5 (play with zoom to change view)
Map.addLayer(trueColor432, trueColor432Vis, 'True Color (432)'); // plot true colour TOA Landsat-8 images 2014-2022 for Iran with <10% cloud

// Reduce the ImageCollection into a mosaic image i.e. 
var image = dataset.median(); // find the median value at each pixel across all images in the now filtered collection
print(image, 'ls8 mosaic'); // this commands prints the mosaic in the Console on the right

// NDVI function. Function takes images in a collection and calculates the normalise diff of bands 5 and 4
// Reminder, NDVI = (NIR-Red)/(NIR+Red). B5 = NIR, B4 = Red
function addNDVI(image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']);
  return image.addBands(ndvi);
}
                      
// Map this new "function" over our filtered image collection
var ls8_ndvi = dataset.map(addNDVI);
// Create a layer of pixel-wise median NDVI across Iran, plotted as RGB false-composite
// Water bodies plot as blue and highly vegetated regions green
Map.addLayer(ls8_ndvi.median(), {min:0, max:1, bands:['B6', 'B5', 'B4']}, 'Landsat 8 RGB median');
Map.centerObject(geometry, 5);

//------------------------------------------------------------------------------------------------------------------------
// Create several time-series charts of NDVI based on Landsat 8 images in our image collection
var chart_rafsanjan = ui.Chart.image.series(ls8_ndvi.select('nd'), rafsanjan_point)
            .setOptions({title: 'Rafsanjan NDVI time-series',
                         hAxis: {title: 'time'},
                         vAxis: {title: 'NDVI', ticks:[0, 0.2]}
            });
print(chart_rafsanjan);

var chart_wtp = ui.Chart.image.series(ls8_ndvi.select('nd'), wtp_point)
            .setOptions({title: 'Western Tehran Plain NDVI time-series',
                         hAxis: {title: 'time'},
                         vAxis: {title: 'NDVI', ticks:[0, 0.2, 0.4, 0.6]}
            });
print(chart_wtp);

var chart_mash = ui.Chart.image.series(ls8_ndvi.select('nd'), mash_point)
            .setOptions({title: 'Mashhad NDVI time-series',
                         hAxis: {title: 'time'},
                         vAxis: {title: 'NDVI', ticks:[0, 0.2, 0.4, 0.6, 0.8]}
            });
print(chart_mash);

var chart_bardsir = ui.Chart.image.series(ls8_ndvi.select('nd'), bardsir_point)
            .setOptions({title: 'Bardsir NDVI time-series',
                         hAxis: {title: 'time'},
                         vAxis: {title: 'NDVI', ticks:[0, 0.2, 0.4]}
            });
print(chart_bardsir);

// Charts should be plotted in the Console to the right
