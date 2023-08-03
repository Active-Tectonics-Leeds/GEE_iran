// Script calculating the amplitude and phase of NDVI as calculated from Landsat-8 imagery.
// Adapted from https://developers.google.com/earth-engine/tutorials/community/time-series-modeling

var geometry = ee.Geometry.Rectangle([43.83,24.7,63.58,39.88]);
var landsat8Sr = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
  
var roi = ee.Geometry.Point([51.070,35.647]); // western tehran plain

// Function to cloud mask from the pixel_qa band of Landsat 8 SR data.
var maskL8sr = function(image) {
  // Bit 0 - Fill
  // Bit 1 - Dilated Cloud
  // Bit 2 - Cirrus
  // Bit 3 - Cloud
  // Bit 4 - Cloud Shadow
  var qaMask = image.select('QA_PIXEL').bitwiseAnd(parseInt('11111', 2)).eq(0);
  var saturationMask = image.select('QA_RADSAT').eq(0);

  // Apply the scaling factors to the appropriate bands.
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);

  // Replace the original bands with the scaled ones and apply the masks.
  return image.addBands(opticalBands, null, true)
    .addBands(thermalBands, null, true)
    .updateMask(qaMask)
    .updateMask(saturationMask);
};

// Function to add NDVI, time, and constant variables to Landsat 8 imagery.
var addVariables = function(image) {
  // Compute time in fractional years since the epoch.
  var date = image.date();
  var years = date.difference(ee.Date('1970-01-01'), 'year');
  // Return the image with the added bands.
  return image
  // Add an NDVI band.
  .addBands(image.normalizedDifference(['SR_B5', 'SR_B4']).rename('NDVI'))
  // Add a time band.
  .addBands(ee.Image(years).rename('t')).float()
  // Add a constant band.
  .addBands(ee.Image.constant(1));
};
// Remove clouds, add variables and filter to the area of interest.
var filteredLandsat = landsat8Sr
  .filterBounds(roi)
  .filterDate('2014', '2022')
  .map(maskL8sr)
  .map(addVariables);
  
// Create a mosaic of the NDVI values from the Image Collection
var ndviMosaic = filteredLandsat.select('NDVI').mosaic();
  
// Plot a time series of NDVI at a single location.
Map.centerObject(roi, 11);
Map.addLayer(filteredLandsat,
  {bands: 'NDVI', min: 0.1, max: 0.9, palette: ['white', 'green']},
  'NDVI Mosaic');
Map.addLayer(roi, {color: 'yellow'}, 'ROI');
var l8Chart = ui.Chart.image.series(filteredLandsat.select('NDVI'), roi)
  .setChartType('ScatterChart')
  .setOptions({
   title: 'Landsat 8 NDVI Time Series at ROI',
   trendlines: {
     0: {color: 'CC0000'}
   },
   lineWidth: 1,
   pointSize: 3,
  });
print(l8Chart);

// List of the independent variable names.
var independents = ee.List(['constant', 't']);
// Name of the dependent variable.
var dependent = ee.String('NDVI');
// Compute a linear trend. This will have two bands: 'residuals' and
// a 2x1 band called 'coefficients' (columns are for dependent variables).
var trend = filteredLandsat.select(independents.add(dependent))
  .reduce(ee.Reducer.linearRegression(independents.length(), 1));
Map.addLayer(trend, {}, 'Trend Array Image');
// Flatten the coefficients into a 2-band image.
var coefficients = trend.select('coefficients')
  .arrayProject([0])
  .arrayFlatten([independents]);
  
// Compute a detrended series.
var detrended = filteredLandsat.map(function(image) {
  return image.select(dependent).subtract(
    image.select(independents).multiply(coefficients).reduce('sum'))
    .rename(dependent)
    .copyProperties(image, ['system:time_start']);
});

var detrendedChart = ui.Chart.image.series(detrended, roi, null, 30)
  .setOptions({
    title: 'Detrended Landsat Time Series at ROI',
    lineWidth: 1,
    pointSize: 3,
  });
print(detrendedChart);

// Use these independent variables in the harmonic regression.
var harmonicIndependents = ee.List(['constant', 't', 'cos', 'sin']);
// Add harmonic terms as new image bands.
var harmonicLandsat = filteredLandsat.map(function(image) {
  var timeRadians = image.select('t').multiply(2 * Math.PI);
    return image
      .addBands(timeRadians.cos().rename('cos'))
      .addBands(timeRadians.sin().rename('sin'));
  });
  
var harmonicTrend = harmonicLandsat
  .select(harmonicIndependents.add(dependent))
  // The output of this reducer is a 4x1 array image.
  .reduce(ee.Reducer.linearRegression({
   numX: harmonicIndependents.length(),
   numY: 1
  }));
  
// Turn the array image into a multi-band image of coefficients.
var harmonicTrendCoefficients = harmonicTrend.select('coefficients')
  .arrayProject([0])
  .arrayFlatten([harmonicIndependents]);
// Compute fitted values.
var fittedHarmonic = harmonicLandsat.map(function(image) {
  return image.addBands(
    image.select(harmonicIndependents)
      .multiply(harmonicTrendCoefficients)
      .reduce('sum')
      .rename('fitted'));
});
// Plot the fitted model and the original data at the ROI.
print(ui.Chart.image.series(fittedHarmonic.select(['fitted', 'NDVI']), roi,
      ee.Reducer.mean(), 30)
  .setSeriesNames(['NDVI', 'fitted'])
  .setOptions({
    title: 'Harmonic Model: Original and Fitted Values',
    lineWidth: 1,
    pointSize: 3
  })
);

// Compute phase and amplitude.
var phase = harmonicTrendCoefficients.select('sin')
  .atan2(harmonicTrendCoefficients.select('cos'))
  // Scale to [0, 1] from radians.
  .unitScale(-Math.PI, Math.PI);
var amplitude = harmonicTrendCoefficients.select('sin')
  .hypot(harmonicTrendCoefficients.select('cos'))
  // Add a scale factor for visualization.
  .multiply(5);
// Compute the mean NDVI.
var meanNdvi = filteredLandsat.select('NDVI').mean();
// Use the HSV to RGB transformation to display phase and amplitude.
var rgb = ee.Image.cat([phase, amplitude, meanNdvi]).hsvToRgb();
Map.addLayer(rgb, {}, 'Phase (hue), Amplitude (sat), NDVI (val)');

// Add the amplitude layer to the map for visualization
Map.addLayer(amplitude, {min: 0, max: 1, palette: ['blue', 'white', 'green']}, 'Amplitude');

Export.image.toDrive({
  image: amplitude.clip(geometry), // clip the NDVI layer to geometry before export
  description: '20141001_20221231_ls8_t1l2_ndvi_amplitude_500', // pick a suitable name
  region: geometry,
  scale: 500, // pixel width to export the image. Landsat-8 multispectral resolution is 30 m
  //so here we downsample the layer to match the InSAR data (500m)
  maxPixels: 4e10 // max number of pixels allowed in the exported image to limit size of exported image
});
Export.image.toDrive({
  image: ndviMosaic.clip(geometry), // clip the NDVI layer to geometry before export
  description: '20141001_20221231_ls8_t1l2_ndvi_500', // pick a suitable name
  region: geometry,
  scale: 500, // pixel width to export the image. Landsat-8 multispectral resolution is 30 m
  //so here we downsample the layer to match the InSAR data (500m)
  maxPixels: 4e10 // max number of pixels allowed in the exported image to limit size of exported image
});
