export default function CirculoProgreso({ porcentaje }) {
  return (
    <div className="flex justify-center">
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{
          background: `conic-gradient(blue ${porcentaje}%, #e5e7eb ${porcentaje}%)`
        }}
      >
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center font-bold text-lg">
          {porcentaje}%
        </div>
      </div>
    </div>
  );
}