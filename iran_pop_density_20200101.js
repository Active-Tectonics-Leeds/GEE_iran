var geometry = ee.Geometry.Rectangle([43.83,25.12,63.58,39.88]);

var dataset = ee.ImageCollection('CIESIN/GPWv411/GPW_Population_Density')
             .filterDate('2020-01-01')
             .filterBounds(geometry);

var raster = dataset.select('population_density');
var image = dataset.first(); // Get the first image from the collection

var raster_vis = {
  'max': 1000.0,
  'palette': [
    'ffffe7',
    'FFc869',
    'ffac1d',
    'e17735',
    'f2552c',
    '9f0c21'
  ],
  'min': 200.0
};
Map.setCenter(51.28, 35.67, 5);
Map.addLayer(image, raster_vis, 'population_density');

// export as geotif for gis
Export.image.toDrive({
  image: image,
  description: '20200101_iran_GPWv411_pop_density',
  region: geometry,
});
