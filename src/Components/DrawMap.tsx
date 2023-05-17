
import React from 'react';
import { Circle, Polygon, Rectangle } from "@react-google-maps/api";

export default function DrawMap(props: any) {

    const drawData: any = props?.data?.polygon;
    const type: any = drawData?.type

    return (
        <>
            {type == 'rectangle'  && <Rectangle bounds={drawData?.latLng?.[0]} />}
            {type == 'circle' && <Circle center={drawData?.center} radius={drawData?.radius} />}
            {type == 'polygon' && <Polygon paths={drawData?.latLng} />}
        </>
    )
}