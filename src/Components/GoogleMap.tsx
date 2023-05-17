import React, { useCallback, useState } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  GoogleMap,
  useLoadScript,
  DrawingManager,
  Autocomplete,
  Marker,
  Polygon,
  Rectangle,
} from "@react-google-maps/api";
import { useEffect } from "react";
import Button from "@material-ui/core/Button";
import { HeatmapLayer } from '@react-google-maps/api';

declare var google: any;
const containerStyle = {
  height: "400px",
  width: "100%",
};

const _type: any = "polygon";

function ScriptLoaded(props: any) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyDGRM5g2oOCQ5Zs6GFzJ2xTXgF5ME_WB3s", // ,
    libraries: ["drawing", "places", "visualization"],
    // ...otherOptions
  });

  const [map, setMap] = useState<any>(null)
  const [mapData, setMapData] = useState<any>(props.setValue);
  const [searchLocation, setSearchLocation] = useState<any>(null);
  const [selectedShape, setSelectedShape] = useState<any>([]);
  const [removeStaticPolygon, setRemoveStaticPolygon] = useState<any>(true);
  const [mapCenter, setMapCenter] = useState<any>(props.center);

  useEffect(() => {
    if (props.value)
      props.value(mapData);
  }, [mapData]);


  const onClear = () => {
    selectedShape.map((item: any) => {
      item.overlay.setMap(null);
    });
    setSelectedShape([]);
    if (props.value) {
      props.value(
        setMapData({
          ...mapData,
          ...{
            latLng: null,
          },
        })
      );
    }

  };

  useEffect(() => {
    if (props.reset === true) {
      onClear();
    }
  }, [props.reset]);

  const renderMap = () => {
    // wrapping to a function is useful in case you want to access `window.google`
    // to eg. setup options or create latLng object, it won't be available otherwise
    // feel free to render directly if you don't need that

    const onLoadMapInstance = (mapInstance: any) => {
      setMap(mapInstance)
    };

    const onOverlayComplete = (event: any) => {
      let temp = Object.assign([], selectedShape);
      temp.unshift(event);
      setSelectedShape([]);
      selectedShape.length > 0 &&
        selectedShape.map((item: any) => {
          item.overlay.setMap(null);
        });
      setRemoveStaticPolygon(false)
      setSelectedShape(temp);
      let data: any = event.overlay;
      let latLng: any = null;
      if (event.type == "circle") {
        latLng = getCircleLatLng(data);
      } else if (event.type == "polygon") {
        latLng = getPolygonLatLng(data);
      } else if (event.type == "rectangle") {
        latLng = getRectangleLatLng(data);
      } else if (event.type == "polyline") {
        latLng = getPolylineLatLng(data);
      }
      setMapData({
        ...mapData,
        latLng: {
          ...latLng,
          ...{ zoom: map?.getZoom() ? map?.getZoom() : mapData?.latLng?.zoom },
        },
      })

    };

    const getCircleLatLng = (data: any) => {
      let temp: any = [];
      let lat: any = data.center.lat();
      let lng: any = data.center.lng();
      let radius: any = data.radius;
      temp.push(data.center.toJSON());
      return { latLng: temp, type: "circle", radius: radius, center: data.center.toJSON() };
    };

    const getPolygonLatLng = (data: any) => {
      let temp: any = [];
      const vertices = data?.getPath();
      for (let i = 0; i < vertices.getLength(); i++) {
        const xy = vertices.getAt(i);
        let lat: any = xy.lat();
        let lng: any = xy.lng();
        temp.push({ lat: lat, lng: lng });
      }
      return { latLng: temp, type: "polygon", center: temp[0] };
    };

    const getPolylineLatLng = (data: any) => {
      let temp: any = [];
      const vertices = data?.getPath();
      for (let i = 0; i < vertices.getLength(); i++) {
        const xy = vertices.getAt(i);
        let lat: any = xy.lat();
        let lng: any = xy.lng();
        temp.push([lat, lng]);
      }
      return { latLng: temp, type: "polyline", center: temp[0] };
    };

    const getRectangleLatLng = (data: any) => {
      let temp: any = [];
      const bounds = data?.getBounds();
      var center = bounds.getCenter();
      var northEast = bounds.getNorthEast();
      var southWest = bounds.getSouthWest();
      temp.push({
        north: northEast.lat(),
        south: southWest.lat(),
        east: northEast.lng(),
        west: southWest.lng()
      });
      return { latLng: temp, type: "rectangle", center: center.toJSON() };
    };

    const onLoadAutComplete = (autocomplete: any) => {
      setSearchLocation(autocomplete);
      let autocompleteValue = autocomplete?.getPlace()
      if (autocompleteValue !== undefined) {
        setMapData({
          ...mapData,
          ...{
            autocomplete: autocomplete,
          },
        });
      };
    }

    const onPlaceChanged = () => {
      map.fitBounds(searchLocation?.getPlace().geometry.viewport);
      setMapCenter(searchLocation?.getPlace()?.geometry?.location);
      setMapData({
        ...mapData,
        ...{
          autocomplete: searchLocation,
        },
      });
    };



    return (
      <>
        <GoogleMap
          onLoad={onLoadMapInstance}
          mapContainerStyle={containerStyle}
          zoom={props.zoom}
          center={mapCenter}
          onZoomChanged={() => {
            let latLng = mapData?.latLng
            if (latLng) {
              setMapData({
                ...mapData,
                latLng: {
                  ...latLng,
                  ...{ zoom: map?.getZoom() ? map?.getZoom() : mapData?.latLng?.zoom },
                },
              })
            }
          }}
          options={{
            streetViewControl: false,
            fullscreenControl: false,
          }}
        >
          {/* <Marker position={mapCenter} /> */}
          {props.polygon && true && (
            <DrawingManager
              drawingMode={_type}
              onOverlayComplete={onOverlayComplete}
              options={{
                drawingControlOptions: {
                  drawingModes: [
                    window.google.maps.drawing.OverlayType.POLYGON,
                    // window.google.maps.drawing.OverlayType.CIRCLE,
                    // window.google.maps.drawing.OverlayType.RECTANGLE,
                  ],
                },
              }}
            //onRectangleComplete={e => onPolygonComplete(e, 'rectangle')}
            />
          )}

          {
            props?.heatmapLayer && <HeatmapLayer
              data={props?.heatmapLayer?.map((item:any)=>{
                return { location: new google.maps.LatLng(Number(item?.latitude),Number(item?.longitude))}
              })}
            />
          }


          {removeStaticPolygon && props.children}

          {selectedShape?.length > 0 && (
            <Button
              onClick={onClear}
              variant="contained"
              size="small"
              color="primary"
              style={{
                position: "absolute",
                left: "190px",
                padding: "3px 31px",
                top: "35px",
              }}
            >
              Clear
            </Button>
          )}
          {props.autocomplete && (
            <Autocomplete
              onPlaceChanged={onPlaceChanged}
              onLoad={onLoadAutComplete}
            >
              <input
                type="text"
                placeholder="Search Place"
                style={{
                  boxSizing: `border-box`,
                  border: `1px solid transparent`,
                  width: `40%`,
                  height: `39px`,
                  padding: `0 12px`,
                  borderRadius: `3px`,
                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                  fontSize: `14px`,
                  outline: `none`,
                  textOverflow: `ellipses`,
                  position: "absolute",
                  right: "0",
                  marginRight: "10px",
                  marginTop: "10px",
                }}
              />
            </Autocomplete>
          )}

        </GoogleMap>
      </>
    );
  };

  if (loadError) {
    return <span>Map cannot be loaded right now, sorry.</span>;
  }

  return isLoaded ? renderMap() : <CircularProgress />;
}

export default ScriptLoaded;
