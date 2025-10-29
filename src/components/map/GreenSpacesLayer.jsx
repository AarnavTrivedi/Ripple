import { Circle, Popup } from 'react-leaflet';
import { Trees, Leaf } from 'lucide-react';

const SIZE_RADIUS = {
  small: 100,
  medium: 200,
  large: 300
};

const TYPE_COLORS = {
  park: '#22c55e',
  forest: '#166534',
  garden: '#84cc16',
  nature_reserve: '#15803d',
  green_space: '#10b981'
};

export default function GreenSpacesLayer({ data }) {
  if (!data || data.length === 0) {
    console.log('🌳 No green spaces to render');
    return null;
  }

  console.log('🌳 Rendering', data.length, 'green spaces');

  return (
    <>
      {data.map((space) => (
        <Circle
          key={space.id}
          center={[space.lat, space.lng]}
          radius={SIZE_RADIUS[space.size] || 150}
          pathOptions={{
            color: TYPE_COLORS[space.type] || TYPE_COLORS.green_space,
            fillColor: TYPE_COLORS[space.type] || TYPE_COLORS.green_space,
            fillOpacity: 0.3,
            weight: 2,
            opacity: 0.7
          }}
        >
          <Popup>
            <div className="p-2 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                {space.type === 'forest' ? (
                  <Trees className="w-5 h-5 text-green-700" />
                ) : (
                  <Leaf className="w-5 h-5 text-green-500" />
                )}
                <h3 className="font-semibold text-sm">{space.name}</h3>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="capitalize">Type: {space.type.replace('_', ' ')}</p>
                <p className="capitalize">Size: {space.size}</p>
              </div>
              <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
                🌱 Green space improves air quality and provides habitat for wildlife
              </div>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
}

