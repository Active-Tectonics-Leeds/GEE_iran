// Construct a collection of corresponding Dynamic World and Sentinel-2 for
// inspection. Filter the DW and S2 collections by region and date.
// from tutorials/GEE DW homepage

// select date range and region of interest (Iran)
var START = ee.Date('2022-01-01');
var END = ee.Date('2022-01-31');
var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88]);

// create image collection of Sentinel-2 images within the desired dates and region
var s2Col = ee.ImageCollection('COPERNICUS/S2')
             .filterDate(START, END)
             .filterBounds(geometry);

// create image collection of Dynamic World images within the desired dates and region
var dwCol = ee.ImageCollection('GOOGLE/DYNAMICWORLD/V1')
             .filterDate(START, END)
             .filterBounds(geometry);

// set the desired projection and resolution (m)
var projection = ee.Projection('EPSG:4326').atScale(500)
             
// Create a mode composite i.e. for each pixel in the region, select the mode Dynamic World class
// from dwCol i.e. the Dynamic World image collection
var classification = dwCol.select('label');
var dwComposite = classification.reduce(ee.Reducer.mode());
var dwComposite = dwComposite.setDefaultProjection(projection) // apply the projection

// set the visualisation parameters for plotting
// Here set min value to plot to 0, max 8, and assign 9 colours to the palette.
var dwVisParams = {
  min: 0,
  max: 8,
  palette: [
    '#419BDF', '#397D49', '#88B053', '#7A87C6', '#E49635', '#DFC35A',
    '#C4281B', '#A59B8F', '#B39FE1'
  ]
};

// Clip the composite and add it to the Map.
Map.addLayer(dwComposite.clip(geometry), dwVisParams, 'Classified Composite');

// export as geotif for gis
Export.image.toDrive({
  image: dwComposite.clip(geometry), // clip layer to geometry
  description: '20220101_20220131_dw_composite_raw_500m',
  region: geometry,
  scale: 500, // Pixel width at which to export the layer. Sentinel-2 multispectral resolution is 30 m
  // so here we downsample the layer to match the InSAR data (500m)
  maxPixels: 4e10 // max number of pixels allowed in the exported image to limit size of exported image
});
