// Script to pull and visualise the Iran Land Cover map published by K.N. Toosi University of Technology LiDAR Lab

var dataset = ee.Image('KNTU/LiDARLab/IranLandCover/V1');

var visualization = {
  bands: ['classification']
};

Map.setCenter(54.0, 33.0, 5);

Map.addLayer(dataset, visualization, 'Classification');

// export as geotif for gis
Export.image.toDrive({
  image: dataset,
  description: '20170101_iran_land_cover_map_13_class',
});
