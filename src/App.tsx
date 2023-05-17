import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css'; 
import { Card } from '@material-ui/core';
import GoogleMap from './Components/GoogleMap';
import DrawMap from './Components/DrawMap';

function App() {
  const [mapValues, setMapValues] = useState<any>(null); 
  const [searchLocation, setSearchLocation] = useState<any>(null);

  useEffect(() => {
    if (!!mapValues?.latLng && Object.keys(mapValues?.latLng)?.length > 0) {
      // setValue("polygon", mapValues?.latLng); // state where you want save latlng and polygon data
    } else {
      // setValue("polygon", {});
    }
    if (!!mapValues?.autocomplete) {
      setSearchLocation(mapValues?.autocomplete);
    }
  }, [mapValues]);
  return (
    <div className="App">
      <Card style={{margin:'20px'}}>
      <GoogleMap
                            value={setMapValues}
                            setValue={{
                              // latLng: editData?.polygon // for setting value in edit mode
                            }}
                            autocomplete
                            polygon={false} // for controling dynamically if  user can create polygon or not
                            reset={""} // pass state here for reseting map state
                            zoom={6}
                            center={{
                              lat: 25.276987,
                              lng: 55.296249
                            }}
                          >
                          {/* { editDate && 
                            <DrawMap data={""} />  // pass which type of shape you create  for edit mode
                          }   */}
                          </GoogleMap>
        
      </Card>
    </div>
  );
}

export default App;
