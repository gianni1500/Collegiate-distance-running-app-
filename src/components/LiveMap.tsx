import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Mapbox is not available in Expo Go — load conditionally
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let MapboxGL: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  MapboxGL = require('@rnmapbox/maps').default;
} catch {
  // Expo Go environment
}

interface LatLng {
  latitude: number;
  longitude: number;
}

interface LiveMapProps {
  coords: LatLng[];
  currentCoord?: LatLng;
}

export function LiveMap({ coords, currentCoord }: LiveMapProps) {
  const center = currentCoord ?? coords[Math.floor(coords.length / 2)];

  if (!MapboxGL || !center) return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Map unavailable in Expo Go{`\n`}GPS is active</Text>
    </View>
  );

  const routeGeoJSON = {
    type: 'Feature' as const,
    geometry: {
      type: 'LineString' as const,
      coordinates: coords.map((c) => [c.longitude, c.latitude]),
    },
    properties: {},
  };

  return (
    <MapboxGL.MapView
      style={styles.map}
      styleURL={MapboxGL.StyleURL.Outdoors}
      logoEnabled={false}
      attributionEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
    >
      <MapboxGL.Camera
        centerCoordinate={[center.longitude, center.latitude]}
        zoomLevel={14}
        animationMode="none"
      />
      <MapboxGL.UserLocation visible />
      {coords.length > 1 && (
        <MapboxGL.ShapeSource id="liveRoute" shape={routeGeoJSON}>
          <MapboxGL.LineLayer
            id="liveRouteLine"
            style={{ lineColor: '#e94560', lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
          />
        </MapboxGL.ShapeSource>
      )}
    </MapboxGL.MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: '#16213e', alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: '#aaa', textAlign: 'center', fontSize: 14, lineHeight: 22 },
});
