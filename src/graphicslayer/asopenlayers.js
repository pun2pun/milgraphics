function asOpenLayers(crs) {
  crs = crs || "EPSG:3857";
  //var ua = window.navigator.userAgent;
  //var isIE = ( ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0 || ua.indexOf('Edge/')  > 0) ? true : false;
  var ratio = window.devicePixelRatio || 1;
  var geoJSON = new ol.format.GeoJSON();
  var features = [];

  for (var i = 0; i < this.data.features.length; i++) {
    var feature = this.data.features[i];
    var olFeature = geoJSON.readFeature(feature, {
      featureProjection: ol.proj.get(crs)
    });

    if (
      olFeature.getGeometry() &&
      olFeature.getGeometry().getType() == "Point"
    ) {
      var properties = olFeature.getMetadata();
      if (properties.sidc.charAt(0) != "X") {
        //TODO handle sitaware custom graphics
        var milsymbol = this.data.features[i].symbol;
        //var image = isIE ? mysymbol.asCanvas() : mysymbol.toDataURL();
        olFeature.setStyle(
          new ol.style.Style({
            image: new ol.style.Icon({
              scale: 1 / ratio,
              anchor: [
                milsymbol.getAnchor().x * ratio,
                milsymbol.getAnchor().y * ratio
              ],
              anchorXUnits: "pixels",
              anchorYUnits: "pixels",
              imgSize: [
                Math.floor(milsymbol.getSize().width * ratio),
                Math.floor(milsymbol.getSize().height * ratio)
              ],
              img: milsymbol.asCanvas(ratio)
            })
          })
        );
      }
    }

    if (
      feature.graphic.isConverted() &&
      (olFeature.getGeometry().getType() == "LineString" ||
        olFeature.getGeometry().getType() == "MultiLineString")
    ) {
      var styles = [
        new ol.style.Style({
          stroke: new ol.style.Stroke({
            lineCap: "butt",
            color: "#000000",
            width: 2
          })
        })
      ];
      if (feature.graphic.annotations) {
        var labelgeom = geoJSON
          .readFeature(feature.graphic.annotations[0].geometry, {
            featureProjection: ol.proj.get(crs)
          })
          .getGeometry();
        styles.push(
          new ol.style.Style({
            text: new ol.style.Text({
              fill: new ol.style.Fill({ color: "black" }),
              font: "bold 16px sans-serif",
              stroke: new ol.style.Stroke({
                color: "rgb(239, 239, 239)", // off-white
                width: 4
              }),
              text: feature.graphic.annotations[0].properties.text
            }),
            geometry: labelgeom
          })
        );
      }
      olFeature.setStyle(styles);
    }

    if (
      feature.graphic.isConverted() &&
      olFeature.getGeometry().getType() == "Polygon"
    ) {
      style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          lineCap: "butt",
          color: "#000000",
          width: 2
        }),
        fill: new ol.style.Fill({ color: "rgba(0,0,0,0)" }),
        text: new ol.style.Text({
          fill: new ol.style.Fill({ color: "black" }),
          font: "bold 16px sans-serif",
          stroke: new ol.style.Stroke({
            color: "rgb(239, 239, 239)", // off-white
            width: 4
          }),
          text: feature.graphic.annotations
            ? feature.graphic.annotations[0].properties.text
            : ""
        })
      });
      olFeature.setStyle(style);
    }

    features.push(olFeature);
  }

  return features;
}

module.exports = asOpenLayers;
